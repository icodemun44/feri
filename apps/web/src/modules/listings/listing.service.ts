import "server-only";
import { randomUUID } from "node:crypto";
import { withTransaction, ProductReviewStatus, ProductStatus, SellerStatus } from "@feri/database";
import {
  AppError,
  canTransitionProduct,
  ERROR_CODES,
  MAX_PRODUCT_IMAGE_BYTES,
  MAX_PRODUCT_IMAGES,
  PERMISSIONS,
  resolvePaginationWindow,
  rupeesToPaisa,
  type PaginatedResult,
} from "@feri/shared";
import type { ListingFieldsInput, RemoveListingInput } from "@feri/validation";
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
  auditRepository,
} from "@/modules/audit/audit.repository";
import { sellerRepository } from "@/modules/sellers/seller.repository";
import type { AppUser } from "@/modules/users/user.types";
import { assertPermission } from "@/server/auth/assert-permission";
import { productImageStorage } from "@/server/supabase/storage";
import { detectImageType } from "./image-type";
import type { ListingReviewFilter } from "./listing.constants";
import { listingRepository } from "./listing.repository";
import type { ListingRecord, ListingReviewCounts, ListingSummary } from "./listing.types";

const STALE_LISTING_MESSAGE =
  "This listing was just changed somewhere else. Refresh the page and try again.";
const UNSUPPORTED_IMAGE_MESSAGE = "Upload a JPG, PNG or WebP photo.";

const resolveActiveSeller = async (user: AppUser): Promise<{ id: string }> => {
  assertPermission(user, PERMISSIONS.PRODUCT_MANAGE_OWN);
  const seller = await sellerRepository.findByUserId(user.id);
  if (!seller || seller.status !== SellerStatus.ACTIVE) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "Your shop is not active.");
  }
  return { id: seller.id };
};

const loadOwnedListing = async (sellerId: string, productId: string): Promise<ListingRecord> => {
  const listing = await listingRepository.findById(productId);
  if (!listing || listing.sellerId !== sellerId) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Listing not found.");
  }
  return listing;
};

const ensureEditable = (listing: ListingRecord): void => {
  if (listing.status === ProductStatus.REMOVED) {
    throw new AppError(ERROR_CODES.INVALID_STATE, "This listing has been removed.");
  }
};

const ensureStatusChangeAllowed = (from: ProductStatus, to: ProductStatus): void => {
  if (!canTransitionProduct(from, to)) {
    throw new AppError(ERROR_CODES.INVALID_STATE, "This listing cannot move to that step.");
  }
};

const needsRecheckAfterChange = (listing: ListingRecord): boolean =>
  listing.reviewStatus === ProductReviewStatus.APPROVED;

const requireReviewReset = (listing: ListingRecord) =>
  needsRecheckAfterChange(listing)
    ? { reviewStatus: ProductReviewStatus.PENDING, reviewedAt: null, reviewedById: null }
    : {};

const listMine = async (user: AppUser): Promise<ListingSummary[]> => {
  const seller = await resolveActiveSeller(user);
  return listingRepository.listBySeller(seller.id);
};

const getMine = async (user: AppUser, productId: string): Promise<ListingRecord> => {
  const seller = await resolveActiveSeller(user);
  return loadOwnedListing(seller.id, productId);
};

const create = async (user: AppUser, fields: ListingFieldsInput): Promise<ListingRecord> => {
  const seller = await resolveActiveSeller(user);
  return withTransaction(async (db) => {
    const listing = await listingRepository.create(
      {
        sellerId: seller.id,
        categoryId: fields.categoryId,
        title: fields.title,
        description: fields.description,
        priceMinor: rupeesToPaisa(fields.priceRupees),
        condition: fields.condition,
        brand: fields.brand,
        size: fields.size,
      },
      db,
    );
    await auditRepository.record(
      {
        actorId: user.id,
        action: AUDIT_ACTIONS.PRODUCT_CREATED,
        entityType: AUDIT_ENTITY_TYPES.PRODUCT,
        entityId: listing.id,
      },
      db,
    );
    return listing;
  });
};

type UpdateInput = ListingFieldsInput & { productId: string };

const update = async (user: AppUser, { productId, ...fields }: UpdateInput): Promise<void> => {
  const seller = await resolveActiveSeller(user);
  const listing = await loadOwnedListing(seller.id, productId);
  ensureEditable(listing);

  const reviewedContentChanged =
    listing.title !== fields.title ||
    listing.description !== fields.description ||
    listing.categoryId !== fields.categoryId;

  const updated = await listingRepository.updateOwned({
    id: productId,
    sellerId: seller.id,
    data: {
      title: fields.title,
      description: fields.description,
      categoryId: fields.categoryId,
      priceMinor: rupeesToPaisa(fields.priceRupees),
      condition: fields.condition,
      brand: fields.brand ?? null,
      size: fields.size ?? null,
      ...(reviewedContentChanged ? requireReviewReset(listing) : {}),
    },
  });
  if (!updated) {
    throw new AppError(ERROR_CODES.CONFLICT, STALE_LISTING_MESSAGE);
  }
};

const publish = async (user: AppUser, productId: string): Promise<void> => {
  const seller = await resolveActiveSeller(user);
  const listing = await loadOwnedListing(seller.id, productId);
  ensureStatusChangeAllowed(listing.status, ProductStatus.ACTIVE);
  if (listing.images.length === 0) {
    throw new AppError(ERROR_CODES.INVALID_STATE, "Add at least one photo before publishing.");
  }

  await withTransaction(async (db) => {
    const published = await listingRepository.transition(
      {
        id: productId,
        sellerId: seller.id,
        from: [ProductStatus.DRAFT],
        data: { status: ProductStatus.ACTIVE, publishedAt: listing.publishedAt ?? new Date() },
      },
      db,
    );
    if (!published) {
      throw new AppError(ERROR_CODES.CONFLICT, STALE_LISTING_MESSAGE);
    }
    await auditRepository.record(
      {
        actorId: user.id,
        action: AUDIT_ACTIONS.PRODUCT_PUBLISHED,
        entityType: AUDIT_ENTITY_TYPES.PRODUCT,
        entityId: productId,
      },
      db,
    );
  });
};

const changeOwnStatus = async (
  user: AppUser,
  productId: string,
  to: ProductStatus,
  extraData: Record<string, Date | null> = {},
): Promise<void> => {
  const seller = await resolveActiveSeller(user);
  const listing = await loadOwnedListing(seller.id, productId);
  ensureStatusChangeAllowed(listing.status, to);
  const changed = await listingRepository.transition({
    id: productId,
    sellerId: seller.id,
    from: [listing.status],
    data: { status: to, ...extraData },
  });
  if (!changed) {
    throw new AppError(ERROR_CODES.CONFLICT, STALE_LISTING_MESSAGE);
  }
};

const unpublish = (user: AppUser, productId: string): Promise<void> =>
  changeOwnStatus(user, productId, ProductStatus.DRAFT);

const markSold = (user: AppUser, productId: string): Promise<void> =>
  changeOwnStatus(user, productId, ProductStatus.SOLD, { soldAt: new Date() });

const deleteOwn = (user: AppUser, productId: string): Promise<void> =>
  changeOwnStatus(user, productId, ProductStatus.REMOVED);

type ImageUpload = { bytes: Uint8Array; originalName: string };

const addImage = async (user: AppUser, productId: string, upload: ImageUpload): Promise<void> => {
  const seller = await resolveActiveSeller(user);
  const listing = await loadOwnedListing(seller.id, productId);
  ensureEditable(listing);

  if (listing.images.length >= MAX_PRODUCT_IMAGES) {
    throw new AppError(
      ERROR_CODES.INVALID_STATE,
      `You can add up to ${MAX_PRODUCT_IMAGES} photos per listing.`,
    );
  }
  if (upload.bytes.byteLength === 0 || upload.bytes.byteLength > MAX_PRODUCT_IMAGE_BYTES) {
    throw new AppError(ERROR_CODES.VALIDATION, "Each photo must be under 5 MB.");
  }
  const imageType = detectImageType(upload.bytes);
  if (!imageType) {
    throw new AppError(ERROR_CODES.VALIDATION, UNSUPPORTED_IMAGE_MESSAGE);
  }

  const storagePath = `${seller.id}/${productId}/${randomUUID()}.${imageType.extension}`;
  await productImageStorage.upload(storagePath, upload.bytes, imageType.contentType);

  try {
    await withTransaction(async (db) => {
      await listingRepository.addImage({ productId, storagePath, altText: listing.title }, db);
      await listingRepository.updateOwned(
        { id: productId, sellerId: seller.id, data: requireReviewReset(listing) },
        db,
      );
    });
  } catch (error) {
    await productImageStorage.remove([storagePath]);
    throw error;
  }
};

const removeImage = async (user: AppUser, productId: string, imageId: string): Promise<void> => {
  const seller = await resolveActiveSeller(user);
  const listing = await loadOwnedListing(seller.id, productId);
  ensureEditable(listing);

  const image = await listingRepository.findImage(imageId, productId);
  if (!image) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Photo not found.");
  }
  const isLastPhotoOfLiveListing =
    listing.status === ProductStatus.ACTIVE && listing.images.length <= 1;
  if (isLastPhotoOfLiveListing) {
    throw new AppError(
      ERROR_CODES.INVALID_STATE,
      "A live listing needs at least one photo. Unpublish it first or add another photo.",
    );
  }

  await withTransaction(async (db) => {
    await listingRepository.deleteImage(imageId, db);
    await listingRepository.updateOwned(
      { id: productId, sellerId: seller.id, data: requireReviewReset(listing) },
      db,
    );
  });
  await productImageStorage.remove([image.storagePath]);
};

const listForAdmin = (
  admin: AppUser,
  input: { filter: ListingReviewFilter; page: number | undefined },
): Promise<PaginatedResult<ListingSummary>> => {
  assertPermission(admin, PERMISSIONS.PRODUCT_MODERATE);
  return listingRepository.listForAdmin({
    filter: input.filter,
    window: resolvePaginationWindow({ page: input.page }),
  });
};

const countForAdmin = (admin: AppUser): Promise<ListingReviewCounts> => {
  assertPermission(admin, PERMISSIONS.PRODUCT_MODERATE);
  return listingRepository.countForAdmin();
};

const getForAdmin = async (admin: AppUser, productId: string): Promise<ListingRecord> => {
  assertPermission(admin, PERMISSIONS.PRODUCT_MODERATE);
  const listing = await listingRepository.findById(productId);
  if (!listing) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Listing not found.");
  }
  return listing;
};

const approve = async (admin: AppUser, productId: string): Promise<void> => {
  assertPermission(admin, PERMISSIONS.PRODUCT_MODERATE);
  await withTransaction(async (db) => {
    const listing = await listingRepository.findById(productId, db);
    if (!listing) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Listing not found.");
    }
    const isPublished =
      listing.status === ProductStatus.ACTIVE || listing.status === ProductStatus.SOLD;
    if (!isPublished) {
      throw new AppError(ERROR_CODES.INVALID_STATE, "Only published listings can be checked.");
    }
    await db.product.update({
      where: { id: productId },
      data: {
        reviewStatus: ProductReviewStatus.APPROVED,
        reviewedAt: new Date(),
        reviewedById: admin.id,
      },
    });
    await auditRepository.record(
      {
        actorId: admin.id,
        action: AUDIT_ACTIONS.PRODUCT_APPROVED,
        entityType: AUDIT_ENTITY_TYPES.PRODUCT,
        entityId: productId,
      },
      db,
    );
  });
};

const removeAsAdmin = async (
  admin: AppUser,
  { productId, reason }: RemoveListingInput,
): Promise<void> => {
  assertPermission(admin, PERMISSIONS.PRODUCT_MODERATE);
  await withTransaction(async (db) => {
    const listing = await listingRepository.findById(productId, db);
    if (!listing) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Listing not found.");
    }
    ensureStatusChangeAllowed(listing.status, ProductStatus.REMOVED);
    const removed = await listingRepository.transition(
      {
        id: productId,
        from: [listing.status],
        data: { status: ProductStatus.REMOVED, removalReason: reason },
      },
      db,
    );
    if (!removed) {
      throw new AppError(ERROR_CODES.CONFLICT, STALE_LISTING_MESSAGE);
    }
    await auditRepository.record(
      {
        actorId: admin.id,
        action: AUDIT_ACTIONS.PRODUCT_REMOVED,
        entityType: AUDIT_ENTITY_TYPES.PRODUCT,
        entityId: productId,
        metadata: { reason },
      },
      db,
    );
  });
};

export const listingService = {
  listMine,
  getMine,
  create,
  update,
  publish,
  unpublish,
  markSold,
  deleteOwn,
  addImage,
  removeImage,
  listForAdmin,
  countForAdmin,
  getForAdmin,
  approve,
  removeAsAdmin,
};

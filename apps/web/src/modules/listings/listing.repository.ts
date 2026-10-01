import "server-only";
import {
  prisma,
  type Prisma,
  ProductReviewStatus,
  ProductStatus,
  type DbClient,
  type ProductCondition,
} from "@feri/database";
import { buildPaginatedResult, type PaginatedResult, type PaginationWindow } from "@feri/shared";
import { buildPublicProductImageUrl } from "@/server/supabase/storage";
import { LISTING_REVIEW_FILTERS, type ListingReviewFilter } from "./listing.constants";
import type { ListingRecord, ListingReviewCounts, ListingSummary } from "./listing.types";

const listingInclusion = {
  category: { select: { name: true } },
  seller: { select: { businessName: true } },
  images: {
    orderBy: { position: "asc" },
    select: { id: true, storagePath: true, altText: true, position: true },
  },
} satisfies Prisma.ProductInclude;

type ListingRow = Prisma.ProductGetPayload<{ include: typeof listingInclusion }>;

const toRecord = (row: ListingRow): ListingRecord => ({
  id: row.id,
  sellerId: row.sellerId,
  sellerName: row.seller.businessName,
  title: row.title,
  description: row.description,
  priceMinor: row.priceMinor,
  condition: row.condition,
  status: row.status,
  reviewStatus: row.reviewStatus,
  brand: row.brand,
  size: row.size,
  categoryId: row.categoryId,
  categoryName: row.category.name,
  removalReason: row.removalReason,
  publishedAt: row.publishedAt,
  createdAt: row.createdAt,
  images: row.images.map((image) => ({
    id: image.id,
    url: buildPublicProductImageUrl(image.storagePath),
    altText: image.altText,
    position: image.position,
  })),
});

const toSummary = (row: ListingRow): ListingSummary => {
  const [coverImage] = row.images;
  return {
    id: row.id,
    title: row.title,
    priceMinor: row.priceMinor,
    status: row.status,
    reviewStatus: row.reviewStatus,
    categoryName: row.category.name,
    sellerName: row.seller.businessName,
    coverImageUrl: coverImage ? buildPublicProductImageUrl(coverImage.storagePath) : null,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
  };
};

type CreateListingInput = {
  sellerId: string;
  categoryId: string;
  title: string;
  description: string;
  priceMinor: number;
  condition: ProductCondition;
  brand: string | undefined;
  size: string | undefined;
};

const create = async (input: CreateListingInput, db: DbClient = prisma): Promise<ListingRecord> => {
  const { brand, size, ...fields } = input;
  const row = await db.product.create({
    data: { ...fields, brand: brand ?? null, size: size ?? null, quantity: 1 },
    include: listingInclusion,
  });
  return toRecord(row);
};

const findById = async (id: string, db: DbClient = prisma): Promise<ListingRecord | null> => {
  const row = await db.product.findUnique({ where: { id }, include: listingInclusion });
  return row ? toRecord(row) : null;
};

const listBySeller = async (sellerId: string, db: DbClient = prisma): Promise<ListingSummary[]> => {
  const rows = await db.product.findMany({
    where: {
      sellerId,
      OR: [{ status: { not: ProductStatus.REMOVED } }, { removalReason: { not: null } }],
    },
    orderBy: { createdAt: "desc" },
    include: { ...listingInclusion, images: { ...listingInclusion.images, take: 1 } },
  });
  return rows.map(toSummary);
};

type ReviewFilterQuery = {
  where: Prisma.ProductWhereInput;
  orderBy: Prisma.ProductOrderByWithRelationInput;
};

const PUBLISHED_STATUSES = [ProductStatus.ACTIVE, ProductStatus.SOLD];

const buildReviewFilterQuery = (filter: ListingReviewFilter): ReviewFilterQuery => {
  switch (filter) {
    case LISTING_REVIEW_FILTERS.APPROVED:
      return {
        where: { status: { in: PUBLISHED_STATUSES }, reviewStatus: ProductReviewStatus.APPROVED },
        orderBy: { reviewedAt: "desc" },
      };
    case LISTING_REVIEW_FILTERS.REMOVED:
      return {
        where: { status: ProductStatus.REMOVED, removalReason: { not: null } },
        orderBy: { updatedAt: "desc" },
      };
    case LISTING_REVIEW_FILTERS.NEEDS_REVIEW:
      return {
        where: { status: { in: PUBLISHED_STATUSES }, reviewStatus: ProductReviewStatus.PENDING },
        orderBy: { publishedAt: "asc" },
      };
  }
};

type ListForAdminInput = { filter: ListingReviewFilter; window: PaginationWindow };

const listForAdmin = async (
  { filter, window }: ListForAdminInput,
  db: DbClient = prisma,
): Promise<PaginatedResult<ListingSummary>> => {
  const { where, orderBy } = buildReviewFilterQuery(filter);
  const [rows, totalItems] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip: window.skip,
      take: window.take,
      include: { ...listingInclusion, images: { ...listingInclusion.images, take: 1 } },
    }),
    db.product.count({ where }),
  ]);
  return buildPaginatedResult(rows.map(toSummary), totalItems, window);
};

const countForAdmin = async (db: DbClient = prisma): Promise<ListingReviewCounts> => {
  const [needsReview, approved, removed] = await Promise.all([
    db.product.count({ where: buildReviewFilterQuery(LISTING_REVIEW_FILTERS.NEEDS_REVIEW).where }),
    db.product.count({ where: buildReviewFilterQuery(LISTING_REVIEW_FILTERS.APPROVED).where }),
    db.product.count({ where: buildReviewFilterQuery(LISTING_REVIEW_FILTERS.REMOVED).where }),
  ]);
  return { needsReview, approved, removed };
};

type UpdateOwnedInput = {
  id: string;
  sellerId: string;
  data: Prisma.ProductUncheckedUpdateManyInput;
};

const updateOwned = async (
  { id, sellerId, data }: UpdateOwnedInput,
  db: DbClient = prisma,
): Promise<boolean> => {
  const { count } = await db.product.updateMany({ where: { id, sellerId }, data });
  return count === 1;
};

type TransitionInput = {
  id: string;
  from: readonly ProductStatus[];
  data: Prisma.ProductUncheckedUpdateManyInput;
  sellerId?: string;
};

const transition = async (
  { id, from, data, sellerId }: TransitionInput,
  db: DbClient = prisma,
): Promise<boolean> => {
  const { count } = await db.product.updateMany({
    where: { id, status: { in: [...from] }, ...(sellerId ? { sellerId } : {}) },
    data,
  });
  return count === 1;
};

const countImages = (productId: string, db: DbClient = prisma): Promise<number> =>
  db.productImage.count({ where: { productId } });

const addImage = async (
  input: { productId: string; storagePath: string; altText: string },
  db: DbClient = prisma,
): Promise<void> => {
  const { _max } = await db.productImage.aggregate({
    where: { productId: input.productId },
    _max: { position: true },
  });
  await db.productImage.create({
    data: { ...input, position: (_max.position ?? -1) + 1 },
  });
};

const findImage = (
  imageId: string,
  productId: string,
  db: DbClient = prisma,
): Promise<{ id: string; storagePath: string } | null> =>
  db.productImage.findFirst({
    where: { id: imageId, productId },
    select: { id: true, storagePath: true },
  });

const deleteImage = async (imageId: string, db: DbClient = prisma): Promise<void> => {
  await db.productImage.delete({ where: { id: imageId } });
};

export const listingRepository = {
  create,
  findById,
  listBySeller,
  listForAdmin,
  countForAdmin,
  updateOwned,
  transition,
  countImages,
  addImage,
  findImage,
  deleteImage,
};

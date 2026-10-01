import "server-only";
import { isUniqueConstraintError, OrderStatus, withTransaction } from "@feri/database";
import {
  AppError,
  ERROR_CODES,
  PERMISSIONS,
  resolvePaginationWindow,
  type PaginatedResult,
} from "@feri/shared";
import type { CreateReviewInput, RemoveReviewInput } from "@feri/validation";
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
  auditRepository,
} from "@/modules/audit/audit.repository";
import type { AppUser } from "@/modules/users/user.types";
import { assertPermission } from "@/server/auth/assert-permission";
import { reviewRepository } from "./review.repository";
import type {
  AdminReviewFilter,
  AdminReviewView,
  ReviewView,
  SellerRatingSummary,
} from "./review.types";

const ALREADY_REVIEWED_MESSAGE = "You have already reviewed this item.";
const RECENT_REVIEW_COUNT = 5;

const create = async (
  user: AppUser,
  { orderItemId, rating, comment }: CreateReviewInput,
): Promise<void> => {
  assertPermission(user, PERMISSIONS.REVIEW_CREATE);

  const item = await reviewRepository.findOrderItemForReview(orderItemId);
  if (!item || item.buyerId !== user.id) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Item not found.");
  }
  if (item.orderStatus !== OrderStatus.DELIVERED) {
    throw new AppError(
      ERROR_CODES.INVALID_STATE,
      "You can review an item once it has been delivered.",
    );
  }
  if (item.hasReview) {
    throw new AppError(ERROR_CODES.CONFLICT, ALREADY_REVIEWED_MESSAGE);
  }

  try {
    await withTransaction(async (db) => {
      const reviewId = await reviewRepository.create(
        {
          orderItemId,
          reviewerId: user.id,
          sellerId: item.sellerId,
          productId: item.productId,
          rating,
          comment,
        },
        db,
      );
      await auditRepository.record(
        {
          actorId: user.id,
          action: AUDIT_ACTIONS.REVIEW_CREATED,
          entityType: AUDIT_ENTITY_TYPES.REVIEW,
          entityId: reviewId,
        },
        db,
      );
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError(ERROR_CODES.CONFLICT, ALREADY_REVIEWED_MESSAGE);
    }
    throw error;
  }
};

const listMineForOrder = (user: AppUser, orderId: string): Promise<Record<string, ReviewView>> => {
  assertPermission(user, PERMISSIONS.ORDER_READ_OWN);
  return reviewRepository.listByBuyerForOrder(orderId, user.id);
};

const summarizeSeller = (sellerId: string): Promise<SellerRatingSummary> =>
  reviewRepository.summarizeForSeller(sellerId);

const listRecentForSeller = (
  sellerId: string,
  count = RECENT_REVIEW_COUNT,
): Promise<ReviewView[]> => reviewRepository.listVisibleForSeller(sellerId, count);

const listForAdmin = (
  admin: AppUser,
  input: { filter: AdminReviewFilter; page: number | undefined },
): Promise<PaginatedResult<AdminReviewView>> => {
  assertPermission(admin, PERMISSIONS.REVIEW_MODERATE);
  return reviewRepository.listForAdmin({
    filter: input.filter,
    window: resolvePaginationWindow({ page: input.page }),
  });
};

const removeAsAdmin = async (
  admin: AppUser,
  { reviewId, reason }: RemoveReviewInput,
): Promise<void> => {
  assertPermission(admin, PERMISSIONS.REVIEW_MODERATE);
  await withTransaction(async (db) => {
    const removed = await reviewRepository.remove(reviewId, reason, db);
    if (!removed) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Review not found or already removed.");
    }
    await auditRepository.record(
      {
        actorId: admin.id,
        action: AUDIT_ACTIONS.REVIEW_REMOVED,
        entityType: AUDIT_ENTITY_TYPES.REVIEW,
        entityId: reviewId,
        metadata: { reason },
      },
      db,
    );
  });
};

export const reviewService = {
  create,
  listMineForOrder,
  summarizeSeller,
  listRecentForSeller,
  listForAdmin,
  removeAsAdmin,
};

import "server-only";
import { prisma, type Prisma, type DbClient } from "@feri/database";
import {
  buildPaginatedResult,
  toPublicReviewerName,
  type PaginatedResult,
  type PaginationWindow,
} from "@feri/shared";
import type {
  AdminReviewFilter,
  AdminReviewView,
  ReviewableOrderItem,
  ReviewView,
  SellerRatingSummary,
} from "./review.types";

const reviewInclusion = {
  reviewer: { select: { email: true, profile: { select: { fullName: true } } } },
  product: { select: { title: true } },
  seller: { select: { businessName: true } },
} satisfies Prisma.ReviewInclude;

type ReviewRow = Prisma.ReviewGetPayload<{ include: typeof reviewInclusion }>;

const toView = (row: ReviewRow): ReviewView => ({
  id: row.id,
  rating: row.rating,
  comment: row.comment,
  createdAt: row.createdAt,
  reviewerName: toPublicReviewerName(row.reviewer.profile?.fullName ?? row.reviewer.email),
  productTitle: row.product.title,
  isRemoved: row.removedAt !== null,
});

const toAdminView = (row: ReviewRow): AdminReviewView => ({
  ...toView(row),
  sellerName: row.seller.businessName,
  removalReason: row.removalReason,
});

const findOrderItemForReview = async (
  orderItemId: string,
  db: DbClient = prisma,
): Promise<ReviewableOrderItem | null> => {
  const item = await db.orderItem.findUnique({
    where: { id: orderItemId },
    select: {
      id: true,
      productId: true,
      order: { select: { buyerId: true, sellerId: true, status: true } },
      review: { select: { id: true } },
    },
  });
  return item
    ? {
        id: item.id,
        productId: item.productId,
        buyerId: item.order.buyerId,
        sellerId: item.order.sellerId,
        orderStatus: item.order.status,
        hasReview: item.review !== null,
      }
    : null;
};

type CreateReviewInput = {
  orderItemId: string;
  reviewerId: string;
  sellerId: string;
  productId: string;
  rating: number;
  comment: string | undefined;
};

const create = async (input: CreateReviewInput, db: DbClient = prisma): Promise<string> => {
  const { comment, ...fields } = input;
  const review = await db.review.create({
    data: { ...fields, comment: comment ?? null },
    select: { id: true },
  });
  return review.id;
};

const listVisibleForSeller = async (
  sellerId: string,
  take: number,
  db: DbClient = prisma,
): Promise<ReviewView[]> => {
  const rows = await db.review.findMany({
    where: { sellerId, removedAt: null },
    orderBy: { createdAt: "desc" },
    take,
    include: reviewInclusion,
  });
  return rows.map(toView);
};

const summarizeForSeller = async (
  sellerId: string,
  db: DbClient = prisma,
): Promise<SellerRatingSummary> => {
  const { _avg, _count } = await db.review.aggregate({
    where: { sellerId, removedAt: null },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return { average: _avg.rating, count: _count._all };
};

const listByBuyerForOrder = async (
  orderId: string,
  buyerId: string,
  db: DbClient = prisma,
): Promise<Record<string, ReviewView>> => {
  const rows = await db.review.findMany({
    where: { reviewerId: buyerId, orderItem: { orderId } },
    include: reviewInclusion,
    orderBy: { createdAt: "asc" },
  });
  return Object.fromEntries(rows.map((row) => [row.orderItemId, toView(row)]));
};

type ListForAdminInput = { filter: AdminReviewFilter; window: PaginationWindow };

const listForAdmin = async (
  { filter, window }: ListForAdminInput,
  db: DbClient = prisma,
): Promise<PaginatedResult<AdminReviewView>> => {
  const where: Prisma.ReviewWhereInput =
    filter === "removed" ? { removedAt: { not: null } } : { removedAt: null };
  const [rows, totalItems] = await Promise.all([
    db.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: window.skip,
      take: window.take,
      include: reviewInclusion,
    }),
    db.review.count({ where }),
  ]);
  return buildPaginatedResult(rows.map(toAdminView), totalItems, window);
};

const remove = async (
  reviewId: string,
  reason: string,
  db: DbClient = prisma,
): Promise<boolean> => {
  const { count } = await db.review.updateMany({
    where: { id: reviewId, removedAt: null },
    data: { removedAt: new Date(), removalReason: reason },
  });
  return count === 1;
};

export const reviewRepository = {
  findOrderItemForReview,
  create,
  listVisibleForSeller,
  summarizeForSeller,
  listByBuyerForOrder,
  listForAdmin,
  remove,
};

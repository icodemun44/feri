export type ReviewView = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  reviewerName: string;
  productTitle: string;
  isRemoved: boolean;
};

export type AdminReviewView = ReviewView & {
  sellerName: string;
  removalReason: string | null;
};

export type SellerRatingSummary = {
  average: number | null;
  count: number;
};

export type ReviewableOrderItem = {
  id: string;
  buyerId: string;
  orderStatus: string;
  hasReview: boolean;
  productId: string;
  sellerId: string;
};

export type AdminReviewFilter = "visible" | "removed";

import type { ProductCondition, ProductReviewStatus, ProductStatus } from "@feri/database";

export type ListingImageView = {
  id: string;
  url: string;
  altText: string | null;
  position: number;
};

export type ListingRecord = {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  priceMinor: number;
  condition: ProductCondition;
  status: ProductStatus;
  reviewStatus: ProductReviewStatus;
  brand: string | null;
  size: string | null;
  categoryId: string;
  categoryName: string;
  removalReason: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  images: ListingImageView[];
};

export type ListingSummary = {
  id: string;
  title: string;
  priceMinor: number;
  status: ProductStatus;
  reviewStatus: ProductReviewStatus;
  categoryName: string;
  sellerName: string;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  createdAt: Date;
};

export type ListingReviewCounts = {
  needsReview: number;
  approved: number;
  removed: number;
};

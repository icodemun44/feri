import type { ProductReviewStatus, ProductStatus } from "@feri/database";

type BadgeTone = "neutral" | "success" | "info" | "danger";

export const LISTING_STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Live",
  SOLD: "Sold",
  REMOVED: "Removed",
};

export const LISTING_STATUS_TONES: Record<ProductStatus, BadgeTone> = {
  DRAFT: "neutral",
  ACTIVE: "success",
  SOLD: "info",
  REMOVED: "danger",
};

export const REVIEW_STATUS_LABELS: Record<ProductReviewStatus, string> = {
  PENDING: "Not yet checked",
  APPROVED: "Checked",
};

export const LISTING_REVIEW_FILTERS = {
  NEEDS_REVIEW: "needs-review",
  APPROVED: "approved",
  REMOVED: "removed",
} as const;

export type ListingReviewFilter =
  (typeof LISTING_REVIEW_FILTERS)[keyof typeof LISTING_REVIEW_FILTERS];

export const LISTING_REVIEW_FILTER_OPTIONS: readonly {
  label: string;
  filter: ListingReviewFilter;
}[] = [
  { label: "Needs a check", filter: LISTING_REVIEW_FILTERS.NEEDS_REVIEW },
  { label: "Checked", filter: LISTING_REVIEW_FILTERS.APPROVED },
  { label: "Removed", filter: LISTING_REVIEW_FILTERS.REMOVED },
];

export const parseListingReviewFilter = (value: unknown): ListingReviewFilter => {
  const matchingFilter = Object.values(LISTING_REVIEW_FILTERS).find((filter) => filter === value);
  return matchingFilter ?? LISTING_REVIEW_FILTERS.NEEDS_REVIEW;
};

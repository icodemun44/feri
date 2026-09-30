import { SELLER_APPLICATION_STATUSES, type SellerApplicationStatus } from "@feri/shared";

type BadgeTone = "warning" | "info" | "success" | "danger";

export const SELLER_APPLICATION_STATUS_LABELS: Record<SellerApplicationStatus, string> = {
  [SELLER_APPLICATION_STATUSES.PENDING]: "Waiting for review",
  [SELLER_APPLICATION_STATUSES.IN_REVIEW]: "Being reviewed",
  [SELLER_APPLICATION_STATUSES.APPROVED]: "Approved",
  [SELLER_APPLICATION_STATUSES.REJECTED]: "Not approved",
};

export const SELLER_APPLICATION_STATUS_TONES: Record<SellerApplicationStatus, BadgeTone> = {
  [SELLER_APPLICATION_STATUSES.PENDING]: "warning",
  [SELLER_APPLICATION_STATUSES.IN_REVIEW]: "info",
  [SELLER_APPLICATION_STATUSES.APPROVED]: "success",
  [SELLER_APPLICATION_STATUSES.REJECTED]: "danger",
};

export const SELLER_APPLICATION_FILTERS: readonly {
  label: string;
  status: SellerApplicationStatus | undefined;
}[] = [
  { label: "All", status: undefined },
  { label: "Waiting", status: SELLER_APPLICATION_STATUSES.PENDING },
  { label: "In review", status: SELLER_APPLICATION_STATUSES.IN_REVIEW },
  { label: "Approved", status: SELLER_APPLICATION_STATUSES.APPROVED },
  { label: "Rejected", status: SELLER_APPLICATION_STATUSES.REJECTED },
];

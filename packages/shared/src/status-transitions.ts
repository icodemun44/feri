export const SELLER_APPLICATION_STATUSES = {
  PENDING: "PENDING",
  IN_REVIEW: "IN_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type SellerApplicationStatus =
  (typeof SELLER_APPLICATION_STATUSES)[keyof typeof SELLER_APPLICATION_STATUSES];

export const ORDER_STATUSES = {
  PLACED: "PLACED",
  CONFIRMED: "CONFIRMED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

export const PRODUCT_STATUSES = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  SOLD: "SOLD",
  REMOVED: "REMOVED",
} as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[keyof typeof PRODUCT_STATUSES];

export const PRODUCT_REVIEW_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
} as const;

export type ProductReviewStatus =
  (typeof PRODUCT_REVIEW_STATUSES)[keyof typeof PRODUCT_REVIEW_STATUSES];

type TransitionMap<Status extends string> = Readonly<Record<Status, readonly Status[]>>;

const SELLER_APPLICATION_TRANSITIONS: TransitionMap<SellerApplicationStatus> = {
  PENDING: ["IN_REVIEW", "REJECTED"],
  IN_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: [],
  REJECTED: [],
};

const ORDER_TRANSITIONS: TransitionMap<OrderStatus> = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const PRODUCT_TRANSITIONS: TransitionMap<ProductStatus> = {
  DRAFT: ["ACTIVE", "REMOVED"],
  ACTIVE: ["DRAFT", "SOLD", "REMOVED"],
  SOLD: ["ACTIVE", "REMOVED"],
  REMOVED: [],
};

export const OPEN_SELLER_APPLICATION_STATUSES: readonly SellerApplicationStatus[] = [
  SELLER_APPLICATION_STATUSES.PENDING,
  SELLER_APPLICATION_STATUSES.IN_REVIEW,
];

export const canTransitionSellerApplication = (
  from: SellerApplicationStatus,
  to: SellerApplicationStatus,
): boolean => SELLER_APPLICATION_TRANSITIONS[from].includes(to);

export const canTransitionProduct = (from: ProductStatus, to: ProductStatus): boolean =>
  PRODUCT_TRANSITIONS[from].includes(to);

export const canTransitionOrder = (from: OrderStatus, to: OrderStatus): boolean =>
  ORDER_TRANSITIONS[from].includes(to);

export const isSellerApplicationOpen = (status: SellerApplicationStatus): boolean =>
  OPEN_SELLER_APPLICATION_STATUSES.includes(status);

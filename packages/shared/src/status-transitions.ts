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

export const OPEN_SELLER_APPLICATION_STATUSES: readonly SellerApplicationStatus[] = [
  SELLER_APPLICATION_STATUSES.PENDING,
  SELLER_APPLICATION_STATUSES.IN_REVIEW,
];

export const canTransitionSellerApplication = (
  from: SellerApplicationStatus,
  to: SellerApplicationStatus,
): boolean => SELLER_APPLICATION_TRANSITIONS[from].includes(to);

export const canTransitionOrder = (from: OrderStatus, to: OrderStatus): boolean =>
  ORDER_TRANSITIONS[from].includes(to);

export const isSellerApplicationOpen = (status: SellerApplicationStatus): boolean =>
  OPEN_SELLER_APPLICATION_STATUSES.includes(status);

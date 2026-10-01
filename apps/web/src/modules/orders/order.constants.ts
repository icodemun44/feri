import type { OrderStatus, PaymentMethod, PaymentStatus } from "@feri/database";

type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  SHIPPED: "On its way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_TONES: Record<OrderStatus, BadgeTone> = {
  PLACED: "warning",
  CONFIRMED: "info",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  COD: "Cash on delivery",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pay when it arrives",
  COMPLETED: "Paid",
  FAILED: "Not collected",
  REFUNDED: "Refunded",
};

export const ORDER_PROGRESS_STEPS: readonly { status: OrderStatus; label: string }[] = [
  { status: "PLACED", label: "Order placed" },
  { status: "CONFIRMED", label: "Seller confirmed" },
  { status: "SHIPPED", label: "On its way" },
  { status: "DELIVERED", label: "Delivered" },
];

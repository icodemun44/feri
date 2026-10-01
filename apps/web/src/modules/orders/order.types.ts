import type { OrderStatus, PaymentMethod, PaymentStatus } from "@feri/database";

export type OrderSummary = {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  totalMinor: number;
  placedAt: Date;
  sellerName: string;
  buyerName: string;
  itemCount: number;
  coverImageUrl: string | null;
};

export type OrderItemView = {
  productId: string;
  title: string;
  unitPriceMinor: number;
  imageUrl: string | null;
};

export type OrderDetail = {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  placedAt: Date;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  deliveredAt: Date | null;
  sellerName: string;
  sellerPhone: string;
  items: OrderItemView[];
  subtotalMinor: number;
  deliveryFeeMinor: number;
  totalMinor: number;
  shipping: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    district: string | null;
    deliveryNotes: string | null;
  };
  payment: { method: PaymentMethod; status: PaymentStatus } | null;
};

export type SellerOrderCounts = {
  toConfirm: number;
  toShip: number;
  toDeliver: number;
};

export type SellerOrderView = "open" | "closed";

export type PlacedOrder = {
  id: string;
  orderNumber: number;
};

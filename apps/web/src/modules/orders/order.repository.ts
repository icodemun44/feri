import "server-only";
import {
  prisma,
  type Prisma,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductStatus,
  type DbClient,
} from "@feri/database";
import { buildPublicProductImageUrl } from "@/server/supabase/storage";
import type {
  OrderDetail,
  OrderSummary,
  PlacedOrder,
  SellerOrderCounts,
  SellerOrderView,
} from "./order.types";

const summarySelection = {
  id: true,
  orderNumber: true,
  status: true,
  totalMinor: true,
  placedAt: true,
  shippingFullName: true,
  seller: { select: { businessName: true } },
  items: {
    select: {
      product: {
        select: {
          images: { orderBy: { position: "asc" }, take: 1, select: { storagePath: true } },
        },
      },
    },
  },
} satisfies Prisma.OrderSelect;

const detailSelection = {
  id: true,
  orderNumber: true,
  status: true,
  placedAt: true,
  cancelledAt: true,
  cancellationReason: true,
  deliveredAt: true,
  subtotalMinor: true,
  deliveryFeeMinor: true,
  totalMinor: true,
  shippingFullName: true,
  shippingPhone: true,
  shippingAddressLine: true,
  shippingCity: true,
  shippingDistrict: true,
  deliveryNotes: true,
  seller: { select: { businessName: true, contactPhone: true } },
  payment: { select: { method: true, status: true } },
  items: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      productId: true,
      titleSnapshot: true,
      unitPriceMinor: true,
      product: {
        select: {
          images: { orderBy: { position: "asc" }, take: 1, select: { storagePath: true } },
        },
      },
    },
  },
} satisfies Prisma.OrderSelect;

type SummaryRow = Prisma.OrderGetPayload<{ select: typeof summarySelection }>;
type DetailRow = Prisma.OrderGetPayload<{ select: typeof detailSelection }>;

const firstImageUrl = (images: readonly { storagePath: string }[]): string | null => {
  const [coverImage] = images;
  return coverImage ? buildPublicProductImageUrl(coverImage.storagePath) : null;
};

const toSummary = (row: SummaryRow): OrderSummary => ({
  id: row.id,
  orderNumber: row.orderNumber,
  status: row.status,
  totalMinor: row.totalMinor,
  placedAt: row.placedAt,
  sellerName: row.seller.businessName,
  buyerName: row.shippingFullName,
  itemCount: row.items.length,
  coverImageUrl: firstImageUrl(row.items[0]?.product.images ?? []),
});

const toDetail = (row: DetailRow): OrderDetail => ({
  id: row.id,
  orderNumber: row.orderNumber,
  status: row.status,
  placedAt: row.placedAt,
  cancelledAt: row.cancelledAt,
  cancellationReason: row.cancellationReason,
  deliveredAt: row.deliveredAt,
  sellerName: row.seller.businessName,
  sellerPhone: row.seller.contactPhone,
  items: row.items.map((item) => ({
    orderItemId: item.id,
    productId: item.productId,
    title: item.titleSnapshot,
    unitPriceMinor: item.unitPriceMinor,
    imageUrl: firstImageUrl(item.product.images),
  })),
  subtotalMinor: row.subtotalMinor,
  deliveryFeeMinor: row.deliveryFeeMinor,
  totalMinor: row.totalMinor,
  shipping: {
    fullName: row.shippingFullName,
    phone: row.shippingPhone,
    addressLine: row.shippingAddressLine,
    city: row.shippingCity,
    district: row.shippingDistrict,
    deliveryNotes: row.deliveryNotes,
  },
  payment: row.payment,
});

type CreateOrderInput = {
  buyerId: string;
  sellerId: string;
  subtotalMinor: number;
  deliveryFeeMinor: number;
  shipping: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    district?: string | undefined;
    deliveryNotes?: string | undefined;
  };
  items: readonly { productId: string; title: string; priceMinor: number }[];
};

const create = async (input: CreateOrderInput, db: DbClient = prisma): Promise<PlacedOrder> => {
  const { shipping } = input;
  const totalMinor = input.subtotalMinor + input.deliveryFeeMinor;
  const order = await db.order.create({
    data: {
      buyerId: input.buyerId,
      sellerId: input.sellerId,
      subtotalMinor: input.subtotalMinor,
      deliveryFeeMinor: input.deliveryFeeMinor,
      totalMinor,
      shippingFullName: shipping.fullName,
      shippingPhone: shipping.phone,
      shippingAddressLine: shipping.addressLine,
      shippingCity: shipping.city,
      shippingDistrict: shipping.district ?? null,
      deliveryNotes: shipping.deliveryNotes ?? null,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          titleSnapshot: item.title,
          unitPriceMinor: item.priceMinor,
          quantity: 1,
          subtotalMinor: item.priceMinor,
        })),
      },
      payment: {
        create: {
          method: PaymentMethod.COD,
          status: PaymentStatus.PENDING,
          amountMinor: totalMinor,
        },
      },
    },
    select: { id: true, orderNumber: true },
  });
  return order;
};

const listForBuyer = async (buyerId: string, db: DbClient = prisma): Promise<OrderSummary[]> => {
  const rows = await db.order.findMany({
    where: { buyerId },
    orderBy: { placedAt: "desc" },
    select: summarySelection,
  });
  return rows.map(toSummary);
};

const findForBuyer = async (
  orderId: string,
  buyerId: string,
  db: DbClient = prisma,
): Promise<OrderDetail | null> => {
  const row = await db.order.findFirst({
    where: { id: orderId, buyerId },
    select: detailSelection,
  });
  return row ? toDetail(row) : null;
};

const OPEN_ORDER_STATUSES: readonly OrderStatus[] = [
  OrderStatus.PLACED,
  OrderStatus.CONFIRMED,
  OrderStatus.SHIPPED,
];

const listForSeller = async (
  sellerId: string,
  view: SellerOrderView,
  db: DbClient = prisma,
): Promise<OrderSummary[]> => {
  const rows = await db.order.findMany({
    where: {
      sellerId,
      status:
        view === "open" ? { in: [...OPEN_ORDER_STATUSES] } : { notIn: [...OPEN_ORDER_STATUSES] },
    },
    orderBy: { placedAt: view === "open" ? "asc" : "desc" },
    select: summarySelection,
  });
  return rows.map(toSummary);
};

const findForSeller = async (
  orderId: string,
  sellerId: string,
  db: DbClient = prisma,
): Promise<OrderDetail | null> => {
  const row = await db.order.findFirst({
    where: { id: orderId, sellerId },
    select: detailSelection,
  });
  return row ? toDetail(row) : null;
};

const countForSeller = async (
  sellerId: string,
  db: DbClient = prisma,
): Promise<SellerOrderCounts> => {
  const [toConfirm, toShip, toDeliver] = await Promise.all([
    db.order.count({ where: { sellerId, status: OrderStatus.PLACED } }),
    db.order.count({ where: { sellerId, status: OrderStatus.CONFIRMED } }),
    db.order.count({ where: { sellerId, status: OrderStatus.SHIPPED } }),
  ]);
  return { toConfirm, toShip, toDeliver };
};

type TransitionInput = {
  id: string;
  from: readonly OrderStatus[];
  data: Prisma.OrderUncheckedUpdateManyInput;
  buyerId?: string;
  sellerId?: string;
};

const transition = async (
  { id, from, data, buyerId, sellerId }: TransitionInput,
  db: DbClient = prisma,
): Promise<boolean> => {
  const { count } = await db.order.updateMany({
    where: {
      id,
      status: { in: [...from] },
      ...(buyerId ? { buyerId } : {}),
      ...(sellerId ? { sellerId } : {}),
    },
    data,
  });
  return count === 1;
};

const listProductIds = async (orderId: string, db: DbClient = prisma): Promise<string[]> => {
  const items = await db.orderItem.findMany({ where: { orderId }, select: { productId: true } });
  return items.map((item) => item.productId);
};

const markPaymentNotCollected = async (orderId: string, db: DbClient = prisma): Promise<void> => {
  await db.payment.updateMany({
    where: { orderId },
    data: { status: PaymentStatus.FAILED },
  });
};

const markPaymentCollected = async (orderId: string, db: DbClient = prisma): Promise<void> => {
  await db.payment.updateMany({
    where: { orderId, status: PaymentStatus.PENDING },
    data: { status: PaymentStatus.COMPLETED, completedAt: new Date() },
  });
};

const reserveProducts = async (
  productIds: readonly string[],
  db: DbClient = prisma,
): Promise<number> => {
  const { count } = await db.product.updateMany({
    where: { id: { in: [...productIds] }, status: ProductStatus.ACTIVE, quantity: { gt: 0 } },
    data: { status: ProductStatus.SOLD, quantity: 0, soldAt: new Date() },
  });
  return count;
};

const releaseProducts = async (
  productIds: readonly string[],
  db: DbClient = prisma,
): Promise<void> => {
  await db.product.updateMany({
    where: { id: { in: [...productIds] }, status: ProductStatus.SOLD },
    data: { status: ProductStatus.ACTIVE, quantity: 1, soldAt: null },
  });
};

export const orderRepository = {
  create,
  listForBuyer,
  findForBuyer,
  listForSeller,
  findForSeller,
  countForSeller,
  transition,
  listProductIds,
  markPaymentNotCollected,
  markPaymentCollected,
  reserveProducts,
  releaseProducts,
};

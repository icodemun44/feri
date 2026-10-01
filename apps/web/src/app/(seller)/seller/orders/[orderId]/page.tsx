import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, PhoneCall } from "lucide-react";
import {
  AppError,
  ERROR_CODES,
  formatOrderNumber,
  formatPaisa,
  ORDER_STATUSES,
} from "@feri/shared";
import { uuidField } from "@feri/validation";
import { Alert, Card, CardContent, CardHeader, CardTitle } from "@feri/ui";
import { formatDateTime } from "@/lib/format";
import { OrderStatusBadge } from "@/modules/orders/components/order-status-badge";
import { SellerOrderActions } from "@/modules/orders/components/seller-order-actions";
import { orderFulfilmentService } from "@/modules/orders/order-fulfilment.service";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/modules/orders/order.constants";
import type { OrderDetail } from "@/modules/orders/order.types";
import { requireSeller } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Order" };

type SellerOrderPageProps = {
  params: Promise<{ orderId: string }>;
};

const loadOrder = async (orderId: string): Promise<OrderDetail> => {
  const user = await requireSeller(`/seller/orders/${orderId}`);
  if (!uuidField.safeParse(orderId).success) {
    notFound();
  }
  try {
    return await orderFulfilmentService.getForSeller(user, orderId);
  } catch (error) {
    if (error instanceof AppError && error.code === ERROR_CODES.NOT_FOUND) {
      notFound();
    }
    throw error;
  }
};

const SellerOrderPage = async ({ params }: SellerOrderPageProps) => {
  const { orderId } = await params;
  const order = await loadOrder(orderId);

  return (
    <>
      <Link
        href="/seller/orders"
        className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        All orders
      </Link>

      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">{formatOrderNumber(order.orderNumber)}</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mb-6 text-muted">Placed {formatDateTime(order.placedAt)}</p>

      {order.status === ORDER_STATUSES.CANCELLED ? (
        <Alert tone="warning" title="This order was cancelled" className="mb-6">
          {order.cancellationReason ?? "The buyer cancelled this order before it was confirmed."}
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Items to send</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-line">
                {order.items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-4 py-3">
                    <span className="size-14 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-muted">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="size-full object-cover" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-ink">{item.title}</span>
                    <span className="font-semibold text-ink">
                      {formatPaisa(item.unitPriceMinor)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Deliver to</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-0.5 text-sm">
                <p className="font-semibold text-ink">{order.shipping.fullName}</p>
                <a
                  href={`tel:${order.shipping.phone}`}
                  className="inline-flex w-fit items-center gap-1.5 font-semibold text-primary"
                >
                  <PhoneCall aria-hidden="true" className="size-4" />
                  {order.shipping.phone}
                </a>
                <p>{order.shipping.addressLine}</p>
                <p>
                  {order.shipping.city}
                  {order.shipping.district ? `, ${order.shipping.district}` : ""}
                </p>
                {order.shipping.deliveryNotes ? (
                  <p className="mt-2 text-muted">Note: {order.shipping.deliveryNotes}</p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cash to collect</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm">
                <p className="font-display text-3xl font-semibold text-ink">
                  {formatPaisa(order.totalMinor)}
                </p>
                <p className="text-muted">
                  Items {formatPaisa(order.subtotalMinor)} + delivery{" "}
                  {formatPaisa(order.deliveryFeeMinor)}
                </p>
                {order.payment ? (
                  <p className="mt-2">
                    {PAYMENT_METHOD_LABELS[order.payment.method]}:{" "}
                    {PAYMENT_STATUS_LABELS[order.payment.status]}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>

        <SellerOrderActions
          orderId={order.id}
          status={order.status}
          totalMinor={order.totalMinor}
        />
      </div>
    </>
  );
};

export default SellerOrderPage;

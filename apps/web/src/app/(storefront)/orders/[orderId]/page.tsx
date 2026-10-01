import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronLeft } from "lucide-react";
import {
  AppError,
  ERROR_CODES,
  formatOrderNumber,
  formatPaisa,
  ORDER_STATUSES,
  ROLES,
} from "@feri/shared";
import { uuidField } from "@feri/validation";
import { Alert, Card, CardContent, CardHeader, CardTitle, Container, cn } from "@feri/ui";
import { formatDateTime } from "@/lib/format";
import { CancelOrderButton } from "@/modules/orders/components/cancel-order-button";
import { OrderStatusBadge } from "@/modules/orders/components/order-status-badge";
import {
  ORDER_PROGRESS_STEPS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/modules/orders/order.constants";
import { orderService } from "@/modules/orders/order.service";
import type { OrderDetail } from "@/modules/orders/order.types";
import { ReviewForm } from "@/modules/reviews/components/review-form";
import { ReviewList } from "@/modules/reviews/components/review-list";
import { reviewService } from "@/modules/reviews/review.service";
import type { AppUser } from "@/modules/users/user.types";
import { requireRole } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Order" };

type OrderPageProps = {
  params: Promise<{ orderId: string }>;
};

const loadOrder = async (orderId: string): Promise<{ user: AppUser; order: OrderDetail }> => {
  const user = await requireRole([ROLES.BUYER, ROLES.SELLER], { nextPath: `/orders/${orderId}` });
  if (!uuidField.safeParse(orderId).success) {
    notFound();
  }
  try {
    return { user, order: await orderService.getMine(user, orderId) };
  } catch (error) {
    if (error instanceof AppError && error.code === ERROR_CODES.NOT_FOUND) {
      notFound();
    }
    throw error;
  }
};

const progressIndexOf = (status: OrderDetail["status"]): number =>
  ORDER_PROGRESS_STEPS.findIndex((step) => step.status === status);

const OrderPage = async ({ params }: OrderPageProps) => {
  const { orderId } = await params;
  const { user, order } = await loadOrder(orderId);
  const isCancelled = order.status === ORDER_STATUSES.CANCELLED;
  const isDelivered = order.status === ORDER_STATUSES.DELIVERED;
  const reviewsByOrderItemId = isDelivered
    ? await reviewService.listMineForOrder(user, order.id)
    : {};
  const currentStepIndex = progressIndexOf(order.status);

  return (
    <Container className="max-w-3xl py-8">
      <Link
        href="/orders"
        className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        All orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">{formatOrderNumber(order.orderNumber)}</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mb-6 text-muted">
        Placed {formatDateTime(order.placedAt)} with {order.sellerName}
      </p>

      <div className="flex flex-col gap-5">
        {isCancelled && order.cancellationReason ? (
          <Alert tone="warning" title="This order was cancelled by the seller">
            {order.cancellationReason}
          </Alert>
        ) : null}

        {isCancelled ? null : (
          <ol className="grid grid-cols-4 gap-2" aria-label="Order progress">
            {ORDER_PROGRESS_STEPS.map((step, index) => {
              const isReached = index <= currentStepIndex;
              return (
                <li key={step.status} className="flex flex-col gap-2">
                  <span
                    className={cn(
                      "flex h-8 items-center justify-center rounded-full text-sm",
                      isReached ? "bg-primary text-white" : "bg-surface-muted text-muted",
                    )}
                  >
                    {isReached ? <Check aria-hidden="true" className="size-4" /> : index + 1}
                  </span>
                  <span
                    className={cn("text-center text-xs", isReached ? "text-ink" : "text-muted")}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
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
                  <span className="font-semibold text-ink">{formatPaisa(item.unitPriceMinor)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 flex flex-col gap-1 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Items</dt>
                <dd>{formatPaisa(order.subtotalMinor)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd>{formatPaisa(order.deliveryFeeMinor)}</dd>
              </div>
              <div className="flex justify-between font-semibold text-ink">
                <dt>Total</dt>
                <dd>{formatPaisa(order.totalMinor)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="grid gap-5 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Delivery</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-0.5 text-sm">
              <p className="font-semibold text-ink">{order.shipping.fullName}</p>
              <p>{order.shipping.phone}</p>
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
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              {order.payment ? (
                <>
                  <p className="font-semibold text-ink">
                    {PAYMENT_METHOD_LABELS[order.payment.method]}
                  </p>
                  <p>{PAYMENT_STATUS_LABELS[order.payment.status]}</p>
                </>
              ) : null}
              <p className="mt-2 text-muted">Seller contact: {order.sellerPhone}</p>
            </CardContent>
          </Card>
        </div>

        {isDelivered ? (
          <Card>
            <CardHeader>
              <CardTitle>Rate your purchase</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {order.items.map((item) => {
                const review = reviewsByOrderItemId[item.orderItemId];
                return (
                  <div key={item.orderItemId} className="flex flex-col gap-3">
                    <p className="font-semibold text-ink">{item.title}</p>
                    {review ? (
                      <ReviewList reviews={[review]} />
                    ) : (
                      <ReviewForm orderItemId={item.orderItemId} />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ) : null}

        {order.status === ORDER_STATUSES.PLACED ? <CancelOrderButton orderId={order.id} /> : null}
      </div>
    </Container>
  );
};

export default OrderPage;

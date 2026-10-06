import type { Metadata } from "next";
import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { formatOrderNumber, formatPaisa, ROLES } from "@feri/shared";
import { Alert, Button, Container, EmptyState } from "@feri/ui";
import { PageHeading } from "@/components/layout/page-heading";
import { formatDate } from "@/lib/format";
import { OrderStatusBadge } from "@/modules/orders/components/order-status-badge";
import { orderService } from "@/modules/orders/order.service";
import { requireRole } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Your orders" };

type OrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const readPlacedCount = (value: string | string[] | undefined): number => {
  const placedCount = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isInteger(placedCount) && placedCount > 0 ? placedCount : 0;
};

const OrdersPage = async ({ searchParams }: OrdersPageProps) => {
  const user = await requireRole([ROLES.BUYER], { nextPath: "/orders" });
  const placedCount = readPlacedCount((await searchParams)["placed"]);
  const orders = await orderService.listMine(user);

  return (
    <Container className="max-w-3xl py-8">
      <PageHeading title="Your orders" />

      {placedCount > 0 ? (
        <Alert tone="success" title="Order placed" className="mb-6">
          {placedCount === 1
            ? "The seller will confirm it soon. Pay when it arrives."
            : `We created ${placedCount} orders, one for each seller. Pay each one when it arrives.`}
        </Alert>
      ) : null}

      {orders.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No orders yet"
          description="When you place an order it will show up here, with its status."
          action={
            <Button asChild>
              <Link href="/products">Browse products</Link>
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-surface-muted"
              >
                <span className="size-16 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-muted">
                  {order.coverImageUrl ? (
                    <img src={order.coverImageUrl} alt="" className="size-full object-cover" />
                  ) : null}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-semibold text-ink">
                    {formatOrderNumber(order.orderNumber)}
                  </span>
                  <span className="truncate text-sm text-muted">
                    {order.itemCount} {order.itemCount === 1 ? "item" : "items"} from{" "}
                    {order.sellerName}
                  </span>
                  <span className="text-xs text-muted">{formatDate(order.placedAt)}</span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <span className="font-semibold text-ink">{formatPaisa(order.totalMinor)}</span>
                  <OrderStatusBadge status={order.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
};

export default OrdersPage;

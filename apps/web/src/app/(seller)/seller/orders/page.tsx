import type { Metadata } from "next";
import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { formatOrderNumber, formatPaisa } from "@feri/shared";
import { cn, EmptyState } from "@feri/ui";
import { PageHeading } from "@/components/layout/page-heading";
import { formatDate } from "@/lib/format";
import { OrderStatusBadge } from "@/modules/orders/components/order-status-badge";
import { orderFulfilmentService } from "@/modules/orders/order-fulfilment.service";
import type { SellerOrderView } from "@/modules/orders/order.types";
import { requireSeller } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Shop orders" };

type SellerOrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const VIEWS: readonly { view: SellerOrderView; label: string }[] = [
  { view: "open", label: "To handle" },
  { view: "closed", label: "Finished" },
];

const SellerOrdersPage = async ({ searchParams }: SellerOrdersPageProps) => {
  const user = await requireSeller("/seller/orders");
  const view: SellerOrderView = (await searchParams)["view"] === "closed" ? "closed" : "open";
  const orders = await orderFulfilmentService.listForSeller(user, view);

  return (
    <>
      <PageHeading
        title="Orders"
        description="Orders from buyers, oldest first. Buyers pay in cash when the order arrives."
      />

      <nav aria-label="Filter orders" className="mb-5 flex gap-2">
        {VIEWS.map((option) => {
          const isActive = option.view === view;
          return (
            <Link
              key={option.view}
              href={option.view === "open" ? "/seller/orders" : "/seller/orders?view=closed"}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-line-strong bg-surface text-ink hover:bg-surface-muted",
              )}
            >
              {option.label}
            </Link>
          );
        })}
      </nav>

      {orders.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={view === "open" ? "No orders to handle" : "No finished orders yet"}
          description={
            view === "open"
              ? "When a buyer orders one of your items it will appear here."
              : "Delivered and cancelled orders will be listed here."
          }
        />
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/seller/orders/${order.id}`}
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
                    {order.buyerName} - {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
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
    </>
  );
};

export default SellerOrdersPage;

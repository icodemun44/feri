import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { formatPaisa, ROLES } from "@feri/shared";
import { Container } from "@feri/ui";
import { PageHeading } from "@/components/layout/page-heading";
import { cartService } from "@/modules/cart/cart.service";
import { CheckoutForm } from "@/modules/orders/components/checkout-form";
import { requireRole } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Checkout" };

const CheckoutPage = async () => {
  const user = await requireRole([ROLES.BUYER], { nextPath: "/checkout" });
  const cart = await cartService.getCart(user);

  if (cart.groups.length === 0 || cart.unavailableLines.length > 0) {
    redirect("/cart");
  }

  return (
    <Container className="max-w-5xl py-8">
      <Link
        href="/cart"
        className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Back to cart
      </Link>
      <PageHeading title="Checkout" />

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <CheckoutForm defaultFullName={user.fullName} defaultPhone={user.phone ?? ""} />
        </div>

        <aside
          aria-labelledby="summary-heading"
          className="h-fit rounded-2xl border border-line bg-surface p-6"
        >
          <h2 id="summary-heading" className="mb-4 text-xl">
            Your order
          </h2>
          <div className="flex flex-col gap-5">
            {cart.groups.map((group) => (
              <div key={group.sellerId} className="flex flex-col gap-2 text-sm">
                <p className="font-semibold text-ink">{group.sellerName}</p>
                <ul className="flex flex-col gap-1">
                  {group.lines.map((line) => (
                    <li key={line.productId} className="flex justify-between gap-3">
                      <span className="truncate text-body">{line.title}</span>
                      <span className="text-ink">{formatPaisa(line.priceMinor)}</span>
                    </li>
                  ))}
                </ul>
                <p className="flex justify-between text-muted">
                  <span>Delivery</span>
                  <span>{formatPaisa(group.deliveryFeeMinor)}</span>
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 flex justify-between border-t border-line pt-4 font-semibold text-ink">
            <span>To pay on delivery</span>
            <span>{formatPaisa(cart.grandTotalMinor)}</span>
          </p>
          {cart.groups.length > 1 ? (
            <p className="mt-3 text-xs text-muted">
              You will get {cart.groups.length} separate orders, one for each seller.
            </p>
          ) : null}
        </aside>
      </div>
    </Container>
  );
};

export default CheckoutPage;

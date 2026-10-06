import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, Store } from "lucide-react";
import { formatPaisa } from "@feri/shared";
import { Alert, Button, Container, EmptyState } from "@feri/ui";
import { PageHeading } from "@/components/layout/page-heading";
import { CategoryIcon } from "@/modules/catalog/components/category-icon";
import { cartService } from "@/modules/cart/cart.service";
import type { CartLine } from "@/modules/cart/cart.types";
import { RemoveFromCartButton } from "@/modules/cart/components/remove-from-cart-button";
import { requireRole } from "@/server/auth/guards";
import { ROLES } from "@feri/shared";

export const metadata: Metadata = { title: "Your cart" };

const CartLineRow = ({ line }: { line: CartLine }) => (
  <li className="flex items-center gap-4 py-4">
    <Link
      href={`/products/${line.productId}`}
      className="size-20 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-muted"
    >
      {line.imageUrl ? (
        <img src={line.imageUrl} alt="" className="size-full object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center text-taupe">
          <CategoryIcon categorySlug={line.categorySlug} aria-hidden="true" className="size-8" />
        </span>
      )}
    </Link>
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <Link
        href={`/products/${line.productId}`}
        className="truncate font-semibold text-ink hover:underline"
      >
        {line.title}
      </Link>
      <p className="text-sm text-muted">One of a kind</p>
    </div>
    <div className="flex flex-col items-end gap-1">
      <p className="font-semibold text-ink">{formatPaisa(line.priceMinor)}</p>
      <RemoveFromCartButton productId={line.productId} />
    </div>
  </li>
);

const CartPage = async () => {
  const user = await requireRole([ROLES.BUYER], { nextPath: "/cart" });
  const cart = await cartService.getCart(user);
  const hasItems = cart.groups.length > 0 || cart.unavailableLines.length > 0;

  return (
    <Container className="max-w-4xl py-8">
      <PageHeading title="Your cart" />

      {!hasItems ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Find something you like and add it here. Every item is one of a kind."
          action={
            <Button asChild>
              <Link href="/products">Browse products</Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {cart.unavailableLines.length > 0 ? (
            <Alert tone="warning" title="Some items are no longer available">
              Someone else may have bought them, or the seller took them down. Remove them to
              continue.
              <ul className="mt-2 divide-y divide-line">
                {cart.unavailableLines.map((line) => (
                  <li key={line.productId} className="flex items-center justify-between gap-3 py-2">
                    <span className="truncate text-ink">{line.title}</span>
                    <RemoveFromCartButton productId={line.productId} />
                  </li>
                ))}
              </ul>
            </Alert>
          ) : null}

          {cart.groups.map((group) => (
            <section
              key={group.sellerId}
              aria-label={`Items from ${group.sellerName}`}
              className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
            >
              <h2 className="flex items-center gap-2 text-lg">
                <Store aria-hidden="true" className="size-5 text-primary" />
                {group.sellerName}
              </h2>
              <ul className="divide-y divide-line">
                {group.lines.map((line) => (
                  <CartLineRow key={line.productId} line={line} />
                ))}
              </ul>
              <dl className="mt-2 flex flex-col gap-1 border-t border-line pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Items</dt>
                  <dd className="text-ink">{formatPaisa(group.subtotalMinor)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Delivery from this seller</dt>
                  <dd className="text-ink">{formatPaisa(group.deliveryFeeMinor)}</dd>
                </div>
                <div className="flex justify-between font-semibold">
                  <dt className="text-ink">Order total</dt>
                  <dd className="text-ink">{formatPaisa(group.totalMinor)}</dd>
                </div>
              </dl>
            </section>
          ))}

          {cart.groups.length > 1 ? (
            <p className="text-sm text-muted">
              Items from different sellers are sent as separate orders, each with its own delivery
              fee.
            </p>
          ) : null}

          {cart.groups.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-primary-soft p-5 sm:p-6">
              <div className="flex flex-col">
                <p className="text-sm text-muted">To pay when your order arrives</p>
                <p className="font-display text-3xl font-semibold text-ink">
                  {formatPaisa(cart.grandTotalMinor)}
                </p>
              </div>
              {cart.unavailableLines.length > 0 ? (
                <Button size="lg" disabled>
                  Continue to checkout
                </Button>
              ) : (
                <Button asChild size="lg">
                  <Link href="/checkout">Continue to checkout</Link>
                </Button>
              )}
            </div>
          ) : null}
        </div>
      )}
    </Container>
  );
};

export default CartPage;

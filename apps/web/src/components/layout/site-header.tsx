import Link from "next/link";
import { LogOut, Search, ShoppingBag } from "lucide-react";
import { getInitials, ROLES } from "@feri/shared";
import { Button } from "@feri/ui";
import { signOutAction } from "@/modules/auth/auth.actions";
import { cartService } from "@/modules/cart/cart.service";
import type { AppUser } from "@/modules/users/user.types";
import { getCurrentUser } from "@/server/auth/session";
import { HeaderNav, type HeaderNavItem } from "./header-nav";
import { Logo } from "./logo";

const BROWSE_ITEM: HeaderNavItem = {
  href: "/products",
  label: "Browse",
  icon: "browse",
  activePrefixes: ["/", "/products"],
};

const buildNavItems = (user: AppUser | null): HeaderNavItem[] => {
  const items = [BROWSE_ITEM];
  if (user?.role === ROLES.SELLER) {
    items.push({ href: "/seller", label: "My shop", icon: "shop", activePrefixes: ["/seller"] });
  }
  if (user?.role === ROLES.ADMIN) {
    items.push({ href: "/admin", label: "Admin", icon: "admin", activePrefixes: ["/admin"] });
  }
  if (user?.role === ROLES.BUYER) {
    items.push({
      href: "/orders",
      label: "Orders",
      icon: "orders",
      activePrefixes: ["/orders"],
    });
  }
  if (!user || user.role === ROLES.BUYER) {
    items.push({ href: "/sell", label: "Sell", icon: "sell", activePrefixes: ["/sell"] });
  }
  return items;
};

export const SiteHeader = async () => {
  const user = await getCurrentUser();
  const cartItemCount = await cartService.countForHeader(user);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:pt-4">
      <div className="mx-auto flex w-full flex-wrap items-center gap-x-4 gap-y-3 rounded-3xl border border-line bg-surface px-4 py-2.5 shadow-overlay sm:w-[90%] sm:max-w-screen-2xl md:rounded-full md:px-5">
        <Logo />

        <HeaderNav items={buildNavItems(user)} />

        <form
          action="/products"
          method="get"
          role="search"
          className="order-last w-full md:order-none md:w-auto md:flex-1"
        >
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="Search jackets, watches, bags..."
              className="h-11 w-full rounded-full border border-line bg-canvas pl-11 pr-4 text-sm text-ink placeholder:text-muted hover:border-line-strong focus-visible:border-primary"
            />
          </div>
        </form>

        {user ? (
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            {user.role === ROLES.BUYER ? (
              <Link
                href="/cart"
                aria-label={cartItemCount > 0 ? `Cart, ${cartItemCount} items` : "Cart"}
                title="Cart"
                className="relative flex size-11 items-center justify-center rounded-full text-body transition-colors hover:bg-surface-muted hover:text-ink"
              >
                <ShoppingBag aria-hidden="true" className="size-5" />
                {cartItemCount > 0 ? (
                  <span
                    aria-hidden="true"
                    className="absolute right-1 top-1 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold leading-5 text-ink"
                  >
                    {cartItemCount}
                  </span>
                ) : null}
              </Link>
            ) : null}
            <Link
              href="/account"
              aria-label="Your account"
              title={user.fullName}
              className="flex size-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              {getInitials(user.fullName)}
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                aria-label="Log out"
                title="Log out"
                className="flex size-11 items-center justify-center rounded-full text-body transition-colors hover:bg-surface-muted hover:text-ink"
              >
                <LogOut aria-hidden="true" className="size-5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild variant="accent" size="sm">
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

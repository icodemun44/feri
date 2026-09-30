import Link from "next/link";
import { Search } from "lucide-react";
import { ROLES } from "@feri/shared";
import { Button, Container } from "@feri/ui";
import { signOutAction } from "@/modules/auth/auth.actions";
import { getCurrentUser } from "@/server/auth/session";
import { Logo } from "./logo";

const navLinkClasses = "text-sm font-semibold text-body hover:text-primary";

export const SiteHeader = async () => {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <Container className="flex flex-wrap items-center gap-x-6 gap-y-3 py-3">
        <Logo />

        <form
          action="/products"
          method="get"
          role="search"
          className="order-last w-full sm:order-none sm:max-w-md sm:flex-1"
        >
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="Search jackets, watches, bags..."
              className="h-11 w-full rounded-lg border border-line-strong bg-canvas pl-10 pr-3 text-sm text-ink placeholder:text-muted hover:border-taupe focus-visible:border-primary"
            />
          </div>
        </form>

        <nav aria-label="Main" className="ml-auto flex items-center gap-4 sm:gap-5">
          <Link href="/products" className={navLinkClasses}>
            Browse
          </Link>
          {user?.role === ROLES.SELLER ? (
            <Link href="/seller" className={navLinkClasses}>
              My shop
            </Link>
          ) : null}
          {user?.role === ROLES.ADMIN ? (
            <Link href="/admin" className={navLinkClasses}>
              Admin
            </Link>
          ) : null}
          {user?.role === ROLES.BUYER || !user ? (
            <Link href="/sell" className={navLinkClasses}>
              Sell
            </Link>
          ) : null}

          {user ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link href="/account">Account</Link>
              </Button>
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" size="sm">
                  Log out
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </nav>
      </Container>
    </header>
  );
};

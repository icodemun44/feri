import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@feri/shared";
import { Container } from "@feri/ui";
import { Logo } from "./logo";

export const SiteFooter = () => (
  <footer className="mt-16 border-t border-line bg-surface">
    <Container className="flex flex-col gap-8 py-10 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex max-w-xs flex-col gap-3">
        <Logo />
        <p className="text-sm text-muted">{APP_TAGLINE}</p>
      </div>
      <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
        <Link href="/products" className="text-body hover:text-primary">
          Browse
        </Link>
        <Link href="/sell" className="text-body hover:text-primary">
          Become a seller
        </Link>
        <Link href="/login" className="text-body hover:text-primary">
          Log in
        </Link>
        <Link href="/signup" className="text-body hover:text-primary">
          Sign up
        </Link>
      </nav>
    </Container>
    <div className="border-t border-line py-4 text-center text-xs text-muted">
      {new Date().getFullYear()} {APP_NAME}. All rights reserved.
    </div>
  </footer>
);

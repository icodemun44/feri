import { cache } from "react";
import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@feri/shared";
import { Container } from "@feri/ui";
import { catalogService } from "@/modules/catalog/catalog.service";
import type { CategorySummary } from "@/modules/catalog/catalog.types";
import { describeError, logger } from "@/server/logger";
import { Logo } from "./logo";

const BRAND_WORD_IN_NEPALI = "फेरि";

const listCategoriesOrEmpty = cache(async (): Promise<CategorySummary[]> => {
  try {
    return await catalogService.listCategories();
  } catch (error) {
    logger.error("Could not load footer categories", describeError(error));
    return [];
  }
});

const linkClasses = "text-taupe transition-colors hover:text-white";

const FooterLinkGroup = ({ heading, children }: { heading: string; children: React.ReactNode }) => (
  <nav aria-label={heading} className="flex flex-col gap-3">
    <p className="font-semibold text-white">{heading}</p>
    <ul className="flex flex-col gap-2 text-sm">{children}</ul>
  </nav>
);

export const SiteFooter = async () => {
  const categories = await listCategoriesOrEmpty();

  return (
    <footer className="relative mt-20 overflow-hidden bg-primary text-taupe">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 right-0 select-none font-display text-[9rem] font-semibold leading-none text-white/[0.06] sm:-bottom-16 sm:right-6 sm:text-[15rem]"
      >
        {BRAND_WORD_IN_NEPALI}
      </span>

      <Container className="relative flex flex-col gap-12 pb-10 pt-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex max-w-xs flex-col gap-4">
            <Logo tone="light" />
            <p className="text-base leading-relaxed text-white/80">{APP_TAGLINE}</p>
          </div>

          <FooterLinkGroup heading="Shop">
            <li>
              <Link href="/products" className={linkClasses}>
                Everything
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/products?category=${category.slug}`} className={linkClasses}>
                  {category.name}
                </Link>
              </li>
            ))}
          </FooterLinkGroup>

          <FooterLinkGroup heading="Sell with us">
            <li>
              <Link href="/sell" className={linkClasses}>
                How selling works
              </Link>
            </li>
            <li>
              <Link href="/sell/apply" className={linkClasses}>
                Apply to sell
              </Link>
            </li>
          </FooterLinkGroup>

          <FooterLinkGroup heading="Your account">
            <li>
              <Link href="/login" className={linkClasses}>
                Log in
              </Link>
            </li>
            <li>
              <Link href="/signup" className={linkClasses}>
                Create an account
              </Link>
            </li>
          </FooterLinkGroup>
        </div>

        <div className="flex flex-col gap-1 border-t border-white/15 pt-6 text-sm sm:flex-row sm:justify-between">
          <p>
            {new Date().getFullYear()} {APP_NAME}
          </p>
          <p>Prices in rupees. Pay when your order arrives.</p>
        </div>
      </Container>
    </footer>
  );
};

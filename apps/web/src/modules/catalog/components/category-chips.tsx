import Link from "next/link";
import { cn } from "@feri/ui";
import type { CategorySummary } from "../catalog.types";
import { CategoryIcon } from "./category-icon";

type CategoryChipsProps = {
  categories: readonly CategorySummary[];
  activeCategorySlug?: string | undefined;
};

const chipClasses =
  "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors";

export const CategoryChips = ({ categories, activeCategorySlug }: CategoryChipsProps) => (
  <nav aria-label="Categories">
    <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <li>
        <Link
          href="/products"
          aria-current={activeCategorySlug ? undefined : "page"}
          className={cn(
            chipClasses,
            activeCategorySlug
              ? "border-line-strong bg-surface text-ink hover:bg-surface-muted"
              : "border-primary bg-primary text-white",
          )}
        >
          All
        </Link>
      </li>
      {categories.map((category) => {
        const isActive = category.slug === activeCategorySlug;
        return (
          <li key={category.id}>
            <Link
              href={`/products?category=${category.slug}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                chipClasses,
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-line-strong bg-surface text-ink hover:bg-surface-muted",
              )}
            >
              <CategoryIcon categorySlug={category.slug} aria-hidden="true" className="size-4" />
              {category.name}
            </Link>
          </li>
        );
      })}
    </ul>
  </nav>
);

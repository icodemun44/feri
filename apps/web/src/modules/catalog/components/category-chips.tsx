import Link from "next/link";
import type { CategorySummary } from "../catalog.types";
import { getCategoryChipClassName } from "./category-chip-styles";
import { CategoryIcon } from "./category-icon";

type CategoryChipsProps = {
  categories: readonly CategorySummary[];
  activeCategorySlug?: string | undefined;
};

export const CategoryChips = ({ categories, activeCategorySlug }: CategoryChipsProps) => (
  <nav aria-label="Categories">
    <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <li>
        <Link
          href="/products"
          aria-current={activeCategorySlug ? undefined : "page"}
          className={getCategoryChipClassName(!activeCategorySlug)}
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
              className={getCategoryChipClassName(isActive)}
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

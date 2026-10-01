"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { Alert, Button } from "@feri/ui";
import type { CategorySummary, ProductCardView } from "../catalog.types";
import { getCategoryChipClassName } from "./category-chip-styles";
import { CategoryIcon } from "./category-icon";
import { ProductGrid } from "./product-grid";
import { ProductGridSkeleton } from "./product-grid-skeleton";

type CategoryProductShowcaseProps = {
  categories: readonly CategorySummary[];
  initialCategorySlug: string | undefined;
  initialProducts: ProductCardView[];
};

type ProductListResponse = { products: ProductCardView[] };

const ALL_CATEGORIES_KEY = "all";
const BACKGROUND_PRELOAD_DELAY_MS = 1200;
const DEFAULT_HEADING = "Fresh finds";

const toCacheKey = (categorySlug: string | undefined): string => categorySlug ?? ALL_CATEGORIES_KEY;

const buildHomeHref = (categorySlug: string | undefined): string =>
  categorySlug ? `/?category=${categorySlug}` : "/";

const isProductListResponse = (body: unknown): body is ProductListResponse =>
  typeof body === "object" && body !== null && "products" in body && Array.isArray(body.products);

const fetchProducts = async (categorySlug: string | undefined): Promise<ProductCardView[]> => {
  const query = categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : "";
  const response = await fetch(`/api/products${query}`);
  if (!response.ok) {
    throw new Error("Could not load products");
  }
  const body: unknown = await response.json();
  if (!isProductListResponse(body)) {
    throw new Error("Unexpected response");
  }
  return body.products;
};

export const CategoryProductShowcase = ({
  categories,
  initialCategorySlug,
  initialProducts,
}: CategoryProductShowcaseProps) => {
  const [activeSlug, setActiveSlug] = useState(initialCategorySlug);
  const [productsByKey, setProductsByKey] = useState<Record<string, ProductCardView[]>>({
    [toCacheKey(initialCategorySlug)]: initialProducts,
  });
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const requestedKeys = useRef(new Set<string>([toCacheKey(initialCategorySlug)]));

  const activeKey = toCacheKey(activeSlug);
  const activeProducts = productsByKey[activeKey];
  const hasFailed = failedKey === activeKey;
  const activeCategory = categories.find((category) => category.slug === activeSlug);

  const loadProducts = useCallback(async (categorySlug: string | undefined): Promise<void> => {
    const cacheKey = toCacheKey(categorySlug);
    if (requestedKeys.current.has(cacheKey)) {
      return;
    }
    requestedKeys.current.add(cacheKey);
    try {
      const products = await fetchProducts(categorySlug);
      setProductsByKey((currentProducts) => ({ ...currentProducts, [cacheKey]: products }));
    } catch {
      requestedKeys.current.delete(cacheKey);
      setFailedKey(cacheKey);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      categories.forEach((category) => void loadProducts(category.slug));
      void loadProducts(undefined);
    }, BACKGROUND_PRELOAD_DELAY_MS);
    return () => window.clearTimeout(timerId);
  }, [categories, loadProducts]);

  const selectCategory = (
    event: MouseEvent<HTMLAnchorElement>,
    categorySlug: string | undefined,
  ) => {
    const isPlainLeftClick =
      event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    if (!isPlainLeftClick) {
      return;
    }
    event.preventDefault();
    setActiveSlug(categorySlug);
    setFailedKey(null);
    window.history.replaceState(null, "", buildHomeHref(categorySlug));
    void loadProducts(categorySlug);
  };

  const retryLoading = (): void => {
    setFailedKey(null);
    void loadProducts(activeSlug);
  };

  const preloadCategory = (categorySlug: string | undefined): void => {
    void loadProducts(categorySlug);
  };

  return (
    <>
      <nav aria-label="Categories">
        <ul
          aria-busy={!activeProducts && !hasFailed}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          <li>
            <a
              href={buildHomeHref(undefined)}
              aria-current={activeSlug ? undefined : "true"}
              className={getCategoryChipClassName(!activeSlug)}
              onClick={(event) => selectCategory(event, undefined)}
              onMouseEnter={() => preloadCategory(undefined)}
              onFocus={() => preloadCategory(undefined)}
            >
              All
            </a>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <a
                href={buildHomeHref(category.slug)}
                aria-current={category.slug === activeSlug ? "true" : undefined}
                className={getCategoryChipClassName(category.slug === activeSlug)}
                onClick={(event) => selectCategory(event, category.slug)}
                onMouseEnter={() => preloadCategory(category.slug)}
                onFocus={() => preloadCategory(category.slug)}
              >
                <CategoryIcon categorySlug={category.slug} aria-hidden="true" className="size-4" />
                {category.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="latest-heading" className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <h2 id="latest-heading" aria-live="polite" className="text-2xl">
            {activeCategory?.name ?? DEFAULT_HEADING}
          </h2>
          <Link
            href={activeSlug ? `/products?category=${activeSlug}` : "/products"}
            className="text-sm font-semibold text-primary underline underline-offset-4"
          >
            See everything
          </Link>
        </div>

        {hasFailed ? (
          <Alert tone="danger" title="We could not load these products">
            <Button size="sm" variant="secondary" onClick={retryLoading} className="mt-2">
              Try again
            </Button>
          </Alert>
        ) : activeProducts ? (
          <ProductGrid
            products={activeProducts}
            emptyTitle={activeCategory ? `Nothing in ${activeCategory.name} yet` : undefined}
          />
        ) : (
          <ProductGridSkeleton />
        )}
      </section>
    </>
  );
};

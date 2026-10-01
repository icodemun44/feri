import type { Metadata } from "next";
import { Button, Container, Select } from "@feri/ui";
import { productListQuerySchema, PRODUCT_SORT_OPTIONS } from "@feri/validation";
import { PageHeading } from "@/components/layout/page-heading";
import { Pagination } from "@/components/layout/pagination";
import { catalogService } from "@/modules/catalog/catalog.service";
import { CategoryChips } from "@/modules/catalog/components/category-chips";
import { ProductGrid } from "@/modules/catalog/components/product-grid";

export const metadata: Metadata = { title: "Browse" };

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const ProductsPage = async ({ searchParams }: ProductsPageProps) => {
  const query = productListQuerySchema.parse(await searchParams);
  const [categories, results] = await Promise.all([
    catalogService.listCategories(),
    catalogService.searchProducts(query),
  ]);
  const hasFilters = Boolean(query.q || query.category);

  return (
    <Container className="py-8">
      <PageHeading
        title="Browse"
        description={`${results.totalItems} ${results.totalItems === 1 ? "item" : "items"} available`}
      />

      <div className="mb-8 flex flex-col gap-5">
        <CategoryChips categories={categories} activeCategorySlug={query.category || undefined} />

        <form action="/products" method="get" className="flex flex-wrap items-center gap-3">
          {query.category ? <input type="hidden" name="category" value={query.category} /> : null}
          {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
          {query.q ? (
            <p className="mr-auto text-sm text-muted">
              Results for <span className="font-semibold text-ink">{query.q}</span>
            </p>
          ) : null}
          <div className="ml-auto flex items-center gap-3">
            <label htmlFor="products-sort" className="sr-only">
              Sort by
            </label>
            <Select id="products-sort" name="sort" defaultValue={query.sort}>
              <option value={PRODUCT_SORT_OPTIONS.NEWEST}>Newest first</option>
              <option value={PRODUCT_SORT_OPTIONS.PRICE_ASCENDING}>Price: low to high</option>
              <option value={PRODUCT_SORT_OPTIONS.PRICE_DESCENDING}>Price: high to low</option>
            </Select>
            <Button type="submit" variant="secondary">
              Sort
            </Button>
          </div>
        </form>
      </div>

      <ProductGrid
        products={results.items}
        emptyTitle={hasFilters ? "No matches" : "Nothing here yet"}
        emptyDescription={
          hasFilters
            ? "Try a different search or clear the filters to see everything."
            : "New finds are listed every day. Check back soon."
        }
      />

      <Pagination
        basePath="/products"
        page={results.page}
        totalPages={results.totalPages}
        queryParameters={{
          q: query.q,
          category: query.category,
          sort: query.sort === PRODUCT_SORT_OPTIONS.NEWEST ? undefined : query.sort,
        }}
      />
    </Container>
  );
};

export default ProductsPage;

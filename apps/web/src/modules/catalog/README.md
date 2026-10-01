# catalog

**Purpose:** read-only access to what buyers browse: categories and products.

**Structure**

- `catalog.types.ts` - view models (`ProductCardView`, `ProductDetailView`, `CategorySummary`).
- `catalog.repository.ts` - Prisma queries. Filtering, sorting, searching and counting all happen in the database.
- `catalog.service.ts` - maps rows to view models and builds public image URLs.
- `catalog.constants.ts` - condition labels and category icons.
- `components/` - `ProductCard`, `ProductGrid`, `CategoryChips` (links, used on the browse page), `CategoryProductShowcase` (home page, switches categories in place), `ProductGridSkeleton`.

**Funnel**

- User flow: home page shows the latest finds -> pick a category or search -> open a product -> (cart and checkout arrive in a later module).
- Home page: tapping a category chip swaps the product grid in place. The highlight moves immediately, the address bar updates (`/?category=clothes`) without a page change, and a skeleton shows only for categories not loaded yet.
- Technical flow: page -> `catalogService` -> `catalogRepository` -> database. The in-place switch fetches `GET /api/products?category=<slug>`. Pages pass URL query parameters through `productListQuerySchema`, which falls back to safe defaults for bad input.

**Non-obvious rationale**

- A product is only listed when it is `ACTIVE`, has stock, and its seller is `ACTIVE`. Suspending a seller hides their listings immediately.
- Product detail also shows `SOLD` items (marked as sold) so old links keep working.
- Product images are stored in Supabase Storage and only the storage path is saved in the database. The public URL is built at read time.
- Prices are whole paisa integers; `formatPaisa` in `@feri/shared` is the only place they are formatted for display.
- `CategoryProductShowcase` keeps each loaded category in memory, so going back to one is instant. It preloads the other categories shortly after the first render and when a chip is hovered or focused. The first category is rendered on the server, so reloading or sharing a `/?category=...` link shows the right grid with no extra request. Chips stay real links, so they still work without JavaScript and in new tabs.

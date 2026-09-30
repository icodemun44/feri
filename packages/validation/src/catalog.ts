import { z } from "zod";

export const PRODUCT_SORT_OPTIONS = {
  NEWEST: "newest",
  PRICE_ASCENDING: "price-asc",
  PRICE_DESCENDING: "price-desc",
} as const;

export type ProductSortOption = (typeof PRODUCT_SORT_OPTIONS)[keyof typeof PRODUCT_SORT_OPTIONS];

const MAX_SEARCH_LENGTH = 80;
const MAX_CATEGORY_SLUG_LENGTH = 60;

export const productListQuerySchema = z.object({
  q: z.string().trim().max(MAX_SEARCH_LENGTH).catch("").optional(),
  category: z.string().trim().max(MAX_CATEGORY_SLUG_LENGTH).catch("").optional(),
  sort: z
    .enum([
      PRODUCT_SORT_OPTIONS.NEWEST,
      PRODUCT_SORT_OPTIONS.PRICE_ASCENDING,
      PRODUCT_SORT_OPTIONS.PRICE_DESCENDING,
    ])
    .catch(PRODUCT_SORT_OPTIONS.NEWEST),
  page: z.coerce.number().int().positive().catch(1),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

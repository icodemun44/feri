import "server-only";
import { prisma, type Prisma, ProductStatus, SellerStatus, type DbClient } from "@feri/database";
import type { PaginationWindow } from "@feri/shared";
import { PRODUCT_SORT_OPTIONS, type ProductSortOption } from "@feri/validation";
import type { CategorySummary } from "./catalog.types";

const productCardSelection = {
  id: true,
  title: true,
  priceMinor: true,
  condition: true,
  reviewStatus: true,
  category: { select: { name: true, slug: true } },
  seller: { select: { businessName: true } },
  images: { orderBy: { position: "asc" }, take: 1, select: { storagePath: true, altText: true } },
} satisfies Prisma.ProductSelect;

const productDetailSelection = {
  id: true,
  title: true,
  description: true,
  priceMinor: true,
  condition: true,
  brand: true,
  size: true,
  status: true,
  reviewStatus: true,
  category: { select: { name: true, slug: true } },
  seller: { select: { id: true, businessName: true, city: true, approvedAt: true } },
  images: { orderBy: { position: "asc" }, select: { storagePath: true, altText: true } },
} satisfies Prisma.ProductSelect;

export type ProductCardRow = Prisma.ProductGetPayload<{ select: typeof productCardSelection }>;
export type ProductDetailRow = Prisma.ProductGetPayload<{ select: typeof productDetailSelection }>;

const PUBLICLY_VISIBLE_STATUSES = [ProductStatus.ACTIVE, ProductStatus.SOLD];

const ORDER_BY_SORT_OPTION: Record<ProductSortOption, Prisma.ProductOrderByWithRelationInput> = {
  [PRODUCT_SORT_OPTIONS.NEWEST]: { publishedAt: "desc" },
  [PRODUCT_SORT_OPTIONS.PRICE_ASCENDING]: { priceMinor: "asc" },
  [PRODUCT_SORT_OPTIONS.PRICE_DESCENDING]: { priceMinor: "desc" },
};

type ProductSearchInput = {
  searchText: string | undefined;
  categorySlug: string | undefined;
  sort: ProductSortOption;
  window: PaginationWindow;
};

const buildProductFilter = ({
  searchText,
  categorySlug,
}: Pick<ProductSearchInput, "searchText" | "categorySlug">): Prisma.ProductWhereInput => ({
  status: ProductStatus.ACTIVE,
  quantity: { gt: 0 },
  seller: { status: SellerStatus.ACTIVE },
  ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  ...(searchText
    ? {
        OR: [
          { title: { contains: searchText, mode: "insensitive" } },
          { brand: { contains: searchText, mode: "insensitive" } },
          { description: { contains: searchText, mode: "insensitive" } },
        ],
      }
    : {}),
});

const listActiveCategories = (db: DbClient = prisma): Promise<CategorySummary[]> =>
  db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true, description: true },
  });

const searchProducts = async (
  input: ProductSearchInput,
  db: DbClient = prisma,
): Promise<{ rows: ProductCardRow[]; totalItems: number }> => {
  const where = buildProductFilter(input);
  const [rows, totalItems] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: ORDER_BY_SORT_OPTION[input.sort],
      skip: input.window.skip,
      take: input.window.take,
      select: productCardSelection,
    }),
    db.product.count({ where }),
  ]);
  return { rows, totalItems };
};

const findVisibleProductById = (
  id: string,
  db: DbClient = prisma,
): Promise<ProductDetailRow | null> =>
  db.product.findFirst({
    where: {
      id,
      status: { in: PUBLICLY_VISIBLE_STATUSES },
      seller: { status: SellerStatus.ACTIVE },
    },
    select: productDetailSelection,
  });

export const catalogRepository = { listActiveCategories, searchProducts, findVisibleProductById };

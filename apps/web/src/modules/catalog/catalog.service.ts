import "server-only";
import { buildPaginatedResult, resolvePaginationWindow, type PaginatedResult } from "@feri/shared";
import { ProductStatus } from "@feri/database";
import { PRODUCT_SORT_OPTIONS, uuidField, type ProductListQuery } from "@feri/validation";
import { getEnv } from "@/server/env";
import {
  catalogRepository,
  type ProductCardRow,
  type ProductDetailRow,
} from "./catalog.repository";
import type {
  CategorySummary,
  ProductCardView,
  ProductDetailView,
  ProductImageView,
} from "./catalog.types";

const PRODUCT_IMAGE_BUCKET = "product-images";
const LATEST_PRODUCT_COUNT = 8;

const buildImageUrl = (storagePath: string): string =>
  `${getEnv().NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${storagePath}`;

const toProductCardView = (row: ProductCardRow): ProductCardView => {
  const [firstImage] = row.images;
  return {
    id: row.id,
    title: row.title,
    priceMinor: row.priceMinor,
    condition: row.condition,
    categoryName: row.category.name,
    categorySlug: row.category.slug,
    sellerName: row.seller.businessName,
    imageUrl: firstImage ? buildImageUrl(firstImage.storagePath) : null,
    imageAlt: firstImage?.altText ?? row.title,
  };
};

const toProductDetailView = (row: ProductDetailRow): ProductDetailView => ({
  id: row.id,
  title: row.title,
  description: row.description,
  priceMinor: row.priceMinor,
  condition: row.condition,
  brand: row.brand,
  size: row.size,
  isSold: row.status === ProductStatus.SOLD,
  categoryName: row.category.name,
  categorySlug: row.category.slug,
  images: row.images.map((image): ProductImageView => ({
    url: buildImageUrl(image.storagePath),
    alt: image.altText ?? row.title,
  })),
  seller: {
    id: row.seller.id,
    businessName: row.seller.businessName,
    city: row.seller.city,
    memberSince: row.seller.approvedAt,
  },
});

const listCategories = (): Promise<CategorySummary[]> => catalogRepository.listActiveCategories();

const searchProducts = async ({
  q,
  category,
  sort,
  page,
}: ProductListQuery): Promise<PaginatedResult<ProductCardView>> => {
  const window = resolvePaginationWindow({ page });
  const { rows, totalItems } = await catalogRepository.searchProducts({
    searchText: q || undefined,
    categorySlug: category || undefined,
    sort,
    window,
  });
  return buildPaginatedResult(rows.map(toProductCardView), totalItems, window);
};

const listLatestProducts = async (): Promise<ProductCardView[]> => {
  const window = resolvePaginationWindow({ pageSize: LATEST_PRODUCT_COUNT });
  const { rows } = await catalogRepository.searchProducts({
    searchText: undefined,
    categorySlug: undefined,
    sort: PRODUCT_SORT_OPTIONS.NEWEST,
    window,
  });
  return rows.map(toProductCardView);
};

const getProductDetail = async (productId: string): Promise<ProductDetailView | null> => {
  if (!uuidField.safeParse(productId).success) {
    return null;
  }
  const row = await catalogRepository.findVisibleProductById(productId);
  return row ? toProductDetailView(row) : null;
};

export const catalogService = {
  listCategories,
  searchProducts,
  listLatestProducts,
  getProductDetail,
};

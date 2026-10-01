import type { ProductCondition } from "@feri/database";

export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type ProductCardView = {
  id: string;
  title: string;
  priceMinor: number;
  condition: ProductCondition;
  categoryName: string;
  categorySlug: string;
  sellerName: string;
  isReviewed: boolean;
  imageUrl: string | null;
  imageAlt: string;
};

export type ProductImageView = {
  url: string;
  alt: string;
};

export type ProductDetailView = {
  id: string;
  title: string;
  description: string;
  priceMinor: number;
  condition: ProductCondition;
  brand: string | null;
  size: string | null;
  isSold: boolean;
  isReviewed: boolean;
  categoryName: string;
  categorySlug: string;
  images: ProductImageView[];
  seller: {
    id: string;
    userId: string;
    slug: string;
    businessName: string;
    city: string;
    memberSince: Date;
  };
};

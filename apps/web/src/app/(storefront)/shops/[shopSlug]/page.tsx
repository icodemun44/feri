import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Store } from "lucide-react";
import { Container } from "@feri/ui";
import { Pagination } from "@/components/layout/pagination";
import { StarRating } from "@/components/shared/star-rating";
import { formatDate } from "@/lib/format";
import { catalogService } from "@/modules/catalog/catalog.service";
import { ProductGrid } from "@/modules/catalog/components/product-grid";
import { ReviewList } from "@/modules/reviews/components/review-list";
import { reviewService } from "@/modules/reviews/review.service";
import { sellerService } from "@/modules/sellers/seller.service";

const SHOP_REVIEW_COUNT = 20;

type ShopPageProps = {
  params: Promise<{ shopSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const parsePage = (value: string | string[] | undefined): number | undefined => {
  const page = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isInteger(page) ? page : undefined;
};

export const generateMetadata = async ({ params }: ShopPageProps): Promise<Metadata> => {
  const { shopSlug } = await params;
  const shop = await sellerService.findPublicShop(shopSlug);
  return { title: shop?.businessName ?? "Shop not found" };
};

const ShopPage = async ({ params, searchParams }: ShopPageProps) => {
  const { shopSlug } = await params;
  const page = parsePage((await searchParams)["page"]);
  const shop = await sellerService.findPublicShop(shopSlug);
  if (!shop) {
    notFound();
  }

  const [products, rating, reviews] = await Promise.all([
    catalogService.listSellerProducts(shop.id, page),
    reviewService.summarizeSeller(shop.id),
    reviewService.listRecentForSeller(shop.id, SHOP_REVIEW_COUNT),
  ]);

  return (
    <Container className="flex flex-col gap-12 py-8">
      <header className="flex items-start gap-5">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Store aria-hidden="true" className="size-7" />
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl sm:text-4xl">{shop.businessName}</h1>
          <p className="text-sm text-muted">
            {shop.city} - selling since {formatDate(shop.approvedAt)}
          </p>
          {rating.average === null ? (
            <p className="text-sm text-muted">No reviews yet</p>
          ) : (
            <StarRating rating={rating.average} reviewCount={rating.count} />
          )}
          <p className="mt-2 max-w-2xl whitespace-pre-line text-body">{shop.description}</p>
        </div>
      </header>

      <section aria-labelledby="shop-items-heading">
        <h2 id="shop-items-heading" className="mb-5 text-2xl">
          Available now
          <span className="ml-2 text-base font-normal text-muted">({products.totalItems})</span>
        </h2>
        <ProductGrid
          products={products.items}
          emptyTitle="Nothing for sale right now"
          emptyDescription="This shop has no items listed at the moment. Check back soon."
        />
        <Pagination
          basePath={`/shops/${shop.slug}`}
          page={products.page}
          totalPages={products.totalPages}
          queryParameters={{}}
        />
      </section>

      <section aria-labelledby="shop-reviews-heading" className="max-w-3xl">
        <h2 id="shop-reviews-heading" className="mb-5 text-2xl">
          Reviews
        </h2>
        <ReviewList reviews={reviews} emptyMessage="This shop has no reviews yet." />
      </section>
    </Container>
  );
};

export default ShopPage;

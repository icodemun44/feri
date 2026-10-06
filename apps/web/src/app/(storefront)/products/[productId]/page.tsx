import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Store } from "lucide-react";
import { formatPaisa, hasPermission, PERMISSIONS, type Role } from "@feri/shared";
import { Alert, Badge, Button, Card, CardContent, Container } from "@feri/ui";
import { StarRating } from "@/components/shared/star-rating";
import { formatDate } from "@/lib/format";
import { ReviewList } from "@/modules/reviews/components/review-list";
import { reviewService } from "@/modules/reviews/review.service";
import { AddToCartButton } from "@/modules/cart/components/add-to-cart-button";
import { cartService } from "@/modules/cart/cart.service";
import { getCurrentUser } from "@/server/auth/session";
import { catalogService } from "@/modules/catalog/catalog.service";
import { PRODUCT_CONDITION_LABELS } from "@/modules/catalog/catalog.constants";
import { CategoryIcon } from "@/modules/catalog/components/category-icon";

type ProductPageProps = {
  params: Promise<{ productId: string }>;
};

export const generateMetadata = async ({ params }: ProductPageProps): Promise<Metadata> => {
  const { productId } = await params;
  const product = await catalogService.getProductDetail(productId);
  return { title: product?.title ?? "Product not found" };
};

type PurchaseAreaProps = {
  productId: string;
  isSold: boolean;
  isOwnListing: boolean;
  userRole: Role | undefined;
  isInCart: boolean;
};

const PurchaseArea = ({
  productId,
  isSold,
  isOwnListing,
  userRole,
  isInCart,
}: PurchaseAreaProps) => {
  if (isSold) {
    return (
      <Button size="lg" disabled>
        This item has been sold
      </Button>
    );
  }
  if (!userRole) {
    return (
      <Button asChild size="lg">
        <Link href={`/login?next=${encodeURIComponent(`/products/${productId}`)}`}>
          Log in to buy
        </Link>
      </Button>
    );
  }
  if (isOwnListing) {
    return <Alert tone="info">This is your own listing.</Alert>;
  }
  if (!hasPermission(userRole, PERMISSIONS.ORDER_PLACE)) {
    return <Alert tone="info">Only buyer accounts can place orders.</Alert>;
  }
  return <AddToCartButton productId={productId} isInCart={isInCart} />;
};

const ProductPage = async ({ params }: ProductPageProps) => {
  const { productId } = await params;
  const product = await catalogService.getProductDetail(productId);
  if (!product) {
    notFound();
  }
  const user = await getCurrentUser();
  const [isInCart, sellerRating, recentReviews] = await Promise.all([
    cartService.isInCart(user, product.id),
    reviewService.summarizeSeller(product.seller.id),
    reviewService.listRecentForSeller(product.seller.id),
  ]);

  const [primaryImage] = product.images;

  return (
    <Container className="py-8">
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Back to browse
      </Link>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col gap-3">
          <div className="aspect-square overflow-hidden rounded-2xl border border-line bg-surface-muted">
            {primaryImage ? (
              <img
                src={primaryImage.url}
                alt={primaryImage.alt}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-taupe">
                <CategoryIcon
                  categorySlug={product.categorySlug}
                  aria-hidden="true"
                  className="size-24"
                  strokeWidth={1}
                />
              </div>
            )}
          </div>
          {product.images.length > 1 ? (
            <ul className="grid grid-cols-5 gap-2">
              {product.images.slice(1).map((image) => (
                <li
                  key={image.url}
                  className="aspect-square overflow-hidden rounded-lg border border-line"
                >
                  <img src={image.url} alt={image.alt} className="size-full object-cover" />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary">{PRODUCT_CONDITION_LABELS[product.condition]}</Badge>
            <Badge>{product.categoryName}</Badge>
            {product.isSold ? <Badge tone="danger">Sold</Badge> : null}
          </div>

          <h1 className="text-3xl sm:text-4xl">{product.title}</h1>
          <p className="text-3xl font-semibold text-ink">{formatPaisa(product.priceMinor)}</p>

          <dl className="grid grid-cols-2 gap-4 text-sm">
            {product.brand ? (
              <div>
                <dt className="text-muted">Brand</dt>
                <dd className="font-semibold text-ink">{product.brand}</dd>
              </div>
            ) : null}
            {product.size ? (
              <div>
                <dt className="text-muted">Size</dt>
                <dd className="font-semibold text-ink">{product.size}</dd>
              </div>
            ) : null}
          </dl>

          {product.isReviewed ? (
            <Alert tone="success" title="Checked by Feri Nepal">
              Our team has looked at the photos and details of this listing.
            </Alert>
          ) : (
            <Alert tone="info" title="Not checked yet">
              This listing is live, but our team has not looked at it yet. Read the details and
              photos closely. You pay only when it arrives.
            </Alert>
          )}

          <p className="whitespace-pre-line text-body">{product.description}</p>

          <PurchaseArea
            productId={product.id}
            isSold={product.isSold}
            isOwnListing={user?.id === product.seller.userId}
            userRole={user?.role}
            isInCart={isInCart}
          />

          <Card>
            <CardContent className="flex items-center gap-4">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Store aria-hidden="true" className="size-5" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Link
                  href={`/shops/${product.seller.slug}`}
                  className="font-semibold text-ink underline-offset-4 hover:text-primary hover:underline"
                >
                  {product.seller.businessName}
                </Link>
                <p className="text-sm text-muted">
                  {product.seller.city} - selling since {formatDate(product.seller.memberSince)}
                </p>
                {sellerRating.average === null ? (
                  <p className="text-sm text-muted">No reviews yet</p>
                ) : (
                  <StarRating rating={sellerRating.average} reviewCount={sellerRating.count} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <section aria-labelledby="seller-reviews-heading" className="mt-12 max-w-3xl">
        <h2 id="seller-reviews-heading" className="mb-4 text-2xl">
          What buyers say about this seller
        </h2>
        <ReviewList reviews={recentReviews} emptyMessage="This seller has no reviews yet." />
        {sellerRating.count > recentReviews.length ? (
          <Link
            href={`/shops/${product.seller.slug}`}
            className="mt-4 inline-block text-sm font-semibold text-primary"
          >
            See all {sellerRating.count} reviews
          </Link>
        ) : null}
      </section>
    </Container>
  );
};

export default ProductPage;

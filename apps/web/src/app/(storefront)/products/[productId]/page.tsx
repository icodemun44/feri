import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Store } from "lucide-react";
import { formatPaisa } from "@feri/shared";
import { Badge, Button, Card, CardContent, Container } from "@feri/ui";
import { formatDate } from "@/lib/format";
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

const ProductPage = async ({ params }: ProductPageProps) => {
  const { productId } = await params;
  const product = await catalogService.getProductDetail(productId);
  if (!product) {
    notFound();
  }

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

          <p className="whitespace-pre-line text-body">{product.description}</p>

          <div className="flex flex-col gap-2">
            <Button size="lg" variant="accent" disabled>
              Buy with cash on delivery
            </Button>
            <p className="text-xs text-muted">Checkout opens in the next release.</p>
          </div>

          <Card>
            <CardContent className="flex items-center gap-4">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Store aria-hidden="true" className="size-5" />
              </span>
              <div className="flex flex-col">
                <p className="font-semibold text-ink">{product.seller.businessName}</p>
                <p className="text-sm text-muted">
                  {product.seller.city} - selling since {formatDate(product.seller.memberSince)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default ProductPage;

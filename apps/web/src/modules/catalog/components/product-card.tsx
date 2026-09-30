import Link from "next/link";
import { formatPaisa } from "@feri/shared";
import { Badge } from "@feri/ui";
import { PRODUCT_CONDITION_LABELS } from "../catalog.constants";
import type { ProductCardView } from "../catalog.types";
import { CategoryIcon } from "./category-icon";

export const ProductCard = ({ product }: { product: ProductCardView }) => {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col gap-3 rounded-xl focus-visible:outline-offset-4"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl border border-line bg-surface-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.imageAlt}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-taupe">
            <CategoryIcon
              categorySlug={product.categorySlug}
              aria-hidden="true"
              className="size-14"
              strokeWidth={1.25}
            />
          </div>
        )}
        <Badge tone="neutral" className="absolute left-3 top-3 bg-surface text-ink">
          {PRODUCT_CONDITION_LABELS[product.condition]}
        </Badge>
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-lg font-semibold text-ink">{formatPaisa(product.priceMinor)}</p>
        <p className="line-clamp-1 text-sm text-body group-hover:underline">{product.title}</p>
        <p className="line-clamp-1 text-xs text-muted">{product.sellerName}</p>
      </div>
    </Link>
  );
};

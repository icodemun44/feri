import { PackageSearch } from "lucide-react";
import { EmptyState } from "@feri/ui";
import type { ProductCardView } from "../catalog.types";
import { ProductCard } from "./product-card";

type ProductGridProps = {
  products: readonly ProductCardView[];
  emptyTitle?: string;
  emptyDescription?: string;
};

export const ProductGrid = ({
  products,
  emptyTitle = "Nothing here yet",
  emptyDescription = "New finds are listed every day. Check back soon.",
}: ProductGridProps) => {
  if (products.length === 0) {
    return <EmptyState icon={PackageSearch} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
};

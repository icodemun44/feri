import {
  Footprints,
  Package,
  Shirt,
  ShoppingBag,
  Smartphone,
  Watch,
  type LucideProps,
} from "lucide-react";

type CategoryIconProps = LucideProps & {
  categorySlug: string;
};

export const CategoryIcon = ({ categorySlug, ...iconProps }: CategoryIconProps) => {
  switch (categorySlug) {
    case "clothes":
      return <Shirt {...iconProps} />;
    case "shoes":
      return <Footprints {...iconProps} />;
    case "watches":
      return <Watch {...iconProps} />;
    case "bags":
      return <ShoppingBag {...iconProps} />;
    case "tech":
      return <Smartphone {...iconProps} />;
    default:
      return <Package {...iconProps} />;
  }
};

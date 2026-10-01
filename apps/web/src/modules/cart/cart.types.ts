export type CartLine = {
  productId: string;
  title: string;
  priceMinor: number;
  categorySlug: string;
  imageUrl: string | null;
  sellerId: string;
  sellerUserId: string;
  sellerName: string;
  isAvailable: boolean;
};

export type CartSellerGroup = {
  sellerId: string;
  sellerName: string;
  lines: CartLine[];
  subtotalMinor: number;
  deliveryFeeMinor: number;
  totalMinor: number;
};

export type CartView = {
  groups: CartSellerGroup[];
  unavailableLines: CartLine[];
  availableItemCount: number;
  grandTotalMinor: number;
};

export type AddableProduct = {
  id: string;
  isAvailable: boolean;
  sellerUserId: string;
};

import type {
  OrderStatus as SharedOrderStatus,
  ProductReviewStatus as SharedProductReviewStatus,
  ProductStatus as SharedProductStatus,
  Role as SharedRole,
  SellerApplicationStatus as SharedSellerApplicationStatus,
} from "@feri/shared";
import type {
  OrderStatus,
  ProductReviewStatus,
  ProductStatus,
  Role,
  SellerApplicationStatus,
} from "./generated/enums";

type AssertSameUnion<First, Second> = [First] extends [Second]
  ? [Second] extends [First]
    ? true
    : never
  : never;

export const enumParity: {
  role: AssertSameUnion<Role, SharedRole>;
  orderStatus: AssertSameUnion<OrderStatus, SharedOrderStatus>;
  productStatus: AssertSameUnion<ProductStatus, SharedProductStatus>;
  productReviewStatus: AssertSameUnion<ProductReviewStatus, SharedProductReviewStatus>;
  sellerApplicationStatus: AssertSameUnion<SellerApplicationStatus, SharedSellerApplicationStatus>;
} = {
  role: true,
  orderStatus: true,
  productStatus: true,
  productReviewStatus: true,
  sellerApplicationStatus: true,
};

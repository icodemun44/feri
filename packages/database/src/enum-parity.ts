import type {
  OrderStatus as SharedOrderStatus,
  Role as SharedRole,
  SellerApplicationStatus as SharedSellerApplicationStatus,
} from "@feri/shared";
import type { OrderStatus, Role, SellerApplicationStatus } from "./generated/enums";

type AssertSameUnion<First, Second> = [First] extends [Second]
  ? [Second] extends [First]
    ? true
    : never
  : never;

export const enumParity: {
  role: AssertSameUnion<Role, SharedRole>;
  orderStatus: AssertSameUnion<OrderStatus, SharedOrderStatus>;
  sellerApplicationStatus: AssertSameUnion<SellerApplicationStatus, SharedSellerApplicationStatus>;
} = {
  role: true,
  orderStatus: true,
  sellerApplicationStatus: true,
};

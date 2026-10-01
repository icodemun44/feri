"use server";

import { revalidatePath } from "next/cache";
import { PERMISSIONS, type ActionResult } from "@feri/shared";
import { orderTargetSchema, sellerCancelOrderSchema } from "@feri/validation";
import { runAction } from "@/server/actions/run-action";
import { parseFormData } from "@/server/actions/parse-form";
import { assertActionPermission } from "@/server/auth/guards";
import { orderFulfilmentService } from "./order-fulfilment.service";

const SELLER_ORDERS_PATH = "/seller/orders";

const revalidateOrderViews = (orderId: string): void => {
  revalidatePath(SELLER_ORDERS_PATH);
  revalidatePath(`${SELLER_ORDERS_PATH}/${orderId}`);
  revalidatePath("/seller");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
};

export const confirmOrderAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const seller = await assertActionPermission(PERMISSIONS.ORDER_FULFILL_OWN);
    const { orderId } = parseFormData(orderTargetSchema, formData);
    await orderFulfilmentService.confirm(seller, orderId);
    revalidateOrderViews(orderId);
  });

export const shipOrderAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const seller = await assertActionPermission(PERMISSIONS.ORDER_FULFILL_OWN);
    const { orderId } = parseFormData(orderTargetSchema, formData);
    await orderFulfilmentService.ship(seller, orderId);
    revalidateOrderViews(orderId);
  });

export const deliverOrderAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const seller = await assertActionPermission(PERMISSIONS.ORDER_FULFILL_OWN);
    const { orderId } = parseFormData(orderTargetSchema, formData);
    await orderFulfilmentService.markDelivered(seller, orderId);
    revalidateOrderViews(orderId);
  });

export const sellerCancelOrderAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const seller = await assertActionPermission(PERMISSIONS.ORDER_FULFILL_OWN);
    const input = parseFormData(sellerCancelOrderSchema, formData);
    await orderFulfilmentService.cancelBySeller(seller, input);
    revalidateOrderViews(input.orderId);
  });

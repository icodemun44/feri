"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PERMISSIONS, type ActionResult } from "@feri/shared";
import { checkoutSchema, orderTargetSchema } from "@feri/validation";
import { runAction } from "@/server/actions/run-action";
import { parseFormData } from "@/server/actions/parse-form";
import { assertActionPermission } from "@/server/auth/guards";
import { orderService } from "./order.service";

const ORDERS_PATH = "/orders";

export const placeOrderAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const buyer = await assertActionPermission(PERMISSIONS.ORDER_PLACE);
    const shipping = parseFormData(checkoutSchema, formData);
    const placedOrders = await orderService.placeFromCart(buyer, shipping);
    revalidatePath("/cart");
    revalidatePath(ORDERS_PATH);
    revalidatePath("/", "layout");
    redirect(`${ORDERS_PATH}?placed=${placedOrders.length}`);
  });

export const cancelOrderAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const buyer = await assertActionPermission(PERMISSIONS.ORDER_READ_OWN);
    const { orderId } = parseFormData(orderTargetSchema, formData);
    await orderService.cancelMine(buyer, orderId);
    revalidatePath(ORDERS_PATH);
    revalidatePath(`${ORDERS_PATH}/${orderId}`);
  });

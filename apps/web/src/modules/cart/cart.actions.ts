"use server";

import { revalidatePath } from "next/cache";
import { PERMISSIONS, type ActionResult } from "@feri/shared";
import { cartProductSchema } from "@feri/validation";
import { runAction } from "@/server/actions/run-action";
import { parseFormData } from "@/server/actions/parse-form";
import { assertActionPermission } from "@/server/auth/guards";
import { cartService } from "./cart.service";

const CART_PATH = "/cart";

export const addToCartAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const buyer = await assertActionPermission(PERMISSIONS.ORDER_PLACE);
    const { productId } = parseFormData(cartProductSchema, formData);
    await cartService.add(buyer, productId);
    revalidatePath(CART_PATH);
    revalidatePath("/", "layout");
  });

export const removeFromCartAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const buyer = await assertActionPermission(PERMISSIONS.ORDER_PLACE);
    const { productId } = parseFormData(cartProductSchema, formData);
    await cartService.remove(buyer, productId);
    revalidatePath(CART_PATH);
    revalidatePath("/", "layout");
  });

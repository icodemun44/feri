"use server";

import { revalidatePath } from "next/cache";
import { PERMISSIONS, type ActionResult } from "@feri/shared";
import { createReviewSchema, removeReviewSchema } from "@feri/validation";
import { runAction } from "@/server/actions/run-action";
import { parseFormData } from "@/server/actions/parse-form";
import { assertActionPermission } from "@/server/auth/guards";
import { reviewService } from "./review.service";

export const createReviewAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const buyer = await assertActionPermission(PERMISSIONS.REVIEW_CREATE);
    const input = parseFormData(createReviewSchema, formData);
    await reviewService.create(buyer, input);
    revalidatePath("/orders", "layout");
    revalidatePath("/products", "layout");
    revalidatePath("/shops", "layout");
  });

export const removeReviewAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const admin = await assertActionPermission(PERMISSIONS.REVIEW_MODERATE);
    const input = parseFormData(removeReviewSchema, formData);
    await reviewService.removeAsAdmin(admin, input);
    revalidatePath("/admin/reviews");
    revalidatePath("/shops", "layout");
    revalidatePath("/products", "layout");
  });

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PERMISSIONS, type ActionResult } from "@feri/shared";
import {
  approveSellerApplicationSchema,
  recordVerificationCallSchema,
  rejectSellerApplicationSchema,
  sellerApplicationTargetSchema,
  submitSellerApplicationSchema,
} from "@feri/validation";
import { runAction } from "@/server/actions/run-action";
import { parseFormData } from "@/server/actions/parse-form";
import { assertActionPermission } from "@/server/auth/guards";
import { sellerApplicationService } from "./seller-application.service";

const ADMIN_APPLICATIONS_PATH = "/admin/seller-applications";
const APPLICANT_STATUS_PATH = "/sell/status";

const revalidateAdminViews = (applicationId: string): void => {
  revalidatePath(ADMIN_APPLICATIONS_PATH);
  revalidatePath(`${ADMIN_APPLICATIONS_PATH}/${applicationId}`);
  revalidatePath("/admin");
};

export const submitSellerApplicationAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const applicant = await assertActionPermission(PERMISSIONS.SELLER_APPLY);
    const input = parseFormData(submitSellerApplicationSchema, formData);
    await sellerApplicationService.submit(applicant, input);
    revalidatePath(APPLICANT_STATUS_PATH);
    redirect(APPLICANT_STATUS_PATH);
  });

export const startSellerApplicationReviewAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const admin = await assertActionPermission(PERMISSIONS.SELLER_APPLICATION_REVIEW);
    const { applicationId } = parseFormData(sellerApplicationTargetSchema, formData);
    await sellerApplicationService.startReview(admin, applicationId);
    revalidateAdminViews(applicationId);
  });

export const recordVerificationCallAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const admin = await assertActionPermission(PERMISSIONS.SELLER_APPLICATION_REVIEW);
    const input = parseFormData(recordVerificationCallSchema, formData);
    await sellerApplicationService.recordVerificationCall(admin, input);
    revalidateAdminViews(input.applicationId);
  });

export const approveSellerApplicationAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const admin = await assertActionPermission(PERMISSIONS.SELLER_APPLICATION_REVIEW);
    const input = parseFormData(approveSellerApplicationSchema, formData);
    await sellerApplicationService.approve(admin, input);
    revalidateAdminViews(input.applicationId);
  });

export const rejectSellerApplicationAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const admin = await assertActionPermission(PERMISSIONS.SELLER_APPLICATION_REVIEW);
    const input = parseFormData(rejectSellerApplicationSchema, formData);
    await sellerApplicationService.reject(admin, input);
    revalidateAdminViews(input.applicationId);
  });

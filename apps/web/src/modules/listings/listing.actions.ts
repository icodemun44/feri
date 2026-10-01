"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PERMISSIONS, type ActionResult } from "@feri/shared";
import {
  listingFieldsSchema,
  listingTargetSchema,
  removeListingSchema,
  updateListingSchema,
} from "@feri/validation";
import { runAction } from "@/server/actions/run-action";
import { parseFormData } from "@/server/actions/parse-form";
import { assertActionPermission } from "@/server/auth/guards";
import { listingService } from "./listing.service";

const SELLER_LISTINGS_PATH = "/seller/listings";
const ADMIN_LISTINGS_PATH = "/admin/listings";

const revalidateSellerViews = (productId: string): void => {
  revalidatePath(SELLER_LISTINGS_PATH);
  revalidatePath(`${SELLER_LISTINGS_PATH}/${productId}`);
};

const revalidateAdminViews = (productId: string): void => {
  revalidatePath(ADMIN_LISTINGS_PATH);
  revalidatePath(`${ADMIN_LISTINGS_PATH}/${productId}`);
  revalidatePath("/admin");
};

export const createListingAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const seller = await assertActionPermission(PERMISSIONS.PRODUCT_MANAGE_OWN);
    const fields = parseFormData(listingFieldsSchema, formData);
    const listing = await listingService.create(seller, fields);
    revalidatePath(SELLER_LISTINGS_PATH);
    redirect(`${SELLER_LISTINGS_PATH}/${listing.id}`);
  });

export const updateListingAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const seller = await assertActionPermission(PERMISSIONS.PRODUCT_MANAGE_OWN);
    const input = parseFormData(updateListingSchema, formData);
    await listingService.update(seller, input);
    revalidateSellerViews(input.productId);
  });

export const publishListingAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const seller = await assertActionPermission(PERMISSIONS.PRODUCT_MANAGE_OWN);
    const { productId } = parseFormData(listingTargetSchema, formData);
    await listingService.publish(seller, productId);
    revalidateSellerViews(productId);
  });

export const unpublishListingAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const seller = await assertActionPermission(PERMISSIONS.PRODUCT_MANAGE_OWN);
    const { productId } = parseFormData(listingTargetSchema, formData);
    await listingService.unpublish(seller, productId);
    revalidateSellerViews(productId);
  });

export const markListingSoldAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const seller = await assertActionPermission(PERMISSIONS.PRODUCT_MANAGE_OWN);
    const { productId } = parseFormData(listingTargetSchema, formData);
    await listingService.markSold(seller, productId);
    revalidateSellerViews(productId);
  });

export const deleteListingAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const seller = await assertActionPermission(PERMISSIONS.PRODUCT_MANAGE_OWN);
    const { productId } = parseFormData(listingTargetSchema, formData);
    await listingService.deleteOwn(seller, productId);
    revalidatePath(SELLER_LISTINGS_PATH);
    redirect(SELLER_LISTINGS_PATH);
  });

export const approveListingAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const admin = await assertActionPermission(PERMISSIONS.PRODUCT_MODERATE);
    const { productId } = parseFormData(listingTargetSchema, formData);
    await listingService.approve(admin, productId);
    revalidateAdminViews(productId);
  });

export const removeListingAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const admin = await assertActionPermission(PERMISSIONS.PRODUCT_MODERATE);
    const input = parseFormData(removeListingSchema, formData);
    await listingService.removeAsAdmin(admin, input);
    revalidateAdminViews(input.productId);
  });

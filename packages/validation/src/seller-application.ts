import { z } from "zod";
import { emailField, nepalMobileField, optionalText, requiredText, uuidField } from "./common";

const MAX_BUSINESS_NAME_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 600;
const MIN_DESCRIPTION_LENGTH = 30;
const MAX_CITY_LENGTH = 60;
const MAX_NOTES_LENGTH = 1000;
const MAX_REASON_LENGTH = 500;

export const submitSellerApplicationSchema = z.object({
  businessName: requiredText("Shop name", MAX_BUSINESS_NAME_LENGTH),
  description: requiredText("Description", MAX_DESCRIPTION_LENGTH).refine(
    (value) => value.length >= MIN_DESCRIPTION_LENGTH,
    { message: `Tell us a little more (at least ${MIN_DESCRIPTION_LENGTH} characters)` },
  ),
  contactEmail: emailField,
  contactPhone: nepalMobileField,
  city: requiredText("City", MAX_CITY_LENGTH),
  primaryCategoryId: uuidField.optional(),
});

export const sellerApplicationTargetSchema = z.object({
  applicationId: uuidField,
});

export const recordVerificationCallSchema = z.object({
  applicationId: uuidField,
  notes: requiredText("Call notes", MAX_NOTES_LENGTH),
});

export const rejectSellerApplicationSchema = z.object({
  applicationId: uuidField,
  reason: requiredText("Reason", MAX_REASON_LENGTH),
});

export const approveSellerApplicationSchema = z.object({
  applicationId: uuidField,
  approvalNote: optionalText(MAX_REASON_LENGTH),
});

export type SubmitSellerApplicationInput = z.infer<typeof submitSellerApplicationSchema>;
export type SellerApplicationTargetInput = z.infer<typeof sellerApplicationTargetSchema>;
export type RecordVerificationCallInput = z.infer<typeof recordVerificationCallSchema>;
export type RejectSellerApplicationInput = z.infer<typeof rejectSellerApplicationSchema>;
export type ApproveSellerApplicationInput = z.infer<typeof approveSellerApplicationSchema>;

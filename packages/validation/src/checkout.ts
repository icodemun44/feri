import { z } from "zod";
import { nepalMobileField, optionalText, requiredText, uuidField } from "./common";

const MAX_NAME_LENGTH = 80;
const MAX_ADDRESS_LENGTH = 200;
const MAX_CITY_LENGTH = 60;
const MAX_DISTRICT_LENGTH = 60;
const MAX_DELIVERY_NOTES_LENGTH = 300;

export const checkoutSchema = z.object({
  fullName: requiredText("Full name", MAX_NAME_LENGTH),
  phone: nepalMobileField,
  addressLine: requiredText("Address", MAX_ADDRESS_LENGTH),
  city: requiredText("City", MAX_CITY_LENGTH),
  district: optionalText(MAX_DISTRICT_LENGTH),
  deliveryNotes: optionalText(MAX_DELIVERY_NOTES_LENGTH),
});

export const cartProductSchema = z.object({ productId: uuidField });

export const orderTargetSchema = z.object({ orderId: uuidField });

const MAX_CANCELLATION_REASON_LENGTH = 300;

export const sellerCancelOrderSchema = z.object({
  orderId: uuidField,
  reason: requiredText("Reason", MAX_CANCELLATION_REASON_LENGTH),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CartProductInput = z.infer<typeof cartProductSchema>;
export type OrderTargetInput = z.infer<typeof orderTargetSchema>;
export type SellerCancelOrderInput = z.infer<typeof sellerCancelOrderSchema>;

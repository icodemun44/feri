import { MAX_LISTING_PRICE_RUPEES, MIN_LISTING_PRICE_RUPEES } from "@feri/shared";
import { z } from "zod";
import { optionalText, requiredText, uuidField } from "./common";

export const LISTING_CONDITIONS = ["NEW", "LIKE_NEW", "GOOD", "FAIR"] as const;

const MAX_TITLE_LENGTH = 100;
const MIN_TITLE_LENGTH = 3;
const MAX_DESCRIPTION_LENGTH = 1500;
const MIN_DESCRIPTION_LENGTH = 20;
const MAX_BRAND_LENGTH = 40;
const MAX_SIZE_LENGTH = 20;
const MAX_REMOVAL_REASON_LENGTH = 500;

export const listingFieldsSchema = z.object({
  title: requiredText("Title", MAX_TITLE_LENGTH).refine(
    (value) => value.length >= MIN_TITLE_LENGTH,
    { message: `Title must be at least ${MIN_TITLE_LENGTH} characters` },
  ),
  description: requiredText("Description", MAX_DESCRIPTION_LENGTH).refine(
    (value) => value.length >= MIN_DESCRIPTION_LENGTH,
    {
      message: `Describe the item in a little more detail (at least ${MIN_DESCRIPTION_LENGTH} characters)`,
    },
  ),
  priceRupees: z.coerce
    .number({ error: "Enter a price in rupees" })
    .int("Enter a whole number of rupees")
    .min(MIN_LISTING_PRICE_RUPEES, `The lowest price is Rs ${MIN_LISTING_PRICE_RUPEES}`)
    .max(MAX_LISTING_PRICE_RUPEES, "That price is too high"),
  categoryId: uuidField,
  condition: z.enum(LISTING_CONDITIONS, { error: "Choose the item's condition" }),
  brand: optionalText(MAX_BRAND_LENGTH),
  size: optionalText(MAX_SIZE_LENGTH),
});

export const updateListingSchema = listingFieldsSchema.extend({ productId: uuidField });

export const listingTargetSchema = z.object({ productId: uuidField });

export const removeListingSchema = z.object({
  productId: uuidField,
  reason: requiredText("Reason", MAX_REMOVAL_REASON_LENGTH),
});

export type ListingFieldsInput = z.infer<typeof listingFieldsSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListingTargetInput = z.infer<typeof listingTargetSchema>;
export type RemoveListingInput = z.infer<typeof removeListingSchema>;

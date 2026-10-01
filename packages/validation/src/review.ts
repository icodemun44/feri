import { z } from "zod";
import { optionalText, requiredText, uuidField } from "./common";

const MIN_RATING = 1;
const MAX_RATING = 5;
const MAX_COMMENT_LENGTH = 500;
const MAX_REMOVAL_REASON_LENGTH = 300;

export const createReviewSchema = z.object({
  orderItemId: uuidField,
  rating: z.coerce
    .number({ error: "Choose a rating from 1 to 5 stars" })
    .int("Choose a rating from 1 to 5 stars")
    .min(MIN_RATING, "Choose a rating from 1 to 5 stars")
    .max(MAX_RATING, "Choose a rating from 1 to 5 stars"),
  comment: optionalText(MAX_COMMENT_LENGTH),
});

export const removeReviewSchema = z.object({
  reviewId: uuidField,
  reason: requiredText("Reason", MAX_REMOVAL_REASON_LENGTH),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type RemoveReviewInput = z.infer<typeof removeReviewSchema>;

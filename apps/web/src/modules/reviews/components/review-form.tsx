"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { cn, FormField, Textarea } from "@feri/ui";
import { ActionMessage } from "@/components/forms/action-message";
import { readFormResult } from "@/components/forms/read-form-result";
import { SubmitButton } from "@/components/forms/submit-button";
import { createReviewAction } from "../review.actions";

const RATING_OPTIONS = [1, 2, 3, 4, 5] as const;
const RATING_WORDS = ["Poor", "Fair", "Good", "Very good", "Excellent"] as const;

export const ReviewForm = ({ orderItemId }: { orderItemId: string }) => {
  const [result, saveReview] = useActionState(createReviewAction, null);
  const [selectedRating, setSelectedRating] = useState(0);
  const { fieldErrors, submittedValues } = readFormResult(result);

  return (
    <form action={saveReview} className="flex flex-col gap-4" noValidate>
      <ActionMessage result={result} />
      <input type="hidden" name="orderItemId" value={orderItemId} />

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-ink">Your rating</legend>
        <div className="flex items-center gap-1">
          {RATING_OPTIONS.map((rating) => (
            <label
              key={rating}
              className="group/star cursor-pointer rounded-md p-1 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary"
            >
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={selectedRating === rating}
                onChange={() => setSelectedRating(rating)}
                className="sr-only"
                aria-label={`${rating} ${rating === 1 ? "star" : "stars"}, ${RATING_WORDS[rating - 1]}`}
              />
              <Star
                aria-hidden="true"
                className={cn(
                  "size-7 transition-colors",
                  rating <= selectedRating
                    ? "fill-accent text-accent"
                    : "text-muted group-hover/star:text-accent-strong",
                )}
              />
            </label>
          ))}
          {selectedRating > 0 ? (
            <span className="ml-2 text-sm text-muted">{RATING_WORDS[selectedRating - 1]}</span>
          ) : null}
        </div>
        {fieldErrors["rating"] ? (
          <p className="text-xs font-medium text-danger">{fieldErrors["rating"].join(" ")}</p>
        ) : null}
      </fieldset>

      <FormField
        name="comment"
        label="Comment (optional)"
        hint="How was the item and the seller? Keep it honest and polite."
        errors={fieldErrors["comment"]}
      >
        <Textarea
          defaultValue={submittedValues["comment"] ?? ""}
          className="min-h-20"
          maxLength={500}
        />
      </FormField>

      <div>
        <SubmitButton>Post review</SubmitButton>
      </div>
    </form>
  );
};

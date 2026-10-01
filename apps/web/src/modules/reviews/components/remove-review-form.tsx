"use client";

import { useActionState, useState } from "react";
import { Button, FormField, Textarea } from "@feri/ui";
import { ActionMessage } from "@/components/forms/action-message";
import { readFormResult } from "@/components/forms/read-form-result";
import { SubmitButton } from "@/components/forms/submit-button";
import { removeReviewAction } from "../review.actions";

export const RemoveReviewForm = ({ reviewId }: { reviewId: string }) => {
  const [result, removeReview] = useActionState(removeReviewAction, null);
  const [isOpen, setIsOpen] = useState(false);
  const { fieldErrors, submittedValues } = readFormResult(result);

  if (!isOpen) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        Remove review
      </Button>
    );
  }

  return (
    <form action={removeReview} className="flex flex-col gap-3">
      <ActionMessage result={result} />
      <input type="hidden" name="reviewId" value={reviewId} />
      <FormField
        name={`reason-${reviewId}`}
        label="Reason (kept in the audit log)"
        errors={fieldErrors["reason"]}
        required
      >
        <Textarea
          name="reason"
          defaultValue={submittedValues["reason"] ?? ""}
          className="min-h-16"
          maxLength={300}
        />
      </FormField>
      <div className="flex gap-2">
        <SubmitButton variant="danger" size="sm">
          Remove
        </SubmitButton>
        <Button type="button" variant="secondary" size="sm" onClick={() => setIsOpen(false)}>
          Keep it
        </Button>
      </div>
    </form>
  );
};

"use client";

import { useActionState } from "react";
import {
  PRODUCT_REVIEW_STATUSES,
  PRODUCT_STATUSES,
  type ProductReviewStatus,
  type ProductStatus,
} from "@feri/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormField,
  Textarea,
} from "@feri/ui";
import { ActionMessage } from "@/components/forms/action-message";
import { readFormResult } from "@/components/forms/read-form-result";
import { SubmitButton } from "@/components/forms/submit-button";
import { approveListingAction, removeListingAction } from "../listing.actions";

type AdminListingReviewPanelProps = {
  productId: string;
  status: ProductStatus;
  reviewStatus: ProductReviewStatus;
};

const ApproveForm = ({ productId }: { productId: string }) => {
  const [result, approve] = useActionState(approveListingAction, null);
  return (
    <form action={approve} className="flex flex-col gap-3">
      <ActionMessage result={result} />
      <input type="hidden" name="productId" value={productId} />
      <SubmitButton>Mark as checked</SubmitButton>
    </form>
  );
};

const RemoveForm = ({ productId }: { productId: string }) => {
  const [result, remove] = useActionState(removeListingAction, null);
  const { fieldErrors, submittedValues } = readFormResult(result);
  return (
    <form action={remove} className="flex flex-col gap-4">
      <ActionMessage result={result} />
      <input type="hidden" name="productId" value={productId} />
      <FormField
        name="reason"
        label="Reason shown to the seller"
        errors={fieldErrors["reason"]}
        required
      >
        <Textarea
          defaultValue={submittedValues["reason"] ?? ""}
          className="min-h-20"
          maxLength={500}
        />
      </FormField>
      <SubmitButton variant="danger">Remove listing</SubmitButton>
    </form>
  );
};

export const AdminListingReviewPanel = ({
  productId,
  status,
  reviewStatus,
}: AdminListingReviewPanelProps) => {
  if (status === PRODUCT_STATUSES.REMOVED) {
    return null;
  }
  const canMarkChecked =
    reviewStatus === PRODUCT_REVIEW_STATUSES.PENDING && status !== PRODUCT_STATUSES.DRAFT;

  return (
    <div className="flex flex-col gap-5">
      {canMarkChecked ? (
        <Card>
          <CardHeader>
            <CardTitle>Check this listing</CardTitle>
            <CardDescription>
              Photos match the description, the price is fair and nothing is against the rules.
              Buyers will see a Checked tag.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApproveForm productId={productId} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Remove</CardTitle>
          <CardDescription>
            Takes the listing off the site. The seller sees your reason.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RemoveForm productId={productId} />
        </CardContent>
      </Card>
    </div>
  );
};

"use client";

import { useActionState, useState } from "react";
import { PRODUCT_STATUSES, type ProductStatus } from "@feri/shared";
import { Button } from "@feri/ui";
import { ActionMessage } from "@/components/forms/action-message";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  deleteListingAction,
  markListingSoldAction,
  publishListingAction,
  unpublishListingAction,
} from "../listing.actions";

type ListingActionsProps = {
  productId: string;
  status: ProductStatus;
  hasPhotos: boolean;
};

const PublishForm = ({ productId, hasPhotos }: { productId: string; hasPhotos: boolean }) => {
  const [result, publish] = useActionState(publishListingAction, null);
  return (
    <form action={publish} className="flex flex-col gap-2">
      <ActionMessage result={result} />
      <input type="hidden" name="productId" value={productId} />
      <SubmitButton disabled={!hasPhotos}>Publish listing</SubmitButton>
      {hasPhotos ? null : <p className="text-xs text-muted">Add at least one photo to publish.</p>}
    </form>
  );
};

const SimpleActionForm = ({
  productId,
  action,
  label,
}: {
  productId: string;
  action: typeof unpublishListingAction;
  label: string;
}) => {
  const [result, runAction] = useActionState(action, null);
  return (
    <form action={runAction} className="flex flex-col gap-2">
      <ActionMessage result={result} />
      <input type="hidden" name="productId" value={productId} />
      <SubmitButton variant="secondary">{label}</SubmitButton>
    </form>
  );
};

const DeleteForm = ({ productId }: { productId: string }) => {
  const [result, deleteListing] = useActionState(deleteListingAction, null);
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <Button type="button" variant="ghost" onClick={() => setIsConfirming(true)}>
        Delete listing
      </Button>
    );
  }
  return (
    <form action={deleteListing} className="flex flex-col gap-2">
      <ActionMessage result={result} />
      <input type="hidden" name="productId" value={productId} />
      <p className="text-sm text-body">Delete this listing? Buyers will no longer see it.</p>
      <div className="flex gap-2">
        <SubmitButton variant="danger" size="sm">
          Yes, delete
        </SubmitButton>
        <Button type="button" variant="secondary" size="sm" onClick={() => setIsConfirming(false)}>
          Keep it
        </Button>
      </div>
    </form>
  );
};

export const ListingActions = ({ productId, status, hasPhotos }: ListingActionsProps) => (
  <div className="flex flex-col gap-4">
    {status === PRODUCT_STATUSES.DRAFT ? (
      <PublishForm productId={productId} hasPhotos={hasPhotos} />
    ) : null}
    {status === PRODUCT_STATUSES.ACTIVE ? (
      <>
        <SimpleActionForm
          productId={productId}
          action={markListingSoldAction}
          label="Mark as sold"
        />
        <SimpleActionForm
          productId={productId}
          action={unpublishListingAction}
          label="Unpublish (back to draft)"
        />
      </>
    ) : null}
    {status !== PRODUCT_STATUSES.REMOVED ? <DeleteForm productId={productId} /> : null}
  </div>
);

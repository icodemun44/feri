"use client";

import { useActionState, useState } from "react";
import { Button } from "@feri/ui";
import { ActionMessage } from "@/components/forms/action-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { cancelOrderAction } from "../order.actions";

export const CancelOrderButton = ({ orderId }: { orderId: string }) => {
  const [result, cancelOrder] = useActionState(cancelOrderAction, null);
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <Button type="button" variant="secondary" onClick={() => setIsConfirming(true)}>
        Cancel order
      </Button>
    );
  }

  return (
    <form action={cancelOrder} className="flex flex-col gap-3">
      <ActionMessage result={result} />
      <input type="hidden" name="orderId" value={orderId} />
      <p className="text-sm text-body">Cancel this order? The items go back on sale.</p>
      <div className="flex gap-2">
        <SubmitButton variant="danger" size="sm">
          Yes, cancel it
        </SubmitButton>
        <Button type="button" variant="secondary" size="sm" onClick={() => setIsConfirming(false)}>
          Keep my order
        </Button>
      </div>
    </form>
  );
};

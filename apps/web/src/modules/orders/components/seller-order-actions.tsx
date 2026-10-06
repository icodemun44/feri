"use client";

import { useActionState, useState } from "react";
import { ORDER_STATUSES, formatPaisa, type OrderStatus } from "@feri/shared";
import {
  Button,
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
import {
  confirmOrderAction,
  deliverOrderAction,
  sellerCancelOrderAction,
  shipOrderAction,
} from "../order-fulfilment.actions";

type SellerOrderActionsProps = {
  orderId: string;
  status: OrderStatus;
  totalMinor: number;
};

type StepFormProps = {
  orderId: string;
  action: typeof confirmOrderAction;
  label: string;
  hint: string;
};

const StepForm = ({ orderId, action, label, hint }: StepFormProps) => {
  const [result, runStep] = useActionState(action, null);
  return (
    <form action={runStep} className="flex flex-col gap-3">
      <ActionMessage result={result} />
      <input type="hidden" name="orderId" value={orderId} />
      <p className="text-sm text-muted">{hint}</p>
      <SubmitButton>{label}</SubmitButton>
    </form>
  );
};

const CancelForm = ({ orderId }: { orderId: string }) => {
  const [result, cancelOrder] = useActionState(sellerCancelOrderAction, null);
  const [isOpen, setIsOpen] = useState(false);
  const { fieldErrors, submittedValues } = readFormResult(result);

  if (!isOpen) {
    return (
      <Button type="button" variant="ghost" onClick={() => setIsOpen(true)}>
        Cancel this order
      </Button>
    );
  }
  return (
    <form action={cancelOrder} className="flex flex-col gap-4">
      <ActionMessage result={result} />
      <input type="hidden" name="orderId" value={orderId} />
      <FormField
        name="reason"
        label="Reason shown to the buyer"
        errors={fieldErrors["reason"]}
        required
      >
        <Textarea
          defaultValue={submittedValues["reason"] ?? ""}
          className="min-h-20"
          maxLength={300}
        />
      </FormField>
      <div className="flex gap-2">
        <SubmitButton variant="danger" size="sm">
          Cancel order
        </SubmitButton>
        <Button type="button" variant="secondary" size="sm" onClick={() => setIsOpen(false)}>
          Keep order
        </Button>
      </div>
    </form>
  );
};

export const SellerOrderActions = ({ orderId, status, totalMinor }: SellerOrderActionsProps) => {
  const isCancellable = status === ORDER_STATUSES.PLACED || status === ORDER_STATUSES.CONFIRMED;
  const isFinished = status === ORDER_STATUSES.DELIVERED || status === ORDER_STATUSES.CANCELLED;
  if (isFinished) {
    return null;
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Next step</CardTitle>
        <CardDescription>Keep the buyer informed by moving the order along.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {status === ORDER_STATUSES.PLACED ? (
          <StepForm
            orderId={orderId}
            action={confirmOrderAction}
            label="Confirm order"
            hint="Confirm that you have the item and will send it."
          />
        ) : null}
        {status === ORDER_STATUSES.CONFIRMED ? (
          <StepForm
            orderId={orderId}
            action={shipOrderAction}
            label="Mark as shipped"
            hint="Do this when the item is with the courier or on its way."
          />
        ) : null}
        {status === ORDER_STATUSES.SHIPPED ? (
          <StepForm
            orderId={orderId}
            action={deliverOrderAction}
            label="Delivered and cash collected"
            hint={`Only after the buyer has the item and has paid ${formatPaisa(totalMinor)} in cash.`}
          />
        ) : null}
        {isCancellable ? <CancelForm orderId={orderId} /> : null}
      </CardContent>
    </Card>
  );
};

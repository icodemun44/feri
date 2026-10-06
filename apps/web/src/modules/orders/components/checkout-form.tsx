"use client";

import { useActionState } from "react";
import { Banknote } from "lucide-react";
import { FormField, Input, Textarea } from "@feri/ui";
import { ActionMessage } from "@/components/forms/action-message";
import { readFormResult } from "@/components/forms/read-form-result";
import { SubmitButton } from "@/components/forms/submit-button";
import { placeOrderAction } from "../order.actions";

type CheckoutFormProps = {
  defaultFullName: string;
  defaultPhone: string;
};

export const CheckoutForm = ({ defaultFullName, defaultPhone }: CheckoutFormProps) => {
  const [result, placeOrder] = useActionState(placeOrderAction, null);
  const { fieldErrors, submittedValues } = readFormResult(result);

  return (
    <form action={placeOrder} className="flex flex-col gap-8" noValidate>
      <ActionMessage result={result} />

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-1 font-display text-xl font-semibold text-ink">
          Delivery details
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField name="fullName" label="Full name" errors={fieldErrors["fullName"]} required>
            <Input
              autoComplete="name"
              defaultValue={submittedValues["fullName"] ?? defaultFullName}
            />
          </FormField>
          <FormField
            name="phone"
            label="Mobile number"
            hint="The courier will call this number."
            errors={fieldErrors["phone"]}
            required
          >
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="98XXXXXXXX"
              defaultValue={submittedValues["phone"] ?? defaultPhone}
            />
          </FormField>
        </div>
        <FormField
          name="addressLine"
          label="Street address"
          hint="Tole, ward number, nearby landmark."
          errors={fieldErrors["addressLine"]}
          required
        >
          <Input
            autoComplete="street-address"
            defaultValue={submittedValues["addressLine"] ?? ""}
            maxLength={200}
          />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField name="city" label="City" errors={fieldErrors["city"]} required>
            <Input
              autoComplete="address-level2"
              defaultValue={submittedValues["city"] ?? ""}
              placeholder="Kathmandu"
            />
          </FormField>
          <FormField name="district" label="District (optional)" errors={fieldErrors["district"]}>
            <Input autoComplete="address-level1" defaultValue={submittedValues["district"] ?? ""} />
          </FormField>
        </div>
        <FormField
          name="deliveryNotes"
          label="Notes for delivery (optional)"
          errors={fieldErrors["deliveryNotes"]}
        >
          <Textarea
            className="min-h-20"
            defaultValue={submittedValues["deliveryNotes"] ?? ""}
            maxLength={300}
          />
        </FormField>
      </fieldset>

      <section aria-labelledby="payment-heading" className="flex flex-col gap-3">
        <h2 id="payment-heading" className="font-display text-xl font-semibold text-ink">
          Payment
        </h2>
        <div className="flex items-start gap-3 rounded-xl border-2 border-primary bg-primary-soft p-4">
          <Banknote aria-hidden="true" className="mt-0.5 size-5 text-primary" />
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-ink">Cash on delivery</p>
            <p className="text-sm text-muted">
              Check your items when they arrive, then pay the courier. Nothing to pay now.
            </p>
          </div>
        </div>
      </section>

      <SubmitButton size="lg" fullWidth>
        Place order
      </SubmitButton>
    </form>
  );
};

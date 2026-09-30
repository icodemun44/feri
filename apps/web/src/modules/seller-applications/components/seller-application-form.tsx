"use client";

import { useActionState } from "react";
import { FormField, Input, Select, Textarea } from "@feri/ui";
import { ActionMessage } from "@/components/forms/action-message";
import { readFormResult } from "@/components/forms/read-form-result";
import { SubmitButton } from "@/components/forms/submit-button";
import { submitSellerApplicationAction } from "../seller-application.actions";

type CategoryOption = { id: string; name: string };

type SellerApplicationFormProps = {
  categories: readonly CategoryOption[];
  defaultEmail: string;
  defaultPhone: string;
};

export const SellerApplicationForm = ({
  categories,
  defaultEmail,
  defaultPhone,
}: SellerApplicationFormProps) => {
  const [result, submitApplication] = useActionState(submitSellerApplicationAction, null);
  const { fieldErrors, submittedValues } = readFormResult(result);

  return (
    <form action={submitApplication} className="flex flex-col gap-5" noValidate>
      <ActionMessage result={result} />

      <FormField
        name="businessName"
        label="Shop name"
        errors={fieldErrors["businessName"]}
        required
      >
        <Input
          autoComplete="organization"
          defaultValue={submittedValues["businessName"] ?? ""}
          placeholder="Maya's Closet"
          maxLength={80}
        />
      </FormField>

      <FormField
        name="description"
        label="What will you sell?"
        hint="A few sentences about your items and where they come from."
        errors={fieldErrors["description"]}
        required
      >
        <Textarea defaultValue={submittedValues["description"] ?? ""} maxLength={600} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          name="contactEmail"
          label="Contact email"
          errors={fieldErrors["contactEmail"]}
          required
        >
          <Input
            type="email"
            autoComplete="email"
            defaultValue={submittedValues["contactEmail"] ?? defaultEmail}
          />
        </FormField>
        <FormField
          name="contactPhone"
          label="Phone number"
          hint="We will call this number to verify your application."
          errors={fieldErrors["contactPhone"]}
          required
        >
          <Input
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            defaultValue={submittedValues["contactPhone"] ?? defaultPhone}
            placeholder="98XXXXXXXX"
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField name="city" label="City" errors={fieldErrors["city"]} required>
          <Input
            autoComplete="address-level2"
            defaultValue={submittedValues["city"] ?? ""}
            placeholder="Kathmandu"
          />
        </FormField>
        <FormField
          name="primaryCategoryId"
          label="Main category"
          errors={fieldErrors["primaryCategoryId"]}
        >
          <Select defaultValue={submittedValues["primaryCategoryId"] ?? ""}>
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <SubmitButton size="lg" fullWidth>
        Submit application
      </SubmitButton>
    </form>
  );
};

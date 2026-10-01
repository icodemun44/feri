"use client";

import { useActionState } from "react";
import { FormField, Input, Select, Textarea } from "@feri/ui";
import { paisaToRupees } from "@feri/shared";
import { ActionMessage } from "@/components/forms/action-message";
import { readFormResult } from "@/components/forms/read-form-result";
import { SubmitButton } from "@/components/forms/submit-button";
import type { CategorySummary } from "@/modules/catalog/catalog.types";
import { PRODUCT_CONDITION_LABELS } from "@/modules/catalog/catalog.constants";
import { createListingAction, updateListingAction } from "../listing.actions";
import type { ListingRecord } from "../listing.types";

type ListingFormProps = {
  categories: readonly CategorySummary[];
  listing?: ListingRecord;
};

const CONDITION_OPTIONS = Object.entries(PRODUCT_CONDITION_LABELS);

export const ListingForm = ({ categories, listing }: ListingFormProps) => {
  const isEditing = listing !== undefined;
  const [result, saveListing] = useActionState(
    isEditing ? updateListingAction : createListingAction,
    null,
  );
  const { fieldErrors, submittedValues } = readFormResult(result);

  const valueOf = (fieldName: string, savedValue: string | undefined): string =>
    submittedValues[fieldName] ?? savedValue ?? "";

  return (
    <form action={saveListing} className="flex flex-col gap-5" noValidate>
      <ActionMessage result={result} successMessage="Changes saved." />
      {listing ? <input type="hidden" name="productId" value={listing.id} /> : null}

      <FormField name="title" label="Title" errors={fieldErrors["title"]} required>
        <Input
          defaultValue={valueOf("title", listing?.title)}
          placeholder="Vintage denim jacket"
          maxLength={100}
        />
      </FormField>

      <FormField
        name="description"
        label="Description"
        hint="Mention size, material and any flaws. Honest listings sell faster."
        errors={fieldErrors["description"]}
        required
      >
        <Textarea
          defaultValue={valueOf("description", listing?.description)}
          className="min-h-36"
          maxLength={1500}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          name="priceRupees"
          label="Price (Rs)"
          errors={fieldErrors["priceRupees"]}
          required
        >
          <Input
            type="number"
            inputMode="numeric"
            min={10}
            step={1}
            defaultValue={valueOf(
              "priceRupees",
              listing ? String(paisaToRupees(listing.priceMinor)) : undefined,
            )}
          />
        </FormField>
        <FormField name="condition" label="Condition" errors={fieldErrors["condition"]} required>
          <Select defaultValue={valueOf("condition", listing?.condition)}>
            <option value="">Choose condition</option>
            {CONDITION_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField name="categoryId" label="Category" errors={fieldErrors["categoryId"]} required>
        <Select defaultValue={valueOf("categoryId", listing?.categoryId)}>
          <option value="">Choose a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField name="brand" label="Brand (optional)" errors={fieldErrors["brand"]}>
          <Input defaultValue={valueOf("brand", listing?.brand ?? undefined)} maxLength={40} />
        </FormField>
        <FormField name="size" label="Size (optional)" errors={fieldErrors["size"]}>
          <Input defaultValue={valueOf("size", listing?.size ?? undefined)} maxLength={20} />
        </FormField>
      </div>

      <div>
        <SubmitButton size="lg">{isEditing ? "Save changes" : "Save and add photos"}</SubmitButton>
      </div>
    </form>
  );
};

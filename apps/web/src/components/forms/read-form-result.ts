import type { ActionResult, FieldErrors, SubmittedValues } from "@feri/shared";

type FormResultView = {
  fieldErrors: FieldErrors;
  submittedValues: SubmittedValues;
};

const NO_FIELD_ERRORS: FieldErrors = {};
const NO_SUBMITTED_VALUES: SubmittedValues = {};

export const readFormResult = (result: ActionResult<unknown> | null): FormResultView => {
  if (!result || result.ok) {
    return { fieldErrors: NO_FIELD_ERRORS, submittedValues: NO_SUBMITTED_VALUES };
  }
  return {
    fieldErrors: result.fieldErrors ?? NO_FIELD_ERRORS,
    submittedValues: result.submittedValues ?? NO_SUBMITTED_VALUES,
  };
};

import "server-only";
import { AppError, ERROR_CODES, type FieldErrors, type SubmittedValues } from "@feri/shared";
import { z } from "zod";

const SENSITIVE_FIELD_NAMES: ReadonlySet<string> = new Set(["password"]);
const FRAMEWORK_FIELD_PREFIX = "$ACTION";
const VALIDATION_MESSAGE = "Please fix the highlighted fields.";

const readTextFields = (formData: FormData): Record<string, string> => {
  const textFields: Record<string, string> = {};
  formData.forEach((value, name) => {
    if (typeof value === "string" && !name.startsWith(FRAMEWORK_FIELD_PREFIX)) {
      textFields[name] = value;
    }
  });
  return textFields;
};

const withoutSensitiveFields = (textFields: Record<string, string>): SubmittedValues =>
  Object.fromEntries(
    Object.entries(textFields).filter(([name]) => !SENSITIVE_FIELD_NAMES.has(name)),
  );

const toFieldErrors = (error: z.ZodError): FieldErrors => {
  const { fieldErrors } = z.flattenError(error);
  const presentEntries = Object.entries(fieldErrors).flatMap(
    ([fieldName, messages]: [string, unknown]): [string, string[]][] => {
      if (!Array.isArray(messages)) {
        return [];
      }
      const textMessages = messages.filter(
        (message): message is string => typeof message === "string",
      );
      return textMessages.length > 0 ? [[fieldName, textMessages]] : [];
    },
  );
  return Object.fromEntries(presentEntries);
};

export const parseFormData = <Schema extends z.ZodType>(
  schema: Schema,
  formData: FormData,
): z.output<Schema> => {
  const textFields = readTextFields(formData);
  const parsed = schema.safeParse(textFields);
  if (!parsed.success) {
    throw new AppError(ERROR_CODES.VALIDATION, VALIDATION_MESSAGE, {
      fieldErrors: toFieldErrors(parsed.error),
      submittedValues: withoutSensitiveFields(textFields),
    });
  }
  return parsed.data;
};

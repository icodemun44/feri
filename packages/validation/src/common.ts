import { z } from "zod";

const NEPAL_MOBILE_PATTERN = /^9[6-8]\d{8}$/;
const NEPAL_COUNTRY_CODE_PATTERN = /^(\+977|977)/;
const PHONE_SEPARATOR_PATTERN = /[\s-]/g;

export const requiredText = (label: string, maxLength: number) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(maxLength, `${label} must be at most ${maxLength} characters`);

export const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength, `Must be at most ${maxLength} characters`)
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional();

export const emailField = z
  .string({ error: "Email is required" })
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

export const nepalMobileField = z
  .string({ error: "Phone number is required" })
  .trim()
  .transform((value) =>
    value.replace(PHONE_SEPARATOR_PATTERN, "").replace(NEPAL_COUNTRY_CODE_PATTERN, ""),
  )
  .refine((value) => NEPAL_MOBILE_PATTERN.test(value), {
    message: "Enter a valid 10 digit Nepali mobile number",
  });

export const uuidField = z.uuid("Invalid identifier");

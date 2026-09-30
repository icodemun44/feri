import { MIN_PASSWORD_LENGTH } from "@feri/shared";
import { z } from "zod";
import { emailField, nepalMobileField, requiredText } from "./common";

const MAX_NAME_LENGTH = 80;
const MAX_PASSWORD_LENGTH = 72;

export const signUpSchema = z.object({
  fullName: requiredText("Full name", MAX_NAME_LENGTH),
  email: emailField,
  phone: nepalMobileField,
  password: z
    .string({ error: "Password is required" })
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    .max(MAX_PASSWORD_LENGTH, `Password must be at most ${MAX_PASSWORD_LENGTH} characters`),
});

export const signInSchema = z.object({
  email: emailField,
  password: z.string({ error: "Password is required" }).min(1, "Password is required"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

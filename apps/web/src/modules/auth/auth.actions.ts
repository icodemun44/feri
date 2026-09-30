"use server";

import { redirect } from "next/navigation";
import type { ActionResult } from "@feri/shared";
import { signInSchema, signUpSchema } from "@feri/validation";
import { toSafeRedirectPath } from "@/lib/safe-redirect";
import { getEnv } from "@/server/env";
import { parseFormData } from "@/server/actions/parse-form";
import { runAction } from "@/server/actions/run-action";
import { createSupabaseServerClient } from "@/server/supabase/server-client";
import { toAppError } from "./auth.errors";

const DEFAULT_AFTER_LOGIN_PATH = "/";
const DEFAULT_AFTER_SIGNUP_PATH = "/account";
const CONFIRMATION_PATH = "/auth/confirm";

export type SignUpOutcome = { confirmationEmailSent: true };

export const signUpAction = async (
  _previousState: ActionResult<SignUpOutcome> | null,
  formData: FormData,
): Promise<ActionResult<SignUpOutcome>> =>
  runAction(async () => {
    const { fullName, email, phone, password } = parseFormData(signUpSchema, formData);
    const supabase = await createSupabaseServerClient();
    const { NEXT_PUBLIC_SITE_URL } = getEnv();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
        emailRedirectTo: `${NEXT_PUBLIC_SITE_URL}${CONFIRMATION_PATH}`,
      },
    });
    if (error) {
      throw toAppError(error, "We could not create your account. Please try again.");
    }
    if (!data.session) {
      return { confirmationEmailSent: true } as const;
    }
    redirect(toSafeRedirectPath(formData.get("next"), DEFAULT_AFTER_SIGNUP_PATH));
  });

export const signInAction = async (
  _previousState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> =>
  runAction(async () => {
    const { email, password } = parseFormData(signInSchema, formData);
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw toAppError(error, "We could not log you in. Please try again.");
    }
    redirect(toSafeRedirectPath(formData.get("next"), DEFAULT_AFTER_LOGIN_PATH));
  });

export const signOutAction = async (): Promise<void> => {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
};

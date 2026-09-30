"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField, Input } from "@feri/ui";
import { ActionMessage } from "@/components/forms/action-message";
import { readFormResult } from "@/components/forms/read-form-result";
import { SubmitButton } from "@/components/forms/submit-button";
import { signInAction } from "../auth.actions";

export const LoginForm = ({ nextPath }: { nextPath: string }) => {
  const [result, signIn] = useActionState(signInAction, null);
  const { fieldErrors, submittedValues } = readFormResult(result);
  const signupHref = nextPath ? `/signup?next=${encodeURIComponent(nextPath)}` : "/signup";

  return (
    <form action={signIn} className="flex flex-col gap-5" noValidate>
      <ActionMessage result={result} />
      <input type="hidden" name="next" value={nextPath} />
      <FormField name="email" label="Email" errors={fieldErrors["email"]} required>
        <Input
          type="email"
          autoComplete="email"
          defaultValue={submittedValues["email"] ?? ""}
          placeholder="you@example.com"
        />
      </FormField>
      <FormField name="password" label="Password" errors={fieldErrors["password"]} required>
        <Input type="password" autoComplete="current-password" />
      </FormField>
      <SubmitButton size="lg" fullWidth>
        Log in
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        New to Feri Nepal?{" "}
        <Link href={signupHref} className="font-semibold text-primary underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  );
};

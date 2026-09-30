"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert, FormField, Input } from "@feri/ui";
import { MIN_PASSWORD_LENGTH } from "@feri/shared";
import { ActionMessage } from "@/components/forms/action-message";
import { readFormResult } from "@/components/forms/read-form-result";
import { SubmitButton } from "@/components/forms/submit-button";
import { signUpAction } from "../auth.actions";

export const SignUpForm = ({ nextPath }: { nextPath: string }) => {
  const [result, signUp] = useActionState(signUpAction, null);
  const { fieldErrors, submittedValues } = readFormResult(result);
  const loginHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";

  if (result?.ok) {
    return (
      <Alert tone="success" title="Check your email">
        We sent you a confirmation link. Open it to activate your account, then log in.
      </Alert>
    );
  }

  return (
    <form action={signUp} className="flex flex-col gap-5" noValidate>
      <ActionMessage result={result} />
      <input type="hidden" name="next" value={nextPath} />
      <FormField name="fullName" label="Full name" errors={fieldErrors["fullName"]} required>
        <Input autoComplete="name" defaultValue={submittedValues["fullName"] ?? ""} />
      </FormField>
      <FormField name="email" label="Email" errors={fieldErrors["email"]} required>
        <Input type="email" autoComplete="email" defaultValue={submittedValues["email"] ?? ""} />
      </FormField>
      <FormField
        name="phone"
        label="Mobile number"
        hint="Used for delivery and seller verification calls."
        errors={fieldErrors["phone"]}
        required
      >
        <Input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="98XXXXXXXX"
          defaultValue={submittedValues["phone"] ?? ""}
        />
      </FormField>
      <FormField
        name="password"
        label="Password"
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        errors={fieldErrors["password"]}
        required
      >
        <Input type="password" autoComplete="new-password" />
      </FormField>
      <SubmitButton size="lg" fullWidth>
        Create account
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={loginHref} className="font-semibold text-primary underline underline-offset-4">
          Log in
        </Link>
      </p>
    </form>
  );
};

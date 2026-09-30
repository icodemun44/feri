import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Alert } from "@feri/ui";
import { toSafeRedirectPath } from "@/lib/safe-redirect";
import { LoginForm } from "@/modules/auth/components/login-form";
import { getCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = { title: "Log in" };

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const { next, error } = await searchParams;
  const nextPath = toSafeRedirectPath(next, "");

  if (await getCurrentUser()) {
    redirect(nextPath || "/");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl">Welcome back</h1>
        <p className="text-muted">Log in to buy, sell and follow your orders.</p>
      </div>
      {error === "confirmation_failed" ? (
        <Alert tone="danger">
          That confirmation link is invalid or has expired. Try signing up again or log in.
        </Alert>
      ) : null}
      <LoginForm nextPath={nextPath} />
    </div>
  );
};

export default LoginPage;

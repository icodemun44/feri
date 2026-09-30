import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { toSafeRedirectPath } from "@/lib/safe-redirect";
import { SignUpForm } from "@/modules/auth/components/signup-form";
import { getCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = { title: "Create your account" };

type SignUpPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const SignUpPage = async ({ searchParams }: SignUpPageProps) => {
  const { next } = await searchParams;
  const nextPath = toSafeRedirectPath(next, "");

  if (await getCurrentUser()) {
    redirect(nextPath || "/account");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl">Create your account</h1>
        <p className="text-muted">Everyone starts as a buyer. You can apply to sell any time.</p>
      </div>
      <SignUpForm nextPath={nextPath} />
    </div>
  );
};

export default SignUpPage;

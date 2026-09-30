import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { toSafeRedirectPath } from "@/lib/safe-redirect";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

const ALLOWED_OTP_TYPES: readonly EmailOtpType[] = [
  "signup",
  "email",
  "recovery",
  "invite",
  "magiclink",
  "email_change",
];

const isEmailOtpType = (value: string | null): value is EmailOtpType =>
  value !== null && (ALLOWED_OTP_TYPES as readonly string[]).includes(value);

export const GET = async (request: NextRequest) => {
  const { searchParams, origin } = request.nextUrl;
  const redirectPath = toSafeRedirectPath(searchParams.get("next"), "/account");
  const tokenHash = searchParams.get("token_hash");
  const otpType = searchParams.get("type");
  const authorizationCode = searchParams.get("code");

  const supabase = await createSupabaseServerClient();

  if (tokenHash && isEmailOtpType(otpType)) {
    const { error } = await supabase.auth.verifyOtp({ type: otpType, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(new URL(redirectPath, origin));
    }
  }

  if (authorizationCode) {
    const { error } = await supabase.auth.exchangeCodeForSession(authorizationCode);
    if (!error) {
      return NextResponse.redirect(new URL(redirectPath, origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=confirmation_failed", origin));
};

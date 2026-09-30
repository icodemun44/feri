import type { AuthError } from "@supabase/supabase-js";
import { AppError, ERROR_CODES } from "@feri/shared";

const INVALID_CREDENTIALS_MESSAGE = "Incorrect email or password.";

const AUTH_ERROR_MESSAGES: Readonly<Record<string, { code: AppError["code"]; message: string }>> = {
  invalid_credentials: { code: ERROR_CODES.UNAUTHENTICATED, message: INVALID_CREDENTIALS_MESSAGE },
  email_not_confirmed: {
    code: ERROR_CODES.UNAUTHENTICATED,
    message: "Please confirm your email address first. Check your inbox for the link.",
  },
  user_already_exists: {
    code: ERROR_CODES.CONFLICT,
    message: "An account with this email already exists. Try logging in instead.",
  },
  email_exists: {
    code: ERROR_CODES.CONFLICT,
    message: "An account with this email already exists. Try logging in instead.",
  },
  weak_password: {
    code: ERROR_CODES.VALIDATION,
    message: "That password is too easy to guess. Try a longer or less common one.",
  },
  over_request_rate_limit: {
    code: ERROR_CODES.FORBIDDEN,
    message: "Too many attempts. Please wait a minute and try again.",
  },
  over_email_send_rate_limit: {
    code: ERROR_CODES.FORBIDDEN,
    message: "Too many emails were sent. Please wait a few minutes and try again.",
  },
};

export const toAppError = (error: AuthError, fallbackMessage: string): AppError => {
  const knownError = error.code ? AUTH_ERROR_MESSAGES[error.code] : undefined;
  if (knownError) {
    return new AppError(knownError.code, knownError.message);
  }
  return new AppError(ERROR_CODES.INTERNAL, fallbackMessage);
};

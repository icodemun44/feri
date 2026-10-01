import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { AppError, ERROR_CODES, type ErrorCode } from "@feri/shared";
import { describeError, logger } from "../logger";

const STATUS_BY_ERROR_CODE: Record<ErrorCode, number> = {
  [ERROR_CODES.UNAUTHENTICATED]: 401,
  [ERROR_CODES.FORBIDDEN]: 403,
  [ERROR_CODES.VALIDATION]: 422,
  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.CONFLICT]: 409,
  [ERROR_CODES.INVALID_STATE]: 409,
  [ERROR_CODES.INTERNAL]: 500,
};

const GENERIC_FAILURE_MESSAGE = "Something went wrong. Please try again.";

export const assertSameOrigin = (request: NextRequest): void => {
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).host !== request.nextUrl.host) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "This request was blocked.");
  }
};

export const toErrorResponse = (error: unknown): NextResponse => {
  if (error instanceof AppError) {
    return NextResponse.json(
      { message: error.message },
      { status: STATUS_BY_ERROR_CODE[error.code] },
    );
  }
  logger.error("Unhandled error in route handler", describeError(error));
  return NextResponse.json({ message: GENERIC_FAILURE_MESSAGE }, { status: 500 });
};

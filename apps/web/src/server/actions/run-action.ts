import "server-only";
import { unstable_rethrow } from "next/navigation";
import {
  actionFailure,
  actionSuccess,
  AppError,
  ERROR_CODES,
  type ActionResult,
} from "@feri/shared";
import { describeError, logger } from "../logger";

const GENERIC_FAILURE_MESSAGE = "Something went wrong. Please try again.";

export const runAction = async <Value>(
  work: () => Promise<Value>,
): Promise<ActionResult<Value>> => {
  try {
    return actionSuccess(await work());
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof AppError) {
      return actionFailure(error.code, error.message, error.details);
    }
    logger.error("Unhandled error in server action", describeError(error));
    return actionFailure(ERROR_CODES.INTERNAL, GENERIC_FAILURE_MESSAGE);
  }
};

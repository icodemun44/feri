import { Alert } from "@feri/ui";
import type { ActionResult } from "@feri/shared";

type ActionMessageProps = {
  result: ActionResult<unknown> | null;
  successMessage?: string;
};

export const ActionMessage = ({ result, successMessage }: ActionMessageProps) => {
  if (!result) {
    return null;
  }
  if (!result.ok) {
    return <Alert tone="danger">{result.message}</Alert>;
  }
  return successMessage ? <Alert tone="success">{successMessage}</Alert> : null;
};

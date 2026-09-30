export const ERROR_CODES = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION: "VALIDATION",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INVALID_STATE: "INVALID_STATE",
  INTERNAL: "INTERNAL",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export type FieldErrors = Readonly<Record<string, readonly string[]>>;
export type SubmittedValues = Readonly<Record<string, string>>;

export type ErrorDetails = {
  fieldErrors?: FieldErrors;
  submittedValues?: SubmittedValues;
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly details: ErrorDetails;

  constructor(code: ErrorCode, message: string, details: ErrorDetails = {}) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
  }
}

export type ActionFailure = {
  ok: false;
  code: ErrorCode;
  message: string;
  fieldErrors?: FieldErrors;
  submittedValues?: SubmittedValues;
};

export type ActionSuccess<Value> = {
  ok: true;
  value: Value;
};

export type ActionResult<Value = void> = ActionSuccess<Value> | ActionFailure;

export const actionSuccess = <Value>(value: Value): ActionSuccess<Value> => ({ ok: true, value });

export const actionFailure = (
  code: ErrorCode,
  message: string,
  details: ErrorDetails = {},
): ActionFailure => ({
  ok: false,
  code,
  message,
  ...(details.fieldErrors ? { fieldErrors: details.fieldErrors } : {}),
  ...(details.submittedValues ? { submittedValues: details.submittedValues } : {}),
});

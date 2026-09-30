import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { cn } from "../lib/cn";

type FormFieldProps = {
  name: string;
  label: string;
  children: ReactElement<{
    id?: string;
    name?: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  }>;
  hint?: ReactNode;
  errors?: readonly string[] | undefined;
  required?: boolean;
  className?: string;
};

export const FormField = ({
  name,
  label,
  children,
  hint,
  errors,
  required = false,
  className,
}: FormFieldProps) => {
  const hasErrors = errors !== undefined && errors.length > 0;
  const hintId = `${name}-hint`;
  const errorId = `${name}-error`;
  const describedBy = [hint ? hintId : null, hasErrors ? errorId : null].filter(Boolean).join(" ");

  const control = isValidElement(children)
    ? cloneElement(children, {
        id: name,
        name,
        "aria-invalid": hasErrors,
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
      })
    : children;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={name} className="text-sm font-semibold text-ink">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-accent-strong">
            *
          </span>
        ) : null}
      </label>
      {control}
      {hint ? (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {hasErrors ? (
        <p id={errorId} className="text-xs font-medium text-danger">
          {errors.join(" ")}
        </p>
      ) : null}
    </div>
  );
};

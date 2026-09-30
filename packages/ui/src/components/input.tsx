import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";

const controlClasses =
  "w-full rounded-lg border border-line-strong bg-surface px-3.5 text-sm text-ink placeholder:text-taupe transition-colors hover:border-taupe focus-visible:border-primary disabled:cursor-not-allowed disabled:bg-surface-muted aria-[invalid=true]:border-danger";

export const Input = ({ className, ...inputProps }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn(controlClasses, "h-11", className)} {...inputProps} />
);

export const Textarea = ({
  className,
  ...textareaProps
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={cn(controlClasses, "min-h-28 py-3", className)} {...textareaProps} />
);

export const Select = ({
  className,
  children,
  ...selectProps
}: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cn(controlClasses, "h-11 pr-8", className)} {...selectProps}>
    {children}
  </select>
);

"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@feri/ui";

type SubmitButtonProps = Omit<ButtonProps, "type" | "isLoading" | "asChild">;

export const SubmitButton = ({ children, ...buttonProps }: SubmitButtonProps) => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} {...buttonProps}>
      {children}
    </Button>
  );
};

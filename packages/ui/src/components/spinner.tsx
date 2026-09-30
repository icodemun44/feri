import { LoaderCircle } from "lucide-react";
import { cn } from "../lib/cn";

type SpinnerProps = {
  className?: string;
  label?: string;
};

export const Spinner = ({ className, label = "Loading" }: SpinnerProps) => (
  <span role="status" className="inline-flex items-center">
    <LoaderCircle aria-hidden="true" className={cn("size-4 animate-spin", className)} />
    <span className="sr-only">{label}</span>
  </span>
);

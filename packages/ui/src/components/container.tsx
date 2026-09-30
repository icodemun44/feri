import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export const Container = ({ className, ...divProps }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...divProps} />
);

export const Skeleton = ({ className, ...divProps }: HTMLAttributes<HTMLDivElement>) => (
  <div
    aria-hidden="true"
    className={cn("animate-pulse rounded-lg bg-surface-muted", className)}
    {...divProps}
  />
);

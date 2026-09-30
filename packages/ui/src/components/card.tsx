import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export const Card = ({ className, ...divProps }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("rounded-xl border border-line bg-surface shadow-card", className)}
    {...divProps}
  />
);

export const CardHeader = ({ className, ...divProps }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1 p-5 pb-0", className)} {...divProps} />
);

export const CardTitle = ({ className, ...headingProps }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg leading-snug", className)} {...headingProps} />
);

export const CardDescription = ({
  className,
  ...paragraphProps
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted", className)} {...paragraphProps} />
);

export const CardContent = ({ className, ...divProps }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-5", className)} {...divProps} />
);

export const CardFooter = ({ className, ...divProps }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center gap-3 p-5 pt-0", className)} {...divProps} />
);

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center gap-3 rounded-xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center",
      className,
    )}
  >
    <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
      <Icon aria-hidden="true" className="size-6" />
    </span>
    <h3 className="text-lg">{title}</h3>
    {description ? <p className="max-w-md text-sm text-muted">{description}</p> : null}
    {action ? <div className="pt-2">{action}</div> : null}
  </div>
);

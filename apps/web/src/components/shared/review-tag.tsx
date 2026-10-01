import { CircleDashed, ShieldCheck } from "lucide-react";
import { cn } from "@feri/ui";

type ReviewTagProps = {
  isChecked: boolean;
  className?: string;
};

export const ReviewTag = ({ isChecked, className }: ReviewTagProps) => (
  <span className={cn("inline-flex items-center gap-1 text-xs text-muted", className)}>
    {isChecked ? (
      <ShieldCheck aria-hidden="true" className="size-3.5" />
    ) : (
      <CircleDashed aria-hidden="true" className="size-3.5" />
    )}
    {isChecked ? "Checked" : "Not yet checked"}
  </span>
);

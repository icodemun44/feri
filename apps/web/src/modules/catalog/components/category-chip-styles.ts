import { cn } from "@feri/ui";

const CHIP_BASE_CLASSES =
  "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors";

export const getCategoryChipClassName = (isActive: boolean): string =>
  cn(
    CHIP_BASE_CLASSES,
    isActive
      ? "border-primary bg-primary text-white"
      : "border-line-strong bg-surface text-ink hover:bg-surface-muted",
  );

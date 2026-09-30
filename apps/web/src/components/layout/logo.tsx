import Link from "next/link";
import { Repeat } from "lucide-react";
import { APP_NAME } from "@feri/shared";
import { cn } from "@feri/ui";

type LogoProps = {
  className?: string;
  tone?: "dark" | "light";
};

export const Logo = ({ className, tone = "dark" }: LogoProps) => (
  <Link
    href="/"
    aria-label={`${APP_NAME} home`}
    className={cn(
      "inline-flex items-center gap-2 font-display text-xl font-semibold",
      tone === "dark" ? "text-primary" : "text-white",
      className,
    )}
  >
    <span
      className={cn(
        "flex size-8 items-center justify-center rounded-lg",
        tone === "dark" ? "bg-primary text-white" : "bg-accent text-ink",
      )}
    >
      <Repeat aria-hidden="true" className="size-4" />
    </span>
    {APP_NAME}
  </Link>
);

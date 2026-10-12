import Link from "next/link";
import { APP_NAME } from "@feri/shared";
import { cn } from "@feri/ui";

type LogoProps = {
  className?: string;
  tone?: "dark" | "light";
};

const LogoMark = () => (
  <svg aria-hidden="true" viewBox="80 20 240 290" className="h-9 w-auto">
    <path
      fill="#DC143C"
      fillRule="evenodd"
      d="M118 50 H282 A28 28 0 0 1 310 78 V272 A28 28 0 0 1 282 300 H118 A28 28 0 0 1 90 272 V78 A28 28 0 0 1 118 50 Z M200 72 A16 16 0 1 0 200 104 A16 16 0 1 0 200 72 Z"
    />
    <path
      d="M200 72 C200 40 240 24 262 34"
      fill="none"
      stroke="#003893"
      strokeWidth="10"
      strokeLinecap="round"
    />
    <g fill="none" stroke="#FFFFFF" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M196 268 V176 Q196 142 232 142" />
      <path d="M164 188 H234" />
    </g>
  </svg>
);

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
    <LogoMark />
    {APP_NAME}
  </Link>
);

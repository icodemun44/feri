import Link from "next/link";
import { APP_NAME } from "@feri/shared";
import { cn } from "@feri/ui";

type LogoTone = "dark" | "light";

type LogoProps = {
  className?: string;
  tone?: LogoTone;
};

const LogoMark = ({ tone }: { tone: LogoTone }) => (
  <svg aria-hidden="true" viewBox="80 20 240 290" className="h-9 w-auto">
    <path
      className={tone === "dark" ? "text-primary" : "text-white"}
      fill="currentColor"
      fillRule="evenodd"
      d="M118 50 H282 A28 28 0 0 1 310 78 V272 A28 28 0 0 1 282 300 H118 A28 28 0 0 1 90 272 V78 A28 28 0 0 1 118 50 Z M200 72 A16 16 0 1 0 200 104 A16 16 0 1 0 200 72 Z"
    />
    <path
      className="text-accent"
      stroke="currentColor"
      d="M200 72 C200 40 240 24 262 34"
      fill="none"
      strokeWidth="10"
      strokeLinecap="round"
    />
    <g
      className={tone === "dark" ? "text-white" : "text-primary"}
      stroke="currentColor"
      fill="none"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M138 205 A62 62 0 0 1 196 143" />
      <path d="M262 205 A62 62 0 0 1 204 267" />
      <path d="M193 242 V195 Q193 175 215 175" strokeWidth="16" />
      <path d="M176 200 H214" strokeWidth="16" />
      <polygon points="194,131 216,143 194,155" fill="currentColor" />
      <polygon points="206,255 184,267 206,279" fill="currentColor" />
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
    <LogoMark tone={tone} />
    {APP_NAME}
  </Link>
);

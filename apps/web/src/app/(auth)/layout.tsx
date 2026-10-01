import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/layout/logo";

const BRAND_WORD_IN_NEPALI = "फेरि";

const AuthBrandPanel = () => (
  <aside className="flex flex-col justify-between gap-8 bg-primary px-6 py-6 text-white sm:px-12 lg:min-h-dvh lg:py-12">
    <Logo tone="light" />

    <div className="flex flex-col gap-4">
      <p
        lang="ne"
        className="font-display text-7xl font-bold leading-none sm:text-8xl lg:text-[11rem]"
      >
        {BRAND_WORD_IN_NEPALI}
      </p>
      <p className="text-xl text-white/90 lg:text-2xl">Feri means &ldquo;again&rdquo; in Nepali.</p>
      <p className="hidden max-w-sm text-taupe lg:block">
        Clothes, watches, bags and tech with a second life, from sellers we call before they list.
      </p>
    </div>

    <p className="hidden border-t border-white/15 pt-4 text-sm text-taupe lg:block">
      Pay when your order arrives.
    </p>
  </aside>
);

const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
    <AuthBrandPanel />
    <main className="flex flex-col px-6 py-8 sm:px-12 lg:py-12">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-primary"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Back to the shop
      </Link>
      <div className="mx-auto my-auto w-full max-w-sm py-10">{children}</div>
    </main>
  </div>
);

export default AuthLayout;

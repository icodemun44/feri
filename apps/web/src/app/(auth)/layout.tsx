import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";

const AuthLayout = ({ children }: { children: ReactNode }) => (
  <main className="flex min-h-dvh flex-col items-center gap-8 px-4 py-10 sm:justify-center">
    <Logo />
    <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
      {children}
    </div>
  </main>
);

export default AuthLayout;

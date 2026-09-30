import type { ReactNode } from "react";
import { Container } from "@feri/ui";
import { DashboardNav, type DashboardNavItem } from "./dashboard-nav";

type DashboardShellProps = {
  heading: string;
  navItems: readonly DashboardNavItem[];
  children: ReactNode;
};

export const DashboardShell = ({ heading, navItems, children }: DashboardShellProps) => (
  <Container className="py-8">
    <div className="grid gap-6 lg:grid-cols-[14rem_1fr] lg:gap-10">
      <aside className="flex flex-col gap-3">
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted">{heading}</p>
        <DashboardNav items={navItems} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  </Container>
);

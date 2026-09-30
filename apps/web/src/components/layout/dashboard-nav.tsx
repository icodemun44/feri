"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, LayoutDashboard, type LucideIcon } from "lucide-react";
import { cn } from "@feri/ui";

const DASHBOARD_ICONS = {
  overview: LayoutDashboard,
  applications: ClipboardCheck,
} as const satisfies Record<string, LucideIcon>;

export type DashboardIconName = keyof typeof DASHBOARD_ICONS;

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: DashboardIconName;
  exact?: boolean;
};

const isActivePath = (pathname: string, { href, exact }: DashboardNavItem): boolean =>
  exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

export const DashboardNav = ({ items }: { items: readonly DashboardNavItem[] }) => {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col">
        {items.map((item) => {
          const Icon = DASHBOARD_ICONS[item.icon];
          const isActive = isActivePath(pathname, item);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-body hover:bg-surface-muted hover:text-ink",
                )}
              >
                <Icon aria-hidden="true" className="size-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

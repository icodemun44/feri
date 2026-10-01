"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShieldCheck, Store, Tag, type LucideProps } from "lucide-react";
import { cn } from "@feri/ui";

export type HeaderNavIconName = "browse" | "sell" | "shop" | "admin";

export type HeaderNavItem = {
  href: string;
  label: string;
  icon: HeaderNavIconName;
  activePrefixes: readonly string[];
};

const HOME_PATH = "/";

const HeaderNavIcon = ({ name, ...iconProps }: LucideProps & { name: HeaderNavIconName }) => {
  switch (name) {
    case "browse":
      return <Store {...iconProps} />;
    case "sell":
      return <Tag {...iconProps} />;
    case "shop":
      return <LayoutDashboard {...iconProps} />;
    case "admin":
      return <ShieldCheck {...iconProps} />;
  }
};

const isItemActive = (pathname: string, activePrefixes: readonly string[]): boolean =>
  activePrefixes.some((prefix) =>
    prefix === HOME_PATH ? pathname === HOME_PATH : pathname.startsWith(prefix),
  );

export const HeaderNav = ({ items }: { items: readonly HeaderNavItem[] }) => {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex items-center gap-1 rounded-full bg-surface-muted p-1">
      {items.map((item) => {
        const isActive = isItemActive(pathname, item.activePrefixes);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              isActive ? "bg-primary text-white" : "text-body hover:bg-surface hover:text-ink",
            )}
          >
            <HeaderNavIcon name={item.icon} aria-hidden="true" className="hidden size-4 sm:block" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

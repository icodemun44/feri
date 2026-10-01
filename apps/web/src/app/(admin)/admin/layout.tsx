import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { DashboardNavItem } from "@/components/layout/dashboard-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { requireAdmin } from "@/server/auth/guards";

const ADMIN_NAV_ITEMS: readonly DashboardNavItem[] = [
  { href: "/admin", label: "Overview", icon: "overview", exact: true },
  { href: "/admin/seller-applications", label: "Seller applications", icon: "applications" },
  { href: "/admin/listings", label: "Listings", icon: "listings" },
];

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  await requireAdmin("/admin");

  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShell heading="Administration" navItems={ADMIN_NAV_ITEMS}>
          {children}
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
};

export default AdminLayout;

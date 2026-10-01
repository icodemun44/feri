import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { DashboardNavItem } from "@/components/layout/dashboard-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { requireSeller } from "@/server/auth/guards";

const SELLER_NAV_ITEMS: readonly DashboardNavItem[] = [
  { href: "/seller", label: "Overview", icon: "overview", exact: true },
  { href: "/seller/listings", label: "Listings", icon: "listings" },
  { href: "/seller/orders", label: "Orders", icon: "orders" },
];

const SellerLayout = async ({ children }: { children: ReactNode }) => {
  await requireSeller("/seller");

  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShell heading="Seller dashboard" navItems={SELLER_NAV_ITEMS}>
          {children}
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
};

export default SellerLayout;

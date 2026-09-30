import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const StorefrontLayout = ({ children }: { children: ReactNode }) => (
  <>
    <SiteHeader />
    <main>{children}</main>
    <SiteFooter />
  </>
);

export default StorefrontLayout;

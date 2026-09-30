import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ROLES, isSellerApplicationOpen } from "@feri/shared";
import { Container } from "@feri/ui";
import { PageHeading } from "@/components/layout/page-heading";
import { catalogService } from "@/modules/catalog/catalog.service";
import { SellerApplicationForm } from "@/modules/seller-applications/components/seller-application-form";
import { sellerApplicationService } from "@/modules/seller-applications/seller-application.service";
import { requireRole } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Apply to sell" };

const ApplyToSellPage = async () => {
  const user = await requireRole([ROLES.BUYER], {
    nextPath: "/sell/apply",
    deniedRedirectTo: "/sell",
  });

  const latestApplication = await sellerApplicationService.getLatestForApplicant(user);
  if (latestApplication && isSellerApplicationOpen(latestApplication.status)) {
    redirect("/sell/status");
  }

  const categories = await catalogService.listCategories();

  return (
    <Container className="max-w-2xl py-8">
      <PageHeading
        title="Apply to sell"
        description="Tell us about your shop. A member of our team will call the number you give to verify your application."
      />
      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <SellerApplicationForm
          categories={categories}
          defaultEmail={user.email}
          defaultPhone={user.phone ?? ""}
        />
      </div>
    </Container>
  );
};

export default ApplyToSellPage;

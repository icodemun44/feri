import type { Metadata } from "next";
import { PackagePlus, ShoppingBag } from "lucide-react";
import { SellerStatus } from "@feri/database";
import { Alert, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@feri/ui";
import { PageHeading } from "@/components/layout/page-heading";
import { sellerRepository } from "@/modules/sellers/seller.repository";
import { requireSeller } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Seller dashboard" };

const NEXT_STEPS = [
  {
    icon: PackagePlus,
    title: "Listings",
    description:
      "Add your first items with photos, a price and the condition. Coming in the next release.",
  },
  {
    icon: ShoppingBag,
    title: "Orders",
    description:
      "Confirm and ship the orders buyers place, paid in cash on delivery. Coming in the next release.",
  },
] as const;

const SellerOverviewPage = async () => {
  const user = await requireSeller("/seller");
  const seller = await sellerRepository.findByUserId(user.id);

  return (
    <>
      <PageHeading
        title={seller ? seller.businessName : "Your shop"}
        description="Your application was approved. Here is what comes next."
      />

      {seller?.status === SellerStatus.SUSPENDED ? (
        <Alert tone="warning" title="Your shop is suspended" className="mb-6">
          Buyers cannot see your listings right now. Please contact support.
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {NEXT_STEPS.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <span className="mb-2 flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </>
  );
};

export default SellerOverviewPage;

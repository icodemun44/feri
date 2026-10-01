import type { Metadata } from "next";
import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { SellerStatus } from "@feri/database";
import { PRODUCT_STATUSES } from "@feri/shared";
import { Alert, Button, Card, CardContent } from "@feri/ui";
import { PageHeading } from "@/components/layout/page-heading";
import { listingService } from "@/modules/listings/listing.service";
import { orderFulfilmentService } from "@/modules/orders/order-fulfilment.service";
import { sellerRepository } from "@/modules/sellers/seller.repository";
import { requireSeller } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Seller dashboard" };

const SellerOverviewPage = async () => {
  const user = await requireSeller("/seller");
  const [seller, orderCounts, listings] = await Promise.all([
    sellerRepository.findByUserId(user.id),
    orderFulfilmentService.countForSeller(user),
    listingService.listMine(user),
  ]);
  const liveListingCount = listings.filter(
    (listing) => listing.status === PRODUCT_STATUSES.ACTIVE,
  ).length;

  const statCards = [
    { label: "New orders to confirm", value: orderCounts.toConfirm, href: "/seller/orders" },
    { label: "Ready to ship", value: orderCounts.toShip, href: "/seller/orders" },
    { label: "On the way to buyers", value: orderCounts.toDeliver, href: "/seller/orders" },
    { label: "Live listings", value: liveListingCount, href: "/seller/listings" },
  ];

  return (
    <>
      <PageHeading
        title={seller ? seller.businessName : "Your shop"}
        description="Here is what needs your attention today."
        action={
          <Button asChild variant="accent">
            <Link href="/seller/listings/new">
              <PackagePlus aria-hidden="true" className="size-4" />
              New listing
            </Link>
          </Button>
        }
      />

      {seller?.status === SellerStatus.SUSPENDED ? (
        <Alert tone="warning" title="Your shop is suspended" className="mb-6">
          Buyers cannot see your listings right now. Please contact support.
        </Alert>
      ) : null}

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ label, value, href }) => (
          <Card key={label}>
            <CardContent className="flex flex-col gap-1">
              <dt className="text-sm text-muted">{label}</dt>
              <dd>
                <Link
                  href={href}
                  className="font-display text-4xl font-semibold text-ink hover:underline"
                >
                  {value}
                </Link>
              </dd>
            </CardContent>
          </Card>
        ))}
      </dl>
    </>
  );
};

export default SellerOverviewPage;

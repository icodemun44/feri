import type { Metadata } from "next";
import Link from "next/link";
import { SELLER_APPLICATION_STATUSES } from "@feri/shared";
import { Button, Card, CardContent } from "@feri/ui";
import { PageHeading } from "@/components/layout/page-heading";
import { listingService } from "@/modules/listings/listing.service";
import { sellerApplicationService } from "@/modules/seller-applications/seller-application.service";
import { requireAdmin } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Admin overview" };

const AdminOverviewPage = async () => {
  const admin = await requireAdmin("/admin");
  const [counts, listingCounts] = await Promise.all([
    sellerApplicationService.countForAdmin(admin),
    listingService.countForAdmin(admin),
  ]);

  const statCards = [
    { label: "Waiting for review", value: counts[SELLER_APPLICATION_STATUSES.PENDING] },
    { label: "In review", value: counts[SELLER_APPLICATION_STATUSES.IN_REVIEW] },
    { label: "Approved sellers", value: counts[SELLER_APPLICATION_STATUSES.APPROVED] },
    { label: "Rejected", value: counts[SELLER_APPLICATION_STATUSES.REJECTED] },
    { label: "Listings to check", value: listingCounts.needsReview },
  ];

  return (
    <>
      <PageHeading
        title="Overview"
        description="Seller applications are the first thing to check each day."
        action={
          <Button asChild>
            <Link href="/admin/seller-applications?status=PENDING">
              Review waiting applications
            </Link>
          </Button>
        }
      />

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {statCards.map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="flex flex-col gap-1">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="font-display text-4xl font-semibold text-ink">{value}</dd>
            </CardContent>
          </Card>
        ))}
      </dl>
    </>
  );
};

export default AdminOverviewPage;

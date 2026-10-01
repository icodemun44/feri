import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  AppError,
  ERROR_CODES,
  formatPaisa,
  PRODUCT_REVIEW_STATUSES,
  PRODUCT_STATUSES,
} from "@feri/shared";
import { uuidField } from "@feri/validation";
import { Alert, Card, CardContent, CardHeader, CardTitle } from "@feri/ui";
import { ReviewTag } from "@/components/shared/review-tag";
import { formatDateTime } from "@/lib/format";
import { PRODUCT_CONDITION_LABELS } from "@/modules/catalog/catalog.constants";
import { AdminListingReviewPanel } from "@/modules/listings/components/admin-listing-review-panel";
import { ListingStatusBadge } from "@/modules/listings/components/listing-status-badge";
import { listingService } from "@/modules/listings/listing.service";
import type { ListingRecord } from "@/modules/listings/listing.types";
import { requireAdmin } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Check listing" };

type AdminListingPageProps = {
  params: Promise<{ productId: string }>;
};

const loadListing = async (productId: string): Promise<ListingRecord> => {
  const admin = await requireAdmin(`/admin/listings/${productId}`);
  if (!uuidField.safeParse(productId).success) {
    notFound();
  }
  try {
    return await listingService.getForAdmin(admin, productId);
  } catch (error) {
    if (error instanceof AppError && error.code === ERROR_CODES.NOT_FOUND) {
      notFound();
    }
    throw error;
  }
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5">
    <dt className="text-xs font-semibold text-muted">{label}</dt>
    <dd className="text-ink">{value}</dd>
  </div>
);

const AdminListingPage = async ({ params }: AdminListingPageProps) => {
  const { productId } = await params;
  const listing = await loadListing(productId);

  return (
    <>
      <Link
        href="/admin/listings"
        className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        All listings
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">{listing.title}</h1>
        <ListingStatusBadge status={listing.status} />
        <ReviewTag isChecked={listing.reviewStatus === PRODUCT_REVIEW_STATUSES.APPROVED} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              {listing.images.length === 0 ? (
                <p className="text-muted">No photos were added.</p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {listing.images.map((image) => (
                    <li
                      key={image.id}
                      className="aspect-square overflow-hidden rounded-xl border border-line bg-surface-muted"
                    >
                      <img
                        src={image.url}
                        alt={image.altText ?? ""}
                        className="size-full object-cover"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailRow label="Price" value={formatPaisa(listing.priceMinor)} />
                <DetailRow label="Condition" value={PRODUCT_CONDITION_LABELS[listing.condition]} />
                <DetailRow label="Category" value={listing.categoryName} />
                <DetailRow label="Seller" value={listing.sellerName} />
                {listing.brand ? <DetailRow label="Brand" value={listing.brand} /> : null}
                {listing.size ? <DetailRow label="Size" value={listing.size} /> : null}
                {listing.publishedAt ? (
                  <DetailRow label="Published" value={formatDateTime(listing.publishedAt)} />
                ) : null}
              </dl>
              <p className="mt-5 whitespace-pre-line text-ink">{listing.description}</p>
            </CardContent>
          </Card>

          {listing.status === PRODUCT_STATUSES.REMOVED && listing.removalReason ? (
            <Alert tone="danger" title="Removed">
              {listing.removalReason}
            </Alert>
          ) : null}
        </div>

        <AdminListingReviewPanel
          productId={listing.id}
          status={listing.status}
          reviewStatus={listing.reviewStatus}
        />
      </div>
    </>
  );
};

export default AdminListingPage;

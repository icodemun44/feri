import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { formatPaisa, PRODUCT_REVIEW_STATUSES } from "@feri/shared";
import { Button, cn, EmptyState } from "@feri/ui";
import { PageHeading } from "@/components/layout/page-heading";
import { Pagination } from "@/components/layout/pagination";
import { ReviewTag } from "@/components/shared/review-tag";
import { formatDate } from "@/lib/format";
import { ListingStatusBadge } from "@/modules/listings/components/listing-status-badge";
import {
  LISTING_REVIEW_FILTER_OPTIONS,
  LISTING_REVIEW_FILTERS,
  parseListingReviewFilter,
} from "@/modules/listings/listing.constants";
import { listingService } from "@/modules/listings/listing.service";
import { requireAdmin } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Listings" };

type AdminListingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const parsePage = (value: string | string[] | undefined): number | undefined => {
  const page = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isInteger(page) ? page : undefined;
};

const AdminListingsPage = async ({ searchParams }: AdminListingsPageProps) => {
  const admin = await requireAdmin("/admin/listings");
  const rawParameters = await searchParams;
  const filter = parseListingReviewFilter(rawParameters["filter"]);
  const listings = await listingService.listForAdmin(admin, {
    filter,
    page: parsePage(rawParameters["page"]),
  });

  return (
    <>
      <PageHeading
        title="Listings"
        description="New listings go live straight away. Check them here, oldest first, and remove anything that should not be on the site."
      />

      <nav aria-label="Filter listings" className="mb-5 flex flex-wrap gap-2">
        {LISTING_REVIEW_FILTER_OPTIONS.map((option) => {
          const isActive = option.filter === filter;
          return (
            <Link
              key={option.filter}
              href={
                option.filter === LISTING_REVIEW_FILTERS.NEEDS_REVIEW
                  ? "/admin/listings"
                  : `/admin/listings?filter=${option.filter}`
              }
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-line-strong bg-surface text-ink hover:bg-surface-muted",
              )}
            >
              {option.label}
            </Link>
          );
        })}
      </nav>

      {listings.items.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Nothing to show here"
          description="When sellers publish new listings, they will appear in this list."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {listings.items.map((listing) => (
            <li key={listing.id} className="flex flex-wrap items-center gap-4 p-4">
              <span className="size-16 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-muted">
                {listing.coverImageUrl ? (
                  <img src={listing.coverImageUrl} alt="" className="size-full object-cover" />
                ) : null}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate font-semibold text-ink">{listing.title}</span>
                <span className="text-sm text-muted">
                  {formatPaisa(listing.priceMinor)} - {listing.sellerName}
                  {listing.publishedAt ? ` - published ${formatDate(listing.publishedAt)}` : ""}
                </span>
                <ReviewTag isChecked={listing.reviewStatus === PRODUCT_REVIEW_STATUSES.APPROVED} />
              </span>
              <ListingStatusBadge status={listing.status} />
              <Button asChild size="sm" variant="secondary">
                <Link href={`/admin/listings/${listing.id}`}>Open</Link>
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Pagination
        basePath="/admin/listings"
        page={listings.page}
        totalPages={listings.totalPages}
        queryParameters={{
          filter: filter === LISTING_REVIEW_FILTERS.NEEDS_REVIEW ? undefined : filter,
        }}
      />
    </>
  );
};

export default AdminListingsPage;

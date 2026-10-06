import type { Metadata } from "next";
import Link from "next/link";
import { PackagePlus, Plus } from "lucide-react";
import { formatPaisa, PRODUCT_REVIEW_STATUSES } from "@feri/shared";
import { Button, EmptyState } from "@feri/ui";
import { PageHeading } from "@/components/layout/page-heading";
import { ReviewTag } from "@/components/shared/review-tag";
import { ListingStatusBadge } from "@/modules/listings/components/listing-status-badge";
import { listingService } from "@/modules/listings/listing.service";
import { requireSeller } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Your listings" };

const NEW_LISTING_PATH = "/seller/listings/new";

const NewListingButton = () => (
  <Button asChild>
    <Link href={NEW_LISTING_PATH}>
      <Plus aria-hidden="true" className="size-4" />
      New listing
    </Link>
  </Button>
);

const SellerListingsPage = async () => {
  const user = await requireSeller("/seller/listings");
  const listings = await listingService.listMine(user);

  return (
    <>
      <PageHeading
        title="Your listings"
        description="Listings go live as soon as you publish them. Our team checks new listings shortly after."
        action={listings.length > 0 ? <NewListingButton /> : undefined}
      />

      {listings.length === 0 ? (
        <EmptyState
          icon={PackagePlus}
          title="You have no listings yet"
          description="Add your first item with a few photos and a fair price. It takes about five minutes."
          action={<NewListingButton />}
        />
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {listings.map((listing) => (
            <li key={listing.id}>
              <Link
                href={`/seller/listings/${listing.id}`}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-surface-muted"
              >
                <span className="size-16 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-muted">
                  {listing.coverImageUrl ? (
                    <img src={listing.coverImageUrl} alt="" className="size-full object-cover" />
                  ) : null}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-semibold text-ink">{listing.title}</span>
                  <span className="text-sm text-muted">
                    {formatPaisa(listing.priceMinor)} - {listing.categoryName}
                  </span>
                  <ReviewTag
                    isChecked={listing.reviewStatus === PRODUCT_REVIEW_STATUSES.APPROVED}
                  />
                </span>
                <ListingStatusBadge status={listing.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default SellerListingsPage;

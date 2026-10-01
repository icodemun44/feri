import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AppError, ERROR_CODES, PRODUCT_REVIEW_STATUSES, PRODUCT_STATUSES } from "@feri/shared";
import { uuidField } from "@feri/validation";
import { Alert, Card, CardContent, CardHeader, CardTitle } from "@feri/ui";
import { ReviewTag } from "@/components/shared/review-tag";
import { catalogService } from "@/modules/catalog/catalog.service";
import { ListingActions } from "@/modules/listings/components/listing-actions";
import { ListingForm } from "@/modules/listings/components/listing-form";
import { ListingImageManager } from "@/modules/listings/components/listing-image-manager";
import { ListingStatusBadge } from "@/modules/listings/components/listing-status-badge";
import { listingService } from "@/modules/listings/listing.service";
import type { ListingRecord } from "@/modules/listings/listing.types";
import { requireSeller } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Edit listing" };

type EditListingPageProps = {
  params: Promise<{ productId: string }>;
};

const loadListing = async (productId: string): Promise<ListingRecord> => {
  const user = await requireSeller(`/seller/listings/${productId}`);
  if (!uuidField.safeParse(productId).success) {
    notFound();
  }
  try {
    return await listingService.getMine(user, productId);
  } catch (error) {
    if (error instanceof AppError && error.code === ERROR_CODES.NOT_FOUND) {
      notFound();
    }
    throw error;
  }
};

const EditListingPage = async ({ params }: EditListingPageProps) => {
  const { productId } = await params;
  const listing = await loadListing(productId);
  const categories = await catalogService.listCategories();
  const isRemoved = listing.status === PRODUCT_STATUSES.REMOVED;

  return (
    <>
      <Link
        href="/seller/listings"
        className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        All listings
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">{listing.title}</h1>
        <ListingStatusBadge status={listing.status} />
        {listing.status === PRODUCT_STATUSES.DRAFT ? null : (
          <ReviewTag isChecked={listing.reviewStatus === PRODUCT_REVIEW_STATUSES.APPROVED} />
        )}
      </div>

      {isRemoved ? (
        <Alert tone="danger" title="This listing was removed by our team">
          {listing.removalReason}
        </Alert>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <ListingForm categories={categories} listing={listing} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <ListingImageManager productId={listing.id} images={listing.images} />
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ListingActions
                productId={listing.id}
                status={listing.status}
                hasPhotos={listing.images.length > 0}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default EditListingPage;

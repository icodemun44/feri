import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { catalogService } from "@/modules/catalog/catalog.service";
import { ListingForm } from "@/modules/listings/components/listing-form";
import { requireSeller } from "@/server/auth/guards";

export const metadata: Metadata = { title: "New listing" };

const NewListingPage = async () => {
  await requireSeller("/seller/listings/new");
  const categories = await catalogService.listCategories();

  return (
    <>
      <Link
        href="/seller/listings"
        className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        All listings
      </Link>
      <PageHeading
        title="New listing"
        description="Start with the details. You will add photos on the next step."
      />
      <div className="max-w-2xl rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <ListingForm categories={categories} />
      </div>
    </>
  );
};

export default NewListingPage;

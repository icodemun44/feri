import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn, EmptyState } from "@feri/ui";
import { PageHeading } from "@/components/layout/page-heading";
import { Pagination } from "@/components/layout/pagination";
import { StarRating } from "@/components/shared/star-rating";
import { formatDate } from "@/lib/format";
import { RemoveReviewForm } from "@/modules/reviews/components/remove-review-form";
import { reviewService } from "@/modules/reviews/review.service";
import type { AdminReviewFilter } from "@/modules/reviews/review.types";
import { requireAdmin } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Reviews" };

const DEFAULT_FILTER: AdminReviewFilter = "visible";

const FILTER_OPTIONS: readonly { filter: AdminReviewFilter; label: string }[] = [
  { filter: "visible", label: "Visible" },
  { filter: "removed", label: "Removed" },
];

type AdminReviewsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const parseFilter = (value: string | string[] | undefined): AdminReviewFilter =>
  value === "removed" ? "removed" : DEFAULT_FILTER;

const parsePage = (value: string | string[] | undefined): number | undefined => {
  const page = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isInteger(page) ? page : undefined;
};

const AdminReviewsPage = async ({ searchParams }: AdminReviewsPageProps) => {
  const admin = await requireAdmin("/admin/reviews");
  const rawParameters = await searchParams;
  const filter = parseFilter(rawParameters["filter"]);
  const reviews = await reviewService.listForAdmin(admin, {
    filter,
    page: parsePage(rawParameters["page"]),
  });

  return (
    <>
      <PageHeading
        title="Reviews"
        description="Buyers can only review items they received. Remove reviews that are abusive or not about the purchase."
      />

      <nav aria-label="Filter reviews" className="mb-5 flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => {
          const isActive = option.filter === filter;
          return (
            <Link
              key={option.filter}
              href={
                option.filter === DEFAULT_FILTER
                  ? "/admin/reviews"
                  : `/admin/reviews?filter=${option.filter}`
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

      {reviews.items.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews here"
          description="Reviews appear after buyers rate delivered orders."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {reviews.items.map((review) => (
            <li key={review.id} className="flex flex-col gap-2 p-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <StarRating rating={review.rating} />
                <span className="text-sm font-semibold text-ink">{review.reviewerName}</span>
                <span className="text-xs text-muted">{formatDate(review.createdAt)}</span>
              </div>
              <p className="text-sm text-muted">
                {review.productTitle} - sold by {review.sellerName}
              </p>
              {review.comment ? (
                <p className="whitespace-pre-line text-body">{review.comment}</p>
              ) : null}
              {review.isRemoved ? (
                <p className="text-sm text-muted">Removed: {review.removalReason}</p>
              ) : (
                <div>
                  <RemoveReviewForm reviewId={review.id} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <Pagination
        basePath="/admin/reviews"
        page={reviews.page}
        totalPages={reviews.totalPages}
        queryParameters={{ filter: filter === DEFAULT_FILTER ? undefined : filter }}
      />
    </>
  );
};

export default AdminReviewsPage;

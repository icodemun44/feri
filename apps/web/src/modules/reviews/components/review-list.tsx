import { StarRating } from "@/components/shared/star-rating";
import { formatDate } from "@/lib/format";
import type { ReviewView } from "../review.types";

type ReviewListProps = {
  reviews: readonly ReviewView[];
  emptyMessage?: string;
};

export const ReviewList = ({ reviews, emptyMessage = "No reviews yet." }: ReviewListProps) => {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-line">
      {reviews.map((review) => (
        <li key={review.id} className="flex flex-col gap-1.5 py-4 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StarRating rating={review.rating} />
            <span className="text-sm font-semibold text-ink">{review.reviewerName}</span>
            <span className="text-xs text-muted">{formatDate(review.createdAt)}</span>
          </div>
          <p className="text-xs text-muted">Bought: {review.productTitle}</p>
          {review.comment ? (
            <p className="whitespace-pre-line text-body">{review.comment}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
};

import { Star } from "lucide-react";
import { cn } from "@feri/ui";

const STAR_POSITIONS = [1, 2, 3, 4, 5] as const;
const AVERAGE_DECIMALS = 1;

type StarRatingProps = {
  rating: number;
  reviewCount?: number;
  className?: string;
};

export const StarRating = ({ rating, reviewCount, className }: StarRatingProps) => {
  const roundedRating = Math.round(rating);
  const label =
    reviewCount === undefined
      ? `Rated ${rating.toFixed(AVERAGE_DECIMALS)} out of 5`
      : `Rated ${rating.toFixed(AVERAGE_DECIMALS)} out of 5 from ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`;

  return (
    <span role="img" aria-label={label} className={cn("inline-flex items-center gap-1", className)}>
      <span className="inline-flex">
        {STAR_POSITIONS.map((position) => (
          <Star
            key={position}
            aria-hidden="true"
            className={cn(
              "size-4",
              position <= roundedRating ? "fill-accent text-accent" : "text-line-strong",
            )}
          />
        ))}
      </span>
      <span aria-hidden="true" className="text-sm font-semibold text-ink">
        {rating.toFixed(AVERAGE_DECIMALS)}
      </span>
      {reviewCount === undefined ? null : (
        <span aria-hidden="true" className="text-sm text-muted">
          ({reviewCount})
        </span>
      )}
    </span>
  );
};

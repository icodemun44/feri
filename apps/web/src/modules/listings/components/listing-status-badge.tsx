import type { ProductStatus } from "@feri/database";
import { Badge } from "@feri/ui";
import { LISTING_STATUS_LABELS, LISTING_STATUS_TONES } from "../listing.constants";

export const ListingStatusBadge = ({ status }: { status: ProductStatus }) => (
  <Badge tone={LISTING_STATUS_TONES[status]}>{LISTING_STATUS_LABELS[status]}</Badge>
);

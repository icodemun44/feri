import type { SellerApplicationStatus } from "@feri/shared";
import { Badge } from "@feri/ui";
import {
  SELLER_APPLICATION_STATUS_LABELS,
  SELLER_APPLICATION_STATUS_TONES,
} from "../seller-application.constants";

export const ApplicationStatusBadge = ({ status }: { status: SellerApplicationStatus }) => (
  <Badge tone={SELLER_APPLICATION_STATUS_TONES[status]}>
    {SELLER_APPLICATION_STATUS_LABELS[status]}
  </Badge>
);

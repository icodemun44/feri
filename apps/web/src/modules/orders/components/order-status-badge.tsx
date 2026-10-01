import type { OrderStatus } from "@feri/database";
import { Badge } from "@feri/ui";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from "../order.constants";

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => (
  <Badge tone={ORDER_STATUS_TONES[status]}>{ORDER_STATUS_LABELS[status]}</Badge>
);

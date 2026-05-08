import { Badge } from "@modulus/ui";
import type { OrderStatus } from "@modulus/types";

type OrderStatusBadgeProps = {
  status: OrderStatus;
  "data-testid"?: string;
};

const LABELS: Record<OrderStatus, string> = {
  pending:    "Pending",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
};

const TEST_IDS: Record<OrderStatus, string> = {
  pending:    "status-badge-pending",
  processing: "status-badge-processing",
  shipped:    "status-badge-shipped",
  delivered:  "status-badge-delivered",
  cancelled:  "status-badge-cancelled",
};

export function OrderStatusBadge({ status, "data-testid": testId }: OrderStatusBadgeProps) {
  return (
    <Badge
      variant={status}
      data-testid={testId ?? TEST_IDS[status]}
    >
      {LABELS[status]}
    </Badge>
  );
}

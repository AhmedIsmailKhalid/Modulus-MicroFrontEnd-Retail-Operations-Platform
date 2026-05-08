import { Badge } from "@modulus/ui";
import { getStockStatus } from "@modulus/types";

type StockBadgeProps = {
  stock: number;
};

const LABELS = {
  in_stock:    "In Stock",
  low_stock:   "Low Stock",
  out_of_stock: "Out of Stock",
};

const TEST_IDS = {
  in_stock:    "stock-badge-green",
  low_stock:   "stock-badge-amber",
  out_of_stock: "stock-badge-red",
};

export function StockBadge({ stock }: StockBadgeProps) {
  const status = getStockStatus(stock);
  return (
    <Badge
      variant={status}
      data-testid={TEST_IDS[status]}
    >
      {LABELS[status]} ({stock})
    </Badge>
  );
}

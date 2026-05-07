import { cn } from "./utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "in_stock"
  | "low_stock"
  | "out_of_stock";

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  "data-testid"?: string;
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const variantStyles: Record<BadgeVariant, string> = {
  default:     "bg-gray-100 text-gray-700",
  success:     "bg-green-100 text-green-800",
  warning:     "bg-yellow-100 text-yellow-800",
  danger:      "bg-red-100 text-red-800",
  info:        "bg-blue-100 text-blue-800",
  purple:      "bg-purple-100 text-purple-800",
  // Order statuses
  pending:     "bg-yellow-100 text-yellow-800",
  processing:  "bg-blue-100 text-blue-800",
  shipped:     "bg-purple-100 text-purple-800",
  delivered:   "bg-green-100 text-green-800",
  cancelled:   "bg-red-100 text-red-800",
  // Stock statuses
  in_stock:    "bg-green-100 text-green-800",
  low_stock:   "bg-yellow-100 text-yellow-800",
  out_of_stock:"bg-red-100 text-red-800",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Badge({ variant = "default", children, className, "data-testid": testId }: BadgeProps) {
  return (
    <span
      data-testid={testId}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

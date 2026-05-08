import { CheckCircle2, Clock, XCircle } from "lucide-react";

import type { StatusEvent, OrderStatus } from "@modulus/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderTimelineProps = {
  timeline: StatusEvent[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month:  "short",
    day:    "numeric",
    year:   "numeric",
    hour:   "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  pending:    <Clock      className="h-4 w-4 text-yellow-500" />,
  processing: <Clock      className="h-4 w-4 text-blue-500" />,
  shipped:    <CheckCircle2 className="h-4 w-4 text-purple-500" />,
  delivered:  <CheckCircle2 className="h-4 w-4 text-green-500" />,
  cancelled:  <XCircle    className="h-4 w-4 text-red-500" />,
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:    "Order Placed",
  processing: "Processing Started",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderTimeline({ timeline }: OrderTimelineProps) {
  const sorted = [...timeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  return (
    <div className="flex flex-col gap-0" data-testid="order-timeline">
      {sorted.map((event, idx) => (
        <div key={idx} className="flex gap-3">
          {/* Icon + line */}
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
              {STATUS_ICONS[event.status]}
            </div>
            {idx < sorted.length - 1 && (
              <div className="w-px flex-1 bg-gray-200 my-1" />
            )}
          </div>

          {/* Content */}
          <div className="pb-4 pt-1">
            <p className="text-sm font-medium text-gray-900">
              {STATUS_LABELS[event.status]}
            </p>
            <p className="text-xs text-gray-500">{formatDateTime(event.timestamp)}</p>
            {event.note && (
              <p className="mt-0.5 text-xs text-gray-600 italic">{event.note}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

import { ChartSkeleton } from "@modulus/ui";
import type { OrderStatus } from "@modulus/types";

import { useAnalyticsStore } from "../store/analyticsStore";

// ─── Colour map ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:    "#f59e0b",
  processing: "#3b82f6",
  shipped:    "#8b5cf6",
  delivered:  "#10b981",
  cancelled:  "#ef4444",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:    "Pending",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { status: string } }>;
};

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  if (!item) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-medium text-gray-700">{STATUS_LABELS[item.payload.status as OrderStatus] ?? item.name}</p>
      <p className="font-semibold text-gray-900">{item.value} orders</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OrdersByStatusChart() {
  const { ordersByStatus, isLoading } = useAnalyticsStore();

  if (isLoading) return <ChartSkeleton height={280} />;

  const data = ordersByStatus.map((d) => ({
    status: d.status,
    name:   STATUS_LABELS[d.status] ?? d.status,
    value:  d.count,
    color:  STATUS_COLORS[d.status] ?? "#6b7280",
  }));

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      data-testid="orders-by-status-chart"
    >
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Orders by Status</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            outerRadius={100}
            innerRadius={55}
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} stroke="white" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

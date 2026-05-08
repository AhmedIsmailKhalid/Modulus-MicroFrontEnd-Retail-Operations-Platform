import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

import { ChartSkeleton } from "@modulus/ui";

import { useAnalyticsStore } from "../store/analyticsStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRevenue(cents: number): string {
  return `$${(cents / 100).toLocaleString()}`;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number; payload: { orders: number } }>;
  label?: string;
};

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  if (!item) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-medium text-gray-700">{label}</p>
      <p className="font-semibold text-emerald-600">{formatRevenue(item.value)}</p>
      <p className="text-gray-500">{item.payload.orders} orders</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const REGION_COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5", "#ecfdf5"];

export function RegionalSalesChart() {
  const { regionalSales, isLoading } = useAnalyticsStore();

  if (isLoading) return <ChartSkeleton height={280} />;

  const data = [...regionalSales].sort((a, b) => b.revenue - a.revenue);

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      data-testid="regional-sales-chart"
    >
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Regional Sales</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v: number) => `$${(v / 100 / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="region"
            width={90}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {data.map((_, index) => (
              <Cell key={index} fill={REGION_COLORS[index % REGION_COLORS.length] ?? "#10b981"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

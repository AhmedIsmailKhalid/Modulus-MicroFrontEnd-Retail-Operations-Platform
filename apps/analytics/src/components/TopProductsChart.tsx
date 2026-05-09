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

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number; payload: { fullName: string; unitsSold: number } }>;
};

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  if (!item) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-xs max-w-[180px]">
      <p className="font-medium text-gray-700 leading-tight">{item.payload.fullName}</p>
      <p className="font-semibold text-blue-600">{formatRevenue(item.value)}</p>
      <p className="text-gray-500">{item.payload.unitsSold} units sold</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TopProductsChart() {
  const { topProducts, isLoading } = useAnalyticsStore();

  if (isLoading) return <ChartSkeleton height={320} />;

  const data = topProducts.slice(0, 10).map((p, i) => ({
    name:      truncate(p.name, 20),
    fullName:  p.name,
    revenue:   p.revenue,
    unitsSold: p.unitsSold,
    fill:      i < 3 ? "#3b82f6" : "#93c5fd",
  }));

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      data-testid="top-products-chart"
    >
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Top Products by Revenue</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v: number) => `$${(v / 100 / 1000).toFixed(1)}k`}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import { DollarSign, ShoppingCart, TrendingUp, RotateCcw } from "lucide-react";

import { MetricSkeleton } from "@modulus/ui";

import { useAnalyticsStore } from "../store/analyticsStore";
import { MetricCard } from "./MetricCard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRevenue(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000)     return `$${(dollars / 1_000).toFixed(1)}K`;
  return `$${dollars.toFixed(2)}`;
}

function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MetricCards() {
  const { summary, isLoading } = useAnalyticsStore();

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" data-testid="metric-cards">
        {[0, 1, 2, 3].map((i) => <MetricSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" data-testid="metric-cards">
      <MetricCard
        title="Total Revenue"
        value={formatRevenue(summary.totalRevenue)}
        icon={DollarSign}
        iconColor="text-blue-600"
        iconBg="bg-blue-50"
        data-testid="metric-total-revenue"
      />
      <MetricCard
        title="Total Orders"
        value={summary.totalOrders.toLocaleString()}
        icon={ShoppingCart}
        iconColor="text-purple-600"
        iconBg="bg-purple-50"
        data-testid="metric-total-orders"
      />
      <MetricCard
        title="Avg Order Value"
        value={formatRevenue(summary.averageOrderValue)}
        icon={TrendingUp}
        iconColor="text-emerald-600"
        iconBg="bg-emerald-50"
        data-testid="metric-avg-order-value"
      />
      <MetricCard
        title="Return Rate"
        value={formatRate(summary.returnRate)}
        icon={RotateCcw}
        iconColor="text-amber-600"
        iconBg="bg-amber-50"
        data-testid="metric-return-rate"
      />
    </div>
  );
}

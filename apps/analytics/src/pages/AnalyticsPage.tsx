import { useAnalytics } from "../hooks/useAnalytics";
import { DateRangePicker } from "../components/DateRangePicker";
import { MetricCards } from "../components/MetricCards";
import { RevenueChart } from "../components/RevenueChart";
import { OrdersByStatusChart } from "../components/OrdersByStatusChart";
import { TopProductsChart } from "../components/TopProductsChart";
import { RegionalSalesChart } from "../components/RegionalSalesChart";
import { useAnalyticsStore } from "../store/analyticsStore";

export function AnalyticsPage() {
  useAnalytics();
  const { error } = useAnalyticsStore();

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="analytics-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Monitor revenue, orders, and business performance.
          </p>
        </div>
        <DateRangePicker />
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Metric cards */}
      <MetricCards />

      {/* Charts — row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <OrdersByStatusChart />
        </div>
      </div>

      {/* Charts — row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopProductsChart />
        <RegionalSalesChart />
      </div>
    </div>
  );
}

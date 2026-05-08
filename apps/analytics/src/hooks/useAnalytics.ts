import { useCallback, useEffect } from "react";

import type {
  AnalyticsSummary,
  DailyRevenue,
  OrdersByStatus,
  TopProduct,
  RegionalSales,
} from "@modulus/types";

import { useAnalyticsStore } from "../store/analyticsStore";

export function useAnalytics() {
  const store = useAnalyticsStore();

  const fetchAll = useCallback(async () => {
    store.setLoading(true);
    store.setError(null);

    const params = new URLSearchParams({
      startDate: store.startDate,
      endDate:   store.endDate,
    });

    try {
      const [summaryRes, revenueRes, statusRes, productsRes, regionalRes] =
        await Promise.all([
          fetch(`/api/analytics/summary?${params.toString()}`),
          fetch(`/api/analytics/revenue?${params.toString()}`),
          fetch(`/api/analytics/orders-by-status?${params.toString()}`),
          fetch(`/api/analytics/top-products?${params.toString()}`),
          fetch(`/api/analytics/regional?${params.toString()}`),
        ]);

      if (!summaryRes.ok || !revenueRes.ok || !statusRes.ok || !productsRes.ok || !regionalRes.ok) {
        throw new Error("One or more analytics requests failed");
      }

      const [summary, revenue, status, products, regional] = await Promise.all([
        summaryRes.json()  as Promise<AnalyticsSummary>,
        revenueRes.json()  as Promise<{ data: DailyRevenue[] }>,
        statusRes.json()   as Promise<{ data: OrdersByStatus[] }>,
        productsRes.json() as Promise<{ data: TopProduct[] }>,
        regionalRes.json() as Promise<{ data: RegionalSales[] }>,
      ]);

      store.setSummary(summary);
      store.setDailyRevenue(revenue.data);
      store.setOrdersByStatus(status.data);
      store.setTopProducts(products.data);
      store.setRegionalSales(regional.data);
    } catch {
      store.setError("Failed to load analytics data. Please try again.");
    } finally {
      store.setLoading(false);
    }
  }, [store.startDate, store.endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return { refetch: fetchAll };
}

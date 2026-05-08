import { create } from "zustand";

import type {
  AnalyticsSummary,
  DailyRevenue,
  OrdersByStatus,
  TopProduct,
  RegionalSales,
} from "@modulus/types";

// ─── Date helpers ─────────────────────────────────────────────────────────────

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

function defaultStartDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 29);
  return toDateString(d);
}

function defaultEndDate(): string {
  return toDateString(new Date());
}

// ─── Types ────────────────────────────────────────────────────────────────────

type AnalyticsStore = {
  // Data
  summary: AnalyticsSummary | null;
  dailyRevenue: DailyRevenue[];
  ordersByStatus: OrdersByStatus[];
  topProducts: TopProduct[];
  regionalSales: RegionalSales[];

  // Date range
  startDate: string;
  endDate: string;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setSummary: (summary: AnalyticsSummary) => void;
  setDailyRevenue: (data: DailyRevenue[]) => void;
  setOrdersByStatus: (data: OrdersByStatus[]) => void;
  setTopProducts: (data: TopProduct[]) => void;
  setRegionalSales: (data: RegionalSales[]) => void;
  setDateRange: (startDate: string, endDate: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  summary: null,
  dailyRevenue: [],
  ordersByStatus: [],
  topProducts: [],
  regionalSales: [],
  startDate: defaultStartDate(),
  endDate: defaultEndDate(),
  isLoading: false,
  error: null,

  setSummary:        (summary)        => set({ summary }),
  setDailyRevenue:   (dailyRevenue)   => set({ dailyRevenue }),
  setOrdersByStatus: (ordersByStatus) => set({ ordersByStatus }),
  setTopProducts:    (topProducts)    => set({ topProducts }),
  setRegionalSales:  (regionalSales)  => set({ regionalSales }),

  setDateRange: (startDate, endDate) => set({ startDate, endDate }),

  setLoading: (isLoading) => set({ isLoading }),
  setError:   (error)     => set({ error }),
}));

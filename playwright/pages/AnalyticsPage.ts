import { type Page, type Locator, expect } from "@playwright/test";

export class AnalyticsPage {
  readonly page: Page;
  readonly dashboard: Locator;
  readonly revenueChart: Locator;
  readonly ordersByStatusChart: Locator;
  readonly topProductsChart: Locator;
  readonly regionalSalesChart: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboard = page.locator('[data-testid="analytics-dashboard"]');
    this.revenueChart = page.locator('[data-testid="revenue-chart"]');
    this.ordersByStatusChart = page.locator('[data-testid="orders-by-status-chart"]');
    this.topProductsChart = page.locator('[data-testid="top-products-chart"]');
    this.regionalSalesChart = page.locator('[data-testid="regional-sales-chart"]');
  }

  async assertVisible() {
    await expect(this.dashboard).toBeVisible();
  }

  async assertAllChartsRendered() {
    await expect(this.revenueChart).toBeVisible();
    await expect(this.ordersByStatusChart).toBeVisible();
    await expect(this.topProductsChart).toBeVisible();
    await expect(this.regionalSalesChart).toBeVisible();
  }

  async assertRevenueChartHasData() {
    // AreaChart renders activeDot elements when data is present
    await expect(
      this.revenueChart.locator(".recharts-active-dot")
    ).not.toHaveCount(0);
  }

  async assertMetricCardsRendered() {
    await expect(this.page.locator('[data-testid="metric-cards"]')).toBeVisible();
  }
}
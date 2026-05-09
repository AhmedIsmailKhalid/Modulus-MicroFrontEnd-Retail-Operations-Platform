import { type Page, type Locator, expect } from "@playwright/test";

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export class OrdersPage {
  readonly page: Page;
  readonly table: Locator;
  readonly statusFilter: Locator;
  readonly orderDetail: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('[data-testid="order-table"]');
    this.statusFilter = page.locator('[data-testid="order-status-filter"]');
    this.orderDetail = page.locator('[data-testid="order-detail"]');
  }

  async assertVisible() {
    await expect(this.table).toBeVisible();
  }

  async filterByStatus(status: OrderStatus) {
    await this.statusFilter.selectOption(status);
  }

  async assertStatusBadgesMatch(status: OrderStatus) {
    const badges = this.page.locator(`[data-testid="status-badge-${status}"]`);
    await expect(badges.first()).toBeVisible();
  }

  async openOrderDetail(orderId: string) {
    await this.page.locator(`[data-testid="order-row-${orderId}"]`).click();
  }

  async assertDetailVisible() {
    await expect(this.orderDetail).toBeVisible();
  }

  async updateStatus(newStatus: OrderStatus) {
    await this.page.locator('[data-testid="update-status-btn"]').click();
    await this.page.locator(`[data-testid="status-select"] input[value="${newStatus}"]`).check();
    await this.page.locator('[data-testid="status-confirm-button"]').click();
  }

  async assertDetailStatusBadge(status: OrderStatus) {
    await expect(
      this.orderDetail.locator(`[data-testid="status-badge-${status}"]`)
    ).toBeVisible();
  }

  async assertTimelineHasEntry(status: OrderStatus) {
    await expect(
      this.page.locator(`[data-testid="timeline-entry-${status}"]`)
    ).toBeVisible();
  }

  async assertOrderRowAbsent(orderId: string) {
    await expect(
      this.page.locator(`[data-testid="order-row-${orderId}"]`)
    ).not.toBeAttached();
  }
}
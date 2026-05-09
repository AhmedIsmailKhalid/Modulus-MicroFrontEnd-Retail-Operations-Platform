import { type Page, type Locator, expect } from "@playwright/test";

export class ShellPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly inventoryLink: Locator;
  readonly ordersLink: Locator;
  readonly analyticsLink: Locator;
  readonly logoutButton: Locator;
  readonly userDisplay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('[data-testid="shell-sidebar"]');
    this.inventoryLink = page.locator('[data-testid="nav-inventory"]');
    this.ordersLink = page.locator('[data-testid="nav-orders"]');
    this.analyticsLink = page.locator('[data-testid="nav-analytics"]');
    this.logoutButton = page.locator('[data-testid="logout-button"]');
    this.userDisplay = page.locator('[data-testid="user-display"]');
  }

  async assertAuthenticatedShellVisible() {
    await expect(this.sidebar).toBeVisible();
    await expect(this.userDisplay).toBeVisible();
  }

  async navigateToInventory() {
    await this.inventoryLink.click();
  }

  async navigateToOrders() {
    await this.ordersLink.click();
  }

  async navigateToAnalytics() {
    await this.analyticsLink.click();
  }

  async logout() {
    await this.logoutButton.click();
  }
}
import { type Page, type Locator, expect } from "@playwright/test";
import type { TEST_PRODUCT } from "../tests/constants";

export class InventoryPage {
  readonly page: Page;
  readonly table: Locator;
  readonly searchInput: Locator;
  readonly addProductButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('[data-testid="product-table"]');
    this.searchInput = page.locator('[data-testid="product-search"]');
    this.addProductButton = page.locator('[data-testid="add-product-btn"]');
  }

  async assertVisible() {
    await expect(this.table).toBeVisible();
  }

  async addProduct(product: typeof TEST_PRODUCT) {
    await this.addProductButton.click();
    await this.page.locator('[data-testid="product-form-name"]').fill(product.name);
    await this.page.locator('[data-testid="product-form-sku"]').fill(product.sku);
    await this.page.locator('[data-testid="product-form-category"]').selectOption(product.category);
    await this.page.locator('[data-testid="product-form-price"]').fill(product.price);
    await this.page.locator('[data-testid="product-form-stock"]').fill(product.stock);
    await this.page.locator('[data-testid="product-form-submit"]').click();
  }

  async assertProductRowVisible(sku: string) {
    await expect(this.page.locator(`[data-testid="product-row-${sku}"]`)).toBeVisible();
  }

  async searchBySku(sku: string) {
    await this.searchInput.fill(sku);
  }

  async assertStockBadge(color: "green" | "amber" | "red") {
    await expect(this.page.locator(`[data-testid="stock-badge-${color}"]`)).toBeVisible();
  }

  async editProductStock(sku: string, newStock: string) {
    await this.page.locator(`[data-testid="edit-product-${sku}"]`).click();
    const stockInput = this.page.locator('[data-testid="product-form-stock"]');
    await stockInput.clear();
    await stockInput.fill(newStock);
    await this.page.locator('[data-testid="product-form-submit"]').click();
  }
}
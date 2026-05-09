import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ShellPage } from "../pages/ShellPage";
import { InventoryPage } from "../pages/InventoryPage";
import { OrdersPage } from "../pages/OrdersPage";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { TEST_CREDENTIALS, TEST_PRODUCT } from "./constants";

test.describe("Modulus Operations Workflow", () => {
  let loginPage: LoginPage;
  let shellPage: ShellPage;
  let inventoryPage: InventoryPage;
  let ordersPage: OrdersPage;
  let analyticsPage: AnalyticsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    shellPage = new ShellPage(page);
    inventoryPage = new InventoryPage(page);
    ordersPage = new OrdersPage(page);
    analyticsPage = new AnalyticsPage(page);
  });

  test("complete operations workflow across all MFEs", async ({ page }) => {
    // Step 1 — Shell: login page renders
    await loginPage.goto();
    await loginPage.assertVisible();

    // Step 2 — Shell: valid login redirects to authenticated shell
    await loginPage.login(TEST_CREDENTIALS.email, TEST_CREDENTIALS.password);
    await shellPage.assertAuthenticatedShellVisible();

    // Step 3 — Inventory: MFE loads with product table
    await shellPage.navigateToInventory();
    await inventoryPage.assertVisible();

    // Step 4 — Inventory: add new product
    await inventoryPage.addProduct(TEST_PRODUCT);
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    await inventoryPage.assertProductRowVisible(TEST_PRODUCT.sku);

    // Step 5 — Inventory: search by SKU shows one row with green stock badge
    await inventoryPage.searchBySku(TEST_PRODUCT.sku);
    await inventoryPage.assertProductRowVisible(TEST_PRODUCT.sku);
    await inventoryPage.assertStockBadge("green");

    // Step 6 — Inventory: edit stock to 3, badge changes to red
    await inventoryPage.editProductStock(TEST_PRODUCT.sku, "3");
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    await inventoryPage.assertStockBadge("red");

    // Step 7 — Orders: MFE loads with order table
    await shellPage.navigateToOrders();
    await ordersPage.assertVisible();

    // Step 8 — Orders: filter by pending, grab first pending order ID dynamically
    await ordersPage.filterByStatus("pending");
    await ordersPage.assertStatusBadgesMatch("pending");

    // Grab the first pending order ID from the table
    const firstPendingRow = page.locator('[data-testid^="order-row-"]').first();
    await expect(firstPendingRow).toBeVisible();
    const testOrderId = (await firstPendingRow.getAttribute("data-testid"))?.replace("order-row-", "") ?? "";
    expect(testOrderId).not.toBe("");

    // Step 9 — Orders: open that order's detail view
    await firstPendingRow.click();
    await ordersPage.assertDetailVisible();

    // Step 10 — Orders: update status to processing
    await ordersPage.updateStatus("processing");
    await ordersPage.assertDetailStatusBadge("processing");
    await ordersPage.assertTimelineHasEntry("processing");

    // Step 11 — Orders: back to table filtered by pending, order no longer visible
    await page.locator('[data-testid="back-to-orders"]').click();
    await ordersPage.filterByStatus("pending");
    await ordersPage.assertOrderRowAbsent(testOrderId);

    // Step 12 — Analytics: MFE loads with dashboard
    await shellPage.navigateToAnalytics();
    await analyticsPage.assertVisible();
    await analyticsPage.assertMetricCardsRendered();
    await analyticsPage.assertAllChartsRendered();

    // Step 13 — Analytics: revenue chart has rendered data points
    await analyticsPage.assertRevenueChartHasData();

    // Step 14 — Shell: logout redirects to login page
    await shellPage.logout();
    await loginPage.assertVisible();
    await expect(page.locator('[data-testid="shell-sidebar"]')).not.toBeVisible();
  });
});
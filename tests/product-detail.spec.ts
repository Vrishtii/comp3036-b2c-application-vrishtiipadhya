import { test, expect } from "@playwright/test";

test.describe("product detail page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menu");
    await page.waitForSelector("a[href^='/menu/']", { timeout: 10000 });
    await page.locator("a[href^='/menu/']").first().click();
    await page.waitForLoadState("networkidle");
  });

  test("shows product name and category", async ({ page }) => {
    await expect(page.locator("h1.font-playfair")).toBeVisible();
    await expect(page.locator("p.font-inter.text-xs.uppercase").first()).toBeVisible();
  });

  test("shows product price", async ({ page }) => {
    await expect(page.getByText(/\$\d+\.\d{2}/).first()).toBeVisible();
  });

  test("quantity selector is visible and works", async ({ page }) => {
    const qty = page.locator(".border-x.border-ink\\/20");
    await expect(page.getByLabel("increase quantity")).toBeVisible();
    await expect(page.getByLabel("decrease quantity")).toBeVisible();
    await expect(qty).toHaveText("1");
    await page.getByLabel("increase quantity").click();
    await expect(qty).toHaveText("2");
    await page.getByLabel("decrease quantity").click();
    await expect(qty).toHaveText("1");
  });

  test("quantity cannot go below 1", async ({ page }) => {
    const qty = page.locator(".border-x.border-ink\\/20");
    await page.getByLabel("decrease quantity").click();
    await expect(qty).toHaveText("1");
  });

  test("custom notes input is visible", async ({ page }) => {
    await expect(page.getByPlaceholder(/nut allergy/i)).toBeVisible();
  });

  test("add to cart button is visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: /add to cart/i })).toBeVisible();
  });

  test("add to cart shows confirmation feedback", async ({ page }) => {
    await page.getByRole("button", { name: /add to cart/i }).click();
    await expect(page.getByText("added to your order!")).toBeVisible();
  });

  test("back to menu link works", async ({ page }) => {
    await page.getByText("← back to menu").click();
    await expect(page).toHaveURL("/menu");
  });

  test("navigating to unknown product shows not found", async ({ page }) => {
    await page.goto("/menu/00000000-0000-0000-0000-000000000000");
    await expect(page.getByText(/not found|404/i)).toBeVisible();
  });
});

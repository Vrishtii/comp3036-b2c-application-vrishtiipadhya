import { test, expect } from "@playwright/test";

test.describe("menu page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menu");
    // wait for products to load from API
    await page.waitForSelector("button:has-text('add to cart')", { timeout: 10000 });
  });

  test("loads and shows menu heading", async ({ page }) => {
    await expect(page.getByText("our menu.")).toBeVisible();
  });

  test("shows product cards with add to cart buttons", async ({ page }) => {
    const addToCartButtons = page.locator("button:has-text('add to cart')");
    await expect(addToCartButtons.first()).toBeVisible();
  });

  test("category filter buttons are visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: "all" })).toBeVisible();
    await expect(page.getByRole("button", { name: "brownies" })).toBeVisible();
    await expect(page.getByRole("button", { name: "cookies" })).toBeVisible();
    await expect(page.getByRole("button", { name: "loaves" })).toBeVisible();
  });

  test("clicking a category filter activates it", async ({ page }) => {
    await page.getByRole("button", { name: "brownies" }).click();
    const brownieBtn = page.getByRole("button", { name: "brownies" });
    await expect(brownieBtn).toHaveClass(/bg-burgundy/);
  });

  test("search with no match shows empty state", async ({ page }) => {
    await page.getByPlaceholder("search products...").fill("zzzznonexistent");
    await expect(page.getByText("nothing found.")).toBeVisible();
  });

  test("search filters products", async ({ page }) => {
    await page.getByPlaceholder("search products...").fill("zzzznonexistent");
    await expect(page.getByText("nothing found.")).toBeVisible();
    await page.getByPlaceholder("search products...").clear();
    await expect(page.locator("button:has-text('add to cart')").first()).toBeVisible();
  });
});

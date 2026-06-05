import { test, expect } from "@playwright/test";

test.describe("cart page", () => {
  test("navigates to /cart", async ({ page }) => {
    await page.goto("/cart");
    await expect(page).toHaveURL("/cart");
  });

  test("shows empty state when no items in cart", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByText("nothing here yet.")).toBeVisible();
  });

  test("adding a product from menu shows it in cart", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForSelector("button:has-text('add to cart')", { timeout: 10000 });
    await page.locator("button:has-text('add to cart')").first().click();
    await page.goto("/cart");
    await expect(page.getByText("nothing here yet.")).not.toBeVisible();
  });

  test("cart shows checkout button when items present", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForSelector("button:has-text('add to cart')", { timeout: 10000 });
    await page.locator("button:has-text('add to cart')").first().click();
    await page.goto("/cart");
    await expect(page.getByRole("link", { name: /checkout/i })).toBeVisible();
  });
});

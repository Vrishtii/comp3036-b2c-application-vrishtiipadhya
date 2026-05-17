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

  test("adding a product from detail page shows it in cart", async ({ page }) => {
    await page.goto("/menu/brownie-1");
    await page.getByRole("button", { name: /add to cart/i }).click();
    await page.goto("/cart");
    await expect(page.getByText("Classic Fudge Brownie")).toBeVisible();
  });
});

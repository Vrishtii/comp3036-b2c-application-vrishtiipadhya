import { test, expect } from "@playwright/test";

test.describe("homepage", () => {
  test("loads and shows brand name", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.getByRole("link", { name: "crave." }).first()).toBeVisible();
  });

  test("shows tagline", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("baked for the craving.").first()).toBeVisible();
  });

  test("navbar has menu and cart links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Menu" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Cart" })).toBeVisible();
  });

  test("order now button links to products section", async ({ page }) => {
    await page.goto("/");
    const orderBtn = page.getByRole("link", { name: /order now/i });
    await expect(orderBtn).toBeVisible();
  });
});

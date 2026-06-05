import { test, expect } from "@playwright/test";

test.describe("homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads and shows brand name", async ({ page }) => {
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.getByRole("link", { name: "crave." }).first()).toBeVisible();
  });

  test("shows tagline", async ({ page }) => {
    await expect(page.getByText("baked for").first()).toBeVisible();
    await expect(page.getByText("the craving.").first()).toBeVisible();
  });

  test("navbar has menu and cart links", async ({ page }) => {
    // scope to nav to avoid matching footer links
    await expect(page.locator("nav").getByRole("link", { name: "Menu" })).toBeVisible();
    await expect(page.locator("nav a[href='/cart']")).toBeVisible();
  });

  test("order now button links to menu", async ({ page }) => {
    const orderBtn = page.getByRole("link", { name: /order now/i });
    await expect(orderBtn).toBeVisible();
    await expect(orderBtn).toHaveAttribute("href", "/menu");
  });

  test("category chips link to filtered menu", async ({ page }) => {
    await expect(page.getByRole("link", { name: "brownies" })).toHaveAttribute("href", "/menu?category=Brownies");
    await expect(page.getByRole("link", { name: "cookies" })).toHaveAttribute("href", "/menu?category=Cookies");
    await expect(page.getByRole("link", { name: "loaves" })).toHaveAttribute("href", "/menu?category=Loaves");
  });

  test("view all link goes to menu", async ({ page }) => {
    await expect(page.getByRole("link", { name: /view all/i })).toHaveAttribute("href", "/menu");
  });

  test("shows featured products section", async ({ page }) => {
    await expect(page.getByText("this week's picks.")).toBeVisible();
    await expect(page.locator("button:has-text('add to cart')").first()).toBeVisible({ timeout: 10000 });
  });
});

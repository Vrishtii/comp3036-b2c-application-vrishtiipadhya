import { test, expect } from "@playwright/test";

test.describe("menu page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menu");
  });

  test("loads and shows products", async ({ page }) => {
    await expect(page.getByText("our menu.")).toBeVisible();
    await expect(page.getByText("Dark Chocolate Brownie")).toBeVisible();
    await expect(page.getByText("Brown Butter Choc Chip")).toBeVisible();
    await expect(page.getByText("Lemon Glazed Loaf")).toBeVisible();
  });

  test("category filter buttons are visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: "all" })).toBeVisible();
    await expect(page.getByRole("button", { name: "brownies" })).toBeVisible();
    await expect(page.getByRole("button", { name: "cookies" })).toBeVisible();
    await expect(page.getByRole("button", { name: "loaves" })).toBeVisible();
  });

  test("clicking brownies filter hides other categories", async ({ page }) => {
    await page.getByRole("button", { name: "brownies" }).click();
    await expect(page.getByText("Dark Chocolate Brownie")).toBeVisible();
    await expect(page.getByText("Salted Caramel Brownie")).toBeVisible();
    await expect(page.getByText("Brown Butter Choc Chip")).not.toBeVisible();
    await expect(page.getByText("Lemon Glazed Loaf")).not.toBeVisible();
  });

  test("search filters products by name", async ({ page }) => {
    await page.getByPlaceholder("search products...").fill("brownie");
    await expect(page.getByText("Dark Chocolate Brownie")).toBeVisible();
    await expect(page.getByText("Lemon Glazed Loaf")).not.toBeVisible();
  });

  test("search with no match shows empty state", async ({ page }) => {
    await page.getByPlaceholder("search products...").fill("croissant");
    await expect(page.getByText("nothing found.")).toBeVisible();
  });
});

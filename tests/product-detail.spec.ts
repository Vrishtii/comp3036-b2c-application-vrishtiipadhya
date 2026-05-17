import { test, expect } from "@playwright/test";

test.describe("product detail page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menu/brownie-1");
  });

  test("shows product name and details", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Classic Fudge Brownie" })).toBeVisible();
    await expect(page.getByText("brownies")).toBeVisible();
  });

  test("quantity selector is visible and works", async ({ page }) => {
    await expect(page.getByLabel("increase quantity")).toBeVisible();
    await expect(page.getByLabel("decrease quantity")).toBeVisible();
    await expect(page.getByText("1")).toBeVisible();
    await page.getByLabel("increase quantity").click();
    await expect(page.getByText("2")).toBeVisible();
    await page.getByLabel("decrease quantity").click();
    await expect(page.getByText("1")).toBeVisible();
  });

  test("quantity cannot go below 1", async ({ page }) => {
    await page.getByLabel("decrease quantity").click();
    await expect(page.getByText("1")).toBeVisible();
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

  test("navigating to unknown product shows 404", async ({ page }) => {
    await page.goto("/menu/fake-product");
    await expect(page.getByText("404")).toBeVisible();
  });
});

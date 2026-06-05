import { test, expect } from "@playwright/test";

test.describe("register page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("shows registration form fields", async ({ page }) => {
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/phone number/i)).toBeVisible();
    await expect(page.getByLabel(/^password/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("shows preference picker", async ({ page }) => {
    await expect(page.getByText("brownies")).toBeVisible();
    await expect(page.getByText("cookies")).toBeVisible();
    await expect(page.getByText("loaves")).toBeVisible();
  });

  test("shows error when passwords don't match", async ({ page }) => {
    await page.getByLabel(/full name/i).fill("Test User");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/^password/i).fill("password123");
    await page.getByLabel(/confirm password/i).fill("differentpassword");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/passwords.*match|do not match/i)).toBeVisible();
  });

  test("shows error for invalid australian phone number", async ({ page }) => {
    await page.getByLabel(/full name/i).fill("Test User");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/phone number/i).fill("12345");
    await page.getByLabel(/^password/i).fill("password123");
    await page.getByLabel(/confirm password/i).fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/valid australian phone/i)).toBeVisible();
  });

  test("has link to login page", async ({ page }) => {
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });
});

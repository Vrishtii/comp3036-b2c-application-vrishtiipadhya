import { test, expect } from "@playwright/test";

test.describe("register page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("shows registration form fields", async ({ page }) => {
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /register|create account/i })).toBeVisible();
  });

  test("shows error when passwords don't match", async ({ page }) => {
    await page.getByLabel(/name/i).fill("Test User");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/^password/i).fill("password123");
    await page.getByLabel(/confirm password/i).fill("differentpassword");
    await page.getByRole("button", { name: /register|create account/i }).click();
    await expect(page.getByText(/passwords.*match|do not match/i)).toBeVisible();
  });

  test("has link to login page", async ({ page }) => {
    await expect(page.getByRole("link", { name: /log in|sign in/i })).toBeVisible();
  });
});

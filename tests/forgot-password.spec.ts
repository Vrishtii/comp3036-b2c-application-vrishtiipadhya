import { test, expect } from "@playwright/test";

test.describe("forgot password page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/forgot-password");
  });

  test("shows email input and submit button", async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /send reset link/i })).toBeVisible();
  });

  test("shows error on empty submit", async ({ page }) => {
    await page.getByRole("button", { name: /send reset link/i }).click();
    await expect(page.getByText("please enter your email")).toBeVisible();
  });

  test("shows error on invalid email", async ({ page }) => {
    await page.getByLabel(/email/i).fill("notanemail");
    await page.getByRole("button", { name: /send reset link/i }).click();
    await expect(page.getByText("enter a valid email")).toBeVisible();
  });

  test("shows confirmation after valid email submitted", async ({ page }) => {
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByRole("button", { name: /send reset link/i }).click();
    await expect(page.getByText("check your email.")).toBeVisible({ timeout: 10000 });
  });

  test("has back to login link", async ({ page }) => {
    await expect(page.getByRole("link", { name: /back to login/i })).toBeVisible();
  });
});

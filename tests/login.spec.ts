import { test, expect } from "@playwright/test";

test.describe("login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("shows login form fields", async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("shows forgot password link below password field", async ({ page }) => {
    await expect(page.getByRole("link", { name: /forgot password/i })).toBeVisible();
  });

  test("shows error on empty submit", async ({ page }) => {
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText("please fill in all fields")).toBeVisible();
  });

  test("shows error on wrong credentials", async ({ page }) => {
    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page.getByLabel(/^password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText("invalid email or password")).toBeVisible();
  });

  test("successful login with admin credentials redirects to admin", async ({ page }) => {
    await page.getByLabel(/email/i).fill(process.env.TEST_ADMIN_EMAIL!);
    await page.getByLabel(/^password/i).fill(process.env.TEST_ADMIN_PASSWORD!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL("/admin", { timeout: 10000 });
  });

  test("has link to register page", async ({ page }) => {
    await expect(page.getByRole("link", { name: /register/i })).toBeVisible();
  });

  test("has continue as guest link", async ({ page }) => {
    await expect(page.getByRole("link", { name: /continue as guest/i })).toBeVisible();
  });
});

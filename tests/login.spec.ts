import { test, expect } from "@playwright/test";

test.describe("login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("shows login form fields", async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();
  });

  test("shows error on empty submit", async ({ page }) => {
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page.getByText(/email.*required|required|fill in/i)).toBeVisible();
  });

  test("shows error on wrong credentials", async ({ page }) => {
    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page.getByText(/invalid|incorrect|not found/i)).toBeVisible();
  });

  test("successful login with admin credentials redirects", async ({ page }) => {
    await page.getByLabel(/email/i).fill("admin@crave.com");
    await page.getByLabel(/password/i).fill("admin123");
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page).not.toHaveURL("/login");
  });

  test("has link to register page", async ({ page }) => {
    await expect(page.getByRole("link", { name: /register|sign up/i })).toBeVisible();
  });
});

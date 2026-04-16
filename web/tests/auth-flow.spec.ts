import { test, expect } from "@playwright/test";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

test.describe("Auth flow @requires-api", () => {
  test.beforeAll(async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/v1/health`, { timeout: 3000 });
      if (!res.ok()) test.skip(true, "API not reachable — skipping auth tests");
    } catch {
      test.skip(true, "API not reachable — skipping auth tests");
    }
  });

  test("redirects unauthenticated user from /home to /login", async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveURL(/\/login/);
  });

  test("full login → home → logout flow", async ({ page }) => {
    // Go to login
    await page.goto("/login");
    await expect(page.getByText("Welcome back")).toBeVisible();

    // Enter phone number
    const phoneInput = page.getByPlaceholder("9876543210");
    await phoneInput.fill("9876543210");
    await page.getByRole("button", { name: /send otp/i }).click();

    // OTP step appears
    await expect(page.getByText("Enter your code")).toBeVisible();

    // Enter 000000 (dev bypass)
    const otpInputs = page.locator('input[inputmode="numeric"][maxlength="1"]');
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill("0");
    }

    // Should redirect to /home
    await expect(page).toHaveURL(/\/home/, { timeout: 10000 });
    await expect(page.getByText(/hello/i)).toBeVisible();

    // Logout
    await page.getByRole("button", { name: /logout/i }).click();
    await expect(page).toHaveURL("/");
  });
});

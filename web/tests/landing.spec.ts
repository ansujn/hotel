import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("shows headline, class cards, and login link", async ({ page }) => {
    await page.goto("/");

    // Headline
    await expect(page.getByText("Where every voice")).toBeVisible();

    // 4 class cards
    await expect(page.getByText("Monologue Lab")).toBeVisible();
    await expect(page.getByText("Scene Study")).toBeVisible();
    await expect(page.getByText("Showcase Ensemble")).toBeVisible();
    await expect(page.getByText("Little Stage")).toBeVisible();

    // Login button links to /login
    const loginLink = page.getByRole("link", { name: /login/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute("href", "/login");
  });
});

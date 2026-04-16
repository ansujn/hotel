import { test, expect } from "@playwright/test";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const SEED_STUDENT_ID = "11111111-1111-1111-1111-111111111111";

test.describe("Public channel @requires-api", () => {
  let apiUp = false;

  test.beforeAll(async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/v1/health`, { timeout: 3000 });
      apiUp = res.ok();
    } catch {
      apiUp = false;
    }
  });

  test("loads channel page without crashing", async ({ page }) => {
    await page.goto(`/channel/${SEED_STUDENT_ID}`);

    if (apiUp) {
      // With API: expect channel page elements
      await expect(page.locator("main")).toBeVisible();
      // Channel page should render without errors
      await expect(page.locator("body")).not.toContainText("Application error");
    } else {
      // Without API: should not crash (graceful degradation)
      await expect(page.locator("body")).not.toContainText("Application error");
    }
  });
});

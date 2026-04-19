import { test, expect, devices } from "@playwright/test";

const BASE = "https://victor.saudagars.org";
const EMAIL = "ansujain3@gmail.com";
const PW = "temp@123";

test.use({
  ...devices["iPhone 14"],
});

test("mobile admin drawer: slides in from the right and fills the viewport", async ({
  page,
}) => {
  // Log in
  await page.goto(`${BASE}/login`);
  await page.getByLabel("Email or phone").fill(EMAIL);
  await page.getByLabel("Password").fill(PW);
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait until we land on an admin surface
  await page.waitForURL(/\/students|\/account\/password/);
  if (page.url().includes("/account/password")) {
    // first-login path — skip if present
    test.skip();
  }

  // Locate hamburger
  const hamburger = page.getByRole("button", { name: "Open menu" });
  await expect(hamburger).toBeVisible();

  // Drawer is closed — panel must be translate-x-full and effectively hidden
  const panel = page.locator("#mobile-admin-drawer");
  await expect(panel).toHaveClass(/translate-x-full/);

  const viewport = page.viewportSize();
  if (!viewport) throw new Error("no viewport");

  // Closed-state: bounding box must be outside the right edge
  const closedBox = await panel.boundingBox();
  expect(closedBox, "panel must have a box").not.toBeNull();
  if (closedBox) {
    console.log(
      `CLOSED panel box: x=${closedBox.x}, w=${closedBox.width} (viewport=${viewport.width})`,
    );
    expect(closedBox.x).toBeGreaterThanOrEqual(viewport.width - 1);
  }

  // Click hamburger
  await hamburger.click();

  // Wait for transition
  await page.waitForTimeout(400);

  // Open-state: translate-x-0, bounding box equals the viewport
  await expect(panel).toHaveClass(/translate-x-0/);
  await expect(panel).not.toHaveClass(/translate-x-full/);

  const openBox = await panel.boundingBox();
  console.log(
    `OPEN panel box: x=${openBox?.x}, y=${openBox?.y}, w=${openBox?.width}, h=${openBox?.height}`,
  );
  expect(openBox).not.toBeNull();
  if (openBox) {
    // Panel should fill the viewport (inset-0)
    expect(openBox.x).toBeLessThanOrEqual(1);
    expect(openBox.y).toBeLessThanOrEqual(1);
    expect(openBox.width).toBeGreaterThanOrEqual(viewport.width - 2);
  }

  // Close button must be visible and inside the panel on the RIGHT side
  const closeBtn = page.getByRole("button", { name: "Close menu" });
  await expect(closeBtn).toBeVisible();
  const closeBox = await closeBtn.boundingBox();
  console.log(`CLOSE button box: x=${closeBox?.x}, w=${closeBox?.width}`);
  if (closeBox) {
    // Close button must be on the RIGHT half of the viewport
    expect(closeBox.x).toBeGreaterThan(viewport.width / 2);
  }

  // Tabs visible
  await expect(page.getByRole("link", { name: "Students" })).toBeVisible();
  await expect(page.getByRole("link", { name: "+ User" })).toBeVisible();

  // Tap close
  await closeBtn.click();
  await page.waitForTimeout(400);
  await expect(panel).toHaveClass(/translate-x-full/);
});

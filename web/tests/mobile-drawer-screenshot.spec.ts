import { test, devices } from "@playwright/test";

test.use(devices["iPhone 14"]);

test("screenshot drawer open state on prod", async ({ page }) => {
  await page.goto("https://victor.saudagars.org/login");
  await page.getByLabel("Email or phone").fill("ansujain3@gmail.com");
  await page.getByLabel("Password").fill("temp@123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/students/);

  await page.screenshot({ path: "test-results/drawer-closed.png", fullPage: false });
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "test-results/drawer-open.png", fullPage: false });

  // Also log the computed bounding rect + computed style height
  const info = await page.evaluate(() => {
    const el = document.getElementById("mobile-admin-drawer");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    return {
      rect: { x: r.x, y: r.y, w: r.width, h: r.height },
      className: el.className,
      position: cs.position,
      top: cs.top,
      bottom: cs.bottom,
      left: cs.left,
      right: cs.right,
      inset: cs.inset,
      transform: cs.transform,
      viewportInner: { w: window.innerWidth, h: window.innerHeight },
    };
  });
  console.log("PANEL INFO:", JSON.stringify(info, null, 2));
});

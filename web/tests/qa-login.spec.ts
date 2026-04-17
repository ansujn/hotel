import { test, expect } from '@playwright/test';

test('admin login redirects to /students with seeded data', async ({ page }) => {
  page.on('request', r => {
    if (r.resourceType() === 'document' || r.url().includes('/v1/')) {
      console.log('→', r.method(), r.url());
    }
  });
  page.on('response', async r => {
    if (r.request().resourceType() === 'document' || r.url().includes('/v1/')) {
      console.log(' ←', r.status(), r.url());
      if (r.url().includes('/v1/me') || r.url().includes('/v1/auth/otp/verify')) {
        try { console.log('    body:', (await r.text()).slice(0, 300)); } catch {}
      }
    }
  });
  page.on('console', m => console.log('[console]', m.type(), m.text()));
  page.on('pageerror', e => console.log('[pageerror]', e.message));

  await page.goto('http://localhost:3000/login');
  console.log('START:', page.url());

  // Step 1: phone
  const phoneInput = page.locator('input[type="tel"], input[name="phone"]').first();
  await phoneInput.fill('9000000001');
  await page.getByRole('button').filter({ hasText: /send|continue|otp/i }).first().click();
  await page.waitForTimeout(1200);
  console.log('AFTER SEND:', page.url());

  // Step 2: OTP
  const otpBoxes = page.locator('input[inputmode="numeric"]');
  const n = await otpBoxes.count();
  console.log('otp inputs:', n);
  for (let i = 0; i < n; i++) await otpBoxes.nth(i).fill('0');

  await page.waitForURL(u => !u.pathname.startsWith('/login'), { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1500);

  console.log('FINAL URL:', page.url());
  const body = await page.locator('body').innerText();
  console.log('--- body (first 600) ---');
  console.log(body.slice(0, 600));
  await page.screenshot({ path: '/tmp/qa-final.png', fullPage: true });

  // expectations
  expect(page.url()).toContain('/students');
  await expect(page.locator('body')).toContainText(/Aarav|Priya|Kabir/);
});

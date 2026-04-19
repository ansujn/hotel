import { test, expect } from '@playwright/test';

const BASE = 'https://web-liard-eight-3vqk15xdjh.vercel.app';

test('prod admin login → /students with real data', async ({ page }) => {
  page.on('pageerror', e => console.log('[pageerror]', e.message.slice(0, 400)));
  page.on('requestfailed', r => {
    if (!r.url().includes('favicon') && !r.url().includes('.jpg')) {
      console.log('[reqfailed]', r.failure()?.errorText, r.url());
    }
  });

  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  await page.locator('input[name="phone"]').fill('9000000001');
  await page.getByRole('button').filter({ hasText: /send|continue/i }).first().click();
  await page.waitForTimeout(2000);

  const otp = page.locator('input[inputmode="numeric"]');
  const n = await otp.count();
  console.log('otp boxes:', n);
  for (let i = 0; i < n; i++) await otp.nth(i).fill('0');

  await page.waitForURL(u => !u.pathname.startsWith('/login'), { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(3000);

  console.log('FINAL URL:', page.url());
  const body = await page.locator('body').innerText();
  console.log('---\n', body.slice(0, 500));
  await page.screenshot({ path: '/tmp/prod-admin.png', fullPage: true });

  expect(page.url()).toContain('/students');
  await expect(page.locator('body')).toContainText(/Aarav|Priya|Kabir/);
});

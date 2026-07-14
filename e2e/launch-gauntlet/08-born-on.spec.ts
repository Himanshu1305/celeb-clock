/**
 * 08-born-on — Born-on page suite: content, navigation, graceful error handling.
 */
import { test, expect } from '@playwright/test';

test('/born-on index renders all 12 months', async ({ page }) => {
  await page.goto('/born-on');
  await page.waitForLoadState('networkidle');

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  for (const month of MONTHS) {
    await expect(page.getByText(month, { exact: false }).first()).toBeVisible();
  }
});

test('/born-on/july-15 has unique title and ≥1 celebrity card', async ({ page }) => {
  await page.goto('/born-on/july-15');
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveTitle(/July 15/i);

  // Wait for Supabase fetch to complete and cards to render
  await page.waitForSelector('.glass-card', { timeout: 20000 });
  const cards = page.locator('.glass-card');
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThanOrEqual(1);
});

test('/born-on/february-29 loads without crash', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('/born-on/february-29');
  await page.waitForLoadState('networkidle');

  const body = await page.locator('body').textContent();
  expect(body?.trim().length).toBeGreaterThan(20);
  await expect(page.locator('text=Something went wrong')).not.toBeVisible();

  const critical = consoleErrors.filter(
    e => !e.includes('favicon') && !e.includes('Razorpay') && !e.includes('gtag')
      && !e.includes('ipapi.co') && !e.includes('net::ERR_FAILED'),
  );
  expect(critical, `console errors on /born-on/february-29: ${critical.join(' | ')}`).toHaveLength(0);
});

test('/born-on/notamonth-99 redirects gracefully — no crash', async ({ page }) => {
  await page.goto('/born-on/notamonth-99');
  await page.waitForLoadState('networkidle');

  // Should redirect to /born-on index — no blank screen, no error boundary
  const body = await page.locator('body').textContent();
  expect(body?.trim().length).toBeGreaterThan(20);
  await expect(page.locator('text=Something went wrong')).not.toBeVisible();
});

test('/born-on/july-15 canonical celebrity order is stable across reloads', async ({ page }) => {
  await page.goto('/born-on/july-15');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.glass-card h3', { timeout: 20000 });

  const firstRun = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.glass-card h3')).slice(0, 3).map(el => el.textContent?.trim()),
  );

  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.glass-card h3', { timeout: 20000 });

  const secondRun = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.glass-card h3')).slice(0, 3).map(el => el.textContent?.trim()),
  );

  expect(firstRun).toEqual(secondRun);
});

test('/born-on/july-15 prev/next navigation links exist', async ({ page }) => {
  await page.goto('/born-on/july-15');
  await page.waitForLoadState('networkidle');

  // Prev link (July 14) and next link (July 16) should be on the page
  await expect(page.getByRole('link', { name: /July 14/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /July 16/i })).toBeVisible();
});

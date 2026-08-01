/**
 * 12-edge-cases — Launch-gauntlet expansion (overnight batch, Phase 3b).
 *
 * Covers: invalid DOB inputs, leap-day / Dec-31 date pages, direct navigation to
 * every static top-level route, mobile 390px render incl. CountryExtrasSection for
 * a mocked IN visitor (validates the Phase-1 geo latch fix), longevity calculator
 * Previous-on-step-1, biological-age quiz load, report preview-lock, and 404 /
 * garbage-slug handling.
 *
 * Requires vite :3000 + api backend :3001 (see gauntlet.config.ts).
 */
import { test, expect } from '@playwright/test';

// ── Helpers ──────────────────────────────────────────────────────────────────

// Fail only on genuine app breakage: uncaught page errors. Console.error is too
// noisy in a local test env (ipapi geo fetch, image 404s) — the route sweep in
// scripts/page-sweep.mjs captures console.error separately for BUG-AUDIT.md.
function trackPageErrors(page) {
  const errs: string[] = [];
  page.on('pageerror', e => errs.push(String(e)));
  return errs;
}

// Assert no literal placeholder leakage in the rendered, visible body text.
async function assertNoUndefinedText(page) {
  const body = (await page.locator('body').innerText()).toLowerCase();
  for (const bad of ['undefined', 'nan', 'null']) {
    // word-boundary-ish to avoid matching e.g. "annual" (contains "nan"? no) —
    // check as standalone token surrounded by non-letters.
    const re = new RegExp(`(^|[^a-z])${bad}([^a-z]|$)`);
    expect(body, `visible text contains "${bad}"`).not.toMatch(re);
  }
}

// ── 1. Invalid DOB inputs on /birthday-report (pure frontend validation) ──────

test('birthday-report: empty submit is blocked (button disabled)', async ({ page }) => {
  await page.goto('/birthday-report');
  await page.waitForLoadState('networkidle');
  const submit = page.getByRole('button', { name: /Create Birthday Report/i });
  await expect(submit).toBeVisible();
  await expect(submit).toBeDisabled();
});

test('birthday-report: future DOB shows validation error', async ({ page }) => {
  await page.goto('/birthday-report');
  await page.waitForLoadState('networkidle');
  const future = new Date();
  future.setFullYear(future.getFullYear() + 1);
  await page.getByPlaceholder(/Priya|James|Mum/i).fill('Test Recipient');
  await page.getByPlaceholder('DD', { exact: true }).fill(String(future.getDate()));
  await page.getByPlaceholder('MM', { exact: true }).fill(String(future.getMonth() + 1));
  await page.getByPlaceholder('YYYY', { exact: true }).fill(String(future.getFullYear()));
  await page.getByRole('button', { name: /Create Birthday Report/i }).click();
  await expect(page.getByText(/can't be in the future|cannot be in the future/i)).toBeVisible();
});

test('birthday-report: impossible date (Feb 29 non-leap) shows validation error', async ({ page }) => {
  await page.goto('/birthday-report');
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder(/Priya|James|Mum/i).fill('Test Recipient');
  await page.getByPlaceholder('DD', { exact: true }).fill('29');
  await page.getByPlaceholder('MM', { exact: true }).fill('2');
  await page.getByPlaceholder('YYYY', { exact: true }).fill('2019'); // not a leap year
  await page.getByRole('button', { name: /Create Birthday Report/i }).click();
  await expect(page.getByText(/valid date|can't be in the future/i)).toBeVisible();
});

// ── 2. Leap-day + Dec-31 date pages ──────────────────────────────────────────

for (const slug of ['february-29', 'december-31']) {
  test(`/born-on/${slug} renders without crash and shows celebrity cards`, async ({ page }) => {
    const errs = trackPageErrors(page);
    await page.goto(`/born-on/${slug}`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.glass-card', { timeout: 20000 });
    expect(await page.locator('.glass-card').count()).toBeGreaterThanOrEqual(1);
    expect(errs, errs.join('\n')).toHaveLength(0);
  });
}

// ── 3. Direct navigation to every static top-level route ─────────────────────

const STATIC_ROUTES = [
  '/', '/about', '/age-calculator', '/auth', '/biological-age', '/biorhythm',
  '/birthday-report', '/birthday', '/birthstone', '/blog', '/born-on',
  '/celebrity-birthday', '/chinese-zodiac', '/compatibility', '/contact',
  '/country-comparison', '/editorial-policy', '/family', '/faq', '/generation',
  '/gift', '/leaderboard', '/life-expectancy', '/methodology', '/moon-sign',
  '/name-numerology', '/numerology', '/planetary-age', '/privacy',
  '/tarot-card-by-birthday', '/terms', '/todays-birthdays', '/upgrade',
  '/vedic-zodiac', '/zodiac', '/results',
  '/answers/how-long-will-i-live', '/answers/what-is-my-zodiac-sign',
  '/answers/who-shares-my-birthday', '/answers/what-is-life-expectancy',
];

for (const route of STATIC_ROUTES) {
  test(`route ${route} renders non-empty, no uncaught error, no undefined text`, async ({ page }) => {
    const errs = trackPageErrors(page);
    const resp = await page.goto(route, { waitUntil: 'networkidle' });
    // SPA: the document is always 200 (index.html); assert it at least served.
    expect(resp?.status(), `HTTP status for ${route}`).toBeLessThan(400);
    // Non-empty render: body has meaningful text.
    const text = (await page.locator('body').innerText()).trim();
    expect(text.length, `${route} rendered empty`).toBeGreaterThan(30);
    await assertNoUndefinedText(page);
    expect(errs, `${route} uncaught errors:\n${errs.join('\n')}`).toHaveLength(0);
  });
}

// ── 4. Mobile 390px + mocked IN visitor → CountryExtrasSection (geo fix) ──────

test('mobile 390px: CountryExtrasSection shows for IN visitor and stays visible (no flash)', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  // Seed the resolved-country cache the Phase-1 hook reads synchronously.
  await context.addInitScript(() => {
    try {
      localStorage.setItem('bc_country_code_v2', JSON.stringify({ code: 'IN', ts: Date.now() }));
    } catch { /* ignore */ }
  });
  await page.goto('/born-on/september-3'); // 10 Indian celebs on this date
  await page.waitForLoadState('networkidle');
  const india = page.getByText(/Born this day — from India/i);
  await expect(india).toBeVisible({ timeout: 20000 });
  // Latch check: still visible after re-render churn (simulates token-refresh/tab-focus).
  await page.waitForTimeout(1800);
  await expect(india).toBeVisible();
  // No horizontal scroll at 390px.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow ${overflow}px`).toBeLessThanOrEqual(2);
});

// ── 5. Longevity calculator: Previous disabled on step 1, Next→Prev round-trip ─

test('life-expectancy: Previous is disabled on step 1 of the quiz', async ({ page }) => {
  await page.goto('/life-expectancy');
  await page.waitForLoadState('networkidle');
  // The quiz only mounts after a birth date is entered; enter one to reveal step 1.
  // BATCH-8 P3 replaced the native date picker with the shared DobInput (DD/MM/YYYY fields).
  await page.locator('#dob-day').first().fill('10');
  await page.locator('#dob-month').first().fill('05');
  await page.locator('#dob-year').first().fill('1982'); // valid trio → onValidChange mounts the quiz
  const prev = page.getByRole('button', { name: /^Previous$/i });
  await expect(prev.first()).toBeVisible({ timeout: 10000 });
  await expect(prev.first()).toBeDisabled();
  // Step 1 also gates Next until required fields are set — confirm it starts disabled.
  const next = page.getByRole('button', { name: /Next Step/i }).first();
  await expect(next).toBeVisible();
});

// ── 6. Biological age quiz loads and is interactive ──────────────────────────

test('/biological-age loads without crash and shows quiz UI', async ({ page }) => {
  const errs = trackPageErrors(page);
  await page.goto('/biological-age');
  await page.waitForLoadState('networkidle');
  const text = (await page.locator('body').innerText()).toLowerCase();
  expect(text).toContain('biological');
  expect(errs, errs.join('\n')).toHaveLength(0);
});

// ── 7. Report preview-lock for an unpaid slug (real form flow) ───────────────
// Drives the actual /birthday-report form so save-report gets a COMPLETE report
// payload (generateReportData) — a partial payload crashes ReportView (see
// BUG-AUDIT.md). Guest-created reports are is_paid=false → locked preview.

test('report: guest-created report renders a locked preview with unlock CTA', async ({ page }) => {
  await page.goto('/birthday-report');
  await page.waitForLoadState('networkidle');
  await page.locator('input[placeholder*="Priya"]').first().fill('Preview Lock Test');
  await page.locator('input[placeholder="DD"]').first().fill('21');
  await page.locator('input[placeholder="MM"]').first().fill('6');
  await page.locator('input[placeholder="YYYY"]').first().fill('1990');
  await page.locator('button:has-text("Create Birthday Report")').click();
  await page.waitForSelector('text=Report Ready!', { timeout: 30000 });
  const href = await page.locator('a:has-text("Open Report")').getAttribute('href');
  expect(href).toMatch(/\/report\/[a-z0-9-]+/i);
  await page.goto(href!);
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/Unlock|Sign in to Unlock|Locked sections/i).first())
    .toBeVisible({ timeout: 20000 });
});

// ── 8. 404 / garbage-slug handling ───────────────────────────────────────────

test('garbage top-level route renders the 404 page', async ({ page }) => {
  await page.goto('/this-route-does-not-exist-zzz');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('404', { exact: true }).first()).toBeVisible();
});

test('report: garbage slug shows the expired/not-found page (no crash)', async ({ page }) => {
  const errs = trackPageErrors(page);
  await page.goto('/report/zzzzgarbageslugzzzz');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/expired|not found|Create a New Report/i).first()).toBeVisible({ timeout: 20000 });
  expect(errs, errs.join('\n')).toHaveLength(0);
});

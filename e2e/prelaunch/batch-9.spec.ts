/**
 * Suite — batch-9.spec.ts  (browser: P3/P4/P6/P8/P9/P10 + A3 prior-batch regression checks).
 * Runs against the vite dev server.
 */
import { test, expect } from '@playwright/test';

// Type "14/12/1990" continuously into a DobInput (single focus, per-key).
async function typeDob(page, dd: string, mm: string, yyyy: string) {
  await page.locator('#dob-day').first().click();
  for (const ch of (dd + mm + yyyy).split('')) { await page.keyboard.press(ch); await page.waitForTimeout(50); }
}

// ── P4 — homepage planets link + planetary-age dedupe ────────────────────────────
test.describe('P4 — planets link + dedupe', () => {
  test('homepage planets teaser links /weight-on-planets (not /planetary-age)', async ({ page }) => {
    await page.goto('/'); await page.waitForLoadState('networkidle');
    await expect(page.locator('a[href="/weight-on-planets"]').first()).toBeVisible();
  });
  test('/planetary-age no longer has a weight input; cross-links /weight-on-planets', async ({ page }) => {
    await page.goto('/planetary-age'); await page.waitForLoadState('networkidle');
    await expect(page.locator('a[href="/weight-on-planets"]').first()).toBeVisible();
    // the interactive weight calculator (a number input for weight) is gone
    await expect(page.locator('input[placeholder="e.g. 70"], input[placeholder="e.g. 154"]')).toHaveCount(0);
  });
});

// ── P10 — homepage science card row ──────────────────────────────────────────────
test.describe('P10 — science card row', () => {
  test('three cards with correct hrefs render; row present at 390px', async ({ page }) => {
    for (const w of [1280, 390]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto('/'); await page.waitForLoadState('networkidle');
      const row = page.getByTestId('science-card-row');
      await expect(row).toBeVisible();
      for (const href of ['/biological-age', '/country-comparison', '/energy-forecast']) {
        await expect(row.locator(`a[href="${href}"]`)).toBeVisible();
      }
    }
  });
});

// ── P8 — /life-expectancy depth + single disclaimer ──────────────────────────────
test.describe('P8 — life-expectancy depth', () => {
  test('flagship sections render; the WHO-life-tables disclaimer appears exactly once', async ({ page }) => {
    await page.goto('/life-expectancy'); await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('le-depth')).toBeVisible();
    await expect(page.getByRole('heading', { name: /how it works/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /does — and doesn/i })).toBeVisible();
    const disclaimer = page.getByText(/statistical projections based on WHO life tables/i);
    await expect(disclaimer).toHaveCount(1);
  });
});

// ── P9 — /contact form ───────────────────────────────────────────────────────────
test.describe('P9 — contact form', () => {
  test('valid submit → success UI (endpoint mocked, no real email)', async ({ page }) => {
    await page.route('**/api/contact', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }));
    await page.goto('/contact'); await page.waitForLoadState('networkidle');
    await page.locator('#name').fill('Ada Test');
    await page.locator('#email').fill('ada@bornclock-test.invalid');
    await page.locator('#topic').selectOption('support');
    await page.locator('#message').fill('Hello, this is a test message.');
    await page.getByRole('button', { name: /Send Message/i }).click();
    await expect(page.getByTestId('contact-success')).toBeVisible();
    await expect(page.getByText(/hello@bornclock\.com/i).first()).toBeVisible(); // hello@ still shown
  });
  test('invalid email → inline error, no submit', async ({ page }) => {
    await page.goto('/contact'); await page.waitForLoadState('networkidle');
    await page.locator('#name').fill('Ada');
    await page.locator('#email').fill('not-an-email');
    await page.locator('#message').fill('Hi there');
    await page.getByRole('button', { name: /Send Message/i }).click();
    await expect(page.getByText(/valid email address/i).first()).toBeVisible();
    await expect(page.getByTestId('contact-success')).toHaveCount(0);
  });
  test('FIX 3: server 502 (Resend rejected) → error surfaced, NO false success', async ({ page }) => {
    await page.route('**/api/contact', route => route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ error: 'Could not send your message. Please email hello@bornclock.com directly.' }) }));
    await page.goto('/contact'); await page.waitForLoadState('networkidle');
    await page.locator('#name').fill('Ada Test');
    await page.locator('#email').fill('ada@bornclock-test.invalid');
    await page.locator('#message').fill('Hello, this is a test message.');
    await page.getByRole('button', { name: /Send Message/i }).click();
    await expect(page.getByText(/could not send/i).first()).toBeVisible(); // error toast, not success
    await expect(page.getByTestId('contact-success')).toHaveCount(0);
  });
});

// ── P3 — legacy review widget gone from /age-calculator ──────────────────────────
test.describe('P3 — legacy widget removed', () => {
  test('no "Share Your Experience" mandatory-fields widget on /age-calculator', async ({ page }) => {
    await page.goto('/age-calculator'); await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Share Your Experience/i)).toHaveCount(0);
    // the legacy widget's mandatory "Review Title" field is gone
    await expect(page.getByPlaceholder(/review title|title of your review/i)).toHaveCount(0);
  });
});

// ── P6 — country-comparison privacy copy ─────────────────────────────────────────
test.describe('P6 — privacy copy', () => {
  test('no quiz data → inviting empty-state links the quiz', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('bornclock_result_snapshot'));
    await page.goto('/country-comparison'); await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Take the quiz/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Baseline Forecasts/i })).toBeVisible();
  });
  test('with quiz data → personalised forecast + "nothing is saved" trust line', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bornclock_result_snapshot', JSON.stringify({ gender: 'male', currentAge: 35, healthAdjustment: 2, geneticAdjustment: 0, epigeneticAdjustment: 0, communityBonus: 0 })));
    await page.goto('/country-comparison'); await page.waitForLoadState('networkidle');
    await expect(page.getByText(/nothing is saved/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Your Personalized Forecast/i })).toBeVisible();
  });
});

// ── A3 — prior-batch regression checks (batch-8 surfaces) ─────────────────────────
test.describe('A3 — prior-batch regressions', () => {
  test('DobInput works end-to-end on /birthday-report (14/12/1990)', async ({ page }) => {
    await page.goto('/birthday-report'); await page.waitForLoadState('networkidle');
    await typeDob(page, '14', '12', '1990');
    await expect(page.locator('#dob-day').first()).toHaveValue('14');
    await expect(page.locator('#dob-month').first()).toHaveValue('12');
    await expect(page.locator('#dob-year').first()).toHaveValue('1990');
  });
  test('DobInput works end-to-end on /vedic-zodiac (14/12/1990)', async ({ page }) => {
    await page.goto('/vedic-zodiac'); await page.waitForLoadState('networkidle');
    await typeDob(page, '14', '12', '1990');
    await expect(page.locator('#dob-day').first()).toHaveValue('14');
    await expect(page.locator('#dob-month').first()).toHaveValue('12');
  });
  test('compat calculator still navigates to the canonical pair page', async ({ page }) => {
    await page.goto('/compatibility'); await page.waitForLoadState('networkidle');
    await page.locator('select').nth(0).selectOption('Leo');
    await page.locator('select').nth(1).selectOption('Aries');
    await page.getByRole('button', { name: /Check Compatibility/i }).click();
    await expect(page).toHaveURL(/\/compatibility\/aries\/leo$/);
  });
  test('/gift hero still "feel truly special"; nav has Life Expectancy', async ({ page }) => {
    await page.goto('/gift'); await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /feel truly special/i })).toBeVisible();
    await page.goto('/'); await page.waitForLoadState('networkidle');
    await expect(page.locator('nav.hidden.md\\:flex a[href="/life-expectancy"]').first()).toBeVisible();
  });
});

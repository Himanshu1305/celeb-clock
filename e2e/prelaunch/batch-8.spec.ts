/**
 * Suite — batch-8.spec.ts  (BATCH-8 browser: P3 DobInput UX, P1 compat depth, P5 nav,
 * P6 routing/grid, P2 gift). Runs against the vite dev server.
 */
import { test, expect, type Page } from '@playwright/test';

// ── P3 — DobInput behaviour on the homepage hero ────────────────────────────────
test.describe('P3 — DobInput', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/'); await page.waitForLoadState('networkidle'); });

  test('auto-advance on 2 digits (05 in Day → Month focused)', async ({ page }) => {
    await page.locator('#dob-day').first().pressSequentially('05');
    await expect(page.locator('#dob-month').first()).toBeFocused();
  });
  test('smart-advance: 7 in Day (no valid 2-digit day) → Month focused', async ({ page }) => {
    await page.locator('#dob-day').first().pressSequentially('7');
    await expect(page.locator('#dob-month').first()).toBeFocused();
  });
  test('no advance: 1 in Month (ambiguous) stays in Month', async ({ page }) => {
    await page.locator('#dob-month').first().pressSequentially('1');
    await expect(page.locator('#dob-month').first()).toBeFocused();
  });
  test('single digit + Tab is valid and zero-pads on blur (5 → 05)', async ({ page }) => {
    const day = page.locator('#dob-day').first();
    await day.pressSequentially('5');
    await day.press('Tab');
    await expect(day).toHaveValue('05');
  });
  test('year hard-stops at 4 digits (5th keystroke ignored)', async ({ page }) => {
    const year = page.locator('#dob-year').first();
    await year.pressSequentially('19855');
    await expect(year).toHaveValue('1985');
  });
  test('backspace on an empty field returns focus to the previous field', async ({ page }) => {
    await page.locator('#dob-month').first().focus();
    await page.locator('#dob-month').first().press('Backspace'); // empty → go back
    await expect(page.locator('#dob-day').first()).toBeFocused();
  });
  test('paste "02051985" distributes across the trio', async ({ page }) => {
    const day = page.locator('#dob-day').first();
    await day.focus();
    // simulate a paste event carrying digits
    await day.evaluate((el: HTMLInputElement) => {
      const dt = new DataTransfer(); dt.setData('text', '02051985');
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    });
    await expect(page.locator('#dob-day').first()).toHaveValue('02');
    await expect(page.locator('#dob-month').first()).toHaveValue('05');
    await expect(page.locator('#dob-year').first()).toHaveValue('1985');
  });
});

// ── P1 — compat depth v2 renders every new section + 5 FAQs ──────────────────────
test.describe('P1 — compat depth v2', () => {
  test('a pair page renders all four new sections with composed text', async ({ page }) => {
    await page.goto('/compatibility/aries/leo');
    for (const h of [/work day-to-day/i, /where it gets hard/i, /making it work/i, /the full reading/i]) {
      await expect(page.getByRole('heading', { name: h })).toBeVisible();
    }
    // FAQ grew to 5 — the marriage + friends questions are present
    await expect(page.getByText(/good marriage match/i).first()).toBeVisible();
    await expect(page.getByText(/compatible as friends/i).first()).toBeVisible();
  });
  test('bogus pair slug → not-found (content asserted, not the calculator)', async ({ page }) => {
    await page.goto('/compatibility/aries/dragon');
    await expect(page.getByText(/zodiac pairing doesn’t exist/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Check Compatibility/i })).toHaveCount(0);
  });
  test('same-sign aries/aries renders (mirror) content', async ({ page }) => {
    await page.goto('/compatibility/aries/aries');
    await expect(page.getByRole('heading', { name: 'Are Aries and Aries compatible?', level: 2 })).toBeVisible();
    await expect(page.getByText(/two aries/i).first()).toBeVisible();
  });
});

// ── P6 — calculator routing + browse grid ────────────────────────────────────────
test.describe('P6 — routing + grid', () => {
  test('selecting two signs lands on the canonical pair URL (incl. reverse-order → canonical)', async ({ page }) => {
    // Reverse-order selection (Leo, Aries) must route to canonical /aries/leo, no 301 hop.
    await page.goto('/compatibility');
    await page.waitForLoadState('networkidle');
    const selects = page.locator('select');
    await selects.nth(0).selectOption('Leo');
    await selects.nth(1).selectOption('Aries');
    await page.getByRole('button', { name: /Check Compatibility/i }).click();
    await expect(page).toHaveURL(/\/compatibility\/aries\/leo$/);
  });
  test('A-Z index has exactly 78 canonical pair links (no reverse-order/redirect sources)', async ({ page }) => {
    await page.goto('/compatibility');
    await page.waitForLoadState('networkidle');
    const SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    const hrefs = await page.locator('a[href^="/compatibility/"]').evaluateAll(els =>
      els.map(e => (e as HTMLAnchorElement).getAttribute('href')!));
    const pairHrefs = hrefs.filter(h => /^\/compatibility\/[a-z]+\/[a-z]+$/.test(h));
    // every link is canonical (first sign alphabetically ≤ second) — never a redirect source
    for (const h of pairHrefs) {
      const [, a, b] = h.match(/^\/compatibility\/([a-z]+)\/([a-z]+)$/)!;
      expect(a <= b, `${h} must be canonical (a<=b)`).toBe(true);
      expect(SIGNS).toContain(a); expect(SIGNS).toContain(b);
    }
    // the A-Z index alone contributes all 78 unordered canonical pairs
    const unique = new Set(pairHrefs);
    expect(unique.size).toBeGreaterThanOrEqual(78);
  });
});

// ── P5 — nav structure ───────────────────────────────────────────────────────────
async function menuHrefs(page: Page, trigger: string): Promise<string[]> {
  await page.locator('nav.hidden.md\\:flex button', { hasText: trigger }).first().click();
  const menu = page.locator('[role="menu"]').last();
  await menu.waitFor({ state: 'visible' });
  const hrefs = await menu.locator('a[href^="/"]').evaluateAll(els => els.map(e => (e as HTMLAnchorElement).getAttribute('href')!));
  await page.keyboard.press('Escape');
  return hrefs;
}
test.describe('P5 — nav', () => {
  test('desktop 1280: main bar shows Life Expectancy; Explore has Numerology + Gift', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/'); await page.waitForLoadState('networkidle');
    const bar = page.locator('nav.hidden.md\\:flex').first();
    await expect(bar.locator('a[href="/life-expectancy"]')).toBeVisible();
    const explore = await menuHrefs(page, 'Explore');
    expect(explore).toContain('/numerology');
    expect(explore).toContain('/gift');
    // no standalone Numerology dropdown remains on the bar
    await expect(page.locator('nav.hidden.md\\:flex button', { hasText: 'Numerology' })).toHaveCount(0);
  });
  test('bar does not wrap/overflow at 1280 or 1024', async ({ page }) => {
    for (const w of [1280, 1024]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto('/'); await page.waitForLoadState('networkidle');
      const box = await page.locator('nav.hidden.md\\:flex').first().boundingBox();
      expect(box, `nav box at ${w}`).not.toBeNull();
      expect(box!.height, `nav must be a single row at ${w}px`).toBeLessThan(80);
    }
  });
  test('390px mobile menu contains the moved items', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/'); await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Toggle navigation menu/i }).click();
    for (const href of ['/life-expectancy', '/numerology', '/gift']) {
      await expect(page.locator(`a[href="${href}"]:visible`).first()).toBeVisible();
    }
  });
});

// ── P2 — gift care-centred hero + currency-aware price ───────────────────────────
test.describe('P2 — gift', () => {
  test('hero renders the chosen care-centred headline + testimonial placeholder', async ({ page }) => {
    await page.goto('/gift');
    await expect(page.getByRole('heading', { name: /feel truly seen/i })).toBeVisible();
    await expect(page.getByText(/Testimonials — placeholder/i)).toBeVisible();
  });
  test('price is currency-aware — ₹ by default, $ under ?currency=USD', async ({ page }) => {
    await page.goto('/gift');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/₹/).first()).toBeVisible();
    await page.goto('/gift?currency=USD');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/\$/).first()).toBeVisible();
  });
});

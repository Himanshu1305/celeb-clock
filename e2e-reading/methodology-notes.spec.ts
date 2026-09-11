import { test, expect, type Page } from '@playwright/test';

// Part K Item 2 — methodology notes render cleanly on Sade Sati, Career, Muhurat.
const KEY = 'bornclock-birth-profile';
const FULL = { dob: '1988-11-05', time: '12:30', city: { name: 'Delhi', lat: 28.6139, lon: 77.209, tz: 5.5 }, savedAt: '2026-01-01T00:00:00Z' };
const seed = (page: Page) => page.addInitScript(([k, v]) => localStorage.setItem(k, v), [KEY, JSON.stringify(FULL)]);

test('Career report shows the methodology note', async ({ page }) => {
  await seed(page);
  await page.route('**/api/career-report*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
    report: {
      tenthHouse: { sign: 'Tula', lord: 'Venus', analysis: 'Your 10th house is Tula, ruled by Venus.' },
      occupants: [], dasamsa: { analysis: 'D10 layer.' }, yogas: [{ name: 'Raj Yoga', grade: 'strong', summary: '.' }],
      timing: { windows: [{ describe: 'Mercury Antardasha' }], next: 'Mercury', note: 'n' },
      verdict: 'Bottom line.',
      methodology: "Here's what this report is actually built from: your 10th house of career (Tula) and the planet that rules it, Venus — strong right now; the Dasamsa (D10); your career-relevant Yogas (Raj Yoga [strong]); and the real timing windows from your Vimshottari Dasha.",
      disclaimer: 'Not a guarantee.',
    }, _cache: 'miss',
  }) }));
  await page.goto('/career-report');
  await page.click('[data-testid="career-generate-btn"]');
  const note = page.locator('[data-testid="career-methodology"]');
  await expect(note).toBeVisible();
  await expect(note).toContainText('10th house of career (Tula)');
  await expect(note).toContainText('Dasamsa');
  await page.screenshot({ path: 'e2e-reading/__screens__/pk-03-career-methodology.png', fullPage: true });
});

test('Sade Sati shows the methodology note', async ({ page }) => {
  await seed(page);
  await page.route('**/api/sade-sati*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
    moonSignName: 'Kanya', active: false, phase: null, currentCycle: null,
    nextCycle: { start: '2036-08-01T00:00:00Z', end: '2043-12-01T00:00:00Z' },
    methodology: 'How this was worked out: Sade Sati is defined by where Saturn is transiting, measured from your Moon sign (Kanya). Saturn is currently in Meena — the 7th sign from your Moon, which is outside the 12th/1st/2nd, so it is not active right now. The dates come from tracking Saturn’s real transit.',
    dhaiya: { active: false, type: null, currentEnd: null }, _cache: 'miss',
  }) }));
  await page.goto('/sade-sati');
  await page.click('[data-testid="sadesati-generate-btn"]');
  const note = page.locator('[data-testid="sadesati-methodology"]');
  await expect(note).toBeVisible();
  await expect(note).toContainText('measured from your Moon sign (Kanya)');
});

test('Muhurat shows the methodology note', async ({ page }) => {
  await page.route('**/api/muhurat*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
    purpose: 'business', days: 30, count: 1,
    methodology: 'How each date is chosen: we compute that day’s Panchang — the five classical limbs — and score it. We check the Tithi, the Nakshatra (Pushya is supreme), the Yoga, and the weekday — then flag the Rahu Kalam window to avoid.',
    auspicious: [{ date: '2026-09-24', weekday: 'Thursday', nakshatra: 'Dhanishtha', tithiName: 'Trayodashi', paksha: 'Shukla', yoga: 'Siddhi', rahuKalam: { start: '13:30', end: '15:00' }, score: 4, reasons: ['Dhanishtha is auspicious'], auspicious: true }],
    all: [], _cache: 'miss',
  }) }));
  await page.goto('/muhurat');
  await page.click('[data-testid="muhurat-find-btn"]');
  const note = page.locator('[data-testid="muhurat-methodology"]');
  await expect(note).toBeVisible();
  await expect(note).toContainText('Panchang');
  await expect(note).toContainText('Rahu Kalam');
});

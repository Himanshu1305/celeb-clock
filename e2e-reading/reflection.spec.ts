import { test, expect, type Page } from '@playwright/test';

// Past-Period Reflection (Part R) e2e — route-mocked, local preview. Mirrors the
// reading.spec.ts pattern. Validates the exploratory once-ever flow through the real UI.

const KUNDALI = {
  lagna: { sign: 'Tula', signIndex: 7, degrees: 190.1 },
  planets: [
    { name: 'Sun', sign: 'Mesha', signIndex: 1, house: 7, longitude: 10, retrograde: false },
    { name: 'Moon', sign: 'Kanya', signIndex: 6, house: 12, longitude: 156, retrograde: false },
  ],
  nakshatra: { nakshatra: 'Chitra', pada: 2, confidence: 'high', is_boundary: false },
  rashi: 'Kanya', dasha: { mahadasha: 'Mars', antardasha: 'Sun' }, requires_birth_time: false,
};

const FACTS = {
  rashi: 'Kanya', nakshatra: { name: 'Chitra', pada: 2, lord: 'Mars' }, lagna: 'Tula',
  dasha: { maha: 'Mars', antar: 'Sun' },
  placements: [{ planet: 'Sun', sign: 'Mesha', house: 7, retrograde: false }],
  doshas: { mangal: { present: false, severityLabel: 'None' }, kaalSarp: { present: false, isPartial: false, type: null }, sadeSati: { active: false, phase: null } },
  divisional: { d9Moon: 'Makara', d10Sun: 'Mesha', d60Moon: 'Simha', d60Disclaimer: 'One classical tradition.' },
  warnings: [] as Array<{ code: string; message: string }>,
};

const MARRIAGE_Q = 'A quick reflection — no right or wrong answer here. Looking at your chart, your Mars–Sun period ran from May 2000 to October 2000. In classical Vedic astrology, this combination of periods is traditionally linked to themes of partnership, marriage, or significant relationships. Did anything along those lines happen for you during that time?';
const TRAVEL_Q = 'A quick reflection — no right or wrong answer here. Looking at your chart, your Jupiter–Mercury period ran from January 2024 to April 2026. In classical Vedic astrology, this combination of periods is traditionally linked to themes of travel, relocation, or connections abroad. Did anything along those lines happen for you during that time?';

const REFLECTIONS = [
  { theme: 'marriage', dashaLord: 'Mars', antardashaLord: 'Sun', start: '2000-05-01', end: '2000-10-01', houses: [2, 7, 11], themeDescription: 'partnership, marriage, or significant relationships', questionText: MARRIAGE_Q },
  { theme: 'travel', dashaLord: 'Jupiter', antardashaLord: 'Mercury', start: '2024-01-01', end: '2026-04-01', houses: [3, 9, 12], themeDescription: 'travel, relocation, or connections abroad', questionText: TRAVEL_Q },
];

const payload = (reflections: any[]) => ({
  facts: FACTS, reading: {
    snapshot: 'Snapshot text.', career: 'Career text.', relationships: 'Relationships text.',
    health: 'Health text.', money: 'Money text.', family: 'Family text.', rightNow: 'Right now text.',
    doshas: 'Doshas text.', divisional: 'Divisional text.',
  }, degraded: false, warnings: [], reflections, source: 'local', _cache: 'miss',
});

async function mockAll(page: Page, reflections: any[]) {
  await page.route('**/api/kundali*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...KUNDALI, _cache: 'miss' }) }));
  await page.route('**/api/vedic-reading*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload(reflections)) }));
}

async function fillGenerate(page: Page, { save }: { save: boolean }, dob = '1985-07-13', time = '14:30') {
  await page.goto('/kundali');
  await page.fill('[data-testid="kundali-dob"]', dob);
  await page.fill('[data-testid="kundali-time"]', time);
  await page.fill('[data-testid="kundali-city"]', 'Delhi');
  await page.locator('li button', { hasText: 'Delhi' }).first().click();
  if (save) await page.locator('[data-testid="kundali-save-optin"] input[type="checkbox"]').check();
  await page.click('[data-testid="kundali-generate-btn"]');
}

test('exploratory: see a question, answer "Not really", revisit → that theme is gone, another persists', async ({ page }) => {
  await mockAll(page, REFLECTIONS);
  await fillGenerate(page, { save: true });

  const section = page.getByTestId('past-period-reflection');
  await expect(section).toBeVisible();
  await expect(page.getByTestId('reflection-marriage')).toContainText(MARRIAGE_Q);
  await expect(page.getByTestId('reflection-travel')).toContainText(TRAVEL_Q);

  await page.screenshot({ path: 'e2e-reading/__screens_r__/reflection-shown.png', fullPage: true });

  await page.getByTestId('reflection-marriage-not-really').click();
  await expect(page.getByTestId('reflection-ack-marriage')).toHaveText(
    "That's completely normal — not every classical pattern shows up the same way for everyone. Thanks for letting us know.",
  );
  // Answering one theme does not remove the other, still-open theme.
  await expect(page.getByTestId('reflection-options-travel')).toBeVisible();

  // Revisit: same dob (saved profile) → regenerate → the answered theme must NOT reappear.
  await page.goto('/kundali');
  await page.waitForSelector('[data-testid="kundali-generate-btn"]:not([disabled])');
  await page.click('[data-testid="kundali-generate-btn"]');
  await expect(page.getByTestId('past-period-reflection')).toBeVisible();
  await expect(page.getByTestId('reflection-travel')).toBeVisible();     // not-yet-answered theme still offered
  await expect(page.getByTestId('reflection-marriage')).toHaveCount(0);  // once-ever: gone forever
});

test('negative: a chart qualifying for no themes shows no reflection section', async ({ page }) => {
  await mockAll(page, []);
  await fillGenerate(page, { save: true });
  await expect(page.getByTestId('vedic-reading')).toBeVisible();
  await expect(page.getByTestId('past-period-reflection')).toHaveCount(0);
});

test('consent: without saving the profile, no reflection is shown (or tracked)', async ({ page }) => {
  await mockAll(page, REFLECTIONS);
  await fillGenerate(page, { save: false });
  await expect(page.getByTestId('vedic-reading')).toBeVisible();
  await expect(page.getByTestId('past-period-reflection')).toHaveCount(0);
});

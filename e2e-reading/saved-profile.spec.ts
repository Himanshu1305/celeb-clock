import { test, expect, type Page } from '@playwright/test';

// ── Mock API payloads (route-mocked; no live backend needed) ─────────────────
const KUNDALI = {
  lagna: { sign: 'Makara', signIndex: 10, degrees: 279.9 },
  planets: [
    { name: 'Sun', sign: 'Tula', signIndex: 7, house: 10, longitude: 199.4, retrograde: false },
    { name: 'Moon', sign: 'Kanya', signIndex: 6, house: 9, longitude: 156.2, retrograde: false },
  ],
  nakshatra: { nakshatra: 'Uttara Phalguni', nakshatra_devanagari: '', pada: 2, confidence: 'high', is_boundary: false },
  rashi: 'Kanya', rashi_devanagari: '', dasha: { mahadasha: 'Rahu', antardasha: 'Moon' }, requires_birth_time: false, _cache: 'miss',
};
const READING = {
  facts: { rashi: 'Kanya', nakshatra: { name: 'Uttara Phalguni', pada: 2, lord: 'Sun' }, lagna: 'Makara',
    dasha: { maha: 'Rahu', antar: 'Moon' }, placements: [], doshas: { mangal: { present: false, severityLabel: 'None' }, kaalSarp: { present: false, isPartial: false, type: null }, sadeSati: { active: false, phase: null } },
    divisional: { d9Moon: 'Makara', d10Sun: 'Mesha', d60Moon: 'Simha', d60Disclaimer: 'one interpretation' }, warnings: [] },
  reading: { snapshot: 'Grounded and steady.', career: 'Steady progress.', relationships: 'Warm.', health: 'Rest well.', money: 'Prudent.', family: 'Supportive.', rightNow: 'Reflective Rahu period.', doshas: 'Calm chart.', divisional: 'Resilience grows.' },
  degraded: false, warnings: [], source: 'local', _cache: 'miss',
};
const VEDIC_PROFILE = {
  nakshatra: { nakshatra: 'Ashwini', nakshatra_devanagari: '', pada: 1, lord: 'Ketu', confidence: 'high', is_boundary: false, calculation_method: 'local-engine' },
  rashi: 'Mesha', rashi_devanagari: '', lagna: null, dasha: null, requires_birth_time: false, _cache: 'miss',
};

const SAVED = { dob: '1988-11-05', time: '12:30', city: { name: 'Delhi', lat: 28.6139, lon: 77.209, tz: 5.5 }, savedAt: '2026-01-01T00:00:00Z' };

async function mockApis(page: Page) {
  await page.route('**/api/kundali*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(KUNDALI) }));
  await page.route('**/api/vedic-reading*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(READING) }));
  await page.route('**/api/vedic-profile*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(VEDIC_PROFILE) }));
}

// ── POSITIVE: enter once on /kundali (opt-in save) → carry over to Matching ───
test('walkthrough: save on /kundali, then Matching pre-fills own details, asks only 2nd person', async ({ page }) => {
  await mockApis(page);
  await page.goto('/kundali');

  // Fill the shared birth form + opt in to save.
  await page.fill('[data-testid="kundali-dob"]', '1988-11-05');
  await page.fill('[data-testid="kundali-time"]', '12:30');
  await page.fill('[data-testid="kundali-city"]', 'Delhi');
  await page.locator('li button', { hasText: 'Delhi' }).first().click();
  await page.locator('[data-testid="kundali-save-optin"] input').check();
  await page.screenshot({ path: 'e2e-reading/__screens__/pe-01-kundali-filled-optin.png', fullPage: true });
  await page.click('[data-testid="kundali-generate-btn"]');
  await expect(page.locator('[data-testid="vedic-reading"]')).toBeVisible();

  // Reload /kundali → saved banner appears, form pre-filled (proves persistence).
  await page.goto('/kundali');
  await expect(page.locator('[data-testid="saved-profile-banner"]')).toBeVisible();
  await expect(page.locator('[data-testid="kundali-dob"]')).toHaveValue('1988-11-05');
  await page.screenshot({ path: 'e2e-reading/__screens__/pe-02-kundali-saved-banner.png', fullPage: true });

  // Navigate to Matching via the tab → own details pre-filled, only 2nd person asked.
  await page.click('[data-testid="tab-match"]');
  await expect(page).toHaveURL(/kundali-match/);
  await expect(page.locator('[data-testid="kmatch-saved-a"]')).toContainText('1988-11-05');
  await expect(page.locator('[data-testid="kmatch-saved-a"]')).toContainText('Delhi');
  await expect(page.locator('[data-testid="kmatch-dob-a"]')).toHaveCount(0); // NOT asked for person A
  await expect(page.locator('[data-testid="kmatch-dob-b"]')).toBeVisible();  // only the 2nd person
  await page.screenshot({ path: 'e2e-reading/__screens__/pe-03-matching-prefilled.png', fullPage: true });

  // Complete the match with only the second person's details.
  await page.fill('[data-testid="kmatch-dob-b"]', '1990-04-20');
  await page.fill('[data-testid="kmatch-time-b"]', '09:15');
  await page.click('[data-testid="kmatch-calculate-btn"]');
  await expect(page.locator('[data-testid="kmatch-result"]')).toBeVisible();
});

// ── POSITIVE: returning user (existing storage) → profile loads automatically ─
test('returning session: seeded saved profile loads automatically without re-entering', async ({ page }) => {
  await mockApis(page);
  await page.addInitScript(p => localStorage.setItem('bornclock-birth-profile', JSON.stringify(p)), SAVED);
  await page.goto('/kundali');
  await expect(page.locator('[data-testid="saved-profile-banner"]')).toBeVisible();
  await expect(page.locator('[data-testid="saved-profile-banner"]')).toContainText('Delhi');
  await expect(page.locator('[data-testid="kundali-dob"]')).toHaveValue('1988-11-05');
  await expect(page.locator('[data-testid="kundali-time"]')).toHaveValue('12:30');
  await page.screenshot({ path: 'e2e-reading/__screens__/pe-04-returning-session.png', fullPage: true });
});

// ── EDGE: "use different details" does NOT wipe the saved profile ─────────────
test('edge: "use different details" lets you check a friend without overwriting your saved profile', async ({ page }) => {
  await mockApis(page);
  await page.addInitScript(p => localStorage.setItem('bornclock-birth-profile', JSON.stringify(p)), SAVED);
  await page.goto('/kundali');
  await page.click('[data-testid="use-different-details"]');
  // Banner gone, form cleared, save opt-in offered again (not auto-saving the friend).
  await expect(page.locator('[data-testid="saved-profile-banner"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="kundali-dob"]')).toHaveValue('');
  await expect(page.locator('[data-testid="kundali-save-optin"]')).toBeVisible();
  // The saved profile is still intact in storage.
  const stored = await page.evaluate(() => localStorage.getItem('bornclock-birth-profile'));
  expect(stored).toContain('1988-11-05');
  await page.screenshot({ path: 'e2e-reading/__screens__/pe-05-use-different.png', fullPage: true });
});

// ── NEGATIVE: corrupted storage → graceful fallback to the empty form ─────────
test('negative: corrupted saved profile falls back to the form, no crash, no wrong data', async ({ page }) => {
  await mockApis(page);
  await page.addInitScript(() => localStorage.setItem('bornclock-birth-profile', 'not json {{{ corrupt'));
  await page.goto('/kundali');
  // No banner, empty form, page fully functional.
  await expect(page.locator('[data-testid="saved-profile-banner"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="kundali-dob"]')).toHaveValue('');
  await expect(page.locator('[data-testid="kundali-generate-btn"]')).toBeVisible();
  // Self-healed: the garbage was removed.
  const stored = await page.evaluate(() => localStorage.getItem('bornclock-birth-profile'));
  expect(stored).toBeNull();
  await page.screenshot({ path: 'e2e-reading/__screens__/pe-06-corrupted-fallback.png', fullPage: true });
});

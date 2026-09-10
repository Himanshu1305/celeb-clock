import { test, expect, type Page } from '@playwright/test';

// Part I 2-7 — the detailed Matching report. Route-mocks /api/kundali-match with a
// realistic payload (the shape the real endpoint returns) so we can screenshot the
// full 8-koota breakdown, dosha cancellation, emphasis, timing + PDF button without
// a live backend.
const MATCH = {
  gunaMilan: {
    total: 17.5, max: 36, compatibility: 'Challenging',
    kootas: [
      { key: 'varna', label: 'Varna', score: 1, max: 1, explanation: 'Person A is Vaishya, Person B is Vaishya. Compatible.' },
      { key: 'vashya', label: 'Vashya', score: 1, max: 2, explanation: 'Person A is Manava, Person B is Chatushpada. Different but compatible.' },
      { key: 'tara', label: 'Tara', score: 1.5, max: 3, explanation: 'Auspicious one way only.' },
      { key: 'yoni', label: 'Yoni', score: 2, max: 4, explanation: 'Person A is Cow, Person B is Lion. Neutral pairing.' },
      { key: 'graha_maitri', label: 'Graha Maitri', score: 4, max: 5, explanation: 'Lords Mercury & Saturn score 4/5.' },
      { key: 'gana', label: 'Gana', score: 0, max: 6, explanation: 'Manushya–Rakshasa: the largest temperament gap.' },
      { key: 'bhakoot', label: 'Bhakoot', score: 0, max: 7, heavy: true, explanation: 'Bhakoot Dosha (5-9): classically a heavy affliction.' },
      { key: 'nadi', label: 'Nadi', score: 8, max: 8, heavy: true, explanation: 'Different Nadi — the strongest single factor is satisfied.' },
    ],
    doshas: [
      { name: 'Nadi Dosha', present: false, cancelled: false, reason: 'Different Nadi — no dosha.' },
      { name: 'Gana Dosha', present: true, cancelled: true, reason: 'Present (Manushya–Rakshasa), but classically cancelled: Moon-sign lords are friends (Mercury/Saturn); Nakshatra lords are friends (Sun/Mars).' },
    ],
    methodology: 'Computed by the classical Ashtakoota (Guna Milan) system of the Brihat Parashara Hora Shastra, using the Lahiri ayanamsa. Varna direction, Vashya half-signs and Yoni tiers use mainstream convention.',
    a: { nakshatra: 'Uttara Phalguni', pada: 2, rashiIndex: 5 }, b: { nakshatra: 'Dhanishtha', pada: 2, rashiIndex: 9 },
  },
  timing: {
    personA: { significators: ['Moon', 'Venus', 'Jupiter'], windows: [{ planet: 'Moon', level: 'antar', range: 'March 2025 to September 2026', status: 'current', describe: 'Moon Antardasha (sub-period) (March 2025 to September 2026, currently running)' }] },
    personB: { significators: ['Saturn', 'Venus', 'Jupiter'], windows: [{ planet: 'Jupiter', level: 'maha', range: 'September 2012 to September 2028', status: 'current', describe: 'Jupiter Mahadasha (main period) (September 2012 to September 2028, currently running)' }] },
    overlaps: [{ range: 'March 2025 to September 2026', aPlanet: 'Moon', bPlanet: 'Jupiter' }, { range: 'September 2027 to September 2028', aPlanet: 'Jupiter', bPlanet: 'Jupiter' }],
    note: 'Marriage-timing windows are the classical activation periods computed as real date ranges — a likelihood window, never a guaranteed date. Overlaps are periods when BOTH partners are in a favourable window.',
  },
  people: { a: { lagna: 'Makara', rashi: 'Kanya', nakshatra: 'Uttara Phalguni', pada: 2 }, b: { lagna: 'Vrishabha', rashi: 'Makara', nakshatra: 'Dhanishtha', pada: 2 } },
};

const SAVED = { dob: '1988-11-05', time: '12:30', city: { name: 'Delhi', lat: 28.6139, lon: 77.209, tz: 5.5 }, savedAt: '2026-01-01T00:00:00Z' };
async function seed(page: Page) { await page.addInitScript(p => localStorage.setItem('bornclock-birth-profile', JSON.stringify(p)), SAVED); }

test('detailed matching report: 8-koota breakdown + dosha cancellation + timing + PDF button', async ({ page }) => {
  await seed(page);
  await page.route('**/api/kundali-match*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...MATCH, _cache: 'miss' }) }));
  await page.goto('/kundali-match');
  await expect(page.locator('[data-testid="kmatch-saved-a"]')).toBeVisible();

  // second person
  await page.fill('[data-testid="kmatch-dob-b"]', '1990-04-20');
  await page.fill('[data-testid="kmatch-time-b"]', '09:15');
  await page.fill('[data-testid="kmatch-city-b"]', 'Mumbai');
  await page.locator('li button', { hasText: 'Mumbai' }).first().click();
  await page.click('[data-testid="kmatch-calculate-btn"]');

  await expect(page.locator('[data-testid="kmatch-result"]')).toBeVisible();
  // all 8 kootas rendered with explanations
  const kootas = page.locator('[data-testid="kmatch-kootas"]');
  for (const label of ['Varna', 'Vashya', 'Tara', 'Yoni', 'Graha Maitri', 'Gana', 'Bhakoot', 'Nadi']) {
    await expect(kootas).toContainText(label);
  }
  // dosha cancellation transparency
  await expect(page.locator('[data-testid="kmatch-doshas"]')).toContainText('Gana Dosha');
  await expect(page.locator('[data-testid="kmatch-doshas"]')).toContainText('cancelled');
  // marriage timing + overlap dates
  await expect(page.locator('[data-testid="kmatch-timing"]')).toContainText('March 2025 to September 2026');
  await expect(page.locator('[data-testid="kmatch-timing"]')).toContainText('BOTH charts are favourable');
  // methodology + PDF button present
  await expect(page.locator('[data-testid="kmatch-methodology"]')).toContainText('Lahiri');
  await expect(page.locator('[data-testid="kmatch-print"]')).toBeVisible();
  await page.screenshot({ path: 'e2e-reading/__screens__/mi-01-matching-detailed.png', fullPage: true });
});

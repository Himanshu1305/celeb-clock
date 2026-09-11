import { test, expect, type Page } from '@playwright/test';

// Part J.1 — the rebuilt Lagna-based gemstone page. Route-mocks /api/gemstones with a
// realistic payload (the shape the real endpoint returns) so we can screenshot the
// methodology note + avoid list and confirm it reads clearly, no live backend needed.
const REPORT = {
  primary: { planet: 'Venus', gem: 'Diamond', hindi: 'Heera', role: 'Yogakaraka', dashaActive: false, trialCaution: false,
    reason: 'Venus is your Yogakaraka — it rules both a Kendra and a Trikona (houses 5, 10) for Makara rising, making it the single most powerful planet to strengthen. Its stone is Diamond (Heera).' },
  additional: [{ planet: 'Saturn', gem: 'Blue Sapphire', hindi: 'Neelam', role: 'Ascendant lord', dashaActive: false, trialCaution: true, reason: 'Saturn rules your Ascendant, so its stone Blue Sapphire is a supportive lifelong strengthener alongside the Yogakaraka.' }],
  additionalNote: null,
  avoid: [
    { planet: 'Sun', gem: 'Ruby', reason: 'Sun rules the 8th house (a difficult house) for Makara rising and gains no offsetting benefic rulership, so its stone (Ruby) is traditionally avoided for you.' },
    { planet: 'Jupiter', gem: 'Yellow Sapphire', reason: 'Jupiter rules the 12th house for Makara rising and gains no offsetting benefic rulership, so its stone (Yellow Sapphire) is traditionally avoided for you.' },
  ],
  methodology: { text: 'This recommendation is based on your Ascendant (Lagna), which multiple classical sources identify as the correct foundation for gemstone selection — not your Moon sign (Rashi) alone, which is a common but less precise shortcut. We considered: your Ascendant Makara and its lord Saturn; your Yogakaraka Venus (rules houses 5, 10); the current strength of Venus (strong per Shadbala); and your current planetary period (Rahu / Moon). The primary suggestion is Diamond for Venus (Yogakaraka).' },
  classificationNote: 'Functional benefic/malefic status here is computed from your Ascendant’s whole-sign house rulerships. Traditions differ on some edge cases (the kendradhipati nuance), so treat the "avoid" list as the mainstream conservative view.',
  disclaimer: 'These are TRADITIONAL/CLASSICAL associations only — not medical advice, not a guaranteed effect, and not a product recommendation. Please consult a qualified astrologer; BornClock sells nothing and links to no seller.',
};
const SAVED = { dob: '1988-11-05', time: '12:30', city: { name: 'Delhi', lat: 28.6139, lon: 77.209, tz: 5.5 }, savedAt: '2026-01-01T00:00:00Z' };
async function seed(page: Page) { await page.addInitScript(p => localStorage.setItem('bornclock-birth-profile', JSON.stringify(p)), SAVED); }

test('gemstone page: Lagna-based methodology note renders clearly + avoid list shows', async ({ page }) => {
  await seed(page);
  await page.route('**/api/gemstones*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ report: REPORT, lagna: 'Makara', _cache: 'miss' }) }));
  await page.goto('/gemstones');
  // saved profile pre-fills the form; submit
  await page.click('[data-testid="gemstone-generate-btn"]');
  await expect(page.locator('[data-testid="gemstone-result"]')).toBeVisible();

  const method = page.locator('[data-testid="gemstone-methodology"]');
  await expect(method).toContainText('based on your Ascendant');
  await expect(method).toContainText('not your Moon sign (Rashi) alone');
  await expect(method).toContainText('Yogakaraka Venus');
  // methodology stays method-focused — no competitor/seller disparagement visible
  await expect(method).not.toContainText(/other apps|sellers are|scam|untrustworthy/i);

  await expect(page.locator('[data-testid="gem-primary"]')).toContainText('Diamond');
  await expect(page.locator('[data-testid="gemstone-avoid"]')).toContainText('Ruby');
  await page.screenshot({ path: 'e2e-reading/__screens__/pj-01-gemstone.png', fullPage: true });
});

import { test, expect } from '@playwright/test';

// P5 real-use checks on the live preview. Each asserts a real result renders
// from the real (unmocked) API — not just that a page loaded.

test.describe('P5-1 robust city lookup', () => {
  test('bundled city resolves + OpenStreetMap attribution shown', async ({ page }) => {
    await page.goto('/kundali/', { waitUntil: 'networkidle' });
    const city = page.getByTestId('kundali-city');
    await expect(city).toBeVisible();
    await city.click();
    await city.fill('Mumbai');
    // Suggestion from the bundled dataset appears (offline, no Nominatim).
    const suggestion = page.getByRole('button', { name: /Mumbai/ }).first();
    await expect(suggestion).toBeVisible();
    // OSM attribution is present near the city field (licence requirement).
    await expect(page.getByText(/OpenStreetMap/i).first()).toBeVisible();
  });
});

test.describe('P5-2 conversion funnel', () => {
  test('generating a chart fires a consent-gated chart_generated event', async ({ page }) => {
    const funnelHits: string[] = [];
    page.on('request', (r) => {
      const u = r.url();
      const body = r.postData() || '';
      if (/analytics_events/.test(u) || /chart_generated/.test(body)) funnelHits.push(u + ' :: ' + body);
    });

    // Simulate a consenting visitor deterministically (analytics consent granted)
    // so the consent-gated beacon is allowed to fire.
    await page.addInitScript(() => {
      try {
        localStorage.setItem('cookie_consent', JSON.stringify({ necessary: true, analytics: true, marketing: false }));
      } catch { /* noop */ }
    });

    await page.goto('/kundali/', { waitUntil: 'networkidle' });

    // Fill birth details (reference chart) and generate.
    await page.getByTestId('kundali-dob').fill('1978-05-13');
    await page.getByTestId('kundali-time').fill('19:30');
    const city = page.getByTestId('kundali-city');
    await city.click();
    await city.fill('Jammu');
    await page.getByRole('button', { name: /Jammu/ }).first().click();
    await page.getByTestId('kundali-generate-btn').click();

    // A real chart renders (Rashi/Lagna/Nakshatra appear).
    await expect(page.getByText(/Rashi|Moon sign|Lagna|Nakshatra/i).first()).toBeVisible({ timeout: 45_000 });

    // The funnel beacon fired to the real analytics table with the chart event.
    await expect.poll(() => funnelHits.some(h => /chart_generated/.test(h)), { timeout: 10_000 }).toBe(true);
  });
});

test.describe('P5-4 born-today photos (free-licensed + credited)', () => {
  test('photo endpoint returns a free image + credit through BornClock', async ({ request }) => {
    // Depends on the live Wikimedia API; under parallel load its unauthenticated
    // API can transiently rate-limit. Real users hit the 7-day edge cache after
    // the first resolve, so retry a few times to mirror that.
    let body: any = null;
    for (let i = 0; i < 4; i++) {
      const res = await request.get('/api/born-today-photo?name=Albert%20Einstein');
      expect(res.status()).toBe(200);
      body = await res.json();
      if (body.image) {
        // 7-day edge cache = periodic refresh (only set on a resolved image).
        expect(res.headers()['cache-control']).toContain('s-maxage=604800');
        break;
      }
      await new Promise(r => setTimeout(r, 1500));
    }
    expect(body.image, 'free image resolved for Einstein').toContain('wikimedia.org');
    expect(body.credit).toBeTruthy();
    expect(body.credit.source).toBe('Wikimedia Commons');
    expect(body.credit.license).toBeTruthy();
  });

  test('todays-birthdays renders real born-today people', async ({ page }) => {
    await page.goto('/todays-birthdays/', { waitUntil: 'networkidle' });
    await expect(page.locator('h1').first()).toBeVisible();
    // Real born-today data renders: the page shows an age like "turns 57" / "aged 42"
    // or a "Born <year>" line computed for today's real celebrities.
    await expect(
      page.getByText(/turns?\s+\d+|aged?\s+\d+|born\s+\d{4}|\d+\s+years?/i).first()
    ).toBeVisible({ timeout: 30_000 });
  });
});

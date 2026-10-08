import { test, expect } from '@playwright/test';

// Real-use against the live preview worker (real unmocked /api). Uses carry-forward
// params so no geocoding/Nominatim call is needed. Reference chart: 1978-05-13
// 19:30 Jammu (lat 32.73, lon 74.87, tz +5.5).
const REF = 'dob=1978-05-13&time=19:30&place=Jammu&lat=32.73&lon=74.87&tz=5.5';

test('Kundli: South-Indian chart toggle + period forecast render from real API', async ({ page }) => {
  await page.goto(`/kundali?${REF}`);
  await expect(page.getByTestId('kundali-chart')).toBeVisible({ timeout: 25000 }); // north by default
  // Toggle to South Indian.
  await page.getByTestId('chart-style-south').click();
  await expect(page.getByTestId('kundali-chart-south')).toBeVisible();
  // Period forecast present with tabs.
  const pf = page.getByTestId('period-forecast');
  await expect(pf).toBeVisible();
  await page.getByTestId('period-tab-monthly').click();
  await expect(page.getByTestId('period-list-monthly')).toBeVisible();
  // Free PDF button present.
  await expect(page.getByTestId('kundali-download-pdf')).toBeVisible();
});

// NOTE: the matching page's 10-porutham + Manglik output is verified directly
// against the live /api/kundali-match endpoint (curl, see the P2 report) because
// its city picker requires an OpenStreetMap Nominatim geocode that is rate-limited
// and flaky in headless runs — a documented tooling limitation, not a product gap.

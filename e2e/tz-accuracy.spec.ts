// fix-timezone-accuracy — real-use browser tests (staging; real engine, real geocoder,
// no mocks). Expected Moon/zone values come from the independent reference
// (src/lib/timezone/__tests__/fixtures/independent-reference.json).
import { test, expect, type Page } from '@playwright/test';

async function pickCity(page: Page, testid: string, query: string, label: string) {
  const input = page.getByTestId(testid);
  await input.fill(query);
  const opts = page.getByTestId(`${testid}-option`);
  await expect(opts.first()).toBeVisible();
  // Bundled list first; if the wanted place isn't there, ask for more places.
  if (!(await opts.filter({ hasText: label }).count())) {
    const more = page.getByTestId(`${testid}-more`);
    if (await more.count()) await more.click();
  }
  const opt = page.getByTestId(`${testid}-option`).filter({ hasText: new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) });
  await expect(opt).toHaveCount(1);
  await opt.click();
  await expect(input).toHaveValue(label);
}

async function person(page: Page, k: 'a' | 'b', p: { dob: string; time: string; q: string; label: string }) {
  await page.getByTestId(`kmatch-dob-${k}`).fill(p.dob);
  await page.getByTestId(`kmatch-time-${k}`).fill(p.time);
  await pickCity(page, `kmatch-city-${k}`, p.q, p.label);
}

async function rows(page: Page) {
  const out: Record<string, string> = {};
  for (const key of ['varna', 'vashya', 'tara', 'yoni', 'graha_maitri', 'gana', 'bhakoot', 'nadi']) {
    out[key] = (await page.getByTestId(`kmatch-koota-row-${key}`).locator('td').nth(1).innerText()).trim();
  }
  return out;
}

test.describe('Kundali Matching — foreign births', () => {
  test('repro: Lucknow × "Pontiac, Michigan, USA" → girl Tula / Chitra 3, Bhakut 0, full koota table', async ({ page }) => {
    await page.goto('/kundali-match');
    await person(page, 'a', { dob: '1996-08-31', time: '13:04', q: 'Lucknow', label: 'Lucknow, Uttar Pradesh, India' });
    // Both Pontiacs are offered; the user picks Michigan explicitly.
    await page.getByTestId('kmatch-dob-b').fill('1999-12-03');
    await page.getByTestId('kmatch-time-b').fill('11:03');
    await page.getByTestId('kmatch-city-b').fill('Pontiac');
    await expect(page.getByTestId('kmatch-city-b-option').filter({ hasText: 'Pontiac, Illinois, USA' })).toBeVisible();
    await page.getByTestId('kmatch-city-b-option').filter({ hasText: 'Pontiac, Michigan, USA' }).first().click();
    await expect(page.getByTestId('kmatch-city-b-tz')).toContainText('Born in Pontiac, Michigan, USA · time zone America/Detroit (UTC−5 on that date, standard time)');

    await page.getByTestId('kmatch-calculate-btn').click();
    await expect(page.getByTestId('kmatch-result')).toBeVisible();

    await expect(page.getByTestId('kmatch-place-b')).toHaveText('Pontiac, Michigan, USA');
    await expect(page.getByTestId('kmatch-tz-b')).toContainText('America/Detroit · UTC−05:00');
    await expect(page.getByTestId('kmatch-moon-b')).toContainText('Tula 0.28°');
    await expect(page.getByTestId('kmatch-moon-b')).toContainText('Chitra pada 3');
    await expect(page.getByTestId('kmatch-lagna-b')).toContainText('Makara');
    await expect(page.getByTestId('kmatch-note-b').first()).toHaveText('Moon is near a sign boundary. A small birth-time difference can change this result. Please double-check the birth time.');
    await expect(page.getByTestId('kmatch-tz-a')).toContainText('Asia/Kolkata · UTC+05:30');
    await expect(page.getByTestId('kmatch-moon-a')).toContainText('Meena');
    await expect(page.getByTestId('kmatch-moon-a')).toContainText('Revati pada 1');
    await expect(page.getByTestId('kmatch-method')).toHaveText('Sidereal (Lahiri), computed from your exact birthplace and local time.');

    // Full 8-koota table. Timezone-dependent kootas match Astrotalk exactly; Vashya/Yoni/Gana
    // differ by the engine's (unchanged) koota rules → 15 instead of Astrotalk's 13.5.
    expect(await rows(page)).toEqual({
      varna: '1 / 1', vashya: '1 / 2', tara: '1.5 / 3', yoni: '2 / 4',
      graha_maitri: '0.5 / 5', gana: '1 / 6', bhakoot: '0 / 7', nadi: '8 / 8',
    });
    await expect(page.getByTestId('kmatch-koota-total')).toHaveText('15 / 36');
  });

  test('Australia: Sydney (AEDT, DST) × Brisbane (AEST, no DST), January', async ({ page }) => {
    await page.goto('/kundali-match');
    await person(page, 'a', { dob: '1998-01-25', time: '16:40', q: 'Sydney', label: 'Sydney, New South Wales, Australia' });
    await person(page, 'b', { dob: '1998-01-25', time: '16:40', q: 'Brisbane', label: 'Brisbane, Queensland, Australia' });
    await page.getByTestId('kmatch-calculate-btn').click();
    await expect(page.getByTestId('kmatch-tz-a')).toContainText('Australia/Sydney · UTC+11:00');
    await expect(page.getByTestId('kmatch-tz-b')).toContainText('Australia/Brisbane · UTC+10:00');
    await expect(page.getByTestId('kmatch-moon-a')).toContainText('Dhanu 2.2'); // ref 2.259°
    await expect(page.getByTestId('kmatch-moon-a')).toContainText('Mula pada 1');
    await expect(page.getByTestId('kmatch-moon-b')).toContainText('Dhanu 2.8'); // ref 2.817°
    await expect(page.getByTestId('kmatch-lagna-a')).toContainText('Vrishabha');
    await expect(page.getByTestId('kmatch-lagna-b')).toContainText('Mithuna');
    await expect(page.getByTestId('kmatch-koota-table')).toBeVisible();
    await expect(page.getByTestId('kmatch-koota-total')).toHaveText('28 / 36');
  });

  test('Europe: London (BST) × Berlin (CEST), July', async ({ page }) => {
    await page.goto('/kundali-match');
    await person(page, 'a', { dob: '1988-07-22', time: '19:20', q: 'London', label: 'London, England, UK' });
    await person(page, 'b', { dob: '1993-07-08', time: '03:10', q: 'Berlin', label: 'Berlin, Germany' });
    await page.getByTestId('kmatch-calculate-btn').click();
    await expect(page.getByTestId('kmatch-tz-a')).toContainText('Europe/London · UTC+01:00');
    await expect(page.getByTestId('kmatch-tz-b')).toContainText('Europe/Berlin · UTC+02:00');
    await expect(page.getByTestId('kmatch-moon-a')).toContainText('Tula');
    await expect(page.getByTestId('kmatch-moon-a')).toContainText('Swati pada 3');
    await expect(page.getByTestId('kmatch-moon-b')).toContainText('Kumbha');
    await expect(page.getByTestId('kmatch-moon-b')).toContainText('Shatabhisha pada 1');
    await expect(page.getByTestId('kmatch-lagna-a')).toContainText('Dhanu');
    await expect(page.getByTestId('kmatch-lagna-b')).toContainText('Vrishabha');
    await expect(page.getByTestId('kmatch-koota-total')).toHaveText('20 / 36');
  });

  test('typing a city without picking never guesses — asks the user to pick', async ({ page }) => {
    await page.goto('/kundali-match');
    await page.getByTestId('kmatch-dob-b').fill('1999-12-03');
    await page.getByTestId('kmatch-time-b').fill('11:03');
    await page.getByTestId('kmatch-city-b').fill('Pontiac');
    await expect(page.getByTestId('kmatch-city-b-option').first()).toBeVisible();
    await page.getByTestId('kmatch-city-b').press('Tab');
    await expect(page.getByTestId('kmatch-calculate-btn')).toBeDisabled();
  });
});

test.describe('Kundali — foreign birth', () => {
  test('New York, July: place, zone, offset and Lagna on screen', async ({ page }) => {
    await page.goto('/kundali');
    await page.getByTestId('kundali-dob').fill('1990-07-15');
    await page.getByTestId('kundali-time').fill('08:30');
    await pickCity(page, 'kundali-city', 'New York', 'New York, New York, USA');
    await expect(page.getByTestId('kundali-city-tz')).toContainText('time zone America/New_York (UTC−4 on that date, daylight saving)');
    await page.getByTestId('kundali-generate-btn').click();
    await expect(page.getByTestId('kundali-birth-data')).toBeVisible();
    await expect(page.getByTestId('kundali-birth-data-place')).toHaveText('New York, New York, USA');
    await expect(page.getByTestId('kundali-birth-data-tz')).toContainText('America/New_York · UTC−04:00');
    await expect(page.getByTestId('kundali-birth-data-lagna')).toContainText('Simha 2.0'); // ref 2.013°
    await expect(page.getByTestId('kundali-lagna')).toContainText('Simha');
    await expect(page.getByTestId('kundali-birth-data-moon')).toContainText('Meena');
    await expect(page.getByTestId('kundali-birth-data-moon')).toContainText('Revati pada 4');
    // Moon 359.82° is 0.18° from the Meena/Mesha edge → boundary note.
    await expect(page.getByTestId('kundali-birth-data-note').first()).toContainText('Moon is near a sign boundary.');
    await expect(page.getByTestId('kundali-birth-data-method')).toHaveText('Sidereal (Lahiri), computed from your exact birthplace and local time.');
  });

  test('Advanced: manual timezone changes the offset preview', async ({ page }) => {
    await page.goto('/kundali');
    await page.getByTestId('kundali-dob').fill('1999-12-03');
    await page.getByTestId('kundali-time').fill('11:03');
    await pickCity(page, 'kundali-city', 'London', 'London, England, UK');
    await page.getByText('Advanced: set timezone manually').click();
    await page.getByTestId('kundali-city-tz-manual').selectOption('America/Detroit');
    await expect(page.getByTestId('kundali-city-tz-preview')).toContainText('UTC−05:00 (America/Detroit)');
    await expect(page.getByTestId('kundali-city-tz')).toContainText('time zone America/Detroit (UTC−5 on that date, standard time) · set manually');
  });
});

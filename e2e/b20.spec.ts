/**
 * B20 — Kerala porutham on /ml/, Holi + Diwali 2027 muhurat pages, new /accuracy rows.
 *   Local:  npx tsx scripts/b20-local-serve.mts 4321 &  BASE_URL=http://localhost:4321 npx playwright test e2e/b20.spec.ts
 *   Prod:   BASE_URL=https://bornclock.com npx playwright test e2e/b20.spec.ts
 * Screenshots go to docs/b20/ when SHOTS=1.
 */
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const SHOTS = process.env.SHOTS === '1';
test.use({ baseURL: BASE });
// The cookie banner covers the city list on a phone; decline non-essential cookies up front.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(v => { try { localStorage.setItem('cookie_consent', JSON.stringify({ essential: true, analytics: false, marketing: false, timestamp: new Date().toISOString(), version: v })); } catch { /* ignore */ } }, '1.0');
});

type Couple = { g: string[]; b: string[]; por: Record<string, number> };
const FIX: Couple[] = JSON.parse(readFileSync('src/lib/vedic/__tests__/golden/prokeralaKerala.json', 'utf8'));
const KEY: Record<string, string> = { Dina: 'dina', Gana: 'gana', Mahendra: 'mahendra', 'Stree Deergha': 'stree-deergha', Yoni: 'yoni', Veda: 'vedha', Rajju: 'rajju', Rasi: 'rasi', Rasiyathipathi: 'rasyadhipathi', Vasya: 'vasya' };
const pad = (n: string) => n.padStart(2, '0');
const dob = (p: string[]) => `${p[0]}-${pad(p[1])}-${pad(p[2])}`;
const time = (p: string[]) => { let h = Number(p[3]) % 12; if (p[5] === 'pm') h += 12; return `${pad(String(h))}:${pad(p[4])}`; };

function watch(page: Page) {
  const errors: string[] = [];
  // Third-party scripts (analytics, ads, OSM) are out of scope; a sandbox without internet
  // reports them as ERR_TUNNEL/ERR_NAME failures. Only first-party errors fail the test.
  page.on('console', m => { if (m.type() === 'error' && !/googletagmanager|google-analytics|adsbygoogle|clarity|ERR_TUNNEL_CONNECTION_FAILED|ERR_NAME_NOT_RESOLVED|ERR_CONNECTION/i.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  page.on('response', r => { const u = r.url(); if (r.status() === 404 && u.startsWith(BASE)) errors.push(`404 ${u}`); });
  return errors;
}

async function fillPerson(page: Page, who: 'boy' | 'girl', p: string[]) {
  await page.getByTestId(`lkm-dob-${who}`).fill(dob(p));
  await page.getByTestId(`lkm-time-${who}`).fill(time(p));
  const city = page.getByTestId(`lkm-city-${who}`);
  await city.fill('Ujjain');
  await page.getByTestId(`lkm-city-${who}-option`).first().click();
  await expect(page.getByTestId(`lkm-city-${who}-confirm`)).toBeVisible();
}

test.describe('B20 E1–E2 — /ml/ matching, Kerala default', () => {
  test('E1 — couple from the ProKerala fixture: Kerala scores match; Tamil toggle; reload keeps Kerala', async ({ page }) => {
    const errors = watch(page);
    const c = FIX[0];
    await page.goto('/ml/jathaka-porutham/');
        await fillPerson(page, 'boy', c.b);
    await fillPerson(page, 'girl', c.g);
    await page.getByTestId('lkm-calculate-btn').click();
    const kerala = page.getByTestId('lkm-porutham-kerala');
    await expect(kerala).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('lkm-system-kerala')).toHaveAttribute('aria-pressed', 'true');
    const total = Object.values(c.por).reduce((a, b) => a + b, 0);
    await expect(kerala).toHaveAttribute('data-total', String(total));
    for (const [name, score] of Object.entries(c.por)) await expect(page.getByTestId(`lkm-kerala-${KEY[name]}`)).toHaveAttribute('data-score', String(score));
    if (SHOTS) await page.screenshot({ path: `docs/b20/ml-kerala-${page.viewportSize()!.width}.jpg`, fullPage: true, type: 'jpeg', quality: 72, scale: 'css' });

    await page.getByTestId('lkm-system-tamil').click();
    await expect(page.getByTestId('lkm-porutham')).toBeVisible();
    await expect(kerala).toBeHidden();
    await page.getByTestId('lkm-system-kerala').click();
    await expect(kerala).toBeVisible();

    await page.reload();
    await fillPerson(page, 'boy', c.b);
    await fillPerson(page, 'girl', c.g);
    await page.getByTestId('lkm-calculate-btn').click();
    await expect(page.getByTestId('lkm-porutham-kerala')).toBeVisible({ timeout: 20_000 });
    expect(errors).toEqual([]);
  });

  test('E1b — the Tamil page still shows Tamil only', async ({ page }) => {
    await page.goto('/ta/jathaga-porutham/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByTestId('lkm-system-toggle')).toHaveCount(0);
  });

  test('E2 — missing time or a future date keeps the button disabled, no crash', async ({ page }) => {
    const errors = watch(page);
    await page.goto('/ml/jathaka-porutham/');
    await page.getByTestId('lkm-dob-boy').fill('1992-07-08');
    await page.getByTestId('lkm-city-boy').fill('Ujjain');
    await page.getByTestId('lkm-city-boy-option').first().click();
    await expect(page.getByTestId('lkm-calculate-btn')).toBeDisabled();
    await page.getByTestId('lkm-dob-girl').fill('2099-01-01');
    await page.getByTestId('lkm-time-girl').fill('10:00');
    await expect(page.getByTestId('lkm-calculate-btn')).toBeDisabled();
    expect(errors).toEqual([]);
  });
});

const FEST = [
  { path: '/festivals/2027/holi/', kind: 'holi', hi: '/hi/festivals/2027/holi/' },
  { path: '/festivals/2027/diwali/', kind: 'diwali', hi: '/hi/festivals/2027/diwali/' },
];

test.describe('B20 E3–E4, E6 — Holi and Diwali 2027', () => {
  for (const f of [...FEST.map(x => ({ ...x, lang: 'en' })), ...FEST.map(x => ({ ...x, path: x.hi, hi: x.path, lang: 'hi' }))]) {
    test(`E3/E4 ${f.path}`, async ({ page, request }) => {
      const errors = watch(page);
      await page.goto(f.path);
      await expect(page.locator('h1')).toBeVisible();
      const block = page.getByTestId(`muhurat-${f.kind}`);
      await expect(block).toBeVisible();
      await expect(page.getByTestId(`muhurat-${f.kind}-time`)).not.toBeEmpty();
      await expect(page.locator(`[data-testid="muhurat-${f.kind}-cities"] tbody tr`)).toHaveCount(10);
      if (f.kind === 'diwali') await expect(page.locator('[data-testid="muhurat-diwali-days"] tbody tr')).toHaveCount(5);
      // .ics
      const href = await page.getByTestId('muhurat-ics').first().getAttribute('href');
      expect(href).toMatch(/^data:text\/calendar/);
      expect(decodeURIComponent(href!.split(',')[1])).toContain('BEGIN:VEVENT');
      // FAQ toggles closed and open again
      const det = page.locator('details').first();
      const isOpen = () => det.evaluate(d => (d as HTMLDetailsElement).open);
      const before = await isOpen();
      await det.locator('summary').click();
      await expect.poll(isOpen).toBe(!before);
      await det.locator('summary').click();
      await expect.poll(isOpen).toBe(before);
      // hreflang both ways
      const alt = await page.locator('link[rel="alternate"][hreflang]').evaluateAll(ls => ls.map(l => (l as HTMLLinkElement).getAttribute('href')));
      expect(alt.some(h => h?.endsWith(f.hi))).toBe(true);
      // og:image
      const og = (await request.get(new URL(f.path, BASE).toString()).then(r => r.text())).match(/<meta property="og:image" content="([^"]+)"/)?.[1];
      expect(og).toMatch(/\/og\/vedic\.png$/);
      const ogRes = await request.get(new URL('/og/vedic.png', BASE).toString());
      expect(ogRes.status()).toBe(200);
      expect(ogRes.headers()['content-type']).toContain('image/png');
      if (SHOTS) await page.screenshot({ path: `docs/b20/${f.lang}-${f.kind}-${page.viewportSize()!.width}.jpg`, fullPage: true, type: 'jpeg', quality: 72, scale: 'css' });
      expect(errors).toEqual([]);
    });
  }
});

test('B20 E5 — /accuracy shows the three new rows with numbers', async ({ page }) => {
  await page.goto('/accuracy/');
  for (const id of ['porutham-kerala', 'panchang-swiss', 'varshphal']) {
    const row = page.getByTestId(`accuracy-row-${id}`);
    await expect(row).toBeVisible();
    await expect(row).toContainText(/\d/);
  }
  await expect(page.getByTestId('accuracy-row-porutham-kerala')).toContainText('2350');
  await expect(page.getByTestId('accuracy-row-panchang-swiss')).toContainText('2190');
  await expect(page.getByTestId('accuracy-row-varshphal')).toContainText('48');
  if (SHOTS) await page.screenshot({ path: `docs/b20/accuracy-${page.viewportSize()!.width}.jpg`, fullPage: true, type: 'jpeg', quality: 72, scale: 'css' });
});

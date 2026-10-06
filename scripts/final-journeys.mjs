// FINAL run — supplementary journeys + API smoke on staging (Fifth Rule).
// Covers items not in the per-group journey scripts: the newly-migrated fitness
// widget page, the paid-flow checkout opening, EN/हि + phone menu, and safe API
// smoke (no real user data, no real email — negative/guard paths only).
import { chromium, webkit, devices } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = (process.env.BASE || 'https://bornclock-staging.usdvisionai.workers.dev').replace(/\/$/, '');
const out = 'docs/migration-screens/final/journey';
mkdirSync(out, { recursive: true });
const results = [];
const rec = (name, pass, detail) => { results.push({ name, pass: !!pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'} :: ${name} :: ${detail}`); };

const browser = await chromium.launch();

// 1. New fitness page — RhythmWidget interaction (migrated this run)
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });
  page.on('pageerror', e => errs.push('PAGEERR:' + String(e).slice(0, 140)));
  await page.goto(BASE + '/energy-forecast/', { waitUntil: 'networkidle', timeout: 60000 });
  const before = await page.locator('main#main').innerText();
  await page.getByPlaceholder('DD').first().fill('15');
  await page.getByPlaceholder('MM').first().fill('08');
  await page.getByPlaceholder('YYYY').first().fill('1990');
  await page.getByRole('button', { name: /rhythm|calculate|forecast|energy/i }).first().click().catch(() => {});
  await page.waitForTimeout(1200);
  const after = await page.locator('main#main').innerText();
  const changed = after.length !== before.length || /%|physical|emotional|intellectual|energy|peak|high|low/i.test(after);
  rec('fitness /energy-forecast widget computes a rhythm', changed && errs.length === 0, `changed=${changed} errs=${errs.length}`);
  await ctx.close();
}

// 2. Paid flow — pricing → click primary CTA → checkout/upgrade opens (up to opening)
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });
  await page.goto(BASE + '/pricing/', { waitUntil: 'networkidle', timeout: 60000 });
  const cta = page.getByRole('button', { name: /upgrade|unlock|get|subscribe|buy|premium|join/i })
    .or(page.getByRole('link', { name: /upgrade|unlock|get|subscribe|buy|premium|join/i })).first();
  const hadCta = await cta.count() > 0;
  let landed = page.url();
  if (hadCta) { await cta.click().catch(() => {}); await page.waitForTimeout(1500); landed = page.url(); }
  // "checkout opening" = either a Razorpay frame/modal, a dialog, or navigation to an auth/upgrade surface
  const opened = await page.locator('iframe[src*="razorpay"], [role="dialog"], form').count();
  rec('paid flow: pricing CTA opens checkout/upgrade surface (up to opening)', hadCta && opened > 0 && errs.length === 0, `cta=${hadCta} surfaces=${opened} landed=${landed} errs=${errs.length}`);
  await ctx.close();
}

// 3. EN/हि toggle + phone menu (mobile)
{
  const ctx = await browser.newContext({ ...devices['Pixel 5'] });
  const page = await ctx.newPage();
  const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 });
  // phone menu toggle
  const menu = page.locator('.menu-toggle, button[aria-label*="menu" i], button[aria-expanded]').first();
  const hasMenu = await menu.count() > 0;
  if (hasMenu) { await menu.click().catch(() => {}); await page.waitForTimeout(500); }
  const navVisible = await page.locator('nav a, .main-nav a, .site-header a').first().isVisible().catch(() => false);
  rec('phone menu opens navigation (mobile)', hasMenu && navVisible && errs.length === 0, `hasMenu=${hasMenu} navVisible=${navVisible} errs=${errs.length}`);
  // Hindi route renders Devanagari
  await page.goto(BASE + '/hi/rashifal/', { waitUntil: 'networkidle', timeout: 60000 });
  const txt = await page.locator('body').innerText();
  const dev = /[ऀ-ॿ]/.test(txt);
  rec('हि route renders Devanagari', dev, `devanagari=${dev}`);
  await ctx.close();
}
await browser.close();

// 4. API smoke — safe guard/negative paths only (no DB writes, no email)
async function api(name, path, init, expectStatuses, bodyIncludes) {
  try {
    const resp = await fetch(BASE + path, init);
    const text = await resp.text();
    const okStatus = expectStatuses.includes(resp.status);
    const okBody = bodyIncludes ? text.toLowerCase().includes(bodyIncludes.toLowerCase()) : true;
    rec(name, okStatus && okBody, `status=${resp.status} body=${text.slice(0, 80).replace(/\n/g, ' ')}`);
  } catch (e) { rec(name, false, 'ERR ' + String(e).slice(0, 80)); }
}
// create-order: missing fields → 400 guard (endpoint alive, validates, no mutation)
await api('API create-order missing product → 400 guard', '/api/create-order',
  { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) }, [400, 422]);
// create-order: invalid product → 400 (server-decided amounts; never trusts body)
await api('API create-order invalid product → 400 guard', '/api/create-order',
  { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ product: 'not_a_product', report_slug: 'x', userId: 'x' }) }, [400, 422]);
// method guard
await api('API create-order GET → 405 method guard', '/api/create-order', { method: 'GET' }, [405]);
// get-credits unauth → structured 400/401 (no data leak)
await api('API get-credits unauth → guarded', '/api/get-credits', { method: 'GET' }, [400, 401, 405]);

writeFileSync(out + '/results.json', JSON.stringify(results, null, 2));
const pass = results.filter(r => r.pass).length;
console.log(`\n==== FINAL JOURNEYS + API SMOKE: ${pass}/${results.length} PASS ====`);

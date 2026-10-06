// BIRTHDAY journeys — real-browser positive/negative/edge/share/onward-nav on staging.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const BASE = process.env.BASE || 'https://bornclock-staging.usdvisionai.workers.dev';
const out = 'docs/migration-screens/birthday/journey';
mkdirSync(out, { recursive: true });
const results = [];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
async function page(route) {
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });
  p.on('pageerror', e => errs.push('PAGEERR:' + String(e).slice(0, 140)));
  const resp = await p.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(800);
  return { p, errs, status: resp?.status() };
}
function rec(name, ok, detail) { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? ' :: ' + detail : ''}`); }

// 1. POSITIVE — Age calculator: enter a DOB in the DobInput (DD/MM/YYYY numeric
//    fields, not a native date picker), expect an "Age in years" result to render.
{
  const { p, errs } = await page('/age-calculator');
  try { await p.getByRole('button', { name: /^accept/i }).first().click({ timeout: 3000 }); } catch {}
  const day = p.getByPlaceholder('DD'), mon = p.getByPlaceholder('MM'), yr = p.getByPlaceholder('YYYY');
  let ok = false, detail = '';
  if (await day.count()) {
    await day.first().click();
    await day.first().pressSequentially('15', { delay: 60 });
    await mon.first().pressSequentially('08', { delay: 60 });
    await yr.first().pressSequentially('1990', { delay: 60 });
    await p.waitForTimeout(1800);
    const txt = await p.locator('body').innerText();
    const computed = !/see the magic happen/i.test(txt) && /Years\s*Old|\bYears\b/i.test(txt);
    ok = computed && errs.length === 0;
    detail = `DOB 15/08/1990 → ${computed ? 'age result rendered' : 'no result'}; errs=${errs.length}`;
  } else { detail = 'no DobInput (DD/MM/YYYY) fields found'; }
  await p.screenshot({ path: `${out}/01-agecalc.png` });
  rec('Positive: age-calculator DOB → result, 0 errors', ok, detail);
  await p.close();
}

// 2. NEGATIVE — /results with no selection → graceful empty state, no crash.
{
  const { p, errs, status } = await page('/results');
  const h1 = (await p.locator('h1').first().innerText().catch(() => '')).trim();
  const ok = status === 200 && errs.length === 0;
  await p.screenshot({ path: `${out}/02-results-empty.png` });
  rec('Negative: /results empty → no crash', ok, `status=${status} h1="${h1}" errs=${errs.length}`);
  await p.close();
}

// 3. EDGE — leap day born-on page renders without crash.
{
  const { p, errs, status } = await page('/born-on/february-29');
  const txt = await p.locator('body').innerText();
  const ok = status === 200 && errs.length === 0 && /februar/i.test(txt);
  await p.screenshot({ path: `${out}/03-leap-bornon.png` });
  rec('Edge: /born-on/february-29 (leap) renders', ok, `status=${status} errs=${errs.length}`);
  await p.close();
}

// 4. INVALID — soft-404: invalid born-on does not crash (renders a valid page).
{
  const { p, errs, status } = await page('/born-on/february-30');
  const url = p.url();
  const h1 = (await p.locator('h1').first().innerText().catch(() => '')).trim();
  const ok = errs.length === 0 && !!h1; // no crash, something renders
  await p.screenshot({ path: `${out}/04-invalid-bornon.png` });
  rec('Invalid: /born-on/february-30 no crash (soft-404)', ok, `httpStatus=${status} landedOn=${url.replace(BASE, '')} h1="${h1}"`);
  await p.close();
}

// 5. CELEBRITY profile — CTA to /birthday-report + working breadcrumb onward nav.
{
  const { p, errs } = await page('/celebrity/mahatma-gandhi');
  const cta = p.locator('[data-testid="cta-birthday-report"]');
  const ctaHref = await cta.first().getAttribute('href').catch(() => null);
  // onward nav: click the Celebrities breadcrumb link
  let navOk = false, navTo = '';
  const bc = p.locator('.breadcrumb a', { hasText: 'Celebrities' }).first();
  if (await bc.count()) { await bc.click(); await p.waitForTimeout(800); navTo = p.url().replace(BASE, ''); navOk = /\/celebrity\/?$/.test(navTo); }
  const ok = !!ctaHref && ctaHref.includes('/birthday-report') && navOk && errs.length === 0;
  await p.screenshot({ path: `${out}/05-celeb-nav.png` });
  rec('Celebrity: CTA→/birthday-report + breadcrumb onward nav', ok, `cta=${ctaHref} nav→${navTo} errs=${errs.length}`);
  await p.close();
}

// 6. SHARE — born-on page exposes a WhatsApp/native share affordance.
{
  const { p } = await page('/born-on/august-15');
  const txt = (await p.locator('body').innerText()).toLowerCase();
  const share = await p.locator('[data-testid*="share"], a[href*="wa.me"], a[href*="whatsapp"], button:has-text("Share")').count();
  const ok = share > 0 || /share|whatsapp/.test(txt);
  await p.screenshot({ path: `${out}/06-share.png` });
  rec('Share: born-on page has share affordance', ok, `shareEls=${share}`);
  await p.close();
}

// 7. SEARCH ARRIVAL — celebrity index search/browse → onward to a profile.
{
  const { p, errs } = await page('/celebrity');
  const link = p.locator('a[href^="/celebrity/"]').first();
  let to = '';
  if (await link.count()) { to = await link.getAttribute('href'); }
  const ok = !!to && errs.length === 0;
  rec('Search arrival: /celebrity → profile link present', ok, `firstLink=${to} errs=${errs.length}`);
  await p.close();
}

await b.close();
const pass = results.filter(r => r.ok).length;
console.log(`\n===== JOURNEYS: ${pass}/${results.length} passed =====`);
process.exit(pass === results.length ? 0 : 1);

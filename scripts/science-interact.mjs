// SCIENCE Step-2 interaction checks against LIVE staging (Fifth Rule).
// Drives the real calculators: positive, negative, edge inputs + gating preservation.
import { chromium, webkit, devices } from '@playwright/test';

const BASE = process.env.BASE || 'https://bornclock-staging.usdvisionai.workers.dev';
const results = [];
function rec(name, ok, detail) { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} — ${detail}`); }

async function withPage(engine, opts, fn) {
  const browser = await engine.launch();
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 140)));
  try { await fn(page, errs); } finally { await ctx.close(); await browser.close(); }
}

const ENGINES = [
  { name: 'chromium', engine: chromium, opts: { viewport: { width: 1440, height: 900 } } },
  { name: 'webkit', engine: webkit, opts: { ...devices['iPhone 13'] } },
];

for (const E of ENGINES) {
  const tag = `[${E.name}]`;
  await withPage(E.engine, E.opts, async (page, errs) => {
    // 1. POSITIVE — planetary age via ?dob= (shared useBirthDate)
    await page.goto(`${BASE}/planetary-age?dob=1990-05-15`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200);
    let body = await page.evaluate(() => document.body.innerText);
    const hasPlanets = /Mars/.test(body) && /Mercury/.test(body) && /Jupiter/.test(body);
    const hasAge = /\d+(\.\d+)?/.test(body);
    rec(`${tag} planetary-age positive (1990-05-15) shows all planets+ages`, hasPlanets && hasAge, `planets=${hasPlanets} numeric=${hasAge} err=${errs.length}`);

    // 2. EDGE — leap-day birth
    errs.length = 0;
    await page.goto(`${BASE}/planetary-age?dob=2000-02-29`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1000);
    body = await page.evaluate(() => document.body.innerText);
    rec(`${tag} planetary-age edge leap-day (2000-02-29)`, /Mars/.test(body) && errs.length === 0, `rendered=${/Mars/.test(body)} err=${errs.length}`);

    // 3. EDGE — 1900 birth
    errs.length = 0;
    await page.goto(`${BASE}/planetary-age?dob=1900-01-01`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1000);
    body = await page.evaluate(() => document.body.innerText);
    rec(`${tag} planetary-age edge 1900-01-01`, /Mars/.test(body) && errs.length === 0, `rendered=${/Mars/.test(body)} err=${errs.length}`);

    // 4. NEGATIVE — invalid date (31 Feb) and garbage → no crash
    errs.length = 0;
    await page.goto(`${BASE}/planetary-age?dob=2024-02-31`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(800);
    let status1ok = errs.length === 0;
    await page.goto(`${BASE}/planetary-age?dob=not-a-date`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(800);
    body = await page.evaluate(() => document.body.innerText);
    const hasInputStill = /date of birth/i.test(body) || /Calculate/i.test(body);
    rec(`${tag} planetary-age negative (31-Feb / garbage) no crash`, status1ok && errs.length === 0 && hasInputStill, `err=${errs.length} inputShown=${hasInputStill}`);

    // 5. weight-on-planets — positive default + empty negative + recompute
    errs.length = 0;
    await page.goto(`${BASE}/weight-on-planets`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(800);
    body = await page.evaluate(() => document.body.innerText);
    const defaultShows = /Jupiter/.test(body) && /Moon/.test(body) && /\d/.test(body);
    const input = page.locator('#weight');
    await input.fill('');
    await page.waitForTimeout(400);
    const afterEmptyErr = errs.length;
    await input.fill('100');
    await page.waitForTimeout(500);
    const recompErr = errs.length;
    rec(`${tag} weight-on-planets positive+empty+recompute`, defaultShows && afterEmptyErr === 0 && recompErr === 0, `default=${defaultShows} emptyErr=${afterEmptyErr} recomputeErr=${recompErr}`);

    // 6. GATING — life-expectancy calculator renders + paywall wiring present, empty submit no crash
    errs.length = 0;
    await page.goto(`${BASE}/life-expectancy`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200);
    body = await page.evaluate(() => document.body.innerText);
    const calcPresent = /calculat/i.test(body) || /life expectancy/i.test(body);
    // probe: is a gating/upgrade/preview mechanism referenced anywhere in DOM or bundle markers
    const gating = await page.evaluate(() => {
      const t = document.body.innerText.toLowerCase();
      return /unlock|upgrade|premium|preview|get your|full report|sign in|member/.test(t);
    });
    rec(`${tag} life-expectancy renders + gating copy present`, calcPresent && gating && errs.length === 0, `calc=${calcPresent} gating=${gating} err=${errs.length}`);

    // 7. EDGE — Hindi page renders Devanagari h1
    errs.length = 0;
    await page.goto(`${BASE}/hi/meri-jeevan-pratyasha`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(800);
    const hi = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const devanagari = /[ऀ-ॿ]/.test(document.body.innerText);
      return { h1: (h1?.textContent || '').trim().slice(0, 50), devanagari };
    });
    rec(`${tag} Hindi /hi/meri-jeevan-pratyasha renders Devanagari`, !!hi.h1 && hi.devanagari && errs.length === 0, `h1="${hi.h1}" devanagari=${hi.devanagari} err=${errs.length}`);
  });
}

const failed = results.filter(r => !r.ok);
console.log(`\n==== ${results.length - failed.length}/${results.length} passed ====`);
if (failed.length) { console.log('FAILURES:'); failed.forEach(f => console.log(' - ' + f.name + ' :: ' + f.detail)); process.exit(1); }

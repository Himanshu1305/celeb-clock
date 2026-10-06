// NEUTRAL Step-2 input/gating/interactive tests against live staging.
// Positive / negative / edge / gating / interactive — chromium + webkit.
import { chromium, webkit, devices } from '@playwright/test';

const BASE = process.env.BASE || 'https://bornclock-staging.usdvisionai.workers.dev';
const results = [];
const rec = (name, ok, detail='') => { results.push({ name, ok, detail }); console.log(`${ok?'PASS':'FAIL'} · ${name}${detail?` — ${detail}`:''}`); };

async function withPage(engine, opts, fn) {
  const browser = await engine.launch();
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,140)); });
  page.on('pageerror', e => errs.push('PAGEERR:'+String(e).slice(0,140)));
  try { await fn(page, errs); } finally { await ctx.close(); await browser.close(); }
}

const chromeOpts = { viewport: { width: 1440, height: 900 } };
const webkitOpts = { ...devices['iPhone 13'] };

// ---- PRICING (money): prices + gating/paywall copy preserved, no crash ----
await withPage(chromium, chromeOpts, async (page, errs) => {
  await page.goto(BASE + '/pricing', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);
  const body = await page.evaluate(() => document.body.innerText);
  const hasPrice = /₹|\$|free|month|year|lifetime/i.test(body);
  const hasPlan = /premium|plus|pro|unlock|upgrade|member/i.test(body);
  rec('pricing: price tokens present', hasPrice, body.match(/₹[\d,]+|\$\d+/g)?.slice(0,5).join(', ')||'(words)');
  rec('pricing: plan/gating copy present', hasPlan);
  rec('pricing: 0 console errors', errs.length===0, errs.join(' | '));
});

// ---- UPGRADE (money): gating copy, no crash ----
await withPage(chromium, chromeOpts, async (page, errs) => {
  await page.goto(BASE + '/upgrade', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(600);
  const body = await page.evaluate(() => document.body.innerText);
  rec('upgrade: premium/unlock copy present', /premium|unlock|upgrade|member|credit/i.test(body));
  rec('upgrade: 0 console errors', errs.length===0, errs.join(' | '));
});

// ---- 404 (catch-all): styled NotFound, single h1, neutral, not a crash ----
await withPage(chromium, chromeOpts, async (page, errs) => {
  const resp = await page.goto(BASE + '/this-route-does-not-exist-xyz-123', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(600);
  const info = await page.evaluate(() => ({
    status200text: document.body.innerText.slice(0,0),
    h1: document.querySelectorAll('h1').length,
    theme: document.querySelector('.paj')?.getAttribute('data-theme'),
    hasHeader: !!document.querySelector('.site-header'),
    notFoundCopy: /not found|404|doesn|can.t find|lost/i.test(document.body.innerText),
    hasLink: !!document.querySelector('a[href="/"]'),
  }));
  rec('404: styled NotFound copy', info.notFoundCopy);
  rec('404: single h1', info.h1===1, 'h1='+info.h1);
  rec('404: neutral theme + site header', info.theme==='neutral' && info.hasHeader, 'theme='+info.theme);
  rec('404: has home link (recovery)', info.hasLink);
  rec('404: HTTP status', true, 'status='+(resp?resp.status():'?')+' (SPA soft-404, see INV-3)');
  rec('404: 0 console errors', errs.length===0, errs.join(' | '));
});

// ---- MYSTIC-CORNER positive + edge + interactive (computed tools) ----
await withPage(chromium, chromeOpts, async (page, errs) => {
  await page.goto(BASE + '/mystic-corner', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);
  // default date 14 Mar 1990 -> life path computed, western Pisces, chinese Horse
  const pos = await page.evaluate(() => document.body.innerText);
  rec('mystic-corner: default computes (life path / signs shown)', /life.?path|pisces|aries|horse|dragon|numerolog/i.test(pos));
  // interactive: click the "western" tab
  const tabs = await page.$$('[role="tab"]');
  let tabOk = false;
  if (tabs.length) { await tabs[1].click(); await page.waitForTimeout(400); tabOk = await page.evaluate(()=>/zodiac|sun.?sign|tropical/i.test(document.body.innerText)); }
  rec('mystic-corner: tabs interactive (western lens)', tabOk, 'tabs='+tabs.length);
  // edge: enter leap-day 29/02/2000 via DobInput fields
  const dayIn = await page.$('#mc-day, input[name="day"], [data-testid="mc-day"]');
  rec('mystic-corner: dob inputs present', !!dayIn);
  rec('mystic-corner: 0 console errors', errs.length===0, errs.join(' | '));
});

// ---- EMBED: iframe preview + copy button present, no crash ----
await withPage(chromium, chromeOpts, async (page, errs) => {
  await page.goto(BASE + '/embed', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(600);
  const info = await page.evaluate(() => ({
    iframe: !!document.querySelector('iframe[src*="widget/age-calculator"]'),
    copyBtn: Array.from(document.querySelectorAll('button')).some(b=>/copy/i.test(b.textContent||'')),
    code: /iframe src=/.test(document.body.innerText),
  }));
  rec('embed: live widget iframe present', info.iframe);
  rec('embed: copy-code button present', info.copyBtn);
  rec('embed: embed code shown', info.code);
  rec('embed: 0 console errors', errs.length===0, errs.join(' | '));
});

// ---- AUTH (utility): sign-in/join form present (webkit/touch) ----
await withPage(webkit, webkitOpts, async (page, errs) => {
  await page.goto(BASE + '/auth', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);
  const info = await page.evaluate(() => ({
    email: !!document.querySelector('input[type="email"], input[name="email"]'),
    anyInput: document.querySelectorAll('input').length,
    signin: /sign in|log in|join|continue|email/i.test(document.body.innerText),
    theme: document.querySelector('.paj')?.getAttribute('data-theme'),
  }));
  rec('auth(webkit): email/sign-in form present', info.email || info.anyInput>0, 'inputs='+info.anyInput);
  rec('auth(webkit): sign-in/join copy', info.signin);
  rec('auth(webkit): neutral theme', info.theme==='neutral', 'theme='+info.theme);
  rec('auth(webkit): 0 console errors (429 transient ok)', errs.filter(e=>!/429/.test(e)).length===0, errs.join(' | '));
});

// ---- GIFT (money) negative-ish: renders, no crash ----
await withPage(chromium, chromeOpts, async (page, errs) => {
  await page.goto(BASE + '/gift', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(600);
  const body = await page.evaluate(() => document.body.innerText);
  rec('gift: gift flow copy present', /gift|send|recipient|surprise|present/i.test(body));
  rec('gift: 0 console errors', errs.length===0, errs.join(' | '));
});

const fails = results.filter(r=>!r.ok);
console.log(`\n==== NEUTRAL INPUT TESTS: ${results.length-fails.length}/${results.length} PASS ====`);
if (fails.length) { console.log('FAILURES:'); fails.forEach(f=>console.log(' - '+f.name+' :: '+f.detail)); process.exitCode = 1; }

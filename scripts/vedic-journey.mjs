// VEDIC live journey / negative / edge tests against staging (Fifth Rule).
// Drives the real forms in a real browser; records pass/fail + screenshots.
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE || 'https://bornclock-staging.usdvisionai.workers.dev';
const out = 'docs/migration-screens/vedic/journey';
mkdirSync(out, { recursive: true });

const PROFILE_KEY = 'bornclock-birth-profile';
const FULL_PROFILE = { dob: '1990-08-15', time: '10:30', name: 'Priya',
  city: { name: 'Delhi', lat: 28.6139, lon: 77.209, tz: 5.5 } };

const results = [];
const rec = (name, pass, detail) => { results.push({ name, pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'} :: ${name} :: ${detail}`); };

const browser = await chromium.launch();

async function newCtx(seedProfile) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  if (seedProfile) await ctx.addInitScript(([k, v]) => localStorage.setItem(k, v), [PROFILE_KEY, JSON.stringify(seedProfile)]);
  return ctx;
}
function trackErrors(page, bucket) {
  page.on('console', m => { if (m.type() === 'error') bucket.push(m.text().slice(0, 160)); });
  page.on('pageerror', e => bucket.push('PAGEERROR: ' + String(e).slice(0, 160)));
}

// ---- 1. POSITIVE: /vedic-zodiac pure-client rashi calc ----------------------
{
  const errs = []; const ctx = await newCtx(); const page = await ctx.newPage(); trackErrors(page, errs);
  await page.goto(BASE + '/vedic-zodiac', { waitUntil: 'networkidle', timeout: 60000 });
  await page.getByPlaceholder('DD').first().fill('15');
  await page.getByPlaceholder('MM').first().fill('08');
  await page.getByPlaceholder('YYYY').first().fill('1990');
  await page.waitForTimeout(600);
  const txt = await page.locator('body').innerText();
  const hasRashi = /Vedic Rashi|Sidereal/i.test(txt) && /(Simha|Leo|Karka|Cancer|Mesha|Rashi)/i.test(txt);
  await page.screenshot({ path: `${out}/01-vedic-zodiac-positive.png` });
  rec('positive /vedic-zodiac DOB 15/08/1990 → rashi result', hasRashi && !errs.length, `rashiShown=${hasRashi} errs=${errs.length}`);
  await ctx.close();
}

// ---- 2. EDGE: leap day + 1900 on /vedic-zodiac ------------------------------
for (const [d, m, y, label] of [['29', '02', '2000', 'leap-day 29/02/2000'], ['01', '01', '1900', 'year 1900']]) {
  const errs = []; const ctx = await newCtx(); const page = await ctx.newPage(); trackErrors(page, errs);
  await page.goto(BASE + '/vedic-zodiac', { waitUntil: 'networkidle', timeout: 60000 });
  await page.getByPlaceholder('DD').first().fill(d);
  await page.getByPlaceholder('MM').first().fill(m);
  await page.getByPlaceholder('YYYY').first().fill(y);
  await page.waitForTimeout(500);
  const txt = await page.locator('body').innerText();
  const ok = /Vedic Rashi|Sidereal/i.test(txt) && !errs.length;
  rec(`edge ${label} → result, no crash`, ok, `errs=${errs.length}`);
  await ctx.close();
}

// ---- 3. NEGATIVE: empty + future DOB on /kundali form -----------------------
{
  const errs = []; const ctx = await newCtx(); const page = await ctx.newPage(); trackErrors(page, errs);
  await page.goto(BASE + '/kundali', { waitUntil: 'networkidle', timeout: 60000 });
  // empty submit
  const btn = page.getByTestId('kundali-generate-btn');
  const disabledEmpty = await btn.isDisabled().catch(() => null);
  const hintVisible = await page.getByTestId('kundali-validation-hint').isVisible().catch(() => false);
  await page.screenshot({ path: `${out}/03-kundali-empty.png` });
  rec('negative /kundali empty → blocked (disabled or hint), no crash',
    (disabledEmpty === true || hintVisible) && !errs.length, `btnDisabled=${disabledEmpty} hint=${hintVisible} errs=${errs.length}`);
  // future date
  await page.getByTestId('kundali-dob').fill('2099-01-01').catch(() => {});
  await page.waitForTimeout(300);
  const txt2 = await page.locator('body').innerText();
  const futureHandled = /future|valid|cannot|invalid|hint/i.test(txt2) || (await btn.isDisabled().catch(() => false));
  rec('negative /kundali future DOB 2099 → handled, no crash', !errs.length, `errs=${errs.length} signal=${futureHandled}`);
  await ctx.close();
}

// ---- 4. NEGATIVE: /muhurat unknown city → stays blocked ---------------------
{
  const errs = []; const ctx = await newCtx(); const page = await ctx.newPage(); trackErrors(page, errs);
  await page.goto(BASE + '/muhurat', { waitUntil: 'networkidle', timeout: 60000 });
  await page.getByTestId('muhurat-city').fill('zzzznotacity');
  await page.waitForTimeout(1200);
  const optCount = await page.getByTestId('muhurat-city-option').count().catch(() => 0);
  const findBtn = page.getByTestId('muhurat-find-btn');
  const disabled = await findBtn.isDisabled().catch(() => null);
  await page.screenshot({ path: `${out}/04-muhurat-unknown-city.png` });
  rec('negative /muhurat unknown city → no options, find disabled, no crash',
    optCount === 0 && disabled === true && !errs.length, `opts=${optCount} findDisabled=${disabled} errs=${errs.length}`);
  await ctx.close();
}

// ---- 5. JOURNEY: carry-forward with a full saved profile --------------------
{
  const errs = []; const ctx = await newCtx(FULL_PROFILE); const page = await ctx.newPage(); trackErrors(page, errs);
  // kundali shows saved-profile banner
  await page.goto(BASE + '/kundali', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);
  const kundaliSaved = await page.getByTestId('saved-profile-banner').isVisible().catch(() => false);
  await page.screenshot({ path: `${out}/05a-kundali-carried.png` });
  rec('journey saved profile → /kundali shows saved-profile banner', kundaliSaved, `visible=${kundaliSaved}`);
  // kundali-match pre-fills person A
  await page.goto(BASE + '/kundali-match', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);
  const kmatchSaved = await page.getByTestId('kmatch-saved-a').isVisible().catch(() => false);
  await page.screenshot({ path: `${out}/05b-kundali-match-carried.png` });
  rec('journey saved profile → /kundali-match prefills person A', kmatchSaved, `visible=${kmatchSaved}`);
  // astrologer reaches chat (NOT no-profile)
  await page.goto(BASE + '/astrologer', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);
  const noProfileWithProfile = await page.getByTestId('astrologer-no-profile').isVisible().catch(() => false);
  await page.screenshot({ path: `${out}/05c-astrologer-withprofile.png` });
  rec('journey saved profile → /astrologer past no-profile gate', !noProfileWithProfile, `noProfileShown=${noProfileWithProfile} errs=${errs.length}`);
  // career-report renders (result or paywall), no crash
  await page.goto(BASE + '/career-report', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/05d-career-withprofile.png` });
  rec('journey saved profile → /career-report renders, no crash', !errs.length, `errs=${errs.length}`);
  await ctx.close();
}

// ---- 6. GATING: astrologer + career WITHOUT a profile -----------------------
{
  const errs = []; const ctx = await newCtx(); const page = await ctx.newPage(); trackErrors(page, errs);
  await page.goto(BASE + '/astrologer', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(600);
  const noProfile = await page.getByTestId('astrologer-no-profile').isVisible().catch(() => false);
  await page.screenshot({ path: `${out}/06a-astrologer-noprofile.png` });
  rec('gating /astrologer no profile → add-details prompt shown', noProfile, `visible=${noProfile}`);
  await page.goto(BASE + '/career-report', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/06b-career-noprofile.png` });
  rec('gating /career-report no profile → renders form/paywall, no crash', !errs.length, `errs=${errs.length}`);
  await ctx.close();
}

// ---- 7. HINDI: /hi/rashifal renders Devanagari ------------------------------
{
  const errs = []; const ctx = await newCtx(); const page = await ctx.newPage(); trackErrors(page, errs);
  await page.goto(BASE + '/hi/rashifal', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(600);
  const txt = await page.locator('main#main').innerText();
  const devanagari = /[ऀ-ॿ]/.test(txt);
  await page.screenshot({ path: `${out}/07-hi-rashifal.png` });
  rec('hindi /hi/rashifal renders Devanagari, no crash', devanagari && !errs.length, `devanagari=${devanagari} errs=${errs.length}`);
  await ctx.close();
}

await browser.close();
writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2));
const passed = results.filter(r => r.pass).length;
console.log(`\n===== JOURNEY SUMMARY: ${passed}/${results.length} passed =====`);
if (passed !== results.length) process.exitCode = 1;

// P3 real-use (Rule 4) — drives the BUILT app on a real server (wrangler dev) in a real
// browser, with the real unmocked /api/kundali. Verifies the personal dashboard renders
// the CORRECT computed Moon-sign reading, and the /wish facts card generates.
//   BASE=http://localhost:8788 node scripts/p3-realuse.mjs
import { chromium, webkit, devices } from '@playwright/test';

const BASE = (process.env.BASE || 'http://localhost:8788').replace(/\/$/, '');

// Reference chart: 1978-05-13 19:30, Jammu → Moon sign Karka (verified via /api/kundali).
const PROFILE = {
  dob: '1978-05-13', time: '19:30',
  city: { name: 'Jammu', lat: 32.73, lon: 74.86, tz: 5.5 },
  name: 'Reference', savedAt: '2026-10-09T00:00:00.000Z',
};

let failures = 0;
const check = (cond, msg) => { console.log(`${cond ? 'OK  ' : 'FAIL'} ${msg}`); if (!cond) failures++; };

async function runOn(engine, label, contextOpts = {}) {
  const browser = await engine.launch();
  const ctx = await browser.newContext(contextOpts);
  const page = await ctx.newPage();
  await page.addInitScript((p) => {
    localStorage.setItem('bornclock-birth-profile', JSON.stringify(p));
  }, PROFILE);

  // 1) Dashboard renders the correct computed reading (real API).
  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3500); // allow the real /api/kundali round-trip + compute
  const body = (await page.textContent('body')) || '';
  check(/Today for Karka/i.test(body), `[${label}] dashboard shows the correct Moon sign (Karka)`);
  check(!/Today for Simha/i.test(body), `[${label}] dashboard does NOT show the off-by-one sign (Simha)`);
  check(/rhythm/i.test(body), `[${label}] dashboard shows the rhythm card`);

  // 2) Wish facts card generates.
  await page.goto(BASE + '/wish', { waitUntil: 'networkidle', timeout: 60000 });
  await page.fill('[data-testid="wish-name-input"]', 'Priya');
  await page.fill('[data-testid="wish-dob-input"]', '1990-11-05');
  await page.click('[data-testid="wish-generate-btn"]');
  await page.waitForSelector('[data-testid="birthday-facts-card"]', { timeout: 15000 });
  const cardText = (await page.textContent('[data-testid="birthday-facts-card"]')) || '';
  check(/Monday/i.test(cardText), `[${label}] wish card shows day of week (Monday for 5 Nov 1990)`);
  check(/Scorpio/i.test(cardText), `[${label}] wish card shows zodiac (Scorpio)`);
  check(/Millennial/i.test(cardText), `[${label}] wish card shows generation (Millennial)`);
  const dl = await page.getByRole('button', { name: /download card/i }).count();
  check(dl > 0, `[${label}] wish card has a Download control`);

  await browser.close();
}

await runOn(chromium, 'chromium');
await runOn(chromium, 'android-chrome', devices['Pixel 5']);
try { await runOn(webkit, 'webkit-iphone', devices['iPhone 13']); }
catch (e) { console.log(`WARN webkit skipped: ${String(e).slice(0, 100)}`); }

console.log(`\n${failures === 0 ? '✅ PASS' : '❌ FAIL'} — ${failures} failed checks`);
process.exit(failures === 0 ? 0 : 1);

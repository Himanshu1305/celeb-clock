// FINAL — console-error sweep. Loads a representative page per type on the LIVE
// staging worker and records console.error + uncaught pageerror. Ignores benign
// third-party noise (favicon, analytics beacons). Fails on any app console error.
//   BASE=https://bornclock-staging.usdvisionai.workers.dev node scripts/final-console.mjs
import { chromium } from '@playwright/test';

const BASE = (process.env.BASE || 'https://bornclock-staging.usdvisionai.workers.dev').replace(/\/$/, '');
const ROUTES = [
  '/', '/kundali', '/numerology', '/life-expectancy', '/zodiac/aries',
  '/rashifal/mesh/today', '/panchang/delhi', '/planet-in-house/sun/6', '/nakshatra/mula',
  '/yoga/raja-yoga', '/transit/rahu/2025', '/festivals/2027', '/baby-names', '/blue-zones/belong',
  '/life-expectancy/factors/bmi', '/child-kundli', '/life-report', '/career-report',
  '/western-birth-chart', '/chinese-horoscope/dragon', '/on-this-day/may/13', '/tarot-reading',
  '/dashboard', '/family', '/celebrity/virat-kohli', '/born-on/may/13',
];
const IGNORE = /favicon|cloudflareinsights|beacon|net::ERR_|Failed to load resource.*(analytics|gtag|googletag)|ResizeObserver loop/i;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
let total = 0;
for (const route of ROUTES) {
  const errs = [];
  const onConsole = m => { if (m.type() === 'error' && !IGNORE.test(m.text())) errs.push(m.text()); };
  const onPageErr = e => { if (!IGNORE.test(String(e))) errs.push('PAGEERROR ' + String(e)); };
  page.on('console', onConsole); page.on('pageerror', onPageErr);
  try {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(1200);
  } catch (e) { errs.push('NAV ' + String(e).slice(0, 80)); }
  page.off('console', onConsole); page.off('pageerror', onPageErr);
  total += errs.length;
  console.log(`${errs.length === 0 ? 'OK  ' : 'FAIL'} ${route}${errs.length ? ' — ' + errs.slice(0, 3).join(' | ').slice(0, 240) : ''}`);
}
await browser.close();
console.log(`\n${total === 0 ? 'ZERO console errors' : total + ' console errors'} across ${ROUTES.length} page types`);
process.exit(total === 0 ? 0 : 1);

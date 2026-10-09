// FINAL accessibility gate — axe-core on ONE representative page per NEW page type
// (P1–P5) plus the core layout themes, Chromium desktop + Pixel 5. Fails on any
// SERIOUS or CRITICAL violation.
//   BASE=https://bornclock-staging.usdvisionai.workers.dev node scripts/final-axe.mjs
import { chromium, devices } from '@playwright/test';

const BASE = (process.env.BASE || 'https://bornclock-staging.usdvisionai.workers.dev').replace(/\/$/, '');
const AXE_CDN = 'https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js';

// One per NEW page type + each layout theme (vedic / mystic / science / neutral).
const ROUTES = [
  // P1 page types (not covered by earlier phase axe runs)
  '/rashifal/mesh/today', '/panchang/delhi', '/planet-in-house/sun/6', '/planet-in-sign/sun/leo',
  '/nakshatra/mula', '/yoga/raja-yoga', '/transit/rahu/2025', '/mercury-retrograde/2027',
  '/festivals/2027', '/baby-names', '/blue-zones/belong', '/life-expectancy/factors/bmi',
  '/attitude-number', '/chaldean-numerology', '/divisional-charts/d2-hora', '/vedic-zodiac/mesh',
  // P4 global/reach page types
  '/western-birth-chart', '/tarot-reading',
  // Layout-theme representatives
  '/kundali',            // vedic
  '/numerology',         // mystic
  '/life-expectancy',    // science
  '/',                   // neutral homepage
];

const profiles = [
  { name: 'chromium-desktop', opts: { viewport: { width: 1440, height: 900 } } },
  { name: 'pixel5', opts: devices['Pixel 5'] },
];

let totalSeriousCritical = 0;
const allFindings = [];
const browser = await chromium.launch();
for (const prof of profiles) {
  const ctx = await browser.newContext(prof.opts);
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 });
      await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()));
      await page.waitForTimeout(1200);
      await page.addScriptTag({ url: AXE_CDN });
      const r = await page.evaluate(async () => {
        const res = await window.axe.run(document, { resultTypes: ['violations'] });
        return res.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
      });
      const sc = r.filter(v => v.impact === 'serious' || v.impact === 'critical');
      totalSeriousCritical += sc.reduce((a, v) => a + v.nodes, 0);
      if (sc.length) allFindings.push({ route, prof: prof.name, sc });
      console.log(`${sc.length === 0 ? 'OK  ' : 'FAIL'} [${prof.name}] ${route} — serious/critical: ${sc.length} ${sc.map(v => `${v.id}(${v.impact},${v.nodes})`).join(', ')}`);
    } catch (e) {
      console.log(`ERR  [${prof.name}] ${route} — ${String(e).slice(0, 120)}`);
    }
  }
  await ctx.close();
}
await browser.close();
console.log(`\nTotal serious/critical nodes: ${totalSeriousCritical}`);
process.exit(totalSeriousCritical === 0 ? 0 : 1);

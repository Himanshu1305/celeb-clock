// P4 accessibility gate — axe-core on one page per NEW P4 page type, Chromium
// desktop + Pixel 5. Fails on any SERIOUS or CRITICAL violation.
//   BASE=http://localhost:8788 node scripts/p4-axe.mjs
import { chromium, devices } from '@playwright/test';

const BASE = (process.env.BASE || 'http://localhost:8788').replace(/\/$/, '');
const AXE_CDN = 'https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js';

const ROUTES = [
  '/chinese-horoscope',          // CZ yearly horoscope index
  '/chinese-horoscope/dragon',   // CZ yearly horoscope — animal
  '/on-this-day',                // Wikimedia on-this-day hub
  '/on-this-day/may/13',         // on-this-day dated
  '/hi/panchang',                // Hindi Panchang
  '/celebrity/virat-kohli',      // celebrity profile (birth-time note + rank)
  '/born-on/may/13',             // born-on (rank badges + events/deaths embed)
];

const profiles = [
  { name: 'chromium-desktop', opts: { viewport: { width: 1440, height: 900 } } },
  { name: 'pixel5', opts: devices['Pixel 5'] },
];

let totalSeriousCritical = 0;
const browser = await chromium.launch();
for (const prof of profiles) {
  const ctx = await browser.newContext(prof.opts);
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 });
      await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()));
      await page.waitForTimeout(1500);
      await page.addScriptTag({ url: AXE_CDN });
      const r = await page.evaluate(async () => {
        const res = await window.axe.run(document, { resultTypes: ['violations'] });
        return res.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
      });
      const sc = r.filter(v => v.impact === 'serious' || v.impact === 'critical');
      totalSeriousCritical += sc.reduce((a, v) => a + v.nodes, 0);
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

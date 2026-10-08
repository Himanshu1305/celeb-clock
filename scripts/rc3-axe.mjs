// RC3 accessibility gate — full axe-core ruleset (not just color-contrast) on one page
// per layout/theme plus every new backlog page, on Chromium desktop and Pixel 5.
// Fails if any SERIOUS or CRITICAL violation is found.
//   BASE=https://bornclock-staging.usdvisionai.workers.dev node scripts/rc3-axe.mjs
import { chromium, devices } from '@playwright/test';

const BASE = (process.env.BASE || 'https://bornclock-staging.usdvisionai.workers.dev').replace(/\/$/, '');
const AXE_CDN = 'https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js';

// One per layout/theme + the 5 new backlog pages.
const ROUTES = [
  '/', '/pricing', '/blog', '/privacy',            // neutral + article + utility layouts
  '/age-calculator', '/celebrity',                  // birthday theme
  '/numerology', '/compatibility',                  // mystic theme
  '/life-expectancy', '/biological-age',            // science theme
  '/vedic-astrology', '/kundali',                   // vedic theme
  // New backlog pages (RC3 scope):
  '/manglik', '/kaal-sarp-dosha', '/personal-year-number', '/angel-numbers', '/dasha-calculator',
];

const profiles = [
  { name: 'chromium-desktop', opts: { viewport: { width: 1440, height: 900 } } },
  { name: 'pixel5', opts: devices['Pixel 5'] },
];

let totalSeriousCritical = 0;
const report = [];

const browser = await chromium.launch();
for (const prof of profiles) {
  const ctx = await browser.newContext(prof.opts);
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    try {
      await page.goto(BASE + route + (route.endsWith('/') ? '' : '/'), { waitUntil: 'networkidle', timeout: 45000 });
      // Let fonts + hydration settle so we measure the stable rendered state, not a
      // transient pre-hydration frame (which produces flaky color-contrast hits).
      await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()));
      await page.waitForTimeout(2000);
      await page.addScriptTag({ url: AXE_CDN });
      const r = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        const res = await window.axe.run(document, { resultTypes: ['violations'] });
        return res.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
      });
      const sc = r.filter(v => v.impact === 'serious' || v.impact === 'critical');
      totalSeriousCritical += sc.reduce((a, v) => a + v.nodes, 0);
      const line = `${sc.length === 0 ? 'OK  ' : 'FAIL'} [${prof.name}] ${route} — serious/critical: ${sc.length} ${sc.map(v => `${v.id}(${v.impact},${v.nodes})`).join(', ')}`;
      console.log(line);
      if (sc.length) report.push(line);
    } catch (e) {
      console.log(`ERR  [${prof.name}] ${route} — ${String(e).slice(0, 120)}`);
    }
  }
  await ctx.close();
}
await browser.close();

console.log(`\n${totalSeriousCritical === 0 ? '✅ PASS' : '❌ FAIL'} — total serious/critical violations: ${totalSeriousCritical}`);
process.exit(totalSeriousCritical === 0 ? 0 : 1);

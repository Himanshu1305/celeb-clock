// RC2 axe color-contrast DETAIL — dumps each failing node's selector + fg/bg/ratio so the
// remaining serious violations can be fixed precisely. Chromium @1440 and Pixel5 @390.
import { chromium, devices } from '@playwright/test';

const BASE = (process.env.BASE || 'https://bornclock-staging.usdvisionai.workers.dev').replace(/\/$/, '');
const ROUTES = (process.env.ROUTES || '/,/blog,/numerology,/pricing,/celebrity,/kundali').split(',');
const AXE_CDN = 'https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js';

const browser = await chromium.launch();
const agg = {};
for (const device of [{ name: 'desktop', opts: { viewport: { width: 1440, height: 900 } } }, { name: 'mobile', opts: { ...devices['Pixel 5'] } }]) {
  for (const route of ROUTES) {
    const ctx = await browser.newContext(device.opts);
    const page = await ctx.newPage();
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(1200); // let the cookie banner (1s delay) mount
      await page.addScriptTag({ url: AXE_CDN });
      const nodes = await page.evaluate(async () => {
        const r = await window.axe.run(document, { runOnly: ['color-contrast'], resultTypes: ['violations'] });
        const out = [];
        for (const v of r.violations) for (const n of v.nodes) {
          const d = (n.any && n.any[0] && n.any[0].data) || {};
          out.push({ target: n.target.join(' '), fg: d.fgColor, bg: d.bgColor, ratio: d.contrastRatio, need: d.expectedContrastRatio, size: d.fontSize, weight: d.fontWeight, text: (n.html || '').slice(0, 70) });
        }
        return out;
      });
      for (const n of nodes) {
        const key = `${n.fg} on ${n.bg} (${n.ratio}:1 need ${n.need}) ${n.size} ${n.weight}`;
        (agg[key] = agg[key] || { count: 0, samples: [], routes: new Set() });
        agg[key].count++;
        agg[key].routes.add(`${device.name}:${route}`);
        if (agg[key].samples.length < 3) agg[key].samples.push(`${n.target} :: ${n.text}`);
      }
      console.log(`${device.name} ${route}: ${nodes.length} color-contrast nodes`);
    } catch (e) { console.log(`${device.name} ${route}: ERR ${String(e).slice(0, 80)}`); }
    await ctx.close();
  }
}
await browser.close();
console.log('\n=== UNIQUE fg/bg/ratio buckets (most common first) ===');
const rows = Object.entries(agg).sort((a, b) => b[1].count - a[1].count);
for (const [k, v] of rows) {
  console.log(`\n[${v.count}×] ${k}`);
  console.log(`   routes: ${[...v.routes].slice(0, 10).join(', ')}`);
  for (const s of v.samples) console.log(`   • ${s}`);
}

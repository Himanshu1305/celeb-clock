// Step 3.3 — regression: pages NOT in the VEDIC group must look the same before/after.
// Shoots the Step-00 regression routes on the fresh deploy, then pixel-diffs each
// non-group page against docs/migration-screens/regression-before/.
import { chromium, webkit, devices } from '@playwright/test';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import sharp from 'sharp';

const BASE = process.env.BASE || 'https://bornclock-staging.usdvisionai.workers.dev';
const beforeDir = 'docs/migration-screens/regression-before';
const afterDir = 'docs/migration-screens/regression-after';
mkdirSync(afterDir, { recursive: true });

// Non-VEDIC pages — these MUST be unchanged. (vedic pages are expected to change.)
const NON_GROUP = ['/', '/pricing', '/age-calculator', '/celebrity', '/numerology', '/compatibility', '/life-expectancy', '/biological-age'];
const slug = (r) => (r === '/' ? 'home' : r.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, ''));

async function shoot() {
  const profs = [
    { name: 'chromium', engine: chromium, opts: { viewport: { width: 1440, height: 900 } }, w: 1440 },
    { name: 'webkit', engine: webkit, opts: { ...devices['iPhone 13'] }, w: 390 },
  ];
  for (const p of profs) {
    const b = await p.engine.launch();
    for (const route of NON_GROUP) {
      const ctx = await b.newContext(p.opts);
      const page = await ctx.newPage();
      try {
        await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(900);
        await page.screenshot({ path: `${afterDir}/${slug(route)}__${p.name}_${p.w}.png`, fullPage: false });
      } catch (e) { console.log('shoot ERR', route, p.name, String(e).slice(0, 80)); }
      await ctx.close();
    }
    await b.close();
  }
}

async function diff(a, b) {
  const [ia, ib] = await Promise.all([
    sharp(a).resize(720, 450, { fit: 'fill' }).greyscale().raw().toBuffer(),
    sharp(b).resize(720, 450, { fit: 'fill' }).greyscale().raw().toBuffer(),
  ]);
  let changed = 0;
  for (let i = 0; i < ia.length; i++) if (Math.abs(ia[i] - ib[i]) > 18) changed++;
  return changed / ia.length; // fraction of differing pixels
}

await shoot();
const report = [];
for (const route of NON_GROUP) {
  for (const [bro, w] of [['chromium', 1440], ['webkit', 390]]) {
    const nm = `${slug(route)}__${bro}_${w}.png`;
    const before = `${beforeDir}/${nm}`, after = `${afterDir}/${nm}`;
    if (!existsSync(before) || !existsSync(after)) { report.push({ route, bro, status: 'missing', before: existsSync(before), after: existsSync(after) }); continue; }
    const frac = await diff(before, after);
    report.push({ route, bro, diffPct: +(frac * 100).toFixed(2), verdict: frac < 0.02 ? 'SAME' : frac < 0.06 ? 'MINOR' : 'CHANGED' });
  }
}
writeFileSync(`${afterDir}/regression-diff.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
const changed = report.filter(r => r.verdict === 'CHANGED');
console.log(`\n===== REGRESSION: ${report.filter(r=>r.verdict==='SAME').length} same, ${report.filter(r=>r.verdict==='MINOR').length} minor, ${changed.length} changed =====`);

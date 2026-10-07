// Performance-budget gate — PR-only CI check (FINAL step 2). NEVER deploys.
// Builds are produced by the workflow; this script serves the local `dist/` via
// `vite preview`, measures LCP / CLS / TBT (approx via long tasks) on one page per
// layout with warm cache + median of N, and fails (exit 1) if any page exceeds its
// budget in scripts/perf-budget.json. Mirrors scripts/final-speed.mjs method so the
// gate and the FINAL report use the same measurement.
//   node scripts/perf-budget.mjs            (builds assumed present in dist/)
//   PREVIEW=1 node scripts/perf-budget.mjs  (spawn `vite preview` itself)
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';

const CFG = JSON.parse(readFileSync(new URL('./perf-budget.json', import.meta.url), 'utf8'));
const RUNS = Number(process.env.RUNS || 5);
const PORT = Number(process.env.PORT || 4173);
const BASE = (process.env.BASE || `http://localhost:${PORT}`).replace(/\/$/, '');
const SPAWN = process.env.PREVIEW !== '0';

function median(xs) { const s = [...xs].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }

const metricsScript = () => new Promise((resolve) => {
  const data = { lcp: 0, cls: 0, tbt: 0 };
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) data.lcp = e.startTime; })
      .observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) data.cls += e.value; })
      .observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { const over = e.duration - 50; if (over > 0) data.tbt += over; } })
      .observe({ type: 'longtask', buffered: true });
  } catch {}
  setTimeout(() => resolve(data), 5500);
});

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try { const r = await fetch(url); if (r.ok || r.status === 304) return true; } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

let preview = null;
if (SPAWN) {
  preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'inherit' });
  const ok = await waitForServer(BASE + '/', 60000);
  if (!ok) { console.error('preview server did not start'); preview.kill('SIGTERM'); process.exit(2); }
}

const browser = await chromium.launch();
const rows = [];
let failed = false;
try {
  for (const p of CFG.pages) {
    const lcpMax = p.lcpMax ?? CFG.targets.lcpMax;
    const clsMax = p.clsMax ?? CFG.targets.clsMax;
    const tbtMax = p.tbtMax ?? CFG.targets.tbtMax;
    const jsMax = p.jsMax ?? CFG.targets.jsMax ?? Infinity;
    const samples = { lcp: [], cls: [], tbt: [] };
    // 4x CPU throttle to approximate a mid-range phone, matching final-speed.mjs
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const client = await ctx.newCDPSession(page);
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.goto(BASE + p.route, { waitUntil: 'load', timeout: 60000 }); // cold load (fresh ctx)
    // Initial JavaScript size budget (FINAL §2 / RC2 Fix 5): sum the transfer bytes of
    // every same-origin JS resource the initial navigation pulled in (measured on this
    // first, cold load before the cache is warm). This blocks a bundle-size regression on
    // the two JS-heavy pages even when the runtime metrics still pass.
    const jsBytes = await page.evaluate(() => performance.getEntriesByType('resource')
      .filter(e => (e.initiatorType === 'script' || /\.m?js(\?|$)/.test(e.name)))
      .reduce((sum, e) => sum + (e.encodedBodySize || 0), 0));
    const jsKB = Math.round(jsBytes / 1024);
    const jsKBMax = Number.isFinite(jsMax) ? Math.round(jsMax / 1024) : '∞';
    for (let i = 0; i < RUNS; i++) {
      await page.goto(BASE + p.route, { waitUntil: 'load', timeout: 60000 });
      const m = await page.evaluate(metricsScript);
      samples.lcp.push(Math.round(m.lcp)); samples.cls.push(+m.cls.toFixed(3)); samples.tbt.push(Math.round(m.tbt));
    }
    await ctx.close();
    const lcp = Math.round(median(samples.lcp)), cls = +median(samples.cls).toFixed(3), tbt = Math.round(median(samples.tbt));
    const pass = lcp <= lcpMax && cls <= clsMax && tbt <= tbtMax && jsBytes <= jsMax;
    if (!pass) failed = true;
    rows.push({ route: p.route, layout: p.layout, lcp, lcpMax, cls, clsMax, tbt, tbtMax, jsKB, jsKBMax, pass });
    console.log(`${pass ? 'PASS' : 'FAIL'} ${p.route.padEnd(28)} LCP ${lcp}/${lcpMax}  CLS ${cls}/${clsMax}  TBT ${tbt}/${tbtMax}  JS ${jsKB}/${jsKBMax}kB`);
  }
} finally {
  await browser.close();
  if (preview) preview.kill('SIGTERM');
}

console.log('\nperf-budget summary:', JSON.stringify(rows, null, 2));
if (failed) { console.error('\n❌ performance budget exceeded'); process.exit(1); }
console.log('\n✅ all pages within performance budget');

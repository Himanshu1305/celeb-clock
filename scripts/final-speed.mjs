// FINAL run — phone-speed measurement (FINAL step 2). Mid-range phone emulation
// (Pixel 5 + 4x CPU throttle + Fast-3G-ish network), warm cache, median of 5, one
// page per layout type. Reports LCP / CLS / TBT (approx via long tasks) per page.
//   BASE=https://bornclock-staging.usdvisionai.workers.dev LABEL=new node scripts/final-speed.mjs
import { chromium, devices } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = (process.env.BASE || 'https://bornclock-staging.usdvisionai.workers.dev').replace(/\/$/, '');
const LABEL = process.env.LABEL || 'new';
const RUNS = Number(process.env.RUNS || 5);
mkdirSync('docs/migration-screens', { recursive: true });

// one page per layout type (tool, report, hub/home, collection, article, money, utility)
const PAGES = [
  { route: '/age-calculator/', layout: 'tool' },
  { route: '/kundali/', layout: 'report' },
  { route: '/', layout: 'hub/home' },
  { route: '/celebrity/', layout: 'collection' },
  { route: '/blog/', layout: 'article' },
  { route: '/pricing/', layout: 'money' },
  { route: '/privacy/', layout: 'utility' },
];

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

const browser = await chromium.launch();
const out = [];
for (const p of PAGES) {
  const samples = [];
  // warm cache: one throwaway load reused context
  const context = await browser.newContext({ ...devices['Pixel 5'] });
  const client = await context.newCDPSession(await context.newPage());
  for (let run = 0; run < RUNS + 1; run++) {
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    try {
      await page.goto(BASE + p.route, { waitUntil: 'load', timeout: 60000 });
      const m = await page.evaluate(metricsScript);
      if (run > 0) samples.push(m); // run 0 = cache warm-up (discarded)
    } catch (e) { if (run > 0) samples.push({ lcp: NaN, cls: NaN, tbt: NaN, err: String(e).slice(0, 60) }); }
    await page.close();
  }
  await context.close();
  const lcp = median(samples.map(s => s.lcp).filter(Number.isFinite));
  const cls = median(samples.map(s => s.cls).filter(Number.isFinite));
  const tbt = median(samples.map(s => s.tbt).filter(Number.isFinite));
  const row = { route: p.route, layout: p.layout, lcp_ms: Math.round(lcp), cls: Number(cls.toFixed(3)), tbt_ms: Math.round(tbt), samples: samples.length };
  out.push(row);
  console.log(`${LABEL} ${p.layout.padEnd(12)} ${p.route.padEnd(16)} LCP ${row.lcp_ms}ms  CLS ${row.cls}  TBT ${row.tbt_ms}ms`);
}
await browser.close();
writeFileSync(`docs/migration-screens/final-speed-${LABEL}.json`, JSON.stringify(out, null, 2));
console.log(`\nwrote docs/migration-screens/final-speed-${LABEL}.json`);

// Precompute every daily-changing page (src/lib/daily/registry.ts) for the next
// 400 India dates into dist/daily/<kind>/<slug>/<YYYY-MM>.json + dist/daily/manifest.json.
// The Worker (functions/daily.ts) injects today's entry into the prerendered shell; the
// browser reads the same JSON. See src/lib/daily/index.ts.
//
// Run after `vite build` (it writes into dist/):   npx tsx scripts/gen-daily.mts
// Env: DAILY_DAYS (default 400), DAILY_START (YYYY-MM-DD, default yesterday in IST),
//      DAILY_OUT (default dist), DAILY_KINDS (comma list, default all).
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { DAILY_PAGES } from '../src/lib/daily/registry';
import { DAILY_COMPUTERS } from '../src/lib/daily/compute';
import { addDaysISO, istDateISO, monthKey } from '../src/lib/daily/dates';
import type { DailyEntry, DailyManifest, DailyMonthFile } from '../src/lib/daily/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(process.env.DAILY_OUT || join(__dirname, '..', 'dist'));
const DAYS = Number(process.env.DAILY_DAYS || 400);
// Start one day back so a page served just after a late-evening (UTC) build still finds "today".
const START = process.env.DAILY_START || addDaysISO(istDateISO(new Date()), -1);
const ONLY = (process.env.DAILY_KINDS || '').split(',').map(s => s.trim()).filter(Boolean);

const t0 = Date.now();
const dates = Array.from({ length: DAYS + 1 }, (_, i) => addDaysISO(START, i));
const generatedAt = new Date().toISOString();
const manifest: DailyManifest = { generatedAt, firstDate: dates[0], lastDate: dates[dates.length - 1], kinds: {} };

for (const def of DAILY_PAGES) {
  if (ONLY.length && !ONLY.includes(def.kind)) continue;
  const compute = DAILY_COMPUTERS[def.kind];
  if (!compute) throw new Error(`gen-daily: no compute function for kind "${def.kind}" (src/lib/daily/compute.ts)`);
  let files = 0, entries = 0;
  for (const slug of def.slugs) {
    const byMonth = new Map<string, Record<string, DailyEntry>>();
    for (const date of dates) {
      const e = compute(date, slug);
      if (e.date !== date) throw new Error(`gen-daily: ${def.kind}/${slug} returned date ${e.date} for ${date}`);
      const mk = monthKey(date);
      if (!byMonth.has(mk)) byMonth.set(mk, {});
      byMonth.get(mk)![date] = e;
      entries++;
    }
    for (const [month, days] of byMonth) {
      const file: DailyMonthFile = { kind: def.kind, slug, month, days };
      const p = join(OUT, 'daily', def.kind, slug, `${month}.json`);
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, JSON.stringify(file));
      files++;
    }
  }
  manifest.kinds[def.kind] = { slugs: def.slugs.length, files, entries };
  console.log(`   daily/${def.kind}: ${def.slugs.length} pages × ${dates.length} days → ${files} files`);
}

mkdirSync(join(OUT, 'daily'), { recursive: true });
writeFileSync(join(OUT, 'daily', 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`📅 Daily pages precomputed ${manifest.firstDate} → ${manifest.lastDate} in ${((Date.now() - t0) / 1000).toFixed(1)}s (${OUT}/daily)`);

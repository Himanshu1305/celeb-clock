#!/usr/bin/env node
/**
 * scripts/gen-india-borndates.mjs
 *
 * Queries celebrity_sitelinks for Indian-born counts per calendar date (MM-DD)
 * and writes src/data/indiaBornOnDates.json — the source of truth for which
 * /born-on/[slug]/india pages exist (dates with >= MIN_COUNT Indian celebrities),
 * consumed by BOTH the app (parent-page "From India" link) and the build
 * (prerender-routes.mjs, prerender-titles.mjs).
 *
 * Run: node --env-file=.env.local scripts/gen-india-borndates.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../src/data/indiaBornOnDates.json');
const MIN_COUNT = 3;
const MONTH_NAMES = ['', 'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'];

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Pull all IN rows with a valid month-day; page through to beat the 1000-row cap.
let rows = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await sb
    .from('celebrity_sitelinks')
    .select('name, birth_month_day, sitelinks')
    .eq('nationality_code', 'IN')
    .not('birth_month_day', 'is', null)
    .order('sitelinks', { ascending: false })
    .range(from, from + 999);
  if (error) { console.error(error); process.exit(1); }
  rows = rows.concat(data);
  if (data.length < 1000) break;
}

// Group by MM-DD, keep names sorted by sitelinks DESC (query already ordered).
const byDate = new Map();
for (const r of rows) {
  const md = r.birth_month_day;
  if (!/^\d{2}-\d{2}$/.test(md)) continue;
  if (!byDate.has(md)) byDate.set(md, []);
  byDate.get(md).push(r.name);
}

let ge3 = 0, ge5 = 0, ge8 = 0;
const out = [];
for (const [mmdd, names] of byDate) {
  const c = names.length;
  if (c >= 3) ge3++;
  if (c >= 5) ge5++;
  if (c >= 8) ge8++;
  if (c < MIN_COUNT) continue;
  const [mm, dd] = mmdd.split('-').map(Number);
  out.push({
    slug: `${MONTH_NAMES[mm]}-${dd}`,
    mmdd,
    month: mm,
    day: dd,
    count: c,
    top3: names.slice(0, 3),
  });
}
// Stable order: month then day.
out.sort((a, b) => a.month - b.month || a.day - b.day);

writeFileSync(OUT, JSON.stringify(out, null, 0) + '\n');

console.log('=== India born-on date distribution (nationality_code=IN) ===');
console.log(`Total IN rows with month-day: ${rows.length}`);
console.log(`Distinct dates with IN celebrities: ${byDate.size}`);
console.log(`  >= 3 IN celebs: ${ge3} dates   (QUALIFYING — pages generated)`);
console.log(`  >= 5 IN celebs: ${ge5} dates`);
console.log(`  >= 8 IN celebs: ${ge8} dates`);
console.log(`Wrote ${out.length} qualifying dates -> ${OUT}`);

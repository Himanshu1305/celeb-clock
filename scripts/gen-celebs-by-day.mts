/**
 * B22 (SEO): famous people per calendar day, for the /birthday/:month/:day pages — so every date page
 * links straight to the celebrity profiles born that day (Indian and global), in the prerendered HTML.
 * Same people / slugs as the celebrity pages (dedupe + record fixes as gen-celebrity-slugs.mts).
 * Writes src/data/celebsByDay/MM.json = { "MM-DD": { india: [{s,n}], world: [{s,n}] } }, each list
 * ranked (curated Indian profiles first, then Wikipedia sitelinks) and capped at 12.
 * Run: npx tsx scripts/gen-celebs-by-day.mts   (scripts/__tests__/celebsByDay.test.ts checks it is current)
 */
import { writeFileSync, mkdirSync } from 'fs';
import { createRequire } from 'module';
import { dedupeCelebrities } from '../src/lib/celebrityDedupe';
import { applyCelebRecordFixes } from '../src/lib/celebrityFacts';

const require = createRequire(import.meta.url);
type Row = Record<string, unknown>;
export const CAP = 12;

export function buildCelebsByDay(): Record<string, Record<string, { india: Array<{ s: string; n: string }>; world: Array<{ s: string; n: string }> }>> {
  const data = require('../src/data/celebrities.json') as { celebrities: Row[] };
  const list = dedupeCelebrities(data.celebrities).list.map(applyCelebRecordFixes) as Row[];
  const rank = (c: Row) => (c.source === 'static' ? 1e6 : 0) + Number(c.sitelinks ?? 0);
  const byDay = new Map<string, Row[]>();
  for (const c of list) {
    const md = String(c.birth_month_day ?? '');
    if (!/^\d\d-\d\d$/.test(md) || !c.slug || !c.name) continue;
    (byDay.get(md) ?? byDay.set(md, []).get(md)!).push(c);
  }
  const out: ReturnType<typeof buildCelebsByDay> = {};
  for (const md of [...byDay.keys()].sort()) {
    const rows = byDay.get(md)!.sort((a, b) => rank(b) - rank(a) || String(a.name).localeCompare(String(b.name)));
    const pick = (f: (c: Row) => boolean) => rows.filter(f).slice(0, CAP).map(c => ({ s: String(c.slug), n: String(c.name) }));
    const mm = md.slice(0, 2);
    (out[mm] ||= {})[md] = { india: pick(c => c.nationality_code === 'IN'), world: pick(c => c.nationality_code !== 'IN') };
  }
  return out;
}

if (process.argv[1]?.endsWith('gen-celebs-by-day.mts')) {
  mkdirSync('src/data/celebsByDay', { recursive: true });
  const all = buildCelebsByDay();
  for (const [mm, days] of Object.entries(all)) writeFileSync(`src/data/celebsByDay/${mm}.json`, JSON.stringify(days));
  console.log('[celebs-by-day] wrote', Object.keys(all).length, 'month files');
}

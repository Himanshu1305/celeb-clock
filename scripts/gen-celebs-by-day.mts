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
import { parseCelebrityDOB, CATEGORY_CONFIG, HUB_SLUGS } from '../src/utils/celebrityUtils';

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

const SIGNS = ['capricorn', 'aquarius', 'pisces', 'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius'];
/** Western (tropical) Sun sign of a month-day (same boundaries as src/data/birthdayPersonality.ts). */
export function sunSignOf(m: number, d: number): string {
  const cut = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22]; // first day of the NEXT sign in month m
  return d >= cut[m - 1] ? SIGNS[m % 12] : SIGNS[m - 1];
}
export const SIGN_CAP = 36;
/** Indian lists are shown A–Z (most curated profiles carry no recognition number), so keep more. */
export const SIGN_CAP_INDIA = 90;
export const YEAR_CAP = 12;

/**
 * B23: famous people by Western Sun sign (for /zodiac/:sign/celebrities) and by Chinese zodiac year
 * (for /chinese-zodiac/:year). Same ranking and dedupe as the date lists. Full dates only.
 */
export function buildCelebsBySignAndYear(chineseYearForYmd: (y: number, m: number, d: number) => number) {
  const data = require('../src/data/celebrities.json') as { celebrities: Row[] };
  const list = dedupeCelebrities(data.celebrities).list.map(applyCelebRecordFixes) as Row[];
  // Recognition = Wikipedia language editions; curated profiles without that number count as 60.
  const rank = (c: Row) => (c.sitelinks != null ? Number(c.sitelinks) : (c.source === 'static' ? 60 : 0));
  const sorted = list.filter(c => c.slug && c.name && parseCelebrityDOB(c)?.isFullDate)
    .sort((a, b) => rank(b) - rank(a) || String(a.name).localeCompare(String(b.name)));
  const bySign: Record<string, { india: Array<{ s: string; n: string; y: number }>; world: Array<{ s: string; n: string; y: number }> }> = {};
  const byYear: Record<string, Array<{ s: string; n: string }>> = {};
  for (const sg of SIGNS) bySign[sg] = { india: [], world: [] };
  for (const c of sorted) {
    const { year: y, month: m, day: d } = parseCelebrityDOB(c)!;
    const sg = bySign[sunSignOf(m, d)];
    const bucket = c.nationality_code === 'IN' ? sg.india : sg.world;
    if (bucket.length < (bucket === sg.india ? SIGN_CAP_INDIA : SIGN_CAP)) bucket.push({ s: String(c.slug), n: String(c.name), y });
    const cy = String(chineseYearForYmd(y, m, d));
    const yl = (byYear[cy] ||= []);
    if (yl.length < YEAR_CAP) yl.push({ s: String(c.slug), n: String(c.name) });
  }
  for (const v of Object.values(bySign)) v.india.sort((a, b) => a.n.localeCompare(b.n));
  return { bySign, byYear };
}

/** B24: Indian profiles per category hub (/celebrity/bollywood, /cricket …), A–Z — all sources. */
export function buildCelebsByHub(): Record<string, Array<{ s: string; n: string; c: string }>> {
  const data = require('../src/data/celebrities.json') as { celebrities: Row[] };
  const list = dedupeCelebrities(data.celebrities).list.map(applyCelebRecordFixes) as Row[];
  const out: Record<string, Array<{ s: string; n: string; c: string }>> = {};
  for (const h of HUB_SLUGS) out[h] = [];
  for (const c of list) {
    if (c.nationality_code !== 'IN' || !c.slug || !c.name) continue;
    const hub = CATEGORY_CONFIG[String(c.category)]?.hubSlug;
    if (hub && out[hub]) out[hub].push({ s: String(c.slug), n: String(c.name), c: String(c.category) });
  }
  for (const v of Object.values(out)) v.sort((a, b) => a.n.localeCompare(b.n));
  return out;
}

if (process.argv[1]?.endsWith('gen-celebs-by-day.mts')) {
  writeFileSync('src/data/celebsByHub.json', JSON.stringify(buildCelebsByHub()));
  const { chineseYearForYmd } = await import('../src/lib/chineseCalendar.js');
  const { bySign, byYear } = buildCelebsBySignAndYear(chineseYearForYmd);
  writeFileSync('src/data/celebsBySign.json', JSON.stringify(bySign));
  writeFileSync('src/data/celebsByChineseYear.json', JSON.stringify(byYear));
  console.log('[celebs-by-day] wrote celebsBySign.json and celebsByChineseYear.json (', Object.keys(byYear).length, 'years )');
  mkdirSync('src/data/celebsByDay', { recursive: true });
  const all = buildCelebsByDay();
  for (const [mm, days] of Object.entries(all)) writeFileSync(`src/data/celebsByDay/${mm}.json`, JSON.stringify(days));
  console.log('[celebs-by-day] wrote', Object.keys(all).length, 'month files');
}

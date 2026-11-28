/**
 * B23 — build-time data for the 'birthdays-day' daily kind (see ./birthdaysTemplate.ts): who was
 * born on a calendar date, Indian and global, ranked exactly like the date pages
 * (scripts/gen-celebs-by-day.mts: curated Indian profiles first, then Wikipedia sitelinks).
 * Imported by ./compute.ts only (build script + browser fallback), never by the Worker.
 */
import celebritiesData from '../../../data/celebrities.json';
import { dedupeCelebrities } from '../../celebrityDedupe';
import { applyCelebRecordFixes } from '../../celebrityFacts';
import type { BirthdayRow, BirthdaysDayData } from './birthdaysTemplate';

type Row = Record<string, unknown>;
const CAP = 15;
let byDay: Map<string, Row[]> | null = null;

/** Short role for the list: the curated category, else the first words of the occupation. */
function role(c: Row): string {
  const clean = (t: string) => { const x = t.replace(/\s*\(.*$/, '').trim(); return x.length > 40 ? x.slice(0, x.lastIndexOf(' ', 40)).replace(/[,;]$/, '') : x; };
  const cat = clean(String(c.category || ''));
  if (cat && !/^(celebrity|public figure)$/i.test(cat)) return cat;
  return clean(String(c.occupation || ''));
}

export function birthdaysDayData(dateIST: string): BirthdaysDayData {
  if (!byDay) {
    byDay = new Map();
    const list = dedupeCelebrities((celebritiesData as { celebrities: Row[] }).celebrities).list.map(applyCelebRecordFixes) as Row[];
    for (const c of list) {
      const md = String(c.birth_month_day ?? '');
      if (!/^\d\d-\d\d$/.test(md) || !c.slug || !c.name) continue;
      (byDay.get(md) ?? byDay.set(md, []).get(md)!).push(c);
    }
    const rank = (c: Row) => (c.source === 'static' ? 1e6 : 0) + Number(c.sitelinks ?? 0);
    for (const rows of byDay.values()) rows.sort((a, b) => rank(b) - rank(a) || String(a.name).localeCompare(String(b.name)));
  }
  const rows = byDay.get(dateIST.slice(5)) ?? [];
  const toRow = (c: Row): BirthdayRow => [String(c.slug), String(c.name), Number(c.birth_year) || 0, Number(c.death_year) || 0, role(c)];
  return {
    india: rows.filter(c => c.nationality_code === 'IN').slice(0, CAP).map(toRow),
    world: rows.filter(c => c.nationality_code !== 'IN').slice(0, CAP).map(toRow),
  };
}

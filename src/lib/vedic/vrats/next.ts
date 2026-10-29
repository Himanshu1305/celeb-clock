/**
 * Batch 10 — next occurrence of each vrat, and its New Delhi timings, from OUR festival
 * engine (src/lib/vedic/festivals.ts — dates checked against Drik Panchang's New Delhi
 * calendars in festivals.test.ts). Engine side: used by the daily precompute
 * (data kind 'vrat-next') and by the browser fallback; the Worker only reads the result.
 *
 * Timing rules (each one is the rule the festival engine already uses to fix the date):
 *   Ekadashi        — fast from sunrise on the Ekadashi day; parana after the next sunrise,
 *                     within Dwadashi (Drik Panchang parana rule).
 *   Purnima         — Satyanarayan puja is commonly done in the evening (Drik Panchang),
 *                     so we give sunset and the Purnima tithi span.
 *   Pradosh         — Trayodashi covering pradosh: sunset → sunset + 144 min (6 ghatis).
 *   Sankashti/Karwa — Chaturthi prevailing at moonrise; we give moonrise.
 *   Shivratri / Janmashtami — the Nishita (midnight muhurta) window.
 *   Navratri        — Ghatasthapana in the first third of daytime while Pratipada
 *                     prevails (the rule as Drik Panchang's Ghatasthapana vidhi states it).
 *   Somvar / Mangalvar — every Monday / Tuesday; sunrise and sunset.
 */
import * as Astronomy from 'astronomy-engine';
import { amantaMonths, computeFestivalCalendar, delhiSunTimes, kalaWindowDelhi, tithiSpan, type AmantaMonth, type Festival } from '../festivals';
import { VRAT_SLUGS, vratSlugForFestival, vratSlugForWeekday, type VratSlug } from './meta';

/** One occurrence. Times are IST "YYYY-MM-DDTHH:MM" strings (New Delhi). */
export interface VratOcc {
  /** Civil date (IST). */
  d: string;
  /** Label keys the templates translate: Ekadashi name ('Saphala'), lunar month, paksha, which Navratri. */
  ek?: string; mo?: string; pk?: 'Shukla' | 'Krishna'; nv?: 'Chaitra' | 'Sharad';
  /** Timings (first occurrence only). */
  t?: {
    rise?: string; set?: string;
    /** the observance window (pradosh / nishita / ghatasthapana / evening) */
    ws?: string; we?: string;
    moon?: string;
    /** span of the vrat's tithi */
    ts?: string; te?: string;
    /** Ekadashi: next sunrise (parana from) and Dwadashi end (parana before) */
    pr?: string; dw?: string;
    /** Shivratri: the four night prahars — 5 boundaries, sunset → next sunrise */
    ph?: string[];
  };
}
export type VratNextData = Record<VratSlug, VratOcc[]>;

const IST_MS = 5.5 * 3600000;
const DAY = 86400000;
const pad = (n: number) => String(n).padStart(2, '0');
/** IST "YYYY-MM-DDTHH:MM", rounded to the nearest minute. */
export function istStamp(ms: number): string {
  return new Date(Math.round((ms + IST_MS) / 60000) * 60000).toISOString().slice(0, 16);
}
const addDays = (iso: string, n: number) => new Date(Date.parse(iso + 'T00:00:00Z') + n * DAY).toISOString().slice(0, 10);

const calMemo = new Map<number, Festival[]>();
function festivalsOf(year: number): Festival[] {
  let v = calMemo.get(year);
  if (!v) { v = computeFestivalCalendar(year).festivals; calMemo.set(year, v); }
  return v;
}
const monthMemo = new Map<number, AmantaMonth[]>();
function monthsOf(year: number): AmantaMonth[] {
  let v = monthMemo.get(year);
  if (!v) { v = amantaMonths(year); monthMemo.set(year, v); }
  return v;
}

/** Festival entries (both years) from `date` on, in date order. */
function upcoming(date: string): Festival[] {
  const y = Number(date.slice(0, 4));
  return [...festivalsOf(y), ...festivalsOf(y + 1), ...festivalsOf(y + 2)].filter(f => f.dateISO >= date);
}

/** Every vrat occurrence (by slug) on one date — for the daily Panchang link box. */
export function vratsOnDate(date: string): VratSlug[] {
  const y = Number(date.slice(0, 4));
  const out = new Set<VratSlug>();
  for (const f of festivalsOf(y)) if (f.dateISO === date) { const s = vratSlugForFestival(f); if (s) out.add(s); }
  if (navratriSpans(y).some(([a, b]) => date >= a && date <= b)) out.add('navratri');
  const w = vratSlugForWeekday(new Date(date + 'T00:00:00Z').getUTCDay());
  if (w) out.add(w);
  return VRAT_SLUGS.filter(s => out.has(s));
}

/**
 * The Navratri spans of a year from the festival engine: Chaitra = Ugadi (Chaitra Shukla
 * Pratipada) → Ram Navami; Sharad = Ghatasthapana → the day before Dussehra.
 */
export function navratriSpans(year: number): Array<[string, string]> {
  const fs = festivalsOf(year);
  const day = (n: string) => fs.find(f => f.name === n)?.dateISO;
  const out: Array<[string, string]> = [];
  const u = day('Ugadi / Gudi Padwa'), r = day('Ram Navami');
  if (u && r) out.push([u, r]);
  const g = day('Navratri begins (Ghatasthapana)'), v = day('Dussehra (Vijayadashami)');
  if (g && v) out.push([g, addDays(v, -1)]);
  return out;
}

/** The tithi span (UTC ms) of (paksha, tithi) in the lunar month nearest to `date`. */
function spanNear(date: string, paksha: 'Shukla' | 'Krishna', tithi: number): { start: number; end: number } | null {
  const y = Number(date.slice(0, 4));
  const noon = Date.parse(date + 'T06:30:00Z');
  let best: { start: number; end: number } | null = null;
  let bestGap = Infinity;
  for (const m of [...monthsOf(y - 1), ...monthsOf(y), ...monthsOf(y + 1)]) {
    if (m.end.getTime() < noon - 40 * DAY || m.start.getTime() > noon + 40 * DAY) continue;
    const s = tithiSpan(m, paksha, tithi);
    const gap = noon < s.start ? s.start - noon : noon > s.end ? noon - s.end : 0;
    if (gap < bestGap) { bestGap = gap; best = s; }
  }
  return best && bestGap < 2 * DAY ? best : null;
}

function span(date: string, paksha: 'Shukla' | 'Krishna', tithi: number): { ts?: string; te?: string } {
  const s = spanNear(date, paksha, tithi);
  return s ? { ts: istStamp(s.start), te: istStamp(s.end) } : {};
}
const sun = (date: string) => { const d = delhiSunTimes(date); return { rise: istStamp(d.rise), set: istStamp(d.set) }; };

function lunarOcc(f: Festival): VratOcc {
  const o: VratOcc = { d: f.dateISO };
  if (f.type === 'ekadashi') o.ek = f.name.replace(/ Ekadashi$/, '');
  if (f.monthPurnimanta) o.mo = f.monthPurnimanta;
  if (f.paksha) o.pk = f.paksha;
  return o;
}

const DELHI = new Astronomy.Observer(28.6139, 77.2090, 216);
/**
 * Moonrise shown on the page: the Moon's CENTRE reaching 0° altitude with no refraction
 * correction — the convention that reproduces Drik Panchang's New Delhi moonrise (31 Mar
 * 2021 Sankashti: 21:45, drikpanchang.com/sankashti/bhalachandra/…?year=2021). The upper-limb
 * + refraction moonrise the festival engine uses to FIX the date runs ~5 min earlier; the
 * date itself is unaffected (checked against Drik in festivals.test.ts).
 */
export function moonriseDelhi(date: string): number {
  const set = delhiSunTimes(date).set;
  const r = Astronomy.SearchAltitude(Astronomy.Body.Moon, DELHI, +1, new Date(set - 3 * 3600000), 1.5, 0);
  return r ? r.date.getTime() : kalaWindowDelhi(date, 'moonrise')[0];
}

/**
 * Pradosh puja window shown on the page: from sunset for one fifth of the night (three night
 * muhurtas), while Trayodashi prevails — the window Drik Panchang lists (15 Jan 2022 Shani
 * Pradosh, New Delhi: 17:46–20:28, drikpanchang.com/vrats/pradoshdates.html?year=2022).
 */
export function pradoshPujaWindow(date: string, paksha: 'Shukla' | 'Krishna'): [number, number] | null {
  const d = delhiSunTimes(date);
  let s = d.set, e = d.set + (d.nextRise - d.set) / 5;
  const t = spanNear(date, paksha, 13);
  if (t) { s = Math.max(s, t.start); e = Math.min(e, t.end); }
  return e > s ? [s, e] : null;
}

/**
 * The night split used for Shivratri and Janmashtami: Nishita = the night's mid-point ± one
 * thirtieth of the night (the midnight muhurta, as the festival engine uses), and four equal
 * prahars from sunset to the next sunrise. Pure — tested against Drik Panchang's Maha
 * Shivaratri 2019 page (Nishita 23:39–00:29, prahars from 17:51 / 20:57 / 00:04 / 03:10).
 */
export function nightParts(set: number, nextRise: number): { nishita: [number, number]; prahars: number[] } {
  const len = nextRise - set, mid = set + len / 2;
  return { nishita: [mid - len / 30, mid + len / 30], prahars: [0, 1, 2, 3, 4].map(i => set + (len * i) / 4) };
}

/** Timings for the first (next) occurrence of a vrat. */
function timings(slug: VratSlug, o: VratOcc): VratOcc['t'] {
  const d = o.d;
  switch (slug) {
    case 'ekadashi': {
      const pk = o.pk ?? 'Shukla';
      const next = delhiSunTimes(addDays(d, 1));
      const dw = spanNear(d, pk, 12);
      return { ...sun(d), ...span(d, pk, 11), pr: istStamp(next.rise), ...(dw ? { dw: istStamp(dw.end) } : {}) };
    }
    case 'satyanarayan-katha':
      return { ...sun(d), ...span(d, 'Shukla', 15) };
    case 'pradosh-vrat': {
      const w = pradoshPujaWindow(d, o.pk ?? 'Shukla');
      return { ...sun(d), ...(w ? { ws: istStamp(w[0]), we: istStamp(w[1]) } : {}), ...span(d, o.pk ?? 'Shukla', 13) };
    }
    case 'sankashti-chaturthi':
    case 'karwa-chauth':
      return { ...sun(d), moon: istStamp(moonriseDelhi(d)), ...span(d, 'Krishna', 4) };
    case 'mahashivratri': {
      const t = delhiSunTimes(d);
      const n = nightParts(t.set, t.nextRise);
      return { ...sun(d), ws: istStamp(n.nishita[0]), we: istStamp(n.nishita[1]), ph: n.prahars.map(istStamp), pr: istStamp(t.nextRise), ...span(d, 'Krishna', 14) };
    }
    case 'janmashtami': {
      const t = delhiSunTimes(d);
      const n = nightParts(t.set, t.nextRise);
      return { ...sun(d), ws: istStamp(n.nishita[0]), we: istStamp(n.nishita[1]), ...span(d, 'Krishna', 8) };
    }
    case 'navratri': {
      const [s, e] = kalaWindowDelhi(d, 'pratah');
      return { ...sun(d), ws: istStamp(s), we: istStamp(e), ...span(d, 'Shukla', 1) };
    }
    case 'somvar-vrat':
    case 'mangalvar-vrat':
      return sun(d);
  }
}

/** How many upcoming dates each page lists. */
const COUNT: Record<VratSlug, number> = {
  'ekadashi': 4, 'satyanarayan-katha': 3, 'pradosh-vrat': 4, 'sankashti-chaturthi': 3, 'karwa-chauth': 2,
  'somvar-vrat': 4, 'mangalvar-vrat': 4, 'navratri': 2, 'mahashivratri': 2, 'janmashtami': 2,
};

/** Upcoming occurrences (on or after `date`) of one vrat — dates only. */
export function upcomingOccurrences(slug: VratSlug, date: string, count = COUNT[slug]): VratOcc[] {
  if (slug === 'somvar-vrat' || slug === 'mangalvar-vrat') {
    const want = slug === 'somvar-vrat' ? 1 : 2;
    const dow = new Date(date + 'T00:00:00Z').getUTCDay();
    const first = addDays(date, (want - dow + 7) % 7);
    return Array.from({ length: count }, (_, i) => ({ d: addDays(first, 7 * i) }));
  }
  const out: VratOcc[] = [];
  for (const f of upcoming(date)) {
    if (out.length >= count) break;
    if (slug === 'navratri') {
      // Chaitra Navratri begins on Chaitra Shukla Pratipada — the Ugadi / Gudi Padwa day in
      // our calendar; Sharad Navratri on the Ghatasthapana day.
      if (f.name === 'Ugadi / Gudi Padwa') out.push({ d: f.dateISO, nv: 'Chaitra', mo: 'Chaitra', pk: 'Shukla' });
      else if (f.name === 'Navratri begins (Ghatasthapana)') out.push({ d: f.dateISO, nv: 'Sharad', mo: 'Ashwina', pk: 'Shukla' });
      continue;
    }
    if (vratSlugForFestival(f) !== slug) continue;
    out.push(lunarOcc(f));
  }
  return out;
}

/** The compact per-day data for every vrat page: next occurrences + first-occurrence timings. */
export function computeVratNextData(date: string): VratNextData {
  const out = {} as VratNextData;
  for (const slug of VRAT_SLUGS) {
    const occ = upcomingOccurrences(slug, date);
    if (occ[0]) occ[0] = { ...occ[0], t: timings(slug, occ[0]) };
    out[slug] = occ;
  }
  return out;
}

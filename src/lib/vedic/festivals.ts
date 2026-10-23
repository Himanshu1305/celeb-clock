/**
 * Festival & vrat calendar — Growth P1 traffic engine.
 *
 * Everything here is COMPUTED from the real sidereal Sun/Moon positions (the
 * same `getSiderealLongitude` engine behind the Kundli and Panchang) — no
 * hand-typed date tables. For a calendar year it derives:
 *   • the exact instants of every new moon (Amavasya) and full moon (Purnima);
 *   • the Sankrantis (the Sun entering each sidereal sign);
 *   • the amanta lunar months, named by the classical rule that a month takes
 *     the name of the Sankranti that falls within it (no Sankranti → Adhik Maas);
 *   • recurring vrats (Ekadashi, Pradosh, Sankashti/Masik tithis) and the major
 *     festivals, each located by its (lunar month, paksha, tithi) using the
 *     sunrise-prevailing-tithi convention used by mainstream Panchang sources.
 *
 * Dates are the civil date in IST (UTC+5:30). Day precision: a festival whose
 * special observance is at night/moonrise (e.g. Janmashtami, Karwa Chauth,
 * Diwali) is placed by the mainstream sunrise/evening convention and labelled.
 */
import * as Astronomy from 'astronomy-engine';
import { getSiderealLongitude } from './engine/vedicEngine';
import { sunriseSunset } from './panchangDay';

const IST = 5.5;
const DAY = 86400000;

function norm(x: number): number { return ((x % 360) + 360) % 360; }
function elong(d: Date): number { return norm(getSiderealLongitude('Moon', d) - getSiderealLongitude('Sun', d)); }
/** Map an angle to (-180,180] so we can look for ascending zero-crossings. */
function wrap180(x: number): number { let v = norm(x); if (v > 180) v -= 360; return v; }

/** Find ascending zero-crossings of fn in [start,end], refined to ~minute precision. */
function crossings(fn: (d: Date) => number, start: Date, end: Date, stepH = 6): Date[] {
  const out: Date[] = [];
  let prevT = start.getTime();
  let prev = fn(start);
  for (let t = start.getTime() + stepH * 3600000; t <= end.getTime(); t += stepH * 3600000) {
    const cur = fn(new Date(t));
    if (prev <= 0 && cur > 0) {
      // bisect between prevT and t
      let lo = prevT, hi = t;
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        if (fn(new Date(mid)) > 0) hi = mid; else lo = mid;
      }
      out.push(new Date((lo + hi) / 2));
    }
    prev = cur; prevT = t;
  }
  return out;
}

/** Civil date string (YYYY-MM-DD) in IST for an instant. */
function istDate(d: Date): string {
  return new Date(d.getTime() + IST * 3600000).toISOString().slice(0, 10);
}

export const LUNAR_MONTHS = [
  'Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada',
  'Ashwina', 'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna',
];
// Amanta rule: the lunar month that contains the Sun's entry into sidereal sign
// k (0=Aries…11=Pisces) is named LUNAR_MONTHS[k]. (Mesha Sankranti → Chaitra.)

export interface MoonEvent { dateISO: string; instant: Date; }
export interface AmantaMonth { name: string; adhik: boolean; start: Date; end: Date; }

/** All new moons (conjunctions) whose instant lies in [from,to]. */
function newMoons(from: Date, to: Date): Date[] {
  return crossings(d => wrap180(elong(d)), from, to);
}
/** All full moons (opposition) in [from,to]. */
function fullMoons(from: Date, to: Date): Date[] {
  return crossings(d => wrap180(elong(d) - 180), from, to);
}
/** Sankranti instants (Sun entering sign k) in [from,to], tagged with k. */
function sankrantis(from: Date, to: Date): Array<{ instant: Date; sign: number }> {
  const out: Array<{ instant: Date; sign: number }> = [];
  for (let k = 0; k < 12; k++) {
    for (const t of crossings(d => wrap180(getSiderealLongitude('Sun', d) - k * 30), from, to)) {
      out.push({ instant: t, sign: k });
    }
  }
  return out.sort((a, b) => a.instant.getTime() - b.instant.getTime());
}

/** The sidereal-sign Sankrantis with their civil IST dates, for the year. */
export interface Sankranti { name: string; sign: number; dateISO: string; }
const SANKRANTI_NAME = [
  'Mesha Sankranti', 'Vrishabha Sankranti', 'Mithuna Sankranti', 'Karka Sankranti (Dakshinayana)',
  'Simha Sankranti', 'Kanya Sankranti', 'Tula Sankranti', 'Vrishchika Sankranti',
  'Dhanu Sankranti', 'Makar Sankranti (Uttarayana)', 'Kumbha Sankranti', 'Meena Sankranti',
];
export function computeSankrantis(year: number): Sankranti[] {
  const from = new Date(Date.UTC(year - 1, 11, 20));
  const to = new Date(Date.UTC(year + 1, 0, 10));
  return sankrantis(from, to)
    .map(s => {
      let dateISO = istDate(s.instant);
      // A Sankranti between civil midnight and the night's mid-point (half-way from
      // New Delhi sunset to the next sunrise) belongs to the PREVIOUS day — the
      // classical "before/after midnight (ardha-ratri)" rule Drik Panchang applies.
      // e.g. Mithuna Sankranti 2020, moment 00:10 IST 15 Jun → listed 14 Jun
      // (drikpanchang.com/sankranti/mithuna-sankranti-date-time.html?year=2020);
      // Meena Sankranti 2026, 01:08 IST 15 Mar (after mid-night ~00:30) → 15 Mar.
      {
        const prev = isoAddDays(dateISO, -1);
        const pd = dayTimes(prev);
        const t = s.instant.getTime();
        if (t >= pd.set && t < (pd.set + pd.nextRise) / 2) dateISO = prev;
      }
      // Makar Sankranti is kept on its punya-kaal day: a Capricorn ingress after
      // New Delhi sunset is celebrated the next day (Drik Panchang convention;
      // e.g. ingress 14 Jan 2027 ~21:10 IST → festival 15 Jan 2027). The other
      // Sankrantis are listed on the civil date of the ingress (after the
      // midnight rule above).
      if (s.sign === 9 && s.instant.getTime() >= dayTimes(dateISO).set) dateISO = isoAddDays(dateISO, 1);
      return { name: SANKRANTI_NAME[s.sign], sign: s.sign, dateISO };
    })
    .filter(s => s.dateISO.startsWith(String(year)));
}

/** Build the amanta lunar months whose span overlaps the year (±1 month). */
export function amantaMonths(year: number): AmantaMonth[] {
  const from = new Date(Date.UTC(year - 1, 10, 1));
  const to = new Date(Date.UTC(year + 1, 1, 1));
  const nm = newMoons(from, to);
  const sk = sankrantis(from, to);
  const months: AmantaMonth[] = [];
  for (let i = 0; i < nm.length - 1; i++) {
    const start = nm[i], end = nm[i + 1];
    const within = sk.filter(s => s.instant >= start && s.instant < end);
    if (within.length >= 1) {
      // Normally exactly one Sankranti; name after it.
      months.push({ name: LUNAR_MONTHS[within[0].sign], adhik: false, start, end });
    } else {
      // No Sankranti in this lunation → Adhik Maas, named after the NEXT month.
      months.push({ name: 'Adhik', adhik: true, start, end });
    }
  }
  // Resolve Adhik month names to "Adhik <next month>".
  for (let i = 0; i < months.length; i++) {
    if (months[i].adhik) {
      const next = months.slice(i + 1).find(m => !m.adhik);
      months[i].name = `Adhik ${next ? next.name : ''}`.trim();
    }
  }
  return months;
}

// ── Observance rules ──────────────────────────────────────────────────────────
// Drik Panchang (our reference) publishes festival dates for New Delhi, so the
// civil day of each observance is decided against REAL New Delhi sunrise and
// sunset, not a fixed clock hour. Each festival names the part of the day its
// tithi must cover (the classical "kala-vyapti" rule):
//   udaya     — the tithi prevailing at sunrise
//   pratah    — first third of daytime (e.g. Ghatasthapana, Govardhan Puja)
//   purvahna  — forenoon, sunrise → midday (Akshaya Tritiya)
//   madhyahna — 3rd fifth of daytime (Ram Navami, Ganesh Chaturthi)
//   aparahna  — 4th fifth of daytime (Dussehra, Bhai Dooj, Raksha Bandhan)
//   pradosh   — sunset + 144 min (Diwali, Dhanteras, Pradosh, Holika Dahan)
//   nishita   — the midnight muhurta (Janmashtami, Maha Shivratri)
//   moonrise  — the tithi prevailing at moonrise (Karwa Chauth, Sankashti)
// A day qualifies when the tithi covers that part of the day; if two days
// qualify the one with more coverage wins (ties → the rule's preference); a
// skipped (kshaya) tithi that touches no qualifying window is observed on the
// civil sunrise-to-sunrise day in which it falls — never dropped.
const REF_LAT = 28.6139, REF_LON = 77.2090; // New Delhi (Drik Panchang default)
const MIN = 60000;

export type Kala = 'udaya' | 'pratah' | 'purvahna' | 'madhyahna' | 'aparahna' | 'pradosh' | 'nishita' | 'moonrise';

interface DayTimes { iso: string; rise: number; set: number; nextRise: number }
const dayCache = new Map<string, DayTimes>();
function isoAddDays(iso: string, n: number): string {
  return new Date(new Date(iso + 'T00:00:00Z').getTime() + n * DAY).toISOString().slice(0, 10);
}
function dayTimes(iso: string): DayTimes {
  let v = dayCache.get(iso);
  if (!v) {
    const { rise, set, nextRise } = sunriseSunset(new Date(iso + 'T12:00:00Z'), REF_LAT, REF_LON, IST);
    v = { iso, rise: rise.getTime(), set: set.getTime(), nextRise: nextRise.getTime() };
    dayCache.set(iso, v);
  }
  return v;
}
const moonCache = new Map<string, number>();
function moonriseAfterSunset(iso: string): number {
  let v = moonCache.get(iso);
  if (v === undefined) {
    const d = dayTimes(iso);
    // Chaturthi-Krishna moonrise is in the evening/night: first moonrise after
    // sunset (searching from sunset avoids picking a pre-dawn moonrise).
    const r = Astronomy.SearchRiseSet(Astronomy.Body.Moon, new Astronomy.Observer(REF_LAT, REF_LON, 0), +1, new Date(d.set - 3 * 3600000), 1.5);
    v = r ? r.date.getTime() : d.set + 3 * 3600000;
    moonCache.set(iso, v);
  }
  return v;
}

/** The [start,end] window (UTC ms) of a kala on civil day `iso`; point kalas have start === end. */
function kalaWindow(iso: string, kala: Kala): [number, number] {
  const d = dayTimes(iso);
  const dayLen = d.set - d.rise, nightLen = d.nextRise - d.set;
  switch (kala) {
    case 'udaya': return [d.rise, d.rise];
    case 'pratah': return [d.rise, d.rise + dayLen / 3];
    case 'purvahna': return [d.rise, d.rise + dayLen / 2];
    case 'madhyahna': return [d.rise + dayLen * 2 / 5, d.rise + dayLen * 3 / 5];
    case 'aparahna': return [d.rise + dayLen * 3 / 5, d.rise + dayLen * 4 / 5];
    case 'pradosh': return [d.set, d.set + 144 * MIN];
    case 'nishita': { const mid = d.set + nightLen / 2; return [mid - nightLen / 30, mid + nightLen / 30]; }
    case 'moonrise': { const m = moonriseAfterSunset(iso); return [m, m]; }
  }
}

/** Unwrapped Moon−Sun elongation inside a lunation (0 at its opening new moon → 360 at the closing one). */
function lunationElong(month: AmantaMonth, t: number): number {
  let e = elong(new Date(t));
  if (e > 300 && t - month.start.getTime() < 5 * DAY) e -= 360;
  if (e < 60 && month.end.getTime() - t < 5 * DAY) e += 360;
  return e;
}
/** Instant (ms) inside the lunation at which the elongation reaches `deg`. */
function elongInstant(month: AmantaMonth, deg: number): number {
  let lo = month.start.getTime(), hi = month.end.getTime();
  if (deg <= 0) return lo;
  if (deg >= 360) return hi;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (lunationElong(month, mid) < deg) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/** 0-based tithi index for (paksha, tithi 1..15). Shukla 0..14, Krishna 15..29. */
function tithiIndex(paksha: 'Shukla' | 'Krishna', tithi: number): number {
  return (paksha === 'Shukla' ? 0 : 15) + (tithi - 1);
}

/** Start/end instants (UTC ms) of a tithi within a lunar month. */
export function tithiSpan(month: AmantaMonth, paksha: 'Shukla' | 'Krishna', tithi: number): { start: number; end: number } {
  const T = tithiIndex(paksha, tithi);
  return { start: elongInstant(month, T * 12), end: elongInstant(month, (T + 1) * 12) };
}

/**
 * The civil date (IST, New Delhi sunrise-to-sunrise day) on which a tithi of a
 * lunar month is observed under the given kala rule. Always returns a date —
 * kshaya (skipped) and vriddhi (repeated) tithis are resolved, never dropped.
 */
function observanceDate(month: AmantaMonth, paksha: 'Shukla' | 'Krishna', tithi: number, kala: Kala, prefer: 'first' | 'second' = 'first', minMuhurtas = 0): string {
  const { start, end } = tithiSpan(month, paksha, tithi);
  if (kala === 'udaya' && minMuhurtas > 0) {
    // "Udaya with 3 muhurtas": the sunrise day only counts if the tithi lasts at
    // least N muhurtas (48 min each) after that sunrise; otherwise the tithi is
    // observed on the previous day, when it began (Guru Purnima, Raksha
    // Bandhan, Akshaya Tritiya).
    const d = observanceDate(month, paksha, tithi, 'udaya', 'first');
    const t = dayTimes(d);
    const atSunrise = t.rise >= start && t.rise < end;
    if (atSunrise && end - t.rise < minMuhurtas * 48 * MIN && start >= dayTimes(isoAddDays(d, -1)).rise) return isoAddDays(d, -1);
    return d;
  }
  // Candidate civil days: from the day before the tithi starts to the day after it ends.
  const first = isoAddDays(istDate(new Date(start)), -1);
  const last = isoAddDays(istDate(new Date(end)), 1);
  const cands: Array<{ iso: string; cover: number; full: boolean }> = [];
  for (let iso = first; iso <= last; iso = isoAddDays(iso, 1)) {
    const [ws, we] = kalaWindow(iso, kala);
    if (ws === we) {
      if (ws >= start && ws < end) cands.push({ iso, cover: 1, full: true });
    } else {
      const ov = Math.min(we, end) - Math.max(ws, start);
      if (ov > 0) cands.push({ iso, cover: ov / (we - ws), full: ov >= we - ws - 1000 });
    }
  }
  if (cands.length === 0) {
    // Kshaya relative to the kala: the civil (sunrise→sunrise) day holding the tithi's midpoint.
    const mid = (start + end) / 2;
    for (let iso = first; iso <= last; iso = isoAddDays(iso, 1)) {
      const d = dayTimes(iso);
      if (mid >= d.rise && mid < d.nextRise) return iso;
    }
    return istDate(new Date(mid));
  }
  if (cands.length === 1) return cands[0].iso;
  const fulls = cands.filter(c => c.full);
  if (fulls.length === 1) return fulls[0].iso;
  const pool = fulls.length > 1 ? fulls : cands;
  const best = Math.max(...pool.map(c => c.cover));
  const top = pool.filter(c => fulls.length > 1 || Math.abs(c.cover - best) < 1e-9);
  return prefer === 'first' ? top[0].iso : top[top.length - 1].iso;
}

export type FestivalType = 'festival' | 'vrat' | 'ekadashi' | 'purnima' | 'amavasya' | 'sankranti';
export interface Festival {
  dateISO: string;
  name: string;
  type: FestivalType;
  note?: string;
  month?: string;
}

interface FestivalRule {
  name: string;
  month: string;           // amanta lunar month name
  paksha: 'Shukla' | 'Krishna';
  tithi: number;           // 1..15
  type: FestivalType;
  note?: string;
  kala: Kala;              // part of the day the tithi must cover (fixes the civil date)
  prefer?: 'first' | 'second'; // when two days qualify equally
  dayOffset?: number;      // observed this many days after the resolved tithi day (Holi)
  minMuhurtas?: number;    // udaya rule: tithi must last this many muhurtas after sunrise
  special?: 'janmashtami' | 'holika';
}

// Major festivals by amanta (lunar month, paksha, tithi) and the kala rule each
// one uses (Dharmasindhu / Nirnayasindhu as applied by Drik Panchang).
const FESTIVAL_RULES: FestivalRule[] = [
  { name: 'Ugadi / Gudi Padwa', month: 'Chaitra', paksha: 'Shukla', tithi: 1, type: 'festival', kala: 'udaya', note: 'Lunar new year (Deccan/Maharashtra); Chaitra Navratri begins the same day.' },
  { name: 'Ram Navami', month: 'Chaitra', paksha: 'Shukla', tithi: 9, type: 'festival', kala: 'madhyahna', note: 'Birth of Rama; observed when Navami covers midday (Madhyahna). Smarta date — ISKCON may observe a day later.' },
  { name: 'Hanuman Jayanti', month: 'Chaitra', paksha: 'Shukla', tithi: 15, type: 'festival', kala: 'udaya' },
  { name: 'Akshaya Tritiya', month: 'Vaishakha', paksha: 'Shukla', tithi: 3, type: 'festival', kala: 'udaya', minMuhurtas: 3, note: 'Highly auspicious for new beginnings; the day Tritiya prevails at sunrise for at least 3 muhurtas.' },
  { name: 'Guru Purnima', month: 'Ashadha', paksha: 'Shukla', tithi: 15, type: 'festival', kala: 'udaya', minMuhurtas: 3 },
  { name: 'Raksha Bandhan', month: 'Shravana', paksha: 'Shukla', tithi: 15, type: 'festival', kala: 'udaya', minMuhurtas: 3, note: 'Shravana Purnima — the day Purnima prevails for at least 3 muhurtas after sunrise; the rakhi time avoids the Bhadra period.' },
  // Janmashtami: Krishna Ashtami of the month whose Purnima is Raksha Bandhan;
  // amanta that is Shravana Krishna 8.
  { name: 'Krishna Janmashtami', month: 'Shravana', paksha: 'Krishna', tithi: 8, type: 'festival', kala: 'nishita', special: 'janmashtami', note: 'Midnight (Nishita) observance; the Smarta date — ISKCON lists sometimes differ by a day.' },
  { name: 'Ganesh Chaturthi', month: 'Bhadrapada', paksha: 'Shukla', tithi: 4, type: 'festival', kala: 'madhyahna', note: 'Midday (Madhyahna) observance.' },
  { name: 'Navratri begins (Ghatasthapana)', month: 'Ashwina', paksha: 'Shukla', tithi: 1, type: 'festival', kala: 'pratah', note: 'Ghatasthapana in the first third of the day while Pratipada prevails.' },
  { name: 'Durga Ashtami', month: 'Ashwina', paksha: 'Shukla', tithi: 8, type: 'festival', kala: 'udaya' },
  { name: 'Dussehra (Vijayadashami)', month: 'Ashwina', paksha: 'Shukla', tithi: 10, type: 'festival', kala: 'aparahna', note: 'Observed when Dashami covers the afternoon (Aparahna).' },
  // The Diwali-season Krishna-paksha festivals are named "Kartika" by the North
  // Indian Purnimanta convention; in the amanta system used here that Krishna
  // paksha belongs to Ashwina (Purnimanta month − 1).
  { name: 'Karwa Chauth', month: 'Ashwina', paksha: 'Krishna', tithi: 4, type: 'vrat', kala: 'moonrise', note: 'Kartika Krishna Chaturthi (Purnimanta); fast broken at moonrise.' },
  { name: 'Dhanteras', month: 'Ashwina', paksha: 'Krishna', tithi: 13, type: 'festival', kala: 'pradosh', note: 'Kartika Krishna Trayodashi (Purnimanta); evening puja.' },
  { name: 'Diwali (Lakshmi Puja)', month: 'Ashwina', paksha: 'Krishna', tithi: 15, type: 'festival', kala: 'pradosh', prefer: 'second', note: 'Lakshmi Puja at pradosh (evening) on Kartika Amavasya (Purnimanta; Ashwina Amavasya in the amanta reckoning).' },
  { name: 'Govardhan Puja', month: 'Kartika', paksha: 'Shukla', tithi: 1, type: 'festival', kala: 'pratah' },
  { name: 'Bhai Dooj', month: 'Kartika', paksha: 'Shukla', tithi: 2, type: 'festival', kala: 'aparahna' },
  // Maha Shivratri: Phalguna Krishna 14 (Purnimanta) = amanta Magha Krishna 14.
  { name: 'Maha Shivratri', month: 'Magha', paksha: 'Krishna', tithi: 14, type: 'festival', kala: 'nishita', note: 'Phalguna Krishna Chaturdashi (Purnimanta); night-long (Nishita) observance.' },
  { name: 'Holika Dahan', month: 'Phalguna', paksha: 'Shukla', tithi: 15, type: 'festival', kala: 'pradosh', special: 'holika', note: 'Phalguna Purnima bonfire at pradosh (evening), after the Bhadra period.' },
  { name: 'Holi', month: 'Phalguna', paksha: 'Shukla', tithi: 15, type: 'festival', kala: 'pradosh', special: 'holika', dayOffset: 1, note: 'Festival of colours, the day after Holika Dahan.' },
];

/**
 * Smarta Ekadashi (as published by Drik Panchang): the day Ekadashi prevails at
 * sunrise, with two corrections so the fast is never placed on the parana
 * (fast-breaking) day —
 *  • Ekadashi at two sunrises (vriddhi): the second day, provided Dwadashi still
 *    prevails at the following sunrise (so parana can be made in Dwadashi);
 *  • Ekadashi at one sunrise but Dwadashi ending before the next sunrise: the
 *    previous day (when Ekadashi began);
 *  • Ekadashi at no sunrise (kshaya): the civil day in which it falls.
 */
function ekadashiDate(month: AmantaMonth, paksha: 'Shukla' | 'Krishna'): string {
  const { start, end } = tithiSpan(month, paksha, 11);
  const dwEnd = tithiSpan(month, paksha, 12).end;
  const udaya: string[] = [];
  for (let iso = isoAddDays(istDate(new Date(start)), -1); iso <= isoAddDays(istDate(new Date(end)), 1); iso = isoAddDays(iso, 1)) {
    const r = dayTimes(iso).rise;
    if (r >= start && r < end) udaya.push(iso);
  }
  if (udaya.length === 0) return observanceDate(month, paksha, 11, 'udaya');
  if (udaya.length >= 2) {
    const second = udaya[1];
    return dwEnd > dayTimes(isoAddDays(second, 1)).rise ? second : udaya[0];
  }
  const d = udaya[0];
  return dwEnd <= dayTimes(isoAddDays(d, 1)).rise ? isoAddDays(d, -1) : d;
}

/**
 * Smarta Janmashtami: the day whose midnight (Nishita) Ashtami covers — but when
 * Ashtami only begins after that day's sunset, the next day (Drik Panchang;
 * e.g. 2025: Ashtami from 23:50 on 15 Aug → observed 16 Aug).
 */
function janmashtamiDate(month: AmantaMonth): string {
  const { start } = tithiSpan(month, 'Krishna', 8);
  const d = observanceDate(month, 'Krishna', 8, 'nishita');
  return start >= dayTimes(d).set ? isoAddDays(d, 1) : d;
}

/**
 * Holika Dahan: Purnima at pradosh (evening). Dharmasindhu exception, followed by
 * Drik Panchang: when Bhadra (first half of Purnima) covers the first evening,
 * Purnima lasts more than 3½ yamas (7/8 of daytime) after the next sunrise and
 * the following Pratipada is longer than Purnima (vriddhi), the bonfire moves to
 * the next evening (2026: 3 Mar, not 2 Mar).
 */
function holikaDahanDate(month: AmantaMonth): string {
  const { start, end } = tithiSpan(month, 'Shukla', 15);
  const prat = tithiSpan(month, 'Krishna', 1);
  const d1 = observanceDate(month, 'Shukla', 15, 'pradosh');
  const t1 = dayTimes(d1), t2 = dayTimes(isoAddDays(d1, 1));
  const bhadraEnd = (start + end) / 2;
  const bhadraInPradosh = bhadraEnd > t1.set && start < t1.set + 144 * MIN;
  const longOnNextDay = end > t2.rise && end - t2.rise > (t2.set - t2.rise) * 7 / 8 && end < t2.set;
  const pratipadaVriddhi = prat.end - prat.start > end - start;
  return bhadraInPradosh && longOnNextDay && pratipadaVriddhi ? isoAddDays(d1, 1) : d1;
}

/** Recurring tithi-based vrats computed for the whole year. */
function recurringVrats(months: AmantaMonth[], year: number): Festival[] {
  const out: Festival[] = [];
  const inYear = (d: string) => d.startsWith(String(year));
  for (const m of months) {
    for (const paksha of ['Shukla', 'Krishna'] as const) {
      // Ekadashi — Smarta rule: the day Ekadashi prevails at sunrise (first day if
      // it spans two sunrises); a skipped Ekadashi is kept on the day it falls,
      // never on the next (Dwadashi) day, which is the fast-breaking (parana) day.
      const ek = ekadashiDate(m, paksha);
      if (inYear(ek)) out.push({ dateISO: ek, name: `Ekadashi (${paksha} ${m.name})`, type: 'ekadashi', month: m.name, note: 'Vishnu fasting day (Smarta date); the fast is broken on the next day.' });
      // Pradosh (Trayodashi) — observed when Trayodashi covers pradosh (dusk)
      const pr = observanceDate(m, paksha, 13, 'pradosh');
      if (inYear(pr)) out.push({ dateISO: pr, name: `Pradosh Vrat (${paksha})`, type: 'vrat', month: m.name, note: 'Shiva vrat at pradosh (dusk).' });
    }
    // Purnima & Amavasya (the day the tithi prevails at sunrise)
    const pu = observanceDate(m, 'Shukla', 15, 'udaya');
    if (inYear(pu)) out.push({ dateISO: pu, name: `${m.name} Purnima`, type: 'purnima', month: m.name });
    const am = observanceDate(m, 'Krishna', 15, 'udaya');
    if (inYear(am)) out.push({ dateISO: am, name: `${m.name} Amavasya`, type: 'amavasya', month: m.name });
    // Sankashti Chaturthi (Krishna 4) — Chaturthi at moonrise
    const sc = observanceDate(m, 'Krishna', 4, 'moonrise');
    if (inYear(sc)) out.push({ dateISO: sc, name: `Sankashti Chaturthi (${m.name})`, type: 'vrat', month: m.name, note: 'Ganesha vrat; moonrise observance.' });
  }
  return out;
}

export interface FestivalCalendar {
  year: number;
  festivals: Festival[];   // sorted by date
  sankrantis: Sankranti[];
}

/** The full computed festival & vrat calendar for a Gregorian year. */
export function computeFestivalCalendar(year: number): FestivalCalendar {
  const months = amantaMonths(year);
  const festivals: Festival[] = [];

  // Named festivals
  for (const rule of FESTIVAL_RULES) {
    // find a month of the right name whose span sits in this year
    const candidates = months.filter(m => m.name === rule.month);
    for (const m of candidates) {
      let d = rule.special === 'janmashtami' ? janmashtamiDate(m)
        : rule.special === 'holika' ? holikaDahanDate(m)
        : observanceDate(m, rule.paksha, rule.tithi, rule.kala, rule.prefer ?? 'first', rule.minMuhurtas ?? 0);
      if (rule.dayOffset) d = isoAddDays(d, rule.dayOffset);
      if (d.startsWith(String(year))) {
        festivals.push({ dateISO: d, name: rule.name, type: rule.type, note: rule.note, month: rule.month });
      }
    }
  }

  // Sankrantis
  const sk = computeSankrantis(year);
  for (const s of sk) festivals.push({ dateISO: s.dateISO, name: s.name, type: 'sankranti', note: s.sign === 9 ? 'Sun enters sidereal Capricorn; when that happens after sunset the festival (punya kaal) is the next day.' : 'Sun enters a new sidereal sign.' });

  // Recurring vrats
  festivals.push(...recurringVrats(months, year));

  // De-dup (same name+date) and sort
  const seen = new Set<string>();
  const deduped = festivals.filter(f => {
    const k = `${f.dateISO}|${f.name}`;
    if (seen.has(k)) return false;
    seen.add(k); return true;
  }).sort((a, b) => a.dateISO < b.dateISO ? -1 : a.dateISO > b.dateISO ? 1 : 0);

  return { year, festivals: deduped, sankrantis: sk };
}

/** Major festivals only (for compact listings / previews). */
export function majorFestivals(year: number): Festival[] {
  return computeFestivalCalendar(year).festivals.filter(f => f.type === 'festival' || f.name.startsWith('Diwali') || f.name.startsWith('Karwa'));
}

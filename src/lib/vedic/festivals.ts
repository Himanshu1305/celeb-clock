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
import { getSiderealLongitude } from './engine/vedicEngine';

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
    .map(s => ({ name: SANKRANTI_NAME[s.sign], sign: s.sign, dateISO: istDate(s.instant) }))
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

/** Tithi index 0..29 prevailing at a given clock hour (IST) on a civil date. */
function tithiAt(dateISO: string, hourIST: number): number {
  const utcMs = new Date(dateISO + 'T00:00:00Z').getTime() + (hourIST - IST) * 3600000;
  return Math.floor(elong(new Date(utcMs)) / 12);
}
// Observance clock-times (IST) that fix a festival's civil date.
const TIMING_HOUR = { sunrise: 6, moonrise: 20, pradosh: 18, midnight: 23.75 } as const;
type Timing = keyof typeof TIMING_HOUR;

/** 0-based tithi index for (paksha, tithi 1..15). Shukla 0..14, Krishna 15..29. */
function tithiIndex(paksha: 'Shukla' | 'Krishna', tithi: number): number {
  return (paksha === 'Shukla' ? 0 : 15) + (tithi - 1);
}

/**
 * The civil date (IST) on which a given tithi prevails at sunrise within a
 * lunar month. Scans the month's days; returns the day whose sunrise tithi
 * matches, else the day on which that tithi ends (kshaya tithi).
 */
function tithiDateInMonth(month: AmantaMonth, paksha: 'Shukla' | 'Krishna', tithi: number, timing: Timing = 'sunrise'): string | null {
  const target = tithiIndex(paksha, tithi);
  const hour = TIMING_HOUR[timing];
  // The amanta month's Shukla paksha begins the day AFTER the opening Amavasya
  // (month.start); its Krishna paksha ends on the closing Amavasya (month.end).
  // Scan from the day after the opening new moon up to and including the day of
  // the closing new moon, so the boundary Amavasya is counted in exactly one
  // month and Krishna-15 resolves to the month's own closing Amavasya.
  // Scan strictly within this lunation: from the day after the opening new moon
  // up to and including the civil day of the closing new moon. Never spill into
  // the next lunation (that is a different month and would mis-match Shukla 1).
  const first = new Date(istDate(month.start) + 'T00:30:00Z').getTime() + DAY;
  const last = new Date(istDate(month.end) + 'T00:30:00Z').getTime();
  let fallback: string | null = null;
  for (let t = first; t <= last; t += DAY) {
    const iso = new Date(t + IST * 3600000).toISOString().slice(0, 10);
    const ti = tithiAt(iso, hour);
    if (ti === target) return iso;
    // kshaya (skipped) tithi: first observance-time after the tithi has ended
    if (fallback === null && ti > target && ti - target <= 2 && (paksha === 'Shukla' ? ti <= 14 : true)) fallback = iso;
  }
  return fallback;
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
  timing?: Timing;         // observance time that fixes the civil date (default sunrise)
}

// Major festivals by amanta (lunar month, paksha, tithi). Timing notes flag
// festivals whose special observance is at night/moonrise/pradosh.
const FESTIVAL_RULES: FestivalRule[] = [
  { name: 'Ugadi / Gudi Padwa', month: 'Chaitra', paksha: 'Shukla', tithi: 1, type: 'festival', note: 'Lunar new year (Deccan/Maharashtra).' },
  { name: 'Ram Navami', month: 'Chaitra', paksha: 'Shukla', tithi: 9, type: 'festival', note: 'Birth of Rama; midday observance.' },
  { name: 'Hanuman Jayanti', month: 'Chaitra', paksha: 'Shukla', tithi: 15, type: 'festival' },
  { name: 'Akshaya Tritiya', month: 'Vaishakha', paksha: 'Shukla', tithi: 3, type: 'festival', note: 'Highly auspicious for new beginnings.' },
  { name: 'Guru Purnima', month: 'Ashadha', paksha: 'Shukla', tithi: 15, type: 'festival' },
  { name: 'Raksha Bandhan', month: 'Shravana', paksha: 'Shukla', tithi: 15, type: 'festival', note: 'Observed when Purnima prevails after the Bhadra period.' },
  // Janmashtami: Krishna Ashtami of the month whose Purnima is Raksha Bandhan;
  // amanta that is Shravana Krishna 8.
  { name: 'Krishna Janmashtami', month: 'Shravana', paksha: 'Krishna', tithi: 8, type: 'festival', timing: 'midnight', note: 'Midnight observance; the smarta date — some lists differ by a day.' },
  { name: 'Ganesh Chaturthi', month: 'Bhadrapada', paksha: 'Shukla', tithi: 4, type: 'festival', note: 'Midday observance.' },
  { name: 'Navratri begins (Ghatasthapana)', month: 'Ashwina', paksha: 'Shukla', tithi: 1, type: 'festival' },
  { name: 'Durga Ashtami', month: 'Ashwina', paksha: 'Shukla', tithi: 8, type: 'festival' },
  { name: 'Dussehra (Vijayadashami)', month: 'Ashwina', paksha: 'Shukla', tithi: 10, type: 'festival' },
  // The Diwali-season Krishna-paksha festivals are named "Kartika" by the North
  // Indian Purnimanta convention; in the amanta system used here that Krishna
  // paksha belongs to Ashwina (Purnimanta month − 1).
  { name: 'Karwa Chauth', month: 'Ashwina', paksha: 'Krishna', tithi: 4, type: 'vrat', timing: 'moonrise', note: 'Kartika Krishna Chaturthi (Purnimanta); fast broken at moonrise.' },
  { name: 'Dhanteras', month: 'Ashwina', paksha: 'Krishna', tithi: 13, type: 'festival', timing: 'pradosh', note: 'Kartika Krishna Trayodashi (Purnimanta); evening puja.' },
  { name: 'Diwali (Lakshmi Puja)', month: 'Ashwina', paksha: 'Krishna', tithi: 15, type: 'festival', timing: 'pradosh', note: 'Lakshmi Puja at pradosh (evening) on Kartika Amavasya.' },
  { name: 'Govardhan Puja', month: 'Kartika', paksha: 'Shukla', tithi: 1, type: 'festival' },
  { name: 'Bhai Dooj', month: 'Kartika', paksha: 'Shukla', tithi: 2, type: 'festival' },
  // Maha Shivratri: Phalguna Krishna 14 (Purnimanta) = amanta Magha Krishna 14.
  { name: 'Maha Shivratri', month: 'Magha', paksha: 'Krishna', tithi: 14, type: 'festival', timing: 'midnight', note: 'Phalguna Krishna Chaturdashi (Purnimanta); night-long (Nishita) observance.' },
  { name: 'Holi (Holika Dahan eve)', month: 'Phalguna', paksha: 'Shukla', tithi: 15, type: 'festival', note: 'Phalguna Purnima; Holika Dahan is the preceding evening (pradosh), Holi the next day.' },
];

/** Recurring tithi-based vrats computed for the whole year. */
function recurringVrats(months: AmantaMonth[], year: number): Festival[] {
  const out: Festival[] = [];
  for (const m of months) {
    for (const paksha of ['Shukla', 'Krishna'] as const) {
      // Ekadashi
      const ek = tithiDateInMonth(m, paksha, 11);
      if (ek && ek.startsWith(String(year))) out.push({ dateISO: ek, name: `Ekadashi (${paksha} ${m.name})`, type: 'ekadashi', month: m.name, note: 'Vishnu fasting day.' });
      // Pradosh (Trayodashi) — observed at pradosh (dusk)
      const pr = tithiDateInMonth(m, paksha, 13, 'pradosh');
      if (pr && pr.startsWith(String(year))) out.push({ dateISO: pr, name: `Pradosh Vrat (${paksha})`, type: 'vrat', month: m.name, note: 'Shiva vrat at pradosh (dusk).' });
    }
    // Purnima & Amavasya
    const pu = tithiDateInMonth(m, 'Shukla', 15);
    if (pu && pu.startsWith(String(year))) out.push({ dateISO: pu, name: `${m.name} Purnima`, type: 'purnima', month: m.name });
    const am = tithiDateInMonth(m, 'Krishna', 15);
    if (am && am.startsWith(String(year))) out.push({ dateISO: am, name: `${m.name} Amavasya`, type: 'amavasya', month: m.name });
    // Sankashti Chaturthi (Krishna 4) & Masik Shivratri (Krishna 14)
    const sc = tithiDateInMonth(m, 'Krishna', 4, 'moonrise');
    if (sc && sc.startsWith(String(year))) out.push({ dateISO: sc, name: `Sankashti Chaturthi (${m.name})`, type: 'vrat', month: m.name, note: 'Ganesha vrat; moonrise observance.' });
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
      const d = tithiDateInMonth(m, rule.paksha, rule.tithi, rule.timing ?? 'sunrise');
      if (d && d.startsWith(String(year))) {
        festivals.push({ dateISO: d, name: rule.name, type: rule.type, note: rule.note, month: rule.month });
      }
    }
  }

  // Sankrantis
  const sk = computeSankrantis(year);
  for (const s of sk) festivals.push({ dateISO: s.dateISO, name: s.name, type: 'sankranti', note: 'Sun enters a new sidereal sign.' });

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

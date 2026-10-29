/**
 * Year muhurat lists (batch 9b) — the BUILD step: everything that is the same at
 * every place on Earth. Used by scripts/gen-muhurat-years.mts (static JSON) and tests.
 *
 * It reuses the validated engine (getSiderealLongitude — the same Sun/Moon path as the
 * Panchang, festivals and Kundli) and the festival engine's amanta lunar months, and
 * produces, for one occasion and year:
 *   • pieces — the stretches of time in which the Tithi, Nakshatra, Yoga and Karana all
 *     qualify for the occasion (Panchang Shuddhi);
 *   • blocks — periods that rule a whole Hindu day out: a prohibited solar month
 *     (Kharmas etc.), a prohibited lunar month, the Adhik (leap) month, Chaturmas, and
 *     Guru / Shukra Tara Asta with their Vriddhatva (3 days before) and Shishutva /
 *     Balatva (3 days after) stages.
 * The city step (sunrise-to-sunrise days, weekdays, local clock) is in muhuratYearDays.ts.
 *
 * Criteria per occasion and their sources are documented on OCCASION_RULES below.
 */
import * as Astronomy from 'astronomy-engine';
import { getSiderealLongitude } from './engine/vedicEngine';
import { amantaMonths, computeFestivalCalendar, tithiSpan, type AmantaMonth } from './festivals';
import { windowsForPlace, type Block, type DayRules, type MuhuratWindow, type Piece, type SunFn, type YearMuhuratData, type YearMuhuratType } from './muhuratYearDays';

const HOUR = 3600000;
const DAY = 86400000;
const norm = (x: number) => ((x % 360) + 360) % 360;
const NAK_UNIT = 360 / 27;

export const NAKSHATRA_NAMES = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
export const YOGA_NAMES = ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
const nk = (...names: string[]) => names.map(n => { const i = NAKSHATRA_NAMES.indexOf(n); if (i < 0) throw new Error(n); return i; });
const yg = (...names: string[]) => names.map(n => { const i = YOGA_NAMES.indexOf(n); if (i < 0) throw new Error(n); return i; });

// ── The Panchang timeline ─────────────────────────────────────────────────────

/** One stretch with constant Tithi (0..29), Nakshatra (0..26), Yoga (0..26) and Karana half-tithi (0..59). */
export interface Seg { s: number; e: number; t: number; n: number; y: number; k: number }

function limbs(ms: number) {
  const d = new Date(ms);
  const sun = getSiderealLongitude('Sun', d), moon = getSiderealLongitude('Moon', d);
  const el = norm(moon - sun);
  return { t: Math.floor(el / 12), n: Math.floor(norm(moon) / NAK_UNIT), y: Math.floor(norm(sun + moon) / NAK_UNIT), k: Math.floor(el / 6) };
}
type LimbKey = 't' | 'n' | 'y' | 'k';
const KEYS: LimbKey[] = ['t', 'n', 'y', 'k'];

/** All Panchang limb changes in [from, to) — hourly scan, each change bisected to ~0.1 s. */
export function panchangTimeline(from: number, to: number): Seg[] {
  const cuts = new Set<number>();
  let prevT = from, prev = limbs(from);
  for (let t = from + HOUR; t <= to + HOUR; t += HOUR) {
    const cur = limbs(t);
    for (const key of KEYS) {
      if (cur[key] === prev[key]) continue;
      // A limb can change at most once per hour (the shortest Karana is ~5 h).
      let lo = prevT, hi = t;
      for (let i = 0; i < 26; i++) { const mid = (lo + hi) / 2; if (limbs(mid)[key] === prev[key]) lo = mid; else hi = mid; }
      cuts.add(Math.round(hi));
    }
    prev = cur; prevT = t;
  }
  const edges = [from, ...[...cuts].filter(c => c > from && c < to).sort((a, b) => a - b), to];
  const segs: Seg[] = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const s = edges[i], e = edges[i + 1];
    segs.push({ s, e, ...limbs((s + e) / 2) });
  }
  return segs;
}

// ── Guru / Shukra Tara Asta ───────────────────────────────────────────────────
/*
 * Drik Panchang lists Asta ("combustion", the planet lost in the Sun's glare) from
 * "modern algorithms … calculated for the observer's geographic location", not from the
 * Surya Siddhanta 10°/11° longitude rule it also quotes
 * (drikpanchang.com/planet/asta/shukra-asta-date-time.html and
 * …/guru-asta-date-time.html, New Delhi, opened 29 Oct 2026). Published New Delhi
 * instants: Shukra Asta 11 Dec 2025 06:35 → 1 Feb 2026 18:27 and 12 Oct 2026 18:19 →
 * 29 Oct 2026 06:00; Guru Asta 15 Jul 2026 19:59 → 12 Aug 2026 05:03.
 * We reproduce that with a twilight-visibility test at New Delhi: the planet is visible
 * when, at the moment it sets after the Sun (evening) or rises before it (morning), the
 * Sun is at least h° below the horizon. h was calibrated on the six published instants
 * above (each falls on the same Hindu day with these values): Venus 5.6° evening /
 * 6.05° morning, Jupiter 7.8° evening / 9.3° morning. See muhuratYear.test.ts.
 */
const DELHI = new Astronomy.Observer(28.6139, 77.2090, 216);
const ASTA_H: Record<'Venus' | 'Jupiter', { evening: number; morning: number }> = {
  Venus: { evening: 5.6, morning: 6.05 },
  Jupiter: { evening: 7.8, morning: 9.3 },
};
interface VisDay { visible: boolean; at: number }
function planetVisibility(planet: 'Venus' | 'Jupiter', isoDay: string): VisDay {
  const body = planet === 'Venus' ? Astronomy.Body.Venus : Astronomy.Body.Jupiter;
  const noonIst = new Date(isoDay + 'T06:30:00Z'); // 12:00 IST
  const pl = Astronomy.Ecliptic(Astronomy.GeoVector(body, noonIst, true)).elon;
  const sl = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Sun, noonIst, true)).elon;
  const d = norm(pl - sl);
  // Far from the Sun the planet is plainly visible (this also keeps the test away from
  // opposition, when "setting after the Sun" happens at the next dawn).
  if (d > 25 && d < 335) return { visible: true, at: noonIst.getTime() };
  const east = d < 180; // east of the Sun → an evening star
  const start = east ? noonIst : new Date(noonIst.getTime() - 12 * HOUR); // evening after noon / morning before it
  const ev = Astronomy.SearchRiseSet(body, DELHI, east ? -1 : +1, start, 1);
  if (!ev) return { visible: false, at: noonIst.getTime() };
  const eq = Astronomy.Equator(Astronomy.Body.Sun, ev.date, DELHI, true, true);
  const alt = Astronomy.Horizon(ev.date, DELHI, eq.ra, eq.dec, 'normal').altitude;
  const h = east ? ASTA_H[planet].evening : ASTA_H[planet].morning;
  return { visible: alt <= -h, at: ev.date.getTime() };
}
export interface AstaPeriod { planet: 'Venus' | 'Jupiter'; start: number; end: number }
/** Asta periods overlapping [from, to]: from the first invisible evening/morning to the first visible one. */
export function astaPeriods(planet: 'Venus' | 'Jupiter', from: number, to: number): AstaPeriod[] {
  const out: AstaPeriod[] = [];
  let open: number | null = null;
  for (let t = from - 120 * DAY; t <= to + 120 * DAY; t += DAY) {
    const iso = new Date(t).toISOString().slice(0, 10);
    const v = planetVisibility(planet, iso);
    if (!v.visible && open === null) open = v.at;
    if (v.visible && open !== null) {
      if (v.at > from - 10 * DAY && open < to + 10 * DAY) out.push({ planet, start: open, end: v.at });
      open = null;
    }
  }
  return out;
}

// ── Occasion rules ────────────────────────────────────────────────────────────

export interface OccasionRules {
  nakshatras: number[];
  /** Allowed tithi indexes 0..29 (Shukla 0..14, Krishna 15..29); undefined = all. */
  tithis?: number[];
  /** Yogas avoided for their whole duration. */
  avoidYogas: number[];
  /** Avoid Vishti (Bhadra) Karana. */
  avoidVishti: boolean;
  /** Also avoid the four fixed Karanas (Shakuni, Chatushpada, Naga, Kimstughna). */
  avoidFixedKarana?: boolean;
  /**
   * Avoid the Gandanta quarters (padas) at the water–fire sign junctions: the last pada
   * of Ashlesha, Jyeshtha and Revati and the first pada of Magha, Mula and Ashwini.
   */
  avoidGandanta?: boolean;
  /** Sun's sidereal sign (0 = Mesha) months that are prohibited. */
  avoidSolarSigns?: number[];
  /** Only these amanta lunar months qualify; undefined = all. */
  lunarMonths?: string[];
  avoidAdhik: boolean;
  avoidChaturmas: boolean;
  /** Guru and Shukra Asta with 3 days of Vriddhatva before and Shishutva after. */
  avoidAsta: boolean;
  /** Skip the Hindu day of a Sankranti (Sun changing sign) and of an eclipse. */
  avoidSankrantiEclipse?: boolean;
  day: DayRules;
}
const ALL_TITHIS = Array.from({ length: 30 }, (_, i) => i);
const tithiSet = (nums: number[], both = true) => ALL_TITHIS.filter(i => nums.includes((i % 15) + 1) && (both || i < 15));

/*
 * Sources (all opened 29 Oct 2026):
 *  [DM] Drik Panchang 2026 / 2027 marriage lists, New Delhi —
 *       drikpanchang.com/shubh-dates/shubh-marriage-dates-with-muhurat.html (Panchang
 *       Shuddhi only; its day labels name the rules: "Auspicious Nakshatra not
 *       Available", "Prohibited Yoga …", "Prohibited Karana …", "Prohibited Solar
 *       month", "Prohibited Adhika/Leaped month", "Prohibited Chaturmas", "Shukra/Guru
 *       Tara Asta", "Vriddhatva Brihaspati", "Shishutva Shukra"). The 11 marriage
 *       Nakshatras are the ones Drik names (Rohini, Mrigashira, Magha …) and the only
 *       ones its lists contain; the prohibited solar months seen are Dhanu, Meena and
 *       Kanya; no "Prohibited Tithi" label ever appears.
 *       Its Vivaha Lagna page names the forbidden Yogas Vishkambha, Atiganda, Shula,
 *       Ganda, Vyaghata (…/sanskara/marriage/vivaha-muhurat-dates.html).
 *  [DG] Drik Panchang 2026 Griha Pravesh list (…/griha-pravesh-dates-with-muhurat.html):
 *       Panchang Shuddhi by Nakshatra, weekday, Tithi and lunar month; no entry during
 *       Shukra/Guru Asta or the leap month (citing Muhurta Chintamani and Dharmasindhu).
 *  [DV] Drik Panchang 2026 vehicle list (…/vehicle-buying-auspicious-dates-with-muhurat.html):
 *       labels "Prohibited Weekday", "Prohibited Tithi", "Auspicious Nakshatra not
 *       Available", "too late in the night", "Prohibited Adhika/Leaped month".
 *  [DMu] Drik Panchang Mundana / Chudakarana page (…/sanskara/mundana/mundana-dates-with-muhurat.html).
 *  [DN] Drik Panchang Namakarana page (…/sanskara/namakarana/namakarana-dates-with-muhurat.html).
 */
export const OCCASION_RULES: Record<YearMuhuratType, OccasionRules> = {
  // [DM] — Panchang Shuddhi for Vivah as Drik publishes it.
  marriage: {
    nakshatras: nk('Rohini', 'Mrigashira', 'Magha', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha', 'Mula', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'),
    avoidYogas: yg('Vishkambha', 'Atiganda', 'Shula', 'Ganda', 'Vyaghata', 'Vajra', 'Vyatipata', 'Parigha', 'Vaidhriti'),
    avoidVishti: true, avoidFixedKarana: true, avoidGandanta: true,
    avoidSolarSigns: [5, 8, 11], // Kanya, Dhanu, Meena
    avoidAdhik: true, avoidChaturmas: true, avoidAsta: true,
    day: { avoidWeekdays: [], minMinutes: 5 },
  },
  // [DG]
  'griha-pravesh': {
    nakshatras: nk('Rohini', 'Mrigashira', 'Uttara Phalguni', 'Chitra', 'Anuradha', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'),
    // Shukla 2,3,5,7,10,11,13 and Krishna 1,2,3,5,7,10,11 (fitted to Drik's labels: Krishna
    // Dwadashi/Trayodashi, Purnima, Amavasya, Rikta, Ashtami and Shashthi are "Prohibited Tithi").
    tithis: [...tithiSet([2, 3, 5, 7, 10, 11, 13], false), ...[1, 2, 3, 5, 7, 10, 11].map(t => 14 + t)].sort((a, b) => a - b),
    avoidYogas: [],
    avoidVishti: false,
    // Drik's 2026 list marks Chaitra "Lunar Month is not Auspicious for Griha Pravesh" and
    // has entries in Magha, Phalguna, Vaishakha and Jyeshtha. Kartika and Margashirsha are
    // the customary "acceptable" months (r-astro.com/blog/gruhapravesham-muhurta, opened
    // 29 Oct 2026: most favourable Magha, Phalguna, Vaishakha, Jyeshtha; acceptable
    // Margashirsha and Kartik); Drik's own Nov–Dec list could not be read to confirm them.
    lunarMonths: ['Magha', 'Phalguna', 'Vaishakha', 'Jyeshtha', 'Kartika', 'Margashirsha'],
    avoidAdhik: true, avoidChaturmas: true, avoidAsta: true,
    day: { avoidWeekdays: [0, 2], minMinutes: 5 },
  },
  // [DV]
  vehicle: {
    nakshatras: nk('Rohini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Revati'),
    // Krishna Pratipada (index 15) only; Shukla Pratipada is not used.
    tithis: [...tithiSet([3, 5, 6, 8, 10, 11, 13]), 14, 15].sort((a, b) => a - b),
    avoidYogas: [],
    avoidVishti: false,
    avoidAdhik: true, avoidChaturmas: false, avoidAsta: false,
    day: { avoidWeekdays: [2, 6], minMinutes: 5, latestStartNightFraction: 0.2 },
  },
  // [DMu] — solar months Makara, Kumbha, Mesha, Vrishabha, Mithuna; the listed Nakshatras,
  // Tithis and weekdays; Guru/Shukra Asta with Bala/Vriddha stages and the leap month
  // excluded; "nighttime ceremonies are considered highly inauspicious" → daytime only.
  mundan: {
    nakshatras: nk('Ashwini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Chitra', 'Swati', 'Jyeshtha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Revati'),
    tithis: tithiSet([2, 3, 5, 7, 10, 11, 13]),
    avoidYogas: yg('Vishkambha', 'Atiganda', 'Shula', 'Ganda', 'Vyaghata', 'Vajra', 'Vyatipata', 'Parigha', 'Vaidhriti'),
    avoidVishti: true, avoidFixedKarana: true, avoidGandanta: true, avoidSankrantiEclipse: true,
    avoidSolarSigns: [3, 4, 5, 6, 7, 8, 11], // only Mesha, Vrishabha, Mithuna, Makara, Kumbha qualify
    avoidAdhik: true, avoidChaturmas: false, avoidAsta: true,
    day: { avoidWeekdays: [0, 2, 6], minMinutes: 5, dayFraction: 1 },
  },
  // [DN] — fixed, movable, gentle and short Nakshatras; the listed Tithis of both
  // pakshas; Mon/Wed/Thu/Fri; "Tara Asta is not considered", Chaturmas not discarded;
  // "preferably … during first half of the day".
  naamkaran: {
    nakshatras: nk('Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Uttara Bhadrapada', 'Revati'),
    tithis: tithiSet([1, 2, 3, 5, 7, 10, 11, 12, 13]),
    avoidYogas: yg('Vishkambha', 'Atiganda', 'Shula', 'Ganda', 'Vyaghata', 'Vajra', 'Vyatipata', 'Parigha', 'Vaidhriti'),
    avoidVishti: true, avoidFixedKarana: true, avoidGandanta: true, avoidSankrantiEclipse: true,
    avoidAdhik: false, avoidChaturmas: false, avoidAsta: false,
    day: { avoidWeekdays: [0, 2, 6], minMinutes: 5, dayFraction: 0.5 },
  },
};

// ── Seasons (location-independent instants) ─────────────────────────────────

const VISHTI = (k: number) => k >= 1 && k <= 56 && (k - 1) % 7 === 6;
const FIXED_KARANA = (k: number) => k === 0 || k >= 57;
// Nakshatra index → which pada (0..3) is Gandanta.
const GANDANTA_PADA: Record<number, number> = { 8: 3, 17: 3, 26: 3, 9: 0, 18: 0, 0: 0 };

/** Split segments at every Nakshatra pada (quarter) boundary, tagging the pada (0..3). */
function withPadas(segs: Seg[]): Array<Seg & { pada: number }> {
  const out: Array<Seg & { pada: number }> = [];
  const moonAt = (t: number) => norm(getSiderealLongitude('Moon', new Date(t)));
  const padaAt = (t: number) => Math.floor(moonAt(t) / (NAK_UNIT / 4)) % 4;
  for (const g of segs) {
    let s = g.s;
    let p = padaAt(s + 1000);
    while (true) {
      const pe = padaAt(g.e - 1000);
      if (p === pe || g.e - s < 2000) { out.push({ ...g, s, pada: p }); break; }
      // bisect the next pada change inside (s, e)
      let lo = s, hi = g.e;
      for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (padaAt(m) === p) lo = m; else hi = m; }
      out.push({ ...g, s, e: Math.round(hi), pada: p });
      s = Math.round(hi); p = padaAt(s + 1000);
    }
  }
  return out;
}

function sunSignTimeline(from: number, to: number): Array<{ s: number; e: number; sign: number }> {
  const sign = (t: number) => Math.floor(norm(getSiderealLongitude('Sun', new Date(t))) / 30);
  const out: Array<{ s: number; e: number; sign: number }> = [];
  let s = from, cur = sign(from);
  for (let t = from + 6 * HOUR; t <= to; t += 6 * HOUR) {
    const v = sign(t);
    if (v === cur) continue;
    let lo = t - 6 * HOUR, hi = t;
    for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (sign(m) === cur) lo = m; else hi = m; }
    out.push({ s, e: hi, sign: cur }); s = hi; cur = v;
  }
  out.push({ s, e: to, sign: cur });
  return out;
}

/** Chaturmas: from Devshayani (Ashadha Shukla Ekadashi) to Devutthana (Kartika Shukla Ekadashi), by tithi instants. */
export function chaturmasSpans(months: AmantaMonth[]): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (const m of months) {
    if (m.name !== 'Ashadha') continue;
    const k = months.find(x => x.name === 'Kartika' && x.start > m.start);
    if (!k) continue;
    // Ends as Devutthana Ekadashi begins: Drik's 2027 list resumes marriages on the
    // Ekadashi day itself ("Day partially overlaps with Prohibited Chaturmas" only on
    // the day before).
    out.push([tithiSpan(m, 'Shukla', 11).start, tithiSpan(k, 'Shukla', 11).start]);
  }
  return out;
}

export interface YearBuild extends YearMuhuratData { /** Named seasonal periods for the page text. */ seasons: Array<{ reason: string; start: number; end: number }> }

/** Build the location-independent data for one occasion and Gregorian year. */
export function buildYearMuhurat(type: YearMuhuratType, year: number, timeline?: Seg[]): YearBuild {
  const R = OCCASION_RULES[type];
  // Cover every Hindu day of the year anywhere on Earth (±2 days).
  const from = Date.UTC(year, 0, 1) - 2 * DAY, to = Date.UTC(year + 1, 0, 1) + 2 * DAY;
  const segs = timeline ?? panchangTimeline(from, to);
  const months = amantaMonths(year).filter(m => m.end.getTime() > from && m.start.getTime() < to);
  const seasons: Array<{ reason: string; start: number; end: number }> = [];

  if (R.avoidSolarSigns) for (const p of sunSignTimeline(from - 40 * DAY, to + 40 * DAY).slice(1, -1)) if (R.avoidSolarSigns.includes(p.sign)) seasons.push({ reason: `solar:${p.sign}`, start: p.s, end: p.e });
  for (const m of months) {
    const s = m.start.getTime(), e = m.end.getTime();
    if (m.adhik && R.avoidAdhik) seasons.push({ reason: 'adhik', start: s, end: e });
    else if (R.lunarMonths && !m.adhik && !R.lunarMonths.includes(m.name)) seasons.push({ reason: `lunar:${m.name}`, start: s, end: e });
  }
  if (R.avoidChaturmas) for (const [s, e] of chaturmasSpans(amantaMonths(year - 1).concat(amantaMonths(year)))) if (e > from && s < to) seasons.push({ reason: 'chaturmas', start: s, end: e });
  if (R.avoidAsta) {
    for (const planet of ['Venus', 'Jupiter'] as const) {
      for (const a of astaPeriods(planet, from, to)) {
        seasons.push({ reason: `asta:${planet}`, start: a.start, end: a.end });
        seasons.push({ reason: `vriddha:${planet}`, start: a.start - 3 * DAY, end: a.start });
        seasons.push({ reason: `bala:${planet}`, start: a.end, end: a.end + 3 * DAY });
      }
    }
  }
  if (R.avoidSankrantiEclipse) {
    for (const p of sunSignTimeline(from, to).slice(1)) seasons.push({ reason: 'sankranti', start: p.s, end: p.s + 1000 });
    for (let e = Astronomy.SearchLunarEclipse(new Date(from - 20 * DAY)); e.peak.date.getTime() < to; e = Astronomy.NextLunarEclipse(e.peak)) {
      const half = (e.kind === 'penumbral' ? e.sd_penum : e.sd_partial) * 60000;
      seasons.push({ reason: 'eclipse', start: e.peak.date.getTime() - half, end: e.peak.date.getTime() + half });
    }
    for (let e = Astronomy.SearchGlobalSolarEclipse(new Date(from - 20 * DAY)); e.peak.date.getTime() < to; e = Astronomy.NextGlobalSolarEclipse(e.peak)) {
      seasons.push({ reason: 'eclipse', start: e.peak.date.getTime() - HOUR, end: e.peak.date.getTime() + HOUR });
    }
  }
  const dedup = new Map<string, { reason: string; start: number; end: number }>();
  for (const x of seasons) if (x.end > from && x.start < to) dedup.set(`${x.reason}|${x.start}`, x);
  const finalSeasons = [...dedup.values()].sort((a, b) => a.start - b.start);
  const blocks: Block[] = finalSeasons.map(x => [Math.round(x.start), Math.round(x.end), x.reason]);

  const nakSet = new Set(R.nakshatras), tithiOk = R.tithis ? new Set(R.tithis) : null, yogaBad = new Set(R.avoidYogas);
  const pieces: Piece[] = [];
  for (const g of withPadas(segs.filter(x => nakSet.has(x.n)))) {
    if (R.avoidGandanta && GANDANTA_PADA[g.n] === g.pada) continue;
    if (R.avoidFixedKarana && FIXED_KARANA(g.k)) continue;
    if (tithiOk && !tithiOk.has(g.t)) continue;
    if (yogaBad.has(g.y)) continue;
    if (R.avoidVishti && VISHTI(g.k)) continue;
    pieces.push([g.s, g.e, g.n, g.t]);
  }
  return { type, year, pieces, blocks, rules: R.day, seasons: finalSeasons };
}

// ── Static file (build) ───────────────────────────────────────────────────────

export const YEAR_MUHURAT_TYPES: YearMuhuratType[] = ['marriage', 'griha-pravesh', 'vehicle', 'mundan', 'naamkaran'];
export const YEAR_MUHURAT_YEARS = [2026, 2027];

/** Round instants to the second so the committed JSON is stable and small. */
const sec = (t: number) => Math.round(t / 1000) * 1000;

const SIGN_NAMES = ['Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)', 'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'];
const istIso = (t: number) => new Date(t + 5.5 * HOUR).toISOString().slice(0, 10);

/** A named no-muhurat period for the page text (IST civil dates). */
export interface SeasonLabel { kind: 'kharmas' | 'solar' | 'lunar' | 'adhik' | 'chaturmas' | 'asta'; label: string; from: string; to: string }

/** Human labels for the prohibited periods touching `year` (asta merged with its 3-day margins). */
export function seasonLabels(b: YearBuild): SeasonLabel[] {
  const { year } = b;
  const out: SeasonLabel[] = [];
  const inYear = (s: number, e: number) => istIso(e) >= `${year}-01-01` && istIso(s) <= `${year}-12-31`;
  const fest = computeFestivalCalendar(year).festivals;
  const months = amantaMonths(year);
  for (const x of b.seasons) {
    if (!inYear(x.start, x.end)) continue;
    const [kind, arg] = x.reason.split(':');
    if (kind === 'solar') {
      const sign = Number(arg);
      const kh = sign === 8 || sign === 11;
      out.push({ kind: kh ? 'kharmas' : 'solar', label: `${kh ? 'Kharmas — ' : ''}Sun in ${SIGN_NAMES[sign]}`, from: istIso(x.start), to: istIso(x.end) });
    } else if (kind === 'lunar') out.push({ kind: 'lunar', label: `${arg} lunar month`, from: istIso(x.start), to: istIso(x.end) });
    else if (kind === 'adhik') {
      const m = months.find(mm => mm.adhik && Math.abs(mm.start.getTime() - x.start) < DAY);
      out.push({ kind: 'adhik', label: `${m ? m.name : 'Adhik'} (leap month)`, from: istIso(x.start), to: istIso(x.end) });
    } else if (kind === 'chaturmas') {
      const a = fest.find(f => f.name === 'Devshayani Ekadashi');
      const z = fest.find(f => f.name === 'Devutthana Ekadashi');
      out.push({ kind: 'chaturmas', label: 'Chaturmas — Devshayani Ekadashi to Devutthana (Dev Uthani) Ekadashi', from: a?.dateISO ?? istIso(x.start), to: z?.dateISO ?? istIso(x.end) });
    } else if (kind === 'asta') {
      const v = b.seasons.find(y => y.reason === `vriddha:${arg}` && Math.abs(y.end - x.start) < 1000);
      const bl = b.seasons.find(y => y.reason === `bala:${arg}` && Math.abs(y.start - x.end) < 1000);
      out.push({ kind: 'asta', label: arg === 'Venus' ? 'Shukra (Venus) Asta, with 3 days before and after' : 'Guru (Jupiter) Asta, with 3 days before and after', from: istIso((v ?? x).start), to: istIso((bl ?? x).end) });
    }
  }
  return out.sort((p, q) => p.from.localeCompare(q.from));
}

/**
 * The static JSON for one occasion and year: the location-independent pieces/blocks,
 * the named seasons, and the precomputed New Delhi list (for the prerendered page).
 */
export type YearMuhuratFile = YearMuhuratData & { seasons: SeasonLabel[]; delhi: MuhuratWindow[] };
export function yearMuhuratFile(type: YearMuhuratType, year: number, timeline: Seg[], delhiSun: SunFn): YearMuhuratFile {
  const b = buildYearMuhurat(type, year, timeline);
  const data: YearMuhuratData = {
    type, year,
    pieces: b.pieces.map(p => [sec(p[0]), sec(p[1]), p[2], p[3]] as Piece),
    blocks: b.blocks.map(x => [sec(x[0]), sec(x[1]), x[2]] as Block),
    rules: b.rules,
  };
  return { ...data, seasons: seasonLabels(b), delhi: windowsForPlace(data, delhiSun, 5.5) };
}

/**
 * Batch 10 — "the sky right now": sidereal (Lahiri) positions of the nine grahas with
 * sign, degree, Nakshatra-pada, retrograde and combust status, the next sign change of
 * each, the year's retrograde and combustion periods, and the Moon's phase.
 *
 * No new astronomy: every longitude comes from getSiderealLongitude (the validated path
 * the Kundali uses — astronomy-engine apparent positions minus BornClock's Lahiri
 * ayanamsa; Rahu/Ketu = mean node). Checked against Swiss Ephemeris (pyswisseph 2.10.03,
 * SIDM_LAHIRI) in src/lib/vedic/__tests__/sky.test.ts: positions on 5 dates within 1′,
 * sign changes, stations and combustion periods within minutes, new / full Moons within a
 * minute (reference: __tests__/golden/skySwiss.json, made by skySwiss_ref.py).
 *
 * Combustion (Asta) orbs — the Surya Siddhanta distances from the Sun, as quoted by Drik
 * Panchang on its Asta pages (opened 29 Oct 2026):
 *   https://www.drikpanchang.com/planet/asta/budha-asta-date-time.html?lang=en  — Mercury 14°, 12° when retrograde
 *   https://www.drikpanchang.com/planet/asta/shukra-asta-date-time.html?year=2026 — Venus 10°, 8° when retrograde
 *   https://www.drikpanchang.com/planet/asta/mangal-asta-date-time.html?year=2026 — Mars 17°
 *   https://www.drikpanchang.com/planet/asta/guru-asta-date-time.html?year=1881  — Jupiter 11°
 *   https://www.drikpanchang.com/planet/asta/shani-asta-date-time.html?year=2021 — Saturn 15°
 * measured here as the distance in longitude from the Sun. (Drik's own Asta DATES use a
 * visibility model for the observer, so they differ from these orb-based dates by days;
 * the page says so.) The Moon near the Sun is the Amavasya (new Moon), shown on the Moon
 * row instead; Rahu and Ketu are never combust.
 */
import * as Astronomy from 'astronomy-engine';
import { getSiderealLongitude } from './engine/vedicEngine';
import { planetStations } from './transits';

export { GRAHAS, GRAHA_HI, RASHI_EN, SIGN_WESTERN, NAKSHATRA_EN, COMBUST_ORBS, COMBUST_SOURCE, fromSun, isCombust, placeOf, type Graha } from './skyTables';
import { GRAHAS, COMBUST_ORBS, isCombust, placeOf, type Graha } from './skyTables';

const norm = (x: number) => ((x % 360) + 360) % 360;
const DAY = 86400_000;
const H = 3600_000;

/** Apparent sidereal speed in degrees per day (±1 hour difference). */
export function speedAt(p: Graha, at: Date): number {
  const t = at.getTime();
  let d = getSiderealLongitude(p, new Date(t + H)) - getSiderealLongitude(p, new Date(t - H));
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d * 12;
}



export interface GrahaPosition {
  planet: Graha;
  /** Sidereal longitude 0..360. */
  lon: number;
  /** Degrees per day; negative = retrograde. Mean Rahu/Ketu are always retrograde. */
  speed: number;
  sign: number;
  /** Degrees into the sign, 0..30. */
  deg: number;
  nakshatra: number;
  pada: number;
  retro: boolean;
  combust: boolean;
}


/** Positions of all nine grahas at an instant. */
export function grahaPositions(at: Date): GrahaPosition[] {
  const sun = getSiderealLongitude('Sun', at);
  return GRAHAS.map(p => {
    const lon = norm(getSiderealLongitude(p, at));
    const speed = speedAt(p, at);
    return { planet: p, lon, speed, ...placeOf(lon), retro: speed < 0, combust: isCombust(p, lon, sun, speed) };
  });
}

/** The next moment a graha changes sidereal sign after `from` (to ~1 s), and the new sign. */
export function nextSignChange(p: Graha, from: Date): { at: Date; to: number } | null {
  const s0 = Math.floor(norm(getSiderealLongitude(p, from)) / 30);
  // Step well below the shortest stay in a sign (Moon ≈ 2 days; others weeks or more).
  const step = p === 'Moon' ? 2 * H : p === 'Sun' || p === 'Mercury' || p === 'Venus' || p === 'Mars' ? 12 * H : 2 * DAY;
  const limit = from.getTime() + 1400 * DAY;
  const sign = (t: number) => Math.floor(norm(getSiderealLongitude(p, new Date(t))) / 30);
  let a = from.getTime();
  for (let b = a + step; b < limit; a = b, b += step) {
    if (sign(b) !== s0) {
      while (b - a > 1000) { const m = (a + b) / 2; if (sign(m) === s0) a = m; else b = m; }
      return { at: new Date(b), to: sign(b + 1000) };
    }
  }
  return null;
}

export interface Period { planet: Graha; start: Date; end: Date }

/** Retrograde periods (station retrograde → station direct) of a planet overlapping a calendar year (UTC). */
export function retrogradePeriods(p: Graha, year: number): Period[] {
  if (p === 'Sun' || p === 'Moon' || p === 'Rahu' || p === 'Ketu') return [];
  const from = new Date(Date.UTC(year - 1, 6, 1));
  const to = new Date(Date.UTC(year + 1, 6, 1));
  const st = planetStations(p, from, to);
  const out: Period[] = [];
  for (let i = 0; i < st.length; i++) {
    if (st[i].kind !== 'retrograde') continue;
    const d = st.slice(i + 1).find(x => x.kind === 'direct');
    if (!d) continue;
    const start = new Date(st[i].atMs), end = new Date(d.atMs);
    if (end.getTime() >= Date.UTC(year, 0, 1) && start.getTime() < Date.UTC(year + 1, 0, 1)) out.push({ planet: p, start, end });
  }
  return out;
}

/** Combustion periods of a planet overlapping a calendar year (UTC), to ~1 minute. */
export function combustPeriods(p: Graha, year: number): Period[] {
  if (!COMBUST_ORBS[p]) return [];
  const f = (t: number) => {
    const at = new Date(t);
    return isCombust(p, getSiderealLongitude(p, at), getSiderealLongitude('Sun', at), speedAt(p, at));
  };
  const start = Date.UTC(year, 0, 1) - 120 * DAY, end = Date.UTC(year + 1, 0, 1) + 120 * DAY;
  const step = 12 * H;
  const edge = (a: number, b: number, va: boolean) => { while (b - a > 30_000) { const m = (a + b) / 2; if (f(m) === va) a = m; else b = m; } return b; };
  const out: Period[] = [];
  let prev = f(start), open: number | null = null;
  for (let t = start + step; t <= end; t += step) {
    const cur = f(t);
    if (cur !== prev) {
      const x = edge(t - step, t, prev);
      if (cur) open = x;
      else if (open !== null) { out.push({ planet: p, start: new Date(open), end: new Date(x) }); open = null; }
    }
    prev = cur;
  }
  return out.filter(x => x.end.getTime() >= Date.UTC(year, 0, 1) && x.start.getTime() < Date.UTC(year + 1, 0, 1));
}

// ── Moon phase ───────────────────────────────────────────────────────────────
export type MoonPhaseName = 'New Moon' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous' | 'Full Moon' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent';

export interface MoonPhaseInfo {
  /** Moon − Sun apparent ecliptic longitude, 0..360 (0 = new, 180 = full). */
  elongation: number;
  /** Illuminated fraction of the disc, 0..1. */
  illumination: number;
  name: MoonPhaseName;
  waxing: boolean;
  /** Moon's age in days since the last new Moon. */
  ageDays: number;
  lastNew: Date;
  nextNew: Date;
  nextFull: Date;
  /** The principal phase whose exact moment falls inside the asked-for local day, if any. */
  principalToday?: { name: 'New Moon' | 'First Quarter' | 'Full Moon' | 'Last Quarter'; at: Date };
}

const PRINCIPAL: Array<[number, 'New Moon' | 'First Quarter' | 'Full Moon' | 'Last Quarter']> = [[0, 'New Moon'], [90, 'First Quarter'], [180, 'Full Moon'], [270, 'Last Quarter']];

/**
 * Phase of the Moon at `at`. If `day` = [start, end) of a local calendar day is given, a
 * principal phase (new, first quarter, full, last quarter) whose exact moment falls in
 * that day names the day — the usual almanac convention; otherwise the phase is named by
 * the elongation (crescent below 90°, gibbous above).
 */
export function moonPhase(at: Date, day?: [Date, Date]): MoonPhaseInfo {
  const elongation = Astronomy.MoonPhase(at);
  const illumination = Astronomy.Illumination(Astronomy.Body.Moon, at).phase_fraction;
  const lastNew = Astronomy.SearchMoonPhase(0, new Date(at.getTime() - 31 * DAY), 31)!.date;
  let ln = lastNew;
  // SearchMoonPhase from 31 days back finds the first new Moon after that; step forward to the last one ≤ at.
  for (let i = 0; i < 2; i++) {
    const nx = Astronomy.SearchMoonPhase(0, new Date(ln.getTime() + DAY), 31)!.date;
    if (nx.getTime() <= at.getTime()) ln = nx; else break;
  }
  const nextNew = Astronomy.SearchMoonPhase(0, new Date(at.getTime() + 1000), 31)!.date;
  const nextFull = Astronomy.SearchMoonPhase(180, new Date(at.getTime() + 1000), 31)!.date;
  const waxing = elongation < 180;
  let principalToday: MoonPhaseInfo['principalToday'];
  if (day) {
    for (const [deg, name] of PRINCIPAL) {
      const t = Astronomy.SearchMoonPhase(deg, day[0], 2);
      if (t && t.date.getTime() < day[1].getTime()) { principalToday = { name, at: t.date }; break; }
    }
  }
  const name: MoonPhaseName = principalToday?.name
    ?? (elongation < 90 ? 'Waxing Crescent' : elongation < 180 ? 'Waxing Gibbous' : elongation < 270 ? 'Waning Gibbous' : 'Waning Crescent');
  return { elongation, illumination, name, waxing, ageDays: (at.getTime() - ln.getTime()) / DAY, lastNew: ln, nextNew, nextFull, principalToday };
}

/** Every new and full Moon instant in [from, to). */
export function moonEvents(from: Date, to: Date): Array<{ kind: 'new' | 'full'; at: Date }> {
  const out: Array<{ kind: 'new' | 'full'; at: Date }> = [];
  for (const [deg, kind] of [[0, 'new'], [180, 'full']] as const) {
    let t = from;
    for (;;) {
      const r = Astronomy.SearchMoonPhase(deg, t, 40);
      if (!r || r.date.getTime() >= to.getTime()) break;
      out.push({ kind, at: r.date });
      t = new Date(r.date.getTime() + DAY);
    }
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime());
}

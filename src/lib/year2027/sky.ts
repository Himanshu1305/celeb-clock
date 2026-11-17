/**
 * B14 — the 2027 sky for the yearly forecast pages (/rashifal/:rashi/2027,
 * /hi/rashifal/:rashi/2027, /horoscope/:sign/2027).
 *
 * Everything is computed from the same engines the rest of BornClock uses:
 *   • sidereal (Lahiri) longitudes — getSiderealLongitude, the Kundli / rashifal engine;
 *   • tropical longitudes — tropicalLongitudeAt, the Western chart / daily horoscope engine;
 *   • retrograde stations — retrogradePeriods (src/lib/vedic/sky.ts);
 *   • eclipses — eclipsesOfYear (src/lib/vedic/eclipses.ts; checked against NASA's tables).
 * A planet's year is split at every real sign change (1-day sampling refined to ~1 hour),
 * so a reading never assumes one sign for a whole year.
 *
 * Pure and deterministic for a (year, zodiac); memoised per module instance.
 */
import { getSiderealLongitude } from '../vedic/engine/vedicEngine';
import { tropicalLongitudeAt } from '../western/westernChart';
import { retrogradePeriods } from '../vedic/sky';
import { eclipsesOfYear } from '../vedic/eclipses';

export type Zodiac = 'sidereal' | 'tropical';
export type YPlanet = 'Sun' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn' | 'Rahu' | 'Ketu';

export const VEDIC_PLANETS: YPlanet[] = ['Jupiter', 'Saturn', 'Rahu', 'Ketu', 'Mars', 'Venus', 'Sun', 'Mercury'];
export const WESTERN_PLANETS: YPlanet[] = ['Jupiter', 'Saturn', 'Mars', 'Venus', 'Sun', 'Mercury'];

export interface Seg {
  planet: YPlanet;
  /** sign index 0..11 (Aries/Mesha = 0) in the page's zodiac */
  sign: number;
  startMs: number;
  endMs: number;
  /** IST calendar dates of start / end (end = the day it leaves, or 31 Dec) */
  from: string;
  to: string;
}

export interface RetroSpan { planet: YPlanet; startMs: number; endMs: number; from: string; to: string }

export interface YearEclipse {
  body: 'solar' | 'lunar';
  type: string;
  name: string;
  peakMs: number;
  /** IST date / time of greatest eclipse */
  istDate: string;
  istTime: string;
  /** sign (0..11) of the eclipsed luminary at greatest eclipse, in the page's zodiac */
  sign: number;
  /** listed as visible from India (timeanddate.com, see src/lib/vedic/eclipses.ts) */
  india: boolean;
}

export interface YearSky {
  year: number;
  zodiac: Zodiac;
  planets: YPlanet[];
  segs: Record<YPlanet, Seg[]>;
  retro: RetroSpan[];
  eclipses: YearEclipse[];
}

const HOUR = 3600_000;
const DAY = 24 * HOUR;
const IST = 5.5 * HOUR;

export const istISO = (ms: number): string => new Date(ms + IST).toISOString().slice(0, 10);

function lon(planet: YPlanet | 'Moon', zodiac: Zodiac, at: Date): number {
  if (zodiac === 'sidereal') return getSiderealLongitude(planet, at, 'drik');
  return tropicalLongitudeAt(planet, at);
}
export function signAt(planet: YPlanet | 'Moon', zodiac: Zodiac, at: Date): number {
  const l = ((lon(planet, zodiac, at) % 360) + 360) % 360;
  return Math.floor(l / 30);
}

function segments(planet: YPlanet, zodiac: Zodiac, start: number, end: number): Seg[] {
  const out: Seg[] = [];
  let segStart = start;
  let sign = signAt(planet, zodiac, new Date(start));
  let prev = start;
  for (let t = start + DAY; ; t += DAY) {
    const tt = Math.min(t, end);
    const s = signAt(planet, zodiac, new Date(tt));
    if (s !== sign) {
      let a = prev, b = tt;
      while (b - a > HOUR) { const m = (a + b) / 2; if (signAt(planet, zodiac, new Date(m)) === sign) a = m; else b = m; }
      out.push({ planet, sign, startMs: segStart, endMs: b, from: istISO(segStart), to: istISO(b) });
      segStart = b; sign = s;
    }
    prev = tt;
    if (tt >= end) break;
  }
  out.push({ planet, sign, startMs: segStart, endMs: end, from: istISO(segStart), to: istISO(end) });
  return out;
}

const cache = new Map<string, YearSky>();

/** The year's sky: sign stretches per planet, retrograde spans and eclipses. */
export function computeYearSky(year: number, zodiac: Zodiac): YearSky {
  const key = `${year}:${zodiac}`;
  const hit = cache.get(key);
  if (hit) return hit;
  // 1 Jan 00:00 IST → 31 Dec 23:59 IST
  const start = Date.UTC(year, 0, 1) - IST;
  const end = Date.UTC(year, 11, 31, 23, 59) - IST;
  const planets = zodiac === 'sidereal' ? VEDIC_PLANETS : WESTERN_PLANETS;
  const segs = {} as Record<YPlanet, Seg[]>;
  for (const p of planets) segs[p] = segments(p, zodiac, start, end);
  const retro: RetroSpan[] = [];
  for (const p of ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as const) {
    for (const r of retrogradePeriods(p, year)) {
      retro.push({ planet: p, startMs: r.start.getTime(), endMs: r.end.getTime(), from: istISO(r.start.getTime()), to: istISO(r.end.getTime()) });
    }
  }
  retro.sort((a, b) => a.startMs - b.startMs);
  const eclipses: YearEclipse[] = eclipsesOfYear(year).map(e => ({
    body: e.body, type: e.type, name: e.name, peakMs: e.peak.getTime(), istDate: e.istDate, istTime: e.istTime,
    sign: signAt(e.body === 'solar' ? 'Sun' : 'Moon', zodiac, e.peak), india: e.india,
  }));
  const sky: YearSky = { year, zodiac, planets, segs, retro, eclipses };
  cache.set(key, sky);
  return sky;
}

/** House counted from a reference sign (1..12): the Moon sign (Vedic) or Sun sign (Western). */
export function houseFrom(refSign: number, sign: number): number {
  return (((sign - refSign) % 12) + 12) % 12 + 1;
}

/** The sign a planet occupies at an instant, from the precomputed stretches. */
export function signOn(sky: YearSky, planet: YPlanet, ms: number): number {
  const s = sky.segs[planet];
  for (const x of s) if (ms >= x.startMs && ms < x.endMs) return x.sign;
  return s[ms < s[0].startMs ? 0 : s.length - 1].sign;
}

/** Noon IST of each day of the year (ms) — the sampling grid for scores and windows. */
export function dayGrid(year: number): number[] {
  const out: number[] = [];
  for (let t = Date.UTC(year, 0, 1, 12) - IST; t < Date.UTC(year + 1, 0, 1) - IST; t += DAY) out.push(t);
  return out;
}

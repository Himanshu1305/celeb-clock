/**
 * One Vedic (sidereal, Lahiri) "sky" per India date, computed once and reused for
 * all 12 rashis (and both languages). Every value comes from BornClock's own engine:
 * getSiderealLongitude (src/lib/vedic/engine/vedicEngine.ts) and computeDayPanchang
 * (src/lib/vedic/panchangDay.ts) for the default-city Choghadiya / Rahu Kaal.
 */
import { getSiderealLongitude } from '../../vedic/engine/vedicEngine';
import { computeDayPanchang, type TimeWindow } from '../../vedic/panchangDay';
import { istInstant, istClock, istDateISO } from '../dates';

export const VEDIC_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] as const;
export type VedicPlanet = typeof VEDIC_PLANETS[number];

const NAK_SPAN = 360 / 27;
const norm = (x: number) => ((x % 360) + 360) % 360;

/** Default city for lucky-time windows (labelled on the page). Coordinates as in PANCHANG_CITIES. */
export const DEFAULT_CITY = { name: 'New Delhi', nameHi: 'नई दिल्ली', lat: 28.6139, lon: 77.2090, tz: 5.5, slug: 'delhi' };

export interface MoonChange {
  /** IST "HH:MM" (nearest minute) */
  at: string;
  /** index after the change (sign 0..11 or nakshatra 0..26) */
  to: number;
  /** true if the change happens before the reference time (12:00 IST) */
  beforeRef: boolean;
}

export interface VedicSky {
  date: string;
  /** Reference instant: 12:00 IST on `date`. */
  ref: Date;
  /** Sidereal sign index (0 = Mesha) of every planet at `ref`. */
  sign: Record<VedicPlanet, number>;
  moonLon: number;
  moonNak: number;
  /** Moon sign / nakshatra changes during the India calendar day (00:00–24:00 IST). */
  moonSignChanges: MoonChange[];
  moonNakChanges: MoonChange[];
  /** Day Choghadiya + Rahu Kaal for DEFAULT_CITY. */
  choghadiya: TimeWindow[];
  rahuKaal: TimeWindow;
}

function changesOver(date: string, ref: Date, unit: number): MoonChange[] {
  const idx = (t: number) => Math.floor(norm(getSiderealLongitude('Moon', new Date(t))) / unit);
  const start = istInstant(date, 0, 0).getTime();
  const end = start + 24 * 3600 * 1000;
  const out: MoonChange[] = [];
  let prevT = start;
  let prev = idx(start);
  for (let t = start + 3600 * 1000; t <= end; t += 3600 * 1000) {
    const cur = idx(t);
    if (cur !== prev) {
      let a = prevT, b = t;
      while (b - a > 20 * 1000) {
        const mid = (a + b) / 2;
        if (idx(mid) === prev) a = mid; else b = mid;
      }
      const at = new Date(b);
      // Only report changes that fall on this India date (a 24:00 edge rounds to tomorrow).
      if (istDateISO(new Date(Math.round(b / 60000) * 60000)) === date) {
        out.push({ at: istClock(at), to: cur, beforeRef: b < ref.getTime() });
      }
      prev = cur;
    }
    prevT = t;
  }
  return out;
}

const cache = new Map<string, VedicSky>();

export function vedicSky(date: string): VedicSky {
  const hit = cache.get(date);
  if (hit) return hit;
  const ref = istInstant(date, 12, 0);
  const sign = {} as Record<VedicPlanet, number>;
  for (const p of VEDIC_PLANETS) sign[p] = Math.floor(norm(getSiderealLongitude(p, ref)) / 30);
  const moonLon = norm(getSiderealLongitude('Moon', ref));
  const [y, m, d] = date.split('-').map(Number);
  const pan = computeDayPanchang(new Date(Date.UTC(y, m - 1, d, 6)), DEFAULT_CITY.lat, DEFAULT_CITY.lon, DEFAULT_CITY.tz, DEFAULT_CITY.name);
  const sky: VedicSky = {
    date,
    ref,
    sign,
    moonLon,
    moonNak: Math.floor(moonLon / NAK_SPAN) % 27,
    moonSignChanges: changesOver(date, ref, 30),
    moonNakChanges: changesOver(date, ref, NAK_SPAN),
    choghadiya: pan.dayChoghadiya,
    rahuKaal: pan.rahuKaal,
  };
  if (cache.size > 800) cache.clear();
  cache.set(date, sky);
  return sky;
}

/** House (1..12) of a sign counted from a Moon sign (the gochar convention). */
export function houseFrom(signIdx: number, moonSign: number): number {
  return (((signIdx - moonSign) % 12) + 12) % 12 + 1;
}

/** Nakshatra indices (0..26) that have at least one pada inside a rashi. */
export function nakshatrasInRashi(rashi: number): number[] {
  const startDeg = rashi * 30;
  const first = Math.floor(startDeg / NAK_SPAN + 1e-9);
  const last = Math.floor((startDeg + 30 - 1e-6) / NAK_SPAN);
  const out: number[] = [];
  for (let k = first; k <= last; k++) out.push(k % 27);
  return out;
}

const toMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

/**
 * The day's "good time" for the default city: the first daytime Choghadiya of the
 * best available kind (Amrit, then Shubh, then Labh) that does not overlap Rahu Kaal.
 */
export function bestChoghadiya(sky: VedicSky): TimeWindow | null {
  const rk = [toMin(sky.rahuKaal.start), toMin(sky.rahuKaal.end)];
  const ok = (w: TimeWindow) => toMin(w.end) <= rk[0] || toMin(w.start) >= rk[1];
  for (const name of ['Amrit', 'Shubh', 'Labh']) {
    const w = sky.choghadiya.find(c => c.name === name && ok(c));
    if (w) return w;
  }
  return null;
}

/**
 * Transit-by-year engine — Growth P1-5 (slow planets: Saturn, Jupiter, Rahu/Ketu).
 *
 * For a slow planet and a calendar year it computes: the sign(s) it occupies
 * during the year, the real ingress date(s) within the year, and — for each of
 * the 12 Moon signs — the gochar effect (house from the Moon, graded), reusing
 * the validated rashifal engine. Everything is computed from real sidereal
 * positions; evergreen /transit/:planet/:year URLs render per-year at request
 * time (and prerender a window of years).
 */
import {
  RASHIS, readPlanetTransit, transitSignIndex, findIngress,
  type PlanetName, type TransitReading,
} from './rashifal';
import { getSiderealLongitude } from './engine/vedicEngine';

export type TransitPlanet = 'saturn' | 'jupiter' | 'rahu' | 'ketu';

export const TRANSIT_PLANETS: Record<TransitPlanet, { key: PlanetName; label: string; blurb: string; cycleYears: number }> = {
  saturn: { key: 'Saturn', label: 'Saturn (Shani)', blurb: 'Saturn spends about 2½ years in each sign — its transit marks the themes of discipline, responsibility and long-term consequence, including Sade Sati and Dhaiya.', cycleYears: 29 },
  jupiter: { key: 'Jupiter', label: 'Jupiter (Guru)', blurb: 'Jupiter spends about one year in each sign — its transit (Guru Gochar) is read as a year of growth, opportunity and expansion wherever it lands from your Moon.', cycleYears: 12 },
  rahu: { key: 'Rahu', label: 'Rahu (North Node)', blurb: 'Rahu moves backward through the zodiac, about 1½ years per sign — its transit points to ambition, obsession and sudden, unconventional turns.', cycleYears: 18 },
  ketu: { key: 'Ketu', label: 'Ketu (South Node)', blurb: 'Ketu, always opposite Rahu, spends about 1½ years per sign — its transit points to detachment, release and inward, spiritual themes.', cycleYears: 18 },
};

export interface YearTransit {
  planet: TransitPlanet;
  label: string;
  year: number;
  startSign: string;       // sign at the start of the year
  endSign: string;         // sign at the end of the year
  ingress: Array<{ date: string; sign: string }>;
  perSign: Array<TransitReading & { moonSign: string; moonSlug: string }>;
}

export function computeYearTransit(planet: TransitPlanet, year: number): YearTransit {
  const { key, label } = TRANSIT_PLANETS[planet];
  const start = new Date(Date.UTC(year, 0, 1, 6, 0, 0));
  const end = new Date(Date.UTC(year, 11, 31, 6, 0, 0));
  const mid = new Date(Date.UTC(year, 5, 30, 6, 0, 0));

  const startSignIdx = transitSignIndex(key, start);
  const endSignIdx = transitSignIndex(key, end);

  // All ingresses within the year (a slow planet changes sign 0–1 times/yr typically).
  const ingress: Array<{ date: string; sign: string }> = [];
  let cursor = new Date(start);
  for (let guard = 0; guard < 4 && cursor < end; guard++) {
    const ing = findIngress(key, cursor, end);
    if (!ing) break;
    ingress.push({ date: ing.dateISO, sign: RASHIS[ing.signIndex].sanskrit });
    cursor = new Date(ing.dateISO + 'T12:00:00Z');
    cursor.setUTCDate(cursor.getUTCDate() + 2);
  }

  // Per Moon sign, read the transit at mid-year (the dominant sign for most of the year).
  const perSign = RASHIS.map((r, i) => ({
    ...readPlanetTransit(key, i, mid),
    moonSign: r.sanskrit,
    moonSlug: r.slug,
  }));

  return {
    planet, label, year,
    startSign: RASHIS[startSignIdx].sanskrit,
    endSign: RASHIS[endSignIdx].sanskrit,
    ingress,
    perSign,
  };
}

// ── Mercury retrograde ───────────────────────────────────────────────────────
// Retrograde = the planet's *apparent* geocentric longitude is decreasing. We
// detect it directly from the real sidereal positions (same engine as the
// Kundli) by a finite-difference velocity, so the dates are computed, not typed.

/** Apparent daily motion of a planet in degrees (central difference, wrap-safe). */
function dailyMotion(planet: PlanetName, at: Date): number {
  const h = 12 * 3600 * 1000; // ±12h
  const before = getSiderealLongitude(planet, new Date(at.getTime() - h));
  const after = getSiderealLongitude(planet, new Date(at.getTime() + h));
  let d = after - before;            // span is 1 day
  if (d > 180) d -= 360;             // unwrap around 0/360
  if (d < -180) d += 360;
  return d;
}

export interface RetroPeriod {
  startISO: string;   // station retrograde (day it turns retrograde)
  endISO: string;     // station direct (day it turns direct)
  signAtStart: string;
  signAtEnd: string;
}

/**
 * All Mercury retrograde periods that overlap a calendar year, with a small
 * margin so a period straddling 1 Jan / 31 Dec is captured. Day precision.
 */
export function computeMercuryRetrogrades(year: number): RetroPeriod[] {
  const planet: PlanetName = 'Mercury';
  const start = new Date(Date.UTC(year - 1, 11, 1, 6, 0, 0));   // Dec 1 prior year
  const end = new Date(Date.UTC(year + 1, 0, 31, 6, 0, 0));     // Jan 31 next year
  const periods: RetroPeriod[] = [];
  let inRetro = dailyMotion(planet, start) < 0;
  let segStart = inRetro ? new Date(start) : null;
  const cur = new Date(start);
  while (cur <= end) {
    const next = new Date(cur.getTime() + 24 * 3600 * 1000);
    const motion = dailyMotion(planet, next) < 0;
    if (motion && !inRetro) { segStart = new Date(next); inRetro = true; }
    else if (!motion && inRetro && segStart) {
      periods.push(makeRetroPeriod(planet, segStart, cur));
      inRetro = false; segStart = null;
    }
    cur.setTime(next.getTime());
  }
  if (inRetro && segStart) periods.push(makeRetroPeriod(planet, segStart, end));
  // Keep only periods that actually touch the requested year.
  return periods.filter(p => {
    const sY = Number(p.startISO.slice(0, 4));
    const eY = Number(p.endISO.slice(0, 4));
    return sY === year || eY === year;
  });
}

function signNameAt(planet: PlanetName, at: Date): string {
  return RASHIS[Math.floor(((getSiderealLongitude(planet, at) % 360) + 360) % 360 / 30)].sanskrit;
}

function makeRetroPeriod(planet: PlanetName, startDate: Date, endDate: Date): RetroPeriod {
  return {
    startISO: startDate.toISOString().slice(0, 10),
    endISO: endDate.toISOString().slice(0, 10),
    signAtStart: signNameAt(planet, startDate),
    signAtEnd: signNameAt(planet, endDate),
  };
}

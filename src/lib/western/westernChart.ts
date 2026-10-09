/**
 * Western (tropical) natal-chart engine — P4 (P4-WESTERN-CHART).
 *
 * REUSES the already-validated BornClock astronomy path (astronomy-engine +
 * the vedic engine's tropical Ascendant and Placidus cusps) rather than adding
 * a second ephemeris. The ONLY difference between a Vedic (sidereal) and a
 * Western (tropical) chart is the ayanamsa: tropical = sidereal + ayanamsa.
 * So we compute the sidereal cusps with the validated `calculatePlacidusCusps`
 * and add the Lahiri ayanamsa back to recover the tropical zodiac; planet
 * tropical longitudes come straight from `Astronomy.Ecliptic(vec).elon`
 * (i.e. before any ayanamsa subtraction).
 *
 * Pure computation, no network. Runs in the browser and in Node (vitest).
 */
import * as Astronomy from 'astronomy-engine';
import {
  calculateLagna,
  calculatePlacidusCusps,
  getLahiriAyanamsa,
  normalize360,
} from '@/lib/vedic/engine/vedicEngine';

export const TROPICAL_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

// Western chart bodies, in display order. Outer planets (Uranus/Neptune/Pluto)
// are genuine ephemeris bodies in astronomy-engine; the lunar North Node is the
// mean node (same formula the Vedic engine uses for Rahu).
export const WESTERN_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
  'Uranus', 'Neptune', 'Pluto', 'North Node',
] as const;
export type WesternBodyName = typeof WESTERN_BODIES[number];

export interface WesternPlacement {
  name: string;
  longitude: number;      // tropical ecliptic longitude 0..360
  sign: string;           // tropical sign name
  signIndex: number;      // 0=Aries .. 11=Pisces
  degreeInSign: number;   // 0..30
  house: number;          // 1..12
  retrograde: boolean;
}

export interface WesternPoint {
  longitude: number;
  sign: string;
  signIndex: number;
  degreeInSign: number;
}

export interface WesternHouse {
  house: number;          // 1..12
  cuspLongitude: number;  // tropical
  sign: string;
  degreeInSign: number;
}

export type AspectType = 'Conjunction' | 'Sextile' | 'Square' | 'Trine' | 'Opposition';

export interface WesternAspect {
  a: string;
  b: string;
  type: AspectType;
  angle: number;          // ideal angle (0/60/90/120/180)
  orb: number;            // how far off exact, degrees
}

export interface WesternChart {
  ascendant: WesternPoint;
  midheaven: WesternPoint;
  sun: WesternPlacement;
  moon: WesternPlacement;
  placements: WesternPlacement[];
  houses: WesternHouse[];
  aspects: WesternAspect[];
  houseSystem: 'placidus' | 'whole-sign';
  warnings: { code: string; message: string }[];
}

const ASPECT_DEFS: { type: AspectType; angle: number; orb: number }[] = [
  { type: 'Conjunction', angle: 0, orb: 8 },
  { type: 'Sextile', angle: 60, orb: 5 },
  { type: 'Square', angle: 90, orb: 7 },
  { type: 'Trine', angle: 120, orb: 8 },
  { type: 'Opposition', angle: 180, orb: 8 },
];

function tropicalLongitude(body: string, time: Astronomy.AstroTime): number {
  if (body === 'Moon') {
    const vec = Astronomy.GeoMoon(time);
    return normalize360(Astronomy.Ecliptic(vec).elon);
  }
  const vec = Astronomy.GeoVector(body as Astronomy.Body, time, true);
  return normalize360(Astronomy.Ecliptic(vec).elon);
}

function isRetrograde(body: string, time: Astronomy.AstroTime): boolean {
  if (body === 'Sun' || body === 'Moon') return false;
  const lon1 = Astronomy.Ecliptic(Astronomy.GeoVector(body as Astronomy.Body, time, true)).elon;
  const later = Astronomy.MakeTime(new Date(time.date.getTime() + 24 * 3600 * 1000));
  const lon2 = Astronomy.Ecliptic(Astronomy.GeoVector(body as Astronomy.Body, later, true)).elon;
  let diff = lon2 - lon1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

function meanNodeTropical(date: Date): number {
  const time = Astronomy.MakeTime(date);
  const T = time.tt / 36525;
  const node = 125.04455501 - 1934.1361849 * T + 0.0020754 * T * T;
  return normalize360(node);
}

function toPoint(longitude: number): WesternPoint {
  const lon = normalize360(longitude);
  const signIndex = Math.floor(lon / 30);
  return { longitude: lon, sign: TROPICAL_SIGNS[signIndex], signIndex, degreeInSign: lon % 30 };
}

/** True if `lon` lies in the forward arc [start, end). */
function inArc(lon: number, start: number, end: number): boolean {
  const span = normalize360(end - start);
  const pos = normalize360(lon - start);
  return pos < span;
}

function houseOf(lon: number, cusps: number[]): number {
  // cusps[0] is house 1 cusp, cusps[11] is house 12 cusp
  for (let h = 0; h < 12; h++) {
    const start = cusps[h];
    const end = cusps[(h + 1) % 12];
    if (inArc(normalize360(lon), start, end)) return h + 1;
  }
  return 1;
}

/**
 * Generate a full tropical (Western) natal chart.
 * @param birthDateUTC the birth instant in UTC
 * @param latitude / @param longitude birth place
 */
export function generateWesternChart(birthDateUTC: Date, latitude: number, longitude: number): WesternChart {
  const time = Astronomy.MakeTime(birthDateUTC);
  const ayanamsa = getLahiriAyanamsa(birthDateUTC);

  // Ascendant (tropical) comes directly from the validated Lagna routine.
  const lagna = calculateLagna(birthDateUTC, latitude, longitude);
  const ascTropical = lagna.ascTropical;

  // Placidus becomes unreliable above the polar circle (ecliptic circumpolar).
  const tilt = Astronomy.e_tilt(time);
  const polarThreshold = 90 - tilt.tobl;
  const isPolar = Math.abs(latitude) > polarThreshold;

  const warnings: { code: string; message: string }[] = [];
  let houseSystem: 'placidus' | 'whole-sign' = 'placidus';
  let cuspsTrop: number[]; // index 0 = house 1

  if (isPolar) {
    houseSystem = 'whole-sign';
    warnings.push({
      code: 'POLAR_LATITUDE',
      message:
        'This birth place is above the polar circle, where the Placidus house system breaks down. ' +
        'We fall back to whole-sign houses (the 1st house = the whole rising sign). House positions here are approximate.',
    });
    const ascSignStart = Math.floor(ascTropical / 30) * 30;
    cuspsTrop = Array.from({ length: 12 }, (_, i) => normalize360(ascSignStart + i * 30));
  } else {
    const sidCusps = calculatePlacidusCusps(birthDateUTC, latitude, longitude);
    cuspsTrop = Array.from({ length: 12 }, (_, i) => normalize360(sidCusps[i + 1] + ayanamsa));
  }

  const mcTropical = cuspsTrop[9]; // house 10 cusp = Midheaven

  const placements: WesternPlacement[] = WESTERN_BODIES.map((name) => {
    const lon = name === 'North Node' ? meanNodeTropical(birthDateUTC) : tropicalLongitude(name, time);
    const pt = toPoint(lon);
    return {
      name,
      longitude: pt.longitude,
      sign: pt.sign,
      signIndex: pt.signIndex,
      degreeInSign: pt.degreeInSign,
      house: houseOf(pt.longitude, cuspsTrop),
      retrograde: name === 'North Node' ? true : isRetrograde(name, time),
    };
  });

  const sun = placements.find((p) => p.name === 'Sun')!;
  const moon = placements.find((p) => p.name === 'Moon')!;

  const houses: WesternHouse[] = cuspsTrop.map((cusp, i) => {
    const pt = toPoint(cusp);
    return { house: i + 1, cuspLongitude: pt.longitude, sign: pt.sign, degreeInSign: pt.degreeInSign };
  });

  // Aspects among the physical bodies + Ascendant/Midheaven (the nodes are
  // excluded from aspect maths — they are points, not bodies, by convention).
  const aspectBodies: { name: string; lon: number }[] = [
    ...placements.filter((p) => p.name !== 'North Node').map((p) => ({ name: p.name, lon: p.longitude })),
    { name: 'Ascendant', lon: ascTropical },
    { name: 'Midheaven', lon: mcTropical },
  ];

  const aspects: WesternAspect[] = [];
  for (let i = 0; i < aspectBodies.length; i++) {
    for (let j = i + 1; j < aspectBodies.length; j++) {
      const a = aspectBodies[i];
      const b = aspectBodies[j];
      let sep = Math.abs(a.lon - b.lon);
      if (sep > 180) sep = 360 - sep;
      const luminary = a.name === 'Sun' || a.name === 'Moon' || b.name === 'Sun' || b.name === 'Moon';
      let best: WesternAspect | null = null;
      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(sep - def.angle);
        const allowed = def.orb + (luminary ? 1 : 0);
        if (orb <= allowed && (!best || orb < best.orb)) {
          best = { a: a.name, b: b.name, type: def.type, angle: def.angle, orb: Number(orb.toFixed(2)) };
        }
      }
      if (best) aspects.push(best);
    }
  }
  aspects.sort((x, y) => x.orb - y.orb);

  return {
    ascendant: toPoint(ascTropical),
    midheaven: toPoint(mcTropical),
    sun,
    moon,
    placements,
    houses,
    aspects,
    houseSystem,
    warnings,
  };
}

/**
 * Convert local birth date/time (+ timezone offset in hours east of UTC) to the
 * UTC instant. Mirrors `toBirthDateUTC` in the Vedic engine exactly.
 */
export function localToUTC(dob: string, time: string, tzHours: number): Date {
  const [y, m, d] = dob.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  const localMs = Date.UTC(y, m - 1, d, h, min, 0);
  return new Date(localMs - tzHours * 3600 * 1000);
}

/** Format a tropical longitude as e.g. "14° Taurus 32′". */
export function formatSignPosition(longitude: number): string {
  const lon = normalize360(longitude);
  const signIndex = Math.floor(lon / 30);
  const deg = lon % 30;
  const whole = Math.floor(deg);
  const minutes = Math.round((deg - whole) * 60);
  const mm = minutes === 60 ? 0 : minutes;
  const dd = minutes === 60 ? whole + 1 : whole;
  return `${dd}° ${TROPICAL_SIGNS[signIndex]} ${String(mm).padStart(2, '0')}′`;
}

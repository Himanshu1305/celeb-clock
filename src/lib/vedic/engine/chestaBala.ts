/**
 * Shadbala — Chesta Bala (Motional Strength). Ported from
 * scripts/vedic-lab/chestaBala.cjs.
 *
 * METHODOLOGY: computes the same physical quantity as the classical
 * Manda-Sheeghra epicycle method (mean vs true longitude gap) using modern
 * orbital mechanics — a faithful modern equivalent, NOT the historical
 * derivation. Confidence ~80%; no live-API ground truth for the combined value.
 * Tests MUST use range/tolerance assertions and UI copy MUST say "approximate".
 */
function normalize360(deg: number): number { return ((deg % 360) + 360) % 360; }
function toRad(deg: number): number { return deg * Math.PI / 180; }
function toDeg(rad: number): number { return rad * 180 / Math.PI; }

function daysSinceJ2000(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5 - 2451545.0;
}

const ORBITAL: Record<string, { N: number[]; w: number[]; M: number[]; a: number }> = {
  Mercury: { N: [48.3313, 3.24587e-5], w: [29.1241, 1.01444e-5], M: [168.6562, 4.0923344368], a: 0.387098 },
  Venus:   { N: [76.6799, 2.46590e-5], w: [54.8910, 1.38374e-5], M: [48.0052, 1.6021302244], a: 0.723330 },
  Mars:    { N: [49.5574, 2.11081e-5], w: [286.5016, 2.92961e-5], M: [18.6021, 0.5240207766], a: 1.523688 },
  Jupiter: { N: [100.4542, 2.76854e-5], w: [273.8777, 1.64505e-5], M: [19.8950, 0.0830853001], a: 5.20256 },
  Saturn:  { N: [113.6634, 2.38980e-5], w: [339.3939, 2.97661e-5], M: [316.9670, 0.0334442282], a: 9.55475 },
};

function helioMeanLongitude(planet: string, d: number): number {
  const el = ORBITAL[planet];
  const N = normalize360(el.N[0] + el.N[1] * d);
  const w = normalize360(el.w[0] + el.w[1] * d);
  const M = normalize360(el.M[0] + el.M[1] * d);
  return normalize360(N + w + M);
}

function earthHelioMeanLongitude(d: number): number {
  const w = 282.9404 + 4.70935e-5 * d;
  const M = normalize360(356.0470 + 0.9856002585 * d);
  return normalize360(normalize360(w + M) + 180);
}

function sunMeanLongitude(d: number): number {
  const w = 282.9404 + 4.70935e-5 * d;
  const M = normalize360(356.0470 + 0.9856002585 * d);
  return normalize360(w + M);
}

export function geocentricMeanLongitude(planet: string, date: Date): number {
  const d = daysSinceJ2000(date);
  const planetHelioLon = helioMeanLongitude(planet, d);
  const earthHelioLon = earthHelioMeanLongitude(d);
  const aPlanet = ORBITAL[planet].a;
  const aEarth = 1.0;
  const xP = aPlanet * Math.cos(toRad(planetHelioLon));
  const yP = aPlanet * Math.sin(toRad(planetHelioLon));
  const xE = aEarth * Math.cos(toRad(earthHelioLon));
  const yE = aEarth * Math.sin(toRad(earthHelioLon));
  return normalize360(toDeg(Math.atan2(yP - yE, xP - xE)));
}

function getChestaBalaOuterPlanet(planet: string, trueLongitude: number, date: Date): number {
  const meanLon = geocentricMeanLongitude(planet, date);
  const d = daysSinceJ2000(date);
  const sunMeanLon = sunMeanLongitude(d);
  const avgLon = normalize360((meanLon + trueLongitude) / 2);
  let kendra = normalize360(sunMeanLon - avgLon);
  if (kendra > 180) kendra = 360 - kendra;
  return kendra / 3;
}

function getChestaBalaInnerPlanet(planet: string, trueLongitude: number, date: Date): number {
  const meanLon = geocentricMeanLongitude(planet, date);
  let kendra = normalize360(meanLon - trueLongitude);
  if (kendra > 180) kendra = 360 - kendra;
  return kendra / 3;
}

export function getChestaBala(planet: string, trueLongitude: number, date: Date): number | null {
  if (planet === 'Sun' || planet === 'Moon') return null;
  if (['Mercury', 'Venus'].includes(planet)) return getChestaBalaInnerPlanet(planet, trueLongitude, date);
  return getChestaBalaOuterPlanet(planet, trueLongitude, date);
}

/**
 * Higher-precision apparent geocentric Sun (B18, Varshphal).
 *
 * The Varsha Pravesh moment is the instant the Sun regains its natal sidereal longitude.
 * The Sun moves only ~2.5″ per minute of time, so the ~1–2″ error of astronomy-engine's
 * truncated Earth series moved the annual chart by up to ~45 s (0.3° of Lagna). This
 * module evaluates a fuller VSOP87B Earth series and then follows astronomy-engine's own
 * GeoVector recipe (light-time back-dating = light-time + aberration, J2000 equator
 * output), exactly as ./vsop87Outer does for Jupiter and Saturn, so callers keep using
 * `Astronomy.Ecliptic(vec)`.
 *
 * Data (vsop87Earth.data.json): VSOP87B Earth (Bretagnon & Francou 1988; heliocentric
 * ecliptic & equinox J2000; L/B radians, R AU; term = A·cos(B + C·t), t in Julian millennia
 * TT from J2000) from the coefficient file in the `astronomia` npm package 4.2.0
 * (data/vsop87Bearth.js, parsed as text). Every term with |A|·0.15^power ≥ 1e-8 is kept
 * (483 of 2564). Generated file — do not edit by hand.
 *
 * Used ONLY by the Varshphal module (src/lib/vedic/varshphal.ts); the natal engine is untouched.
 * Result vs pyswisseph (SWIEPH): see src/lib/vedic/__tests__/varshphal.test.ts.
 */
import * as Astronomy from 'astronomy-engine';
import EARTH_JSON from './vsop87Earth.data.json';

const EARTH = (EARTH_JSON as unknown as { Earth: number[][][][] }).Earth;
const DAYS_PER_MILLENNIUM = 365250;
const PI2 = 2 * Math.PI;

function series(formula: number[][][], t: number, clampAngle: boolean): number {
  let tpower = 1, coord = 0;
  for (const s of formula) {
    let sum = 0;
    for (const [a, b, c] of s) sum += a * Math.cos(b + t * c);
    let incr = tpower * sum;
    if (clampAngle) incr %= PI2;
    coord += incr;
    tpower *= t;
  }
  return coord;
}

/** Heliocentric Earth, J2000 equator (EQJ), AU. */
export function earthHelioVector(time: Astronomy.AstroTime): Astronomy.Vector {
  const [L, B, R] = EARTH;
  const t = time.tt / DAYS_PER_MILLENNIUM;
  const lon = series(L, t, true), lat = series(B, t, false), rad = series(R, t, false);
  const rc = rad * Math.cos(lat);
  const x = rc * Math.cos(lon), y = rc * Math.sin(lon), z = rad * Math.sin(lat);
  return new Astronomy.Vector(
    x + 0.000000440360 * y - 0.000000190919 * z,
    -0.000000479966 * x + 0.917482137087 * y - 0.397776982902 * z,
    0.397776982902 * y + 0.917482137087 * z,
    time,
  );
}

/** Drop-in for `Astronomy.GeoVector(Body.Sun, time, true)` with the fuller Earth series. */
export function preciseSunGeoVector(time: Astronomy.AstroTime): Astronomy.Vector {
  const vec = Astronomy.CorrectLightTravel((lt: Astronomy.AstroTime) => {
    const e = earthHelioVector(lt);
    return new Astronomy.Vector(-e.x, -e.y, -e.z, lt);
  }, time);
  vec.t = time;
  return vec;
}

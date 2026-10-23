/**
 * Higher-precision geocentric vectors for Jupiter and Saturn.
 *
 * astronomy-engine's built-in VSOP87 series for these two planets are heavily
 * truncated; against Swiss Ephemeris (1900–2050) Saturn's geocentric longitude
 * is off by up to ~13″ and Jupiter's by ~10″. At Saturn's slow speed that put
 * its sign/nakshatra ingress moments 30–50 min away from Drik Panchang.
 * This module evaluates a much fuller VSOP87B series and then follows
 * astronomy-engine's own GeoVector recipe exactly (light-time back-dating of
 * both bodies = light-time + aberration, J2000 equator output), so callers keep
 * using `Astronomy.Ecliptic(vec)` unchanged. Result vs Swiss Ephemeris over
 * 1900–2050 (pyswisseph 2.10.03, 5-day steps): Saturn max 1.6″ (was 13.0″),
 * Jupiter max 2.2″ (was 10.2″); the remainder is astronomy-engine's Earth.
 *
 * Data (vsop87Outer.data.json): VSOP87B (Bretagnon & Francou 1988; heliocentric
 * ecliptic & equinox J2000; L/B radians, R AU; term = A·cos(B + C·t), t in
 * Julian millennia TT from J2000) for Jupiter and Saturn, from the coefficient
 * files packaged in the `astronomia` npm package 4.2.0 (data/vsop87Bjupiter.js,
 * vsop87Bsaturn.js). astronomy-engine keeps 72 Jupiter / 91 Saturn terms; this
 * keeps every term with |A|·0.15^power ≥ 1e-7 (530 Jupiter / 910 Saturn), each
 * dropped term ≤ ~0.02″ over 1850–2150. Generated file — do not edit by hand.
 * The lab engine scripts/vedic-lab/vedicEngineStage1b.cjs requires the same JSON.
 */
import * as Astronomy from 'astronomy-engine';
import VSOP87B_OUTER_JSON from './vsop87Outer.data.json';

const VSOP87B_OUTER = VSOP87B_OUTER_JSON as unknown as Record<'Jupiter' | 'Saturn', number[][][][]>;

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

/** Heliocentric J2000-equator (EQJ) position in AU — same frame/rotation as astronomy-engine's HelioVector. */
function helioVector(body: 'Jupiter' | 'Saturn', time: Astronomy.AstroTime): Astronomy.Vector {
  const [L, B, R] = VSOP87B_OUTER[body];
  const t = time.tt / DAYS_PER_MILLENNIUM;
  const lon = series(L, t, true), lat = series(B, t, false), rad = series(R, t, false);
  const rc = rad * Math.cos(lat);
  const x = rc * Math.cos(lon), y = rc * Math.sin(lon), z = rad * Math.sin(lat);
  // VSOP ecliptic J2000 → EQJ (astronomy-engine's VsopRotate constants)
  return new Astronomy.Vector(
    x + 0.000000440360 * y - 0.000000190919 * z,
    -0.000000479966 * x + 0.917482137087 * y - 0.397776982902 * z,
    0.397776982902 * y + 0.917482137087 * z,
    time,
  );
}

export function isPreciseOuterPlanet(body: string): body is 'Jupiter' | 'Saturn' {
  return body === 'Jupiter' || body === 'Saturn';
}

/** Drop-in for `Astronomy.GeoVector(body, time, true)` for Jupiter/Saturn. */
export function preciseGeoVector(body: 'Jupiter' | 'Saturn', time: Astronomy.AstroTime): Astronomy.Vector {
  const vec = Astronomy.CorrectLightTravel((lt: Astronomy.AstroTime) => {
    const p = helioVector(body, lt);
    const e = Astronomy.HelioVector(Astronomy.Body.Earth, lt);
    return new Astronomy.Vector(p.x - e.x, p.y - e.y, p.z - e.z, lt);
  }, time);
  vec.t = time; // observation time, as astronomy-engine's GeoVector returns
  return vec;
}

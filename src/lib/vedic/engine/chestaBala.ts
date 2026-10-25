/**
 * Shadbala — Chesta Bala (Motional Strength) for Mars, Mercury, Jupiter, Venus, Saturn.
 *
 * Audit K11 rework (Oct 2026): the classical Chesta Kendra method (BPHS 27.21–25 as
 * worked out in B.V. Raman, "Graha and Bhava Balas"):
 *
 *   Chesta Kendra = Seeghrocha − (Madhya + Spashta) / 2,  folded to 0–180°,  ÷ 3
 *
 *   - Outer planets (Mars, Jupiter, Saturn): Madhya = the planet's mean longitude
 *     (heliocentric mean motion), Seeghrocha = the mean Sun.
 *   - Inner planets (Mercury, Venus): Madhya = the mean Sun, Seeghrocha = the
 *     planet's heliocentric mean longitude.
 *   - Spashta = the planet's true geocentric longitude.
 * A retrograde planet (opposite the Sun, or between Earth and Sun) scores ~60; one
 * near conjunction with the Sun scores ~0. Mean longitudes are the modern mean
 * elements (Meeus, Astronomical Algorithms, Table 31.A, mean equinox of date) rather
 * than Surya Siddhanta tables, so values differ from Raman's printed figures by a few
 * virupas (see the regression test for the tolerance).
 *
 * The Sun's Chesta Bala = its Ayana Bala and the Moon's = its Paksha Bala (BPHS 27.18);
 * those two are assigned in calculateBirthChart, so this returns null for them.
 * All longitudes here are TROPICAL (any common frame works — the ayanamsa cancels).
 */
function normalize360(deg: number): number { return ((deg % 360) + 360) % 360; }

function julianCenturiesTT(date: Date): number {
  return (date.getTime() / 86400000 + 2440587.5 - 2451545.0) / 36525;
}

// Meeus Table 31.A — mean longitude L (degrees) = a0 + a1·T + a2·T², mean equinox of date.
const MEAN_L: Record<string, [number, number, number]> = {
  Mercury: [252.250906, 149474.0722491, 0.0003035],
  Venus: [181.979801, 58519.2130302, 0.00031014],
  Earth: [100.466457, 36000.7698278, 0.00030322],
  Mars: [355.433000, 19141.6964471, 0.00031052],
  Jupiter: [34.351519, 3036.3027748, 0.0002233],
  Saturn: [50.077444, 1223.5110686, 0.00051908],
};

export function heliocentricMeanLongitude(body: string, date: Date): number {
  const T = julianCenturiesTT(date);
  const [a0, a1, a2] = MEAN_L[body];
  return normalize360(a0 + a1 * T + a2 * T * T);
}

export function meanSunLongitude(date: Date): number {
  return normalize360(heliocentricMeanLongitude('Earth', date) + 180);
}

/** Circular midpoint of two longitudes (handles the 360°→0° wrap). */
function midpoint(a: number, b: number): number {
  let d = normalize360(b - a);
  if (d > 180) d -= 360;
  return normalize360(a + d / 2);
}

export function getChestaKendra(planet: string, trueTropicalLongitude: number, date: Date): number {
  const sunMean = meanSunLongitude(date);
  const helio = heliocentricMeanLongitude(planet, date);
  const inner = planet === 'Mercury' || planet === 'Venus';
  const madhya = inner ? sunMean : helio;
  const seeghrocha = inner ? helio : sunMean;
  let k = normalize360(seeghrocha - midpoint(madhya, trueTropicalLongitude));
  if (k > 180) k = 360 - k;
  return k;
}

export function getChestaBala(planet: string, trueTropicalLongitude: number, date: Date): number | null {
  if (!MEAN_L[planet] || planet === 'Earth') return null; // Sun/Moon handled by caller
  return getChestaKendra(planet, trueTropicalLongitude, date) / 3;
}

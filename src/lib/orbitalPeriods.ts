/**
 * Planetary sidereal orbital periods — the ONE table used site-wide (N13, Oct 2026).
 *
 * Source: NASA NSSDCA Planetary Fact Sheets ("Sidereal orbit period (days)"),
 * nssdc.gsfc.nasa.gov/planetary/factsheet/<planet>fact.html, read 23 Oct 2026:
 * Mercury 87.969, Venus 224.701, Earth 365.256, Mars 686.980, Jupiter 4,332.589,
 * Saturn 10,755.699, Uranus 30,685.400, Neptune 60,189.
 */
export const ORBITAL_PERIOD_DAYS = {
  Earth: 365.256,
  Mercury: 87.969,
  Venus: 224.701,
  Mars: 686.98,
  Jupiter: 4332.589,
  Saturn: 10755.699,
  Uranus: 30685.4,
  Neptune: 60189,
} as const;

export type OrbitPlanet = keyof typeof ORBITAL_PERIOD_DAYS;

/** Orbital period in Earth (sidereal) years. */
export function orbitalPeriodYears(planet: OrbitPlanet): number {
  return ORBITAL_PERIOD_DAYS[planet] / ORBITAL_PERIOD_DAYS.Earth;
}

/** Planets other than Earth, inner to outer. */
export const OTHER_PLANETS: OrbitPlanet[] = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];

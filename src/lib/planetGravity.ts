/**
 * Planet weight physics — the data + math behind /weight-on-planets.
 * Pure and unit-tested (e2e/prelaunch/weight-on-planets.spec.ts).
 *
 * Surface-gravity multipliers are relative to Earth = 1.000, from NASA's NSSDCA
 * Planetary Fact Sheet (Ratio to Earth Values):
 *   https://nssdc.gsfc.nasa.gov/planetary/factsheet/planet_table_ratio.html
 * Two fun-page conventions vs the strict ratio table, both cited on the page:
 *   • Mars uses the widely-taught 0.379 (NASA metric sheet 3.71 m/s² ÷ 9.807 = 0.378).
 *   • Jupiter uses cloud-top 2.53 (24.79 m/s² ÷ 9.807; Jupiter has no solid surface),
 *     rather than the equatorial 2.36 in the ratio table.
 */

export interface Planet {
  key: string;
  name: string;
  gravity: number;   // surface gravity, Earth = 1.000
  emoji: string;
  fact: string;      // one playful, true line
}

// Ordered outward from the Sun, with the Moon slotted after Earth.
export const PLANETS: Planet[] = [
  { key: 'mercury', name: 'Mercury', gravity: 0.378, emoji: '☿️', fact: 'Tiny and dense — you’d weigh about a third of your Earth weight.' },
  { key: 'venus',   name: 'Venus',   gravity: 0.907, emoji: '♀️', fact: 'Almost Earth’s twin in size, so your weight barely changes.' },
  { key: 'earth',   name: 'Earth',   gravity: 1.000, emoji: '🌍', fact: 'Home base — the weight you already know, and our 1.0× reference point.' },
  { key: 'moon',    name: 'The Moon', gravity: 0.166, emoji: '🌙', fact: 'Just 1/6 of Earth’s pull — this is why the Apollo astronauts bounced.' },
  { key: 'mars',    name: 'Mars',    gravity: 0.379, emoji: '♂️', fact: 'Roughly a third of Earth — you could jump nearly three times higher.' },
  { key: 'jupiter', name: 'Jupiter', gravity: 2.53,  emoji: '♃',  fact: 'The heavyweight champion: ~2.5× your weight at its cloud tops (it has no solid ground).' },
  { key: 'saturn',  name: 'Saturn',  gravity: 0.916, emoji: '♄',  fact: 'Despite being 95× Earth’s mass, it’s so puffy your weight is almost unchanged.' },
  { key: 'uranus',  name: 'Uranus',  gravity: 0.889, emoji: '⛢',  fact: 'Bigger than Earth, yet you’d weigh slightly less — size isn’t everything.' },
  { key: 'neptune', name: 'Neptune', gravity: 1.12,  emoji: '♆',  fact: 'One of only two worlds here where you’d weigh MORE than on Earth.' },
];

export const KG_PER_LB = 0.45359237;
export const LB_PER_KG = 2.20462262;

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}
export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

/** Weight on a body of the given gravity ratio, in the same unit as the input. */
export function weightOn(earthWeight: number, gravity: number): number {
  return earthWeight * gravity;
}

/** True only for a real, plausible human/paperweight input. Guards NaN, ≤0, absurd. */
export function isValidWeight(n: number): boolean {
  return Number.isFinite(n) && n > 0 && n <= 2000;
}

/** Round for display: 1 decimal under 100, whole numbers above (keeps it playful, not fussy). */
export function displayWeight(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return n < 100 ? (Math.round(n * 10) / 10).toString() : Math.round(n).toString();
}

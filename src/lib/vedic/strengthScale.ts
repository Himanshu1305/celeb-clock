/**
 * Audit K9 — ONE planetary-strength scale for every report.
 *
 * Before: the Life Report and career pages called a planet "strong" at a flat 300
 * virupas, the AI reading used the per-planet classical minimums, and the gemstone page
 * used yet another cut — so the same planet was "strong" in one report and "gentle" in
 * another (421 of 2,100 planets disagreed in the round-2 audit).
 *
 * The scale (shared by the AI reading, chat, Life Report, career report, career fields
 * and gemstones):
 *   - The yardstick is the classical MINIMUM REQUIRED Shadbala per planet (Brihat Parashara
 *     Hora Shastra 27.34–36): Sun 6.5, Moon 6, Mars 5, Mercury 7, Jupiter 6.5, Venus 5.5,
 *     Saturn 5 rupas (× 60 = virupas below). Audit K11: the Sun used to be 5 rupas (the
 *     figure in B.V. Raman's table and JHora/PyJHora); BPHS groups the Sun with Jupiter at
 *     6.5, so the Sun now needs 390.
 *   - weak      — below the classical minimum (ratio < 1.0)
 *   - moderate  — meets the minimum (1.0 ≤ ratio < 1.25)
 *   - strong    — clearly exceeds it, by at least a quarter (ratio ≥ 1.25)
 * Rahu/Ketu have no Shadbala → 'moderate' (no claim either way).
 *
 * Why 1.25 for "strong": meeting the minimum is "adequate", not "strong". Method: keep the
 * classical minimum as the weak/moderate line (it is not ours to tune) and choose the
 * strong cut so roughly a third of planet scores are strong on a sample of 400
 * engine-computed charts (seeded random births 1950–2009 at 8 cities).
 *   K9 (old Shadbala):        weak ≈ 29%, moderate ≈ 37%, strong ≈ 34%.
 *   K11 (BPHS Shadbala, Sun 390): weak 25%, moderate 46%, strong 29% (1.20 would give 38%).
 * 29% is still "roughly a third", so the 1.25 cut is unchanged.
 */
export const REQUIRED_SHADBALA: Readonly<Record<string, number>> = {
  Sun: 390, Moon: 360, Mars: 300, Mercury: 420, Jupiter: 390, Venus: 330, Saturn: 300,
};

export const STRONG_RATIO = 1.25;

export type StrengthCategory = 'strong' | 'moderate' | 'weak';

/** Shadbala total ÷ the planet's classical minimum (null for Rahu/Ketu/unknown). */
export function shadbalaRatio(planet: string, total: number | undefined | null): number | null {
  const req = REQUIRED_SHADBALA[planet];
  if (!req || typeof total !== 'number' || !Number.isFinite(total)) return null;
  return total / req;
}

/** The one shared strength category. */
export function shadbalaCategory(planet: string, total: number | undefined | null): StrengthCategory {
  const r = shadbalaRatio(planet, total);
  if (r === null) return 'moderate';
  if (r >= STRONG_RATIO) return 'strong';
  if (r >= 1) return 'moderate';
  return 'weak';
}

/**
 * Plain-language, one-line meaning of each of the six Shadbala parts (BPHS ch. 27),
 * shown next to the strength table.
 */
export const SHADBALA_COMPONENT_EXPLANATIONS: ReadonlyArray<{ key: 'sthana' | 'dig' | 'kala' | 'chesta' | 'naisargika' | 'drik'; name: string; line: string }> = [
  { key: 'sthana', name: 'Sthana Bala (position)', line: 'How well the planet is placed by sign — exalted, own or friendly signs across seven divisional charts, and angular houses.' },
  { key: 'dig', name: 'Dig Bala (direction)', line: 'Whether the planet sits in the part of the sky where it is naturally strongest, e.g. the Sun near the top of the chart.' },
  { key: 'kala', name: 'Kala Bala (time)', line: 'Strength from the moment of birth — day or night, the Moon\'s phase, the weekday, year, month and hour lords, and north–south position.' },
  { key: 'chesta', name: 'Chesta Bala (motion)', line: 'Strength from movement — highest when a planet appears to move backwards (retrograde); for the Sun it is its seasonal course, for the Moon her brightness.' },
  { key: 'naisargika', name: 'Naisargika Bala (natural)', line: 'A fixed natural ranking by brightness, the same in every chart — the Sun highest, Saturn lowest.' },
  { key: 'drik', name: 'Drik Bala (aspects)', line: 'The net effect of other planets\' aspects — gentle planets\' aspects add, harsh planets\' aspects subtract.' },
];

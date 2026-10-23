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
 *     Hora Shastra): Sun 5, Moon 6, Mars 5, Mercury 7, Jupiter 6.5, Venus 5.5, Saturn 5
 *     rupas (× 60 = virupas below).
 *   - weak      — below the classical minimum (ratio < 1.0)
 *   - moderate  — meets the minimum (1.0 ≤ ratio < 1.25)
 *   - strong    — clearly exceeds it, by at least a quarter (ratio ≥ 1.25)
 * Rahu/Ketu have no Shadbala → 'moderate' (no claim either way).
 *
 * Why 1.25 for "strong": meeting the minimum is "adequate", not "strong". On a sample of
 * 400 engine-computed charts (seeded random births 1950–2009 at 8 cities; script in the
 * fix report), 71% of the 2,800 planet scores met the minimum, so "strong = meets the
 * minimum" labelled most planets strong. With the 1.25 cut the same sample splits
 * roughly a third each way (weak ≈ 29%, moderate ≈ 38%, strong ≈ 33%).
 */
export const REQUIRED_SHADBALA: Readonly<Record<string, number>> = {
  Sun: 300, Moon: 360, Mars: 300, Mercury: 420, Jupiter: 390, Venus: 330, Saturn: 300,
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

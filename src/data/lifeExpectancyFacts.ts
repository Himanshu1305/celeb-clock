/**
 * Life expectancy at birth — the ONE sourced table used sitewide (audit S13).
 *
 * Source: United Nations, World Population Prospects 2024 — period life expectancy at birth,
 * estimates for 2023 (the latest estimate year; later years are projections). Values fetched
 * Oct 2026 from Our World in Data, which republishes WPP 2024 unchanged for 1950 onwards:
 *   both sexes:   https://ourworldindata.org/grapher/life-expectancy  (column life_expectancy_0, year 2023)
 *   male/female:  https://ourworldindata.org/grapher/female-and-male-life-expectancy-at-birth-in-years
 *                 (columns life_expectancy__sex_{male,female}__age_0__variant_estimates, year 2023)
 * The numbers live in src/data/lifeExpectancyWpp2024.json (also read by scripts/prerender-titles.mjs).
 * Rounded to one decimal. Do not add a country without fetching its WPP 2024 value.
 *
 * Every user-facing national life-expectancy figure, and the longevity calculator's birth
 * baselines (src/services/LongevityCalculationService.ts BIRTH_BASELINES), read from this table.
 */
import WPP_DATA from './lifeExpectancyWpp2024.json';

export interface LifeExpectancyRow { iso3: string; both: number; male: number; female: number }

export const LE_SOURCE = 'UN World Population Prospects 2024';
export const LE_YEAR = 2023;
/** Citation to show next to figures: "UN World Population Prospects 2024, estimate for 2023". */
export const LE_CITATION = `${LE_SOURCE}, estimate for ${LE_YEAR}`;
/** Short inline form. */
export const LE_CITATION_SHORT = '(UN WPP 2024, 2023 estimate)';

export const WPP2024_LIFE_EXPECTANCY: Record<string, LifeExpectancyRow> = WPP_DATA.countries;

/** Look up a country row (accepts a few common aliases). */
const ALIASES: Record<string, string> = {
  USA: 'United States', US: 'United States', 'United States of America': 'United States',
  UK: 'United Kingdom', UAE: 'United Arab Emirates', Macau: 'Macao', Turkiye: 'Turkey', 'Türkiye': 'Turkey',
  'Democratic Republic of Congo': 'DR Congo', "Cote d'Ivoire": "Côte d'Ivoire", Korea: 'South Korea',
};
export function lifeExpectancyFor(country: string): LifeExpectancyRow | undefined {
  return WPP2024_LIFE_EXPECTANCY[country] ?? WPP2024_LIFE_EXPECTANCY[ALIASES[country] ?? ''];
}

/** Strict accessor for pages that hard-depend on a country being in the table. */
export function le(country: string): LifeExpectancyRow {
  const r = lifeExpectancyFor(country);
  if (!r) throw new Error(`No WPP 2024 life expectancy for ${country}`);
  return r;
}

/** "72.0"-style display string (one decimal) for a country's figure. */
export function leYears(country: string, sex: 'both' | 'male' | 'female' = 'both'): string {
  return le(country)[sex].toFixed(1);
}
/** Female minus male, one decimal. */
export function leGap(country: string): string {
  const r = le(country);
  return (r.female - r.male).toFixed(1);
}
/** Difference in both-sexes life expectancy a − b, one decimal. */
export function leDiff(a: string, b: string): string {
  return (le(a).both - le(b).both).toFixed(1);
}

/**
 * A few historical points from the same WPP 2024 series (both sexes), used in page narrative.
 * Fetched Oct 2026 from https://ourworldindata.org/grapher/life-expectancy (1950+ = UN WPP 2024).
 */
export const WPP2024_HISTORY: Record<string, Record<number, number>> = WPP_DATA.history as unknown as Record<string, Record<number, number>>;

/**
 * India headline (kept for existing imports). Same WPP 2024 table — 2023 estimate.
 */
export const INDIA_LIFE_EXPECTANCY = {
  overall: Math.round(WPP2024_LIFE_EXPECTANCY.India.both),   // 72
  overallPrecise: WPP2024_LIFE_EXPECTANCY.India.both,        // 72.0
  male: WPP2024_LIFE_EXPECTANCY.India.male,                  // 70.5
  female: WPP2024_LIFE_EXPECTANCY.India.female,              // 73.6
  historical1947: 32,   // ~32 yrs at Independence (pre-WPP reconstruction; WPP 1950 baseline ≈ 35)
  source: LE_SOURCE,
  refYear: LE_YEAR,
} as const;

/** Inline citation to append after an India life-expectancy figure. */
export const INDIA_LE_CITATION = LE_CITATION_SHORT;

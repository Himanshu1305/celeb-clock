/**
 * Single sourced constant for India's life-expectancy headline figures (BATCH-9 P7).
 *
 * Two pages previously disagreed (/country-comparison showed 72, the /answers explainer
 * showed 70.4). Every USER-FACING India life-expectancy headline now imports from here so
 * they can never drift again. Figures: UN World Population Prospects 2024 Revision (medium
 * variant), reference year 2024 — cross-checked against the UN Data Portal and WPP-2024-based
 * aggregators. Cite inline as "(UN WPP 2024)".
 *
 * NOTE: this is the DISPLAYED headline. The longevity CALCULATION model's per-country baselines
 * in src/services/LongevityCalculationService.ts are a separate statistical input (with their
 * own sourcing + tests) and are intentionally not driven by this constant.
 */
export const INDIA_LIFE_EXPECTANCY = {
  overall: 72,          // both sexes, rounded (72.2 precise)
  overallPrecise: 72.2,
  male: 70.7,
  female: 73.9,
  historical1947: 32,   // ~32 yrs at Independence (pre-WPP reconstruction; WPP 1950 baseline ≈ 35)
  source: 'UN World Population Prospects 2024',
  refYear: 2024,
} as const;

/** Inline citation to append after an India life-expectancy figure. */
export const INDIA_LE_CITATION = '(UN WPP 2024)';

/**
 * Batch 7 (W8): state figures from the latest CDC/NCHS state life tables (opened via
 * WebFetch, 25 Oct 2026): "U.S. State Life Tables, 2022", National Vital Statistics
 * Reports Vol. 74 No. 12, published 4 Dec 2025 —
 * https://www.cdc.gov/nchs/data/nvsr/nvsr74/nvsr74-12.pdf and the NCHS summary
 * https://www.cdc.gov/nchs/blog/posts/2025/12/life-expectancy-increased-in-most-states-in-2022.html
 * (no later state table is listed on cdc.gov/nchs/products/life_tables.htm).
 * Previously this page said "Hawaii ~81, Mississippi lowest ~71, a 10-year gap"; in 2022
 * the lowest state is West Virginia (72.2) and the gap is 7.8 years.
 */
export const US_STATE_LE_SOURCE = {
  label: 'CDC / NCHS, U.S. State Life Tables, 2022 (NVSR Vol. 74, No. 12, Dec 2025)',
  url: 'https://www.cdc.gov/nchs/data/nvsr/nvsr74/nvsr74-12.pdf',
  year: 2022,
};
export const US_STATE_LE_HIGHEST: Array<[string, number]> = [
  ['Hawaii', 80.0], ['Massachusetts', 79.8], ['New Jersey', 79.6], ['New York', 79.5], ['Connecticut', 79.4],
];
export const US_STATE_LE_LOWEST: Array<[string, number]> = [
  ['West Virginia', 72.2], ['Mississippi', 72.6], ['Kentucky', 73.6],
  ['Alabama', 73.8], ['Louisiana', 73.8], ['Oklahoma', 73.8], ['Tennessee', 73.8],
];

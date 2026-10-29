// @ts-check
/**
 * Year muhurat pages (/muhurat/:type/:year, batch 9b) — slugs, titles and descriptions.
 * Plain ES module (no TS, no path aliases) so the page, vitest AND the Node prerender
 * scripts (scripts/prerender-routes.mjs, scripts/prerender-titles.mjs) share one copy:
 * the prerendered <title> must equal the live one.
 */

/** URL slug → engine occasion id. */
export const MUHURAT_YEAR_SLUGS = /** @type {const} */ ({
  marriage: 'marriage',
  'griha-pravesh': 'griha-pravesh',
  'vehicle-purchase': 'vehicle',
  mundan: 'mundan',
  naamkaran: 'naamkaran',
});

/** Years with a precomputed list. */
export const MUHURAT_YEAR_YEARS = [2026, 2027];

/** @type {Record<string, { name: string; short: string; title: (y: number) => string; description: (y: number) => string; h1: (y: number) => string }>} */
export const MUHURAT_YEAR_META = {
  marriage: {
    name: 'Shubh Vivah (marriage)',
    short: 'Marriage',
    h1: y => `Shubh Vivah Muhurat ${y}: Marriage Dates & Timings`,
    title: y => `Shubh Vivah Muhurat ${y} — Marriage Dates & Times | BornClock`,
    description: y => `Every auspicious marriage (vivah) muhurat in ${y}, month by month, with the time window, Nakshatra and Tithi for New Delhi or your own city — and why there are no weddings in Kharmas, Chaturmas or Guru/Shukra Asta.`,
  },
  'griha-pravesh': {
    name: 'Griha Pravesh (house-warming)',
    short: 'Griha Pravesh',
    h1: y => `Griha Pravesh Muhurat ${y}: House-Warming Dates`,
    title: y => `Griha Pravesh Muhurat ${y} — House-Warming Dates | BornClock`,
    description: y => `Auspicious Griha Pravesh (house-warming / new home entry) muhurat dates for ${y}, month by month, with the time window, Nakshatra and Tithi for New Delhi or your own city, and the rules used to choose them.`,
  },
  'vehicle-purchase': {
    name: 'vehicle purchase (car or bike)',
    short: 'Vehicle purchase',
    h1: y => `Vehicle Purchase Muhurat ${y}: Car & Bike Dates`,
    title: y => `Vehicle Purchase Muhurat ${y} — Car & Bike Dates | BornClock`,
    description: y => `Auspicious days and times to buy a car, bike or any vehicle in ${y}, month by month, with Nakshatra and Tithi for New Delhi or your own city — computed from the Panchang.`,
  },
  mundan: {
    name: 'Mundan (first haircut)',
    short: 'Mundan',
    h1: y => `Mundan Muhurat ${y}: Auspicious Dates & Times`,
    title: y => `Mundan Muhurat ${y} — Chudakarana Dates & Times | BornClock`,
    description: y => `Auspicious Mundan (Chudakarana, a child's first haircut) muhurat dates for ${y}, with daytime windows, Nakshatra and Tithi for New Delhi or your own city, and the classical rules behind them.`,
  },
  naamkaran: {
    name: 'Naamkaran (naming ceremony)',
    short: 'Naamkaran',
    h1: y => `Naamkaran Muhurat ${y}: Naming Ceremony Dates`,
    title: y => `Naamkaran Muhurat ${y} — Naming Ceremony Dates | BornClock`,
    description: y => `Auspicious Naamkaran (baby naming ceremony) muhurat dates for ${y}, with forenoon windows, Nakshatra and Tithi for New Delhi or your own city, and the rules used to choose them.`,
  },
};

/** Every prerendered year-muhurat route. */
export function muhuratYearRoutes() {
  return Object.keys(MUHURAT_YEAR_SLUGS).flatMap(s => MUHURAT_YEAR_YEARS.map(y => `/muhurat/${s}/${y}`));
}

import panchangCities from '../../data/panchangCities.json';

/** Batch 7 (W7): slugs of the 50 Panchang cities with /panchang, /rahu-kaal and
 *  /choghadiya pages — same source as scripts/prerender-routes.mjs and the app. */
export const PANCHANG_CITY_SLUGS: ReadonlySet<string> = new Set((panchangCities as { cities: { slug: string }[] }).cities.map(c => c.slug));

/** The 10 cities that also have a Hindi page (/hi/panchang/:city). */
export const HINDI_PANCHANG_SLUGS: ReadonlySet<string> = new Set(['delhi', 'mumbai', 'bengaluru', 'kolkata', 'chennai', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow']);

import indiaDates from '../../data/indiaBornOnDates.json';

/** Dates (slugs like "august-6") that have a /born-on/:slug/india page (>=3 Indian
 *  celebrities) — same source as scripts/prerender-routes.mjs. */
export const INDIA_BORNON_SLUGS: ReadonlySet<string> = new Set((indiaDates as { slug: string }[]).map(d => d.slug));

/** Internal-link helper (Batch 6 SEO): the India page for a date when it exists, else the
 *  global date page — so links never point at an India URL that only redirects. */
export function bornOnIndiaPath(slug: string): string {
  return INDIA_BORNON_SLUGS.has(slug) ? `/born-on/${slug}/india/` : `/born-on/${slug}/`;
}

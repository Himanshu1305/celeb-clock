/**
 * Part AO — host classification for staging/preview guardrails.
 *
 * ONLY the real production hostnames are indexable and allowed to run analytics/ads.
 * Everything else — the separate staging worker, every *.workers.dev preview, localhost —
 * is treated as non-production: it must send `noindex`, serve a disallow-all robots.txt,
 * and never fire third-party tracking or ad tags.
 *
 * This is decided by HOSTNAME at request time, NOT by editing public/robots.txt or page
 * HTML (those ship to production and would de-index the real site). Keep this list tight.
 */
export const PRODUCTION_HOSTS = new Set(['bornclock.com', 'www.bornclock.com']);

export function isProductionHost(hostname: string): boolean {
  return PRODUCTION_HOSTS.has((hostname || '').toLowerCase());
}

/** Disallow-all robots.txt body served for every non-production host. */
export const DISALLOW_ALL_ROBOTS = 'User-agent: *\nDisallow: /\n';

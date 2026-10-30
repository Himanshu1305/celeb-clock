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
import { canonicalPath } from '../src/lib/seo/canonicalPath.js';

export const PRODUCTION_HOSTS = new Set(['bornclock.com', 'www.bornclock.com']);

export function isProductionHost(hostname: string): boolean {
  return PRODUCTION_HOSTS.has((hostname || '').toLowerCase());
}

/** Disallow-all robots.txt body served for every non-production host. */
export const DISALLOW_ALL_ROBOTS = 'User-agent: *\nDisallow: /\n';

/**
 * Batch 11 (GSC): the one canonical host. A request on www.bornclock.com gets a 301 to
 * the same path + query on https://bornclock.com; every other host (the apex, staging,
 * *.workers.dev, localhost) returns null and is served as before. The path is put in its
 * trailing-slash form at the same time (files and /api/ excepted — canonicalPath), so
 * www.bornclock.com/planetary-age is ONE hop to bornclock.com/planetary-age/, not two.
 */
export const CANONICAL_ORIGIN = 'https://bornclock.com';
export function wwwRedirectTarget(url: URL): string | null {
  if ((url.hostname || '').toLowerCase() !== 'www.bornclock.com') return null;
  return `${CANONICAL_ORIGIN}${canonicalPath(url.pathname || '/')}${url.search}`;
}

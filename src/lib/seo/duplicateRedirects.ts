/**
 * Batch 6 (SEO) — permanent redirects for duplicate pages.
 *
 * ONE source of truth for both the Cloudflare Worker (server-side 301, see
 * functions/_worker.ts) and the React router (client-side <Navigate replace>, see
 * src/components/LegacyRedirect.tsx), so the two can never disagree.
 *
 * Retired URL families → the one kept URL for the same intent:
 *   /born-on/:month/:day/personality   → /birthday/:m/:d/        (birthday personality page)
 *   /born-on/:month/:day               → /born-on/:month-:day/   (famous people born on a date)
 *   /birthday/:month-:day              → /born-on/:month-:day/
 *   /biological-age-calculator         → /biological-age/        (the real calculator)
 *   /articles/biological-age-vs-chronological-age → /biological-age-vs-chronological-age/
 *   /life-expectancy-calculator-{usa,uk,australia,canada} → /life-expectancy-{country}/
 * Plus normalisation of KEPT date URLs that were reachable in two spellings:
 *   zero-padded numbers (/birthday/09/04, /born-on/september-04), upper-case month
 *   names, and /born-on/:slug/india for a date that has no India page (→ /born-on/:slug/).
 *
 * Returns the kept path (always with a trailing slash — the canonical form the
 * sitemap uses, so no second redirect hop) or null when the path is not a retired /
 * non-canonical form. Impossible dates (e.g. /born-on/february/30) return null so the
 * Worker's real-404 logic still handles them.
 */
const MONTHS = [
  '', 'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];
// Feb = 29: the leap day has real pages (/born-on/february-29/, /birthday/2/29/).
const MONTH_DAYS = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const STATIC: Record<string, string> = {
  '/biological-age-calculator': '/biological-age/',
  '/articles/biological-age-vs-chronological-age': '/biological-age-vs-chronological-age/',
  '/life-expectancy-calculator-usa': '/life-expectancy-usa/',
  '/life-expectancy-calculator-uk': '/life-expectancy-uk/',
  '/life-expectancy-calculator-australia': '/life-expectancy-australia/',
  '/life-expectancy-calculator-canada': '/life-expectancy-canada/',
};

/** Month name (any case) → 1-12, or 0. */
function monthIndex(name: string): number {
  return MONTHS.indexOf(name.toLowerCase());
}

/** Valid calendar day for the month (leap day allowed); day string must be 1-2 digits. */
function validDay(month: number, dayStr: string): number | null {
  if (!/^\d{1,2}$/.test(dayStr)) return null;
  const d = parseInt(dayStr, 10);
  return month >= 1 && month <= 12 && d >= 1 && d <= MONTH_DAYS[month] ? d : null;
}

const bornOnSlug = (m: number, d: number) => `${MONTHS[m]}-${d}`;

export interface DuplicateRedirectOptions {
  /** Slugs that have a real /born-on/:slug/india page. When given (the Worker passes
   *  it), an India URL for any other date redirects to the global date page. The client
   *  omits it to keep the 44 KB date index out of the main bundle — BornOnDayIndia
   *  already does that redirect itself. */
  indiaSlugs?: ReadonlySet<string>;
}

export function duplicateRedirect(pathname: string, opts: DuplicateRedirectOptions = {}): string | null {
  // Compare without the trailing slash; output always has one.
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

  const fixed = STATIC[path.toLowerCase()];
  if (fixed) return fixed;

  let m: RegExpMatchArray | null;

  // /born-on/:month/:day/personality → /birthday/:m/:d/
  if ((m = path.match(/^\/born-on\/([a-z]+)\/(\d+)\/personality$/i))) {
    const mo = monthIndex(m[1]);
    const d = validDay(mo, m[2]);
    return d ? `/birthday/${mo}/${d}/` : null;
  }

  // /born-on/:month/:day → /born-on/:month-:day/india/ when that India page exists
  // (the retired page listed Indian celebrities and its canonical already pointed
  // at the India URL), otherwise the global /born-on/:month-:day/.
  if ((m = path.match(/^\/born-on\/([a-z]+)\/(\d+)$/i))) {
    const mo = monthIndex(m[1]);
    const d = validDay(mo, m[2]);
    if (!d) return null;
    const slug = bornOnSlug(mo, d);
    return opts.indiaSlugs?.has(slug) ? `/born-on/${slug}/india/` : `/born-on/${slug}/`;
  }

  // /birthday/:month-:day → /born-on/:month-:day/
  if ((m = path.match(/^\/birthday\/([a-z]+)-(\d+)$/i))) {
    const mo = monthIndex(m[1]);
    const d = validDay(mo, m[2]);
    return d ? `/born-on/${bornOnSlug(mo, d)}/` : null;
  }

  // Kept: /birthday/:m/:d — normalise zero-padded numbers only.
  if ((m = path.match(/^\/birthday\/(\d{1,2})\/(\d{1,2})$/))) {
    const mo = parseInt(m[1], 10);
    const d = validDay(mo, m[2]);
    if (!d) return null;
    const canon = `/birthday/${mo}/${d}`;
    return canon !== path ? `${canon}/` : null;
  }

  // Kept: /born-on/:month-:day[/india] — normalise case / zero-padding, and send an
  // India URL for a date without an India page to the global date page.
  if ((m = path.match(/^\/born-on\/([a-z]+)-(\d+)(\/india)?$/i))) {
    const mo = monthIndex(m[1]);
    const d = validDay(mo, m[2]);
    if (!d) return null;
    const slug = bornOnSlug(mo, d);
    const wantsIndia = !!m[3];
    const keepIndia = wantsIndia && (!opts.indiaSlugs || opts.indiaSlugs.has(slug));
    const canon = keepIndia ? `/born-on/${slug}/india` : `/born-on/${slug}`;
    return canon !== path ? `${canon}/` : null;
  }

  return null;
}

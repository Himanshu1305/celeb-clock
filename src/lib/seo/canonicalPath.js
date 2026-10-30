// Batch 11 (GSC) — the canonical form of an internal link.
//
// Every page is served (and declared canonical, and listed in the sitemap) at its
// TRAILING-SLASH URL; the Worker 301s /privacy → /privacy/. Search Console showed 374
// "Page with redirect" URLs because two thirds of the internal links in the prerendered
// HTML pointed at the non-slash form, so every crawl of a header/footer link cost a
// redirect hop. canonicalPath() turns any internal href into the slash form at the
// source; it is shared by the <Link> wrapper (src/components/seo/CanonicalLink.tsx), the
// prerender safety net (scripts/lib/headDedupe.mjs canonicalizeInternalLinks) and the
// validate-dist rule, so all three agree. Plain JS so node scripts can import it.
//
// Rules — only same-site page paths change:
//   /privacy           → /privacy/
//   /kundali?x=1#faq   → /kundali/?x=1#faq   (query and hash kept)
//   https://bornclock.com/zodiac → https://bornclock.com/zodiac/   (www → apex too)
// Left alone: '/', paths already ending in '/', files (.xml .png .pdf .json …), /api/*,
// pure '#hash' / '?query' links, relative paths, other sites, mailto:/tel:/javascript:.

const FILE_EXT = /\.[a-z0-9]{2,5}$/i;
const SITE_RE = /^(?:https?:)?\/\/(?:www\.)?bornclock\.com(?=$|[/?#])/i;

/** Path part (no query/hash) of an internal page path that needs no slash added. */
function keepsPathAsIs(path) {
  if (path === '' || path === '/' || path.endsWith('/')) return true;
  if (path === '/api' || path.startsWith('/api/')) return true;
  const last = path.slice(path.lastIndexOf('/') + 1);
  return FILE_EXT.test(last);
}

/**
 * Canonical (trailing-slash) form of an internal root-relative path such as
 * '/privacy?x#y'. Anything that is not a root-relative path is returned unchanged.
 * @param {string} href @returns {string}
 */
export function canonicalPath(href) {
  if (typeof href !== 'string' || !href.startsWith('/') || href.startsWith('//')) return href;
  const cut = href.search(/[?#]/);
  const path = cut >= 0 ? href.slice(0, cut) : href;
  const rest = cut >= 0 ? href.slice(cut) : '';
  if (keepsPathAsIs(path)) return href;
  return `${path}/${rest}`;
}

/**
 * Same as canonicalPath, plus absolute / protocol-relative bornclock.com URLs
 * (www folded to the apex). Used on raw HTML hrefs.
 * @param {string} href @returns {string}
 */
export function canonicalHref(href) {
  if (typeof href !== 'string') return href;
  const m = SITE_RE.exec(href);
  if (!m) return canonicalPath(href);
  const rest = href.slice(m[0].length);
  const rooted = rest === '' || rest[0] !== '/' ? `/${rest}` : rest;
  return `https://bornclock.com${canonicalPath(rooted)}`;
}

/**
 * True when `href` is an internal page link that is NOT in canonical form
 * (what validate-dist fails on). @param {string} href @returns {boolean}
 */
export function isNonCanonicalInternalHref(href) {
  if (typeof href !== 'string') return false;
  const h = href.trim();
  if (SITE_RE.test(h)) {
    // www links are non-canonical even when the path is fine.
    if (/^(?:https?:)?\/\/www\./i.test(h)) return true;
    return canonicalHref(h) !== h;
  }
  return canonicalPath(h) !== h;
}

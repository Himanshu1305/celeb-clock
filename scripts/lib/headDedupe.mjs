// Batch 7 (SEO) — HTML head post-processing for prerendered pages.
//
// A prerendered page carries head tags from TWO sources: the static base index.html
// (home canonical, og:url, twitter:url) and react-helmet-async (`data-rh="true"`,
// the page's own <SEO>). The prerender used to rewrite only the FIRST canonical to
// the route's self URL, so every page ended up with two canonicals — and pages whose
// <SEO canonicalUrl> deliberately points elsewhere got two CONFLICTING canonicals.
// It also injected a BreadcrumbList next to the one <SEO> already renders.
//
// finalizeHead() leaves exactly ONE canonical / og:url / twitter:url (the page's own
// Helmet canonical when present, else the self URL — both normalised to absolute
// https://bornclock.com + trailing slash) and removes identical JSON-LD blocks.
// Pure string → string so it can be unit-tested (scripts/__tests__/headDedupe.test.ts).

export const SITE = 'https://bornclock.com';

/** Self URL of a route: absolute, trailing slash ('/' stays '/'). */
export function selfUrl(route) {
  const path = route === '/' ? '/' : String(route).split(/[?#]/)[0].replace(/\/+$/, '') + '/';
  return `${SITE}${path}`;
}

const FILE_EXT = /\.[a-z0-9]{2,5}$/i;

/**
 * Normalise a same-site URL (absolute, protocol-relative or root-relative) to
 * https://bornclock.com/<path>/ . Fragments are dropped, a query is kept. Non-site
 * URLs and file URLs (…/logo.png) are returned unchanged.
 */
export function normalizeSiteUrl(href) {
  if (typeof href !== 'string') return href;
  const raw = href.trim();
  let rest;
  const m = /^(?:https?:)?\/\/(?:www\.)?bornclock\.com(?=$|[/?#])(.*)$/i.exec(raw);
  if (m) rest = m[1];
  else if (raw.startsWith('/') && !raw.startsWith('//')) rest = raw;
  else return href;
  rest = rest.split('#')[0];
  const qi = rest.indexOf('?');
  let path = qi >= 0 ? rest.slice(0, qi) : rest;
  const query = qi >= 0 ? rest.slice(qi) : '';
  if (!path) path = '/';
  if (FILE_EXT.test(path)) return `${SITE}${path}${query}`;
  path = path === '/' ? '/' : path.replace(/\/+$/, '') + '/';
  return `${SITE}${path}${query}`;
}

const attr = (tag, name) => {
  const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i').exec(tag);
  return m ? (m[2] ?? m[3]) : null;
};
const decodeAttr = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const escAttr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const CANONICAL_RE = /<link\b[^>]*\brel\s*=\s*["']canonical["'][^>]*>\s*/gi;
const OG_URL_RE = /<meta\b[^>]*\bproperty\s*=\s*["']og:url["'][^>]*>\s*/gi;
const TW_URL_RE = /<meta\b[^>]*\bname\s*=\s*["']twitter:url["'][^>]*>\s*/gi;
const LD_RE = /<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>\s*/gi;

/**
 * The canonical this page should carry: its Helmet (`data-rh`) canonical if it
 * rendered one (the last, i.e. most specific, wins), else the route's self URL.
 */
export function pickCanonical(html, route) {
  const tags = html.match(CANONICAL_RE) || [];
  const helmet = tags.filter(t => /\bdata-rh\b/i.test(t));
  for (const t of helmet.reverse()) {
    const href = attr(t, 'href');
    if (href && href.trim()) return normalizeSiteUrl(decodeAttr(href));
  }
  return selfUrl(route);
}

/** Replace every tag matching `re` by ONE tag (at the first one's position, else before </head>). */
function collapseTo(html, re, buildTag) {
  const found = html.match(re) || [];
  const hadHelmet = found.some(t => /\bdata-rh\b/i.test(t));
  const tag = buildTag(hadHelmet);
  let first = true;
  let out = html.replace(re, () => {
    if (!first) return '';
    first = false;
    return tag;
  });
  if (first) out = out.replace('</head>', `${tag}</head>`);
  return out;
}

/** Recursively normalise same-site URL strings inside a JSON-LD value. */
function normalizeLd(v) {
  if (typeof v === 'string') return /bornclock\.com/i.test(v) ? normalizeSiteUrl(v) : v;
  if (Array.isArray(v)) return v.map(normalizeLd);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v)) o[k] = normalizeLd(v[k]);
    return o;
  }
  return v;
}

/** Order-independent JSON key, so {a,b} and {b,a} count as identical. */
function stableKey(v) {
  if (Array.isArray(v)) return `[${v.map(stableKey).join(',')}]`;
  if (v && typeof v === 'object') {
    return `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${stableKey(v[k])}`).join(',')}}`;
  }
  return JSON.stringify(v);
}

/**
 * Normalise same-site URLs inside every JSON-LD block and drop blocks identical
 * to an earlier one (same @type and same content). Unparseable blocks are kept as-is.
 */
export function dedupeJsonLd(html) {
  const seen = new Set();
  return html.replace(LD_RE, (full, body) => {
    let data;
    try { data = JSON.parse(body); } catch { return full; }
    const norm = normalizeLd(data);
    const key = stableKey(norm);
    if (seen.has(key)) return '';
    seen.add(key);
    const open = full.slice(0, full.indexOf('>') + 1);
    const trail = /\s*$/.exec(full)[0];
    // Keep a pretty-printed static block's formatting when nothing changed.
    const text = stableKey(data) === key ? body : JSON.stringify(norm);
    return `${open}${text}</script>${trail}`;
  });
}

/**
 * One breadcrumb trail per page. When several (different) BreadcrumbList blocks
 * remain — e.g. the slug-derived one from <SEO> plus a page's own with nicer names —
 * keep the longest trail (ties: the later, page-specific one) and drop the rest.
 */
export function keepOneBreadcrumb(html) {
  const crumbs = [];
  html.replace(LD_RE, (full, body) => {
    try {
      const d = JSON.parse(body);
      if (d && d['@type'] === 'BreadcrumbList') crumbs.push({ full, n: Array.isArray(d.itemListElement) ? d.itemListElement.length : 0 });
    } catch { /* ignore */ }
    return full;
  });
  if (crumbs.length < 2) return html;
  let keep = crumbs[0];
  for (const c of crumbs) if (c.n >= keep.n) keep = c;
  let out = html;
  for (const c of crumbs) if (c !== keep) out = out.replace(c.full, '');
  return out;
}

/** True when the page already carries a BreadcrumbList JSON-LD (any source). */
export function hasJsonLdType(html, type) {
  let found = false;
  html.replace(LD_RE, (full, body) => {
    try {
      const d = JSON.parse(body);
      const list = Array.isArray(d) ? d : (d && d['@graph']) ? d['@graph'] : [d];
      if (list.some(x => x && (x['@type'] === type || (Array.isArray(x['@type']) && x['@type'].includes(type))))) found = true;
    } catch { /* ignore */ }
    return full;
  });
  return found;
}

/**
 * Final head pass for a prerendered page. Returns { html, canonical }.
 * - exactly one <link rel="canonical">, one og:url, one twitter:url, all = canonical
 *   (kept with data-rh when Helmet rendered one, so the client re-render replaces
 *   it instead of adding a second);
 * - identical JSON-LD blocks appear once, and at most one BreadcrumbList remains.
 */
export function finalizeHead(html, route) {
  const canonical = pickCanonical(html, route);
  const c = escAttr(canonical);
  const rh = h => (h ? ' data-rh="true"' : '');
  let out = html;
  out = collapseTo(out, CANONICAL_RE, h => `<link rel="canonical" href="${c}"${rh(h)}>`);
  out = collapseTo(out, OG_URL_RE, h => `<meta property="og:url" content="${c}"${rh(h)}>`);
  out = collapseTo(out, TW_URL_RE, h => `<meta name="twitter:url" content="${c}"${rh(h)}>`);
  out = dedupeJsonLd(out);
  out = keepOneBreadcrumb(out);
  return { html: out, canonical };
}

/** Counts used by validate-dist and the tests. */
export function headStats(html) {
  const canon = html.match(CANONICAL_RE) || [];
  const blocks = [];
  html.replace(LD_RE, (full, body) => {
    try { blocks.push(stableKey(normalizeLd(JSON.parse(body)))); } catch { /* skip */ }
    return full;
  });
  const dupJsonLd = blocks.length - new Set(blocks).size;
  const breadcrumbs = blocks.filter(b => b.includes('"@type":"BreadcrumbList"')).length;
  return {
    canonicals: canon.length,
    canonicalHrefs: canon.map(t => attr(t, 'href')),
    ogUrls: (html.match(OG_URL_RE) || []).length,
    twitterUrls: (html.match(TW_URL_RE) || []).length,
    jsonLdBlocks: blocks.length,
    duplicateJsonLd: dupJsonLd,
    breadcrumbLists: breadcrumbs,
  };
}

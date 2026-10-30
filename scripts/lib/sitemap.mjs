// Batch 11 (GSC) — sitemap building blocks, pure so they can be unit-tested
// (scripts/__tests__/sitemap.test.ts). Used by scripts/generate-sitemap.mjs and
// scripts/validate-dist.mjs.
//
// 1. SECTIONS: /sitemap.xml is a sitemap INDEX that lists one sitemap per site section
//    (sitemap-core.xml, sitemap-vedic.xml, …) so Search Console reports indexing per
//    section. robots.txt keeps pointing at /sitemap.xml (it is never edited).
// 2. REAL <lastmod>: each page's main content (prerendered HTML: title, description and
//    the text inside <main>, minus scripts, header/footer/nav and the parts the Worker
//    swaps daily) is hashed. The hashes + lastmod dates are published as
//    /sitemap-manifest.json; the next build fetches the live one and keeps a page's old
//    lastmod when its hash is unchanged, else uses the build date. Daily pages get the
//    build date. Without a previous manifest the build's git commit date is used.
import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { pageLangForPath } from '../../src/lib/seo/pageLang.js';

export const BASE_URL = 'https://bornclock.com';
export const MANIFEST_FILE = 'sitemap-manifest.json';
/** Bump when pageContentForHash changes, so old hashes are not compared with new ones. */
export const HASH_VERSION = 1;

/** Section sitemaps, in index order. `file` is served at the site root. */
export const SECTIONS = [
  { id: 'core', file: 'sitemap-core.xml' },
  { id: 'vedic', file: 'sitemap-vedic.xml' },
  { id: 'panchang', file: 'sitemap-panchang.xml' },
  { id: 'celebrity', file: 'sitemap-celebrity.xml' },
  { id: 'birthday', file: 'sitemap-birthday.xml' },
  { id: 'hindi', file: 'sitemap-hindi.xml' },
  { id: 'articles', file: 'sitemap-articles.xml' },
];

const first = r => '/' + (r.split('/')[1] || '');
const VEDIC_FIRST = new Set([
  '/kundali', '/kundali-match', '/kundli-milan-by-name', '/rashifal', '/rashifal-by-date-of-birth', '/nakshatra',
  '/planet-in-sign', '/planet-in-house', '/yoga', '/divisional-charts', '/transit', '/sade-sati', '/muhurat',
  '/remedies', '/baby-names', '/vedic-astrology', '/vedic-zodiac', '/gemstones', '/rashi-ratna', '/vrat',
  '/festivals', '/eclipses', '/mercury-retrograde', '/dasha-calculator', '/manglik', '/kaal-sarp-dosha',
  '/pitra-dosha', '/mool-dosha', '/grahan-dosha', '/nadi-dosha', '/career-report', '/life-report',
  '/child-kundli', '/astrologer', '/janma-tithi-calculator', '/moon-sign', '/sun-vs-moon-sign', '/glossary',
  '/marriage-biodata-maker',
]);
const PANCHANG_FIRST = new Set(['/panchang', '/rahu-kaal', '/choghadiya', '/panchang-calendar', '/planets-today', '/moon-phase']);
const ARTICLE_FIRST = new Set(['/articles', '/blog', '/answers']);
const CELEB_FIRST = new Set(['/celebrity', '/born-on', '/todays-birthdays', '/celebrity-birthday', '/on-this-day']);
const BIRTHDAY_FIRST = new Set([
  '/birthday', '/birthday-report', '/birthday-countdown', '/birthday-fun', '/age-calculator', '/age-in-days',
  '/age-in-seconds', '/generation', '/planetary-age', '/weight-on-planets', '/birthstone', '/wish', '/gift',
  '/diwali-gift', '/reminders',
]);

/** Section id of a route (no trailing slash, '/' for home). */
export function sectionOf(route) {
  if (pageLangForPath(route) === 'hi') return 'hindi';
  const f = first(route);
  if (PANCHANG_FIRST.has(f)) return 'panchang';
  if (ARTICLE_FIRST.has(f)) return 'articles';
  if (CELEB_FIRST.has(f) || f.startsWith('/born-in')) return 'celebrity';
  if (BIRTHDAY_FIRST.has(f)) return 'birthday';
  if (VEDIC_FIRST.has(f)) return 'vedic';
  return 'core';
}

/** Canonical sitemap path of a route: trailing slash, '/' for home. */
export const locPath = route => (route === '/' ? '/' : route.replace(/\/+$/, '') + '/');

const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * The part of a prerendered page whose change means "the page changed": the <title> and
 * the visible text of <main> (else the whole body without header/nav/footer). The meta
 * description is left out: on a few pages the prerender captures either the static or the
 * page's own description depending on timing, which would fake a change. Removed first: scripts, styles, SVG, comments, and every element
 * the Worker refreshes daily (data-daily="…"). The build date written out in full
 * ("30 October 2026", "October 30, 2026", "2026-10-30") is masked too, so a page that
 * merely prints "today" does not count as changed. Whitespace is collapsed.
 */
export function pageContentForHash(html, buildDate) {
  const h = String(html);
  const title = /<title>([^<]*)<\/title>/i.exec(h)?.[1] ?? '';
  let body;
  const ms = h.search(/<main\b/i);
  const me = h.lastIndexOf('</main>');
  if (ms >= 0 && me > ms) body = h.slice(ms, me);
  else {
    const bs = h.search(/<body\b/i);
    body = bs >= 0 ? h.slice(bs) : h;
    body = body.replace(/<(header|nav|footer)\b[\s\S]*?<\/\1>/gi, ' ');
  }
  body = body
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    // Daily blocks: <span data-daily="h1|date">…</span>, <div data-daily="body">…</div> (no nested div by contract).
    .replace(/<(span|div|p|time|h[1-6])\b[^>]*\bdata-daily=["'][^"']*["'][^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  let text = decode(`${title}\n${body}`);
  if (buildDate && /^\d{4}-\d{2}-\d{2}$/.test(buildDate)) {
    const [y, m, d] = buildDate.split('-').map(Number);
    const mon = MONTHS[m - 1];
    for (const v of [buildDate, `${d} ${mon} ${y}`, `${mon} ${d}, ${y}`, `${d} ${mon.slice(0, 3)} ${y}`, `${mon.slice(0, 3)} ${d}, ${y}`]) {
      text = text.split(v).join('{date}');
    }
  }
  return text.replace(/\s+/g, ' ').trim();
}

export const contentHash = (html, buildDate) =>
  createHash('sha256').update(pageContentForHash(html, buildDate)).digest('hex').slice(0, 20);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The previous manifest's entries ({ [locPath]: { h, m } }), or null when it is missing,
 * malformed or made with another HASH_VERSION (then nothing is compared).
 */
export function parseManifest(json) {
  try {
    const d = typeof json === 'string' ? JSON.parse(json) : json;
    if (!d || d.v !== HASH_VERSION || !d.urls || typeof d.urls !== 'object') return null;
    const out = {};
    for (const [k, e] of Object.entries(d.urls)) {
      if (e && typeof e.h === 'string' && typeof e.m === 'string' && ISO_DATE.test(e.m)) out[k] = { h: e.h, m: e.m };
    }
    return out;
  } catch { return null; }
}

/**
 * lastmod for one page.
 *   daily page                          → buildDate
 *   hash equals the previous hash        → previous lastmod (never later than buildDate)
 *   no HTML to hash, previous known      → previous lastmod
 *   previous manifest available          → buildDate (new or changed page)
 *   no previous manifest                 → fallbackDate (git commit date of the build)
 */
export function resolveLastmod({ hash, prev, daily, havePrevManifest, buildDate, fallbackDate }) {
  if (daily) return buildDate;
  if (prev && ((hash && prev.h === hash) || !hash)) return prev.m > buildDate ? buildDate : prev.m;
  if (havePrevManifest) return buildDate;
  return fallbackDate || buildDate;
}

const escapeXml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** <urlset> for entries [{ loc, lastmod, changefreq, priority }]. */
export function urlsetXml(entries) {
  const rows = entries.map(e =>
    `  <url><loc>${escapeXml(BASE_URL + e.loc)}</loc><lastmod>${e.lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>\n`;
}

/** <sitemapindex> for [{ file, lastmod }]. */
export function sitemapIndexXml(files) {
  const rows = files.map(f => `  <sitemap><loc>${BASE_URL}/${f.file}</loc><lastmod>${f.lastmod}</lastmod></sitemap>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</sitemapindex>\n`;
}

const locsOf = xml => [...String(xml).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(/&amp;/g, '&'));

/** Child sitemap file names listed by dist/sitemap.xml (an index), or [] if it is a urlset. */
export function indexChildren(dist) {
  const p = join(dist, 'sitemap.xml');
  if (!existsSync(p)) return [];
  const xml = readFileSync(p, 'utf8');
  if (!/<sitemapindex\b/.test(xml)) return [];
  return locsOf(xml).map(u => u.replace(`${BASE_URL}/`, ''));
}

/** Every page URL in the sitemap (following the index into its children). */
export function readSitemapUrls(dist) {
  const p = join(dist, 'sitemap.xml');
  if (!existsSync(p)) return [];
  const xml = readFileSync(p, 'utf8');
  if (!/<sitemapindex\b/.test(xml)) return locsOf(xml);
  return indexChildren(dist).flatMap(f => (existsSync(join(dist, f)) ? locsOf(readFileSync(join(dist, f), 'utf8')) : []));
}

/** Problems with the built sitemap (validate-dist V12); [] when it is fine. */
export function sitemapProblems(dist, today = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10)) {
  const problems = [];
  const p = join(dist, 'sitemap.xml');
  if (!existsSync(p)) return ['dist/sitemap.xml missing'];
  const xml = readFileSync(p, 'utf8');
  if (!/<sitemapindex\b/.test(xml)) return ['sitemap.xml is not a sitemap index'];
  const children = indexChildren(dist);
  if (!children.length) problems.push('sitemap index lists no sitemaps');
  const seen = new Map();
  for (const f of children) {
    const fp = join(dist, f);
    if (!/^sitemap-[a-z]+\.xml$/.test(f)) { problems.push(`unexpected child sitemap ${f}`); continue; }
    if (!existsSync(fp)) { problems.push(`${f} listed in the index but missing`); continue; }
    const cx = readFileSync(fp, 'utf8');
    const rows = [...cx.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)];
    if (!rows.length) problems.push(`${f} has no URLs`);
    if (rows.length > 50000) problems.push(`${f} has ${rows.length} URLs (> 50,000)`);
    for (const [, loc, lastmod] of rows) {
      if (seen.has(loc)) problems.push(`${loc} in ${seen.get(loc)} and ${f}`);
      seen.set(loc, f);
      const path = loc.startsWith(BASE_URL) ? loc.slice(BASE_URL.length) : null;
      if (path === null || !path.startsWith('/') || (path !== '/' && !path.endsWith('/'))) problems.push(`non-canonical loc ${loc}`);
      if (!ISO_DATE.test(lastmod) || lastmod > today) problems.push(`${loc}: bad lastmod ${lastmod}`);
    }
  }
  const mp = join(dist, MANIFEST_FILE);
  if (!existsSync(mp)) problems.push(`${MANIFEST_FILE} missing`);
  else {
    const m = parseManifest(readFileSync(mp, 'utf8'));
    if (!m) problems.push(`${MANIFEST_FILE} unreadable`);
    else {
      const missing = [...seen.keys()].filter(loc => !m[loc.slice(BASE_URL.length)]);
      if (missing.length) problems.push(`${missing.length} sitemap URLs missing from ${MANIFEST_FILE} (e.g. ${missing[0]})`);
    }
  }
  return problems.slice(0, 50);
}

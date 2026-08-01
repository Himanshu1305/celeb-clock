#!/usr/bin/env node
/**
 * scripts/seo-audit.mjs — mechanized full-site SEO/AEO audit over the built dist/.
 *
 * Iterates every dist/**​/index.html, extracts SEO signals, and emits
 * docs/SEO-AUDIT-FINDINGS.csv (one row per page per issue) plus a console scorecard.
 * Checks: T1–T7 (technical), S1–S4 (schema), L1–L4 (link graph), M1–M4 (sitemap),
 * A1–A2 (assets), C1–C2 (content). See docs/SEO-AUDIT-PROMPT.md for definitions.
 *
 * Usage: node scripts/seo-audit.mjs   (run AFTER a full production build)
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const BASE = 'https://bornclock.com';
const SIGNS = new Set(['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces']);
const MONEY_PAGES = new Set(['/gift', '/coach', '/birthday-report', '/upgrade', '/pricing', '/life-expectancy']);

// ── Route matchers from App.tsx (so client-only routes aren't flagged as broken) ─
function loadRoutePatterns() {
  const app = readFileSync('src/App.tsx', 'utf8');
  const paths = [...app.matchAll(/path="([^"]+)"/g)].map(m => m[1]).filter(p => p !== '*');
  const statics = new Set();
  const regexes = [];
  for (const p of paths) {
    if (p.includes(':')) {
      regexes.push(new RegExp('^' + p.replace(/:[^/]+/g, '[^/]+').replace(/\//g, '\\/') + '$'));
    } else {
      statics.add(p.replace(/\/$/, '') || '/');
    }
  }
  return { statics, regexes };
}
const ROUTES = loadRoutePatterns();

// ── Redirect sources (must never be linked-to, sitemapped, or served 200) ────────
const STATIC_REDIRECTS = new Set(['/methodology', '/rising-sign-calculator']);
function isRedirectSource(path) {
  const p = path.replace(/\/$/, '') || '/';
  if (STATIC_REDIRECTS.has(p)) return true;
  const m = p.match(/^\/compatibility\/([a-z]+)\/([a-z]+)$/);
  if (m && SIGNS.has(m[1]) && SIGNS.has(m[2]) && m[1] > m[2]) return true; // reverse alphabetical
  return false;
}

function isDeclaredRoute(path) {
  const p = path.replace(/\/$/, '') || '/';
  if (ROUTES.statics.has(p)) return true;
  return ROUTES.regexes.some(re => re.test(p));
}

// ── dist walk + route derivation ─────────────────────────────────────────────────
function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (e === 'index.html') acc.push(p);
  }
  return acc;
}
const routeOf = file => {
  const r = '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\/$/, '');
  return r === '' ? '/' : r;
};
const canonicalFor = route => (route === '/' ? BASE + '/' : BASE + route + '/');

// ── HTML extraction (regex; dist is machine-generated so this is stable) ──────────
const attr = (tag, name) => (tag.match(new RegExp(name + '=["\\\']([^"\\\']*)["\\\']')) || [])[1];
const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

function extract(html) {
  const grab = (re) => [...html.matchAll(re)].map(m => m[0]);
  const titles = [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].map(m => decode(m[1].trim()));
  const canonicals = [...new Set(grab(/<link[^>]+rel=["']canonical["'][^>]*>/gi).map(t => attr(t, 'href')).filter(Boolean))];
  const descs = [...new Set(grab(/<meta[^>]+name=["']description["'][^>]*>/gi).map(t => attr(t, 'content')).filter(x => x !== undefined))];
  const h1s = (html.match(/<h1[\s>]/gi) || []).length;
  const robots = grab(/<meta[^>]+name=["']robots["'][^>]*>/gi).map(t => attr(t, 'content'));
  const ogImages = [...new Set(grab(/<meta[^>]+property=["']og:image["'][^>]*>/gi).map(t => attr(t, 'content')).filter(Boolean))];
  const ogTitle = (grab(/<meta[^>]+property=["']og:title["'][^>]*>/gi)[0] || '');
  const ogDesc = (grab(/<meta[^>]+property=["']og:description["'][^>]*>/gi)[0] || '');
  const ldBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1].trim());
  const hrefs = [...html.matchAll(/<a\s[^>]*href=["']([^"']+)["']/gi)].map(m => m[1]);
  // main content text: strip non-content regions
  let body = (html.match(/<body[\s\S]*?<\/body>/i) || [''])[0];
  body = body
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ');
  const text = body.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
  return {
    title: titles[0] || '', titleCount: titles.length,
    canonicals, desc: descs[0] ?? '', descCount: descs.length,
    h1s, robots, ogImages, ogTitle: attr(ogTitle, 'content') || '', ogDesc: attr(ogDesc, 'content') || '',
    ldBlocks, hrefs, text, words: text ? text.split(' ').length : 0,
  };
}

function normLink(href) {
  if (!href) return null;
  if (href.startsWith(BASE)) href = href.slice(BASE.length) || '/';
  if (/^https?:\/\//i.test(href)) return null;               // external
  if (/^(mailto:|tel:|#|javascript:)/i.test(href)) return null;
  href = href.split('#')[0].split('?')[0];
  if (!href.startsWith('/')) return null;
  if (href.startsWith('/api/') || href.startsWith('/og/')) return null;
  const p = href.replace(/\/$/, '') || '/';
  return p;
}

// ── Run ───────────────────────────────────────────────────────────────────────────
if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/ not built — run `npm run build` first.');
  process.exit(1);
}
const files = walk(DIST);
const pages = new Map();          // route -> extracted
for (const f of files) pages.set(routeOf(f), extract(readFileSync(f, 'utf8')));
const routeSet = new Set(pages.keys());

// sitemap
const sitemapXml = existsSync(join(DIST, 'sitemap.xml')) ? readFileSync(join(DIST, 'sitemap.xml'), 'utf8') : '';
const sitemapLocs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const sitemapRoutes = new Set(sitemapLocs.map(l => (l.replace(BASE, '').replace(/\/$/, '') || '/')));

const findings = [];
const add = (route, check, severity, detail) => findings.push({ route, check, severity, detail });

// aggregate maps for duplicate detection
const titleMap = new Map();       // title -> [routes]
const descMap = new Map();
const first200Map = new Map();
const faqSetMap = new Map();      // stringified FAQ questions -> [routes]

// link graph
const inDegree = new Map([...routeSet].map(r => [r, 0]));
const adj = new Map();            // route -> Set(prerendered targets)

for (const [route, p] of pages) {
  const selfCanon = canonicalFor(route);
  const inSitemap = sitemapRoutes.has(route);

  // T1 canonical
  if (p.canonicals.length === 0) add(route, 'T1', 1, 'canonical missing');
  else {
    if (p.canonicals.length > 1) add(route, 'T1b', 3, `multiple distinct canonical tags: ${p.canonicals.join(' | ')}`);
    const c = p.canonicals[0];
    if (!c) add(route, 'T1', 1, 'canonical empty');
    else if (c !== selfCanon) {
      const sev = (c === BASE + '/' && route !== '/') ? 1 : 2;
      add(route, 'T1', sev, `canonical ${c} ≠ self ${selfCanon}${sev === 1 ? ' (points at HOMEPAGE)' : ''}`);
    }
  }
  // T2 title length (dupes handled after loop)
  if (p.title) {
    if (p.title.length < 30) add(route, 'T2', 3, `title ${p.title.length} chars (<30): "${p.title}"`);
    if (p.title.length > 65) add(route, 'T2', 3, `title ${p.title.length} chars (>65): "${p.title}"`);
    (titleMap.get(p.title) || titleMap.set(p.title, []).get(p.title)).push(route);
  } else add(route, 'T2', 2, 'title missing');
  // T3 description
  if (!p.desc) add(route, 'T3', 2, 'meta description missing');
  else {
    if (p.desc.length < 70) add(route, 'T3', 3, `desc ${p.desc.length} chars (<70)`);
    if (p.desc.length > 165) add(route, 'T3', 3, `desc ${p.desc.length} chars (>165)`);
    (descMap.get(p.desc) || descMap.set(p.desc, []).get(p.desc)).push(route);
  }
  // T4 h1
  if (p.h1s !== 1) add(route, 'T4', p.h1s === 0 ? 2 : 3, `h1 count = ${p.h1s}`);
  // T5 robots noindex in sitemap
  if (p.robots.some(r => /noindex/i.test(r || '')) && inSitemap) add(route, 'T5', 1, `noindex but IN sitemap: ${p.robots.join(',')}`);
  // T7 brand suffix count
  if (p.title) {
    const n = (p.title.match(/\| BornClock/g) || []).length;
    if (n !== 1) add(route, 'T7', n > 1 ? 2 : 3, `"| BornClock" appears ${n}× in title`);
  }

  // S1 JSON-LD parse
  let faqCount = 0, faqQuestions = null;
  for (const b of p.ldBlocks) {
    try {
      const j = JSON.parse(b);
      const arr = Array.isArray(j) ? j : [j];
      for (const node of arr) {
        const t = node['@type'];
        if (t === 'FAQPage' && Array.isArray(node.mainEntity)) {
          faqCount = node.mainEntity.length;
          faqQuestions = node.mainEntity.map(q => q.name).join(' | ');
        }
        if (t === 'BreadcrumbList' && Array.isArray(node.itemListElement)) {
          for (const it of node.itemListElement) {
            const u = it.item?.['@id'] || it.item;
            if (typeof u === 'string' && u.startsWith(BASE)) {
              const bp = u.replace(BASE, '').replace(/\/$/, '') || '/';
              if (!routeSet.has(bp) && !isDeclaredRoute(bp)) add(route, 'S3', 2, `breadcrumb item 404s: ${u}`);
            }
          }
        }
      }
    } catch (e) {
      add(route, 'S1', 1, `JSON-LD parse error: ${String(e.message).slice(0, 80)}`);
    }
  }
  // S2 FAQ thin / duplicate
  if (faqQuestions !== null) {
    if (faqCount < 2) add(route, 'S2', 3, `FAQPage has ${faqCount} question(s)`);
    (faqSetMap.get(faqQuestions) || faqSetMap.set(faqQuestions, []).get(faqQuestions)).push(route);
  }
  // S4 money page / hub with no schema
  if (MONEY_PAGES.has(route) && p.ldBlocks.length === 0) add(route, 'S4', 2, 'money page has no JSON-LD schema');

  // A1 og:image resolves
  for (const img of p.ogImages) {
    if (img.startsWith(BASE + '/og/report/')) continue; // dynamic worker route
    const rel = img.replace(BASE + '/', '');
    if (!existsSync(join(DIST, rel))) add(route, 'A1', 2, `og:image not in dist: ${img}`);
  }
  // A2 og gaps
  if (!p.ogTitle) add(route, 'A2', 3, 'og:title missing');
  if (!p.ogDesc) add(route, 'A2', 3, 'og:description missing');

  // C1 thin
  if (p.words < 150) add(route, 'C1', 3, `${p.words} words of main content (<150)`);
  // C2 first-200 identical
  const f200 = p.text.slice(0, 200);
  if (f200.length >= 200) (first200Map.get(f200) || first200Map.set(f200, []).get(f200)).push(route);

  // link graph + L1/L2
  const targets = new Set();
  for (const href of p.hrefs) {
    const t = normLink(href);
    if (t === null) continue;
    if (isRedirectSource(t)) { add(route, 'L2', 2, `links through redirect source: ${t}`); continue; }
    if (routeSet.has(t)) { targets.add(t); continue; }
    if (!isDeclaredRoute(t)) add(route, 'L1', 2, `broken internal link (no route): ${t}`);
  }
  adj.set(route, targets);
  for (const t of targets) inDegree.set(t, (inDegree.get(t) || 0) + 1);

  // M-side per page
  if (!inSitemap && p.robots.every(r => !/noindex/i.test(r || ''))) add(route, 'M2', 2, 'prerendered page missing from sitemap');
}

// duplicate titles / descs / faq
for (const [title, rs] of titleMap) if (rs.length > 1) for (const r of rs) add(r, 'T2', 2, `duplicate title (${rs.length}×): "${title.slice(0, 60)}"`);
for (const [desc, rs] of descMap) if (rs.length > 1) for (const r of rs) add(r, 'T3', 2, `duplicate description (${rs.length}×)`);
for (const [q, rs] of faqSetMap) if (rs.length > 5) add(rs[0], 'S2', 3, `identical FAQ set on ${rs.length} pages (thin-schema signal): e.g. ${rs.slice(0, 3).join(', ')}`);
for (const [f, rs] of first200Map) if (rs.length > 1) add(rs[0], 'C2', 3, `first-200-chars identical across ${rs.length} pages: e.g. ${rs.slice(0, 4).join(', ')}`);

// sitemap hygiene
for (const r of sitemapRoutes) {
  if (!routeSet.has(r)) add(r, 'M1', 2, 'sitemap URL has no dist/ page (ghost)');
  if (isRedirectSource(r)) add(r, 'M3', 1, 'sitemap URL is a REDIRECT SOURCE (must be removed)');
}
for (const loc of sitemapLocs) {
  if (!loc.startsWith('https://bornclock.com/')) add(loc, 'M4', 2, `sitemap loc wrong host/scheme: ${loc}`);
  else if (loc !== BASE + '/' && !loc.endsWith('/')) add(loc, 'M4', 3, `sitemap loc missing trailing slash: ${loc}`);
}

// L3 orphans + L4 depth (BFS from '/')
for (const [route, deg] of inDegree) {
  if (route === '/') continue;
  if (deg === 0) add(route, 'L3', 3, 'orphan: 0 inbound internal links');
}
const depth = new Map([['/', 0]]);
const q = ['/'];
while (q.length) {
  const u = q.shift();
  for (const v of (adj.get(u) || [])) if (!depth.has(v)) { depth.set(v, depth.get(u) + 1); q.push(v); }
}
for (const route of routeSet) {
  const d = depth.get(route);
  if (d === undefined) { /* unreachable → already an orphan or deeper */ }
  else if (d > 3) add(route, 'L4', 3, `${d} clicks from homepage (>3)`);
}
for (const route of routeSet) if (route !== '/' && !depth.has(route)) add(route, 'L4', 3, 'unreachable from homepage via internal links');

// ── Emit ────────────────────────────────────────────────────────────────────────
findings.sort((a, b) => a.severity - b.severity || a.check.localeCompare(b.check) || a.route.localeCompare(b.route));
const esc = s => `"${String(s).replace(/"/g, '""')}"`;
const csv = ['route,check,severity,detail', ...findings.map(f => [f.route, f.check, f.severity, esc(f.detail)].join(','))].join('\n');
writeFileSync('docs/SEO-AUDIT-FINDINGS.csv', csv);

const byCheck = {};
for (const f of findings) byCheck[f.check] = (byCheck[f.check] || 0) + 1;
const sev1 = findings.filter(f => f.severity === 1).length;

console.log(`\n=== SEO AUDIT — ${pages.size} pages, ${sitemapRoutes.size} sitemap URLs ===`);
console.log(`Total findings: ${findings.length} (SEVERITY-1: ${sev1})`);
console.log('Per check:', JSON.stringify(byCheck, null, 0));
console.log('CSV → docs/SEO-AUDIT-FINDINGS.csv');

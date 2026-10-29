// Consolidated build validation (sprint validation phases V1-V6, run against the
// static artifact in dist/). Checks each key route's prerendered HTML for:
//   V1 SEO: <title> present and ≤70 chars, canonical link present
//   V2 JSON-LD: at least one application/ld+json block
//   V3 Sitemap: route present in dist/sitemap.xml
//   V6 Smoke: no "undefined" / "[object Object]" leaks in the HTML head/body
//   V7 Head (Batch 7): EVERY prerendered page has exactly one canonical, one og:url,
//      one twitter:url, no JSON-LD block repeated (same @type + same content), and
//      at most one BreadcrumbList
//   V8 Head (Batch 8): EVERY prerendered page has at most one meta description,
//      og:description, twitter:description, og:title, twitter:title and meta title,
//      and at most one top-level Organization, WebSite and WebPage JSON-LD block
//   V9 (Batch 9b): at most one top-level Article (Article/BlogPosting/NewsArticle counted
//      together) and at most one FAQPage JSON-LD block per page
//   V10 (Batch 10): on EVERY prerendered page, each FAQPage question is visible in the
//      body (outside scripts) and each answer is in the HTML (collapsed/hidden is fine) —
//      Google requires FAQ structured data to match visible content. scripts/lib/faqVisible.mjs
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { headStats } from './lib/headDedupe.mjs';
import { faqVisibilityProblems } from './lib/faqVisible.mjs';

const DIST = 'dist';
const ROUTES = [
  '/', '/birthday-report', '/longevity-calculator',
  '/wish', '/birthday-report/gift', '/compatibility',
  '/todays-birthdays', '/for-business',
  '/kundali', '/kundali-match', '/baby-names', '/diwali-gift', '/reminders',
  '/hi/rashifal/vrischika', '/birthday/8/6',
  '/articles/kundali-compatibility',
  '/celebrity/virat-kohli', '/celebrity/srila-prabhupada', '/celebrity/shah-rukh-khan',
  '/born-on/august-6/india', '/articles', '/numerology/7',
];

const htmlPath = (route) => {
  const clean = route === '/' ? '/index' : route.replace(/\/$/, '');
  const p1 = resolve(DIST, `.${clean}.html`);
  const p2 = resolve(DIST, `.${clean}/index.html`);
  if (existsSync(p1)) return p1;
  if (existsSync(p2)) return p2;
  return null;
};

const sitemap = existsSync(resolve(DIST, 'sitemap.xml'))
  ? readFileSync(resolve(DIST, 'sitemap.xml'), 'utf8') : '';

let pass = 0, fail = 0;
const results = [];
for (const route of ROUTES) {
  const file = htmlPath(route);
  if (!file) { results.push(`  ❌ ${route}: no prerendered HTML found`); fail++; continue; }
  const html = readFileSync(file, 'utf8');
  const problems = [];

  const decode = (s) => s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
  const titleM = /<title>([^<]*)<\/title>/.exec(html);
  const title = titleM ? decode(titleM[1]) : '';
  if (!title) problems.push('no <title>');
  else if (title.length > 70) problems.push(`title ${title.length}c > 70`);

  const hs = headStats(html);
  if (hs.canonicals !== 1) problems.push(`${hs.canonicals} canonicals`);
  if (!html.includes('application/ld+json')) problems.push('no JSON-LD');

  const head = html.slice(0, 12000);
  if (head.includes('>undefined<') || / undefined[ "<]/.test(title)) problems.push('undefined leak');
  if (html.includes('[object Object]')) problems.push('[object Object] leak');

  const inSitemap = sitemap.includes(`${route}/`) || sitemap.includes(`${route}<`) || sitemap.includes(route);
  if (!inSitemap && route !== '/birthday-report/gift') problems.push('missing from sitemap');

  if (problems.length) { results.push(`  ❌ ${route}: ${problems.join(', ')}`); fail++; }
  else { results.push(`  ✅ ${route} — "${title}" (${title.length}c)`); pass++; }
}

// V7 — sweep every prerendered index.html under dist/.
const headProblems = [];
const faqProblems = [];
let swept = 0;
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!['assets', 'og', 'daily'].includes(e.name) || dir !== DIST) walk(p); }
    else if (e.name === 'index.html') {
      swept++;
      const html = readFileSync(p, 'utf8');
      const s = headStats(html);
      const fp = faqVisibilityProblems(html);
      if (fp.length) faqProblems.push(`${p.slice(DIST.length) || '/'}: ${fp.length} (${fp.slice(0, 2).map(x => `${x.kind} "${x.text.slice(0, 50)}"`).join('; ')})`);
      const bad = [];
      if (s.canonicals !== 1) bad.push(`${s.canonicals} canonicals`);
      if (s.ogUrls > 1) bad.push(`${s.ogUrls} og:url`);
      if (s.twitterUrls > 1) bad.push(`${s.twitterUrls} twitter:url`);
      if (s.duplicateJsonLd > 0) bad.push(`${s.duplicateJsonLd} duplicate JSON-LD`);
      if (s.breadcrumbLists > 1) bad.push(`${s.breadcrumbLists} BreadcrumbLists`);
      for (const [k, n] of Object.entries(s.meta)) if (n > 1) bad.push(`${n} ${k} meta`);
      for (const [k, n] of Object.entries(s.entityBlocks)) if (n > 1) bad.push(`${n} ${k} JSON-LD`);
      if (bad.length) headProblems.push(`${p.slice(DIST.length) || '/'}: ${bad.join(', ')}`);
    }
  }
};
if (existsSync(DIST)) walk(DIST);
if (headProblems.length) {
  fail++;
  results.push(`  ❌ head check: ${headProblems.length} of ${swept} pages — ${headProblems.slice(0, 15).join(' | ')}`);
} else {
  results.push(`  ✅ head check: ${swept} prerendered pages — one canonical each, no duplicate JSON-LD, ≤1 BreadcrumbList, one description/og/twitter title+description, one Organization/WebSite/WebPage/Article/FAQPage`);
}

if (faqProblems.length) {
  fail++;
  results.push(`  ❌ FAQ visibility: ${faqProblems.length} of ${swept} pages have FAQPage Q&As not shown on the page — ${faqProblems.slice(0, 15).join(' | ')}`);
} else {
  results.push(`  ✅ FAQ visibility: every FAQPage question is visible and every answer is in the HTML on all ${swept} pages`);
}

console.log(results.join('\n'));
console.log(`\n${fail === 0 ? '✅' : '❌'} Validation: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);

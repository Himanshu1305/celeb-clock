// Consolidated build validation (sprint validation phases V1-V6, run against the
// static artifact in dist/). Checks each key route's prerendered HTML for:
//   V1 SEO: <title> present and ≤70 chars, canonical link present
//   V2 JSON-LD: at least one application/ld+json block
//   V3 Sitemap: route present in dist/sitemap.xml
//   V6 Smoke: no "undefined" / "[object Object]" leaks in the HTML head/body
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const DIST = 'dist';
const ROUTES = [
  '/', '/birthday-report', '/longevity-calculator',
  '/wish', '/birthday-report/gift', '/compatibility',
  '/todays-birthdays', '/for-business',
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

  if (!/rel="canonical"/.test(html)) problems.push('no canonical');
  if (!html.includes('application/ld+json')) problems.push('no JSON-LD');

  const head = html.slice(0, 12000);
  if (head.includes('>undefined<') || / undefined[ "<]/.test(title)) problems.push('undefined leak');
  if (html.includes('[object Object]')) problems.push('[object Object] leak');

  const inSitemap = sitemap.includes(`${route}/`) || sitemap.includes(`${route}<`) || sitemap.includes(route);
  if (!inSitemap && route !== '/birthday-report/gift') problems.push('missing from sitemap');

  if (problems.length) { results.push(`  ❌ ${route}: ${problems.join(', ')}`); fail++; }
  else { results.push(`  ✅ ${route} — "${title}" (${title.length}c)`); pass++; }
}

console.log(results.join('\n'));
console.log(`\n${fail === 0 ? '✅' : '❌'} Validation: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);

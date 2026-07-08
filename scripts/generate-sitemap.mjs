#!/usr/bin/env node
/**
 * Generate sitemap.xml from prerender-routes.mjs.
 * Writes to dist/sitemap.xml after the prerender run.
 * Also copies to public/sitemap.xml so it's accessible via Workers assets.
 */

import { writeFileSync, copyFileSync, mkdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');
const PUBLIC = join(ROOT, 'public');
const TODAY = '2026-07-09';
const BASE_URL = 'https://bornclock.com';

function priority(route) {
  if (route === '/') return '1.0';
  if (route.startsWith('/zodiac/') || route.startsWith('/numerology/') ||
      route.startsWith('/chinese-zodiac/') || route.startsWith('/vedic-zodiac/') ||
      route.startsWith('/birthstone/')) return '0.8';
  if (route.startsWith('/blog/')) return '0.7';
  if (route.startsWith('/born-on/') && route !== '/born-on') return '0.7';
  if (route.startsWith('/birthday/') && route.split('/').length === 4) return '0.6';
  if (route.startsWith('/birthday/') && route.split('/').length === 3) return '0.7';
  if (route.startsWith('/answers/')) return '0.7';
  if (['/age-calculator','/life-expectancy','/celebrity-birthday','/todays-birthdays',
       '/numerology','/zodiac','/chinese-zodiac','/vedic-zodiac','/birthday','/blog',
       '/birthstone','/planetary-age','/biological-age','/generation'].includes(route)) return '0.9';
  return '0.6';
}

function changefreq(route) {
  if (route === '/') return 'daily';
  if (route.startsWith('/blog/')) return 'monthly';
  if (route.startsWith('/birthday/') && route.split('/').length === 4) return 'monthly';
  if (route.startsWith('/born-on/')) return 'monthly';
  return 'weekly';
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function main() {
  const { getAllRoutes } = await import('./prerender-routes.mjs');
  const routes = await getAllRoutes();

  console.log(`\n🗺  Sitemap: ${routes.length} URLs`);

  const urls = routes.map(route => {
    const loc = `${BASE_URL}${escapeXml(route)}`;
    const prio = priority(route);
    const freq = changefreq(route);
    return `  <url><loc>${loc}</loc><lastmod>${TODAY}</lastmod><changefreq>${freq}</changefreq><priority>${prio}</priority></url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  mkdirSync(DIST, { recursive: true });
  writeFileSync(join(DIST, 'sitemap.xml'), xml, 'utf-8');
  writeFileSync(join(PUBLIC, 'sitemap.xml'), xml, 'utf-8');

  console.log(`   Written: dist/sitemap.xml and public/sitemap.xml (${routes.length} URLs)`);
}

main().catch(err => {
  console.error('Sitemap generation failed:', err);
  process.exit(0); // non-fatal
});

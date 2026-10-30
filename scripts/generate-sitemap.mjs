#!/usr/bin/env node
/**
 * Generate the sitemap from prerender-routes.mjs — run AFTER the prerender (and, in CI,
 * after prerender-merge), because lastmod comes from the prerendered HTML.
 *
 * Batch 11 (GSC) output in dist/:
 *   sitemap.xml            a sitemap INDEX (same URL robots.txt points at; robots.txt is
 *                          never edited) listing one sitemap per section:
 *   sitemap-<section>.xml  core, vedic, panchang, celebrity, birthday, hindi, articles
 *                          (scripts/lib/sitemap.mjs SECTIONS / sectionOf)
 *   sitemap-manifest.json  { v, buildDate, urls: { "/path/": { h: content hash, m: lastmod } } }
 *
 * lastmod is real: a page keeps its previous lastmod while its main-content hash is
 * unchanged (previous manifest fetched from https://bornclock.com/sitemap-manifest.json),
 * changed/new pages get the build date, daily pages get the build date. If the previous
 * manifest cannot be fetched, changed-or-unknown pages get the git commit date of the
 * build (else the build date). Pages whose HTML is noindex are left out of the sitemap.
 *
 * Env: SITEMAP_PREV_MANIFEST = a file path or URL to use instead of the live manifest,
 *      or "none" to skip the fetch (tests / offline). BUILD_DATE=YYYY-MM-DD overrides
 *      the build date (India date by default).
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync, unlinkSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import {
  SECTIONS, MANIFEST_FILE, HASH_VERSION, BASE_URL, sectionOf, locPath, contentHash,
  parseManifest, resolveLastmod, urlsetXml, sitemapIndexXml,
} from './lib/sitemap.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = process.env.SITEMAP_DIST ? resolve(process.env.SITEMAP_DIST) : join(ROOT, 'dist');

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
       '/birthstone','/planetary-age','/biological-age','/generation','/pricing',
       '/answers','/born-on/india'].includes(route)) return '0.9';
  return '0.6';
}

// Batch 7: daily-changing pages (src/lib/daily/registry.ts) — content changes every
// India day, so they are marked daily with the build date as lastmod.
// W7 adds /panchang, /rahu-kaal, /choghadiya (+ 50 cities) and /hi/panchang (+ 10 cities).
const DAILY_ROUTE = /^\/(?:rashifal\/[a-z]+\/(?:today|tomorrow)|hi\/rashifal\/[a-z]+|zodiac\/[a-z]+\/(?:today|tomorrow)|(?:hi\/)?(?:panchang|rahu-kaal|choghadiya|vrat)(?:\/[a-z-]+)?|panchang-calendar|planets-today|moon-phase)$/;
// Pages whose prerendered content is today's list (fresh every build) also count as daily.
const DAILY_EXTRA = new Set(['/todays-birthdays']);
const isDaily = route => DAILY_ROUTE.test(route) || DAILY_EXTRA.has(route);

const BUILD_DATE = /^\d{4}-\d{2}-\d{2}$/.test(process.env.BUILD_DATE || '')
  ? process.env.BUILD_DATE
  : new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

function changefreq(route) {
  if (route === '/') return 'daily';
  if (isDaily(route)) return 'daily';
  if (route.startsWith('/blog/')) return 'monthly';
  if (route.startsWith('/birthday/') && route.split('/').length === 4) return 'monthly';
  if (route.startsWith('/born-on/')) return 'monthly';
  return 'weekly';
}

/** India date of the HEAD commit, or null outside a git checkout. */
function gitCommitDate() {
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI'], { cwd: ROOT, encoding: 'utf8' }).trim();
    const t = Date.parse(iso);
    return Number.isFinite(t) ? new Date(t + 5.5 * 3600 * 1000).toISOString().slice(0, 10) : null;
  } catch { return null; }
}

async function loadPreviousManifest() {
  const src = process.env.SITEMAP_PREV_MANIFEST || `${BASE_URL}/${MANIFEST_FILE}`;
  if (src === 'none') return { entries: null, note: 'skipped (SITEMAP_PREV_MANIFEST=none)' };
  try {
    let text;
    if (/^https?:\/\//.test(src)) {
      const res = await fetch(src, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'bornclock-sitemap-build' } });
      if (!res.ok) return { entries: null, note: `${src} → HTTP ${res.status}` };
      text = await res.text();
    } else {
      text = readFileSync(resolve(src), 'utf8');
    }
    const entries = parseManifest(text);
    return entries ? { entries, note: `${src} (${Object.keys(entries).length} URLs)` } : { entries: null, note: `${src} unreadable or another hash version` };
  } catch (err) {
    return { entries: null, note: `${src} → ${err.message}` };
  }
}

function htmlFor(route) {
  const p = route === '/' ? join(DIST, 'index.html') : join(DIST, route, 'index.html');
  return existsSync(p) ? readFileSync(p, 'utf8') : null;
}
const isNoindex = html => /<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=["'][^"']*noindex/i.test(html)
  || /<meta\b[^>]*\bcontent=["'][^"']*noindex[^"']*["'][^>]*\bname=["']robots["']/i.test(html);

async function main() {
  const { getAllRoutes } = await import('./prerender-routes.mjs');
  const routes = await getAllRoutes();
  const prev = await loadPreviousManifest();
  const fallbackDate = gitCommitDate() || BUILD_DATE;
  console.log(`\n🗺  Sitemap: ${routes.length} routes · build date ${BUILD_DATE} · previous manifest: ${prev.note}`);
  if (!prev.entries) console.log(`   No previous manifest — changed/unknown pages get the commit date ${fallbackDate}`);

  const bySection = new Map(SECTIONS.map(s => [s.id, []]));
  const manifestUrls = {};
  const stats = { hashed: 0, noHtml: 0, kept: 0, changed: 0, daily: 0, noindex: 0 };
  for (const route of routes) {
    const loc = locPath(route);
    const html = htmlFor(route);
    if (html && isNoindex(html)) { stats.noindex++; continue; }
    const hash = html ? contentHash(html, BUILD_DATE) : null;
    if (hash) stats.hashed++; else stats.noHtml++;
    const before = prev.entries?.[loc];
    const daily = isDaily(route);
    const lastmod = resolveLastmod({ hash, prev: before, daily, havePrevManifest: !!prev.entries, buildDate: BUILD_DATE, fallbackDate });
    if (daily) stats.daily++; else if (before && lastmod === before.m) stats.kept++; else stats.changed++;
    manifestUrls[loc] = { h: hash ?? before?.h ?? '', m: lastmod };
    bySection.get(sectionOf(route)).push({ loc, lastmod, changefreq: changefreq(route), priority: priority(route) });
  }

  mkdirSync(DIST, { recursive: true });
  // Remove section files from an earlier run that this run does not write.
  for (const f of readdirSync(DIST)) if (/^sitemap-[a-z]+\.xml$/.test(f) && !SECTIONS.some(s => s.file === f)) unlinkSync(join(DIST, f));
  const indexRows = [];
  for (const s of SECTIONS) {
    const entries = bySection.get(s.id);
    if (!entries.length) continue;
    writeFileSync(join(DIST, s.file), urlsetXml(entries), 'utf-8');
    const lastmod = entries.reduce((m, e) => (e.lastmod > m ? e.lastmod : m), '0000-00-00');
    indexRows.push({ file: s.file, lastmod });
    console.log(`   ${s.file.padEnd(22)} ${String(entries.length).padStart(5)} URLs · newest lastmod ${lastmod}`);
  }
  writeFileSync(join(DIST, 'sitemap.xml'), sitemapIndexXml(indexRows), 'utf-8');
  writeFileSync(join(DIST, MANIFEST_FILE), JSON.stringify({ v: HASH_VERSION, buildDate: BUILD_DATE, generatedAt: new Date().toISOString(), urls: manifestUrls }), 'utf-8');

  const spread = {};
  for (const e of Object.values(manifestUrls)) spread[e.m] = (spread[e.m] || 0) + 1;
  const total = Object.keys(manifestUrls).length;
  console.log(`   Written: dist/sitemap.xml (index of ${indexRows.length}) + ${MANIFEST_FILE} · ${total} URLs`);
  console.log(`   lastmod: ${stats.kept} kept (content unchanged), ${stats.changed} changed/new, ${stats.daily} daily · ${stats.noHtml} without prerendered HTML · ${stats.noindex} noindex pages left out`);
  console.log(`   lastmod spread: ${Object.entries(spread).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([d, n]) => `${d}×${n}`).join(', ')}`);
}

main().catch(err => {
  // Batch 11: fatal — validate-dist would block the deploy on a missing/broken sitemap anyway.
  console.error('Sitemap generation failed:', err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * scripts/indexnow-ping.mjs — submit URLs to IndexNow (Bing + Yandex) after a deploy.
 * The key file public/45894fcfd9f370d9927aaa9bfdf01d65.txt (hosted at https://bornclock.com/45894fcfd9f370d9927aaa9bfdf01d65.txt) proves
 * ownership. Reads dist/sitemap.xml for the URL list (batched, IndexNow caps 10k/req).
 *
 * Run after deploy:  node scripts/indexnow-ping.mjs [--all]
 *   default: pings the homepage + the 18 growth pages + hubs (fast).
 *   --all:   pings every URL in the sitemap (use sparingly).
 * Manual: submit the sitemap once in Bing Webmaster Tools (see docs/SEO-MAGNET-REPORT.md).
 */
import { readFileSync } from 'node:fs';

const KEY = '45894fcfd9f370d9927aaa9bfdf01d65';
const HOST = 'bornclock.com';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ALL = process.argv.includes('--all');

function sitemapUrls() {
  try {
    const xml = readFileSync('dist/sitemap.xml', 'utf8');
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  } catch { return []; }
}

const CORE = [
  'https://bornclock.com/',
  ...['january','february','march','april','may','june','july','august','september','october','november','december'].map(m => `https://bornclock.com/born-in-${m}`),
  'https://bornclock.com/biorhythm-workout-calculator','https://bornclock.com/best-day-to-start-a-habit',
  'https://bornclock.com/cycle-syncing-for-men','https://bornclock.com/why-am-i-tired-some-days',
  'https://bornclock.com/best-time-to-work-out','https://bornclock.com/energy-forecast','https://bornclock.com/blog',
];

const urls = ALL ? sitemapUrls() : CORE;
if (!urls.length) { console.error('no URLs to submit'); process.exit(1); }

async function ping(endpoint, list) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: list }),
  });
  console.log(`${endpoint} -> HTTP ${res.status} (${list.length} urls)`);
}

for (let i = 0; i < urls.length; i += 10000) {
  const batch = urls.slice(i, i + 10000);
  await ping('https://api.indexnow.org/indexnow', batch);
  await ping('https://yandex.com/indexnow', batch);
}
console.log('IndexNow ping complete.');

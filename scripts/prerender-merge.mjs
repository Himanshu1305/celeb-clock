#!/usr/bin/env node
/**
 * Merge sharded prerender output onto dist/ and enforce SEO coverage.
 *
 *   node scripts/prerender-merge.mjs <shards-dir>   # CI: merge every shard folder, then check
 *   node scripts/prerender-merge.mjs                # just check dist/prerender-manifest.json
 *
 * Each shard folder holds the HTML that `PRERENDER_SHARD=i/N PRERENDER_OUT=...
 * node scripts/prerender.mjs` produced plus its prerender-manifest.shard-i.json.
 *
 * Exits 1 (blocking the deploy, so the live site stays on the last good version)
 * when the homepage is not prerendered, a shard is missing, or fewer than
 * PRERENDER_MIN_COVERAGE (default 0.98) of all routes were prerendered. Search
 * traffic is the main acquisition channel; a site that silently serves Google the
 * bare SPA shell for hundreds of pages must not ship.
 */
import { readdirSync, readFileSync, writeFileSync, cpSync, existsSync, statSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');
const MIN_COVERAGE = Number(process.env.PRERENDER_MIN_COVERAGE || 0.98);

function fail(msg) {
  console.error(`\n❌ Prerender coverage check FAILED: ${msg}`);
  process.exit(1);
}

const shardsDir = process.argv[2] ? resolve(process.argv[2]) : null;
let entries = [];
let elapsed = 0;

if (shardsDir) {
  const shardDirs = readdirSync(shardsDir)
    .map(n => join(shardsDir, n))
    .filter(p => statSync(p).isDirectory())
    .sort();
  if (!shardDirs.length) fail(`no shard folders in ${shardsDir}`);
  let expectedShards = null;
  const seenShards = new Set();
  for (const dir of shardDirs) {
    const mf = readdirSync(dir).find(n => /^prerender-manifest\.shard-\d+\.json$/.test(n));
    if (!mf) fail(`${dir} has no shard manifest (shard crashed?)`);
    const m = JSON.parse(readFileSync(join(dir, mf), 'utf-8'));
    expectedShards = m.shard?.count ?? expectedShards;
    seenShards.add(m.shard?.index);
    entries.push(...m.routes);
    elapsed = Math.max(elapsed, m.elapsedSeconds || 0);
    // Copy the shard's HTML onto dist/ (manifest excluded).
    cpSync(dir, DIST, { recursive: true, filter: src => !/prerender-manifest\.shard-\d+\.json$/.test(src) });
    console.log(`   merged ${dir}: ${m.ok} ok, ${m.failed} failed, ${m.skipped} skipped (${m.elapsedSeconds}s)`);
  }
  if (expectedShards && seenShards.size !== expectedShards) {
    fail(`only ${seenShards.size} of ${expectedShards} shards produced output`);
  }
} else {
  const p = join(DIST, 'prerender-manifest.json');
  if (!existsSync(p)) fail('dist/prerender-manifest.json not found');
  const m = JSON.parse(readFileSync(p, 'utf-8'));
  entries = m.routes;
  elapsed = m.elapsedSeconds || 0;
}

// Compare against the full route list, so a route no shard even attempted counts as missing.
const { getAllRoutes } = await import('./prerender-routes.mjs');
const allRoutes = await getAllRoutes();
const okSet = new Set(entries.filter(e => e.status === 'ok').map(e => e.route));
const missing = allRoutes.filter(r => !okSet.has(r));
const coverage = allRoutes.length ? (allRoutes.length - missing.length) / allRoutes.length : 0;

const counts = { ok: 0, failed: 0, skipped: 0 };
for (const e of entries) counts[e.status] = (counts[e.status] || 0) + 1;
const manifest = {
  generatedAt: new Date().toISOString(),
  totalRoutes: allRoutes.length,
  ...counts,
  missing: missing.length,
  coverage: Number(coverage.toFixed(4)),
  elapsedSeconds: elapsed,
  routes: entries,
};
writeFileSync(join(DIST, 'prerender-manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

const byPrefix = {};
for (const r of missing) {
  const k = '/' + (r.split('/')[1] || '');
  byPrefix[k] = (byPrefix[k] || 0) + 1;
}
console.log(`\n📊 Prerender coverage: ${allRoutes.length - missing.length}/${allRoutes.length} (${(coverage * 100).toFixed(2)}%)`);
if (missing.length) {
  console.log('   Not prerendered, by section:', JSON.stringify(byPrefix));
  console.log('   First missing:', missing.slice(0, 15).join(', '));
}

if (!okSet.has('/')) fail('the homepage (/) was not prerendered');
if (coverage < MIN_COVERAGE) {
  fail(`${(coverage * 100).toFixed(2)}% < required ${(MIN_COVERAGE * 100).toFixed(0)}%`);
}
console.log('✅ Coverage OK');

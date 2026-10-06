// FINAL run — status crawl of every sitemap URL against staging (Rule 3 / FINAL step 3).
// Reads dist/sitemap.xml, rewrites the production host to the staging base, and GETs
// each URL with a concurrency cap (default 8). Reports every non-2xx/3xx and a summary.
//   BASE=https://bornclock-staging.usdvisionai.workers.dev CONC=8 node scripts/final-status-crawl.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = (process.env.BASE || 'https://bornclock-staging.usdvisionai.workers.dev').replace(/\/$/, '');
const CONC = Number(process.env.CONC || 8);
const SITEMAP = process.env.SITEMAP || 'dist/sitemap.xml';

const xml = readFileSync(SITEMAP, 'utf8');
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
// rewrite host → staging
const urls = locs.map(u => u.replace(/^https?:\/\/[^/]+/, BASE));
console.log(`crawling ${urls.length} URLs @ concurrency ${CONC} against ${BASE}`);

const results = [];
let i = 0, done = 0;
async function worker() {
  while (i < urls.length) {
    const idx = i++;
    const url = urls[idx];
    let status = 0, err = null;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 30000);
      const resp = await fetch(url, { method: 'GET', redirect: 'manual', signal: ctrl.signal });
      clearTimeout(t);
      status = resp.status;
      // follow a single redirect to record the final status (trailing-slash canonicalisation)
      if (status >= 300 && status < 400) {
        const loc = resp.headers.get('location');
        if (loc) {
          const abs = loc.startsWith('http') ? loc : BASE + loc;
          const r2 = await fetch(abs, { method: 'GET', redirect: 'manual' });
          status = `${status}->${r2.status}`;
        }
      }
    } catch (e) { err = String(e).slice(0, 80); status = 'ERR'; }
    results.push({ url, status, err });
    done++;
    if (done % 250 === 0) console.log(`  ${done}/${urls.length}`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));

const norm = r => (typeof r.status === 'string' && r.status.includes('->')) ? Number(r.status.split('->')[1]) : (typeof r.status === 'number' ? r.status : r.status);
const bad = results.filter(r => { const f = norm(r); return !(f === 200 || f === 301 || f === 308); });
const counts = {};
for (const r of results) { const f = String(norm(r)); counts[f] = (counts[f] || 0) + 1; }
writeFileSync('docs/migration-screens/final-status-crawl.json', JSON.stringify({ base: BASE, total: urls.length, counts, bad }, null, 2));
console.log('status counts:', JSON.stringify(counts));
console.log(`non-OK (not 200/301/308): ${bad.length}`);
for (const b of bad.slice(0, 50)) console.log('  BAD', b.status, b.url, b.err || '');

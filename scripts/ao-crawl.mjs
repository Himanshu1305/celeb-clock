import { readFileSync } from 'node:fs';

const BASE = process.env.BASE || 'https://f537587c-bornclock.usdvisionai.workers.dev';
const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
const allUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace('https://bornclock.com', ''));

// Representative sample: every distinct top-level path shape + a random slice of the long tail.
const byType = new Map();
for (const u of allUrls) {
  const key = u.split('/').slice(0, 2).join('/') || '/';
  if (!byType.has(key)) byType.set(key, []);
  byType.get(key).push(u);
}
const sample = new Set();
for (const [, list] of byType) { for (let i = 0; i < Math.min(5, list.length); i++) sample.add(list[i]); }
// add a deterministic long-tail slice
for (let i = 0; i < allUrls.length; i += Math.floor(allUrls.length / 120)) sample.add(allUrls[i]);
const urls = [...sample];

let done = 0, ok = 0; const bad = [];
const CONC = 8;
async function worker(queue) {
  while (queue.length) {
    const path = queue.pop();
    try {
      const res = await fetch(BASE + path, { redirect: 'manual' });
      if (res.status === 200 || (res.status >= 300 && res.status < 400)) ok++;
      else bad.push(`${path} → ${res.status}`);
    } catch (e) { bad.push(`${path} → ERR ${e.message.slice(0,30)}`); }
    done++;
  }
}
const q = [...urls];
await Promise.all(Array.from({ length: CONC }, () => worker(q)));
console.log(`CRAWL: ${done} urls sampled from ${allUrls.length} sitemap entries · ${ok} ok/redirect · ${bad.length} bad`);
if (bad.length) console.log(bad.slice(0, 40).join('\n'));

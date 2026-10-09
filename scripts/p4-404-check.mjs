// P4 — real 404s for the new P4 routes, no valid page harmed.
// GETs each sample (redirect:manual, following at most ONE redirect), checks the
// final status matches expected. Exits non-zero if any sample is wrong.
//   BASE=http://localhost:8788 node scripts/p4-404-check.mjs
import { writeFileSync } from 'node:fs';

const BASE = (process.env.BASE || 'http://localhost:8788').replace(/\/$/, '');

// Must return a real 404 (validated-invalid finite param spaces).
const INVALID = [
  '/chinese-horoscope/unicorn', '/chinese-horoscope/notananimal',
  '/on-this-day/may/40', '/on-this-day/february/30', '/on-this-day/notamonth/1',
  '/hi/panchang/notacity', '/hi/panchang/london',
];

// Must STAY 200 (valid pages — regression guard).
const VALID = [
  '/chinese-horoscope', '/chinese-horoscope/dragon', '/chinese-horoscope/rat',
  '/on-this-day', '/on-this-day/may/13', '/on-this-day/february/29',
  '/hi/panchang', '/hi/panchang/delhi', '/hi/panchang/mumbai',
  // Cross-group regression (unchanged behaviour).
  '/chinese-zodiac/dragon', '/panchang/delhi', '/born-on/may/13',
];

async function finalStatus(path) {
  const url = BASE + path;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 30000);
    let resp = await fetch(url, { method: 'GET', redirect: 'manual', signal: ctrl.signal });
    if (resp.status >= 300 && resp.status < 400) {
      const loc = resp.headers.get('location');
      if (loc) resp = await fetch(new URL(loc, url).toString(), { method: 'GET', redirect: 'manual', signal: ctrl.signal });
    }
    clearTimeout(t);
    return resp.status;
  } catch (e) {
    return `ERR ${String(e).slice(0, 60)}`;
  }
}

let failures = 0;
const results = [];
for (const path of INVALID) {
  const status = await finalStatus(path);
  const ok = status === 404;
  if (!ok) failures++;
  results.push({ path, expected: 404, status, ok });
  console.log(`${ok ? 'OK  ' : 'FAIL'} 404 ${path} -> ${status}`);
}
for (const path of VALID) {
  const status = await finalStatus(path);
  const ok = status === 200;
  if (!ok) failures++;
  results.push({ path, expected: 200, status, ok });
  console.log(`${ok ? 'OK  ' : 'FAIL'} 200 ${path} -> ${status}`);
}
writeFileSync('docs/p4-404-check.json', JSON.stringify({ base: BASE, results }, null, 2));
console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'} — ${results.length} checked against ${BASE}`);
process.exit(failures === 0 ? 0 : 1);

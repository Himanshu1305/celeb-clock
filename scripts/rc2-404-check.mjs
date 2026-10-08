// RC2 Fix 3 verification — real 404s for invalid addresses, no valid page harmed.
// GETs each sample against staging (redirect:manual, following at most ONE redirect to
// record the final status, like final-status-crawl) and checks it matches the expected
// status. Exits non-zero if any sample is wrong.
//   BASE=https://bornclock-staging.usdvisionai.workers.dev node scripts/rc2-404-check.mjs
import { writeFileSync } from 'node:fs';

const BASE = (process.env.BASE || 'https://bornclock-staging.usdvisionai.workers.dev').replace(/\/$/, '');

// Must return a real 404 (validated-invalid finite param spaces).
const INVALID = [
  '/born-on/february-30', '/born-on/april-31', '/born-on/2/30', '/born-on/13/1',
  '/birthday/13/40', '/birthday/2/30',
  '/compatibility/aries/dragon', '/compatibility/foo/bar', '/compatibility/leo/notasign',
  '/zodiac/dragon', '/zodiac/notasign',
  '/chinese-zodiac/unicorn', '/chinese-zodiac/notananimal',
  '/vedic-zodiac/notarashi',
  '/numerology/10', '/numerology/99',
  '/birthstone/decembr', '/birthstone/notamonth',
];

// Must STAY 200 (valid pages — regression guard). The /chinese-zodiac/dragon vs
// /zodiac/dragon pair is the key cross-system check: dragon is a valid Chinese animal
// but NOT a zodiac sign.
const VALID = [
  '/', '/born-on/february-29', '/born-on/1/1', '/born-on/12/31',
  '/birthday/2/29', '/birthday/7',
  '/compatibility/aries/leo', '/compatibility/leo/aries',
  '/zodiac/aries', '/zodiac/pisces',
  '/chinese-zodiac/dragon', '/chinese-zodiac/rat',
  '/vedic-zodiac/mesh', '/vedic-zodiac/meen',
  '/numerology/7', '/numerology/11', '/numerology/33',
  '/birthstone/january', '/birthstone/december',
  // Backlog-1 new static routes (Items E, H) — must stay 200. These are static (no
  // parameters), so they are NOT in the edge force404 enum; they return 200 because a
  // prerendered file exists and nothing force-404s them.
  '/manglik', '/kaal-sarp-dosha', '/personal-year-number', '/angel-numbers', '/dasha-calculator',
  // Growth P2 new static routes — must stay 200 (prerendered, not in the force404 enum).
  '/name-correction', '/business-name-numerology', '/mobile-number-numerology', '/house-number-numerology',
  '/pitra-dosha', '/mool-dosha', '/grahan-dosha', '/nadi-dosha',
  '/life-report', '/child-kundli',
];

// Valid NON-SITEMAP routes (account/dynamic/query — must never be 404'd by the edge).
const NON_SITEMAP = [
  '/results', '/results?day=1&month=1', '/auth', '/profile', '/admin',
  '/upgrade', '/report/nonexistent-sample-slug',
  '/celebrity?q=gandhi', '/blog?tag=astrology', '/?utm_source=rc2check',
];

async function finalStatus(path) {
  const url = BASE + path;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 30000);
    let resp = await fetch(url, { method: 'GET', redirect: 'manual', signal: ctrl.signal });
    // follow a single redirect (trailing-slash canonicalisation) to the final status
    if (resp.status >= 300 && resp.status < 400) {
      const loc = resp.headers.get('location');
      if (loc) resp = await fetch(new URL(loc, url).toString(), { method: 'GET', redirect: 'manual', signal: ctrl.signal });
    }
    clearTimeout(t);
    return resp.status;
  } catch (e) { return `ERR:${String(e).slice(0, 40)}`; }
}

const rows = [];
let bad = 0;
async function run(list, expect, group) {
  for (const path of list) {
    const status = await finalStatus(path);
    const ok = status === expect;
    if (!ok) bad++;
    rows.push({ group, path, expect, status, ok });
    console.log(`${ok ? 'OK ' : 'BAD'} [${group}] ${path} → ${status} (expect ${expect})`);
  }
}

console.log(`RC2 404 check against ${BASE}\n`);
await run(INVALID, 404, 'invalid→404');
await run(VALID, 200, 'valid→200');
await run(NON_SITEMAP, 200, 'non-sitemap→200');
writeFileSync('docs/migration-screens/rc2-404-check.json', JSON.stringify(rows, null, 2));
console.log(`\n${rows.length} checks, ${bad} wrong. ${bad === 0 ? '✅ PASS' : '❌ FAIL'}`);
process.exit(bad === 0 ? 0 : 1);

// FINAL — 404 check extended with EVERY new P1–P5 route family + RC3 regression set.
// valid → 200, invalid → 404. Follows at most one redirect (trailing-slash canonicalisation).
//   BASE=https://bornclock-staging.usdvisionai.workers.dev node scripts/final-404-check.mjs
import { writeFileSync } from 'node:fs';

const BASE = (process.env.BASE || 'https://bornclock-staging.usdvisionai.workers.dev').replace(/\/$/, '');

// Must return a real 404 (validated-invalid finite param spaces).
const INVALID = [
  '/rashifal/notarashi', '/rashifal/mesh/decade',
  '/nakshatra/notanakshatra',
  '/yoga/not-a-yoga',
  '/planet-in-house/sun/13', '/planet-in-house/pluto/1',
  '/planet-in-sign/sun/notasign', '/planet-in-sign/pluto/leo',
  '/transit/pluto/2027', '/transit/saturn/1800',
  '/blue-zones/not-a-factor',
  '/life-expectancy/factors/not-a-factor',
  '/mercury-retrograde/1700',
  '/festivals/1700',
  '/divisional-charts/d99-nonsense',
  '/vedic-zodiac/notarashi',
  '/chinese-horoscope/unicorn',
  '/on-this-day/may/40', '/on-this-day/february/30', '/on-this-day/notamonth/1',
  '/panchang/notacityxyz', '/panchang/london',
  '/hi/panchang/notacity',
];

// Must STAY 200 (valid pages — new-route regression guard + RC3 cross-group set).
const VALID = [
  // P1 traffic engines
  '/rashifal', '/rashifal/mesh', '/rashifal/tula/week', '/rashifal/mesh/today', '/rashifal/mesh/month', '/rashifal/mesh/year',
  '/panchang', '/panchang/delhi', '/panchang/pune', '/hi/panchang', '/hi/panchang/mumbai',
  '/festivals', '/festivals/2027',
  '/planet-in-house', '/planet-in-house/sun/6', '/planet-in-sign', '/planet-in-sign/sun/leo',
  '/nakshatra', '/nakshatra/mula', '/yoga', '/yoga/raja-yoga',
  '/transit', '/transit/rahu/2025', '/mercury-retrograde', '/mercury-retrograde/2027',
  '/baby-names',
  '/blue-zones', '/blue-zones/belong', '/life-expectancy/factors', '/life-expectancy/factors/bmi',
  '/attitude-number', '/chaldean-numerology',
  // P2 predictions & paid depth
  '/child-kundli', '/career-report', '/life-report',
  '/pitra-dosha', '/mool-dosha', '/grahan-dosha', '/nadi-dosha',
  '/name-correction', '/business-name-numerology', '/mobile-number-numerology', '/house-number-numerology',
  '/divisional-charts', '/divisional-charts/d2-hora',
  // P3 retention
  '/dashboard', '/family', '/reminders',
  // P4 reach
  '/western-birth-chart', '/chinese-horoscope', '/chinese-horoscope/ox', '/on-this-day', '/on-this-day/may/13',
  '/tarot-reading', '/vedic-zodiac', '/vedic-zodiac/mesh',
  // RC3 cross-group regression (unchanged behaviour)
  '/kundali', '/kundali-match', '/sade-sati', '/muhurat', '/gemstones', '/manglik', '/kaal-sarp-dosha',
  '/numerology', '/zodiac/aries', '/chinese-zodiac/dragon', '/born-on/may/13', '/life-expectancy', '/biorhythm',
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
writeFileSync('docs/final-404-check.json', JSON.stringify({ base: BASE, results }, null, 2));
console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'} — ${results.length} checked against ${BASE}`);
process.exit(failures === 0 ? 0 : 1);

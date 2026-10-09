// FINAL — served-output check: one representative URL per page type. Verifies the
// raw HTML the crawler/SEO sees: non-empty <title>, exactly one <h1>, a prerendered
// lead/body (not an empty SPA shell), and JSON-LD presence. Reports per-URL.
//   BASE=https://bornclock-staging.usdvisionai.workers.dev node scripts/final-served.mjs
const BASE = (process.env.BASE || 'https://bornclock-staging.usdvisionai.workers.dev').replace(/\/$/, '');

const URLS = [
  '/', '/kundali', '/numerology', '/life-expectancy', '/zodiac/aries',
  '/rashifal/mesh/today', '/panchang/delhi', '/planet-in-house/sun/6', '/planet-in-sign/sun/leo',
  '/nakshatra/mula', '/yoga/raja-yoga', '/transit/rahu/2025', '/mercury-retrograde/2027',
  '/festivals/2027', '/baby-names', '/blue-zones/belong', '/life-expectancy/factors/bmi',
  '/attitude-number', '/chaldean-numerology', '/divisional-charts/d2-hora', '/vedic-zodiac/mesh',
  '/child-kundli', '/life-report', '/career-report', '/pitra-dosha',
  '/western-birth-chart', '/chinese-horoscope/dragon', '/on-this-day/may/13', '/tarot-reading',
  '/celebrity/virat-kohli', '/born-on/may/13', '/how-it-works',
];

// Strip comments + scripts + styles so literal "<h1>" mentioned in a head comment
// (the LCP-discoverability note) or inside JS is not miscounted as a real heading.
function stripNonMarkup(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
}
function titleOf(html) { const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i); return m ? m[1].trim() : ''; }
function h1Text(html) { const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i); return m ? m[1].replace(/<[^>]+>/g, '').trim().slice(0, 70) : ''; }
function hasJsonLd(html) { return /<script[^>]+application\/ld\+json/i.test(html); }
// crude "prerendered" test: visible text length outside scripts/styles
function bodyTextLen(html) {
  const body = (html.match(/<body[\s\S]*?<\/body>/i) || [''])[0]
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return body.length;
}

let fails = 0;
for (const path of URLS) {
  try {
    const resp = await fetch(BASE + path, { redirect: 'follow' });
    const raw = await resp.text();
    const html = stripNonMarkup(raw);
    const title = titleOf(raw);
    const h1n = (html.match(/<h1[ >]/gi) || []).length;
    const tlen = bodyTextLen(html);
    const jsonld = hasJsonLd(raw);
    const okTitle = title.length > 10;
    const okH1 = h1n === 1;
    const okBody = tlen > 400;
    const ok = resp.status === 200 && okTitle && okH1 && okBody;
    if (!ok) fails++;
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${path}`);
    console.log(`       status=${resp.status} h1=${h1n} bodyText=${tlen} jsonld=${jsonld} title="${title.slice(0, 60)}"`);
    if (okH1) console.log(`       h1="${h1Text(html)}"`);
  } catch (e) {
    fails++; console.log(`FAIL ${path} — ${String(e).slice(0, 80)}`);
  }
}
console.log(`\n${fails === 0 ? 'ALL PASS' : fails + ' FAIL'} — ${URLS.length} page types checked`);
process.exit(fails === 0 ? 0 : 1);

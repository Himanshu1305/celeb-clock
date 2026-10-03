import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:4173';
const OUT = 'docs/part-ao-screens';
mkdirSync(OUT, { recursive: true });

// One route per distinct page/template type (dynamic templates get a concrete sample).
const ROUTES = [
  '/', '/results',
  // category landings
  '/vedic-astrology', '/celebrity-birthday', '/mystic-corner', '/science-longevity', '/birthday-fun',
  // vedic tools
  '/kundali', '/kundali-match', '/sade-sati', '/muhurat', '/gemstones', '/rashi-ratna',
  '/career-report', '/astrologer', '/moon-sign', '/sun-vs-moon-sign', '/vedic-zodiac', '/nakshatra',
  // mystic
  '/numerology', '/name-numerology', '/tarot-card-by-birthday', '/zodiac', '/zodiac/aries/',
  '/chinese-zodiac', '/compatibility', '/compatibility/aries/leo/', '/baby-names',
  // birthday
  '/age-calculator', '/todays-birthdays', '/birthday-report', '/planetary-age', '/weight-on-planets',
  '/birthstone', '/birthday', '/born-in', '/born-on/india', '/age-in-days', '/age-in-seconds',
  '/birthday-countdown', '/born-on/march-14', '/born-on/march-14/india', '/birthday/3/14/',
  '/celebrity', '/celebrity/bollywood/', '/generation',
  // science
  '/life-expectancy', '/biological-age', '/biological-age-vs-chronological-age', '/country-comparison',
  '/biorhythm', '/biorhythm-workout-calculator', '/energy-forecast', '/coach', '/leaderboard',
  // money
  '/pricing', '/upgrade', '/gift', '/diwali-gift',
  // hindi
  '/biological-age-hindi', '/hi/rashifal',
  // utility / content
  '/about', '/how-it-works', '/faq', '/contact', '/privacy', '/terms', '/editorial-policy',
  '/articles', '/articles/how-to-live-to-100', '/answers', '/answers/what-is-my-zodiac-sign',
  '/blog', '/auth', '/for-business', '/embed',
  // error
  '/this-route-does-not-exist-404',
];

const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
const MOBILE_SAMPLE = new Set(['/', '/kundali', '/age-calculator', '/numerology', '/life-expectancy', '/pricing', '/zodiac', '/born-on/march-14', '/compatibility', '/contact']);

function isOldPurple(r, g, b) {
  // bright blue-dominant purple/indigo (old brand range); excludes refined amethyst #6E5AA6 (110,90,166)
  return b > 150 && r > 95 && r < 185 && g < 115 && (b - g) > 70 && (r - g) > 15 && !(Math.abs(r-110)<10 && Math.abs(g-90)<10 && Math.abs(b-166)<10);
}

const browser = await chromium.launch();
const rows = [];
for (const route of ROUTES) {
  for (const [vp, size] of Object.entries(viewports)) {
    if (vp === 'mobile' && !MOBILE_SAMPLE.has(route)) continue;
    const page = await browser.newPage({ viewport: size });
    // pre-dismiss cookie banner so it doesn't cover content
    await page.addInitScript(() => {
      try { localStorage.setItem('cookie_consent', JSON.stringify({ essential: true, analytics: false, marketing: false, timestamp: new Date().toISOString(), version: '1.0' })); } catch {}
    });
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)); });
    let status = 0;
    try {
      const resp = await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 });
      status = resp ? resp.status() : 0;
      await page.waitForTimeout(500);
    } catch (e) { status = 'ERR'; }
    const name = (route === '/' ? 'home' : route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '')) + `.${vp}.png`;
    await page.screenshot({ path: `${OUT}/${name}` });
    const audit = await page.evaluate((src) => {
      const fn = new Function('r','g','b', 'return ' + src);
      const bad = new Set(); let cosmic = false; let navyHeader = false;
      const header = document.querySelector('header, nav');
      // cosmic gradient detection on body/first sections
      const bodyBg = getComputedStyle(document.body).backgroundImage;
      if (/gradient/.test(bodyBg) && /rgb\(2[0-4]\d/.test(bodyBg) === false) { /* flattened ok */ }
      let scanned = 0;
      for (const el of document.querySelectorAll('*')) {
        if (scanned++ > 5000) break;
        const s = getComputedStyle(el);
        for (const prop of ['color','backgroundColor','borderTopColor','borderLeftColor']) {
          const m = s[prop].match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (!m) continue;
          if (fn(+m[1],+m[2],+m[3])) bad.add(`${prop}=${s[prop]}`);
        }
        const bgi = s.backgroundImage;
        if (/linear-gradient/.test(bgi) && /rgb\((99|124|139|79|67|147|168)/.test(bgi)) cosmic = true;
      }
      // navy header present?
      for (const h of document.querySelectorAll('header, .site-header, [class*="0E2238"]')) {
        const bg = getComputedStyle(h).backgroundColor;
        const mm = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (mm && +mm[1] < 40 && +mm[2] < 55 && +mm[3] < 75 && +mm[3] >= +mm[1]) navyHeader = true;
      }
      const h1s = document.querySelectorAll('h1').length;
      return { purple: [...bad].slice(0, 5), cosmic, navyHeader, h1s };
    }, isOldPurple.toString().replace(/^function[^{]*{/, '').replace(/}$/, ''));
    rows.push({ route, vp, status, purple: audit.purple, cosmic: audit.cosmic, navyHeader: audit.navyHeader, h1s: audit.h1s, errors: errors.slice(0, 2), img: name });
    await page.close();
  }
}
await browser.close();

writeFileSync(`${OUT}/audit.json`, JSON.stringify(rows, null, 2));
// contact sheet
const cards = rows.map(r => {
  const flags = [];
  if (r.status !== 200 && !String(r.route).includes('404')) flags.push(`status=${r.status}`);
  if (r.purple.length) flags.push('OLD-PURPLE');
  if (r.cosmic) flags.push('COSMIC-BG');
  if (!r.navyHeader && r.vp === 'desktop') flags.push('no-navy-header');
  if (r.errors.length) flags.push('console-err');
  const bad = flags.length > 0;
  return `<div style="display:inline-block;width:320px;margin:6px;vertical-align:top;border:2px solid ${bad?'#c0392b':'#2E9E7B'};border-radius:6px;overflow:hidden;font:12px system-ui">
    <div style="padding:4px 6px;background:${bad?'#fdECEa':'#eafaf3'}"><b>${r.route}</b> · ${r.vp} ${flags.length?('· <span style=color:#c0392b>'+flags.join(', ')+'</span>'):'· <span style=color:#2E9E7B>pass</span>'}</div>
    <img src="${r.img}" style="width:320px;display:block"/></div>`;
}).join('\n');
const flagged = rows.filter(r => (r.status!==200 && !String(r.route).includes('404')) || r.purple.length || r.cosmic || (!r.navyHeader && r.vp==='desktop') || r.errors.length);
writeFileSync(`${OUT}/index.html`, `<!doctype html><meta charset=utf8><title>Part AO visual audit</title><body style="font:14px system-ui;background:#FAF7F0"><h1>Part AO — visual audit</h1><p>${rows.length} shots · ${flagged.length} flagged.</p>${cards}</body>`);
console.log(`AUDIT: ${rows.length} shots, ${flagged.length} flagged`);
console.log(JSON.stringify(flagged.map(f => ({ route: f.route, vp: f.vp, status: f.status, purple: f.purple.length, cosmic: f.cosmic, navy: f.navyHeader, err: f.errors })), null, 1));

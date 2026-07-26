#!/usr/bin/env node
/**
 * scripts/page-sweep.mjs — Phase 3c systematic route sweep.
 *
 * Loads every app route headlessly against the running dev server (:3000) and
 * records, per route: uncaught page errors, console.error messages (filtered for
 * known env noise), literal "undefined"/"NaN"/"null" in visible text, and empty
 * renders. Writes docs/BUG-AUDIT.md.
 *
 * Title/meta-description uniqueness is NOT checked here — dev-server SPA titles
 * are set at runtime and are not representative of the prerendered HTML bots see;
 * that audit belongs to Phase 4 against dist/ prerendered output.
 *
 * Prereq: vite dev on :3000 (+ api :3001 for report routes). Run:
 *   node scripts/page-sweep.mjs
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const BASE = 'http://localhost:3000';
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../docs/BUG-AUDIT.md');

// Static + representative param routes (mirrors src/App.tsx route table).
const ROUTES = [
  '/', '/about', '/age-calculator', '/auth', '/biological-age', '/biorhythm',
  '/birthday-report', '/birthday', '/birthstone', '/blog', '/born-on',
  '/celebrity-birthday', '/chinese-zodiac', '/compatibility', '/contact',
  '/country-comparison', '/editorial-policy', '/family', '/faq', '/generation',
  '/gift', '/leaderboard', '/life-expectancy', '/methodology', '/moon-sign',
  '/name-numerology', '/numerology', '/planetary-age', '/privacy', '/profile',
  '/results', '/tarot-card-by-birthday', '/terms', '/todays-birthdays',
  '/upgrade', '/vedic-zodiac', '/zodiac',
  '/answers/how-does-stress-affect-life-expectancy', '/answers/how-long-will-i-live',
  '/answers/how-old-am-i-on-mars', '/answers/how-to-calculate-age',
  '/answers/how-to-live-longer', '/answers/what-generation-am-i',
  '/answers/what-is-bmi', '/answers/what-is-life-expectancy',
  '/answers/what-is-my-biological-age', '/answers/what-is-my-life-path-number',
  '/answers/what-is-my-zodiac-sign', '/answers/who-shares-my-birthday',
  // param routes — representative values
  '/zodiac/leo', '/chinese-zodiac/rat', '/numerology/7', '/born-on/july-15',
  '/birthday/6/25', '/birthstone/april', '/vedic-zodiac/mesha',
  '/compatibility/aries/leo',
];

// Console.error noise to ignore (network fetches unavailable in local env, etc.)
const IGNORE = [
  /ipapi\.co/i, /Failed to load resource/i, /favicon/i, /net::ERR/i,
  /moz-extension/i, /chrome-extension/i, /Download the React DevTools/i,
  /\[vite\]/i, /manifest/i, /the server responded with a status of 4/i,
  /ERR_CONNECTION/i, /wikipedia|wikimedia/i,
];
const isNoise = (s) => IGNORE.some(re => re.test(s));

function undefinedHits(text) {
  const t = text.toLowerCase();
  const hits = [];
  for (const bad of ['undefined', 'nan', 'null']) {
    const re = new RegExp(`(^|[^a-z])${bad}([^a-z]|$)`, 'g');
    if (re.test(t)) hits.push(bad);
  }
  return hits;
}

const rows = [];
const browser = await chromium.launch();
for (const route of ROUTES) {
  const page = await browser.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !isNoise(m.text())) consoleErrors.push(m.text()); });
  let status = 0, textLen = 0, undef = [];
  try {
    const resp = await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 });
    status = resp?.status() ?? 0;
    await page.waitForTimeout(600);
    const text = (await page.locator('body').innerText()).trim();
    textLen = text.length;
    undef = undefinedHits(text);
  } catch (e) {
    pageErrors.push('NAV: ' + e.message);
  }
  const issues = [];
  if (textLen < 30) issues.push(`empty render (${textLen} chars)`);
  if (undef.length) issues.push(`placeholder text: ${undef.join(', ')}`);
  if (pageErrors.length) issues.push(`pageerror: ${pageErrors.slice(0, 2).join(' | ')}`);
  if (consoleErrors.length) issues.push(`console.error: ${consoleErrors.slice(0, 2).join(' | ')}`);
  rows.push({ route, status, textLen, ok: issues.length === 0, issues });
  console.log(`${issues.length === 0 ? '✅' : '⚠️ '} ${route} (${textLen} chars)${issues.length ? ' — ' + issues.join('; ') : ''}`);
  await page.close();
}
await browser.close();

const clean = rows.filter(r => r.ok);
const flagged = rows.filter(r => !r.ok);
const stamp = process.env.SWEEP_DATE || 'see git log';
let md = `# BornClock — Page Sweep Audit (Phase 3c)\n\n`;
md += `Runtime render sweep of ${rows.length} routes against the dev server (:3000). Generated: ${stamp}.\n\n`;
md += `**Scope:** uncaught page errors, console.error (env noise filtered), literal `;
md += `undefined/NaN/null in visible text, empty renders. Title/meta uniqueness is `;
md += `audited in Phase 4 against prerendered dist/ output (dev SPA titles are not representative).\n\n`;
md += `## Summary\n\n- Routes swept: **${rows.length}**\n- Clean: **${clean.length}**\n- Flagged: **${flagged.length}**\n\n`;
if (flagged.length) {
  md += `## Flagged routes\n\n| Route | Issues |\n|---|---|\n`;
  for (const r of flagged) md += `| \`${r.route}\` | ${r.issues.join('; ').replace(/\|/g, '\\|')} |\n`;
  md += `\n`;
}
md += `## All routes\n\n| Route | Status | Body chars | OK |\n|---|---|---|---|\n`;
for (const r of rows) md += `| \`${r.route}\` | ${r.status} | ${r.textLen} | ${r.ok ? '✅' : '⚠️'} |\n`;
writeFileSync(OUT, md);
console.log(`\nWrote ${OUT} — ${clean.length}/${rows.length} clean, ${flagged.length} flagged.`);

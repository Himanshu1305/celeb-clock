#!/usr/bin/env node
// Sitewide WCAG text-contrast audit (B12).
//
// Loads each URL in headless Chromium, scrolls to trigger lazy sections, then lists every
// visible text element whose contrast against its effective background is below WCAG AA
// (4.5:1 normal text, 3:1 large text). Optionally fills the page's calculator form first so
// result panels (often dark) are audited too.
//
// Usage:
//   npm run build:app
//   node scripts/contrast-audit.mjs --dist dist --urls urls.txt [--fill] [--viewports desktop,mobile]
//          [--out report.json] [--shots dir --shot /planetary-age] [--concurrency 4]
//   node scripts/contrast-audit.mjs --base http://localhost:4173 /planetary-age /kundali
//
// --dist serves the built SPA itself (index.html fallback). External network is blocked so the
// audit is deterministic. The background estimate is approximate: photos/images are not
// understood, so check screenshots before "fixing" a reported element over an image.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = { viewports: 'desktop,mobile', concurrency: '4', shot: [] };
const paths = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--fill') opt.fill = true;
  else if (a === '--shot') opt.shot.push(args[++i]);
  else if (a.startsWith('--')) opt[a.slice(2)] = args[++i];
  else paths.push(a);
}
if (opt.urls) paths.push(...readFileSync(opt.urls, 'utf8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#')));
if (!paths.length) { console.error('no URLs given'); process.exit(2); }

// ── Browser-side audit ─────────────────────────────────────────────────────────
// Background = first ancestor with an opaque background-color, else the opaque colour stops of a
// gradient background-image (the WORST stop is used), else white. Gradient text
// (background-clip:text + transparent fill) is measured stop-by-stop against the parent's
// background instead of against its own gradient.
export const AUDIT_SRC = `(() => {
  const parse = s => { const m = s && s.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const stops = s => (s.match(/rgba?\\([^)]+\\)/g) || []).map(parse).filter(Boolean);
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const over = (f, b) => f.a >= 1 ? f : { r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 };
  const isClipText = cs => (cs.webkitBackgroundClip || cs.backgroundClip) === 'text';
  function bgsOf(el) { let e = el; while (e && e.nodeType === 1) { const cs = getComputedStyle(e); if (!isClipText(cs)) { const c = parse(cs.backgroundColor); if (c && c.a > 0.5) return [c]; if (cs.backgroundImage && cs.backgroundImage !== 'none') { const g = stops(cs.backgroundImage).filter(c => c.a > 0.5); if (g.length) return g; } } e = e.parentElement; } return [{ r: 255, g: 255, b: 255, a: 1 }]; }
  const out = []; const seen = new Set();
  for (const el of document.body.querySelectorAll('*')) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'PATH'].includes(el.tagName)) continue;
    const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    if (txt.length < 2) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.2) continue;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    if (r.right <= 0 || r.bottom + scrollY <= 0) continue; // parked off-screen (e.g. share-card render source)
    if (/^[\\p{Extended_Pictographic}\\uFE0F\\u200D\\s]+$/u.test(txt)) continue; // emoji render in their own colours
    if (el.closest('[data-sonner-toaster],[aria-hidden="true"],[data-contrast-ignore]')) continue;
    let fill = parse(cs.webkitTextFillColor) || parse(cs.color); if (!fill) continue;
    // Gradient text: the visible colours are the element's own gradient stops.
    let fgs = [fill];
    if (fill.a === 0 && isClipText(cs)) { let e = el; while (e && e.nodeType === 1) { const c2 = getComputedStyle(e); if (isClipText(c2) && c2.backgroundImage !== 'none') { fgs = stops(c2.backgroundImage); break; } e = e.parentElement; } }
    fgs = fgs.filter(c => c.a > 0); if (!fgs.length) continue;
    const bgs = bgsOf(el);
    let worst = null;
    for (const b of bgs) for (const f of fgs) { const fc = over(f, b); const v = cr(fc, b); if (!worst || v < worst.v) worst = { v, f: fc, b }; }
    const ratio = worst.v; const bg = worst.b; const large = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.6 && +cs.fontWeight >= 700);
    if (ratio < (large ? 3 : 4.5)) { const key = el.tagName + '|' + el.className + '|' + cs.color; if (seen.has(key)) continue; seen.add(key); out.push({ ratio: +ratio.toFixed(2), large, tag: el.tagName, cls: String(el.className).slice(0, 90), color: fgs.length > 1 ? 'gradient ' + fgs.map(c => 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')').join('>') : cs.color, bg: 'rgb(' + Math.round(bg.r) + ',' + Math.round(bg.g) + ',' + Math.round(bg.b) + ')', text: txt.slice(0, 50) }); }
  }
  return out.sort((a, b) => a.ratio - b.ratio);
})()`;

// ── Static SPA server for --dist ───────────────────────────────────────────────
const TYPES = { '.js': 'application/javascript', '.mjs': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.txt': 'text/plain', '.ico': 'image/x-icon' };
async function serve(dir) {
  const root = resolve(dir);
  const srv = createServer((q, r) => {
    const p = decodeURIComponent(q.url.split('?')[0]);
    for (const c of [join(root, p), join(root, p, 'index.html')]) {
      if (c.startsWith(root) && existsSync(c) && statSync(c).isFile()) {
        r.writeHead(200, { 'Content-Type': TYPES[extname(c)] || 'application/octet-stream' });
        return r.end(readFileSync(c));
      }
    }
    if (extname(p) && extname(p) !== '.html') { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': 'text/html' });
    r.end(readFileSync(join(root, 'index.html')));
  });
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok));
  return { srv, base: `http://127.0.0.1:${srv.address().port}` };
}

// ── Generic calculator fill ────────────────────────────────────────────────────
async function fill(page) {
  const tryFill = async (sel, val) => { for (const h of await page.$$(sel)) { try { if (await h.isVisible() && await h.isEditable()) { await h.fill(val); } } catch { /* ignore */ } } };
  await tryFill('input[aria-label="Day"]', '15');
  await tryFill('input[aria-label="Month"]', '05');
  await tryFill('input[aria-label="Year"]', '1990');
  await tryFill('input[type="date"]', '1990-05-15');
  await tryFill('input[type="time"]', '10:30');
  await tryFill('input[type="text"][placeholder*="Priya" i], input[type="text"][name*="name" i], input[type="text"][placeholder*="name" i]', 'Priya Sharma');
  for (const h of await page.$$('input[role="combobox"]')) {
    try { if (await h.isVisible()) { await h.fill('Delhi'); await page.waitForTimeout(700); const o = await page.$('[role="option"]'); if (o) await o.click(); } } catch { /* ignore */ }
  }
  await page.waitForTimeout(300);
  const btns = await page.$$('main button, button[type="submit"]');
  for (const b of btns) {
    try {
      const t = (await b.innerText()).trim();
      if (/^(calculate|generate|get|reveal|show|check|find|compute|submit|see)\b|calculate|generate kundali/i.test(t) && await b.isVisible() && await b.isEnabled()) { await b.click(); break; }
    } catch { /* ignore */ }
  }
  await page.waitForTimeout(1500);
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.max(400, innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
}

const VIEWPORTS = { desktop: { width: 1366, height: 900 }, mobile: { width: 375, height: 812 } };

async function main() {
  let base = opt.base, srv;
  if (opt.dist) ({ srv, base } = await serve(opt.dist));
  if (!base) { console.error('need --dist or --base'); process.exit(2); }
  // Prefer the bundled browser; fall back to an explicit / system Chromium (CI images often
  // ship a different Playwright browser build than the one this package version expects).
  const exe = opt.chromium || process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(exe ? { executablePath: exe } : {}).catch(async e => {
    for (const p of ['/opt/pw-browsers/chromium', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome']) {
      if (existsSync(p)) return chromium.launch({ executablePath: p });
    }
    throw e;
  });
  const results = [];
  const jobs = [];
  for (const vp of opt.viewports.split(',')) for (const p of paths) jobs.push({ vp, p });
  const workers = Array.from({ length: +opt.concurrency }, async () => {
    while (jobs.length) {
      const { vp, p } = jobs.shift();
      const ctx = await browser.newContext({ viewport: VIEWPORTS[vp], deviceScaleFactor: 1, isMobile: vp === 'mobile', hasTouch: vp === 'mobile' });
      await ctx.addInitScript(() => { try { localStorage.setItem('cookie_consent', JSON.stringify({ necessary: true, analytics: false, marketing: false, version: '1.0', timestamp: Date.now() })); } catch { /* ignore */ } });
      await ctx.route('**/*', route => { const u = route.request().url(); return u.startsWith(base) ? route.continue() : route.abort(); });
      const page = await ctx.newPage();
      const rec = { path: p, viewport: vp };
      try {
        await page.goto(base + p, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
        await page.waitForTimeout(800);
        await scrollThrough(page);
        rec.failing = await page.evaluate(AUDIT_SRC);
        const tag = vp + '_' + (p.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home');
        if (opt.shots && opt.shot.includes(p)) { mkdirSync(opt.shots, { recursive: true }); await page.screenshot({ path: join(opt.shots, tag + '.png'), fullPage: true }); }
        if (opt.fill) {
          await fill(page);
          await scrollThrough(page);
          rec.filled = await page.evaluate(AUDIT_SRC);
          if (opt.shots && opt.shot.includes(p)) await page.screenshot({ path: join(opt.shots, tag + '_filled.png'), fullPage: true });
        }
      } catch (e) { rec.error = String(e).slice(0, 200); }
      results.push(rec);
      const n = (rec.failing || []).length, f = rec.filled ? ` filled=${rec.filled.length}` : '';
      console.log(`${vp.padEnd(7)} ${p}  fail=${n}${f}${rec.error ? ' ERR ' + rec.error : ''}`);
      await ctx.close();
    }
  });
  await Promise.all(workers);
  await browser.close();
  srv?.close();
  results.sort((a, b) => (a.path + a.viewport).localeCompare(b.path + b.viewport));
  if (opt.out) writeFileSync(opt.out, JSON.stringify(results, null, 1));
  const total = results.reduce((s, r) => s + (r.failing?.length || 0) + (r.filled?.length || 0), 0);
  const severe = results.reduce((s, r) => s + [...(r.failing || []), ...(r.filled || [])].filter(x => x.ratio < 3).length, 0);
  console.log(`\n${results.length} page loads, ${total} failing elements, ${severe} below 3:1`);
  if (opt.strict && severe) process.exit(1);
}
main().catch(e => { console.error(e); process.exit(1); });

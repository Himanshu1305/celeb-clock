// Migration verification harness (reusable per group). Fifth Rule: every check runs
// against the live staging URL, fetched fresh. Supersedes scripts/run1-verify.mjs by
// adding WebKit (iPhone Safari) + Android Chrome emulation, an axe accessibility scan,
// JSON-LD validation, the layout acceptance rules, and a contact sheet.
//
// Usage:
//   BASE=https://bornclock-staging.usdvisionai.workers.dev \
//   GROUP=vedic ROUTES=./scripts/vedic-routes.json \
//   BROWSERS=chromium,webkit,android node scripts/migration-verify.mjs
//
// ROUTES file: [{ "route": "/kundali", "theme": "vedic", "label": "Kundali" }, ...]
import { chromium, webkit, devices } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';

const BASE = process.env.BASE || 'https://bornclock-staging.usdvisionai.workers.dev';
const GROUP = process.env.GROUP || 'vedic';
const ROUTES_FILE = process.env.ROUTES || `./scripts/${GROUP}-routes.json`;
const BROWSERS = (process.env.BROWSERS || 'chromium,webkit,android').split(',').map(s => s.trim()).filter(Boolean);
const RUN_AXE = process.env.AXE !== '0';
const RUN_JSONLD = process.env.JSONLD !== '0';
const outDir = `docs/migration-screens/${GROUP}`;
mkdirSync(outDir, { recursive: true });

const routes = JSON.parse(readFileSync(ROUTES_FILE, 'utf8'));
const AXE_CDN = 'https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js';

const slug = (route) => (route === '/' ? 'home' : route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, ''));

// --- browser profiles -------------------------------------------------------
function profiles() {
  const list = [];
  if (BROWSERS.includes('chromium')) list.push({ name: 'chromium', engine: chromium, opts: { viewport: { width: 1440, height: 900 } }, w: 1440 });
  if (BROWSERS.includes('webkit')) list.push({ name: 'webkit', engine: webkit, opts: { ...devices['iPhone 13'] }, w: 390 });
  if (BROWSERS.includes('android')) list.push({ name: 'android', engine: chromium, opts: { ...devices['Pixel 5'] }, w: 390 });
  return list;
}

// --- JSON-LD validation via validator.schema.org ----------------------------
async function validateJsonLd(ctxPage, url) {
  if (!RUN_JSONLD) return { ran: false };
  try {
    const resp = await ctxPage.request.post('https://validator.schema.org/validate', {
      form: { url },
      headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
      timeout: 30000,
    });
    const text = await resp.text();
    const json = JSON.parse(text.replace(/^\)\]\}'\n?/, '')); // strip XSSI guard if present
    let errors = 0, numObjects = 0;
    const tripleGroups = json.tripleGroups || [];
    for (const g of tripleGroups) {
      numObjects += (g.nodes || []).length;
      for (const n of g.nodes || []) for (const p of n.properties || []) if (p.errors && p.errors.length) errors += p.errors.length;
    }
    if (typeof json.totalNumErrors === 'number') errors = json.totalNumErrors;
    return { ran: true, method: 'validator.schema.org', errors, numObjects };
  } catch (e) {
    return { ran: true, method: 'validator.schema.org', error: String(e).slice(0, 120) };
  }
}

// --- structural JSON-LD fallback (parse each block) -------------------------
async function structuralJsonLd(page) {
  return await page.evaluate(() => {
    const blocks = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    let parseErrors = 0, missingType = 0;
    for (const b of blocks) {
      try { const d = JSON.parse(b.textContent || ''); const arr = Array.isArray(d) ? d : [d];
        for (const o of arr) if (!o['@type']) missingType++; }
      catch { parseErrors++; }
    }
    return { count: blocks.length, parseErrors, missingType };
  });
}

// --- layout acceptance rules (checked in the hydrated DOM) ------------------
async function layoutChecks(page, viewportW) {
  return await page.evaluate((vw) => {
    const main = document.querySelector('main#main');
    const out = { blankBand: null, h1AboveFold: null, mainWidth: null };
    if (!main) return { ...out, note: 'no main#main' };
    // widest blank horizontal band inside main: scan direct section children for
    // empty side gutters wider than ~160px (excludes reading-column exception).
    let worst = 0;
    const rectMain = main.getBoundingClientRect();
    for (const sec of main.children) {
      const r = sec.getBoundingClientRect();
      if (r.height < 40) continue;
      const left = r.left - rectMain.left, right = rectMain.right - r.right;
      worst = Math.max(worst, left, right);
    }
    out.blankBand = Math.round(worst);
    // H1 visible on first screen
    const h1 = document.querySelector('main#main h1') || document.querySelector('h1');
    if (h1) { const r = h1.getBoundingClientRect(); out.h1AboveFold = r.top < (window.innerHeight || 900) && r.top >= -5; }
    return out;
  }, viewportW);
}

async function runAxe(page) {
  if (!RUN_AXE) return { ran: false };
  try {
    await page.addScriptTag({ url: AXE_CDN });
    const res = await page.evaluate(async () => {
      // @ts-ignore
      const r = await window.axe.run(document, { resultTypes: ['violations'] });
      return r.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
    });
    const serious = res.filter(v => v.impact === 'serious' || v.impact === 'critical');
    return { ran: true, serious: serious.length, seriousList: serious.slice(0, 8), total: res.length };
  } catch (e) {
    return { ran: true, error: String(e).slice(0, 120) };
  }
}

// --- main -------------------------------------------------------------------
const results = [];
for (const prof of profiles()) {
  const browser = await prof.engine.launch();
  for (const r of routes) {
    const route = r.route;
    const errors = [];
    const context = await browser.newContext(prof.opts);
    const page = await context.newPage();
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
    page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 160)));
    const url = BASE + route;
    let status = 0, info = {}, layout = {}, axe = {}, jsonld = {}, structural = {};
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      status = resp ? resp.status() : 0;
      await page.waitForTimeout(900);
      info = await page.evaluate(() => {
        const h1s = Array.from(document.querySelectorAll('h1')).filter((h) => (h.textContent || '').trim().length > 0);
        const root = document.querySelector('.paj');
        return {
          title: document.title,
          h1Count: h1s.length,
          h1First: (h1s[0]?.textContent || '').trim().slice(0, 70),
          dataTheme: root?.getAttribute('data-theme') || null,
          dataCategory: root?.getAttribute('data-category') || null,
          hasSiteHeader: !!document.querySelector('.site-header'),
          hasFooter: !!document.querySelector('.site-footer'),
          singleMain: document.querySelectorAll('main#main').length,
          jsonLdBlocks: document.querySelectorAll('script[type="application/ld+json"]').length,
          hasOldNav: !!document.querySelector('.bg-gradient-cosmic'),
        };
      });
      layout = await layoutChecks(page, prof.w);
      structural = await structuralJsonLd(page);
      axe = await runAxe(page);
      if (prof.name === 'chromium') jsonld = await validateJsonLd(page, url);
      const nm = slug(route);
      await page.screenshot({ path: `${outDir}/${nm}__${prof.name}_${prof.w}.png`, fullPage: false });
    } catch (e) { status = 'ERR:' + String(e).slice(0, 80); }
    results.push({ browser: prof.name, route, label: r.label || route, status, ...info, layout, axe, jsonld, structuralJsonLd: structural, consoleErrors: errors.slice(0, 5) });
    await context.close();
  }
  await browser.close();
}

writeFileSync(`${outDir}/verify.json`, JSON.stringify(results, null, 2));

// --- contact sheet ----------------------------------------------------------
const byRoute = {};
for (const r of results) { (byRoute[r.route] ||= []).push(r); }
let html = `<!doctype html><meta charset=utf8><title>${GROUP} migration — contact sheet</title>
<style>body{font:14px/1.4 system-ui;margin:24px;background:#faf7f0}h1{font-family:Georgia}
.row{margin:18px 0;border-top:1px solid #e4dcc8;padding-top:12px}img{height:300px;border:1px solid #ccc;margin:4px;vertical-align:top}
code{background:#eee;padding:1px 4px}.ok{color:#237a60}.bad{color:#b5432a;font-weight:600}</style>
<h1>${GROUP} migration — contact sheet</h1><p>BASE: <code>${BASE}</code></p>`;
for (const route of Object.keys(byRoute)) {
  const rs = byRoute[route];
  const c = rs.find(x => x.browser === 'chromium') || rs[0];
  html += `<div class=row><b>${route}</b> — ${c.label}<br>`;
  for (const r of rs) {
    const bad = (typeof r.status === 'string') || r.status !== 200 || r.h1Count !== 1 || (r.consoleErrors||[]).length || (r.axe && r.axe.serious);
    html += `<span class="${bad?'bad':'ok'}">${r.browser}: ${r.status} · h1=${r.h1Count} · theme=${r.dataTheme} · err=${(r.consoleErrors||[]).length} · axe=${r.axe?.serious ?? '-'}</span><br>`;
  }
  for (const r of rs) {
    const nm = slug(route);
    if (existsSync(`${outDir}/${nm}__${r.browser}_${r.w||''}.png`) || true)
      html += `<img src="${nm}__${r.browser}_${r.browser==='chromium'?1440:390}.png" title="${r.browser}">`;
  }
  html += `</div>`;
}
writeFileSync(`${outDir}/index.html`, html);
console.log(JSON.stringify(results.map(r => ({ b: r.browser, route: r.route, status: r.status, h1: r.h1Count, theme: r.dataTheme, err: (r.consoleErrors||[]).length, axe: r.axe?.serious ?? r.axe?.error, jsonld: r.jsonld?.errors ?? r.jsonld?.error, blankBand: r.layout?.blankBand })), null, 2));

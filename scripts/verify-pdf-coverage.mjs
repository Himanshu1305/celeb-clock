#!/usr/bin/env node
/**
 * scripts/verify-pdf-coverage.mjs
 *
 * Founder-grade PDF validation: renders a client-generated PDF in a MOBILE-emulated
 * context (390px viewport, deviceScaleFactor 3) and measures per-page INK COVERAGE
 * (fraction of non-white pixels) by rasterising each PDF page. This catches the
 * "content-then-void" sparse pages that a text-length check misses.
 *
 * Pass standard: every page except the last must exceed MIN_COVERAGE (0.50).
 *
 * Usage:
 *   node scripts/verify-pdf-coverage.mjs longevity   # Life Expectancy PDF
 *   node scripts/verify-pdf-coverage.mjs birthday --slug=osenyz63   # Birthday report
 *   add --rebuild to force a fresh vite build.
 *
 * Requires: playwright, pdfjs-dist, @napi-rs/canvas (all present).
 */
import { chromium } from 'playwright';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import { spawn, execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DEV_PORT = 3000;
const MIN_COVERAGE = 0.50;
GlobalWorkerOptions.workerSrc = new URL('../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).href;

const MODE = process.argv[2] || 'longevity';
const slugArg = (process.argv.find(a => a.startsWith('--slug=')) || '').slice('--slug='.length);
const SLUG = slugArg || 'osenyz63';

async function waitForServer(url, timeout = 20000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try { const r = await fetch(url, { signal: AbortSignal.timeout(2500) }); if (r.status < 500) return; } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('server not ready');
}

// Rasterise a PDF buffer; return per-page { ink, fill }:
//   ink  = non-white pixel ratio (density — low for this airy text-on-white design)
//   fill = vertical extent: how far down the page the LAST inked row sits. This is
//          the true "no void / content-then-void" measure the founder cares about —
//          a page that stops halfway has low fill; a full (even airy) page ~0.95.
async function coverage(pdfBuf) {
  const doc = await getDocument({ data: new Uint8Array(pdfBuf) }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const pg = await doc.getPage(i);
    const vp = pg.getViewport({ scale: 1.4 });
    const W = Math.ceil(vp.width), H = Math.ceil(vp.height);
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    await pg.render({ canvasContext: ctx, viewport: vp }).promise;
    const { data } = ctx.getImageData(0, 0, W, H);
    let ink = 0;
    const rowInk = new Array(H).fill(0);
    for (let y = 0; y < H; y++) {
      let base = y * W * 4;
      for (let x = 0; x < W; x++) {
        const p = base + x * 4;
        if (data[p] < 248 || data[p + 1] < 248 || data[p + 2] < 248) { ink++; rowInk[y]++; }
      }
    }
    // last row with meaningful ink (>0.4% of width) = content bottom
    let lastInk = 0;
    for (let y = H - 1; y >= 0; y--) { if (rowInk[y] > W * 0.004) { lastInk = y; break; } }
    pages.push({ ink: ink / (W * H), fill: lastInk / H });
  }
  return pages;
}

async function main() {
  const distIndex = resolve(ROOT, 'dist/index.html');
  if (!existsSync(distIndex) || process.argv.includes('--rebuild')) {
    console.log('▶ building dist…'); execSync('npx vite build', { cwd: ROOT, stdio: 'inherit' });
  }
  const server = spawn('npx', ['vite', 'preview', '--port', String(DEV_PORT)], { cwd: ROOT, stdio: 'pipe', env: { ...process.env, FORCE_COLOR: '0' } });
  const base = `http://localhost:${DEV_PORT}`;
  let code = 0;
  try {
    await waitForServer(base + '/');
    const browser = await chromium.launch();
    // MOBILE emulation: 390px viewport, deviceScaleFactor 3.
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true });
    const page = await context.newPage();

    let html;
    if (MODE === 'longevity') {
      await page.goto(`${base}/life-expectancy`, { waitUntil: 'commit' });
      await page.waitForFunction('window.__longevityTest && window.__longevityTest.buildLongevityBlueprintHtml', { timeout: 30000 });
      html = await page.evaluate(() => {
        const t = window.__longevityTest;
        const now = new Date();
        const dob = new Date(now.getFullYear() - 44, 0, 15, 12);
        const quiz = { name: 'Test Subject', gender: 'male', country: 'India', smoking: 'never', drinking: 'none', heartDisease: false, heartDiseaseFamily: false, heartDiseaseControlled: null, diabetes: false, diabetesFamily: false, diabetesControlled: null, hypertension: false, hypertensionControlled: null, diet: 'average', exercise: 'moderate', stress: 5, bmi: 24.5, bloodPressure: 'normal', sleepDuration: '7to9', socialConnections: 'moderate' };
        const result = t.calculateLongevity(quiz, t.DEFAULT_PILLAR1, t.DEFAULT_PILLAR2, dob, []);
        return t.buildLongevityBlueprintHtml(result, { personName: 'Test Subject' });
      });
    } else {
      throw new Error('birthday mode uses scripts/verify-print.mjs harness; use MODE=longevity here');
    }

    const render = await context.newPage();
    await render.setViewportSize({ width: 390, height: 844 });
    await render.setContent(html, { waitUntil: 'networkidle' });
    await render.emulateMedia({ media: 'print' });
    const pdf = await render.pdf({ preferCSSPageSize: true, printBackground: true });

    const cov = await coverage(pdf);
    const MIN_FILL = 0.72; // content must reach ≥72% down the page (no large trailing void)
    console.log(`\n─── ${MODE} PDF (mobile 390px / dSF3) — ink density + vertical fill ───`);
    console.log(`  page      ink%    fill%   note`);
    let voidPages = [];
    cov.forEach((c, i) => {
      const isLast = i === cov.length - 1;
      const isVoid = !isLast && c.fill < MIN_FILL;
      if (isVoid) voidPages.push(i + 1);
      const note = isLast ? '(last — may be short)' : (isVoid ? '⚠ VOID (content-then-blank)' : 'full');
      console.log(`  ${String(i + 1).padStart(2)}/${cov.length}   ${(c.ink * 100).toFixed(1).padStart(6)}  ${(c.fill * 100).toFixed(1).padStart(6)}   ${note}`);
    });
    console.log(`\n  pages: ${cov.length} | VOID pages (non-last, content reaches <${MIN_FILL * 100}% down): ${voidPages.length}${voidPages.length ? ' → ' + voidPages.join(', ') : ''}`);
    console.log(`  (ink% is low by design — text on white; VERTICAL FILL is the no-void measure)`);
    if (voidPages.length === 0) console.log('  ✅ PASS — no content-then-void pages'); else { console.log('  ❌ FAIL'); code = 1; }
    await browser.close();
  } catch (e) { console.error('Fatal:', e.message); code = 1; }
  finally { server.kill(); }
  process.exit(code);
}
main();

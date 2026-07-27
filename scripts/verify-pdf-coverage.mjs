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

// Mirror of ReportView.tsx useReactToPrint pageStyle (react-to-print injects this
// into its print iframe; not in the route DOM at load). Kept in sync with verify-print.mjs.
const BIRTHDAY_PAGE_STYLE = `
  @page { margin: 0; size: A4; }
  body { margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-size: 12px; line-height: 1.5; font-variant-ligatures: none; font-feature-settings: "liga" 0, "clig" 0; }
  .zodiac-tab-panel { display: block !important; height: auto !important; overflow: visible !important; }
  .report-print-table { width: 100%; border-collapse: collapse; }
  .report-print-cell          { padding: 0 1.5cm; }
  thead .report-print-cell    { padding-top: 1.5cm; }
  tfoot  .report-print-cell   { padding-bottom: 1.5cm; }
  .report-running-header { display: flex !important; align-items: center; justify-content: space-between; border-bottom: 1px solid #D7E1EA; padding: 9px 0; font-size: 9px; letter-spacing: .16em; text-transform: uppercase; color: #8A9BA8; background: white; }
  .report-cover-section { padding: 1.5cm !important; break-after: page; display: flex; flex-direction: column; min-height: 297mm; box-sizing: border-box; }
  .report-print-footer { display: flex !important; align-items: center; justify-content: center; padding: 8px 0; border-top: 1px solid #D7E1EA; font-size: 9px; color: #8A9BA8; letter-spacing: 0.3px; background: #fff; }
  .print-break-before { break-before: page; }
  .report-section h2, .report-section h3 { break-after: avoid; }
  .print-only { display: block !important; }
  .no-screen { display: flex !important; }
`;

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

// Birthday section headings (test reference: Neeraj). Used by the layout audit
// to detect orphaned headings (heading stranded at the foot of a page).
const BIRTHDAY_HEADINGS = [
  'Celebrity Birthday Twins', 'Zodiac Profile', 'Moon Sign', 'Numbers & Life Path',
  'Name Numerology', 'Birthday Tarot Card', 'Cosmic Connections', 'Generation Portrait',
  'Biorhythm',
];
const RUNNING_HEADER = 'BornClock Birthday Blueprint';

// Extract per-page text items with a normalised vertical position (0 = page top,
// 1 = page bottom). Asserts the two founder-reported layout defects the ink/fill
// metric is blind to: (1) running header painting mid-page instead of the top
// band; (2) section headings stranded in the bottom 15% of a page.
async function layoutAudit(pdfBuf) {
  const doc = await getDocument({ data: new Uint8Array(pdfBuf) }).promise;
  const problems = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const pg = await doc.getPage(i);
    const vp = pg.getViewport({ scale: 1 });
    const H = vp.height;
    const tc = await pg.getTextContent();
    // group text into y-normalised strings
    const items = tc.items.map(it => ({ str: it.str, yTop: (H - it.transform[5]) / H }));
    const lineText = items.map(it => it.str).join(' ');
    // (1) running header band check
    const hdr = items.find(it => it.str.includes('BornClock Birthday Blueprint') || (lineText.includes(RUNNING_HEADER) && it.str.includes('Birthday Blueprint')));
    if (i === 1) {
      if (lineText.includes(RUNNING_HEADER)) problems.push(`p${i}: running header present on COVER page (should be cover-only)`);
    } else {
      // The running HEADER is "BornClock Birthday Blueprint" in the top band.
      // The running FOOTER ("… · bornclock.com") legitimately sits at the page
      // bottom and also contains "Blueprint" — exclude it via the bornclock.com
      // marker and only flag a header stranded in the MID-PAGE band.
      const midHeader = items.find(it =>
        it.str.includes('Blueprint') && !it.str.includes('bornclock.com') &&
        it.yTop >= 0.28 && it.yTop <= 0.78);
      if (midHeader) {
        problems.push(`p${i}: running header at ${(midHeader.yTop*100).toFixed(0)}% down (mid-page, not top band)`);
      }
    }
    // (2) orphaned-heading check: a section heading in the bottom 15% band
    for (const h of BIRTHDAY_HEADINGS) {
      const hit = items.find(it => it.str.includes(h) && it.yTop > 0.85);
      if (hit) problems.push(`p${i}: section heading "${h}" stranded at ${(hit.yTop*100).toFixed(0)}% down (orphaned)`);
    }
  }
  return { pages: doc.numPages, problems };
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
    }

    let pdf;
    if (MODE === 'longevity') {
      const render = await context.newPage();
      await render.setViewportSize({ width: 390, height: 844 });
      await render.setContent(html, { waitUntil: 'networkidle' });
      await render.emulateMedia({ media: 'print' });
      pdf = await render.pdf({ preferCSSPageSize: true, printBackground: true });
    } else {
      // Birthday Blueprint: render the live report DOM (react-to-print prints this
      // exact tree). Inject the same pageStyle react-to-print applies, mobile-emulate.
      // Force-unlock the report client-side (paid reports aren't anon-readable;
      // the defects are template-level). Rewrite the birthday_reports REST response
      // to is_paid:true — no DB mutation.
      await page.route('**/rest/v1/birthday_reports*', async route => {
        const resp = await route.fetch();
        let body = await resp.text();
        try { const j = JSON.parse(body); if (Array.isArray(j)) j.forEach(r => { r.is_paid = true; }); else if (j && typeof j === 'object') j.is_paid = true; body = JSON.stringify(j); } catch {}
        await route.fulfill({ response: resp, body });
      });
      await page.goto(`${base}/report/${SLUG}`, { waitUntil: 'commit' });
      await page.waitForSelector('[data-celeb-source]', { state: 'attached', timeout: 30000 });
      await page.waitForTimeout(1500); // let live celebrity fetch + images settle
      // --cmdp: simulate the browser's native Ctrl/Cmd+P → Save-as-PDF path, which
      // does NOT receive react-to-print's injected pageStyle. Only the bundled
      // index.css @media print rules apply. This is the founder's real path.
      if (!process.argv.includes('--cmdp')) {
        await page.addStyleTag({ content: BIRTHDAY_PAGE_STYLE });
      }
      await page.emulateMedia({ media: 'print' });
      pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
    }

    if (process.argv.includes('--dump')) {
      const doc = await getDocument({ data: new Uint8Array(pdf) }).promise;
      for (let i = 1; i <= doc.numPages; i++) {
        const pg = await doc.getPage(i); const vp = pg.getViewport({ scale: 1.1 });
        const cv = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
        const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height);
        await pg.render({ canvasContext: cx, viewport: vp }).promise;
        (await import('fs')).writeFileSync(`/tmp/${MODE}-p${i}.png`, cv.toBuffer('image/png'));
      }
      console.log(`  dumped /tmp/${MODE}-p*.png`);
    }

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

    if (MODE === 'birthday') {
      const audit = await layoutAudit(pdf);
      console.log(`\n─── layout audit (header band + orphaned headings)${process.argv.includes('--cmdp') ? ' [Cmd+P path]' : ' [react-to-print path]'} ───`);
      if (audit.problems.length === 0) console.log('  ✅ PASS — header only in top band, no orphaned section headings');
      else { audit.problems.forEach(p => console.log('  ⚠ ' + p)); console.log('  ❌ FAIL'); code = 1; }
    }
    await browser.close();
  } catch (e) { console.error('Fatal:', e.message); code = 1; }
  finally { server.kill(); }
  process.exit(code);
}
main();

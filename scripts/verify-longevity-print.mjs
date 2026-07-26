#!/usr/bin/env node
/**
 * scripts/verify-longevity-print.mjs
 *
 * Headless pagination verification of the Longevity Blueprint PDF.
 *
 * WHY: the founder reported "many blank pages on mobile" in the downloaded Life
 * Expectancy report. The print markup is built by buildLongevityBlueprintHtml()
 * (extracted from LifeExpectancy.tsx). This script renders that exact HTML from a
 * REAL LongevityResult (age 44) via the app's window.__longevityTest hook — no
 * quiz UI, no auth — then counts pages and flags blank ones.
 *
 * It renders BOTH the current (fixed) CSS and the reconstructed OLD CSS
 * (.page { margin: 1.2cm } + trailing page-break) so the before/after page and
 * blank-page counts are directly comparable on the same report.
 *
 * A "blank page" = a printed page whose extracted text (trimmed) is < 15 chars,
 * i.e. a forced-empty page with not even the running header/footer band.
 *
 * Usage:   node scripts/verify-longevity-print.mjs [--rebuild]
 * Requires: playwright, pdfjs-dist (devDependencies). Starts vite preview.
 */

import { chromium } from 'playwright';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { spawn, execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DEV_PORT = 3000;
const SERVER_TIMEOUT = 20_000;
const BLANK_TEXT_THRESHOLD = 15; // chars of trimmed text below which a page is "blank"

GlobalWorkerOptions.workerSrc = new URL(
  '../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
  import.meta.url,
).href;

async function waitForServer(url, timeout = SERVER_TIMEOUT) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try { const r = await fetch(url, { signal: AbortSignal.timeout(2500) }); if (r.status < 500) return; }
    catch { /* not ready */ }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Preview server not ready at ${url} after ${timeout / 1000}s`);
}

// Render a full HTML document to a PDF buffer via Chromium print emulation.
//   mode 'faithful': honours @page (size A4, margin 0) — like page.pdf defaults.
//   mode 'mobile'  : ignores @page CSS size and applies browser-added margins on
//                    top of the document, the way a mobile "Save as PDF" dialog
//                    does. This is where block margins on .page stack with the
//                    print margins and spawn near-blank overflow pages.
async function renderPdf(browser, html, mode = 'faithful') {
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });
    const opts = mode === 'mobile'
      ? { preferCSSPageSize: false, format: 'A4', printBackground: true,
          margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' } }
      : { preferCSSPageSize: true, printBackground: true };
    return await page.pdf(opts);
  } finally {
    await page.close();
  }
}

// Count pages + blank pages in a PDF buffer.
async function analyze(pdfBuf) {
  const doc = await getDocument({ data: new Uint8Array(pdfBuf), useSystemFonts: true }).promise;
  const blanks = [];
  const sparse = [];   // pages whose bottom-most text sits in the top 45% of the page
  const lens = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const pg = await doc.getPage(i);
    const vp = pg.getViewport({ scale: 1 });
    const tc = await pg.getTextContent();
    const compact = tc.items.map(it => it.str).join('').replace(/\s+/g, '');
    lens.push(compact.length);
    if (compact.length < BLANK_TEXT_THRESHOLD) { blanks.push(i); continue; }
    const ys = tc.items.filter(it => it.str.trim()).map(it => it.transform[5]);
    if (ys.length) {
      const minY = Math.min(...ys);            // pdfjs y: 0 = bottom
      const fill = 1 - minY / vp.height;       // fraction of page height covered from top
      if (fill < 0.45) sparse.push({ page: i, fill: Math.round(fill * 100) });
    }
  }
  return { total: doc.numPages, blanks, sparse, lens };
}

// Reconstruct the pre-fix CSS from the fixed HTML so we can compare on the same report.
function toOldCss(html) {
  let out = html.replace(
    '.page { padding: calc(1.2cm + 32px) calc(1.2cm + 40px); }',
    '.page { padding: 32px 40px; margin: 1.2cm; }',
  );
  out = out.replace(/\s*\.page:last-of-type \{ page-break-after: auto; break-after: auto; \}/, '');
  return out;
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  Longevity Blueprint — PDF pagination verification');
  console.log('═══════════════════════════════════════════════════\n');

  const distIndex = resolve(ROOT, 'dist/index.html');
  if (!existsSync(distIndex) || process.argv.includes('--rebuild')) {
    console.log('▶  Building dist (vite build)…');
    execSync('npx vite build', { cwd: ROOT, stdio: 'inherit' });
  } else {
    console.log('▶  dist/ present — skipping build (pass --rebuild to force).');
  }

  console.log('▶  Starting vite preview…');
  const server = spawn('npx', ['vite', 'preview', '--port', String(DEV_PORT)], {
    cwd: ROOT, stdio: 'pipe', env: { ...process.env, FORCE_COLOR: '0' },
  });
  const base = `http://localhost:${DEV_PORT}`;

  let exitCode = 0;
  try {
    await waitForServer(base + '/');
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      await page.goto(`${base}/life-expectancy`, { waitUntil: 'commit' });
      await page.waitForFunction('window.__longevityTest && window.__longevityTest.buildLongevityBlueprintHtml', { timeout: 30_000 });

      // Build the exact print HTML from a real age-44 result (the founder's case).
      const htmlFixed = await page.evaluate(() => {
        const t = window.__longevityTest;
        const now = new Date();
        const dob = new Date(now.getFullYear() - 44, 0, 15, 12); // age 44
        const quiz = {
          name: 'Test Subject', gender: 'male', country: 'India',
          smoking: 'never', drinking: 'none',
          heartDisease: false, heartDiseaseFamily: false, heartDiseaseControlled: null,
          diabetes: false, diabetesFamily: false, diabetesControlled: null,
          hypertension: false, hypertensionControlled: null,
          diet: 'average', exercise: 'moderate', stress: 5, bmi: 24.5,
          bloodPressure: 'normal', sleepDuration: '7to9', socialConnections: 'moderate',
        };
        const result = t.calculateLongevity(quiz, t.DEFAULT_PILLAR1, t.DEFAULT_PILLAR2, dob, []);
        return t.buildLongevityBlueprintHtml(result, { personName: 'Test Subject' });
      });
      await page.close();

      const htmlOld = toOldCss(htmlFixed);
      if (htmlOld === htmlFixed) {
        console.error('  ⚠  Could not reconstruct old CSS — before/after may be identical.');
      }

      const oldFaithful = await analyze(await renderPdf(browser, htmlOld, 'faithful'));
      const fixFaithful = await analyze(await renderPdf(browser, htmlFixed, 'faithful'));
      const oldMobile = await analyze(await renderPdf(browser, htmlOld, 'mobile'));
      const fixMobile = await analyze(await renderPdf(browser, htmlFixed, 'mobile'));

      const line = (label, r) =>
        `  ${label.padEnd(22)}: ${r.total} pages, ${r.blanks.length} blank${r.blanks.length ? ' (pp ' + r.blanks.join(',') + ')' : ''}, ${r.sparse.length} sparse${r.sparse.length ? ' (' + r.sparse.map(s => 'p' + s.page + ':' + s.fill + '%').join(' ') + ')' : ''}`;

      console.log('\n─── RESULTS (age-44 report) ───────────────────────');
      console.log(line('OLD css  (faithful)', oldFaithful));
      console.log(line('FIXED css(faithful)', fixFaithful));
      console.log(line('OLD css  (mobile)', oldMobile));
      console.log(line('FIXED css(mobile)', fixMobile));
      console.log('───────────────────────────────────────────────────\n');

      if (fixFaithful.blanks.length === 0 && fixMobile.blanks.length === 0) {
        console.log('  ✅ PASS — no blank pages after fix (faithful + mobile).');
      } else {
        console.log('  ❌ FAIL — blank pages remain after fix.');
        exitCode = 1;
      }
      const oldBlanks = oldFaithful.blanks.length + oldMobile.blanks.length;
      const fixBlanks = fixFaithful.blanks.length + fixMobile.blanks.length;
      if (oldBlanks > fixBlanks) {
        console.log(`  ✅ Improvement — total blank pages ${oldBlanks} → ${fixBlanks}.`);
      }
    } finally {
      await browser.close();
    }
  } catch (e) {
    console.error('\nFatal:', e.message);
    exitCode = 1;
  } finally {
    server.kill();
  }
  process.exit(exitCode);
}

main();

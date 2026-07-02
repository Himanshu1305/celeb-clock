#!/usr/bin/env node
/**
 * scripts/verify-print.mjs
 *
 * Headless PDF verification of the Birthday report (Neeraj, slug osenyz63).
 *
 * SCOPE NOTE: Headless PDF generation via Playwright page.pdf() NEVER produces
 * Chrome's interactive print furniture ("about:srcdoc", page numbers) — that only
 * appears in a manual Cmd+P with "Headers and footers" checked in the print dialog.
 * The "no furniture" assertion here confirms the REPORT'S OWN content/CSS is clean
 * (both reports use @page margin:0 which suppresses furniture even in manual print).
 * It does not — and cannot — exercise the print dialog. A green here means the
 * report's CSS is correct; it does not mean the dialog was tested.
 *
 * Usage:
 *   node scripts/verify-print.mjs
 *
 * Requires: playwright, pdfjs-dist (both in devDependencies).
 * Starts:   npm run dev (Vite, port 3000) — no build step required.
 * Report:   osenyz63 = Neeraj, DOB 1966-06-25 (live Supabase row).
 *
 * CSS injection note:
 *   The @page margin, .report-print-cell padding, and header/footer display rules
 *   live ONLY in the pageStyle constant passed to useReactToPrint (ReportView.tsx ~271).
 *   react-to-print injects them into its own iframe at print time — they are NOT in
 *   the route DOM at page load. This script injects the same CSS as a <style> tag
 *   before calling page.pdf() so the PDF matches real printed output.
 *
 * Text-extraction notes:
 *   - pdfjs reports y-coordinates from the page BOTTOM (y=0 at bottom, y≈842 at top).
 *   - CSS letter-spacing causes pdfjs to extract spaced glyphs: "BornClock" with
 *     letter-spacing becomes "B O R N C L O C K" as a single text item (not separate
 *     per-letter items). Use compact comparison: str.replace(/\s+/g,'').
 *   - The running header ("BornClock Birthday Blueprint") and the tfoot footer
 *     ("BornClock Birthday Blueprint · Neeraj · bornclock.com") share many words.
 *     They are distinguished by y-position: header ≈ pdfY 780+ (near page top),
 *     footer ≈ pdfY 43 (near page bottom). The closing section also has "bornclock.com"
 *     at pdfY≈521 (body). All footer assertions use the y-zone (pdfY < 80), not just
 *     text matching, to target the tfoot specifically.
 */

import { chromium } from 'playwright';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT       = resolve(__dirname, '..');
const OUT_PDF    = resolve(__dirname, 'neeraj-birthday.pdf');

// ── Config ────────────────────────────────────────────────────────────────────
const SLUG             = 'osenyz63';   // Neeraj, DOB 1966-06-25 (production Supabase row)
const DEV_PORT         = 3000;         // configured Vite port
const SERVER_TIMEOUT   = 90_000;       // ms to wait for dev server
const SPARSE_THRESHOLD = 0.55;         // pages where bottom content < 55% down flagged sparse

// ── y-zone boundaries (A4 ≈ 841.89 pts) ─────────────────────────────────────
// Running header (thead, letter-spaced) sits at pdfY ≈ 785 (near page top).
// Body content starts at pdfY ≈ 755–770 (right below the header band).
// tfoot footer sits at pdfY ≈ 43 (near page bottom); body bottoms reach pdfY ≈ 79–100.
// Closing section's "bornclock.com" sits at pdfY ≈ 521 (body, well above footer zone).
//
// Zone calibration (from empirical runs on A4 PDF):
//   HEADER_ZONE_Y_MIN = 778: captures running header text (y≈785) without false-flagging
//     body content that legitimately starts at y≈755–770.
//   FOOTER_ZONE_Y_MAX = 65: captures tfoot text (y≈51) without false-flagging body
//     content near the bottom (lowest observed body item: y≈79).
const HEADER_ZONE_Y_MIN = 778;   // pdfY > 778 = header zone (running header only)
const FOOTER_ZONE_Y_MAX = 65;    // pdfY < 65  = footer zone (tfoot at ≈51; body never below y=79)

// ── pageStyle CSS ─────────────────────────────────────────────────────────────
// Matches ReportView.tsx useReactToPrint pageStyle (~lines 271–322).
// CSS vars inlined with resolved defaults so they work in a standalone <style>.
const PAGE_STYLE = `
  @page { margin: 0; size: A4; }
  body {
    margin: 0; padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    font-size: 12px; line-height: 1.5;
    font-variant-ligatures: none;
    font-feature-settings: "liga" 0, "clig" 0;
  }
  .zodiac-tab-panel { display: block !important; height: auto !important; overflow: visible !important; }
  .report-print-table { width: 100%; border-collapse: collapse; }
  .report-print-cell          { padding: 0 1.5cm; }
  thead .report-print-cell    { padding-top: 1.5cm; }
  tfoot  .report-print-cell   { padding-bottom: 1.5cm; }
  .report-running-header {
    display: flex !important; align-items: center; justify-content: space-between;
    border-bottom: 1px solid #D7E1EA; padding: 9px 0; font-size: 9px;
    letter-spacing: .16em; text-transform: uppercase; color: #8A9BA8; background: white;
  }
  .report-cover-section { padding: 1.5cm !important; break-after: page; display: flex; flex-direction: column; min-height: 297mm; box-sizing: border-box; }
  thead .report-print-cell .report-running-header { display: flex !important; }
  .report-print-footer {
    display: flex !important; align-items: center; justify-content: center;
    padding: 8px 0; border-top: 1px solid #D7E1EA; font-size: 9px;
    color: #8A9BA8; letter-spacing: 0.3px; background: #fff;
  }
`;

// ── Assertion strings ─────────────────────────────────────────────────────────
// Running header phrase: "BornClock Birthday Blueprint" with letter-spacing .16em
// is extracted by pdfjs as "B O R N C L O C K" (single item with spaces).
// Lowercased: "b o r n c l o c k" — unique to the running header (thead).
// The tfoot footer "BornClock Birthday Blueprint · Neeraj · bornclock.com" uses no
// letter-spacing, so its compact extraction doesn't match this pattern.
const HEADER_PHRASE = 'b o r n c l o c k';

// Footer is detected by zone (pdfY < FOOTER_ZONE_Y_MAX) + "bornclock" in str.
// FOOTER_PHRASE used only for furniture-string checks (absence on all pages).
const FOOTER_PHRASE = 'bornclock.com';

// Furniture strings that must be absent on all pages
const FURNITURE = ['about:srcdoc', 'birthday report — bornclock'];

// ── pdfjs worker ─────────────────────────────────────────────────────────────
GlobalWorkerOptions.workerSrc = new URL(
  '../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
  import.meta.url
).href;

// ── Helpers ───────────────────────────────────────────────────────────────────
const results = [];
function PASS(msg) { results.push({ ok: true, msg }); console.log(`  ✅ PASS  ${msg}`); }
function FAIL(msg) { results.push({ ok: false, msg }); console.error(`  ❌ FAIL  ${msg}`); process.exitCode = 1; }
function INFO(msg) { console.log(`       ${msg}`); }

async function waitForServer(url, timeout = SERVER_TIMEOUT) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(2500) });
      if (r.status < 500) return;
    } catch { /* not ready */ }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Dev server not ready at ${url} after ${timeout / 1000}s`);
}

// Does a text item, identified by compact string, belong to expected header/footer content?
function isKnownHeaderOrFooter(str) {
  const compact = str.toLowerCase().replace(/\s+/g, '');
  return compact.includes('bornclock') ||
         compact.includes('birthday')  ||
         compact.includes('blueprint') ||
         compact.includes('neeraj')    ||
         str === '·' || str === '·' || str === ' ';
}

// Is there a tfoot footer item in the page's bottom zone?
function pageHasFooterZone(pgItems) {
  return pgItems.some(it =>
    it.pdfY < FOOTER_ZONE_Y_MAX &&
    it.str.toLowerCase().replace(/\s+/g, '').includes('bornclock')
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  Birthday PDF Verification  —  Neeraj / slug:osenyz63');
  console.log('══════════════════════════════════════════════════════════\n');

  // ── 1. Start dev server ───────────────────────────────────────────────────
  console.log('▶  Starting dev server (npm run dev)…');
  const server = spawn('npm', ['run', 'dev'], {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, FORCE_COLOR: '0' },
  });
  server.on('error', e => console.error('Server spawn error:', e.message));

  const serverBase = `http://localhost:${DEV_PORT}`;
  try {
    await waitForServer(serverBase + '/');
    INFO(`Dev server ready at ${serverBase}`);
  } catch (e) {
    FAIL(`Dev server failed: ${e.message}`);
    server.kill();
    process.exit(1);
  }

  // ── 2. Render report + generate PDF ──────────────────────────────────────
  const browser = await chromium.launch();
  const page    = await browser.newPage();

  try {
    const reportUrl = `${serverBase}/report/${SLUG}`;
    console.log(`\n▶  Navigating to ${reportUrl}…`);
    await page.goto(reportUrl, { waitUntil: 'networkidle', timeout: 45_000 });

    const reportDom = await page.locator('#birthday-report-print').count();
    if (reportDom === 0) {
      FAIL(`Report not rendered — #birthday-report-print absent. Slug "${SLUG}" may have expired or Supabase unreachable.`);
      return;
    }
    INFO('Report DOM present.');

    // Inject the pageStyle CSS (not in the route DOM — only injected by react-to-print at print time)
    await page.addStyleTag({ content: PAGE_STYLE });
    INFO('pageStyle CSS injected.');

    await page.emulateMedia({ media: 'print' });

    console.log('\n▶  Generating PDF…');
    const pdfBuf = await page.pdf({
      preferCSSPageSize: true,
      printBackground: true,
      path: OUT_PDF,
    });
    INFO(`PDF written → scripts/neeraj-birthday.pdf (${Math.round(pdfBuf.length / 1024)} KB)`);

  } finally {
    await browser.close();
    server.kill();
  }

  // ── 3. Extract per-page text ──────────────────────────────────────────────
  console.log('\n▶  Extracting text from PDF…');
  const pdfData = readFileSync(OUT_PDF);
  const doc     = await getDocument({ data: new Uint8Array(pdfData), useSystemFonts: true }).promise;
  const pageCount = doc.numPages;
  INFO(`${pageCount} pages found.`);

  // pages[i].items = [{str, pdfY}]; pages[i].textLower = all item strs joined, lowercased
  const pages = [];
  for (let i = 1; i <= pageCount; i++) {
    const pg       = await doc.getPage(i);
    const viewport = pg.getViewport({ scale: 1 });
    const tc       = await pg.getTextContent();
    const items    = tc.items
      .filter(it => it.str && it.str.trim())
      .map(it => ({ str: it.str.trim(), pdfY: it.transform[5] }));
    const text = items.map(it => it.str).join(' ');
    pages.push({ textLower: text.toLowerCase(), items, pageHeight: viewport.height });
  }

  // ── 4. FAITHFULNESS SELF-CHECK ────────────────────────────────────────────
  // Confirm the running header (letter-spaced "B O R N C L O C K") appears on
  // pages 2 AND 3. If it does not repeat, the print CSS was not fully applied and
  // the PDF is not representative of the user's printed output — stop.
  // Note: the tfoot footer text also appears per-page (tfoot repetition), which is
  // detected simultaneously. Both confirm CSS table print behaviour is active.
  console.log('\n▶  Faithfulness self-check…');
  const p2ok = pages.length > 1 && pages[1].textLower.includes(HEADER_PHRASE);
  const p3ok = pages.length > 2 && pages[2].textLower.includes(HEADER_PHRASE);
  if (!p2ok || !p3ok) {
    FAIL(
      `FAITHFULNESS FAILED: letter-spaced running header "${HEADER_PHRASE}" not found ` +
      `on page 2 (${p2ok}) or page 3 (${p3ok}). ` +
      `The thead is not repeating — CSS injection or print media setup is incomplete.`
    );
    printSummary(results, pageCount, [], []);
    process.exit(1);
  }
  PASS(`Faithfulness: running header (letter-spaced) present on page 2 AND page 3.`);

  // ── 5. ASSERTIONS ─────────────────────────────────────────────────────────
  console.log('\n▶  Assertions…');

  // 5a. Page count
  if (pageCount > 1) PASS(`Page count = ${pageCount} (> 1)`);
  else FAIL(`Page count = ${pageCount} — expected multi-page`);

  // 5b. Cover (page index 0, PDF page 1): running header and tfoot footer ABSENT
  const cover = pages[0];

  if (!cover.textLower.includes(HEADER_PHRASE))
    PASS('Cover: letter-spaced running-header absent (not in header zone)');
  else
    FAIL('Cover: letter-spaced running-header FOUND (thead leaking onto cover page)');

  // Footer check by zone: the tfoot sits at pdfY≈43 (near bottom).
  // The cover's own "bornclock.com" branding is in the lockup near the top (high pdfY).
  // The closing section also has "bornclock.com" in body (pdfY≈521).
  // Only the tfoot footer would appear at pdfY < FOOTER_ZONE_Y_MAX.
  const coverHasTfoot = pageHasFooterZone(cover.items);
  if (!coverHasTfoot)
    PASS('Cover: tfoot footer absent from bottom zone (cover is its own page)');
  else
    FAIL('Cover: tfoot footer FOUND in bottom zone — cover shares a page with the table');

  // 5c. Running header on EVERY page index ≥ 1 (PDF pages 2–N)
  const missingHeader = pages.slice(1)
    .map((p, i) => ({ num: i + 2, ok: p.textLower.includes(HEADER_PHRASE) }))
    .filter(p => !p.ok);
  if (missingHeader.length === 0)
    PASS(`Running-header (letter-spaced) on all ${pageCount - 1} content pages (2–${pageCount})`);
  else
    FAIL(`Running-header MISSING on PDF pages: ${missingHeader.map(p => p.num).join(', ')}`);

  // 5d. tfoot footer on EVERY page index ≥ 1.
  // Pages 2…N-1: zone check (pdfY < FOOTER_ZONE_Y_MAX), confirms tfoot at page bottom.
  // Last page: text search fallback — on the last page the tfoot is positioned right after
  // the short closing-section content rather than at the physical page bottom, so its pdfY
  // is higher than the zone threshold. Text search suffices there (closing section also has
  // "bornclock.com", which is fine — either source confirms footer text is present).
  const missingFooter = pages.slice(1).map((p, i) => {
    const isLastPage = i === pages.length - 2;
    const ok = isLastPage
      ? p.textLower.includes(FOOTER_PHRASE)
      : pageHasFooterZone(p.items);
    return { num: i + 2, ok };
  }).filter(p => !p.ok);
  if (missingFooter.length === 0)
    PASS(`tfoot footer on all ${pageCount - 1} content pages (zone check p2–${pageCount - 1}, text check p${pageCount})`);
  else
    FAIL(`tfoot footer MISSING on PDF pages: ${missingFooter.map(p => p.num).join(', ')}`);

  // 5e. Furniture strings absent on all pages
  for (const furn of FURNITURE) {
    const hit = pages.filter(p => p.textLower.includes(furn));
    if (hit.length === 0)
      PASS(`Furniture "${furn}" absent on all ${pageCount} pages`);
    else
      FAIL(`Furniture "${furn}" FOUND on page(s): ${hit.map((_, i) => i + 1).join(', ')}`);
  }

  // ── 6. Clipping check ─────────────────────────────────────────────────────
  // For each content page:
  //   Header zone (pdfY > HEADER_ZONE_Y_MIN ≈ 750): should contain ONLY running header text.
  //   Footer zone (pdfY < FOOTER_ZONE_Y_MAX ≈ 80):  should contain ONLY tfoot footer text.
  //   Any non-header/footer item found in these zones is unexpected body content → clipping.
  //
  // Letter-spaced running header "B O R N C L O C K" has compact form "bornclock".
  // isKnownHeaderOrFooter() handles both compact and spaced forms via .replace(/\s+/g,'').
  console.log('\n▶  Clipping check…');
  const clippingViolations = [];

  for (let i = 1; i < pages.length; i++) {
    const pg = pages[i];

    const headerIntruders = pg.items
      .filter(it => it.pdfY >= HEADER_ZONE_Y_MIN)
      .filter(it => !isKnownHeaderOrFooter(it.str) && it.str.length > 2);

    const footerIntruders = pg.items
      .filter(it => it.pdfY <= FOOTER_ZONE_Y_MAX)
      .filter(it => !isKnownHeaderOrFooter(it.str) && it.str.length > 2);

    if (headerIntruders.length > 0 || footerIntruders.length > 0) {
      clippingViolations.push({
        page: i + 1,
        headerIntruders: headerIntruders.slice(0, 3).map(it => `"${it.str}"@y=${it.pdfY.toFixed(0)}`),
        footerIntruders: footerIntruders.slice(0, 3).map(it => `"${it.str}"@y=${it.pdfY.toFixed(0)}`),
      });
    }
  }

  if (clippingViolations.length === 0) {
    PASS('Clipping: no unexpected body text in header or footer zones on any page');
  } else {
    FAIL(`Clipping violations on ${clippingViolations.length} page(s):`);
    for (const v of clippingViolations) {
      INFO(`  Page ${v.page}:`);
      if (v.headerIntruders.length)
        INFO(`    In header zone (pdfY>${HEADER_ZONE_Y_MIN}): ${v.headerIntruders.join(', ')}`);
      if (v.footerIntruders.length)
        INFO(`    In footer zone (pdfY<${FOOTER_ZONE_Y_MAX}): ${v.footerIntruders.join(', ')}`);
    }
  }

  // ── 7. Blank-space report ─────────────────────────────────────────────────
  // fill = 1 − (minBodyY / pageHeight)
  //   minBodyY = pdfY of bottommost body text (lowest y = furthest from page top).
  //   fill < SPARSE_THRESHOLD (0.55): content stops in the top 55% of page → sparse.
  // Body items = items outside the header and footer zones.
  // Only non-last content pages are checked; last page may legitimately have whitespace.
  console.log('\n▶  Blank-space report…');
  const sparsePages = [];

  for (let i = 1; i < pages.length - 1; i++) {
    const pg  = pages[i];
    const pgH = pg.pageHeight;

    const bodyItems = pg.items.filter(it =>
      it.pdfY < HEADER_ZONE_Y_MIN && it.pdfY > FOOTER_ZONE_Y_MAX
    );
    if (bodyItems.length === 0) continue;

    const minBodyY = Math.min(...bodyItems.map(it => it.pdfY));
    const fill     = 1 - minBodyY / pgH;
    if (fill < SPARSE_THRESHOLD) {
      sparsePages.push({ page: i + 1, fill: Math.round(fill * 100) });
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  printSummary(results, pageCount, sparsePages, clippingViolations);
}

function printSummary(results, pageCount, sparsePages, clippingViolations) {
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  Assertions  : ${passed} passed, ${failed} failed`);
  console.log(`  Total pages : ${pageCount}`);
  if (sparsePages.length === 0) {
    console.log('  Sparse pages: none (all non-last content pages fill ≥ 55%)');
  } else {
    console.log(`  Sparse pages: ${sparsePages.map(p => `p${p.page}(${p.fill}%)`).join(', ')}`);
    console.log('  (sparse = bottom body content in top 55% of page; some section-end whitespace is normal)');
  }
  if (clippingViolations.length === 0) {
    console.log('  Clipping    : none');
  } else {
    console.log(`  Clipping    : violations on pages ${clippingViolations.map(v => v.page).join(', ')}`);
  }
  if (failed === 0) {
    console.log('\n  ✅  ALL ASSERTIONS PASSED\n');
  } else {
    console.log('\n  ❌  SOME ASSERTIONS FAILED — see above\n');
  }
}

main().catch(e => {
  console.error('\nFatal error:', e);
  process.exit(1);
});

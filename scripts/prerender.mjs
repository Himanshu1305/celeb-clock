#!/usr/bin/env node
/**
 * Build-time prerender pipeline using puppeteer-core + @sparticuz/chromium.
 * Runs after vite build: for each public route, captures the rendered HTML
 * and writes it to dist/{route}/index.html so bots see content immediately.
 *
 * Usage: node scripts/prerender.mjs
 * Called from: npm run build (via "vite build && node scripts/prerender.mjs")
 *
 * Safety: if chromium cannot launch, prints a loud warning and exits 0.
 * Per-route failures are logged and skipped — build never fails.
 */

import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from 'fs';
import { resolve, dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');

const CONCURRENCY = 8;
const TOTAL_TIME_LIMIT_MS = 25 * 60 * 1000; // 25 minutes
const ROUTE_TIMEOUT_MS = 15_000;
const startTime = Date.now();

// ── Static file server with SPA fallback ─────────────────────────────────────
async function startStaticServer(port) {
  const indexHtml = readFileSync(join(DIST, 'index.html'), 'utf-8');

  const mimeTypes = {
    '.html': 'text/html',
    '.js':   'application/javascript',
    '.mjs':  'application/javascript',
    '.css':  'text/css',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
    '.ttf':  'font/ttf',
    '.webp': 'image/webp',
  };

  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      if (urlPath === '/') urlPath = '/index.html';

      // Try exact file first
      const filePath = join(DIST, urlPath);
      if (existsSync(filePath) && !filePath.endsWith('/')) {
        try {
          const data = readFileSync(filePath);
          const ext = urlPath.slice(urlPath.lastIndexOf('.'));
          const ct = mimeTypes[ext] || 'application/octet-stream';
          res.writeHead(200, { 'Content-Type': ct });
          res.end(data);
          return;
        } catch {}
      }

      // SPA fallback
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(indexHtml);
    });

    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

// ── Prerender a single route ──────────────────────────────────────────────────
// Decoded form of the homepage title (document.title returns unescaped text)
const DEFAULT_TITLE_DECODED = 'BornClock — Free Age Calculator, Celebrity Birthday Match & Life Expectancy';

async function prerenderRoute(page, baseUrl, route) {
  const url = `${baseUrl}${route}`;
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: ROUTE_TIMEOUT_MS });
    // react-helmet-async schedules title updates via requestAnimationFrame (defer:true default).
    // At c=8 Chrome may throttle rAF for background pages — a fixed sleep is unreliable.
    // Wait until document.title has changed from the SPA default, signalling the rAF fired.
    // Skip for '/' whose title IS the default title.
    if (route !== '/') {
      try {
        await page.waitForFunction(
          (def) => document.title !== def,
          { timeout: 5000, polling: 100 },
          DEFAULT_TITLE_DECODED
        );
      } catch {
        // Title never changed within 5s (page intentionally keeps the default, or very slow).
        // Fall through — title-patch below captures whatever is live.
      }
    }
    // Get both the serialized HTML and the live document.title (Helmet may update one but not serialize both)
    const { html: rawHtml, liveTitle, liveMeta } = await page.evaluate(() => {
      const metas = {};
      document.querySelectorAll('meta[name], meta[property]').forEach(el => {
        const key = el.getAttribute('name') || el.getAttribute('property');
        metas[key] = el.getAttribute('content');
      });
      return { html: document.documentElement.outerHTML, liveTitle: document.title, liveMeta: metas };
    });
    // Patch the <title> tag if the live title differs from the serialized one
    let html = rawHtml;
    if (liveTitle) {
      const escaped = liveTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escaped}</title>`);
    }

    // Sanity: check for unique title
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : '';
    if (!title || title.includes('BornClock') === false) {
      console.warn(`  [WARN] ${route}: title may be missing or generic: "${title}"`);
    }

    // Write to dist
    let outPath;
    if (route === '/') {
      outPath = join(DIST, 'index.html');
    } else {
      const dir = join(DIST, route);
      mkdirSync(dir, { recursive: true });
      outPath = join(dir, 'index.html');
    }
    writeFileSync(outPath, html, 'utf-8');
    return { route, ok: true, title };
  } catch (err) {
    console.error(`  [ERROR] ${route}: ${err.message}`);
    return { route, ok: false, error: err.message };
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Load routes
  const { getAllRoutes } = await import('./prerender-routes.mjs');
  const routes = await getAllRoutes();
  console.log(`\n🚀 Prerender: ${routes.length} routes`);

  // 2. Launch chromium
  let browser;
  try {
    const puppeteer = await import('puppeteer-core');
    const puppeteerCore = puppeteer.default || puppeteer;

    // Candidates in priority order: sparticuz (Linux/CF), then local paths (macOS/dev)
    const LOCAL_CHROME_PATHS = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
    ];

    let lastErr;
    let launched = false;

    // Try sparticuz first
    try {
      const chromiumMod = await import('@sparticuz/chromium');
      const chromium = chromiumMod.default || chromiumMod;
      const executablePath = await chromium.executablePath();
      browser = await puppeteerCore.launch({
        executablePath,
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        headless: true,
      });
      launched = true;
    } catch (err) {
      lastErr = err;
    }

    // Fall back to local Chrome installation
    if (!launched) {
      for (const executablePath of LOCAL_CHROME_PATHS) {
        if (!existsSync(executablePath)) continue;
        try {
          browser = await puppeteerCore.launch({
            executablePath,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            headless: true,
          });
          launched = true;
          console.log(`   Using local Chrome: ${executablePath}`);
          break;
        } catch (err) {
          lastErr = err;
        }
      }
    }

    if (!launched) {
      throw lastErr || new Error('No chromium executable could launch');
    }
  } catch (err) {
    console.error('\n⚠️  PRERENDER SKIPPED — chromium could not launch:');
    console.error('   ' + err.message);
    console.error('   Build succeeded; bots will see client-rendered HTML until next prerender run.\n');
    process.exit(0);
  }

  // 3. Start static server
  const PORT = 14321;
  let server;
  try {
    server = await startStaticServer(PORT);
    console.log(`   Static server: http://127.0.0.1:${PORT}`);
  } catch (err) {
    console.error('Failed to start static server:', err.message);
    await browser.close();
    process.exit(0);
  }

  const baseUrl = `http://127.0.0.1:${PORT}`;
  const results = { ok: 0, failed: 0, skipped: 0 };
  const failedRoutes = [];
  const manifestEntries = [];

  // 4. Prerender in batches of CONCURRENCY
  // Root route goes LAST so it overwrites dist/index.html after all others
  const nonRoot = routes.filter(r => r !== '/');
  const ordered = [...nonRoot, '/'];

  for (let i = 0; i < ordered.length; i += CONCURRENCY) {
    if (Date.now() - startTime > TOTAL_TIME_LIMIT_MS) {
      const remaining = ordered.length - i;
      console.warn(`\n⚠️  Time limit reached after ${Math.round((Date.now()-startTime)/1000)}s. Skipping ${remaining} remaining routes.`);
      for (const route of ordered.slice(i)) {
        manifestEntries.push({ route, status: 'skipped' });
      }
      results.skipped += remaining;
      break;
    }

    const batch = ordered.slice(i, i + CONCURRENCY);
    const pages = await Promise.all(batch.map(() => browser.newPage()));

    const batchResults = await Promise.all(
      batch.map((route, idx) => prerenderRoute(pages[idx], baseUrl, route))
    );

    await Promise.all(pages.map(p => p.close().catch(() => {})));

    for (const r of batchResults) {
      if (r.ok) {
        results.ok++;
        manifestEntries.push({ route: r.route, status: 'ok', title: r.title });
        if (results.ok % 50 === 0) console.log(`   Progress: ${results.ok}/${ordered.length} routes done`);
      } else {
        results.failed++;
        failedRoutes.push(r.route);
        manifestEntries.push({ route: r.route, status: 'failed', error: r.error });
      }
    }
  }

  await browser.close();
  if (server) server.close();

  // 5. Write manifest
  const manifest = {
    generatedAt: new Date().toISOString(),
    totalRoutes: ordered.length,
    ok: results.ok,
    failed: results.failed,
    skipped: results.skipped,
    elapsedSeconds: Math.round((Date.now() - startTime) / 1000),
    routes: manifestEntries,
  };
  writeFileSync(join(DIST, 'prerender-manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n✅ Prerender complete: ${results.ok} ok, ${results.failed} failed, ${results.skipped} skipped (${elapsed}s)`);
  console.log(`   Manifest written: dist/prerender-manifest.json`);

  if (failedRoutes.length > 0) {
    console.log('   Failed routes:', failedRoutes.slice(0, 20).join(', '));
  }

  // Assert a few sample routes contain their titles
  const samples = ['/zodiac/aries', '/numerology/7', '/chinese-zodiac/dragon'].filter(r => routes.includes(r));
  for (const route of samples) {
    const filePath = join(DIST, route, 'index.html');
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8');
      const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
      console.log(`   Sample ${route}: title="${titleMatch?.[1] ?? 'MISSING'}"`);
    }
  }
}

main().catch(err => {
  console.error('Prerender fatal:', err);
  process.exit(0); // exit 0 — never fail the build
});

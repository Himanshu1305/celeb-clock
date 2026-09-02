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
import { getTitleForRoute } from './prerender-titles.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');

const CONCURRENCY = 8;
const TOTAL_TIME_LIMIT_MS = 25 * 60 * 1000; // 25 minutes
// 15s: keep per-route timeouts CHEAP so a burst of slow network-heavy routes can't
// consume the total time budget and cause later routes to be skipped. Routes that
// time out fall back to SPA rendering at runtime (assets not_found_handling=SPA).
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

// ── Per-route OG share card resolver ──────────────────────────────────────────
// scripts/generate-og-cards.mts writes branded 1200x630 WebP cards into dist/og/
// (one per page type) BEFORE this prerender runs. Map a route to its card by
// building candidate paths and returning the first that exists on disk; anything
// without a bespoke card falls back to the refreshed default. Absolute https URLs.
function ogImageForRoute(route) {
  const base = 'https://bornclock.com/og/';
  const candidates = [];
  let m;
  if ((m = route.match(/^\/born-on\/([a-z]+-\d+)$/))) candidates.push(`born-on/${m[1]}.webp`);
  if ((m = route.match(/^\/born-in-([a-z]+)$/)))       candidates.push(`month/${m[1]}.webp`);
  if ((m = route.match(/^\/zodiac\/([a-z]+)$/)))        candidates.push(`zodiac/${m[1]}.webp`);
  if ((m = route.match(/^\/blog\/([a-z0-9-]+)$/)))      candidates.push(`blog/${m[1]}.webp`);
  // Country longevity pages (multi-segment)
  if (route.match(/^\/life-expectancy-(india|usa|japan|uk|australia|canada|germany|china|singapore|brazil)$/))
    candidates.push('fitness/country-longevity.webp');
  // Hindi pages (multi-segment)
  if (route.match(/^\/(meri-umar-kitni-hai|jivan-kal-calculator|numerology-hindi|rashifal-by-date-of-birth|biological-age-hindi)$/))
    candidates.push('fitness/hindi.webp');
  // Life expectancy India vs USA comparison page
  if (route === '/life-expectancy-india-vs-usa')
    candidates.push('fitness/country-longevity.webp');
  // Biological age vs chronological (multi-segment)
  if (route === '/biological-age-vs-chronological-age')
    candidates.push('fitness/biological-age-vs-chronological-age.webp');
  // Sun vs moon sign (multi-segment)
  if (route === '/sun-vs-moon-sign')
    candidates.push('fitness/sun-vs-moon-sign.webp');
  // Best X calculator pages
  if (route.match(/^\/(best-age-calculator|best-life-expectancy-calculator|best-birthday-calculator|best-biological-age-calculator|best-numerology-calculator)$/))
    candidates.push('fitness/answers.webp');
  // Single-segment fitness/rhythm pages (e.g. /energy-forecast) — cards keyed by slug.
  if ((m = route.match(/^\/([a-z0-9-]+)$/)))            candidates.push(`fitness/${m[1]}.webp`);
  for (const c of candidates) {
    if (existsSync(join(DIST, 'og', c))) return base + c;
  }
  return base + 'default.webp';
}

// ── Per-route WhatsApp-optimised social descriptions ──────────────────────────
// react-helmet-async does NOT flush per-route og:description before the outerHTML
// capture, so the base index.html default leaks onto every route (the same leak the
// canonical/og:image injection already fixes). For these high-value share pages we
// inject a punchy, curiosity-driven og/twitter:description here. The keyword-rich
// SEO <meta name="description"> (from prerender-titles) is deliberately left intact.
const OG_DESCRIPTIONS = {
  '/life-expectancy': 'Harvard tracked 123,000 people for 30 years. 5 habits add 14 years to life. Find out where you stand — free.',
  '/biological-age': 'Your body may be 10 years younger — or older — than your birthday says. Find out in 2 minutes. Free.',
  '/gift': "A 9-section personalised birthday report built from their date of birth. The most thoughtful gift they'll get this year.",
  '/coach': 'Your personalised longevity plan — built from your birthday and your habits. Start adding years today. Free.',
  '/celebrity-birthday': '50,000+ celebrities in our database. Find out which famous actor, athlete, or scientist shares your exact birthday.',
  '/generation': 'Gen Z, Millennial, Gen X, Boomer — find out which generation you belong to and what shaped the way you see the world.',
  '/age-calculator': "You're not just 30 years old. You've lived 10,957 days. 946 million seconds. Find your exact age — live, free.",
};

// ── Prerender a single route ──────────────────────────────────────────────────
async function prerenderRoute(page, baseUrl, route) {
  const url = `${baseUrl}${route}`;
  try {
    // Suppress client-only personalisation sections (e.g. CountryExtrasSection)
    // from appearing in the prerendered HTML snapshot.
    await page.evaluateOnNewDocument(() => { window.__PRERENDER__ = true; });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: ROUTE_TIMEOUT_MS });
    // 500ms settle — let React finish any pending microtask/rAF work after network idle
    await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

    // For born-on routes: extract first 3 celebrity names from the live DOM
    // (Supabase fetch has completed by networkidle0; names are in .glass-card h3)
    let celebNames = [];
    if (route.startsWith('/born-on/') && route !== '/born-on') {
      celebNames = await page.evaluate(() =>
        Array.from(document.querySelectorAll('.glass-card h3')).slice(0, 3).map(el => el.textContent.trim())
      ).catch(() => []);
    }

    // Capture full serialized HTML
    const rawHtml = await page.evaluate(() => document.documentElement.outerHTML);

    // ── Title + description injection (bypasses react-helmet-async rAF timing) ──
    const meta = getTitleForRoute(route);
    let html = rawHtml;

    if (meta) {
      // Inject title — replace whatever <title> the SPA default left in the HTML
      const escapedTitle = meta.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapedTitle}</title>`);

      // Build description — for born-on pages, prepend real celebrity names if available
      let desc = meta.description;
      if (meta._month && celebNames.length > 0) {
        desc = `Famous people born on ${meta._month} ${meta._day} (${meta._zodiac}) include ${celebNames.join(', ')}. Zodiac, birthstone, day-of-year facts, and birthday insights at BornClock.`;
      }
      const escapedDesc = desc.replace(/"/g, '&quot;');

      // Replace meta description content attribute (handles either attribute order)
      html = html.replace(
        /(<meta\s+[^>]*name="description"[^>]*content=")[^"]*(")/i,
        `$1${escapedDesc}$2`
      );
      html = html.replace(
        /(<meta\s+[^>]*content=")[^"]*("\s+name="description"[^>]*)/i,
        `$1${escapedDesc}$2`
      );

      // Keep og/twitter titles in sync with the per-route <title>.
      html = html.replace(/(<meta property="og:title" content=")[^"]*(")/i, `$1${escapedTitle}$2`);
      html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/i, `$1${escapedTitle}$2`);

      // Keep og/twitter descriptions in sync with the per-route SEO description.
      // Without this the base index.html default og:description leaks onto every
      // prerendered page (react-helmet-async does not flush per-route og:description
      // before the outerHTML capture). Routes with a share-optimised entry in
      // OG_DESCRIPTIONS override this below, so this only fills the gap for the rest.
      html = html.replace(/(<meta property="og:description" content=")[^"]*(")/i, `$1${escapedDesc}$2`);
      html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/i, `$1${escapedDesc}$2`);
    }

    // ── Canonical + og/twitter URL injection ──────────────────────────────────
    // react-helmet's per-route canonical is NOT flushed before the outerHTML
    // capture, so the base index.html's home-pointing canonical/og:url/twitter:url
    // leak onto every route. Inject the correct trailing-slash canonical (matches
    // the sitemap and the Worker's 200 URL) per route.
    const canonicalPath = route === '/' ? '/' : route.replace(/\/+$/, '') + '/';
    const canonicalUrl = `https://bornclock.com${canonicalPath}`;
    html = html.replace(/(<link rel="canonical" href=")[^"]*(")/i, `$1${canonicalUrl}$2`);
    html = html.replace(/(<meta property="og:url" content=")[^"]*(")/i, `$1${canonicalUrl}$2`);
    html = html.replace(/(<meta name="twitter:url" content=")[^"]*(")/i, `$1${canonicalUrl}$2`);

    // ── Per-page-type OG share card (og:image + twitter:image) ─────────────────
    // The page ends up with TWO image tags — the static one from index.html and a
    // react-helmet-async duplicate (data-rh, attribute order varies) — so a single
    // ordered regex can't catch both. Strip every og:image / twitter:image tag
    // (the quote after :image spares og:image:width/:height and twitter:image:alt)
    // then inject exactly one branded, page-specific card. Absolute https URL.
    const ogImage = ogImageForRoute(route);
    html = html.replace(/<meta\b[^>]*\b(?:property="og:image(?::width|:height)?"|name="twitter:image(?::alt)?")[^>]*>\s*/gi, '');
    const cardMeta =
      `<meta property="og:image" content="${ogImage}" />` +
      `<meta property="og:image:width" content="1200" />` +
      `<meta property="og:image:height" content="630" />` +
      `<meta name="twitter:image" content="${ogImage}" />` +
      `<meta name="twitter:image:alt" content="BornClock" />`;
    html = html.replace('</head>', `${cardMeta}</head>`);

    // ── Per-route WhatsApp-optimised social description (og/twitter:description) ──
    const socialDesc = OG_DESCRIPTIONS[route];
    if (socialDesc) {
      const escSocial = socialDesc
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      html = html.replace(/<meta\b[^>]*\bproperty="og:description"[^>]*>\s*/gi, '');
      html = html.replace(/<meta\b[^>]*\bname="twitter:description"[^>]*>\s*/gi, '');
      html = html.replace('</head>',
        `<meta property="og:description" content="${escSocial}" />` +
        `<meta name="twitter:description" content="${escSocial}" /></head>`);
    }

    // ── Homepage social title/description (brand tagline) ──────────────────────
    // getTitleForRoute('/') is null, so the block above never rewrites the home meta,
    // and the page ends up with TWO og:title tags (static index.html + react-helmet).
    // Strip both og/twitter title+description and inject one clean branded set. The
    // <title> (SEO) is deliberately left untouched.
    if (route === '/') {
      const ogT = 'BornClock — Know Your Time. Live It Well.';
      const ogD = 'Celebrity birthday twins, biological age, life expectancy, zodiac &amp; numerology — all from your birth date. Free.';
      html = html.replace(/<meta\b[^>]*\bproperty="og:title"[^>]*>\s*/gi, '');
      html = html.replace(/<meta\b[^>]*\bname="twitter:title"[^>]*>\s*/gi, '');
      html = html.replace(/<meta\b[^>]*\bproperty="og:description"[^>]*>\s*/gi, '');
      html = html.replace(/<meta\b[^>]*\bname="twitter:description"[^>]*>\s*/gi, '');
      const brand =
        `<meta property="og:title" content="${ogT}" />` +
        `<meta name="twitter:title" content="${ogT}" />` +
        `<meta property="og:description" content="${ogD}" />` +
        `<meta name="twitter:description" content="${ogD}" />`;
      html = html.replace('</head>', `${brand}</head>`);
    }

    // ── Per-route BreadcrumbList JSON-LD (truthful, derived from the URL path) ──
    if (route !== '/') {
      const parts = route.split('/').filter(Boolean);
      const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bornclock.com/' }];
      const ZODIAC = new Set(['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces']);
      if (parts.length === 3 && parts[0] === 'compatibility' && ZODIAC.has(parts[1]) && ZODIAC.has(parts[2])) {
        // Compatibility pair: the middle single-sign segment (/compatibility/aquarius) is NOT a
        // real page, so collapse to Home > Compatibility > "Sign1 & Sign2" — no breadcrumb 404s.
        const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
        items.push({ '@type': 'ListItem', position: 2, name: 'Compatibility', item: 'https://bornclock.com/compatibility/' });
        items.push({ '@type': 'ListItem', position: 3, name: `${cap(parts[1])} & ${cap(parts[2])}`, item: `https://bornclock.com/${parts.join('/')}/` });
      } else {
        let acc = '';
        parts.forEach((p, i) => {
          acc += `/${p}`;
          items.push({
            '@type': 'ListItem',
            position: i + 2,
            name: p.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            item: `https://bornclock.com${acc}/`,
          });
        });
      }
      const bc = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items });
      html = html.replace('</head>', `<script type="application/ld+json">${bc}</script></head>`);
    }

    // Sanity: flag a GENUINELY generic title — missing, too short, or identical to
    // the site's default/home title (i.e. no per-route title was injected). The old
    // check warned whenever the title lacked the word "BornClock", which is a false
    // positive: many strong SEO titles (e.g. "Best Age Calculator Online — Exact Age
    // in Seconds") and every blog post title deliberately lead with keywords and omit
    // the brand to stay within the ~60-char limit. Brand-absence is not generic-ness.
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : '';
    const DEFAULT_TITLE_FRAGMENT = 'Age & Birthday Calculator'; // the base index.html title tail
    if (!title || title.trim().length < 12 || (route !== '/' && title.includes(DEFAULT_TITLE_FRAGMENT))) {
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

// ── Launch chromium (sparticuz on CI/Linux, local Chrome on macOS/dev) ─────────
// Returns a browser or null. Extracted so the main loop can RELAUNCH after a browser
// crash / OOM without aborting the whole run (a single fatal error over 1000+ heavy
// pages used to skip every remaining route).
async function launchBrowser() {
  const puppeteer = await import('puppeteer-core');
  const puppeteerCore = puppeteer.default || puppeteer;

  const LOCAL_CHROME_PATHS = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];

  // Try sparticuz first
  try {
    const chromiumMod = await import('@sparticuz/chromium');
    const chromium = chromiumMod.default || chromiumMod;
    const executablePath = await chromium.executablePath();
    return await puppeteerCore.launch({
      executablePath,
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: true,
    });
  } catch { /* fall through to local Chrome */ }

  for (const executablePath of LOCAL_CHROME_PATHS) {
    if (!existsSync(executablePath)) continue;
    try {
      const b = await puppeteerCore.launch({
        executablePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        headless: true,
      });
      console.log(`   Using local Chrome: ${executablePath}`);
      return b;
    } catch { /* try next path */ }
  }
  return null;
}

// Recycle the browser every N routes so memory can't accumulate across 1000+ heavy
// pages and OOM/hang the process near the tail.
const RESTART_EVERY = 300;

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Load routes
  const { getAllRoutes } = await import('./prerender-routes.mjs');
  const routes = await getAllRoutes();
  console.log(`\n🚀 Prerender: ${routes.length} routes`);

  // 2. Launch chromium
  let browser = await launchBrowser();
  if (!browser) {
    console.error('\n⚠️  PRERENDER SKIPPED — chromium could not launch.');
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

    // Periodically recycle the browser to bound memory growth over a long run.
    // i steps by CONCURRENCY, so trigger when we cross a RESTART_EVERY boundary.
    if (i > 0 && Math.floor(i / RESTART_EVERY) !== Math.floor((i - CONCURRENCY) / RESTART_EVERY)) {
      await browser.close().catch(() => {});
      const fresh = await launchBrowser();
      if (fresh) { browser = fresh; console.log(`   ↻ recycled browser at ${i}/${ordered.length}`); }
      else { browser = await launchBrowser(); } // one more attempt; if still null the batch try/catch handles it
    }

    const batch = ordered.slice(i, i + CONCURRENCY);

    // Run the batch; if the BROWSER itself died (crash/OOM → newPage/close throw
    // outside prerenderRoute's per-route catch), relaunch it and retry this batch
    // ONCE so the crash costs one batch, not every remaining route.
    let batchResults;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const pages = await Promise.all(batch.map(() => browser.newPage()));
        batchResults = await Promise.all(
          batch.map((route, idx) => prerenderRoute(pages[idx], baseUrl, route))
        );
        await Promise.all(pages.map(p => p.close().catch(() => {})));
        break;
      } catch (err) {
        console.warn(`   ⚠️  batch at ${i} failed (${err.message}); relaunching browser${attempt === 0 ? ' and retrying' : ''}`);
        try { await browser.close(); } catch { /* already dead */ }
        browser = await launchBrowser();
        if (!browser) { console.error('   could not relaunch browser'); break; }
        if (attempt === 1) {
          batchResults = batch.map(route => ({ route, ok: false, error: err.message }));
        }
      }
    }
    if (!batchResults) batchResults = batch.map(route => ({ route, ok: false, error: 'browser unavailable' }));
    if (!browser) break;

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

  if (browser) await browser.close().catch(() => {});
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

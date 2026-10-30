// Batch 11 (GSC): /sitemap.xml is an index of section sitemaps, and <lastmod> is real —
// it only moves when a page's main content changes (hash vs the previous manifest).
import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execFileSync } from 'child_process';
import {
  sectionOf, SECTIONS, contentHash, pageContentForHash, resolveLastmod, parseManifest, HASH_VERSION,
  sitemapProblems, readSitemapUrls, locPath,
  // @ts-expect-error — plain ESM build script, no type declarations
} from '../lib/sitemap.mjs';

describe('sectionOf', () => {
  it.each([
    ['/', 'core'], ['/about', 'core'], ['/zodiac/leo', 'core'], ['/numerology/7', 'core'], ['/life-expectancy', 'core'],
    ['/kundali', 'vedic'], ['/rashifal/mesh/today', 'vedic'], ['/nakshatra/rohini', 'vedic'], ['/planet-in-sign/sun/leo', 'vedic'], ['/vrat/karwa-chauth', 'vedic'],
    ['/panchang', 'panchang'], ['/panchang/delhi', 'panchang'], ['/rahu-kaal/mumbai', 'panchang'], ['/choghadiya/pune', 'panchang'], ['/moon-phase', 'panchang'],
    ['/celebrity/virat-kohli', 'celebrity'], ['/born-on/july-23/india', 'celebrity'], ['/born-in-may', 'celebrity'], ['/celebrity-birthday', 'celebrity'], ['/todays-birthdays', 'celebrity'],
    ['/birthday/8/6', 'birthday'], ['/birthday', 'birthday'], ['/age-calculator', 'birthday'], ['/birthstone/may', 'birthday'],
    ['/hi/rashifal/mesha', 'hindi'], ['/hi/panchang/delhi', 'hindi'], ['/biological-age-hindi', 'hindi'],
    ['/articles/how-to-live-to-100', 'articles'], ['/blog/x', 'articles'], ['/answers/how-long-will-i-live', 'articles'],
  ])('%s → %s', (r, s) => expect(sectionOf(r)).toBe(s));

  it('every prerendered route maps to a known section, and each section has pages', async () => {
    const { getAllRoutes } = await import('../prerender-routes.mjs');
    const routes: string[] = await getAllRoutes();
    const ids = new Set(SECTIONS.map((s: { id: string }) => s.id));
    const count: Record<string, number> = {};
    for (const r of routes) { const s = sectionOf(r); expect(ids.has(s), r).toBe(true); count[s] = (count[s] || 0) + 1; }
    for (const id of ids) expect(count[id as string] ?? 0, id as string).toBeGreaterThan(0);
  }, 60_000);
});

const page = (main: string, extra = '') => `<!doctype html><html><head><title>T</title><meta name="description" content="D"></head><body>
<header><nav><a href="/x/">Menu ${extra}</a></nav></header><main id="main">${main}</main><footer>© ${extra}</footer>
<script>window.x=${Math.random()}</script></body></html>`;

describe('content hash', () => {
  it('ignores header/nav/footer, scripts, daily blocks and the written-out build date', () => {
    const a = page('<h1><span data-daily="h1">Today 1</span></h1><p>Body text</p><div data-daily="body"><p>x</p></div><p>Updated 30 October 2026</p>', 'A');
    const b = page('<h1><span data-daily="h1">Today 2</span></h1><p>Body   text</p><div data-daily="body"><p>y</p></div><p>Updated 31 October 2026</p>', 'B');
    expect(contentHash(a, '2026-10-30')).toBe(contentHash(b, '2026-10-31'));
    expect(pageContentForHash(a, '2026-10-30')).toBe('T Body text Updated {date}');
  });
  it('changes when the title or main text changes (not the description — prerender timing varies it)', () => {
    const base = contentHash(page('<p>One</p>'), '2026-10-30');
    expect(contentHash(page('<p>Two</p>'), '2026-10-30')).not.toBe(base);
    expect(contentHash(page('<p>One</p>').replace('<title>T', '<title>U'), '2026-10-30')).not.toBe(base);
    expect(contentHash(page('<p>One</p>').replace('content="D"', 'content="E"'), '2026-10-30')).toBe(base);
  });
});

describe('resolveLastmod', () => {
  const base = { buildDate: '2026-10-30', fallbackDate: '2026-10-29' };
  it('unchanged hash keeps the previous lastmod', () =>
    expect(resolveLastmod({ ...base, hash: 'h1', prev: { h: 'h1', m: '2026-08-01' }, daily: false, havePrevManifest: true })).toBe('2026-08-01'));
  it('changed hash → build date', () =>
    expect(resolveLastmod({ ...base, hash: 'h2', prev: { h: 'h1', m: '2026-08-01' }, daily: false, havePrevManifest: true })).toBe('2026-10-30'));
  it('new page with a previous manifest → build date', () =>
    expect(resolveLastmod({ ...base, hash: 'h2', prev: undefined, daily: false, havePrevManifest: true })).toBe('2026-10-30'));
  it('no previous manifest → git commit date', () =>
    expect(resolveLastmod({ ...base, hash: 'h2', prev: undefined, daily: false, havePrevManifest: false })).toBe('2026-10-29'));
  it('daily page → build date even when unchanged', () =>
    expect(resolveLastmod({ ...base, hash: 'h1', prev: { h: 'h1', m: '2026-08-01' }, daily: true, havePrevManifest: true })).toBe('2026-10-30'));
  it('no HTML this build → previous lastmod kept', () =>
    expect(resolveLastmod({ ...base, hash: null, prev: { h: 'h1', m: '2026-08-01' }, daily: false, havePrevManifest: true })).toBe('2026-08-01'));
  it('never in the future', () =>
    expect(resolveLastmod({ ...base, hash: 'h1', prev: { h: 'h1', m: '2027-01-01' }, daily: false, havePrevManifest: true })).toBe('2026-10-30'));
  it('parseManifest rejects other hash versions and bad dates', () => {
    expect(parseManifest({ v: HASH_VERSION + 1, urls: { '/a/': { h: 'x', m: '2026-01-01' } } })).toBeNull();
    expect(parseManifest('not json')).toBeNull();
    expect(parseManifest({ v: HASH_VERSION, urls: { '/a/': { h: 'x', m: '2026-01-01' }, '/b/': { h: 'y', m: 'soon' } } })).toEqual({ '/a/': { h: 'x', m: '2026-01-01' } });
  });
});

// End to end: run the real generator twice over a tiny dist/ (only a few routes have HTML).
describe('scripts/generate-sitemap.mjs', () => {
  const run = (dist: string, prev: string, buildDate: string) => execFileSync(process.execPath, ['scripts/generate-sitemap.mjs'], {
    env: { ...process.env, SITEMAP_DIST: dist, SITEMAP_PREV_MANIFEST: prev, BUILD_DATE: buildDate }, encoding: 'utf8',
  });
  const write = (dist: string, route: string, html: string) => {
    const dir = route === '/' ? dist : join(dist, route);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), html);
  };

  it('writes an index + section sitemaps + manifest; keeps lastmod for unchanged pages on the next build', () => {
    const dist = mkdtempSync(join(tmpdir(), 'b11-sitemap-'));
    write(dist, '/', page('<p>Home</p>'));
    write(dist, '/kundali', page('<p>Kundali v1</p>'));
    write(dist, '/privacy', page('<p>Privacy</p>'));
    write(dist, '/rashifal/mesh/today', page('<p>Daily</p>'));
    write(dist, '/upgrade', page('<p>Upgrade</p>').replace('</head>', '<meta name="robots" content="noindex, follow"></head>'));
    const log1 = run(dist, 'none', '2026-10-20');
    expect(log1).toContain('No previous manifest');

    const index = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
    expect(index).toContain('<sitemapindex');
    for (const s of SECTIONS) expect(index).toContain(`<loc>https://bornclock.com/${s.file}</loc>`);
    const urls: string[] = readSitemapUrls(dist);
    expect(urls).toContain('https://bornclock.com/');
    expect(urls).toContain('https://bornclock.com/kundali/');
    expect(urls).not.toContain('https://bornclock.com/upgrade/'); // noindex → left out
    expect(new Set(urls).size).toBe(urls.length);
    expect(readFileSync(join(dist, 'sitemap-vedic.xml'), 'utf8')).toContain('https://bornclock.com/kundali/');
    expect(readFileSync(join(dist, 'sitemap-core.xml'), 'utf8')).toContain('https://bornclock.com/privacy/');
    expect(sitemapProblems(dist, '2026-10-30')).toEqual([]);

    const m1 = JSON.parse(readFileSync(join(dist, 'sitemap-manifest.json'), 'utf8'));
    const commitDate = m1.urls['/privacy/'].m; // no previous manifest → git commit date of HEAD (or build date)
    expect(commitDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(m1.urls['/rashifal/mesh/today/'].m).toBe('2026-10-20');

    // Next build: kundali changed, privacy did not; previous manifest read from a file.
    const prevFile = join(dist, 'prev.json');
    writeFileSync(prevFile, JSON.stringify({ ...m1, urls: { ...m1.urls, '/privacy/': { ...m1.urls['/privacy/'], m: '2026-09-01' } } }));
    write(dist, '/kundali', page('<p>Kundali v2</p>'));
    run(dist, prevFile, '2026-10-30');
    const m2 = JSON.parse(readFileSync(join(dist, 'sitemap-manifest.json'), 'utf8'));
    expect(m2.urls['/privacy/'].m).toBe('2026-09-01');     // unchanged → kept
    expect(m2.urls['/kundali/'].m).toBe('2026-10-30');     // changed → build date
    expect(m2.urls['/rashifal/mesh/today/'].m).toBe('2026-10-30'); // daily
    expect(readFileSync(join(dist, 'sitemap-core.xml'), 'utf8')).toContain('<loc>https://bornclock.com/privacy/</loc><lastmod>2026-09-01</lastmod>');
    expect(sitemapProblems(dist, '2026-10-30')).toEqual([]);
  }, 120_000);

  it('sitemapProblems catches a urlset at /sitemap.xml, a missing child and non-canonical locs', () => {
    const dist = mkdtempSync(join(tmpdir(), 'b11-sitemap-bad-'));
    writeFileSync(join(dist, 'sitemap.xml'), '<urlset><url><loc>https://bornclock.com/a</loc></url></urlset>');
    expect(sitemapProblems(dist)).toEqual(['sitemap.xml is not a sitemap index']);
    writeFileSync(join(dist, 'sitemap.xml'), '<sitemapindex><sitemap><loc>https://bornclock.com/sitemap-core.xml</loc></sitemap><sitemap><loc>https://bornclock.com/sitemap-vedic.xml</loc></sitemap></sitemapindex>');
    writeFileSync(join(dist, 'sitemap-core.xml'), '<urlset><url><loc>https://bornclock.com/a</loc><lastmod>2026-13-01x</lastmod></url></urlset>');
    const p = sitemapProblems(dist, '2026-10-30');
    expect(p.join('|')).toContain('sitemap-vedic.xml listed in the index but missing');
    expect(p.join('|')).toContain('non-canonical loc https://bornclock.com/a');
    expect(p.join('|')).toContain('bad lastmod');
    expect(p.join('|')).toContain('sitemap-manifest.json missing');
    expect(existsSync(join(dist, 'sitemap-manifest.json'))).toBe(false);
  });

  it('locPath', () => {
    expect(locPath('/')).toBe('/');
    expect(locPath('/a/b')).toBe('/a/b/');
  });
});

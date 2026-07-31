/**
 * Suite M — seo-magnet-3.spec.ts  (SEO-MAGNET-3 Phases 1–5)
 *
 * Two groups:
 *   • prerendered-content: fs assertions over dist/ (share bar, personality section,
 *     compatibility pair content/schema) — requires a prior `npm run build`.
 *   • worker + app: live checks against the worker (:3001) and the SPA (:3000) for the
 *     compatibility reverse-order 301, the report OG route fallback, the report-HTML
 *     og:image injection, and rising-sign input validation.
 */
import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DIST = resolve(process.cwd(), 'dist');
const WORKER = 'http://localhost:3001';
const html = (route: string) => readFileSync(resolve(DIST, route.replace(/^\//, ''), 'index.html'), 'utf-8');
const distExists = existsSync(resolve(DIST, 'index.html'));
const enc = (path: string) => encodeURIComponent(`https://bornclock.com${path}/`);

test.describe('SEO-MAGNET-3 — prerendered content', () => {
  test.skip(!distExists, 'dist/ not built — run `npm run build` before this suite');

  // Phase 1 — share bar renders on one page per type with the correct encoded URL.
  const shareCases: Array<[string, string]> = [
    ['/born-on/january-1', 'born-on'],
    ['/born-in-august', 'month-hub'],
    ['/zodiac/aries', 'zodiac'],
    ['/energy-forecast', 'fitness'],
    ['/blog/best-month-to-be-born-what-data-says', 'blog'],
  ];
  for (const [route, type] of shareCases) {
    test(`share bar renders + encoded URL (${type})`, () => {
      const doc = html(route);
      expect(doc, 'whatsapp').toContain('wa.me/?text=');
      expect(doc, 'x/twitter').toContain('twitter.com/intent/tweet');
      expect(doc, 'facebook').toContain('facebook.com/sharer');
      expect(doc, 'encoded canonical URL present').toContain(enc(route));
    });
  }

  // Phase 2 — personality section + Birth Day Number + in-body FAQPage schema.
  test('born-on: personality section, Birth Day Number label, FAQPage schema (A2)', () => {
    const doc = html('/born-on/january-1');
    expect(doc).toContain('Personality');
    expect(doc).toContain('Birth Day Number');
    expect(doc).toContain('"@type":"FAQPage"');
    // A2: the day-derived number must never be labelled "Life Path N" on a free page.
    expect(doc).not.toMatch(/Life Path \d/);
  });

  // A3 — two same-sign (Aries) dates must not read identically (unique data interleaved).
  test('born-on: A3 thin-content guard — two Aries dates differ', () => {
    const grab = (route: string) => {
      const d = html(route);
      const i = d.indexOf('Personality');
      return d.slice(i, i + 1200);
    };
    const a = grab('/born-on/march-28');
    const b = grab('/born-on/april-2');
    expect(a).not.toBe(b);
  });

  // Phase 3 — a compatibility pair page carries pair-specific schema + both zodiac hub links.
  test('compatibility aries/leo: FAQPage schema + zodiac hub links', () => {
    const doc = html('/compatibility/aries/leo').toLowerCase();
    expect(doc).toContain('"@type":"faqpage"');
    expect(doc).toContain('are aries and leo compatible');
    expect(doc).toContain('/zodiac/aries');
    expect(doc).toContain('/zodiac/leo');
  });

  // Phase 4 (rising-sign) removed — the page was retired in BATCH-5 Phase 2 (a
  // 2-hour-block ascendant is confidently wrong without birth lat/long). Its prerender
  // + UI assertions were deleted; the redirect is asserted below.
});

test.describe('SEO-MAGNET-3 — worker + app', () => {
  // Phase 3 — reverse-order compatibility pair 301s to the alphabetical canonical.
  test('compat reverse order → 301 canonical', async ({ request }) => {
    const res = await request.get(`${WORKER}/compatibility/leo/aries`, { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()['location']).toContain('/compatibility/aries/leo/');
  });

  test('compat canonical order is not redirected', async ({ request }) => {
    const res = await request.get(`${WORKER}/compatibility/aries/leo/`, { maxRedirects: 0 });
    expect([200, 304]).toContain(res.status());
  });

  // Phase 5 — report OG route: a slug that does not exist serves the default card (200 image),
  // never a broken image or a 5xx.
  test('report OG route: bogus slug → default card, 200 image', async ({ request }) => {
    const res = await request.get(`${WORKER}/og/report/bogus-slug-does-not-exist-xyz`, { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image');
  });

  // Phase 5 — the worker injects the per-slug og:image (and noindex) into report HTML.
  test('report HTML: injected per-slug og:image + noindex', async ({ request }) => {
    const res = await request.get(`${WORKER}/report/bogus-slug-xyz`);
    const body = await res.text();
    expect(body).toContain('/og/report/bogus-slug-xyz.png');
    expect(body.toLowerCase()).toContain('noindex');
  });

  // BATCH-5 Phase 2 — the retired rising-sign URL 301s to /moon-sign (crawl-preserving).
  test('retired /rising-sign-calculator → 301 /moon-sign', async ({ request }) => {
    const res = await request.get(`${WORKER}/rising-sign-calculator`, { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()['location']).toContain('/moon-sign');
  });
});

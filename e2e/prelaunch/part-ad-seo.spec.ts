/**
 * Part AD — technical SEO fixes (canonicalization, query-param dupes, tag archives,
 * aries+date soft-404). Run against the local worker (wrangler dev :3001), same harness
 * as ops-seo.spec.ts. These assert the ROUTING/redirect layer in functions/_worker.ts.
 *
 *   npm run build && ./node_modules/.bin/wrangler dev --port 3001    (Terminal 1)
 *   playwright test --config e2e/prelaunch/prelaunch.config.ts       (Terminal 2)
 */
import { test, expect } from '@playwright/test';

const API = 'http://localhost:3001'; // worker directly (redirects + assets live here)

test.describe('Part AD — Part 1: trailing-slash canonicalization (301, not 307)', () => {
  test('/born-on/august-6/india → 301 → trailing-slash form', async ({ request }) => {
    const res = await request.get(`${API}/born-on/august-6/india`, { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()['location']).toContain('/born-on/august-6/india/');
  });
  test('the canonical (trailing-slash) URL serves 200', async ({ request }) => {
    const res = await request.get(`${API}/born-on/august-6/india/`, { maxRedirects: 0 });
    expect(res.status()).toBe(200);
  });
});

test.describe('Part AD — Part 2: homepage query-param dupes 301 to /birthday/[m]/[d]/', () => {
  test('/?day=4&month=9 → 301 → /birthday/9/4/', async ({ request }) => {
    const res = await request.get(`${API}/?day=4&month=9`, { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()['location']).toContain('/birthday/9/4/');
  });
  test('/?birthDate=9/12 → 301 → /birthday/9/12/', async ({ request }) => {
    const res = await request.get(`${API}/?birthDate=9/12`, { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()['location']).toContain('/birthday/9/12/');
  });
  test('a plain homepage query (no day/month) is NOT redirected', async ({ request }) => {
    const res = await request.get(`${API}/?utm_source=x`, { maxRedirects: 0 });
    expect(res.status()).toBe(200);
  });
});

test.describe('Part AD — Part 3: blog tag archives are noindex, follow', () => {
  test('/blog?tag=X first 301s to the canonical trailing-slash form', async ({ request }) => {
    const res = await request.get(`${API}/blog?tag=autophagy`, { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()['location']).toContain('/blog/?tag=autophagy');
  });
  test('/blog/?tag=X (canonical) sends X-Robots-Tag: noindex, follow', async ({ request }) => {
    const res = await request.get(`${API}/blog/?tag=autophagy`, { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    const xr = (res.headers()['x-robots-tag'] || '').toLowerCase();
    expect(xr).toContain('noindex');
    expect(xr).toContain('follow');
    expect(xr).not.toContain('nofollow');
  });
  test('the clean /blog/ index is NOT noindexed', async ({ request }) => {
    const res = await request.get(`${API}/blog/`, { maxRedirects: 0 });
    expect(res.headers()['x-robots-tag']).toBeFalsy();
  });
});

test.describe('Part AD — Part 4: zodiac soft-404 variants 301 to /zodiac/[sign]/', () => {
  test('/aries-dates → 301 → /zodiac/aries/', async ({ request }) => {
    const res = await request.get(`${API}/aries-dates`, { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()['location']).toContain('/zodiac/aries/');
  });
  test('/aries → 301 → /zodiac/aries/', async ({ request }) => {
    const res = await request.get(`${API}/aries`, { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()['location']).toContain('/zodiac/aries/');
  });
  test('the real /zodiac/aries/ page is untouched (200, indexable)', async ({ request }) => {
    const res = await request.get(`${API}/zodiac/aries/`, { maxRedirects: 0 });
    expect(res.status()).toBe(200);
  });
});

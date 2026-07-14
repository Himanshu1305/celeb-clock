/**
 * 11-seo-surface — Robots, sitemap, llms.txt, OG image, and born-on page SEO checks.
 * Validates that all critical SEO infrastructure is wired up and serving correct content.
 */
import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../..');

// ── robots.txt ────────────────────────────────────────────────────────────────

test('robots.txt is served at /robots.txt', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const text = await res.text();
  expect(text).toContain('User-agent');
});

test('robots.txt allows GPTBot', async ({ request }) => {
  const res = await request.get('/robots.txt');
  const text = await res.text();
  expect(text).toMatch(/GPTBot/i);
});

test('robots.txt has Sitemap directive', async ({ request }) => {
  const res = await request.get('/robots.txt');
  const text = await res.text();
  expect(text).toMatch(/Sitemap:/i);
});

// ── sitemap.xml ───────────────────────────────────────────────────────────────

test('sitemap.xml is served with > 800 entries', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  const text = await res.text();
  const matches = text.match(/<loc>/g);
  expect(matches, 'sitemap.xml has fewer than 800 <loc> entries').not.toBeNull();
  expect(matches!.length).toBeGreaterThan(800);
});

test('sitemap.xml entries reference bornclock.com domain', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  const text = await res.text();
  expect(text).toContain('bornclock.com');
});

// ── llms.txt ──────────────────────────────────────────────────────────────────

test('llms.txt is served and starts with "# BornClock"', async ({ request }) => {
  const res = await request.get('/llms.txt');
  expect(res.status()).toBe(200);
  const text = await res.text();
  expect(text.trim()).toMatch(/^# BornClock/);
});

// ── OG default image ──────────────────────────────────────────────────────────

test('dist/og/default.png is a valid PNG file', () => {
  const filePath = resolve(ROOT, 'public', 'og', 'default.png');
  expect(existsSync(filePath), `${filePath} does not exist`).toBe(true);

  const buf = readFileSync(filePath);
  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  expect(buf[0]).toBe(0x89);
  expect(buf[1]).toBe(0x50); // P
  expect(buf[2]).toBe(0x4e); // N
  expect(buf[3]).toBe(0x47); // G
});

test('/og/default.png is served with image/png content-type', async ({ request }) => {
  const res = await request.get('/og/default.png');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
});

// ── Born-on page SEO ──────────────────────────────────────────────────────────

test('three born-on pages have distinct page titles', async ({ page }) => {
  const getTitle = async (path: string) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    return page.title();
  };

  const t1 = await getTitle('/born-on/january-1');
  const t2 = await getTitle('/born-on/july-15');
  const t3 = await getTitle('/born-on/december-25');

  expect(t1).not.toBe(t2);
  expect(t2).not.toBe(t3);
  expect(t1).not.toBe(t3);

  // Each title should contain the month name
  expect(t1).toMatch(/January/i);
  expect(t2).toMatch(/July/i);
  expect(t3).toMatch(/December/i);
});

test('/born-on/july-15 has canonical link pointing to itself', async ({ page }) => {
  await page.goto('/born-on/july-15');
  await page.waitForLoadState('networkidle');

  // Use data-rh="true" to target the react-helmet-managed canonical (not the static fallback)
  const canonical = await page.locator('link[data-rh="true"][rel="canonical"]').getAttribute('href');
  expect(canonical).toContain('/born-on/july-15');
});

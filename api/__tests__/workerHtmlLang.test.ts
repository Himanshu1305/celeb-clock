import { describe, it, expect } from 'vitest';
import worker from '../../functions/_worker';
import { pageLangForPath, withHtmlLang } from '../../src/lib/seo/pageLang.js';

// Batch 10: Hindi pages must declare <html lang="hi"> (they used to inherit lang="en"
// from index.html). The Worker fixes any shell it serves for a Hindi URL.
const SHELL = '<!doctype html><html lang="en"><head><title>x</title></head><body></body></html>';
const env = {
  ASSETS: { fetch: async () => new Response(SHELL, { status: 200, headers: { 'content-type': 'text/html' } }) },
};
const get = (path: string) => worker.fetch(new Request(`https://bornclock.com${path}`), env as never, {});

describe('pageLangForPath', () => {
  it.each([
    ['/hi', 'hi'], ['/hi/', 'hi'], ['/hi/rashifal/mesh', 'hi'], ['/hi/panchang/delhi/', 'hi'], ['/hi/upay/shani',
      'hi'], ['/biological-age-hindi', 'hi'], ['/biological-age-hindi/', 'hi'],
    ['/', 'en'], ['/rashifal/mesha', 'en'], ['/hindu-calendar', 'en'], ['/history', 'en'], ['/kundali', 'en'],
  ])('%s → %s', (p, lang) => expect(pageLangForPath(p)).toBe(lang));
});

describe('withHtmlLang', () => {
  it('replaces an existing lang and keeps other attributes', () => {
    expect(withHtmlLang('<html lang="en" class="dark"><body></body></html>', 'hi')).toBe('<html lang="hi" class="dark"><body></body></html>');
  });
  it('adds lang when missing', () => {
    expect(withHtmlLang('<html><body></body></html>', 'hi')).toBe('<html lang="hi"><body></body></html>');
  });
});

describe('Worker — <html lang>', () => {
  it('serves Hindi pages with lang="hi"', async () => {
    for (const p of ['/hi/rashifal/', '/hi/kundli-milan/', '/hi/upay/', '/biological-age-hindi/']) {
      const html = await (await get(p)).text();
      expect(html, p).toContain('<html lang="hi">');
    }
  });
  it('leaves English pages as lang="en"', async () => {
    for (const p of ['/', '/kundali/', '/rashifal/']) {
      const html = await (await get(p)).text();
      expect(html, p).toContain('<html lang="en">');
    }
  });
});

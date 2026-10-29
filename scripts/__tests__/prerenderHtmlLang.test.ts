// Batch 10: the prerender sets <html lang> per route via src/lib/seo/pageLang.js. prerender.mjs
// cannot be imported in a test (importing it starts a full prerender), so check the wiring
// statically: the helpers are imported and applied before the head is finalised.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const src = readFileSync(resolve(__dirname, '../prerender.mjs'), 'utf8');

describe('prerender.mjs — <html lang> by route', () => {
  it('imports pageLangForPath and withHtmlLang from the shared module', () => {
    expect(src).toMatch(/import\s*\{\s*pageLangForPath,\s*withHtmlLang\s*\}\s*from\s*'\.\.\/src\/lib\/seo\/pageLang\.js'/);
  });
  it('applies them to every page before finalizeHead', () => {
    const apply = src.indexOf('html = withHtmlLang(html, pageLangForPath(route));');
    expect(apply).toBeGreaterThan(0);
    expect(apply).toBeLessThan(src.indexOf('html = finalizeHead(html, route).html;'));
  });
});

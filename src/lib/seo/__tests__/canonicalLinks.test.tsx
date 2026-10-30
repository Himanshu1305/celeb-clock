// @vitest-environment jsdom
// Batch 11 (GSC): every internal link points at the canonical trailing-slash URL, so no
// crawl of a header/footer/body link costs Googlebot a 301 hop ("Page with redirect").
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { canonicalPath, canonicalHref, isNonCanonicalInternalHref } from '../canonicalPath.js';
import { Link, canonicalTo } from '@/components/seo/CanonicalLink';

describe('canonicalPath', () => {
  it.each([
    ['/privacy', '/privacy/'],
    ['/privacy/', '/privacy/'],
    ['/', '/'],
    ['/kundali?x=1#faq', '/kundali/?x=1#faq'],
    ['/life-expectancy#simulator', '/life-expectancy/#simulator'],
    ['/born-on/july-23/india', '/born-on/july-23/india/'],
    ['/sitemap.xml', '/sitemap.xml'],
    ['/og/report/abc.png', '/og/report/abc.png'],
    ['/daily/x/2026-10.json', '/daily/x/2026-10.json'],
    ['/guide.pdf', '/guide.pdf'],
    ['/api/geo', '/api/geo'],
    ['/api', '/api'],
    ['#faq', '#faq'],
    ['?tab=2', '?tab=2'],
    ['relative/path', 'relative/path'],
    ['//cdn.example.com/x', '//cdn.example.com/x'],
    ['https://en.wikipedia.org/wiki/X', 'https://en.wikipedia.org/wiki/X'],
    ['mailto:a@b.c', 'mailto:a@b.c'],
  ])('%s → %s', (from, to) => expect(canonicalPath(from)).toBe(to));

  it('canonicalHref also fixes absolute and www site URLs', () => {
    expect(canonicalHref('https://bornclock.com/zodiac')).toBe('https://bornclock.com/zodiac/');
    expect(canonicalHref('https://www.bornclock.com/planetary-age')).toBe('https://bornclock.com/planetary-age/');
    expect(canonicalHref('https://bornclock.com')).toBe('https://bornclock.com/');
    expect(canonicalHref('https://bornclock.com/sitemap.xml')).toBe('https://bornclock.com/sitemap.xml');
    expect(canonicalHref('https://example.com/x')).toBe('https://example.com/x');
  });

  it('isNonCanonicalInternalHref flags only internal page links without the slash (or on www)', () => {
    for (const bad of ['/privacy', '/kundali#faq', 'https://bornclock.com/terms', 'https://www.bornclock.com/', '/born-on/july-23/india']) {
      expect(isNonCanonicalInternalHref(bad), bad).toBe(true);
    }
    for (const ok of ['/privacy/', '/', '/sitemap.xml', '/api/geo', '#top', 'https://example.com/a', 'https://bornclock.com/x/', 'mailto:x@y.z']) {
      expect(isNonCanonicalInternalHref(ok), ok).toBe(false);
    }
  });
});

describe('<Link> wrapper (src/components/seo/CanonicalLink)', () => {
  it('renders the trailing-slash href, keeps query/hash, leaves files and anchors alone', () => {
    const { container } = render(
      <MemoryRouter>
        <Link to="/privacy">a</Link>
        <Link to="/kundali?x=1#faq">b</Link>
        <Link to={{ pathname: '/terms', hash: '#c' }}>c</Link>
        <Link to="/sitemap.xml">d</Link>
        <Link to="/">e</Link>
      </MemoryRouter>,
    );
    const hrefs = [...container.querySelectorAll('a')].map(a => a.getAttribute('href'));
    expect(hrefs).toEqual(['/privacy/', '/kundali/?x=1#faq', '/terms/#c', '/sitemap.xml', '/']);
  });

  it('canonicalTo leaves an already-canonical object untouched', () => {
    const to = { pathname: '/a/', search: '?q' };
    expect(canonicalTo(to)).toBe(to);
  });
});

// Source guards — keep the fix central: one Link, no hand-written non-slash literals.
const SRC = join(__dirname, '../../..');
const files: string[] = [];
const walk = (d: string) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) { if (n !== '__tests__') walk(p); } else if (/\.(tsx?|jsx?)$/.test(n) && !/\.test\./.test(n)) files.push(p);
  }
};
walk(SRC);

describe('source guards', () => {
  it('no component imports Link straight from react-router-dom (use @/components/seo/CanonicalLink)', () => {
    const offenders = files.filter(f => !f.endsWith('CanonicalLink.tsx'))
      .filter(f => /import\s*\{[^}]*\bLink\b[^}]*\}\s*from\s*['"]react-router-dom['"]/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('no literal internal href/to without the trailing slash', () => {
    const bad: string[] = [];
    for (const f of files) {
      const s = readFileSync(f, 'utf8');
      for (const m of s.matchAll(/\b(?:href|to)=(["'])(\/[^"'\s{}]*)\1/g)) if (canonicalPath(m[2]) !== m[2]) bad.push(`${f.slice(SRC.length)}: ${m[2]}`);
      for (const m of s.matchAll(/\b(?:href|to)\s*:\s*(['"])(\/[^'"\s]*)\1/g)) if (canonicalPath(m[2]) !== m[2]) bad.push(`${f.slice(SRC.length)}: ${m[2]}`);
    }
    expect(bad).toEqual([]);
  });
});

describe('SEO drops the SPA shell\'s homepage canonical once the page has its own', () => {
  it('one canonical (the page\'s) remains', async () => {
    const { HelmetProvider } = await import('react-helmet-async');
    const { SEO } = await import('@/components/SEO');
    const { waitFor } = await import('@testing-library/react');
    document.head.innerHTML = '<link rel="canonical" href="https://bornclock.com/"><meta property="og:url" content="https://bornclock.com/">';
    render(<HelmetProvider><SEO title="X | BornClock" canonicalUrl="/kundali" /></HelmetProvider>);
    await waitFor(() => expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1));
    expect(document.head.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe('https://bornclock.com/kundali/');
    expect([...document.head.querySelectorAll('meta[property="og:url"]')].map(m => m.getAttribute('content'))).toEqual(['https://bornclock.com/kundali/']);
  });
});

describe('data that compares link paths still matches after the slash change', () => {
  it('toolsForTags always adds the Birthday Blueprint, even for off-topic posts', async () => {
    const { toolsForTags } = await import('@/lib/mesh');
    const tools = toolsForTags(['something-unrelated']);
    expect(tools.length).toBeGreaterThan(0);
    for (const t of tools) expect(t?.to, JSON.stringify(t)).toMatch(/^\/.*\/$/);
    expect(tools.some(t => t.to === '/birthday-report/')).toBe(true);
  });
});

// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LongevitySupplementsArticle } from '../articles/LongevitySupplementsArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><LongevitySupplementsArticle /></MemoryRouter></HelmetProvider>
);

describe('LongevitySupplementsArticle', () => {
  it('TC-LS-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-LS-P-02: H1 contains "supplement"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('supplement');
  });
  it('TC-LS-P-03: body mentions Vitamin D', () => {
    renderArticle();
    expect(document.body.textContent).toContain('Vitamin D');
  });
  it('TC-LS-P-04: body mentions evidence levels', () => {
    renderArticle();
    const text = document.body.textContent || '';
    expect(text).toContain('Strong');
    expect(text).toContain('Moderate');
    expect(text).toContain('Emerging');
  });
  it('TC-LS-P-05: prescription warning present', () => {
    renderArticle();
    expect((document.body.textContent || '').toLowerCase()).toContain('prescription');
  });
  it('TC-LS-P-06: comparison table present', () => {
    renderArticle();
    expect(document.querySelector('table')).toBeTruthy();
  });
  it('TC-LS-P-07: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-LS-P-08: FAQPage schema has 5 questions', () => {
    renderArticle();
    let count = 0;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      try {
        const d = JSON.parse(s.textContent || '');
        if (d['@type'] === 'FAQPage') count = d.mainEntity?.length || 0;
      } catch {}
    });
    expect(count).toBe(5);
  });
  it('TC-LS-P-09: CTA links to longevity-calculator', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('longevity-calculator'))).toBe(true);
  });
  it('TC-LS-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-LS-N-02: article text > 2000 chars', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(2000);
  });
});

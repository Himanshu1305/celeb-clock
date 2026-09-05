// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LongevityQuizArticle } from '../articles/LongevityQuizArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><LongevityQuizArticle /></MemoryRouter></HelmetProvider>
);

describe('LongevityQuizArticle', () => {
  it('TC-LQ-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-LQ-P-02: H1 contains "longevity quiz"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('longevity quiz');
  });
  it('TC-LQ-P-03: body contains "WHO"', () => {
    renderArticle();
    expect(document.body.textContent || '').toContain('WHO');
  });
  it('TC-LQ-P-04: at least 8 <h2> elements', () => {
    renderArticle();
    expect(document.querySelectorAll('h2').length).toBeGreaterThanOrEqual(8);
  });
  it('TC-LQ-P-05: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-LQ-P-06: FAQPage schema has 5 questions', () => {
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
  it('TC-LQ-P-07: links to /longevity-calculator', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('/longevity-calculator'))).toBe(true);
  });
  it('TC-LQ-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-LQ-N-02: article text > 2000 chars (genuine content)', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(2000);
  });
});

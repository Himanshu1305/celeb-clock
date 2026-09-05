// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LifeExpectancyByCountryArticle } from '../articles/LifeExpectancyByCountryArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><LifeExpectancyByCountryArticle /></MemoryRouter></HelmetProvider>
);

describe('LifeExpectancyByCountryArticle', () => {
  it('TC-LEC-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-LEC-P-02: H1 contains "life expectancy" and "country"', () => {
    renderArticle();
    const h1 = document.querySelector('h1')?.textContent?.toLowerCase() || '';
    expect(h1).toContain('life expectancy');
    expect(h1).toContain('country');
  });
  it('TC-LEC-P-03: body contains "Japan" and "84.3"', () => {
    renderArticle();
    const text = document.body.textContent || '';
    expect(text).toContain('Japan');
    expect(text).toContain('84.3');
  });
  it('TC-LEC-P-04: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-LEC-P-05: FAQPage schema has 5 questions', () => {
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
  it('TC-LEC-P-06: a link to /longevity-calculator exists', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href') === '/longevity-calculator')).toBe(true);
  });
  it('TC-LEC-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-LEC-N-02: article text > 2000 chars (genuine content)', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(2000);
  });
});

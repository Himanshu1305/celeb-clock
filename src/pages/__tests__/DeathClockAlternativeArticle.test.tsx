// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { DeathClockAlternativeArticle } from '../articles/DeathClockAlternativeArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><DeathClockAlternativeArticle /></MemoryRouter></HelmetProvider>
);

describe('DeathClockAlternativeArticle', () => {
  it('TC-DCA-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-DCA-P-02: H1 contains "death clock"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('death clock');
  });
  it('TC-DCA-P-03: body contains "Death Clock"', () => {
    renderArticle();
    expect(document.body.textContent).toContain('Death Clock');
  });
  it('TC-DCA-P-04: a <table> is present', () => {
    renderArticle();
    expect(document.querySelector('table')).toBeTruthy();
  });
  it('TC-DCA-P-05: body mentions "8 factors" or "8 lifestyle"', () => {
    renderArticle();
    const text = document.body.textContent || '';
    expect(text.includes('8 factors') || text.includes('8 lifestyle')).toBe(true);
  });
  it('TC-DCA-P-06: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-DCA-P-07: FAQPage schema has 5 questions', () => {
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
  it('TC-DCA-P-08: links to /longevity-calculator', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('/longevity-calculator'))).toBe(true);
  });
  it('TC-DCA-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-DCA-N-02: article text > 1500 chars (genuine content)', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(1500);
  });
});

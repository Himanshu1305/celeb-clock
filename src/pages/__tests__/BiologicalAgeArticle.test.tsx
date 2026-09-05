// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BiologicalAgeArticle } from '../articles/BiologicalAgeArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><BiologicalAgeArticle /></MemoryRouter></HelmetProvider>
);

describe('BiologicalAgeArticle', () => {
  it('TC-BIO-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-BIO-P-02: H1 contains "biological age"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('biological age');
  });
  it('TC-BIO-P-03: body contains "Horvath"', () => {
    renderArticle();
    expect(document.body.textContent).toContain('Horvath');
  });
  it('TC-BIO-P-04: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent||'')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-BIO-P-05: FAQPage schema has 5 questions', () => {
    renderArticle();
    let count = 0;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      try {
        const d = JSON.parse(s.textContent||'');
        if (d['@type'] === 'FAQPage') count = d.mainEntity?.length || 0;
      } catch {}
    });
    expect(count).toBe(5);
  });
  it('TC-BIO-P-06: calculator widget renders', () => {
    renderArticle();
    expect(document.querySelector('[data-testid="bio-age-calculator"]')).toBeTruthy();
  });
  it('TC-BIO-P-07: entering age shows a biological-age result', () => {
    renderArticle();
    const input = document.querySelector('#chrono-age') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '42' } });
    expect(document.querySelector('[data-testid="bio-age-result"]')).toBeTruthy();
  });
  it('TC-BIO-P-08: CTA links to /biological-age-calculator', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href') === '/biological-age-calculator')).toBe(true);
  });
  it('TC-BIO-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-BIO-N-02: article text > 2000 chars (genuine content)', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(2000);
  });
});

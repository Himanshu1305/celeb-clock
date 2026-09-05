// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { EpigeneticsArticle } from '../articles/EpigeneticsArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><EpigeneticsArticle /></MemoryRouter></HelmetProvider>
);

describe('EpigeneticsArticle', () => {
  it('TC-EPI-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-EPI-P-02: H1 contains "epigenetics"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('epigenetics');
  });
  it('TC-EPI-P-03: body mentions "Horvath"', () => {
    renderArticle();
    expect(document.body.textContent || '').toContain('Horvath');
  });
  it('TC-EPI-P-04: body mentions "telomere"', () => {
    renderArticle();
    expect((document.body.textContent || '').toLowerCase()).toContain('telomere');
  });
  it('TC-EPI-P-05: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent||'')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-EPI-P-06: FAQPage schema has 5 questions', () => {
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
  it('TC-EPI-P-07: CTA links to longevity-calculator', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('longevity-calculator'))).toBe(true);
  });
  it('TC-EPI-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-EPI-N-02: article text > 1500 chars', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(1500);
  });
});

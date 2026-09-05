// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { FamousPeopleLivedTo100Article } from '../articles/FamousPeopleLivedTo100Article';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><FamousPeopleLivedTo100Article /></MemoryRouter></HelmetProvider>
);

describe('FamousPeopleLivedTo100Article', () => {
  it('TC-C100-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-C100-P-02: H1 contains "100"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent).toContain('100');
  });
  it('TC-C100-P-03: body contains "Tanaka"', () => {
    renderArticle();
    expect(document.body.textContent).toContain('Tanaka');
  });
  it('TC-C100-P-04: at least 5 centenarian names present', () => {
    renderArticle();
    const text = document.body.textContent || '';
    ['Bob Hope', 'Olivia de Havilland', 'Henry Allingham', 'Kane Tanaka', 'Susannah Mushatt Jones'].forEach(name => {
      expect(text, `Missing ${name}`).toContain(name);
    });
  });
  it('TC-C100-P-05: "common" traits section present', () => {
    renderArticle();
    expect((document.body.textContent || '').toLowerCase()).toContain('common');
  });
  it('TC-C100-P-06: a <table> is present', () => {
    renderArticle();
    expect(document.querySelector('table')).toBeTruthy();
  });
  it('TC-C100-P-07: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-C100-P-08: FAQPage schema has 5 questions', () => {
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
  it('TC-C100-P-09: links to /longevity-calculator', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('/longevity-calculator'))).toBe(true);
  });
  it('TC-C100-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-C100-N-02: article text > 1500 chars (genuine content)', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(1500);
  });
});

// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BryanJohnsonArticle } from '../articles/BryanJohnsonArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><BryanJohnsonArticle /></MemoryRouter></HelmetProvider>
);

describe('BryanJohnsonArticle', () => {
  it('TC-BJ-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-BJ-P-02: H1 contains "bryan johnson"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('bryan johnson');
  });
  it('TC-BJ-P-03: body contains "$2" (reported spend)', () => {
    renderArticle();
    expect(document.body.textContent).toContain('$2');
  });
  it('TC-BJ-P-04: body contains "free" at least twice (case-insensitive)', () => {
    renderArticle();
    const matches = (document.body.textContent || '').toLowerCase().match(/free/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });
  it('TC-BJ-P-05: a <table> is present', () => {
    renderArticle();
    expect(document.querySelector('table')).toBeTruthy();
  });
  it('TC-BJ-P-06: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent||'')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-BJ-P-07: FAQPage schema has 5 questions', () => {
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
  it('TC-BJ-P-08: link to /longevity-calculator', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('/longevity-calculator'))).toBe(true);
  });
  it('TC-BJ-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-BJ-N-02: article text > 1500 chars (genuine content)', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(1500);
  });
});

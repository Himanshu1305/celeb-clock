// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { IndianCelebritiesFitnessArticle } from '../articles/IndianCelebritiesFitnessArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><IndianCelebritiesFitnessArticle /></MemoryRouter></HelmetProvider>
);

describe('IndianCelebritiesFitnessArticle', () => {
  it('TC-CFIT-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-CFIT-P-02: H1 contains "celebrities"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('celebrities');
  });
  it('TC-CFIT-P-03: body mentions Virat', () => {
    renderArticle();
    expect(document.body.textContent).toContain('Virat');
  });
  it('TC-CFIT-P-04: at least 5 celebrity names present', () => {
    renderArticle();
    const text = document.body.textContent || '';
    const names = ['Virat Kohli', 'MS Dhoni', 'Amitabh Bachchan', 'PV Sindhu', 'Saina Nehwal', 'Milind Soman'];
    const found = names.filter((n) => text.includes(n));
    expect(found.length).toBeGreaterThanOrEqual(5);
  });
  it('TC-CFIT-P-05: body mentions "Life Path"', () => {
    renderArticle();
    expect(document.body.textContent).toContain('Life Path');
  });
  it('TC-CFIT-P-06: a link containing "/celebrity" present', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some((l) => l.getAttribute('href')?.includes('/celebrity'))).toBe(true);
  });
  it('TC-CFIT-P-07: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some((s) => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-CFIT-P-08: FAQPage schema has 5 questions', () => {
    renderArticle();
    let count = 0;
    document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
      try {
        const d = JSON.parse(s.textContent || '');
        if (d['@type'] === 'FAQPage') count = d.mainEntity?.length || 0;
      } catch {}
    });
    expect(count).toBe(5);
  });
  it('TC-CFIT-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-CFIT-N-02: content > 1500 chars', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(1500);
  });
});

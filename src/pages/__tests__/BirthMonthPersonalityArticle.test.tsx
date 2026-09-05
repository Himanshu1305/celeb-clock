// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BirthMonthPersonalityArticle } from '../articles/BirthMonthPersonalityArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><BirthMonthPersonalityArticle /></MemoryRouter></HelmetProvider>
);

describe('BirthMonthPersonalityArticle', () => {
  it('TC-BMP-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-BMP-P-02: H1 contains "birth month"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('birth month');
  });
  it('TC-BMP-P-03: body mentions "zodiac"', () => {
    renderArticle();
    expect((document.body.textContent || '').toLowerCase()).toContain('zodiac');
  });
  it('TC-BMP-P-04: at least 6 month names present', () => {
    renderArticle();
    const text = document.body.textContent || '';
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const found = months.filter(m => text.includes(m)).length;
    expect(found).toBeGreaterThanOrEqual(6);
  });
  it('TC-BMP-P-05: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent||'')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-BMP-P-06: FAQPage schema has 5 questions', () => {
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
  it('TC-BMP-P-07: CTA links to birthday-report', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('birthday-report'))).toBe(true);
  });
  it('TC-BMP-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-BMP-N-02: article text > 1500 chars', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(1500);
  });
});

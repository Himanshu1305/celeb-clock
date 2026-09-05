// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ZodiacCompatibilityArticle } from '../articles/ZodiacCompatibilityArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><ZodiacCompatibilityArticle /></MemoryRouter></HelmetProvider>
);

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

describe('ZodiacCompatibilityArticle', () => {
  it('TC-ZC-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-ZC-P-02: H1 contains "compatibility"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('compatibility');
  });
  it('TC-ZC-P-03: H1 contains "zodiac"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('zodiac');
  });
  it('TC-ZC-P-04: all 12 sign names present', () => {
    renderArticle();
    const text = document.body.textContent || '';
    SIGNS.forEach(s => {
      expect(text, `Missing sign ${s}`).toContain(s);
    });
  });
  it('TC-ZC-P-05: calculator widget renders', () => {
    renderArticle();
    expect(document.querySelector('[data-testid="zodiac-compat-calculator"]')).toBeTruthy();
  });
  it('TC-ZC-P-06: Scorpio + Cancer shown as compatible', () => {
    renderArticle();
    const result = document.querySelector('[data-testid="zodiac-compat-result"]');
    expect(result?.textContent).toContain('Cancer');
    expect(result?.textContent?.toLowerCase()).toContain('compatible');
  });
  it('TC-ZC-P-07: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-ZC-P-08: FAQPage schema has 5 questions', () => {
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
  it('TC-ZC-P-09: CTA links to birthday-report', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('birthday-report'))).toBe(true);
  });
  it('TC-ZC-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-ZC-N-02: article text > 2000 chars', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(2000);
  });
});

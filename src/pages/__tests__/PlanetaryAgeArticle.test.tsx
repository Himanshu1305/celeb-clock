// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { PlanetaryAgeArticle } from '../articles/PlanetaryAgeArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><PlanetaryAgeArticle /></MemoryRouter></HelmetProvider>
);

describe('PlanetaryAgeArticle', () => {
  it('TC-PLA-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-PLA-P-02: H1 contains "planetary"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('planetary');
  });
  it('TC-PLA-P-03: body mentions Mercury', () => {
    renderArticle();
    expect(document.body.textContent).toContain('Mercury');
  });
  it('TC-PLA-P-04: calculator widget renders', () => {
    renderArticle();
    expect(document.querySelector('[data-testid="planetary-age-calculator"]')).toBeTruthy();
  });
  it('TC-PLA-P-05: entering a DOB shows all 7 planets', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1990-06-15' } });
    const result = document.querySelector('[data-testid="planetary-age-result"]');
    expect(result).toBeTruthy();
    const text = result?.textContent || '';
    ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'].forEach(p => {
      expect(text, `Missing ${p}`).toContain(p);
    });
  });
  it('TC-PLA-P-06: Mercury age is greater than Earth/actual age', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1990-06-15' } });
    // Actual Earth age for 1990-06-15 is ~35 in 2025-2026. Mercury age = daysLived/88.
    // daysLived ~ 13000+, /88 ~ 148+. So Mercury age should be well over 100.
    const result = document.querySelector('[data-testid="planetary-age-result"]');
    const text = result?.textContent || '';
    const mercuryMatch = text.match(/Mercury[^\d]*([\d,]+)/);
    expect(mercuryMatch).toBeTruthy();
    const mercuryAge = Number((mercuryMatch![1]).replace(/,/g, ''));
    const earthAge = new Date().getFullYear() - 1990;
    expect(mercuryAge).toBeGreaterThan(earthAge);
    expect(mercuryAge).toBeGreaterThan(100);
  });
  it('TC-PLA-P-07: CTA links to birthday-report', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('birthday-report'))).toBe(true);
  });
  it('TC-PLA-P-08: at least 2 birthday-report CTAs', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    const count = links.filter(l => l.getAttribute('href')?.includes('birthday-report')).length;
    expect(count).toBeGreaterThanOrEqual(2);
  });
  it('TC-PLA-P-09: related articles link to biorhythm and chinese-zodiac', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a')).map(l => l.getAttribute('href') || '');
    expect(links.some(h => h.includes('/articles/biorhythm-calculator'))).toBe(true);
    expect(links.some(h => h.includes('/articles/chinese-zodiac-by-year'))).toBe(true);
  });
  it('TC-PLA-P-10: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent||'')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-PLA-P-11: FAQPage schema has exactly 5 questions', () => {
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
  it('TC-PLA-N-01: no undefined or [object Object]', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1990-06-15' } });
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-PLA-N-02: article text > 1000 chars', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(1000);
  });
});

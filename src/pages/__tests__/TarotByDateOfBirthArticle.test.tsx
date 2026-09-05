// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { TarotByDateOfBirthArticle } from '../articles/TarotByDateOfBirthArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><TarotByDateOfBirthArticle /></MemoryRouter></HelmetProvider>
);

describe('TarotByDateOfBirthArticle', () => {
  it('TC-TAROT-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-TAROT-P-02: H1 contains "tarot"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('tarot');
  });
  it('TC-TAROT-P-03: calculator widget renders', () => {
    renderArticle();
    expect(document.querySelector('[data-testid="tarot-calculator"]')).toBeTruthy();
  });
  it('TC-TAROT-P-04: entering DOB 1988-11-05 (Scorpio) shows "Death"', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1988-11-05' } });
    const result = document.querySelector('[data-testid="tarot-result"]');
    expect(result).toBeTruthy();
    expect(result?.textContent).toContain('Death');
  });
  it('TC-TAROT-P-05: Life Path tarot table/section present', () => {
    renderArticle();
    const text = document.body.textContent || '';
    expect(document.querySelector('[data-testid="life-path-tarot-table"]')).toBeTruthy();
    expect(text).toContain('Life Path Tarot Card');
  });
  it('TC-TAROT-P-06: all 12 zodiac signs referenced', () => {
    renderArticle();
    const text = document.body.textContent || '';
    ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
      .forEach(sign => {
        expect(text, `Missing sign ${sign}`).toContain(sign);
      });
  });
  it('TC-TAROT-P-07: CTA links to birthday-report', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('birthday-report'))).toBe(true);
  });
  it('TC-TAROT-P-08: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-TAROT-P-09: FAQPage schema has 5 questions', () => {
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
  it('TC-TAROT-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-TAROT-N-02: article text > 1500 chars', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(1500);
  });
});

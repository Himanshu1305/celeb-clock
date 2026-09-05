// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ChineseZodiacArticle } from '../articles/ChineseZodiacArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><ChineseZodiacArticle /></MemoryRouter></HelmetProvider>
);

describe('ChineseZodiacArticle', () => {
  it('TC-CHZ-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-CHZ-P-02: H1 contains "chinese zodiac"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('chinese zodiac');
  });
  it('TC-CHZ-P-03: body mentions Dragon', () => {
    renderArticle();
    expect(document.body.textContent).toContain('Dragon');
  });
  it('TC-CHZ-P-04: all 12 animal names present', () => {
    renderArticle();
    const text = document.body.textContent || '';
    ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'].forEach(a => {
      expect(text, `Missing ${a}`).toContain(a);
    });
  });
  it('TC-CHZ-P-05: calculator widget renders', () => {
    renderArticle();
    expect(document.querySelector('[data-testid="chinese-zodiac-calculator"]')).toBeTruthy();
  });
  it('TC-CHZ-P-06: entering 1988 shows Dragon', () => {
    renderArticle();
    const input = document.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1988' } });
    const result = document.querySelector('[data-testid="chinese-zodiac-result"]');
    expect(result).toBeTruthy();
    expect(result?.textContent).toContain('Dragon');
  });
  it('TC-CHZ-P-07: entering 1990 shows Horse', () => {
    renderArticle();
    const input = document.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1990' } });
    const result = document.querySelector('[data-testid="chinese-zodiac-result"]');
    expect(result).toBeTruthy();
    expect(result?.textContent).toContain('Horse');
  });
  it('TC-CHZ-P-08: CTA links to birthday-report', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('birthday-report'))).toBe(true);
  });
  it('TC-CHZ-P-09: at least 2 birthday-report CTAs', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    const count = links.filter(l => l.getAttribute('href')?.includes('birthday-report')).length;
    expect(count).toBeGreaterThanOrEqual(2);
  });
  it('TC-CHZ-P-10: related articles link to moon-sign and planetary-age', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a')).map(l => l.getAttribute('href') || '');
    expect(links.some(h => h.includes('/articles/moon-sign-by-date-of-birth'))).toBe(true);
    expect(links.some(h => h.includes('/articles/planetary-age-calculator'))).toBe(true);
  });
  it('TC-CHZ-P-11: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent||'')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-CHZ-P-12: FAQPage schema has exactly 5 questions', () => {
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
  it('TC-CHZ-N-01: no undefined or [object Object]', () => {
    renderArticle();
    const input = document.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1988' } });
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-CHZ-N-02: article text > 2000 chars', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(2000);
  });
});

// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { VedicAstrologyArticle } from '../articles/VedicAstrologyArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><VedicAstrologyArticle /></MemoryRouter></HelmetProvider>
);

describe('VedicAstrologyArticle', () => {
  it('TC-VED-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-VED-P-02: H1 contains "vedic astrology"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('vedic astrology');
  });
  it('TC-VED-P-03: body contains "Nakshatra"', () => {
    renderArticle();
    expect(document.body.textContent).toContain('Nakshatra');
  });
  it('TC-VED-P-04: Devanagari Unicode present in body', () => {
    renderArticle();
    expect(document.body.textContent || '').toMatch(/[ऀ-ॿ]/);
  });
  it('TC-VED-P-05: calculator testid present', () => {
    renderArticle();
    expect(document.querySelector('[data-testid="vedic-calculator"]')).toBeTruthy();
  });
  it('TC-VED-P-06: entering DOB 1988-11-05 shows Vrischika', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1988-11-05' } });
    expect(document.querySelector('[data-testid="vedic-result"]')?.textContent).toContain('Vrischika');
  });
  it('TC-VED-P-07: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-VED-P-08: FAQPage schema has 5 questions', () => {
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
  it('TC-VED-P-09: CTA links to birthday-report', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('birthday-report'))).toBe(true);
  });
  it('TC-VED-P-10: disclaimer mentions birth time', () => {
    renderArticle();
    expect((document.body.textContent || '').toLowerCase()).toContain('birth time');
  });
  it('TC-VED-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-VED-N-02: content > 2500 chars', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(2500);
  });
});

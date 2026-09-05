// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { NakshatraArticle } from '../articles/NakshatraArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><NakshatraArticle /></MemoryRouter></HelmetProvider>
);

describe('NakshatraArticle', () => {
  it('TC-NAK-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-NAK-P-02: H1 contains "nakshatra"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('nakshatra');
  });
  it('TC-NAK-P-03: body contains dataCheck "Anuradha"', () => {
    renderArticle();
    expect(document.body.textContent || '').toContain('Anuradha');
  });
  it('TC-NAK-P-04: mentions all 3 ganas (Deva, Manushya, Rakshasa)', () => {
    renderArticle();
    const text = document.body.textContent || '';
    expect(text).toContain('Deva');
    expect(text).toContain('Manushya');
    expect(text).toContain('Rakshasa');
  });
  it('TC-NAK-P-05: text mentions "27"', () => {
    renderArticle();
    expect(document.body.textContent || '').toContain('27');
  });
  it('TC-NAK-P-06: calculator widget renders', () => {
    renderArticle();
    expect(document.querySelector('[data-testid="nakshatra-calculator"]')).toBeTruthy();
  });
  it('TC-NAK-P-07: entering DOB shows result', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1990-01-15' } });
    expect(document.querySelector('[data-testid="nakshatra-result"]')).toBeTruthy();
  });
  it('TC-NAK-P-08: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-NAK-P-09: FAQPage schema has 5 questions', () => {
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
  it('TC-NAK-P-10: CTA links to /birthday-report', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('birthday-report'))).toBe(true);
  });
  it('TC-NAK-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-NAK-N-02: article text > 3000 chars (genuine content)', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(3000);
  });
});

// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MoonSignArticle } from '../articles/MoonSignArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><MoonSignArticle /></MemoryRouter></HelmetProvider>
);

describe('MoonSignArticle', () => {
  it('TC-MS-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-MS-P-02: H1 contains "moon sign" or "rashi"', () => {
    renderArticle();
    const h1 = document.querySelector('h1')?.textContent?.toLowerCase() || '';
    expect(h1.includes('moon sign') || h1.includes('rashi')).toBe(true);
  });
  it('TC-MS-P-03: Rashi calculator renders', () => {
    renderArticle();
    expect(document.querySelector('[data-testid="rashi-calculator"]')).toBeTruthy();
  });
  it('TC-MS-P-04: entering DOB Nov 5 1988 shows Vrischika', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1988-11-05' } });
    const result = document.querySelector('[data-testid="rashi-result"]');
    expect(result).toBeTruthy();
    expect(result?.textContent).toContain('Vrischika');
  });
  it('TC-MS-P-05: Vrischika result shows Red Coral', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1988-11-05' } });
    expect(document.querySelector('[data-testid="rashi-result"]')?.textContent)
      .toContain('Red Coral');
  });
  it('TC-MS-P-06: Vrischika result shows Moonga (Hindi name)', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1988-11-05' } });
    expect(document.querySelector('[data-testid="rashi-result"]')?.textContent)
      .toContain('Moonga');
  });
  it('TC-MS-P-07: all 12 Rashis present in article', () => {
    renderArticle();
    const text = document.body.textContent || '';
    ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
     'Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'].forEach(r => {
      expect(text, `Missing ${r}`).toContain(r);
    });
  });
  it('TC-MS-P-08: Devanagari script rendered', () => {
    renderArticle();
    expect(/[ऀ-ॿ]/.test(document.body.textContent || '')).toBe(true);
  });
  it('TC-MS-P-09: mantras present', () => {
    renderArticle();
    expect(document.body.textContent).toContain('Om');
    expect(document.body.textContent).toContain('Namah');
  });
  it('TC-MS-P-10: Article + FAQPage schemas', () => {
    renderArticle();
    const types = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      .map(s => { try { return JSON.parse(s.textContent||'')['@type']; } catch { return ''; } });
    expect(types).toContain('Article');
    expect(types).toContain('FAQPage');
  });
  it('TC-MS-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-MS-N-02: approximate disclaimer present', () => {
    renderArticle();
    expect(document.body.textContent?.toLowerCase()).toContain('approximate');
  });
  it('TC-MS-N-03: article content > 2000 chars', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(2000);
  });
});

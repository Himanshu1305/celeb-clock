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
  // Batch 6 reference (Swiss Ephemeris, pyswisseph SIDM_LAHIRI, Moon at 00:00 / 23:59 IST):
  //   1988-11-05: 145.183° Simha → 156.999° Kanya  (Moon changed sign that day)
  //   1889-11-14:  96.475° Karka → 108.320° Karka  (one sign all day)
  // The old calculator renamed the Sun sign and said "Vrischika" for 1988-11-05.
  it('TC-MS-P-04: 1988-11-05 shows Simha or Kanya (depends on birth time), not Vrischika', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1988-11-05' } });
    const answer = document.querySelector('[data-testid="rashi-answer"]')?.textContent;
    expect(answer).toBe('Simha or Kanya (depends on birth time)');
    expect(document.querySelector('[data-testid="rashi-result"]')?.textContent).not.toContain('Vrischika');
  });
  it('TC-MS-P-05: 1889-11-14 shows a single Rashi, Karka, with Pearl', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1889-11-14' } });
    expect(document.querySelector('[data-testid="rashi-answer"]')?.textContent).toBe('Karka');
    expect(document.querySelector('[data-testid="rashi-result"]')?.textContent).toContain('Pearl');
  });
  it('TC-MS-P-06: Karka result shows Moti (Hindi name)', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1889-11-14' } });
    expect(document.querySelector('[data-testid="rashi-result"]')?.textContent)
      .toContain('Moti');
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
  it('TC-MS-N-02: birth-time caveat present (date-only rule explained)', () => {
    renderArticle();
    const t = document.body.textContent?.toLowerCase() || '';
    expect(t).toContain('birth time decides');
    expect(t).toContain('not from your western sun sign');
  });
  it('TC-MS-N-03: article content > 2000 chars', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(2000);
  });
});

// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BlueZonesDietArticle } from '../articles/BlueZonesDietArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><BlueZonesDietArticle /></MemoryRouter></HelmetProvider>
);

describe('BlueZonesDietArticle', () => {
  it('TC-BZD-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-BZD-P-02: H1 contains "blue zone"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('blue zone');
  });
  it('TC-BZD-P-03: body contains "Okinawa"', () => {
    renderArticle();
    expect(document.body.textContent).toContain('Okinawa');
  });
  it('TC-BZD-P-04: all 5 Blue Zone names present', () => {
    renderArticle();
    const text = document.body.textContent || '';
    ['Sardinia', 'Okinawa', 'Loma Linda', 'Nicoya', 'Ikaria'].forEach(z => {
      expect(text, `Missing zone ${z}`).toContain(z);
    });
  });
  it('TC-BZD-P-05: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-BZD-P-06: FAQPage schema has 5 questions', () => {
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
  it('TC-BZD-P-07: CTA links to longevity-calculator', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('/longevity-calculator'))).toBe(true);
  });
  it('TC-BZD-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-BZD-N-02: article text > 2000 chars (genuine content)', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(2000);
  });
});

// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { HowToLiveTo100Article } from '../articles/HowToLiveTo100Article';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><HowToLiveTo100Article /></MemoryRouter></HelmetProvider>
);

describe('HowToLiveTo100Article', () => {
  it('TC-100-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-100-P-02: H1 contains "100"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent).toContain('100');
  });
  it('TC-100-P-03: body contains "Blue Zone"', () => {
    renderArticle();
    expect(document.body.textContent).toContain('Blue Zone');
  });
  it('TC-100-P-04: all five Blue Zone names present', () => {
    renderArticle();
    const text = document.body.textContent || '';
    ['Sardinia', 'Okinawa', 'Loma Linda', 'Nicoya', 'Ikaria'].forEach(z => {
      expect(text, `Missing zone ${z}`).toContain(z);
    });
  });
  it('TC-100-P-05: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-100-P-06: FAQPage schema has 5 questions', () => {
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
  it('TC-100-P-07: links to /how-long-will-i-live', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('/how-long-will-i-live'))).toBe(true);
  });
  it('TC-100-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-100-N-02: article text > 2500 chars (genuine content)', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(2500);
  });
});

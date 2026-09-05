// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LifePathCompatibilityArticle } from '../articles/LifePathCompatibilityArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><LifePathCompatibilityArticle /></MemoryRouter></HelmetProvider>
);

describe('LifePathCompatibilityArticle', () => {
  it('TC-LPC-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-LPC-P-02: H1 contains "compatibility"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('compatibility');
  });
  it('TC-LPC-P-03: body contains "Life Path"', () => {
    renderArticle();
    expect(document.body.textContent).toContain('Life Path');
  });
  it('TC-LPC-P-04: master numbers 11, 22, 33 mentioned', () => {
    renderArticle();
    const text = document.body.textContent || '';
    expect(text).toContain('11');
    expect(text).toContain('22');
    expect(text).toContain('33');
  });
  it('TC-LPC-P-05: compatibility calculator widget renders', () => {
    renderArticle();
    expect(document.querySelector('[data-testid="lp-compat-calculator"]')).toBeTruthy();
  });
  it('TC-LPC-P-06: entering two DOBs shows both results', () => {
    renderArticle();
    const inputs = document.querySelectorAll('input[type="date"]');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
    fireEvent.change(inputs[0], { target: { value: '1973-03-28' } });
    fireEvent.change(inputs[1], { target: { value: '1990-01-01' } });
    const result = document.querySelector('[data-testid="lp-compat-result"]');
    expect(result).toBeTruthy();
    expect(result?.textContent).toContain('Life Path');
  });
  it('TC-LPC-P-07: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-LPC-P-08: FAQPage schema has 5 questions', () => {
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
  it('TC-LPC-P-09: CTA links to birthday-report', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('birthday-report'))).toBe(true);
  });
  it('TC-LPC-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-LPC-N-02: article text > 2500 chars (genuine content)', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(2500);
  });
});

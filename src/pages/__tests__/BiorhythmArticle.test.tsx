// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BiorhythmArticle } from '../articles/BiorhythmArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><BiorhythmArticle /></MemoryRouter></HelmetProvider>
);

describe('BiorhythmArticle', () => {
  it('TC-BIO-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-BIO-P-02: H1 contains "biorhythm"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('biorhythm');
  });
  it('TC-BIO-P-03: body mentions cycle lengths 23, 28, 33', () => {
    renderArticle();
    const text = document.body.textContent || '';
    expect(text).toContain('23');
    expect(text).toContain('28');
    expect(text).toContain('33');
  });
  it('TC-BIO-P-04: body mentions physical, emotional, intellectual', () => {
    renderArticle();
    const text = (document.body.textContent || '').toLowerCase();
    expect(text).toContain('physical');
    expect(text).toContain('emotional');
    expect(text).toContain('intellectual');
  });
  it('TC-BIO-P-05: calculator widget renders', () => {
    renderArticle();
    expect(document.querySelector('[data-testid="biorhythm-calculator"]')).toBeTruthy();
  });
  it('TC-BIO-P-06: entering DOB shows result with a number', () => {
    renderArticle();
    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1990-05-15' } });
    const result = document.querySelector('[data-testid="biorhythm-result"]');
    expect(result).toBeTruthy();
    expect(result?.textContent).toMatch(/-?\d+%/);
  });
  it('TC-BIO-P-07: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent||'')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-BIO-P-08: FAQPage schema has 5 questions', () => {
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
  it('TC-BIO-P-09: CTA links to birthday-report', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('birthday-report'))).toBe(true);
  });
  it('TC-BIO-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-BIO-N-02: article text > 1500 chars (genuine content)', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(1500);
  });
});

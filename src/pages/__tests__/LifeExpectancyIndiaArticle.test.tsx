// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LifeExpectancyIndiaArticle } from '../articles/LifeExpectancyIndiaArticle';
afterEach(cleanup);
const renderArticle = () => render(
  <HelmetProvider><MemoryRouter><LifeExpectancyIndiaArticle /></MemoryRouter></HelmetProvider>
);

describe('LifeExpectancyIndiaArticle', () => {
  it('TC-LEI-P-01: renders without crashing', () => {
    expect(() => renderArticle()).not.toThrow();
  });
  it('TC-LEI-P-02: H1 contains "india"', () => {
    renderArticle();
    expect(document.querySelector('h1')?.textContent?.toLowerCase()).toContain('india');
  });
  it('TC-LEI-P-03: body contains "Kerala" and "75.1"', () => {
    renderArticle();
    const text = document.body.textContent || '';
    expect(text).toContain('Kerala');
    expect(text).toContain('75.1');
  });
  it('TC-LEI-P-04: Article JSON-LD schema present', () => {
    renderArticle();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'Article'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-LEI-P-05: FAQPage schema has 5 questions', () => {
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
  it('TC-LEI-P-06: links to /longevity-calculator', () => {
    renderArticle();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('/longevity-calculator'))).toBe(true);
  });
  it('TC-LEI-N-01: no undefined or [object Object]', () => {
    renderArticle();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-LEI-N-02: article text > 2000 chars (genuine content)', () => {
    renderArticle();
    expect((document.body.textContent?.trim().length || 0)).toBeGreaterThan(2000);
  });
});

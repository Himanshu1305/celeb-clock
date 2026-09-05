// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LifeExpectancySingaporeUAEPage } from '../LifeExpectancySingaporeUAEPage';
afterEach(cleanup);
const renderPage = () => render(
  <HelmetProvider><MemoryRouter><LifeExpectancySingaporeUAEPage /></MemoryRouter></HelmetProvider>
);

describe('LifeExpectancySingaporeUAEPage', () => {
  it('TC-SGU-P-01: renders without crashing', () => {
    expect(() => renderPage()).not.toThrow();
  });
  it('TC-SGU-P-02: testid present', () => {
    renderPage();
    expect(document.querySelector('[data-testid="sg-uae-le-page"]')).toBeTruthy();
  });
  it('TC-SGU-P-03: H1 contains "Singapore"', () => {
    renderPage();
    expect(document.querySelector('h1')?.textContent).toContain('Singapore');
  });
  it('TC-SGU-P-04: body contains "83.9"', () => {
    renderPage();
    expect(document.body.textContent).toContain('83.9');
  });
  it('TC-SGU-P-05: FAQPage schema has 5 questions', () => {
    renderPage();
    let count = 0;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      try {
        const d = JSON.parse(s.textContent || '');
        if (d['@type'] === 'FAQPage') count = d.mainEntity?.length || 0;
      } catch {}
    });
    expect(count).toBe(5);
  });
  it('TC-SGU-P-06: SoftwareApplication schema present', () => {
    renderPage();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'SoftwareApplication'; } catch { return false; }
    })).toBe(true);
  });
  it('TC-SGU-P-07: links to /longevity-calculator', () => {
    renderPage();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('/longevity-calculator'))).toBe(true);
  });
  it('TC-SGU-N-01: no undefined or [object Object]', () => {
    renderPage();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
});

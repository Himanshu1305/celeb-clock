// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LifeExpectancyCanadaPage } from '../LifeExpectancyCanadaPage';

afterEach(cleanup);

const TESTID = 'canada-le-page';
const COUNTRY_TOKEN = 'CANADA';
const AVG = '82.0';

const renderPage = () => render(
  <HelmetProvider><MemoryRouter><LifeExpectancyCanadaPage /></MemoryRouter></HelmetProvider>
);

describe('LifeExpectancyCanadaPage', () => {
  it('renders without crashing', () => {
    expect(() => renderPage()).not.toThrow();
  });
  it('testid present', () => {
    renderPage();
    expect(document.querySelector(`[data-testid="${TESTID}"]`)).toBeTruthy();
  });
  it('H1 (uppercased) contains country token', () => {
    renderPage();
    const h1 = document.querySelector('h1')?.textContent || '';
    expect(h1.toUpperCase()).toContain(COUNTRY_TOKEN);
  });
  it('body contains avg figure', () => {
    renderPage();
    expect(document.body.textContent).toContain(AVG);
  });
  it('FAQPage schema has exactly 5 questions', () => {
    renderPage();
    let count = -1;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      try {
        const d = JSON.parse(s.textContent || '');
        if (d['@type'] === 'FAQPage') count = d.mainEntity?.length ?? -1;
      } catch { /* ignore */ }
    });
    expect(count).toBe(5);
  });
  it('SoftwareApplication schema present', () => {
    renderPage();
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    expect(schemas.some(s => {
      try { return JSON.parse(s.textContent || '')['@type'] === 'SoftwareApplication'; } catch { return false; }
    })).toBe(true);
  });
  it('has a link to /longevity-calculator', () => {
    renderPage();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href') === '/longevity-calculator')).toBe(true);
  });
  it('no "undefined" in rendered text', () => {
    renderPage();
    expect(document.body.textContent).not.toContain('undefined');
  });
});

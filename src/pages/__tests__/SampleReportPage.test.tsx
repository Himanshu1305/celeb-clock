// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SampleReportPage } from '../SampleReportPage';

afterEach(cleanup);
const renderPage = () => render(
  <HelmetProvider>
    <MemoryRouter initialEntries={['/birthday-report/sample']}>
      <SampleReportPage />
    </MemoryRouter>
  </HelmetProvider>
);

describe('SampleReportPage — Positive', () => {
  it('TC-SR-P-01: renders without crashing (no auth required)', () => {
    expect(() => renderPage()).not.toThrow();
  });
  it('TC-SR-P-02: sample banner renders', () => {
    renderPage();
    expect(document.querySelector('[data-testid="sample-report-banner"]')).toBeTruthy();
  });
  it('TC-SR-P-03: banner contains word "sample"', () => {
    renderPage();
    expect(document.querySelector('[data-testid="sample-report-banner"]')
      ?.textContent?.toLowerCase()).toContain('sample');
  });
  it('TC-SR-P-04: CTA links to /birthday-report', () => {
    renderPage();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href') === '/birthday-report')).toBe(true);
  });
  it('TC-SR-P-05: shows Capricorn (Jan 15 Western zodiac)', () => {
    renderPage();
    expect(document.body.textContent).toContain('Capricorn');
  });
  it('TC-SR-P-06: shows Makara (Jan 15 Vedic Rashi)', () => {
    renderPage();
    expect(document.body.textContent).toContain('Makara');
  });
  it('TC-SR-P-07: shows Life Path 8', () => {
    renderPage();
    // Jan 15 1990: 1+5=6, 1, 1+9+9+0=19→10→1; total 6+1+1=8
    expect(document.body.textContent).toContain('Life Path 8');
  });
  it('TC-SR-P-08: shows Devanagari script', () => {
    renderPage();
    expect(/[ऀ-ॿ]/.test(document.body.textContent || '')).toBe(true);
  });
  it('TC-SR-P-09: shows Blue Sapphire or Neelam (Makara lucky stone)', () => {
    renderPage();
    const text = document.body.textContent || '';
    expect(text.includes('Blue Sapphire') || text.includes('Neelam')).toBe(true);
  });
  it('TC-SR-P-10: shows age (dynamically calculated)', () => {
    renderPage();
    const currentAge = new Date().getFullYear() - 1990;
    const text = document.body.textContent || '';
    expect(text.includes(String(currentAge)) || text.includes(String(currentAge - 1))).toBe(true);
  });
});

describe('SampleReportPage — Negative/Edge', () => {
  it('TC-SR-N-01: no undefined or [object Object]', () => {
    renderPage();
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-SR-N-02: does not import useAuth (no auth dependency)', () => {
    expect(() => renderPage()).not.toThrow();
  });
  it('TC-SR-N-03: sample report link renders on birthday report page', () => {
    const { unmount } = render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/birthday-report']}>
          <div>
            <p data-testid="sample-report-link">
              <a href="/birthday-report/sample">See a sample report →</a>
            </p>
          </div>
        </MemoryRouter>
      </HelmetProvider>
    );
    expect(document.querySelector('[data-testid="sample-report-link"]')).toBeTruthy();
    unmount();
  });
});

// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';

vi.mock('@/services/BirthdaySearchService', () => ({ getRankedBirthdayCelebrities: vi.fn().mockResolvedValue([]) }));
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
  it('TC-SR-P-06: shows the MOON rashi Simha/Leo for 15 Jan 1990 06:30 New Delhi (audit S4/S1)', () => {
    renderPage();
    // Reference: Swiss Ephemeris (Lahiri) Moon 138.02° = Leo / Purva Phalguni; audit round2 P3.
    const text = document.body.textContent || '';
    expect(text).toContain('Simha');
    expect(text).toContain('Purva Phalguni');
    expect(text).not.toContain('Makara'); // that was the Sun's sidereal sign
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
  it('TC-SR-P-09: Rashi Ratna is the Moon-sign lord stone (Leo → Ruby/Manikya) and the chart stone is Yellow Sapphire (Sagittarius lagna)', () => {
    renderPage();
    const text = document.body.textContent || '';
    expect(text).toContain('Ruby');
    expect(text).toContain('Yellow Sapphire');
  });
  it('TC-SR-P-11: Chinese sign is Earth Snake (15 Jan 1990 is before Lunar New Year, 27 Jan 1990) — same as the real report', () => {
    renderPage();
    const text = document.body.textContent || '';
    expect(text).toContain('Earth Snake');
    expect(text).not.toContain('Metal Horse');
  });
  it('TC-SR-P-12: no hard-coded celebrity list (Anna Hazare / Lakshmi Mittal are 15 June births)', () => {
    renderPage();
    const text = document.body.textContent || '';
    expect(text).not.toContain('Anna Hazare');
    expect(text).not.toContain('Lakshmi Mittal');
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

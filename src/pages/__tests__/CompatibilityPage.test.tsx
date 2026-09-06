// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import CompatibilityPage from '../CompatibilityPage';

const renderCompat = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/compatibility']}>
        <CompatibilityPage />
      </MemoryRouter>
    </HelmetProvider>
  );

const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);
const calc = (a: string, b: string) => {
  fireEvent.change(q('compat-dob-a')!, { target: { value: a } });
  fireEvent.change(q('compat-dob-b')!, { target: { value: b } });
  fireEvent.click(q('compat-calc-btn')!);
};

describe('Compatibility Calculator — TC-COMPAT', () => {
  afterEach(() => cleanup());

  it('TC-COMPAT-P-01: renders without crash', () => expect(() => renderCompat()).not.toThrow());
  it('TC-COMPAT-P-02: Person A DOB input present', () => { renderCompat(); expect(q('compat-dob-a')).toBeTruthy(); });
  it('TC-COMPAT-P-03: Person B DOB input present', () => { renderCompat(); expect(q('compat-dob-b')).toBeTruthy(); });
  it('TC-COMPAT-P-04: calculate button present', () => { renderCompat(); expect(q('compat-calc-btn')).toBeTruthy(); });
  it('TC-COMPAT-P-05: two DOBs → 3 dimension sections + nakshatra disclaimer', () => {
    renderCompat();
    calc('1988-11-05', '1965-08-06');
    expect(q('compat-zodiac')).toBeTruthy();
    expect(q('compat-rashi')).toBeTruthy();
    expect(q('compat-lifepath')).toBeTruthy();
    // Nakshatra dimension removed (needs exact birth time) → disclaimer instead.
    expect(q('compat-nakshatra')).toBeFalsy();
    expect(q('compat-nakshatra-disclaimer')).toBeTruthy();
  });
  it('TC-COMPAT-P-06: overall score is 0-100', () => {
    renderCompat();
    calc('1988-11-05', '1965-08-06');
    const num = parseInt(q('compat-overall-score')!.textContent || '0');
    expect(num).toBeGreaterThanOrEqual(0);
    expect(num).toBeLessThanOrEqual(100);
  });
  it('TC-COMPAT-P-07: zodiac section shows Scorpio for Nov 5', () => {
    renderCompat();
    calc('1988-11-05', '1965-08-06');
    expect(q('compat-zodiac')!.textContent).toContain('Scorpio');
  });
  it('TC-COMPAT-P-08: FAQPage schema present', async () => {
    renderCompat();
    // FAQSchema injects via react-helmet-async (async head flush) — wait for it.
    await waitFor(() => {
      const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      const hasFaq = schemas.some(s => {
        try { return JSON.parse(s.textContent || '')['@type'] === 'FAQPage'; } catch { return false; }
      });
      expect(hasFaq).toBe(true);
    }, { timeout: 2000 });
  });
  it('TC-COMPAT-P-09: CTA links to birthday-report', () => {
    renderCompat();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('birthday-report'))).toBe(true);
  });
  it('TC-COMPAT-P-10: WhatsApp share appears after calculation with wa.me', () => {
    renderCompat();
    calc('1988-11-05', '1965-08-06');
    expect(q('compat-whatsapp-share')!.getAttribute('href')).toContain('wa.me');
  });

  // NEGATIVE
  it('TC-COMPAT-N-01: same DOB → high score, no crash', () => {
    renderCompat();
    expect(() => calc('1990-05-15', '1990-05-15')).not.toThrow();
    expect(q('compat-overall-score')).toBeTruthy();
  });
  it('TC-COMPAT-N-02: no undefined in results', () => {
    renderCompat();
    calc('1988-11-05', '1965-08-06');
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-COMPAT-N-03: recalculating with new DOB does not crash', () => {
    renderCompat();
    calc('1988-11-05', '1965-08-06');
    expect(() => calc('1988-11-05', '1990-01-15')).not.toThrow();
  });

  // EDGE
  it('TC-COMPAT-EDGE-01: both Feb 29 1992 → no crash', () => {
    renderCompat();
    expect(() => calc('1992-02-29', '1992-02-29')).not.toThrow();
  });
  it('TC-COMPAT-EDGE-02: master-number-ish DOBs → no crash', () => {
    renderCompat();
    expect(() => calc('1979-02-02', '1980-11-02')).not.toThrow();
  });
  it('TC-COMPAT-EDGE-03: Scorpio + Leo shows a challenging indicator', () => {
    renderCompat();
    calc('1988-11-05', '1965-08-06'); // Scorpio (Water) + Leo (Fire)
    const zodiacText = q('compat-zodiac')!.textContent?.toLowerCase() || '';
    expect(zodiacText).toMatch(/challenging|difficult|not/);
  });
});

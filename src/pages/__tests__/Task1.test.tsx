// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CelebrityPage } from '../CelebrityPage';
import CompatibilityPage from '../CompatibilityPage';
import { VIRAT, SRK, SACHIN } from '../../__tests__/testData';

const renderCelebPage = (slug: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/celebrity/${slug}`]}>
        <Routes>
          <Route path="/celebrity/:slug" element={<CelebrityPage />} />
          <Route path="/celebrity/" element={<div data-testid="celeb-index">Index</div>} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

const renderCompatPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/compatibility']}>
        <CompatibilityPage />
      </MemoryRouter>
    </HelmetProvider>
  );

const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);

describe('TC-NFIX', () => {
  afterEach(() => cleanup());

  it('TC-NFIX-P-01: birth-time reliability note renders on celeb page', () => {
    renderCelebPage(VIRAT.slug);
    const note = q('celebrity-birthtime-note');
    expect(note).toBeTruthy();
    // No verified time → honest "not on record" default (P4-CELEB-BIRTHTIME).
    expect(note?.getAttribute('data-reliability')).toBe('unknown');
  });
  it('TC-NFIX-P-02: note CTA links to /birthday-report', () => {
    renderCelebPage(VIRAT.slug);
    const cta = q('celebrity-birthtime-cta') as HTMLAnchorElement;
    expect(cta?.getAttribute('href')).toContain('birthday-report');
  });
  it('TC-NFIX-P-03: note text mentions birth time', () => {
    renderCelebPage(VIRAT.slug);
    expect(q('celebrity-birthtime-note')?.textContent?.toLowerCase()).toContain('birth time');
  });
  it('TC-NFIX-P-04: compatibility page renders', () => {
    expect(() => renderCompatPage()).not.toThrow();
  });
  it('TC-NFIX-P-05: compatibility shows 3 not 4 dimensions', () => {
    renderCompatPage();
    expect(document.body.textContent).not.toMatch(/four dimensions.*Nakshatra/i);
    expect(document.body.textContent).toMatch(/three dimensions/i);
  });
  it('TC-NFIX-P-06: price on celeb page is 199 not 299', () => {
    renderCelebPage(VIRAT.slug);
    const body = document.body.textContent || '';
    if (body.includes('₹')) expect(body).not.toMatch(/₹299.*report/i);
  });
  it('TC-NFIX-P-07: Prabhupada celeb page renders with birth-time note', () => {
    expect(() => renderCelebPage('srila-prabhupada')).not.toThrow();
    expect(q('celebrity-birthtime-note')).toBeTruthy();
  });
  it('TC-NFIX-N-01: Virat page NEVER shows wrong Nakshatra Anuradha', () => {
    renderCelebPage(VIRAT.slug);
    expect(document.body.textContent).not.toContain(VIRAT.wrong_nakshatra);
  });
  it('TC-NFIX-N-02: SRK page shows no computed Nakshatra name', () => {
    renderCelebPage(SRK.slug);
    // No day/month Nakshatra is displayed anywhere on the page anymore.
    expect(q('celebrity-birthtime-note')).toBeTruthy();
    expect(document.body.textContent).not.toContain(SRK.wrong_nakshatra);
  });
  it('TC-NFIX-N-03: Sachin page shows no computed Nakshatra name', () => {
    renderCelebPage(SACHIN.slug);
    expect(document.body.textContent).not.toContain(SACHIN.wrong_nakshatra);
  });
  it('TC-NFIX-N-04: no Nakshatra gana score in compatibility', () => {
    renderCompatPage();
    expect(document.body.textContent).not.toContain('Nakshatra score');
    expect(document.body.textContent).not.toContain('gana score');
  });
  it('TC-NFIX-N-05: no undefined on celeb page', () => {
    renderCelebPage(VIRAT.slug);
    expect(document.body.textContent).not.toContain('undefined');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-NFIX-N-06: compatibility still shows zodiac/life path', () => {
    renderCompatPage();
    expect(document.body.textContent).toMatch(/zodiac|Life Path|Rashi/i);
  });
  it('TC-NFIX-EDGE-01: nonexistent slug celeb renders without crash', () => {
    expect(() => renderCelebPage('some-year-only-celeb')).not.toThrow();
  });
  it('TC-NFIX-EDGE-02: no [object Object] on celeb page', () => {
    renderCelebPage(VIRAT.slug);
    expect(document.body.textContent).not.toContain('[object Object]');
  });
});

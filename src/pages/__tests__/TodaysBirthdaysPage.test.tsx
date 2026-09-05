// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock the data services so the page resolves to an empty (0-celebrity) state.
vi.mock('@/services/BirthdaySearchService', () => ({
  getRankedBirthdayCelebrities: vi.fn(async () => []),
  searchLocalDatabase: vi.fn(async () => ({ people: [] })),
}));
vi.mock('@/services/CelebrityBoostService', () => ({
  getTodayTopBoosted: vi.fn(async () => []),
}));

import TodaysBirthdaysPage from '../TodaysBirthdaysPage';
import { CelebrityPage } from '../CelebrityPage';

const renderToday = () =>
  render(
    <HelmetProvider><MemoryRouter initialEntries={['/todays-birthdays']}><TodaysBirthdaysPage /></MemoryRouter></HelmetProvider>
  );

const renderCeleb = (slug: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/celebrity/${slug}`]}>
        <Routes>
          <Route path="/celebrity/:slug" element={<CelebrityPage />} />
          <Route path="/celebrity/" element={<div>Index</div>} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

describe("Today's Birthdays + Affiliates — TC-MISC", () => {
  afterEach(() => cleanup());

  it('TC-MISC-P-01: /todays-birthdays renders without crash', () => {
    expect(() => renderToday()).not.toThrow();
  });
  it('TC-MISC-P-02: shows a graceful message when 0 celebrities today', async () => {
    renderToday();
    await waitFor(() => {
      expect(document.body.textContent).not.toContain('[object Object]');
      expect(document.body.textContent?.toLowerCase()).toMatch(/no results|no celebrit|born/);
    }, { timeout: 3000 });
  });
  it('TC-MISC-P-03: lucky-stone affiliate link renders on a celebrity page', () => {
    renderCeleb('virat-kohli');
    const affiliate = Array.from(document.querySelectorAll('a[rel*="sponsored"]'));
    expect(affiliate.length).toBeGreaterThan(0);
  });
  it('TC-MISC-N-01: affiliate links are valid URLs with no undefined', () => {
    renderCeleb('virat-kohli');
    const affiliate = Array.from(document.querySelectorAll('a[rel*="sponsored"]')) as HTMLAnchorElement[];
    affiliate.forEach(l => {
      expect(l.href).toMatch(/^https?:\/\//);
      expect(l.href).not.toContain('undefined');
    });
  });
  it('TC-MISC-EDGE-01: empty today → no crash, no broken markers', async () => {
    renderToday();
    await waitFor(() => {
      expect(document.body.textContent).not.toContain('undefined');
    }, { timeout: 3000 });
  });
});

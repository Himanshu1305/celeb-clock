// @vitest-environment jsdom
// Batch 9b: /muhurat/:type/:year — month tables, season gaps, city recompute, FAQ JSON-LD.
import { describe, it, expect, afterEach, beforeAll, afterAll, vi } from 'vitest';

// Freeze the clock (29 Oct 2026): the 2026 page splits upcoming and past months by today.
beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-10-29T06:30:00Z')); });
afterAll(() => { vi.useRealTimers(); });
import { render, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import MuhuratYearPage from '../MuhuratYearPage';
import { MUHURAT_YEAR_META } from '@/lib/muhuratYearMeta.js';
import { muhuratYearRoutes } from '@/lib/muhuratYearMeta.js';

afterEach(cleanup);

function renderPath(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/muhurat" element={<div data-testid="finder" />} />
          <Route path="/muhurat/:type/:year" element={<MuhuratYearPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('year muhurat pages', () => {
  it('10 routes with distinct titles', () => {
    const routes = muhuratYearRoutes();
    expect(routes).toHaveLength(10);
    const titles = routes.map(r => { const [, , s, y] = r.split('/'); return MUHURAT_YEAR_META[s].title(Number(y)); });
    expect(new Set(titles).size).toBe(10);
  });

  it('2027 marriage: all 12 months, the Chaturmas gap with its Ekadashi dates, FAQ JSON-LD', async () => {
    const { container, getByTestId } = renderPath('/muhurat/marriage/2027');
    expect(container.querySelector('h1')!.textContent).toBe('Shubh Vivah Muhurat 2027: Marriage Dates & Timings');
    await waitFor(() => expect(container.querySelectorAll('[data-testid="muhurat-year-month"]').length).toBe(12));
    expect(container.querySelectorAll('[data-testid="muhurat-year-row"]').length).toBeGreaterThan(50);
    const seasons = getByTestId('muhurat-year-seasons').textContent!;
    expect(seasons).toContain('14 Jul 2027 – 10 Nov 2027');
    expect(seasons).toContain('Devshayani');
    const ld = [...container.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent!));
    expect(ld.some(j => j['@type'] === 'FAQPage')).toBe(true);
    expect(document.body.textContent).not.toMatch(/undefined|NaN/);
  });

  it('2026 page shows Nov–Dec, folds the past months and points to 2027', async () => {
    const { container, getByTestId } = renderPath('/muhurat/griha-pravesh/2026');
    await waitFor(() => expect(getByTestId('muhurat-year-past')).toBeTruthy());
    const open = [...container.querySelectorAll(':scope [data-testid="muhurat-year-month"]')].filter(el => !el.closest('details'));
    expect(open.map(el => el.querySelector('h3')!.textContent!.split(' ')[0])).toEqual(['October', 'November', 'December']);
    expect(getByTestId('muhurat-year-next').querySelector('a')!.getAttribute('href')).toBe('/muhurat/griha-pravesh/2027/');
  });

  it('choosing another city recomputes the list', async () => {
    const { container, getByTestId } = renderPath('/muhurat/vehicle-purchase/2027');
    await waitFor(() => expect(container.querySelectorAll('[data-testid="muhurat-year-row"]').length).toBeGreaterThan(0));
    const delhi = getByTestId('muhurat-year-lead').textContent;
    fireEvent.change(getByTestId('muhurat-year-city-select'), { target: { value: 'Chennai' } });
    await waitFor(() => expect(getByTestId('muhurat-year-lead').textContent).toContain('Chennai'), { timeout: 20000 });
    expect(getByTestId('muhurat-year-lead').textContent).not.toBe(delhi);
  }, 30000);

  it('unknown type or year goes back to the finder', () => {
    const { getByTestId } = renderPath('/muhurat/business/2027');
    expect(getByTestId('finder')).toBeTruthy();
  });
});

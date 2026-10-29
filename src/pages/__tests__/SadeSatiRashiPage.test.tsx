// @vitest-environment jsdom
// Batch 9b: the per-rashi Sade Sati page shows the status for the VIEWER's today (worked out
// in the browser from the ingress table), so a stale build never shows a stale phase.
// Expected phases come from Saturn's ingress dates (Swiss Ephemeris + Drik 2027 table, see
// src/lib/vedic/__tests__/sadeSatiRashi.test.ts).
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import SadeSatiRashiPage from '../SadeSatiRashiPage';

afterEach(() => { cleanup(); vi.useRealTimers(); });

function renderAt(path: string, iso: string) {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(iso));
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/sade-sati" element={<div>calc</div>} />
          <Route path="/sade-sati/:rashi" element={<SadeSatiRashiPage />} />
          <Route path="/hi/sade-sati/:rashi" element={<SadeSatiRashiPage lang="hi" />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('SadeSatiRashiPage', () => {
  it('Mesha on 29 Oct 2026: phase 1; on 1 Aug 2027: phase 2 (status follows the clock)', () => {
    const a = renderAt('/sade-sati/mesh', '2026-10-29T06:00:00Z');
    expect(a.getByTestId('ss-rashi-headline').textContent).toBe('Mesha is in Sade Sati — Phase 1 — Rising');
    expect(a.getByTestId('ss-rashi-today').textContent).toBe('29 October 2026');
    expect(document.querySelector('h1')?.textContent).toBe('Mesha Rashi Sade Sati — Start and End Dates');
    cleanup(); vi.useRealTimers();
    const b = renderAt('/sade-sati/mesh', '2027-08-01T06:00:00Z');
    expect(b.getByTestId('ss-rashi-headline').textContent).toBe('Mesha is in Sade Sati — Phase 2 — Peak');
  });

  it('renders 1950–2060 tables, remedies, FAQ and links for every rashi in both languages', () => {
    for (const path of ['/sade-sati/kumbh', '/sade-sati/vrishchik', '/hi/sade-sati/meena', '/hi/sade-sati/karka']) {
      const r = renderAt(path, '2026-10-29T06:00:00Z');
      expect(r.getByTestId('ss-rashi-sadesati').querySelectorAll('table').length).toBeGreaterThanOrEqual(3);
      expect(r.getByTestId('ss-rashi-dhaiya').querySelectorAll('table').length).toBeGreaterThanOrEqual(6);
      expect(r.getByTestId('ss-rashi-remedies')).toBeTruthy();
      expect(r.getByTestId('ss-rashi-faq').querySelectorAll('details').length).toBeGreaterThanOrEqual(5);
      expect(r.getByTestId('ss-rashi-others').querySelectorAll('a').length).toBe(11);
      cleanup(); vi.useRealTimers();
    }
  });

  it('Hindi Kumbha in Aug 2027 shows the retrograde pause', () => {
    const r = renderAt('/hi/sade-sati/kumbha', '2027-08-01T06:00:00Z');
    expect(r.getByTestId('ss-rashi-headline').textContent).toBe('कुंभ राशि की साढ़ेसाती अभी कुछ समय के लिए रुकी है');
  });
});

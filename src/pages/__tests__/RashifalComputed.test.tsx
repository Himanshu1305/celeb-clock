// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import RashifalSign from '../RashifalSign';
import RashifalIndex from '../RashifalIndex';

afterEach(cleanup);

function renderSign(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/rashifal" element={<RashifalIndex />} />
          <Route path="/rashifal/:rashi" element={<RashifalSign />} />
          <Route path="/rashifal/:rashi/:period" element={<RashifalSign />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('Rashifal (computed) pages', () => {
  it('index renders all 12 rashis', () => {
    const { getByTestId } = renderSign('/rashifal');
    expect(getByTestId('rashifal-grid')).toBeTruthy();
    expect(getByTestId('rashifal-grid').querySelectorAll('a').length).toBe(12);
  });

  it('per-sign daily page renders the daily reading: answer, why today, overall + 4 areas + lucky', async () => {
    // Batch 7: /today is a shared daily page (src/lib/daily). jsdom has no /daily/*.json,
    // so the loader falls back to computing the same entry in the browser.
    const { findByTestId } = renderSign('/rashifal/mesh/today');
    const body = await findByTestId('rashifal-daily');
    await waitFor(() => expect(body.querySelector('[data-daily-part="answer"]')).toBeTruthy());
    for (const id of ['why', 'overview', 'love', 'career', 'health', 'lucky', 'faq']) {
      expect(body.querySelector(`[data-daily-part="${id}"]`), id).toBeTruthy();
    }
    expect(document.querySelector('h1')?.textContent).toMatch(/^Mesh Rashifal Today — \d{1,2} [A-Z][a-z]+ 20\d\d$/);
  });

  it('all four periods render without crashing', () => {
    for (const p of ['today', 'week', 'month', 'year']) {
      expect(() => renderSign(`/rashifal/simha/${p}`)).not.toThrow();
      cleanup();
    }
  });

  it('shows no literal "undefined" in computed copy', () => {
    renderSign('/rashifal/vrishchik/month');
    expect(document.body.textContent).not.toContain('undefined');
  });

  it('unknown rashi shows the picker fallback, never crashes', () => {
    expect(() => renderSign('/rashifal/notarashi/today')).not.toThrow();
  });

  it('month/year pages surface at least one real ingress note', async () => {
    // Batch 8: the year view is a period page on the daily mechanism (jsdom → browser compute).
    const { findByTestId } = renderSign('/rashifal/makar/year');
    const body = await findByTestId('rashifal-year');
    await waitFor(() => expect(body.querySelector('[data-daily-part="moves"]')).toBeTruthy());
    expect(body.querySelector('[data-daily-part="moves"]')!.textContent).toMatch(/enters .* on /);
  });

  it('week page shows the current Monday–Sunday range in the H1/date and the same text as the template', async () => {
    const { findByTestId } = renderSign('/rashifal/simha/week');
    const body = await findByTestId('rashifal-week');
    await waitFor(() => expect(body.querySelector('[data-daily-part="answer"]')).toBeTruthy());
    for (const id of ['why', 'love', 'career', 'money', 'health', 'planets', 'lucky', 'faq']) expect(body.querySelector(`[data-daily-part="${id}"]`), id).toBeTruthy();
    expect(document.querySelector('h1')?.textContent).toMatch(/^Simha Weekly Rashifal — \d{1,2} [A-Z][a-z]{2}( 20\d\d)? – \d{1,2} [A-Z][a-z]{2} 20\d\d$/);
    expect(body.textContent).toContain('This week in brief');
  });
});

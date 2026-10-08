// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
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

  it('per-sign daily page renders overview + 4 life-area sections', () => {
    const { getByTestId } = renderSign('/rashifal/mesh/today');
    expect(getByTestId('rashifal-overview')).toBeTruthy();
    expect(getByTestId('rashifal-sections').querySelectorAll('[class*="rounded-xl"]').length).toBeGreaterThanOrEqual(4);
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

  it('month/year pages surface at least one real ingress note', () => {
    const { getByTestId } = renderSign('/rashifal/makar/year');
    expect(getByTestId('rashifal-ingress').textContent).toMatch(/enters .* on /);
  });
});

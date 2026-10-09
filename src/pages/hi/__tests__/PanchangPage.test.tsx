// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HindiPanchangPage from '../PanchangPage';

const renderAt = (path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/hi/panchang" element={<HindiPanchangPage />} />
          <Route path="/hi/panchang/:city" element={<HindiPanchangPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);

describe('P4-LANG Hindi Panchang', () => {
  afterEach(() => cleanup());

  it('TC-HIP-01: renders Hindi panchang with the real computed limbs', () => {
    renderAt('/hi/panchang');
    expect(q('hi-panchang-page')).toBeTruthy();
    expect(q('hi-panchang-limbs')).toBeTruthy();
    const body = document.body.textContent || '';
    expect(body).toContain('तिथि');
    expect(body).toContain('नक्षत्र');
    expect(body).toContain('राहु काल');
  });

  it('TC-HIP-02: machine-assisted translation is flagged for human review', () => {
    renderAt('/hi/panchang');
    const notice = q('auto-translated-notice');
    expect(notice).toBeTruthy();
    expect(notice?.textContent?.toLowerCase()).toContain('machine-assisted');
  });

  it('TC-HIP-03: a city param renders that city in Hindi, no crash', () => {
    expect(() => renderAt('/hi/panchang/delhi')).not.toThrow();
    expect(document.body.textContent).toContain('दिल्ली');
  });
});

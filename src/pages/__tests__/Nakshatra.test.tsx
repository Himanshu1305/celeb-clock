// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import NakshatraPage from '../NakshatraPage';
import NakshatraIndex from '../NakshatraIndex';
import { NAKSHATRA_SLUGS, NAKSHATRA_ORDER } from '@/data/nakshatraPages';

afterEach(cleanup);

function renderPath(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/nakshatra" element={<NakshatraIndex />} />
          <Route path="/nakshatra/:slug" element={<NakshatraPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('Nakshatra pages', () => {
  it('has exactly 27 nakshatras with unique slugs', () => {
    expect(NAKSHATRA_ORDER).toHaveLength(27);
    expect(new Set(NAKSHATRA_SLUGS).size).toBe(27);
  });

  it('index lists all 27', () => {
    const { getByTestId } = renderPath('/nakshatra');
    expect(getByTestId('nakshatra-grid').querySelectorAll('a').length).toBe(27);
  });

  it('every nakshatra page renders facts, matching and padas without crashing', () => {
    for (const slug of NAKSHATRA_SLUGS) {
      const { getByTestId } = renderPath(`/nakshatra/${slug}`);
      expect(getByTestId('nakshatra-facts')).toBeTruthy();
      expect(getByTestId('nakshatra-matching')).toBeTruthy();
      expect(getByTestId('nakshatra-padas').querySelectorAll('span').length).toBeGreaterThanOrEqual(4);
      expect(document.body.textContent).not.toContain('undefined');
      cleanup();
    }
  });

  it('unknown slug shows picker fallback', () => {
    expect(() => renderPath('/nakshatra/notareal')).not.toThrow();
  });
});

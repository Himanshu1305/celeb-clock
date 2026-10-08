// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BlueZonesIndex from '../BlueZonesIndex';
import BlueZonesFactor from '../BlueZonesFactor';
import { POWER_NINE_SLUGS, POWER_NINE } from '@/data/blueZones';

afterEach(cleanup);

function renderPath(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/blue-zones" element={<BlueZonesIndex />} />
          <Route path="/blue-zones/:factor" element={<BlueZonesFactor />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('Blue Zones Power 9', () => {
  it('has exactly 9 factors with unique slugs', () => {
    expect(POWER_NINE).toHaveLength(9);
    expect(new Set(POWER_NINE_SLUGS).size).toBe(9);
  });

  it('index lists all 9', () => {
    const { getByTestId } = renderPath('/blue-zones');
    expect(getByTestId('bz-grid').querySelectorAll('a').length).toBe(9);
  });

  it('every factor page renders mechanism, claim+source and apply steps', () => {
    for (const slug of POWER_NINE_SLUGS) {
      const { getByTestId } = renderPath(`/blue-zones/${slug}`);
      expect(getByTestId('bz-mechanism')).toBeTruthy();
      expect(getByTestId('bz-claim').textContent).toMatch(/Source:/);
      expect(getByTestId('bz-apply').querySelectorAll('li').length).toBeGreaterThanOrEqual(3);
      expect(document.body.textContent).not.toContain('undefined');
      cleanup();
    }
  });

  it('wine-at-5 carries the honest alcohol caveat', () => {
    const { getByTestId } = renderPath('/blue-zones/wine-at-5');
    expect(getByTestId('bz-caveat').textContent).toMatch(/WHO|no completely safe level/i);
  });

  it('unknown factor shows picker fallback', () => {
    expect(() => renderPath('/blue-zones/nope')).not.toThrow();
  });
});

// @vitest-environment jsdom
/**
 * Audit K2: /transit/saturn/2027 must not say "In Meena through 2027". Reference:
 * Swiss Ephemeris (Lahiri) — Saturn enters Mesha 3 Jun 2027 and returns to Meena 20 Oct 2027 (IST).
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import TransitYearPage from '../TransitYearPage';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

/** Pretend the viewer's browser is in the given IANA zone. */
function viewerIn(tz: string) {
  const real = Intl.DateTimeFormat.prototype.resolvedOptions;
  vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockImplementation(function (this: Intl.DateTimeFormat) {
    return { ...real.call(this), timeZone: tz };
  });
}

function renderSaturn2027() {
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/transit/saturn/2027']}>
        <Routes><Route path="/transit/:planet/:year" element={<TransitYearPage />} /></Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('TransitYearPage (audit K2)', () => {
  it('Saturn 2027 shows Meena → Mesha → Meena with both sign-change dates', () => {
    viewerIn('Asia/Kolkata'); // reference dates are IST
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/transit/saturn/2027']}>
          <Routes><Route path="/transit/:planet/:year" element={<TransitYearPage />} /></Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );
    const page = document.body.textContent || '';
    expect(page).not.toContain('In Meena through 2027');
    expect(page).toContain('Meena → Mesha → Meena');
    const ing = screen.getByTestId('transit-ingress').textContent || '';
    expect(ing).toContain('3 June 2027');
    expect(ing).toContain('20 October 2027');
    expect(screen.getAllByTestId('transit-phases').length).toBe(12);
  });

  it('a viewer outside India sees the same instants in their own zone, labelled', () => {
    viewerIn('America/Los_Angeles');
    renderSaturn2027();
    const ing = screen.getByTestId('transit-ingress').textContent || '';
    // Swiss Ephemeris (Lahiri): Saturn enters Mesha 3 Jun 2027 IST (early morning) = 2 Jun in Los Angeles.
    expect(ing).toContain('2 June 2027');
    expect(screen.getByTestId('transit-tz').textContent).toContain('America/Los Angeles');
  });

  it('India viewers get Indian Standard Time', () => {
    viewerIn('Asia/Calcutta');
    renderSaturn2027();
    expect(screen.getByTestId('transit-tz').textContent).toContain('Indian Standard Time (IST)');
  });
});

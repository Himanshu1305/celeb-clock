// @vitest-environment jsdom
/**
 * Audit K2: /transit/saturn/2027 must not say "In Meena through 2027". Reference:
 * Swiss Ephemeris (Lahiri) — Saturn enters Mesha 3 Jun 2027 and returns to Meena 20 Oct 2027 (IST).
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import TransitYearPage from '../TransitYearPage';

afterEach(cleanup);

describe('TransitYearPage (audit K2)', () => {
  it('Saturn 2027 shows Meena → Mesha → Meena with both sign-change dates', () => {
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
});

// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';

// Full saved profile so the dashboard fetches a chart and renders the reading.
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { email: 'a@b.com' }, profile: { first_name: 'Asha' } }) }));
vi.mock('@/hooks/useSavedProfile', () => ({
  useSavedProfile: () => ({
    profile: { dob: '1978-05-13', time: '19:30', city: { name: 'Jammu', lat: 32.73, lon: 74.86, tz: 5.5 } },
    loaded: true, isFull: true,
  }),
}));
// Real /api/kundali returns planet signIndex 1-based: Moon in Karka (Cancer) = 4.
vi.mock('@/services/kundaliService', () => ({
  fetchKundali: vi.fn().mockResolvedValue({
    lagna: { sign: 'Vrischika', signIndex: 8, degrees: 211 },
    planets: [{ name: 'Moon', sign: 'Karka', signIndex: 4, house: 9, longitude: 100, retrograde: false }],
    rashi: 'Karka', rashi_devanagari: null, nakshatra: null, dasha: null, requires_birth_time: true,
  }),
}));

import DashboardPage from '../DashboardPage';

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/dashboard']}>
        <DashboardPage />
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('DashboardPage — correct Moon sign (P3-DASH-SIGNINDEX regression)', () => {
  afterEach(() => cleanup());

  it('converts the 1-based Moon signIndex and shows Karka, not the next sign', async () => {
    renderPage();
    // Moon signIndex 4 (1-based) → 3 (0-based) → Karka. The off-by-one bug showed Simha.
    await waitFor(() => expect(screen.getByText(/Today for Karka/i)).toBeTruthy(), { timeout: 5000 });
    expect(screen.queryByText(/Today for Simha/i)).toBeNull();
  });
});

// @vitest-environment jsdom
/**
 * Paid Birthday Report — rendered text checks (audit S1, S2, S3, S5, N1, N2).
 * Reference values: Swiss Ephemeris (Lahiri) for P9 — Moon Cancer / Pushya pada 2,
 * Ascendant Scorpio (lord Mars → Red Coral); see src/lib/__tests__/reportVedic.test.ts.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

const rowRef: { current: any } = { current: null };
vi.mock('@/services/BirthdayReportService', async (orig) => {
  const actual: any = await orig();
  return { ...actual, getReport: vi.fn(async () => rowRef.current) };
});
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc: vi.fn(() => Promise.resolve({})), from: vi.fn(), auth: { getSession: vi.fn(async () => ({ data: { session: null } })) } } }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, isAdmin: false, profile: null }) }));
vi.mock('@/hooks/useAnalytics', () => ({ useAnalytics: () => ({ trackFunnel: vi.fn(), track: vi.fn() }) }));
vi.mock('@/services/BirthdaySearchService', () => ({ getRankedBirthdayCelebrities: vi.fn().mockResolvedValue([]) }));
vi.mock('@/services/CountryDetectionService', () => ({ detectCountry: vi.fn().mockResolvedValue({ country: 'IN', currency: 'INR' }) }));
const otd = vi.fn();
vi.mock('@/services/wikimediaOnThisDay', async (orig) => {
  const actual: any = await orig();
  return { ...actual, fetchOnThisDay: (...a: any[]) => otd(...a) };
});
vi.mock('react-to-print', () => ({ useReactToPrint: () => vi.fn() }));

import ReportView from '../ReportView';

async function baseData(extra: Record<string, unknown> = {}) {
  const actual: any = await vi.importActual('@/services/BirthdayReportService');
  const dob = (extra.recipientDob as string) || '1978-05-13';
  const real = await actual.generateReportData('test', dob, '', '', 'IN');
  return {
    ...real,
    // what OLD reports stored — must be ignored by the view
    vedicRashi: { name: 'Mesha', english: 'Aries', symbol: '♈︎', ruling_planet: 'Mars', traits: [] },
    zodiacComparison: { note: 'old sun-based note' },
    age: 1, daysSinceBirth: 1, daysUntilNextBirthday: 1,
    ...extra,
  };
}

function renderReport() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/report/abc']}>
        <Routes><Route path="/report/:slug" element={<ReportView />} /></Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

afterEach(() => { cleanup(); otd.mockReset(); });

describe('ReportView — S1/S2 with birth time + place (engine data on the report)', () => {
  it('shows Cancer / Pushya and the chart-based Ratna; never the Sun-based Mesha or the month stone', async () => {
    otd.mockResolvedValue({ events: [], births: [], deaths: [], failed: false });
    rowRef.current = { id: '1', slug: 'abc', is_paid: true, report_data: await baseData({
      vedic: { basis: 'birth-chart', birthTime: '19:30', place: { name: 'Jammu', lat: 32.7266, lon: 74.857 }, timezone: 'Asia/Kolkata',
        moonSignIndex: 3, nakshatra: 'Pushya', nakshatraNumber: 8, pada: 2, lagnaSignIndex: 7,
        gem: { planet: 'Mars', gem: 'Red Coral', hindi: 'Moonga', role: 'Ascendant lord', reason: 'Mars rules your Ascendant (Scorpio).' }, gemDisclaimer: 'Consult a qualified astrologer.' },
    }) };
    renderReport();
    await screen.findByTestId('report-moon-sign');
    const t = document.body.textContent || '';
    expect(t).toContain('Cancer Moon');
    expect(t).toContain('Karka');
    expect(screen.getByTestId('report-nakshatra').textContent).toContain('Pushya');
    expect(t).not.toContain('birth time is not collected');
    expect(t).not.toContain('Mesha');
    expect(t).not.toContain('old sun-based note');
    expect(screen.getByTestId('report-vedic-ratna').textContent).toContain('Red Coral');
    expect(t).not.toContain('Vedic Ratna — Emerald');
    // Rashi Ratna box now renders (Cancer → Pearl)
    expect(t).toContain('Rashi Ratna');
    expect(t).toContain('Pearl (Moti)');
  });
});

describe('ReportView — date only (honest fallback)', () => {
  it('13 May 1978 without time: no Moon sign or Nakshatra guess; asks for time; no month-based Ratna', async () => {
    otd.mockResolvedValue({ events: [], births: [], deaths: [], failed: false });
    rowRef.current = { id: '1', slug: 'abc', is_paid: true, report_data: await baseData() };
    renderReport();
    await screen.findByTestId('report-moon-basis');
    const t = document.body.textContent || '';
    expect(screen.getByTestId('report-moon-basis').textContent).toMatch(/do not guess/);
    expect(screen.queryByTestId('report-moon-sign')).toBeNull();
    expect(screen.queryByTestId('report-nakshatra')).toBeNull();
    expect(t).not.toContain('Libra Moon');
    expect(t).not.toContain('Mesha');
    expect(t).toContain('Your Vedic Rashi needs a birth time');
    expect(screen.getByTestId('report-vedic-ratna-note')).toBeTruthy();
  });
});

describe('ReportView — S5/N1/N2 live numbers and S3 events', () => {
  it('Life Path, Personal Year and age are recomputed at view time; empty events filled from Wikipedia with attribution', async () => {
    otd.mockResolvedValue({ events: [{ year: 1987, text: 'A test event happened.', pageTitle: null, pageUrl: null, extract: null, thumbnail: null }], births: [], deaths: [], failed: false });
    // 15 Aug 1990: stored values are the OLD ones (Life Path 33, Personal Year 11, age 1)
    rowRef.current = { id: '1', slug: 'abc', is_paid: true, report_data: await baseData({ recipientDob: '1990-08-15', lifePathNumber: 33, personalYear2026: 11, personalYearMeaning: { title: 'Year of Illumination' }, historicalEvents: [] }) };
    renderReport();
    await waitFor(() => expect(document.body.textContent).toContain('A test event happened.'));
    const t = document.body.textContent || '';
    const now = new Date();
    const year = now.getFullYear();
    expect(t).toContain(`in ${year}`);
    expect(t).not.toContain('Personal Year 11');
    expect(t).not.toContain('Year of Illumination');
    expect(t).toContain('Wikipedia');
    const age = year - 1990 - ((now.getMonth() < 7 || (now.getMonth() === 7 && now.getDate() < 15)) ? 1 : 0);
    expect(t).toContain(String(age));
  });
});

// @vitest-environment jsdom
// f5-city-picker — EVERY birth-details form sends the PICKED place: its lat/lon and IANA
// zone (tzid), plus the offset for the birth date (tz). Pontiac, Michigan (Wikipedia:
// 42.64611, −83.2925) on 3 Dec 1999 → America/Detroit, EST UTC−5 (IANA tzdb). Each form
// is driven through the real shared CityPicker (bundled offline suggestions) and the
// outgoing /api request is captured.
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import KundaliPage from '../KundaliPage';
import SadeSatiPage from '../SadeSatiPage';
import ManglikPage from '../ManglikPage';
import DoshaCheckPage from '../DoshaCheckPage';
import ChildKundliPage from '../ChildKundliPage';
import KaalSarpDoshaPage from '../KaalSarpDoshaPage';
import GemstonePage from '../GemstonePage';
import LifeReportPage from '../LifeReportPage';
import CareerReportPage from '../CareerReportPage';
import DashaCalculatorPage from '../DashaCalculatorPage';
import KundaliMatchPage from '../KundaliMatchPage';
import BabyNamesPage from '../BabyNamesPage';
import { BirthTimeVedicSection } from '@/components/BirthTimeVedicSection';
import { birthFromProfile } from '@/services/chatService';

let apiCalls: URL[] = [];
beforeEach(() => {
  apiCalls = [];
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const u = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, 'https://bornclock.com');
    if (u.pathname.startsWith('/api/') && u.pathname !== '/api/geocode') apiCalls.push(u);
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  }));
  try { localStorage.clear(); } catch { /* noop */ }
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const q = (id: string) => document.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
const mount = (el: ReactElement, path = '/') =>
  render(<HelmetProvider><MemoryRouter initialEntries={[path]}>{el}</MemoryRouter></HelmetProvider>);

async function pickPontiacMI(cityTestId: string) {
  fireEvent.change(q(cityTestId)!, { target: { value: 'Pontiac' } });
  await waitFor(() => expect(q(`${cityTestId}-options`)).toBeTruthy(), { timeout: 2000 });
  const opt = screen.getAllByTestId(`${cityTestId}-option`).find(b => b.textContent === 'Pontiac, Michigan, USA')!;
  fireEvent.click(opt);
  expect(q(`${cityTestId}-confirm`)!.textContent).toContain('time zone America/Detroit (UTC−5 on that date, standard time)');
}

function expectPontiac(u: URL, suffix = '') {
  const g = (k: string) => u.searchParams.get(k + suffix);
  expect(g('lat')).toBe('42.64611');
  expect(g('lon')).toBe('-83.2925');
  expect(g('tzid')).toBe('America/Detroit');
  expect(g('tz')).toBe('-5');
}

const FORMS: Array<[string, () => ReactElement, string]> = [
  ['Kundali', () => <KundaliPage />, 'kundali'],
  ['Sade Sati', () => <SadeSatiPage />, 'sadesati'],
  ['Manglik', () => <ManglikPage />, 'manglik'],
  ['Pitra dosha', () => <DoshaCheckPage kind="pitra" />, 'dosha-pitra'],
  ['Nadi dosha', () => <DoshaCheckPage kind="nadi" />, 'dosha-nadi'],
  ['Child kundli', () => <ChildKundliPage />, 'child-kundli'],
  ['Kaal Sarp', () => <KaalSarpDoshaPage />, 'kaalsarp'],
  ['Gemstone', () => <GemstonePage />, 'gemstone'],
  ['Life report', () => <LifeReportPage />, 'life-report'],
  ['Career report', () => <CareerReportPage />, 'career'],
  ['Dasha', () => <DashaCalculatorPage />, 'dasha'],
];

describe('BirthDetailsForm pages send the picked lat/lon/IANA zone', () => {
  it.each(FORMS)('%s', async (_n, el, p) => {
    mount(el());
    fireEvent.change(q(`${p}-dob`)!, { target: { value: '1999-12-03' } });
    fireEvent.change(q(`${p}-time`)!, { target: { value: '11:03' } });
    fireEvent.change(q(`${p}-city`)!, { target: { value: 'Pontiac, Michigan' } });
    expect((q(`${p}-generate-btn`) as HTMLButtonElement).disabled).toBe(true); // free text alone: blocked
    await pickPontiacMI(`${p}-city`);
    fireEvent.click(q(`${p}-generate-btn`)!);
    await waitFor(() => expect(apiCalls.length).toBeGreaterThan(0), { timeout: 3000 });
    apiCalls.forEach(u => expectPontiac(u));
  });
});

describe('other birthplace forms', () => {
  it('Kundali Matching — both people (A and B suffixes)', async () => {
    mount(<KundaliMatchPage />, '/kundali-match');
    for (const k of ['a', 'b'] as const) {
      fireEvent.change(q(`kmatch-dob-${k}`)!, { target: { value: '1999-12-03' } });
      fireEvent.change(q(`kmatch-time-${k}`)!, { target: { value: '11:03' } });
    }
    await pickPontiacMI('kmatch-city-a');
    expect((q('kmatch-calculate-btn') as HTMLButtonElement).disabled).toBe(true); // B not picked yet
    await pickPontiacMI('kmatch-city-b');
    fireEvent.click(q('kmatch-calculate-btn')!);
    await waitFor(() => expect(apiCalls.length).toBeGreaterThan(0), { timeout: 3000 });
    expectPontiac(apiCalls[0], 'A');
    expectPontiac(apiCalls[0], 'B');
  });

  it('Baby names (child birth details)', async () => {
    mount(<BabyNamesPage />, '/baby-names');
    fireEvent.change(q('baby-dob-input')!, { target: { value: '1999-12-03' } });
    fireEvent.change(q('baby-time-input')!, { target: { value: '11:03' } });
    await pickPontiacMI('baby-city-input');
    fireEvent.click(q('baby-compute-btn')!);
    await waitFor(() => expect(apiCalls.length).toBeGreaterThan(0), { timeout: 3000 });
    expectPontiac(apiCalls[0]);
  });

  it('Birthday / paid report — optional Vedic section', async () => {
    const onDetails = vi.fn();
    mount(<BirthTimeVedicSection dob="1999-12-03" onDetailsChange={onDetails} />);
    fireEvent.change(q('birth-time-input')!, { target: { value: '11:03' } });
    await pickPontiacMI('birth-city-input');
    expect(onDetails).toHaveBeenLastCalledWith({ time: '11:03', city: expect.objectContaining({ lat: 42.64611, lon: -83.2925, timezone: 'America/Detroit' }) });
    fireEvent.click(screen.getByRole('button', { name: /Reveal my Vedic profile/i }));
    await waitFor(() => expect(apiCalls.length).toBeGreaterThan(0), { timeout: 3000 });
    expectPontiac(apiCalls[0]);
  });

  it('AI chat / reading profile payload', () => {
    const b = birthFromProfile({ dob: '1999-12-03', time: '11:03', city: { name: 'Pontiac, Michigan, USA', lat: 42.64611, lon: -83.2925, tz: -5, timezone: 'America/Detroit' } } as never);
    expect(b).toMatchObject({ lat: 42.64611, lon: -83.2925, tz: -5, tzid: 'America/Detroit' });
  });
});

// @vitest-environment jsdom
// Batch 8: the static "<City> — local guide" section on the Panchang / Rahu Kaal /
// Choghadiya city pages and the Hindi city pages, and the any-place search + date
// controls on the Hindi Panchang (/hi/panchang, /hi/panchang/:city).
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import PanchangPage from '../PanchangPage';
import RahuKaalPage from '../RahuKaalPage';
import ChoghadiyaPage from '../ChoghadiyaPage';
import HindiPanchangPage from '../hi/PanchangPage';
import { computeDayPanchang, panchangCityBySlug } from '@/lib/vedic/panchangDay';
import { formatLongDateHi } from '@/lib/daily/dates';
import local from '@/data/panchangCityLocal.json';

afterEach(cleanup);

let lastLocation = '';
function LocationSpy() {
  const l = useLocation();
  lastLocation = l.pathname + l.search;
  return null;
}

function renderPath(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <LocationSpy />
        <Routes>
          <Route path="/panchang" element={<PanchangPage />} />
          <Route path="/panchang/:city" element={<PanchangPage />} />
          <Route path="/rahu-kaal/:city" element={<RahuKaalPage />} />
          <Route path="/choghadiya/:city" element={<ChoghadiyaPage />} />
          <Route path="/hi/panchang" element={<HindiPanchangPage />} />
          <Route path="/hi/panchang/:city" element={<HindiPanchangPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}
const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);
const CITIES = (local as { cities: Record<string, { temples?: { name: string; source: string }[]; festivals?: { name: string }[] }> }).cities;

describe('local guide on the English city pages', () => {
  it('Thane shows its own temples and festivals with source links, on all three page kinds', () => {
    for (const path of ['/panchang/thane', '/rahu-kaal/thane', '/choghadiya/thane']) {
      renderPath(path);
      const g = q('city-local-guide')!;
      expect(g, path).toBeTruthy();
      expect(g.querySelector('h2')!.textContent).toBe('Thane — local guide');
      expect(g.textContent).toContain('Kopineshwar Mandir');
      expect(g.textContent).toContain('Upvan Lake');
      expect(g.textContent).not.toContain('Siddhivinayak Temple'); // Mumbai's, not Thane's
      const links = [...g.querySelectorAll('a')];
      expect(links.length).toBe(CITIES.thane.temples!.length + CITIES.thane.festivals!.length);
      for (const a of links) {
        expect(a.getAttribute('href')).toMatch(/^https:\/\//);
        expect(a.getAttribute('rel')).toContain('noopener');
      }
      cleanup();
    }
  });

  it('renders on the static (today) shell too, outside the daily-injected body', () => {
    renderPath('/panchang/howrah');
    const g = q('city-local-guide')!;
    expect(g.closest('[data-daily]')).toBeNull();
    expect(g.textContent).toContain('Belur Math');
  });

  it('a city with only festivals shows no temple heading; index and searched places show nothing', () => {
    renderPath('/panchang/surat');
    expect(q('city-local-guide')!.textContent).toContain('Chand Padvo');
    expect(q('city-local-temples')).toBeNull();
    cleanup();
    renderPath('/panchang');
    expect(q('city-local-guide')).toBeNull();
    cleanup();
    renderPath('/panchang?place=Sagar&lat=23.8388&lon=78.7378&date=2026-11-01');
    expect(q('city-local-guide')).toBeNull();
  });
});

describe('Hindi Panchang — local guide and any-place controls', () => {
  it('a Hindi city page has the Hindi local guide', () => {
    renderPath('/hi/panchang/mumbai');
    const g = q('city-local-guide')!;
    expect(g.querySelector('h2')!.textContent).toBe('मुंबई — स्थानीय मार्गदर्शिका');
    expect(g.textContent).toContain('सिद्धिविनायक मंदिर');
    expect(g.textContent).toContain('स्रोत');
    expect(g.textContent).not.toContain('Ganesha temple in Prabhadevi');
  });

  it('shows the city, place search and date controls with Hindi labels', () => {
    renderPath('/hi/panchang/pune');
    const c = q('panchang-controls')!;
    expect(c).toBeTruthy();
    expect(c.textContent).toContain('शहर');
    expect(c.textContent).toContain('या कोई भी जगह खोजें');
    expect(c.textContent).toContain('पिछला दिन');
    expect(c.textContent).toContain('अगला दिन');
    const sel = q('panchang-city-select') as HTMLSelectElement;
    expect(sel.options.length).toBe(10);
    expect(sel.value).toBe('pune');
    expect([...sel.options].map(o => o.textContent)).toContain('पुणे');
    expect(q('panchang-place-search')).toBeTruthy();
    expect(document.body.textContent).not.toContain('Previous day');
  });

  it('another date at a Hindi city is computed in the browser, in Hindi; canonical stays the city URL', async () => {
    renderPath('/hi/panchang/lucknow?date=2026-11-01');
    const body = q('hi-panchang-daily')!;
    expect(body.getAttribute('data-daily-date')).toBe('2026-11-01');
    expect(q('hi-panchang-date')!.textContent).toContain(formatLongDateHi('2026-11-01'));
    const k = panchangCityBySlug('lucknow')!;
    const p = computeDayPanchang(new Date('2026-11-01T12:00:00Z'), k.lat, k.lon, 5.5, 'Lucknow');
    expect(body.textContent).toContain(`${p.rahuKaal.start}–${p.rahuKaal.end}`);
    expect(body.textContent).toContain('तिथि');
    expect((q('panchang-date-input') as HTMLInputElement).value).toBe('2026-11-01');
    await waitFor(() => expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toMatch(/\/hi\/panchang\/lucknow\/?$/));
    expect(document.body.textContent).not.toContain('undefined');
  });

  it('any searched place works (Sagar), with canonical /hi/panchang', async () => {
    renderPath('/hi/panchang?place=Sagar&lat=23.8388&lon=78.7378&date=2026-11-01');
    const body = q('hi-panchang-daily')!;
    expect(body.textContent).toContain('Sagar');
    const p = computeDayPanchang(new Date('2026-11-01T12:00:00Z'), 23.8388, 78.7378, 5.5, 'Sagar');
    expect(body.textContent).toContain(`सूर्योदय ${p.sunrise}`);
    expect(q('panchang-showing')!.textContent).toContain('Sagar');
    expect(q('city-local-guide')).toBeNull();
    await waitFor(() => expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toMatch(/\/hi\/panchang\/?$/));
  });

  it('next-day and city select stay on Hindi URLs', () => {
    renderPath('/hi/panchang/jaipur?date=2026-11-01');
    fireEvent.click(q('panchang-next-day')!);
    expect(lastLocation).toBe('/hi/panchang/jaipur?date=2026-11-02');
    fireEvent.change(q('panchang-city-select')!, { target: { value: 'chennai' } });
    expect(lastLocation).toBe('/hi/panchang/chennai?date=2026-11-02');
  });
});

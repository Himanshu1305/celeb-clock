// @vitest-environment jsdom
// Batch 7 (W7): Panchang / Rahu Kaal / Choghadiya pages for any city and date.
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import PanchangPage from '../PanchangPage';
import RahuKaalPage from '../RahuKaalPage';
import ChoghadiyaPage from '../ChoghadiyaPage';
import { computeDayPanchang, panchangCityBySlug } from '@/lib/vedic/panchangDay';
import { istDateISO } from '@/lib/daily/dates';

afterEach(cleanup);

function renderPath(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/panchang" element={<PanchangPage />} />
          <Route path="/panchang/:city" element={<PanchangPage />} />
          <Route path="/rahu-kaal" element={<RahuKaalPage />} />
          <Route path="/rahu-kaal/:city" element={<RahuKaalPage />} />
          <Route path="/choghadiya" element={<ChoghadiyaPage />} />
          <Route path="/choghadiya/:city" element={<ChoghadiyaPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}
const clean = () => {
  expect(document.body.textContent).not.toContain('undefined');
  expect(document.body.textContent).not.toContain('NaN');
};

describe('Panchang page — any city, any date', () => {
  it('a built-in city on a chosen date shows the five limbs, muhurtas and both Choghadiya sets', () => {
    const { getByTestId, container } = renderPath('/panchang/kanpur?date=2026-11-01');
    expect(container.querySelector('h1')!.textContent).toBe("Today's Panchang — Kanpur");
    expect(getByTestId('panchang-date').textContent).toContain('Sunday, 1 November 2026');
    const body = getByTestId('panchang-daily');
    expect(body.getAttribute('data-daily-date')).toBe('2026-11-01');
    for (const part of ['limbs', 'sun', 'good-times', 'avoid', 'choghadiya-day', 'choghadiya-night']) {
      expect(body.querySelector(`[data-daily-part="${part}"]`), part).toBeTruthy();
    }
    const t = body.textContent!;
    // (date chosen ≠ today, so the browser builds the entry with the same builder)
    for (const w of ['Brahma Muhurta', 'Amrit Kalam', 'Varjyam', 'Dur Muhurtam', 'Rahu Kaal', 'Abhijit']) expect(t).toContain(w);
    const k = panchangCityBySlug('kanpur')!;
    const p = computeDayPanchang(new Date('2026-11-01T12:00:00Z'), k.lat, k.lon, 5.5, 'Kanpur');
    expect(t).toContain(`${p.rahuKaal.start}–${p.rahuKaal.end}`);
    expect(t).toContain(`${p.sunrise}`);
    expect(t).toContain(p.nakshatra);
    expect((getByTestId('panchang-date-input') as HTMLInputElement).value).toBe('2026-11-01');
    expect(getByTestId('panchang-terms').textContent).toContain('Varjyam');
    clean();
  });

  it('today on a built-in city uses the shared daily entry for the India date', async () => {
    const { getByTestId } = renderPath('/panchang/delhi');
    await waitFor(() => expect(getByTestId('panchang-daily').getAttribute('data-daily-date')).toBe(istDateISO(new Date())), { timeout: 15000 });
    clean();
  }, 20000);

  it('previous / next day move the date', () => {
    const { getByTestId } = renderPath('/panchang/pune?date=2026-11-01');
    fireEvent.click(getByTestId('panchang-next-day'));
    expect(getByTestId('panchang-date').textContent).toContain('Monday, 2 November 2026');
    fireEvent.click(getByTestId('panchang-prev-day'));
    fireEvent.click(getByTestId('panchang-prev-day'));
    expect(getByTestId('panchang-date').textContent).toContain('Saturday, 31 October 2026');
  });

  it('the city selector lists all 50 cities and switches city', () => {
    const { getByTestId, container } = renderPath('/panchang/mumbai?date=2026-11-01');
    const sel = getByTestId('panchang-city-select') as HTMLSelectElement;
    expect(sel.options.length).toBe(50);
    fireEvent.change(sel, { target: { value: 'guwahati' } });
    expect(container.querySelector('h1')!.textContent).toBe("Today's Panchang — Guwahati");
  });

  it('any searched place works, with its own time zone for that date', () => {
    const { getByTestId } = renderPath('/panchang?place=London%2C%20UK&lat=51.5074&lon=-0.1278&date=2026-07-01');
    expect(getByTestId('panchang-showing').textContent).toContain('Europe/London (UTC+1)');
    expect(getByTestId('panchang-daily').textContent).toContain('London, UK');
    clean();
  });

  it('a Wednesday says Abhijit is not used', () => {
    const { getByTestId } = renderPath('/panchang/delhi?date=2026-10-28');
    expect(getByTestId('panchang-daily').textContent).toContain('not used on Wednesday');
  });

  it('the index page has its own H1 (not a duplicate of the Delhi page)', () => {
    const { container } = renderPath('/panchang?date=2026-11-01');
    expect(container.querySelector('h1')!.textContent).toBe("Today's Panchang");
  });
});

describe('Rahu Kaal and Choghadiya city pages', () => {
  it('Rahu Kaal page: answer first, week ahead and the weekday rule', () => {
    const { getByTestId, container } = renderPath('/rahu-kaal/chennai?date=2026-11-01');
    expect(container.querySelector('h1')!.textContent).toBe('Rahu Kaal Today — Chennai');
    const body = getByTestId('rahu-kaal-daily');
    const first = body.querySelector('[data-daily-part="answer"]')!;
    expect(first.textContent).toMatch(/^Today in brief\s*Rahu Kaal in Chennai on Sunday, 1 November 2026 is \d\d:\d\d–\d\d:\d\d/);
    expect(body.querySelector('[data-daily-part="week"]')!.querySelectorAll('li').length).toBe(7);
    expect(getByTestId('rahu-kaal-rule').querySelectorAll('tbody tr').length).toBe(7);
    clean();
  });

  it('Choghadiya page: good slots, 8 day + 8 night slots', () => {
    const { getByTestId, container } = renderPath('/choghadiya/jaipur?date=2026-11-01');
    expect(container.querySelector('h1')!.textContent).toBe('Choghadiya Today — Jaipur');
    const body = getByTestId('choghadiya-daily');
    expect(body.querySelector('[data-daily-part="choghadiya-day"]')!.querySelectorAll('li').length).toBe(8);
    expect(body.querySelector('[data-daily-part="choghadiya-night"]')!.querySelectorAll('li').length).toBe(8);
    expect(body.textContent).toContain('starts with Udveg'); // Sunday
    expect(getByTestId('choghadiya-guide').querySelectorAll('li').length).toBe(7);
    clean();
  });

  it('pages link to each other for the same city and to nearby cities', () => {
    const { getByTestId } = renderPath('/rahu-kaal/thane?date=2026-11-01');
    const links = [...getByTestId('panchang-city-links').querySelectorAll('a')].map(a => a.getAttribute('href'));
    expect(links).toContain('/panchang/thane?date=2026-11-01');
    expect(links).toContain('/choghadiya/thane?date=2026-11-01');
    expect(links).toContain('/rahu-kaal/mumbai');
  });
});

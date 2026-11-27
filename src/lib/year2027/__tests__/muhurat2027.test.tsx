// @vitest-environment jsdom
/**
 * B20 — Holi / Diwali 2027 muhurats vs Drik Panchang and AstroSage (golden/holiDiwali2027Ref.json)
 * F1 reference times · F2 Holika rule · F3 Lakshmi Puja windows · F4 lagna vs ascendant engine
 * F5 five days · F6 city tables · F7 .ics · F8 rendered pages · F9 FAQ schema = visible FAQ.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import REF from './golden/holiDiwali2027Ref.json';
import { holika2027, diwali2027, hm, icsEvent, CITIES, lagnaWindow, DELHI, citySun, serialiseMuhurat2027 } from '../muhurat2027';
import DATA from '../muhurat2027.data.json';
import { calculateLagna } from '../../vedic/engine/vedicEngine';
import { festivals2027 } from '../festivalData';
import FestivalDatePage from '@/pages/year2027/FestivalDatePage';
import { muhuratFaq } from '@/pages/year2027/HoliDiwaliMuhurat';

afterEach(() => cleanup());
const toMin = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const diff = (ours: number, ref: string) => { let d = Math.abs(toMin(hm(ours)) - toMin(ref)); if (d > 720) d = 1440 - d; return d; };
const within = (w: [number, number] | null, ref: string[], tol: number) => { expect(w).not.toBeNull(); expect(diff(w![0], ref[0])).toBeLessThanOrEqual(tol); expect(diff(w![1], ref[1])).toBeLessThanOrEqual(tol); };

describe('Holi / Diwali 2027 muhurats', () => {
  it('F1 — Holika Dahan, Bhadra and every city vs Drik Panchang (≤ 2 min)', () => {
    const h = holika2027(), r = REF.holika;
    expect([h.dahanDate, h.holiDate]).toEqual([r.date, r.holi]);
    within(h.cities[0].muhurat, r.muhurat, 2); within(h.cities[0].alternative, r.alternative, 2);
    within(h.punchha, r.bhadraPunchha, 2); within(h.mukha, r.bhadraMukha, 2); within(h.purnima, r.purnima, 2);
    for (const [id, [m, alt]] of Object.entries(REF.holikaCities.rows)) {
      const c = h.cities.find(x => x.city.id === id)!;
      within(c.muhurat, m, 2); within(c.alternative, alt, 2);
    }
  });

  it('F1 — Dhanteras vs Drik (≤ 1 min) and Lakshmi Puja vs AstroSage (≤ 3 min, documented convention)', () => {
    const w = diwali2027(), dh = w.dhanteras, r = REF.dhanteras, l = REF.lakshmi;
    expect(dh.dateISO).toBe(r.date);
    within(dh.muhurat, r.muhurat, 1); within(dh.pradosh, r.pradosh, 1); within(dh.vrishabha, r.vrishabha, 1); within(dh.trayodashi, r.trayodashi, 1);
    const d = w.cities[0];
    expect(w.days[2].dateISO).toBe(l.date);
    within(d.pradosh, l.pradosh, 2); within(d.lakshmi, l.muhurat, 3); within(d.vrishabha, l.vrishabha, 3);
    within(d.nishita, l.mahanishita, 2); within(d.simha, l.simha, 3);
    expect(d.mahanishita).toBeNull();
  });

  it('F2 — Holika muhurat lies inside Purnima and Pradosh, never in Bhadra Mukha; Mukha follows Punchha inside Bhadra', () => {
    const h = holika2027();
    expect(h.punchha[1]).toBe(h.mukha[0]);
    expect(h.bhadra[0] < h.punchha[0] && h.mukha[1] < h.bhadra[1]).toBe(true);
    for (const c of h.cities) {
      const m = c.muhurat!;
      expect(m[0] >= h.purnima[0] && m[1] <= h.purnima[1]).toBe(true);
      expect(m[0] >= c.pradosh[0] && m[1] <= c.pradosh[1]).toBe(true);
      expect(m[1] <= h.mukha[0] || m[0] >= h.mukha[1]).toBe(true);
      if (c.alternative) expect(c.alternative[0]).toBeGreaterThanOrEqual(h.bhadra[1]);
    }
  });

  it('F3 — Lakshmi Puja ⊆ Pradosh ∩ Vrishabha ∩ Amavasya; Mahanishita ⊆ Nishita ∩ Simha ∩ Amavasya', () => {
    const w = diwali2027();
    for (const c of w.cities) {
      if (c.lakshmi) {
        for (const win of [c.pradosh, c.vrishabha!, w.amavasya]) expect(c.lakshmi[0] >= win[0] && c.lakshmi[1] <= win[1]).toBe(true);
      } else {
        // no overlap: Vrishabha rises after Amavasya ends, or outside Pradosh
        expect(!c.vrishabha || c.vrishabha[0] >= w.amavasya[1] || c.vrishabha[0] >= c.pradosh[1]).toBe(true);
      }
      expect(c.mahanishita).toBeNull(); // Amavasya ends at 19:06 in 2027
    }
  });

  it('F4 — the lagna windows agree with the ascendant engine at their edges (±1 min)', () => {
    for (const c of [DELHI, CITIES[1], CITIES[3]]) {
      const set = citySun('2027-10-29', c).set;
      const v = lagnaWindow(1, set - 90 * 60_000, set + 5 * 3600_000, c)!;
      const sign = (t: number) => Math.floor(calculateLagna(new Date(t), c.lat, c.lon).ascSidereal / 30);
      expect([sign(v[0] - 60_000), sign(v[0] + 60_000), sign(v[1] - 60_000), sign(v[1] + 60_000)]).toEqual([0, 1, 1, 2]);
    }
  });

  it('F5 — five days in order, matching the festival engine and AstroSage', () => {
    const w = diwali2027();
    const dates = w.days.map(d => d.dateISO);
    expect([...dates].sort()).toEqual(dates);
    expect(Object.fromEntries(w.days.map(d => [d.slug, d.dateISO]))).toEqual(REF.lakshmi.fiveDays);
    for (const d of w.days.filter(x => x.slug !== 'narak-chaturdashi')) expect(festivals2027('en').find(f => f.slug === d.slug)!.dateISO).toBe(d.dateISO);
  });

  it('F6 — city tables: 10 rows, distinct sunsets, Mumbai later than Kolkata', () => {
    const h = holika2027(), w = diwali2027();
    expect(h.cities).toHaveLength(10); expect(w.cities).toHaveLength(10); expect(w.dhanteras.cities).toHaveLength(10);
    expect(new Set(w.cities.map(c => Math.round(c.pradosh[0] / 1000))).size).toBe(10);
    const by = (id: string) => w.cities.find(c => c.city.id === id)!;
    expect(by('mumbai').pradosh[0]).toBeGreaterThan(by('kolkata').pradosh[0]);
  });

  it('the precomputed data file equals the live calculation (regenerate with scripts/gen-muhurat2027.mts)', () => {
    expect(JSON.parse(JSON.stringify(serialiseMuhurat2027()))).toEqual(DATA);
  });

  it('F7 — .ics: one VEVENT with UTC times equal to the IST muhurat', () => {
    const m = holika2027().cities[0].muhurat!;
    const ics = icsEvent({ uid: 'x', title: 'Holika Dahan; test', start: m[0], end: m[1], description: 'a, b', url: 'https://bornclock.com/' });
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    const start = ics.match(/DTSTART:(\d{8}T\d{6}Z)/)![1];
    expect(start).toBe(new Date(Math.round(m[0] / 60_000) * 60_000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''));
    expect(start.endsWith('00Z')).toBe(true);
    expect(ics).toContain('SUMMARY:Holika Dahan' + String.fromCharCode(92) + '; test');
  });

  const renderAt = (path: string, pattern: string, el: JSX.Element) => render(
    <HelmetProvider><MemoryRouter initialEntries={[path]}><Routes><Route path={pattern} element={el} /></Routes></MemoryRouter></HelmetProvider>);

  it('F8/F9 — pages render the sections in English and Hindi with no unfilled tokens; FAQ = muhurat answers', () => {
    for (const [path, pattern, lang, kind] of [
      ['/festivals/2027/holi', '/festivals/2027/:slug', 'en', 'holi'], ['/hi/festivals/2027/holi', '/hi/festivals/2027/:slug', 'hi', 'holi'],
      ['/festivals/2027/diwali', '/festivals/2027/:slug', 'en', 'diwali'], ['/hi/festivals/2027/diwali', '/hi/festivals/2027/:slug', 'hi', 'diwali'],
      ['/festivals/2027/dhanteras', '/festivals/2027/:slug', 'en', 'diwali'], ['/festivals/2027/holika-dahan', '/festivals/2027/:slug', 'en', 'holi'],
    ] as const) {
      const { container } = renderAt(path, pattern, <FestivalDatePage lang={lang} />);
      expect(container.querySelector(`[data-testid="muhurat-${kind}"]`), path).toBeTruthy();
      expect(container.querySelector('[data-testid="muhurat-ics"]')?.getAttribute('href')).toMatch(/^data:text\/calendar/);
      expect(container.querySelectorAll(`[data-testid="muhurat-${kind}-cities"] tbody tr`)).toHaveLength(10);
      expect(container.textContent).not.toMatch(/\{d:|undefined|NaN/);
      if (lang === 'hi') expect(container.querySelector('section[lang="hi"]')).toBeTruthy();
      const faqText = container.querySelector('[data-testid="festival2027-faq"]')!.textContent!;
      for (const q of muhuratFaq(kind, lang)) { expect(faqText).toContain(q.question); expect(faqText).toContain(q.answer.slice(0, 40)); }
      cleanup();
    }
  });
});

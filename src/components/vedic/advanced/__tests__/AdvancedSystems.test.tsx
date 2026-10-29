// @vitest-environment jsdom
/**
 * Batch 10 — Bhava Chalit, KP and Jaimini sections on /kundali, rendered for panel chart P1
 * (Lucknow 1996-08-31 13:04 IST = 07:34 UTC, round2/CONTEXT.md). Values themselves are
 * verified against Swiss Ephemeris / PyJHora in src/lib/vedic/advanced/__tests__.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdvancedSystems from '../AdvancedSystems';
import { calculateBirthChart } from '@/lib/vedic/calculateBirthChart';
import { toKundaliLegacy } from '@/lib/vedic/legacyAdapters';
import { computeBhavaChalit } from '@/lib/vedic/advanced/bhavaChalit';
import { getTermDef } from '@/lib/vedic/termDefinitions';

afterEach(cleanup);
const P1 = { iso: '1996-08-31T07:34:00.000Z', lat: 26.8467, lon: 80.9462 };

describe('AdvancedSystems (Kundali page)', () => {
  it('renders the three sections, answer first, with defined terms and scrollable tables', () => {
    const ui = render(<MemoryRouter><AdvancedSystems birthUtcISO={P1.iso} lat={P1.lat} lon={P1.lon} chartStyle="north" mahadasha="Saturn" /></MemoryRouter>);
    expect(ui.getByTestId('kundali-chalit-answer').textContent).toMatch(/^3 planets work through a different house/);
    expect(ui.getByTestId('chalit-shifts').textContent).toContain('Mars sits in the 9th sign from your Lagna but works through your 8th house');
    expect(ui.getByTestId('kundali-kp-answer').textContent).toMatch(/^In KP, the sub lord of each house cusp/);
    expect(ui.getByTestId('kp-dasha-line').textContent).toMatch(/^Your current Mahadasha lord, Saturn, is a significator of houses/);
    expect(ui.getByTestId('kundali-jaimini-answer').textContent).toMatch(/^Your Atmakaraka \(soul planet\) is Venus/);
    expect(ui.getByTestId('jaimini-karakamsha').textContent).toMatch(/Gemini \(Mithuna\)/);
    for (const id of ['chalit-table', 'kp-cusp-table', 'kp-planet-table', 'kp-significator-table', 'jaimini-karaka-table', 'chara-dasha-table']) {
      const t = ui.getByTestId(id);
      expect(t.parentElement!.className).toContain('table-scroll');
    }
    expect(ui.getByTestId('kp-cusp-table').querySelectorAll('tbody tr')).toHaveLength(12);
    expect(ui.getByTestId('chara-dasha-table').querySelectorAll('tbody tr')).toHaveLength(12);
    for (const id of ['bhavaChalit', 'bhavaMadhya', 'bhavaSandhi', 'kp', 'starLord', 'subLord', 'kpSignificator', 'charaKaraka', 'atmakaraka', 'karakamsha', 'charaDasha']) {
      expect(getTermDef(id), id).toBeTruthy();
      expect(ui.container.querySelector(`[data-term="${id}"]`), id).toBeTruthy();
    }
    // Every section is a native <details> (collapsible on phones).
    for (const id of ['kundali-chalit', 'kundali-kp', 'kundali-jaimini']) expect(ui.getByTestId(id).tagName).toBe('DETAILS');
  });

  it('Rashi-chart houses in the Chalit table agree with /api/kundali’s planet houses', async () => {
    const r = await calculateBirthChart({ year: 1996, month: 8, day: 31, hour: 13, minute: 4, latitude: P1.lat, longitude: P1.lon, timezoneOffset: 5.5 }, { refDate: new Date('2026-10-17T00:00:00Z') });
    const legacy = toKundaliLegacy(r);
    const c = computeBhavaChalit(new Date(P1.iso), P1.lat, P1.lon);
    for (const p of legacy.planets) expect(c.planets.find(x => x.name === p.name)!.rashiHouse, p.name).toBe(p.house);
    expect(c.lagnaSignIndex + 1).toBe(legacy.lagna.signIndex);
  });

  it('polar birthplace: tables are withheld with a plain note', () => {
    const ui = render(<MemoryRouter><AdvancedSystems birthUtcISO={P1.iso} lat={69.6492} lon={18.9553} chartStyle="north" /></MemoryRouter>);
    expect(ui.getByTestId('advanced-polar-note').textContent).toMatch(/polar circles/);
    expect(ui.queryByTestId('kundali-kp')).toBeNull();
  });
});

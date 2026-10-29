// @vitest-environment jsdom
/**
 * Batch 9b: the free Kundali PDF HTML. Built from the REAL /api/kundali response for the
 * golden "panel" chart P1 (src/lib/vedic/__tests__/golden/goldenCharts.json — Swiss
 * Ephemeris reference values, pyswisseph 2.10.03), at the fixture's reference date.
 * Asserts every section is present and every printed value equals the chart data
 * (and, for the signs / star / Dasha lords, the Swiss Ephemeris reference).
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { GET as kundaliGET } from '../../../../api/kundali';
import { GOLDEN, REF_DATE, birthQuery } from '../../../../scripts/golden/compareGolden';
import { NAKSHATRA_NAMES } from '../../vedic/engine/vedicEngine';
import { formatDegreeInSign } from '../../vedic/formatDegree';
import { kundaliBasis, type KundaliData } from '../../../services/kundaliService';
import { buildKundaliPdfHtml, nakshatraPadaOf, fmtDate, NAKSHATRA_ORDER, TEXT_VS } from '../kundaliPdfHtml';

const P1 = GOLDEN.charts.find(c => c.id === 'P1')!;
const norm = (s: string) => (s === 'Vrisha' ? 'Vrishabha' : s);
let data: KundaliData & Record<string, any>;
let doc: Document;
let html: string;

beforeAll(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(REF_DATE);
  vi.stubEnv('SUPABASE_URL', '');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
  const res = await kundaliGET(new Request(`http://localhost/api/kundali?${new URLSearchParams(birthQuery(P1))}`));
  data = await res.json();
  html = buildKundaliPdfHtml(data, {
    name: 'Suchit', dob: '1996-08-31', time: '13:04', place: 'Lucknow',
    basis: kundaliBasis(data), chartStyle: 'north', generatedAt: new Date('2026-10-29T10:00:00Z'),
  });
  doc = new DOMParser().parseFromString(html, 'text/html');
});
afterAll(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

const text = (sel: string) => doc.querySelector(sel)?.textContent ?? '';

describe('Kundali PDF HTML — panel chart P1', () => {
  it('the API response is the panel chart (sanity vs Swiss Ephemeris reference)', () => {
    expect(P1.edgeCase).toBe('panel');
    expect(norm(data.lagna.sign)).toBe(P1.expected.lagna);
    expect(norm(data.rashi!)).toBe(P1.expected.moonSign);
    expect(data.nakshatra.nakshatra).toBe(P1.expected.nakshatra);
  });

  it('has every section', () => {
    for (const id of ['pdf-title', 'pdf-birth-details', 'pdf-key-points', 'pdf-lagna', 'pdf-rashi', 'pdf-nakshatra',
      'pdf-charts', 'pdf-chart-d1', 'pdf-chart-d9', 'pdf-planets', 'pdf-dasha', 'pdf-manglik', 'pdf-closing', 'pdf-accuracy-link']) {
      expect(doc.querySelector(`[data-testid="${id}"]`), id).not.toBeNull();
    }
  });

  it('uses the Blueprint print rules: thead/tfoot running header + footer, A4, system fonts, U+FE0E', () => {
    expect(doc.querySelector('table.pt > thead')?.textContent).toContain('BornClock');
    expect(doc.querySelector('table.pt > tfoot')?.textContent).toContain('bornclock.com');
    expect(html).toMatch(/@page\s*{\s*size:\s*A4/);
    expect(html).not.toMatch(/fonts\.googleapis|@font-face|<link /);
    expect(html).toContain(`✦${TEXT_VS}`);
  });

  it('birth details, name, branding, generated date and the accuracy note', () => {
    const bd = text('[data-testid="pdf-birth-details"]');
    for (const v of ['Suchit', '31 Aug 1996', '13:04', 'Lucknow', 'Asia/Kolkata']) expect(bd).toContain(v);
    expect(text('[data-testid="pdf-title"]')).toBe('Suchit’s Kundali');
    const closing = text('[data-testid="pdf-closing"]');
    expect(closing).toContain('free basic Kundali; calculations: Lahiri ayanamsa');
    expect(closing).toContain('bornclock.com/kundali');
    expect(closing).toContain('Generated 29 Oct 2026');
    expect(doc.querySelector('[data-testid="pdf-accuracy-link"]')!.getAttribute('href')).toBe('https://bornclock.com/accuracy');
  });

  it('Lagna / Rashi / Nakshatra match the chart, each with a one-line explanation', () => {
    expect(text('[data-testid="pdf-lagna"] strong')).toBe(`Vrischika (Scorpio) · ${formatDegreeInSign(data.lagna.degrees)}`);
    expect(text('[data-testid="pdf-rashi"] strong')).toContain('Meena (Pisces)');
    expect(text('[data-testid="pdf-nakshatra"] strong')).toBe(`${P1.expected.nakshatra} · pada ${P1.expected.pada}`);
    for (const id of ['pdf-lagna', 'pdf-rashi', 'pdf-nakshatra']) expect(text(`[data-testid="${id}"] .ex`).length, id).toBeGreaterThan(20);
    for (const id of ['pdf-planets', 'pdf-dasha', 'pdf-manglik']) expect(text(`[data-testid="${id}"] .ex`).length, id).toBeGreaterThan(20);
  });

  it('planet table: sign, degree, nakshatra-pada, house, retro — per planet, from the chart data', () => {
    const rows = doc.querySelectorAll('[data-testid="pdf-planets"] tbody tr');
    expect(rows).toHaveLength(9);
    for (const p of data.planets) {
      const cells = [...doc.querySelector(`tr[data-planet="${p.name}"]`)!.querySelectorAll('td')].map(td => td.textContent);
      const nk = nakshatraPadaOf(p.longitude);
      expect(norm(cells[1]!.split(' (')[0]), p.name).toBe(P1.expected.planets[p.name]); // Swiss reference sign
      expect(cells[2]).toBe(formatDegreeInSign(p.longitude));
      expect(cells[3]).toBe(`${nk.nakshatra}-${nk.pada}`);
      expect(cells[4]).toBe(String(p.house));
      expect(cells[5]).toBe(p.retrograde ? 'R' : '—');
    }
    // Moon's row agrees with the chart's own birth star.
    const moon = data.planets.find(p => p.name === 'Moon')!;
    expect(nakshatraPadaOf(moon.longitude)).toEqual({ nakshatra: data.nakshatra.nakshatra, pada: data.nakshatra.pada });
  });

  it('D1 and D9 charts are drawn in the chosen style with the chart data', () => {
    const d1 = doc.querySelector('[data-testid="pdf-chart-d1"] svg')!;
    expect(d1.getAttribute('data-chart-style')).toBe('north');
    // House 1 carries the Lagna sign number (Vrischika = 8).
    expect(d1.querySelector('g[data-house="1"] text')!.textContent).toBe('8');
    const d9 = doc.querySelector('[data-testid="pdf-chart-d9"] svg')!;
    const d9Data = data.shodashvarga!.find(v => v.key === 'D9')!;
    expect(d9.querySelector('g[data-house="1"] text')!.textContent).toBe(String(d9Data.lagnaSignIndex));
    const south = new DOMParser().parseFromString(buildKundaliPdfHtml(data, { chartStyle: 'south' }), 'text/html');
    expect(south.querySelector('[data-testid="pdf-chart-d1"] svg')!.getAttribute('data-chart-style')).toBe('south');
  });

  it('current Mahadasha / Antardasha with dates', () => {
    const t = text('[data-testid="pdf-dasha"]');
    expect(t).toContain(P1.expected.dashaAtRef.mahadasha);
    expect(t).toContain(P1.expected.dashaAtRef.antardasha);
    expect(t).toContain(`${fmtDate(data.dasha!.mahadasha_start)} – ${fmtDate(data.dasha!.mahadasha_end)}`);
    expect(t).toContain(`${fmtDate((data.dasha as any).antardasha_start)} – ${fmtDate((data.dasha as any).antardasha_end)}`);
    expect(t).toContain('3 Jan 2017 – 3 Jan 2037'); // Swiss reference Mahadasha span
  });

  it('Manglik summary reflects the chart', () => {
    const md = data.doshas!.mangalDosha!;
    const t = text('[data-testid="pdf-manglik"]');
    expect(t).toContain(md.hasDosha ? 'Manglik' : 'Not Manglik');
    expect(t).toContain(`house ${md.marsHouseFromLagna} from the Lagna`);
  });

  it('birth-time edge note appears only when the chart has one', () => {
    const withEdge = buildKundaliPdfHtml({ ...data, birthTimeEdges: [{ point: 'Lagna', current: 'Kanya (Virgo)', alternative: 'Tula (Libra)', minutes: 6, window: 15 }] });
    expect(withEdge).toContain('data-testid="pdf-edge-notes"');
    expect(withEdge).toContain('6 minutes later would make it Tula (Libra)');
    expect(buildKundaliPdfHtml({ ...data, birthTimeEdges: [] })).not.toContain('data-testid="pdf-edge-notes"');
  });

  it('name is optional and escaped', () => {
    const anon = new DOMParser().parseFromString(buildKundaliPdfHtml(data, {}), 'text/html');
    expect(anon.querySelector('[data-testid="pdf-title"]')!.textContent).toBe('Janam Kundali');
    expect(buildKundaliPdfHtml(data, { name: '<b>x</b>' })).toContain('&lt;b&gt;x&lt;/b&gt;');
  });

  it('nakshatra order equals the engine list', () => {
    expect(NAKSHATRA_ORDER).toEqual(NAKSHATRA_NAMES);
  });
});

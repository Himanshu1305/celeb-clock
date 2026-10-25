// @vitest-environment jsdom
/**
 * Batch 7 W3 — the Kundali's "Divisional charts (Shodashvarga)" section. The chart data
 * comes from the real engine (P1, round2/CONTEXT.md panel) through the /api/kundali adapter,
 * so the UI is tested on exactly what users get.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ShodashvargaCharts, sensitivityNote } from '../ShodashvargaCharts';
import { calculateBirthChart } from '@/lib/vedic/calculateBirthChart';
import { toKundaliLegacy } from '@/lib/vedic/legacyAdapters';
import { SHODASHVARGA_META } from '@/data/shodashvarga';
import { getTermDef } from '@/lib/vedic/termDefinitions';

afterEach(cleanup);

async function p1Charts() {
  const r = await calculateBirthChart({ year: 1996, month: 8, day: 31, hour: 13, minute: 4, latitude: 26.8467, longitude: 80.9462, timezoneOffset: 5.5 }, { refDate: new Date('2026-10-17T00:00:00Z') });
  return toKundaliLegacy(r).shodashvarga!;
}

describe('ShodashvargaCharts', () => {
  it('offers all 16 vargas, opens on D9, and every chart has a meaning, a BPHS source and a defined term', async () => {
    const charts = await p1Charts();
    const ui = render(<MemoryRouter><ShodashvargaCharts charts={charts} chartStyle="north" /></MemoryRouter>);
    const keys = ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'];
    for (const k of keys) expect(ui.getByTestId(`varga-btn-${k}`)).toBeTruthy();
    expect(ui.getByTestId('varga-btn-D9').getAttribute('aria-pressed')).toBe('true');
    expect(ui.getByTestId('varga-meaning').textContent).toMatch(/Marriage and spouse/);
    for (const k of keys) {
      fireEvent.click(ui.getByTestId(`varga-btn-${k}`));
      expect(ui.getByTestId(`kundali-varga-${k}`)).toBeTruthy();
      expect(ui.getByTestId('varga-source').textContent).toMatch(/BPHS \d/);
      expect(ui.getByTestId('varga-sensitivity').textContent).toMatch(/^Birth-time check:/);
    }
    for (const m of SHODASHVARGA_META) expect(m.meaning.length).toBeGreaterThan(5);
    expect(getTermDef('khavedamsha')).toBeTruthy();
    expect(getTermDef('akshavedamsha')).toBeTruthy();
    expect(getTermDef('shodashvarga')).toBeTruthy();
  });

  it('D27 and above carry the exact-birth-time note; D60 also its method disclaimer and a ±5-min flag', async () => {
    const charts = await p1Charts();
    const ui = render(<MemoryRouter><ShodashvargaCharts charts={charts} chartStyle="south" /></MemoryRouter>);
    fireEvent.click(ui.getByTestId('varga-btn-D10'));
    expect(ui.queryByTestId('varga-exact-time')).toBeNull();
    fireEvent.click(ui.getByTestId('varga-btn-D27'));
    expect(ui.getByTestId('varga-exact-time')).toBeTruthy();
    fireEvent.click(ui.getByTestId('varga-btn-D60'));
    expect(ui.getByTestId('varga-d60-note').textContent).toMatch(/several classical traditions/);
    // P1's D60 Lagna changes within ±5 minutes (engine check) — the page must say so.
    expect(charts.find(c => c.key === 'D60')!.timeSensitive).toContain('Lagna');
    expect(ui.getByTestId('varga-sensitivity').textContent).toMatch(/born 5 minutes earlier or later, the Lagna/);
  });

  it('unknown birth time: every chart above D1 says it cannot be relied on', async () => {
    const charts = await p1Charts();
    const ui = render(<MemoryRouter><ShodashvargaCharts charts={charts} chartStyle="north" birthTimeKnown={false} /></MemoryRouter>);
    expect(ui.getByTestId('varga-time-unknown').textContent).toMatch(/cannot be relied on/);
    fireEvent.click(ui.getByTestId('varga-btn-D1'));
    expect(ui.queryByTestId('varga-time-unknown')).toBeNull();
  });

  it('sensitivity sentence is plain and calm', () => {
    expect(sensitivityNote([])).toMatch(/stays the same/);
    expect(sensitivityNote(['Moon'])).toBe('Birth-time check: if you were born 5 minutes earlier or later, the Moon would fall in a different sign in this chart. Read it with care unless your birth time is exact (for example, from a hospital record).');
    expect(sensitivityNote(['Lagna', 'Moon', 'Mars'])).toMatch(/the Lagna \(and so every house in this chart\), the Moon and Mars would/);
  });
});

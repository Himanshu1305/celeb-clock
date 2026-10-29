// @vitest-environment jsdom
/**
 * Batch 10 — the Kundali's Yogini Dasha and Ashtakavarga sections, rendered from the real engine
 * output for panel chart P9 (round2/CONTEXT.md) through the /api/kundali adapter.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { YoginiDashaSection, balanceText } from '../YoginiDashaSection';
import { AshtakavargaSection, rankHouses } from '../AshtakavargaSection';
import { calculateBirthChart } from '@/lib/vedic/calculateBirthChart';
import { toKundaliLegacy } from '@/lib/vedic/legacyAdapters';
import { currentYoginiPeriod } from '@/lib/vedic/engine/yoginiDasha';
import { YOGINI_META, savBand } from '@/data/yoginiAshtakavarga';
import { getTermDef } from '@/lib/vedic/termDefinitions';

afterEach(cleanup);
const NOW = new Date('2026-10-29T00:00:00Z');

async function p9() {
  const r = await calculateBirthChart({ year: 1978, month: 5, day: 13, hour: 19, minute: 30, latitude: 32.7266, longitude: 74.8570, timezoneOffset: 5.5 }, { refDate: NOW });
  return toKundaliLegacy(r);
}

describe('YoginiDashaSection', () => {
  it('answers first with the current Yogini period, highlights it, and lists its 8 sub-periods', async () => {
    const k = await p9();
    const cur = currentYoginiPeriod(k.yoginiDasha!, NOW)!;
    const ui = render(<YoginiDashaSection data={k.yoginiDasha!} now={NOW} />);
    const now = ui.getByTestId('yogini-now').textContent!;
    expect(now).toContain(`${cur.maha.yogini} Yogini`);
    expect(now).toContain(YOGINI_META[cur.maha.yogini].guidance);
    expect(ui.getByTestId('yogini-current').textContent).toContain(cur.maha.yogini);
    // The current Maha starts expanded with its sub-periods, the running one marked.
    expect(ui.getByTestId('yogini-antar-current').textContent).toContain(`${cur.maha.yogini}/${cur.antar!.yogini}`);
    expect(ui.container.textContent).toContain('began with');
    expect(ui.container.textContent).toContain('365.25-day years');
  });

  it('every Yogini has a sourced meaning and guidance; balance text is readable', () => {
    for (const name of ['Mangala', 'Pingala', 'Dhanya', 'Bhramari', 'Bhadrika', 'Ulka', 'Siddha', 'Sankata']) {
      expect(YOGINI_META[name].meaning.length, name).toBeGreaterThan(10);
      expect(YOGINI_META[name].guidance.length, name).toBeGreaterThan(10);
      expect(/\b(death|die|accident|disease|divorce)\b/i.test(YOGINI_META[name].meaning + YOGINI_META[name].guidance), name).toBe(false);
    }
    expect(balanceText(2)).toBe('2 years');
    expect(balanceText(1.5529)).toBe('1 year 7 months');
    expect(balanceText(0.03)).toBe('0 months');
  });

  it('a period row expands to show its sub-periods', async () => {
    const k = await p9();
    const ui = render(<YoginiDashaSection data={k.yoginiDasha!} now={NOW} />);
    fireEvent.click(ui.getByTestId('yogini-row-0'));
    expect(ui.container.textContent).toContain(`${k.yoginiDasha!.startYogini}/${k.yoginiDasha!.startYogini}`);
  });
});

describe('AshtakavargaSection', () => {
  it('shows a 7-planet × 12-house table plus SAV (337), read from the Lagna, with a plain answer', async () => {
    const k = await p9();
    const av = k.ashtakavarga!;
    const ui = render(<AshtakavargaSection data={av} />);
    for (const p of ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'SAV']) expect(ui.getByTestId(`av-row-${p}`)).toBeTruthy();
    const sav = [...ui.getByTestId('av-row-SAV').querySelectorAll('td')].map(td => td.textContent);
    expect(sav[13]).toBe('337');
    expect(Number(sav[1])).toBe(av.sav[av.lagnaSignIndex]); // house 1 = Lagna sign
    const { top, low } = rankHouses(av.sav, av.lagnaSignIndex);
    const answer = ui.getByTestId('av-answer').textContent!;
    expect(answer).toContain(`, ${top[0].points})`);
    expect(answer).toMatch(/steadier, more patient effort/);
    expect(low[0].points).toBeLessThanOrEqual(top[0].points);
    expect(ui.getByTestId('av-scroll-hint')).toBeTruthy();
  });

  it('bands: 28+ strong, 25–27 average, below 25 lighter', () => {
    expect(savBand(28)).toBe('strong');
    expect(savBand(27)).toBe('average');
    expect(savBand(25)).toBe('average');
    expect(savBand(24)).toBe('lighter');
  });

  it('new terms are in the glossary', () => {
    for (const id of ['yoginiDasha', 'ashtakavarga', 'bindu', 'bhinnashtakavarga', 'sarvashtakavarga']) expect(getTermDef(id), id).toBeTruthy();
  });
});

/**
 * Batch 10 — "Planets today", combustion, retrograde stations and Moon phase vs Swiss
 * Ephemeris. Reference: golden/skySwiss.json, made by golden/skySwiss_ref.py with
 * pyswisseph 2.10.03 (sidereal = Swiss apparent tropical − (SIDM_LAHIRI mean ayanamsa +
 * BornClock's calibrated 24.4″, see ayanamsaDrik.test.ts); Rahu = mean node), run
 * 29 Oct 2026 in the engine-audit venv. The JSON longitudes already include the 24.4″.
 * Combustion orbs: Surya Siddhanta distances as quoted by Drik Panchang (cited in ../sky.ts);
 * the Swiss script applies the same orbs independently to Swiss positions and speeds.
 */
import { describe, it, expect } from 'vitest';
import ref from './golden/skySwiss.json';
import { getSiderealLongitude } from '../engine/vedicEngine';
import { GRAHAS, combustPeriods, grahaPositions, moonEvents, moonPhase, nextSignChange, retrogradePeriods, type Graha } from '../sky';
import { computePlanetDayData, computeMoonDayData } from '../../daily/kinds/skyDaily';
import { renderPlanetsToday, renderMoonPhase, planetRows } from '../../daily/kinds/skyTemplate';
import { renderDailyBodyHtml } from '../../daily/render';

interface Ref {
  positions: Array<{ date: string; lon: Record<string, number>; speed: Record<string, number> }>;
  ingress: Array<{ date: string; planet: Graha; at: string; to: number }>;
  stations: Array<{ planet: Graha; kind: 'retrograde' | 'direct'; at: string }>;
  combust: Array<{ planet: Graha; start: string; end: string }>;
  moon: { illum: Record<string, number>; events: Array<{ kind: 'new' | 'full'; at: string }> };
}
const R = ref as unknown as Ref;
const ms = (iso: string) => Date.parse(iso.replace(/Z$/, ':00Z'));
const minutes = (a: number, b: number) => Math.abs(a - b) / 60000;
const arcmin = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180) * 60;

describe('positions at 12:00 IST on 5 dates vs Swiss Ephemeris (within 1′)', () => {
  for (const row of R.positions) {
    it(row.date, () => {
      const at = new Date(`${row.date}T06:30:00Z`);
      const pos = grahaPositions(at);
      for (const p of GRAHAS) {
        const want = p === 'Ketu' ? (row.lon.Rahu + 180) % 360 : row.lon[p];
        const got = pos.find(x => x.planet === p)!;
        expect(arcmin(got.lon, want), `${p}`).toBeLessThan(1);
        // Retrograde flag = sign of the Swiss speed (nodes: mean node always backwards).
        const sp = p === 'Ketu' ? row.speed.Rahu : row.speed[p];
        expect(got.retro, `${p} retro`).toBe(sp < 0);
      }
    });
  }
});

describe('next sign change vs Swiss Ephemeris', () => {
  for (const ig of R.ingress) {
    it(`${ig.date} ${ig.planet} → sign ${ig.to}`, () => {
      const n = nextSignChange(ig.planet, new Date(`${ig.date}T06:30:00Z`))!;
      expect(n.to).toBe(ig.to);
      // Mean node: Swiss and our node formula differ by ~0.25′, i.e. up to ~2 h at 3′/day
      // (the page shows the node's date only). Venus / Saturn near a station move very
      // slowly (page shows the date only below 0.5°/day). Everything else: 5 minutes.
      const tol = ig.planet === 'Rahu' ? 180 : ig.planet === 'Venus' || ig.planet === 'Saturn' ? 30 : 5;
      expect(minutes(n.at.getTime(), ms(ig.at)), ig.planet).toBeLessThan(tol);
    });
  }
  it('the daily data shows a clock time only where it is within 5 minutes of Swiss', () => {
    for (const date of R.positions.map(p => p.date)) {
      const d = computePlanetDayData(date);
      GRAHAS.forEach((g, i) => {
        const x = d.x[i];
        if (!x || !x[2]) return;
        const r = R.ingress.find(q => q.date === date && q.planet === g)!;
        expect(minutes(x[0] * 60000, ms(r.at)), `${date} ${g}`).toBeLessThan(5);
      });
    }
  }, 30_000);
});

describe('retrograde stations 2026–2027 vs Swiss Ephemeris', () => {
  // Stations are ill-conditioned (the planet is almost still), so the page shows dates;
  // minutes here are only a regression guard.
  const TOL: Record<string, number> = { Mercury: 5, Venus: 10, Mars: 10, Jupiter: 60, Saturn: 60 };
  for (const p of ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as Graha[]) {
    it(p, () => {
      const ours = [...retrogradePeriods(p, 2026), ...retrogradePeriods(p, 2027)]
        .flatMap(x => [{ kind: 'retrograde', t: x.start.getTime() }, { kind: 'direct', t: x.end.getTime() }]);
      const swiss = R.stations.filter(s => s.planet === p);
      expect(swiss.length).toBeGreaterThan(0);
      for (const s of swiss) {
        const m = ours.find(o => o.kind === s.kind && minutes(o.t, ms(s.at)) < 3 * 1440);
        expect(m, `${p} ${s.kind} ${s.at}`).toBeTruthy();
        expect(minutes(m!.t, ms(s.at)), `${p} ${s.kind} ${s.at}`).toBeLessThan(TOL[p]);
      }
    });
  }
});

describe('combustion periods 2026 (Surya Siddhanta orbs) vs the same orbs on Swiss positions', () => {
  for (const p of ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as Graha[]) {
    it(p, () => {
      const ours = combustPeriods(p, 2026);
      const swiss = R.combust.filter(c => c.planet === p && ms(c.end) >= Date.UTC(2026, 0, 1));
      expect(ours.length, p).toBe(swiss.length);
      swiss.forEach((s, i) => {
        expect(minutes(ours[i].end.getTime(), ms(s.end)), `${p} end ${s.end}`).toBeLessThan(10);
        if (s.start !== 'before') expect(minutes(ours[i].start.getTime(), ms(s.start)), `${p} start ${s.start}`).toBeLessThan(10);
      });
    });
  }
});

describe('Moon phase vs Swiss Ephemeris', () => {
  it('illuminated fraction on 5 dates within 0.0005', () => {
    for (const [d, want] of Object.entries(R.moon.illum)) {
      expect(Math.abs(moonPhase(new Date(`${d}T06:30:00Z`)).illumination - want), d).toBeLessThan(5e-4);
    }
  });
  it('every new and full Moon of 2026–2027 within 2 minutes', () => {
    const ours = moonEvents(new Date('2026-01-01T00:00:00Z'), new Date('2028-01-01T00:00:00Z'));
    expect(ours.length).toBe(R.moon.events.length);
    ours.forEach((e, i) => {
      expect(e.kind).toBe(R.moon.events[i].kind);
      expect(minutes(e.at.getTime(), ms(R.moon.events[i].at)), R.moon.events[i].at).toBeLessThan(2);
    });
  }, 30_000);
  it('the daily data: next full / new Moon are the Swiss events after 12:00 IST', () => {
    for (const d of Object.keys(R.moon.illum)) {
      if (d > '2027-12-01') continue;
      const m = computeMoonDayData(d);
      const noon = Date.parse(`${d}T06:30:00Z`);
      const nf = R.moon.events.find(e => e.kind === 'full' && ms(e.at) > noon)!;
      const nn = R.moon.events.find(e => e.kind === 'new' && ms(e.at) > noon)!;
      expect(minutes(m.nf * 60000, ms(nf.at)), `${d} full`).toBeLessThan(2);
      expect(minutes(m.nn * 60000, ms(nn.at)), `${d} new`).toBeLessThan(2);
    }
  });
});

describe('Planets today page text (29 Oct 2026)', () => {
  const d = computePlanetDayData('2026-10-29');
  const e = renderPlanetsToday('2026-10-29', d);
  it('retrograde planets = negative Swiss speeds (Mercury, Venus, Saturn); none combust', () => {
    // Swiss speeds 29 Oct 2026 06:30 UT: Mercury −0.73, Venus −0.56, Saturn −0.066 °/day.
    const rows = planetRows(d);
    expect(rows.filter(r => r.retro && r.planet !== 'Rahu' && r.planet !== 'Ketu').map(r => r.planet)).toEqual(['Mercury', 'Venus', 'Saturn']);
    // Swiss combust spells (skySwiss.json): Mercury from 30 Oct 00:34 UT, Venus until 29 Oct 04:10 UT.
    expect(rows.filter(r => r.combust)).toEqual([]);
    expect(e.answer).toContain('Mercury, Venus and Saturn are retrograde');
  });
  it('answer-first, table layout, FAQ, no <div in the body', () => {
    expect(e.title.length).toBeLessThanOrEqual(70);
    expect(e.sections[0].layout).toBe('table');
    expect(e.sections[0].rows).toHaveLength(9);
    expect(e.faq.length).toBeGreaterThanOrEqual(3);
    const html = renderDailyBodyHtml(e);
    expect(html).not.toContain('<div');
    expect(html).toContain('overflow-x-auto');
    expect(html).toContain('Swipe sideways');
  });
  it('Moon row matches Swiss (Vrishabha, Mrigashira 1 at 23°49′)', () => {
    // Swiss sidereal Moon (skySwiss.json, ayanamsa already + 24.4″) 53.82052° → Vrishabha 23°49′, Mrigashira pada 1.
    expect(arcmin(getSiderealLongitude('Moon', new Date('2026-10-29T06:30:00Z')), 53.82052)).toBeLessThan(1);
    expect(e.sections[0].rows![1].slice(1, 4)).toEqual(['Vrishabha (Taurus)', '23°49′', 'Mrigashira (1)']);
  });
});

describe('Moon phase page text', () => {
  it('29 Oct 2026: Waning Gibbous, 87% lit, Krishna Chaturthi; next full 24 Nov 20:24 IST', () => {
    const e = renderMoonPhase('2026-10-29', computeMoonDayData('2026-10-29'));
    // Swiss full Moon 2026-11-24T14:54Z = 20:24 IST; illumination 0.86965 (skySwiss.json).
    expect(e.answer).toContain('Waning Gibbous, 87% lit');
    expect(e.answer).toContain('24 Nov 2026, 20:24 IST');
    expect(e.sections[0].items!.find(i => i.label === 'Tithi')!.value).toBe('Krishna Chaturthi');
    expect(e.title.length).toBeLessThanOrEqual(70);
  });
  it('a principal-phase day takes that name (full Moon 24 Nov 2026 IST)', () => {
    expect(renderMoonPhase('2026-11-24', computeMoonDayData('2026-11-24')).answer).toContain('Full Moon');
  });
});

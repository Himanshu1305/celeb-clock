/**
 * Audit D2 / D3 / D10 regressions — Sade Sati cycle dates on the REAL engine.
 *
 * Reference values: Swiss Ephemeris (pyswisseph, SIDM_LAHIRI, the audit venv in
 * scratchpad/engine-audit) sidereal Saturn ingress instants, which also match the Drik
 * Panchang dates recorded in round2.txt (audit D2):
 *   2020-01-24 04:27 UT  Dhanu → Makara        2027-06-02 23:59 UT  Meena → Mesha
 *   2027-10-20 01:43 UT  Mesha → Meena (retro) 2028-02-23 13:55 UT  Meena → Mesha
 *   2054-05-14 14:40 UT  Kumbha → Meena        2002-07-23 02:40 UT  Vrishabha → Mithuna
 *   2009-09-09 18:31 UT  Simha → Kanya
 * Drik (round2.txt): P10 Kumbha Moon — resumes 20 Oct 2027, ends 23 Feb 2028; Mesha's next
 * cycle starts 2054; P9 (Karka Moon) last Sade Sati Jul 2002 – Sep 2009.
 */
import { describe, it, expect } from 'vitest';
import { computeSadeSati } from '../sadeSati';
import { getSaturnSignIndex } from '../engine/vedicEngine';

const H = 3600e3;
const near = (iso: string | undefined, refUT: string, tolH = 6) => {
  expect(iso).toBeTruthy();
  expect(Math.abs(new Date(iso!).getTime() - new Date(refUT).getTime())).toBeLessThan(tolH * H);
};
const MESHA = 0, KARKA = 3, KUMBHA = 10;
const NOW = new Date('2026-10-17T06:00:00Z');
const P10_BIRTH = new Date('2024-03-10T03:45:00Z'); // 09:15 IST
const P9_BIRTH = new Date('1978-05-13T14:00:00Z');  // 19:30 IST

describe('Sade Sati cycles on the real ephemeris (audit D2/D3/D10)', () => {
  it('P10 Kumbha Moon: cycle runs to the FINAL exit (23 Feb 2028), with the Jun–Oct 2027 retrograde pause', () => {
    const r = computeSadeSati(KUMBHA, NOW, getSaturnSignIndex, P10_BIRTH);
    expect(r.active).toBe(true);
    expect(r.phase).toBe('Setting (2nd from Moon)');
    near(r.currentCycle?.start, '2020-01-24T04:27:00Z');
    near(r.currentCycle?.end, '2028-02-23T13:55:00Z');
    expect(r.currentCycle!.pauses).toHaveLength(1);
    near(r.currentCycle!.pauses[0].start, '2027-06-02T23:59:00Z');
    near(r.currentCycle!.pauses[0].end, '2027-10-20T01:43:00Z');
    // D10: born 2024 inside this cycle → flagged; no "last Sade Sati" before birth.
    expect(r.currentCycle!.startedBeforeBirth).toBe(true);
    expect(r.previousCycle).toBeNull();
  });

  it('Kumbha during the pause (1 Aug 2027): paused, resumes 20 Oct 2027 — never a blank cycle', () => {
    const r = computeSadeSati(KUMBHA, new Date('2027-08-01T06:00:00Z'), getSaturnSignIndex);
    expect(r.active).toBe(false);
    expect(r.currentCycle).not.toBeNull();
    near(r.paused?.resumes, '2027-10-20T01:43:00Z');
  });

  it('Kumbha after re-entry (1 Dec 2027, audit D3): active with a real current cycle and phase dates', () => {
    const r = computeSadeSati(KUMBHA, new Date('2027-12-01T06:00:00Z'), getSaturnSignIndex);
    expect(r.active).toBe(true);
    expect(r.currentCycle).not.toBeNull();
    near(r.currentCycle?.end, '2028-02-23T13:55:00Z');
    near(r.currentPhase?.start, '2027-10-20T01:43:00Z');
    near(r.currentPhase?.end, '2028-02-23T13:55:00Z');
  });

  it('Mesha Moon: in Sade Sati now; the NEXT cycle starts in 2054 (not Oct 2027)', () => {
    const r = computeSadeSati(MESHA, NOW, getSaturnSignIndex);
    expect(r.active).toBe(true);
    near(r.nextCycle?.start, '2054-05-14T14:40:00Z');
  });

  it('P9 Karka Moon: last Sade Sati Jul 2002 – Sep 2009 (first entry, not the Jan 2005 re-entry)', () => {
    const r = computeSadeSati(KARKA, NOW, getSaturnSignIndex, P9_BIRTH);
    expect(r.active).toBe(false);
    near(r.previousCycle?.start, '2002-07-23T02:40:00Z');
    near(r.previousCycle?.end, '2009-09-09T18:31:00Z');
    expect(r.previousCycle?.startedBeforeBirth).toBeUndefined();
  });

  it('never reports a "last" cycle that ended before birth (audit D10)', () => {
    for (let moon = 0; moon < 12; moon++) {
      const r = computeSadeSati(moon, NOW, getSaturnSignIndex, P10_BIRTH);
      if (r.previousCycle) expect(new Date(r.previousCycle.end).getTime()).toBeGreaterThan(P10_BIRTH.getTime());
    }
  }, 60_000); // 12 full ephemeris scans (~0.6 s each) exceed vitest's 5 s default
});

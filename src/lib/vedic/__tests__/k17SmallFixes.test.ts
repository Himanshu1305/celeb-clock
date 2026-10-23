import { describe, it, expect } from 'vitest';
import { generateFullChart } from '../engine/vedicEngine';
import { formatDegreeInSign } from '../formatDegree';
import { buildInterpretationBlocks, type KundaliData } from '@/services/kundaliService';

// K17 — small fixes.
describe('K17: retrograde flag at stations', () => {
  // Station instants from Swiss Ephemeris (pyswisseph, sign change of geocentric speed),
  // recorded in the round-2 audit (scratchpad round2/K/stations.json).
  const STATIONS: Array<{ p: string; iso: string; toRetro: boolean }> = [
    { p: 'Mercury', iso: '1990-04-23T06:54:00Z', toRetro: true },
    { p: 'Mercury', iso: '1990-05-17T02:01:00Z', toRetro: false },
    { p: 'Venus', iso: '1990-02-08T09:16:00Z', toRetro: false },
    { p: 'Mars', iso: '1990-10-20T19:29:00Z', toRetro: true },
    { p: 'Jupiter', iso: '1990-11-30T05:02:00Z', toRetro: true },
    { p: 'Saturn', iso: '1990-05-04T22:42:00Z', toRetro: true },
    { p: 'Saturn', iso: '1990-09-23T05:10:00Z', toRetro: false },
  ];
  it('flips within 2 hours of the real station (was ~12 h early)', () => {
    for (const s of STATIONS) {
      const t0 = Date.parse(s.iso);
      for (const h of [-12, -2, 2, 12]) {
        const t = new Date(t0 + h * 3600e3);
        const retro = (generateFullChart(t, t, 28.6, 77.2).planets as any)[s.p].retrograde;
        expect(retro, `${s.p} ${s.iso} ${h > 0 ? '+' : ''}${h}h`).toBe(s.toRetro ? h > 0 : h < 0);
      }
    }
  });
});

describe('K17: degree display never rounds up into the next sign', () => {
  it('truncates to degrees and arc-minutes', () => {
    // P7 Sun: Swiss Ephemeris 29.983° sidereal (2002-05-14 20:45 UT) → legacy 29.98
    expect(formatDegreeInSign(29.98)).toBe('29°58′');
    expect(formatDegreeInSign(29.9999)).toBe('29°59′');
    expect(formatDegreeInSign(30)).toBe('0°00′');
    expect(formatDegreeInSign(45.5)).toBe('15°30′');
    expect(formatDegreeInSign(359.99)).toBe('29°59′');
  });
});

describe('K17: Taurus ("Vrisha") interpretation copy is complete', () => {
  it('Lagna and Moon-sign blocks describe Vrisha instead of stopping at "Yours is Vrisha."', () => {
    const k = {
      lagna: { sign: 'Vrisha', signIndex: 2, degrees: 45 },
      planets: [{ name: 'Moon', sign: 'Vrisha', signIndex: 2, house: 1, longitude: 50, retrograde: false }],
      nakshatra: { nakshatra: 'Rohini', nakshatra_devanagari: 'रोहिणी', pada: 2, confidence: 'high', is_boundary: false },
      rashi: 'Vrisha', rashi_devanagari: 'वृष', dasha: null, requires_birth_time: false,
    } as KundaliData;
    const text = buildInterpretationBlocks(k).map(b => b.body).join('\n');
    expect(text).not.toMatch(/Yours is Vrisha\./);
    expect(text).toContain('Yours is Vrisha, an earth sign');
    expect(text).toContain('steady, sensual and security-seeking');
  });
});

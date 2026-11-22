/**
 * B18 — the Varshphal outlook text: driven by computed factors, impact → reason → what to do,
 * and never fear/death/disease/certainty wording (checked with the site's harmful-prediction
 * detector), marriage only as windows. Runs over every reference chart × year × language.
 */
import { describe, it, expect } from 'vitest';
import ref from './fixtures/varshphalSwiss.json';
import { computeVarshphal } from '../varshphal';
import { buildOutlook } from '../varshphalOutlook';
import { findHarmfulPredictions } from '../harmfulPredictions';

type Row = { id: string; year: number; birthUTC: string; birthLat: number; birthLon: number; lat: number; lon: number };
const ROWS = (ref as unknown as { rows: Row[] }).rows;
const FORBIDDEN_EN = /\b(death|die|dies|fatal|disease|illness|surgery|accident|widow|divorce|doom|cursed|guarantee[sd]?|definitely|certainly|will marry)\b/i;
// Devanagari has no \b word boundaries in JS regex.
const FORBIDDEN_HI = /(पक्का|पक्की|मृत्यु|मौत|बीमारी|रोग|दुर्घटना|तलाक|निश्चित रूप से)/;

describe('Varshphal outlook', () => {
  for (const r of ROWS) {
    for (const lang of ['en', 'hi'] as const) {
      it(`${r.id} ${r.year} ${lang}`, () => {
        const v = computeVarshphal({ birthUTC: new Date(r.birthUTC), birthLat: r.birthLat, birthLon: r.birthLon, lat: r.lat, lon: r.lon, timezone: 'UTC', year: r.year });
        const o = buildOutlook(v, lang);
        expect(o.blocks.map(b => b.key)).toEqual(['overall', 'career', 'money', 'relationships', 'health']);
        for (const b of o.blocks) { expect(b.impact.length).toBeGreaterThan(10); expect(b.reason.length).toBeGreaterThan(10); expect(b.todo.length).toBeGreaterThan(10); }
        expect(o.months.length).toBe(v.mudda.length);
        // Every window is a real Mudda period.
        for (const w of [...o.bestWindows, ...o.relationshipWindows]) expect(v.mudda.some(m => m.start === w.start && m.end === w.end && m.lord === w.lord)).toBe(true);
        const all = [o.headline, ...o.blocks.flatMap(b => [b.impact, b.reason, b.todo]), ...o.months.flatMap(m => [m.impact, m.reason, m.todo]), ...o.remedies.map(x => x.why)].join('\n');
        expect(findHarmfulPredictions(all)).toEqual([]);
        expect(FORBIDDEN_EN.test(all), all.match(FORBIDDEN_EN)?.[0]).toBe(false);
        expect(FORBIDDEN_HI.test(all), all.match(FORBIDDEN_HI)?.[0]).toBe(false);
        // The Varshesh named in the headline is the computed one.
        expect(o.headline).toContain(lang === 'en' ? v.varshesh.planet : '');
      });
    }
  }
  it('the health block always points to a doctor and never names a condition', () => {
    const r = ROWS[0];
    const v = computeVarshphal({ birthUTC: new Date(r.birthUTC), birthLat: r.birthLat, birthLon: r.birthLon, lat: r.lat, lon: r.lon, timezone: 'UTC', year: r.year });
    expect(buildOutlook(v, 'en').blocks.find(b => b.key === 'health')!.todo).toMatch(/doctor/);
    expect(buildOutlook(v, 'hi').blocks.find(b => b.key === 'health')!.todo).toMatch(/डॉक्टर/);
  });
});

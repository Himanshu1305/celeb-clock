import { describe, it, expect } from 'vitest';
import { GET } from '../../../../api/kundali-match';
import { calculateGunaMilan, vashyaGroup, yoniPoints, type PersonInput } from '../matchmaking';

/**
 * AstroSage parity regression (founder decision: Guna Milan follows AstroSage exactly).
 * REFERENCE: 7 couples entered on astrosage.com on 17 Oct 2026, recorded in the Round 2
 * audit (scratchpad round2.txt, "Matching and Manglik vs AstroSage"). Boy listed first.
 * Births: P-ids from the audit's standard panel (round2/CONTEXT.md); Y1/Y3 from the
 * audit's probe script round2/M/run3.mts.
 */
type Birth = [string, number, number, string];
const PEOPLE: Record<string, Birth> = {
  P1: ['1996-08-31T13:04', 26.8467, 80.9462, 'Asia/Kolkata'],       // Suchit, Lucknow
  P2: ['1999-12-03T11:03', 42.6389, -83.2910, 'America/Detroit'],   // Sukriti, Pontiac MI
  P3: ['1990-01-15T06:30', 28.6139, 77.2090, 'Asia/Kolkata'],       // New Delhi
  P4: ['1985-07-20T23:45', 19.0760, 72.8777, 'Asia/Kolkata'],       // Mumbai
  P6: ['2001-12-25T08:00', -33.8688, 151.2093, 'Australia/Sydney'],
  P7: ['2002-05-14T16:45', 40.5187, -74.4121, 'America/New_York'],  // Edison NJ
  P8: ['1995-02-10T21:40', -37.8136, 144.9631, 'Australia/Melbourne'],
  P9: ['1978-05-13T19:30', 32.7266, 74.8570, 'Asia/Kolkata'],       // Jammu
  Y1: ['1994-11-08T06:00', 28.6139, 77.2090, 'Asia/Kolkata'],       // Delhi, Moon late Sagittarius
  Y3: ['1994-11-05T12:00', 28.6139, 77.2090, 'Asia/Kolkata'],       // Delhi, Moon Scorpio
};
const params = (id: string, s: 'A' | 'B') => {
  const [d, lat, lon, tz] = PEOPLE[id];
  const [ds, ts] = d.split('T'); const [y, m, dd] = ds.split('-'); const [h, mi] = ts.split(':');
  return { [`y${s}`]: y, [`m${s}`]: m, [`d${s}`]: dd, [`h${s}`]: h, [`min${s}`]: mi, [`lat${s}`]: String(lat), [`lon${s}`]: String(lon), [`tzid${s}`]: tz };
};
async function match(boy: string, girl: string, boyEnteredAs: 'A' | 'B' = 'A') {
  const p = boyEnteredAs === 'A'
    ? { ...params(boy, 'A'), ...params(girl, 'B'), groom: 'A' }
    : { ...params(girl, 'A'), ...params(boy, 'B'), groom: 'B' };
  const res = await GET(new Request('http://localhost/api/kundali-match?' + new URLSearchParams(p)));
  return res.json();
}
const k = (j: any, key: string) => j.gunaMilan.kootas.find((x: any) => x.key === key).score;

// [boy, girl, AstroSage total]
const COUPLES: Array<[string, string, number]> = [
  ['P1', 'P2', 12.5], // Suchit × Sukriti
  ['P3', 'P4', 30],
  ['P9', 'P3', 17.5],
  ['P7', 'P8', 28],
  ['P6', 'P8', 23.5],
  ['Y1', 'P3', 17],
  ['Y3', 'P2', 7.5],
];

describe('Guna Milan equals AstroSage for all 7 audit couples', () => {
  for (const [boy, girl, total] of COUPLES) {
    it(`${boy} (boy) × ${girl} (girl) = ${total}, whichever slot the boy is entered in`, async () => {
      const a = await match(boy, girl, 'A');
      const b = await match(boy, girl, 'B');
      expect(a.gunaMilan.total).toBe(total);
      expect(b.gunaMilan.total).toBe(total);
    });
  }

  it('per-koota values the audit recorded from AstroSage', async () => {
    const s = await match('P1', 'P2');           // AstroSage: Vashya ½, Yoni 1, Gana 0
    expect([k(s, 'vashya'), k(s, 'yoni'), k(s, 'gana')]).toEqual([0.5, 1, 0]);
    const n = await match('P9', 'P3');           // AstroSage: Yoni 3, Gana 6
    expect([k(n, 'yoni'), k(n, 'gana')]).toEqual([3, 6]);
    const y1 = await match('Y1', 'P3');          // AstroSage: Vashya 0 (Moon in 2nd half of Sagittarius)
    expect(k(y1, 'vashya')).toBe(0);
    const y3 = await match('Y3', 'P2');          // AstroSage: Yoni 1, Gana 0
    expect([k(y3, 'yoni'), k(y3, 'gana')]).toEqual([1, 0]);
    const p68 = await match('P6', 'P8');         // AstroSage total 23.5 with Yoni 2 (no koota differed)
    expect(k(p68, 'yoni')).toBe(2);
  });
});

describe('Boy/Girl choice (M2)', () => {
  it('direction matters: reading the girl as the boy changes Gana for P1 × P2', async () => {
    // Boy Deva (Revati) × girl Rakshasa (Chitra) = 0; reversed (boy Rakshasa × girl Deva) = 1.
    const right = await match('P1', 'P2');
    const wrong = await match('P2', 'P1');
    expect(k(right, 'gana')).toBe(0);
    expect(k(wrong, 'gana')).toBe(1);
  });
  it('Porutham is computed with the same bride/groom as Ashtakoota', async () => {
    const a = await match('P9', 'P3', 'A');
    const b = await match('P9', 'P3', 'B');
    expect(a.porutham.metCount).toBe(b.porutham.metCount);
    expect(a.groom).toBe('A');
    expect(b.groom).toBe('B');
  });
});

describe('Ashtakoota tables (AstroSage convention)', () => {
  const P = (nakshatra: string, pada: number, rashiIndex: number, moonLongitude?: number): PersonInput => ({ nakshatra, pada, rashiIndex, moonLongitude });
  it('Vashya splits Sagittarius and Capricorn at 15°', () => {
    expect(vashyaGroup(8 * 30 + 14.9)).toBe('Manava');
    expect(vashyaGroup(8 * 30 + 15.1)).toBe('Chatushpada');
    expect(vashyaGroup(9 * 30 + 14.9)).toBe('Chatushpada');
    expect(vashyaGroup(9 * 30 + 15.1)).toBe('Jalachara');
  });
  it('Gana is directional (groom row × bride column)', () => {
    const g = (a: PersonInput, b: PersonInput) => calculateGunaMilan(a, b).kootas.find(x => x.key === 'gana')!.score;
    expect(g(P('Ashwini', 1, 0), P('Bharani', 1, 0))).toBe(6); // groom Deva × bride Manushya
    expect(g(P('Bharani', 1, 0), P('Ashwini', 1, 0))).toBe(5); // groom Manushya × bride Deva
    expect(g(P('Ashwini', 1, 0), P('Krittika', 1, 0))).toBe(0); // groom Deva × bride Rakshasa
    expect(g(P('Krittika', 1, 0), P('Ashwini', 1, 0))).toBe(1); // groom Rakshasa × bride Deva
  });
  it('Yoni uses graded tiers, including AstroSage-observed cells', () => {
    expect(yoniPoints('Elephant', 'Tiger')).toBe(1); // AstroSage P1×P2
    expect(yoniPoints('Hare', 'Tiger')).toBe(1);     // AstroSage Y3×P2
    expect(yoniPoints('Monkey', 'Rat')).toBe(2);     // AstroSage Y1×P3
    expect(yoniPoints('Sheep', 'Rat')).toBe(3);      // AstroSage P9×P3
    expect(yoniPoints('Horse', 'Snake')).toBe(2);    // AstroSage P6×P8
    expect(yoniPoints('Cat', 'Rat')).toBe(0);        // sworn enemies
  });
});

describe('Matchmaking guards (M1, M8)', () => {
  it('rejects a birth date in the future', async () => {
    const p = { ...params('P3', 'A'), ...params('P4', 'B'), yB: '2099' };
    const res = await GET(new Request('http://localhost/api/kundali-match?' + new URLSearchParams(p)));
    expect(res.status).toBe(400);
  });
  it('under-18 → warning and no marriage-timing windows', async () => {
    const p = { ...params('P3', 'A'), yB: '2020', mB: '3', dB: '10', hB: '9', minB: '15', latB: '12.9716', lonB: '77.5946', tzidB: 'Asia/Kolkata' };
    const j = await (await GET(new Request('http://localhost/api/kundali-match?' + new URLSearchParams(p)))).json();
    expect(j.warnings.minor).toBe(true);
    expect(j.timing.overlaps).toEqual([]);
    expect(j.timing.personA.windows).toEqual([]);
    expect(JSON.stringify(j.synthesis)).not.toMatch(/marriage period/);
  });
  it('the same person entered twice is flagged', async () => {
    const j = await (await GET(new Request('http://localhost/api/kundali-match?' + new URLSearchParams({ ...params('P3', 'A'), ...params('P3', 'B') })))).json();
    expect(j.warnings.samePerson).toBe(true);
    expect(j.warnings.samePersonNote).toMatch(/same person/);
  });
});

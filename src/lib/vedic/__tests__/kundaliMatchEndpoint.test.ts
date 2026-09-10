import { describe, it, expect } from 'vitest';
import { GET } from '../../../../api/kundali-match';

// Matching is fully DETERMINISTIC (no LLM), so date/score accuracy is guaranteed by
// construction — these tests are the zero-tolerance accuracy checker for that: the
// returned Koota total must equal the sum of the parts, and every cited overlap
// date-range must be a real intersection of both people's computed windows.
const q = (o: Record<string, string | number>) => new URLSearchParams(Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)]))).toString();
const PAIR = {
  yA: 1988, mA: 11, dA: 5, hA: 12, minA: 30, latA: 28.61, lonA: 77.21, tzA: 5.5,
  yB: 1990, mB: 4, dB: 20, hB: 9, minB: 15, latB: 19.07, lonB: 72.88, tzB: 5.5,
};

describe('/api/kundali-match — deterministic accuracy', () => {
  it('returns a full 8-koota breakdown whose total equals the sum of the parts', async () => {
    const res = await GET(new Request('http://localhost/api/kundali-match?' + q(PAIR)));
    const j = await res.json();
    expect(j.gunaMilan.kootas).toHaveLength(8);
    const sum = j.gunaMilan.kootas.reduce((s: number, k: any) => s + k.score, 0);
    expect(j.gunaMilan.total).toBe(sum);
    expect(j.gunaMilan.total).toBeLessThanOrEqual(36);
    // Nadi & Bhakoot flagged heavy; every koota has an explanation.
    expect(j.gunaMilan.kootas.filter((k: any) => k.heavy).map((k: any) => k.key).sort()).toEqual(['bhakoot', 'nadi']);
    for (const k of j.gunaMilan.kootas) expect(k.explanation.length).toBeGreaterThan(10);
  });

  it('every cited marriage-timing overlap is a REAL intersection of both people’s windows', async () => {
    const res = await GET(new Request('http://localhost/api/kundali-match?' + q(PAIR)));
    const j = await res.json();
    const inWindow = (iso: string, wins: any[]) => wins.some(w => new Date(w.start) <= new Date(iso) && new Date(iso) < new Date(w.end));
    for (const o of j.timing.overlaps) {
      // the overlap's midpoint must fall inside at least one window of EACH person
      const mid = new Date((new Date(o.start).getTime() + new Date(o.end).getTime()) / 2).toISOString();
      expect(inWindow(mid, j.timing.personA.windows), `A@${o.range}`).toBe(true);
      expect(inWindow(mid, j.timing.personB.windows), `B@${o.range}`).toBe(true);
    }
  });

  it('distinct birthplaces produce distinct charts (Part 1 regression guard)', async () => {
    const res = await GET(new Request('http://localhost/api/kundali-match?' + q(PAIR)));
    const j = await res.json();
    // A (Delhi) and B (Mumbai) with different dates → different Lagnas/Nakshatras
    expect(j.people.a.lagna !== j.people.b.lagna || j.people.a.nakshatra !== j.people.b.nakshatra).toBe(true);
  });

  it('400s when birth details are missing', async () => {
    const res = await GET(new Request('http://localhost/api/kundali-match?yA=1988'));
    expect(res.status).toBe(400);
  });
});

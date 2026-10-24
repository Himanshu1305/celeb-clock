/**
 * Offline tests for the weekly drift check (scripts/golden/driftCheck.ts). The live bornclock.com
 * API cannot be reached from CI sandboxes, so "live" is a mocked fetch here: either this checkout's
 * own handlers (a faithful stand-in for production) or a tampered / failing response.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { runDrift, renderReport, localFetch } from '../golden/driftCheck';
import { REF_DATE } from '../golden/compareGolden';

const asLive = (tamper?: (path: string, q: URLSearchParams, body: any) => any) => {
  const seen: Array<{ url: string; ua: string | null }> = [];
  const f = async (url: string, init?: RequestInit) => {
    seen.push({ url, ua: new Headers(init?.headers).get('User-Agent') });
    const u = new URL(url);
    const res = await localFetch(`http://localhost${u.pathname}${u.search}`);
    if (!tamper) return res;
    const body = tamper(u.pathname, u.searchParams, await res.json());
    return new Response(JSON.stringify(body), { status: 200 });
  };
  return { f, seen };
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(REF_DATE);
  vi.stubEnv('SUPABASE_URL', '');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

describe('weekly drift check (mocked live API)', () => {
  it('live == reference → no drift; calls the three production endpoints on bornclock.com', async () => {
    const { f, seen } = asLive();
    const r = await runDrift({ sources: ['live'], fetchImpl: f as any });
    expect(r.unreachable).toEqual([]);
    expect(r.drift.map(d => d.message)).toEqual([]);
    expect(r.checks).toBe(20 * 2 + 7);
    const paths = new Set(seen.map(s => new URL(s.url).origin + new URL(s.url).pathname));
    expect([...paths].sort()).toEqual(['https://bornclock.com/api/kundali', 'https://bornclock.com/api/kundali-match', 'https://bornclock.com/api/sade-sati']);
    expect(seen.every(s => s.ua?.startsWith('BornClock-drift-check'))).toBe(true);
    expect(renderReport(r)).toMatch(/^## No astrology drift/);
  }, 120_000);

  it('a changed nakshatra and a changed Guna score are reported with a clear message and a table', async () => {
    const { f } = asLive((path, q, body) => {
      if (path === '/api/kundali' && q.get('y') === '1990' && q.get('d') === '15') body.nakshatra = { ...body.nakshatra, nakshatra: 'Magha', pada: 4 };
      if (path === '/api/kundali-match' && q.get('yA') === '1996') body.gunaMilan.total = 15;
      return body;
    });
    const r = await runDrift({ sources: ['live'], fetchImpl: f as any });
    expect(r.drift.map(d => d.message)).toEqual([
      'P3 Moon nakshatra changed: expected Purva Phalguni 2, got Magha 4',
      'P1×P2 Guna Milan total (AstroSage) changed: expected 12.5, got 15',
    ]);
    const md = renderReport(r);
    expect(md).toMatch(/^## Astrology drift detected/);
    expect(md).toContain('| live | P3 | kundali | nakshatra | Purva Phalguni 2 | Magha 4 |');
    expect(md).toContain('| live | P1×P2 | kundali-match | total | 12.5 | 15 |');
  }, 120_000);

  it('an unreachable live API is reported (never silently passes)', async () => {
    const f = async () => new Response('Service Unavailable', { status: 503 });
    const r = await runDrift({ sources: ['live'], fetchImpl: f as any });
    expect(r.checks).toBe(0);
    expect(r.unreachable).toHaveLength(47);
    expect(r.unreachable[0].error).toMatch(/HTTP 503/);
    expect(renderReport(r)).toMatch(/Could not check \(47\)/);
  }, 60_000);

  it('checked years after the reference date (Mar 2029) the code on main still matches — "current" values move with time', async () => {
    vi.setSystemTime(new Date('2029-03-01T06:00:00Z'));
    const r = await runDrift({ sources: ['main'] });
    expect(r.unreachable).toEqual([]);
    expect(r.drift.map(d => d.message)).toEqual([]);
    expect(r.known).toEqual([]); // G15 polar Lagna (audit B7) fixed — checked normally now
  }, 120_000);
});

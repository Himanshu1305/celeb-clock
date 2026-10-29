import { describe, it, expect, afterEach } from 'vitest';
import worker from '../../functions/_worker';
import { opsSelfFetch } from '../ops-monitor';
import { geoFromRequest } from '../geo';

// Oct 2026 ops alerts: the monitor fetched https://bornclock.usdvisionai.workers.dev/… from
// inside the Worker (522 — a Worker can't reach itself over HTTP), and expected a
// pre-hardening "Report not found" from create-order. The monitor now calls the Worker's own
// routes in-process, and the country lookup moved from ipapi.co (429s) to Cloudflare's cf.country.
const env = {
  ASSETS: {
    fetch: async (req: Request) => new URL(req.url).pathname === '/daily/manifest.json'
      ? new Response('{"firstDate":"2026-10-25","lastDate":"2027-11-29","generatedAt":"x"}', { headers: { 'content-type': 'application/json' } })
      : new Response('<html></html>', { headers: { 'content-type': 'text/html' } }),
  },
};

afterEach(() => { delete (globalThis as any).__bcSelfFetch; });

describe('ops self-checks run in-process', () => {
  it('a request through the Worker registers the in-process self fetch', async () => {
    await worker.fetch(new Request('https://bornclock.com/accuracy/'), env as never, {});
    expect(typeof (globalThis as any).__bcSelfFetch).toBe('function');
  });

  it('opsSelfFetch reads the daily manifest through the Worker (no HTTP to workers.dev)', async () => {
    await worker.fetch(new Request('https://bornclock.com/'), env as never, {});
    const r = await opsSelfFetch('https://unreachable.invalid', '/daily/manifest.json');
    expect(r.status).toBe(200);
    expect((await r.json()).lastDate).toBe('2027-11-29');
  });

  it('create-order answers the unauthenticated sentinel with 401 "Please sign in"', async () => {
    // No network: with no Bearer token create-order stops at the sign-in gate before any query.
    process.env.SUPABASE_URL ||= 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY ||= 'test-key';
    await worker.fetch(new Request('https://bornclock.com/'), env as never, {});
    const r = await opsSelfFetch('https://unreachable.invalid', '/api/create-order', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: 'birthday_report', report_slug: 'zzzzzzzz', userId: 'ops-monitor', currency: 'INR' }),
    });
    expect(r.status).toBe(401);
    expect(await r.text()).toContain('Please sign in');
  });
});

describe('/api/geo (Cloudflare country, replaces ipapi.co)', () => {
  const withCf = (country?: string) => Object.assign(new Request('https://bornclock.com/api/geo'), { cf: country ? { country } : undefined });
  it('returns ISO code and English name', () => {
    expect(geoFromRequest(withCf('IN'))).toEqual({ country_code: 'IN', country_name: 'India' });
    expect(geoFromRequest(withCf('US')).country_name).toBe('United States');
  });
  it('returns nulls for unknown / Tor / missing country', () => {
    for (const c of [undefined, 'XX', 'T1']) expect(geoFromRequest(withCf(c)).country_code).toBeNull();
  });
  it('is routed by the Worker', async () => {
    const r = await worker.fetch(withCf('GB'), env as never, {});
    expect(await r.json()).toEqual({ country_code: 'GB', country_name: 'United Kingdom' });
  });
});

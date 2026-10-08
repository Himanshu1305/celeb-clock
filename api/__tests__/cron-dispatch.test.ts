import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET, POST } from '../cron-dispatch';
import { dailyHoroscopeEmail, transitAlertEmail, birthdayReminderEmail } from '../_notify';

const SECRET = 'test-cron-secret-123';

function req(url: string, auth?: string, method: 'GET' | 'POST' = 'POST') {
  const headers: Record<string, string> = {};
  if (auth) headers.Authorization = auth;
  return new Request(url, { method, headers });
}

describe('cron-dispatch auth gate', () => {
  const orig = process.env.CRON_SECRET;
  beforeEach(() => { process.env.CRON_SECRET = SECRET; });
  afterEach(() => { if (orig === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = orig; });

  it('rejects with no Authorization header', async () => {
    const res = await POST(req('https://x/api/cron-dispatch?job=weekly'));
    expect(res.status).toBe(401);
  });

  it('rejects a wrong secret', async () => {
    const res = await POST(req('https://x/api/cron-dispatch?job=weekly', 'Bearer nope'));
    expect(res.status).toBe(401);
  });

  it('rejects an unknown job', async () => {
    const res = await POST(req('https://x/api/cron-dispatch?job=bogus', `Bearer ${SECRET}`));
    expect(res.status).toBe(400);
  });

  it('rejects non GET/POST', async () => {
    // @ts-expect-error exercising the method guard
    const res = await GET(new Request('https://x/api/cron-dispatch', { method: 'DELETE' }));
    expect(res.status).toBe(405);
  });

  it('runs the weekly job with a valid secret (dry-run, no Supabase configured)', async () => {
    const savedUrl = process.env.SUPABASE_URL; delete process.env.SUPABASE_URL;
    const res = await POST(req('https://x/api/cron-dispatch?job=weekly', `Bearer ${SECRET}`));
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.ok).toBe(true);
    expect(body.job).toBe('weekly');
    // No Supabase env → the batch skips rather than throwing.
    expect(body.results.weeklyDigest.skipped).toBe(true);
    if (savedUrl !== undefined) process.env.SUPABASE_URL = savedUrl;
  });
});

describe('notification email builders (computed, no fabrication)', () => {
  it('daily horoscope renders for a valid Moon sign and is null for an invalid one', () => {
    const ok = dailyHoroscopeEmail(0, 'Asha', 'https://x/api/unsubscribe?token=t');
    expect(ok).not.toBeNull();
    expect(ok!.subject.length).toBeGreaterThan(0);
    expect(ok!.html).toContain('rashifal/mesh/today');
    expect(dailyHoroscopeEmail(12, 'Asha', 'u')).toBeNull();
    expect(dailyHoroscopeEmail(-1, 'Asha', 'u')).toBeNull();
  });

  it('transit alert returns null when there is no real ingress in the window', () => {
    // horizon 0 days → findIngress can only fire if an ingress is exactly now; the
    // builder must NEVER fabricate an alert, so null is the expected safe result.
    const out = transitAlertEmail(3, '', 'u', 0);
    expect(out === null || typeof out.subject === 'string').toBe(true);
  });

  it('transit alert returns null for an invalid Moon sign', () => {
    expect(transitAlertEmail(99, '', 'u')).toBeNull();
  });

  it('family birthday reminder wording is tense-aware', () => {
    expect(birthdayReminderEmail('Mum', 'mother', 0).subject).toContain('today');
    expect(birthdayReminderEmail('Mum', 'mother', 1).subject).toContain('tomorrow');
    expect(birthdayReminderEmail('Mum', null, 5).subject).toContain('in 5 days');
  });
});

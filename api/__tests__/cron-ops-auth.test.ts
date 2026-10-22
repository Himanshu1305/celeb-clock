import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST as dispatch } from '../cron-dispatch';
import { POST as opsMonitor } from '../ops-monitor';
import { POST as invoiceSweep } from '../invoice-sweep';
import { POST as opsDigest } from '../ops-digest';

// 2026-10-23: the ops endpoints used to be callable by anyone. They now require
// the CRON_SECRET bearer, and all scheduled work runs through /api/cron-dispatch.
const SECRET = 'test-cron-secret-456';
const post = (url: string, auth?: string) =>
  new Request(url, { method: 'POST', headers: auth ? { Authorization: auth } : {} });

describe('ops endpoints require the cron secret', () => {
  const orig = process.env.CRON_SECRET;
  beforeEach(() => { process.env.CRON_SECRET = SECRET; });
  afterEach(() => { if (orig === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = orig; });

  for (const [name, fn] of [['ops-monitor', opsMonitor], ['invoice-sweep', invoiceSweep], ['ops-digest', opsDigest]] as const) {
    it(`${name}: 401 without Authorization`, async () => {
      expect((await fn(post(`https://x/api/${name}`))).status).toBe(401);
    });
    it(`${name}: 401 with a wrong secret`, async () => {
      expect((await fn(post(`https://x/api/${name}`, 'Bearer wrong'))).status).toBe(401);
    });
  }

  it('fails closed when CRON_SECRET is not configured', async () => {
    delete process.env.CRON_SECRET;
    expect((await opsDigest(post('https://x/api/ops-digest', 'Bearer '))).status).toBe(401);
  });
});

describe('cron-dispatch digest job', () => {
  const orig = process.env.CRON_SECRET;
  beforeEach(() => { process.env.CRON_SECRET = SECRET; });
  afterEach(() => { if (orig === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = orig; });

  it('accepts job=digest and calls ops-digest in-process (authorised)', async () => {
    const res = await dispatch(post('https://x/api/cron-dispatch?job=digest', `Bearer ${SECRET}`));
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.job).toBe('digest');
    expect(body.results).toHaveProperty('ops-digest');
    // The in-process call must carry the secret: a 401 body would mean it didn't.
    expect(body.results['ops-digest']?.error).not.toBe('Unauthorized');
  });
});

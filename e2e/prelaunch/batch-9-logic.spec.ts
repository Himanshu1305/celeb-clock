/**
 * Suite — batch-9-logic.spec.ts  (pure logic: P2 stale-chunk retry, P7 life-expectancy facts)
 * No browser/servers.
 */
import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { loadWithReload, isChunkLoadError, type ReloadDeps } from '../../src/lib/lazyWithRetry';
import { POST as contactPost } from '../../api/contact';
import { INDIA_LIFE_EXPECTANCY } from '../../src/data/lifeExpectancyFacts';

const req = (body: unknown) => new Request('https://x/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

function fakeDeps() {
  let flag = false; let reloads = 0;
  const deps: ReloadDeps = {
    getFlag: () => flag,
    setFlag: () => { flag = true; },
    clearFlag: () => { flag = false; },
    reload: () => { reloads += 1; },
  };
  return { deps, get flag() { return flag; }, get reloads() { return reloads; } };
}
const chunkErr = () => { const e = new Error('Failed to fetch dynamically imported module: /assets/Page-abc123.js'); return e; };
/** Resolves 'pending' if the promise neither resolves nor rejects within ms. */
async function settleOrPending<T>(p: Promise<T>, ms = 150): Promise<'resolved' | 'rejected' | 'pending'> {
  return Promise.race([
    p.then(() => 'resolved' as const, () => 'rejected' as const),
    new Promise<'pending'>(r => setTimeout(() => r('pending'), ms)),
  ]);
}

test.describe('P2 — stale-chunk lazy retry', () => {
  test('isChunkLoadError recognises stale dynamic-import failures', () => {
    expect(isChunkLoadError(chunkErr())).toBe(true);
    expect(isChunkLoadError(new Error('Loading chunk 42 failed'))).toBe(true);
    expect(isChunkLoadError(Object.assign(new Error('x'), { name: 'ChunkLoadError' }))).toBe(true);
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false);
  });

  test('first chunk failure → sets guard + reloads ONCE, promise hangs (nothing renders)', async () => {
    const h = fakeDeps();
    const outcome = await settleOrPending(loadWithReload(() => Promise.reject(chunkErr()), h.deps));
    expect(outcome).toBe('pending');    // never resolves/rejects — hangs until reload navigates away
    expect(h.reloads).toBe(1);          // reloaded exactly once
    expect(h.flag).toBe(true);          // guard set
  });

  test('loop-guard: second failure (guard already set) → rethrows, NO second reload', async () => {
    const h = fakeDeps();
    h.deps.setFlag();                   // simulate we already reloaded this session
    await expect(loadWithReload(() => Promise.reject(chunkErr()), h.deps)).rejects.toThrow(/dynamically imported/);
    expect(h.reloads).toBe(0);          // did NOT reload again
  });

  test('successful load clears the guard', async () => {
    const h = fakeDeps();
    h.deps.setFlag();
    const mod = await loadWithReload(() => Promise.resolve({ default: 'ok' }), h.deps);
    expect(mod).toEqual({ default: 'ok' });
    expect(h.flag).toBe(false);         // guard cleared on success
  });

  test('non-chunk error is not reloaded (surfaced to the boundary)', async () => {
    const h = fakeDeps();
    await expect(loadWithReload(() => Promise.reject(new Error('real bug')), h.deps)).rejects.toThrow('real bug');
    expect(h.reloads).toBe(0);
  });
});

test.describe('P9 — /api/contact handler', () => {
  test('honeypot filled → silently dropped (200 ok, no email attempted)', async () => {
    const res = await contactPost(req({ name: 'Bot', email: 'bot@spam.com', message: 'buy now', website: 'http://spam' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });   // dropped BEFORE any send
  });
  test('invalid email → 400 with field:email (no send)', async () => {
    const res = await contactPost(req({ name: 'Ada', email: 'not-an-email', message: 'hello there' }));
    expect(res.status).toBe(400);
    expect((await res.json()).field).toBe('email');
  });
  test('missing message → 400 with field:message', async () => {
    const res = await contactPost(req({ name: 'Ada', email: 'ada@bornclock-test.invalid', message: '' }));
    expect(res.status).toBe(400);
    expect((await res.json()).field).toBe('message');
  });
  test('GET is rejected', async () => {
    const res = await contactPost(new Request('https://x/api/contact', { method: 'GET' }));
    expect(res.status).toBe(405);
  });
});

test.describe('FIX 3 — /api/contact send verification (delivery)', () => {
  const realFetch = globalThis.fetch;
  const sendReq = (ip: string) => new Request('https://x/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip },
    body: JSON.stringify({ name: 'Ada', email: 'ada@bornclock-test.invalid', message: 'A real question about my report.' }),
  });
  test.afterEach(() => { globalThis.fetch = realFetch; delete process.env.RESEND_API_KEY; delete process.env.ADMIN_EMAIL; });

  test('Resend 200 → {ok:true}; TO=ADMIN_EMAIL, reply_to=submitter, FROM stays hello@', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    process.env.ADMIN_EMAIL = 'founder@real-inbox.test';
    let captured: { url: string; body: Record<string, string> } | undefined;
    globalThis.fetch = (async (url: string, init: RequestInit) => {
      captured = { url: String(url), body: JSON.parse(String(init.body)) };
      return new Response(JSON.stringify({ id: 'msg_abc123' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }) as typeof fetch;
    const res = await contactPost(sendReq('10.0.0.1'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(captured!.url).toContain('api.resend.com/emails');
    expect(captured!.body.to).toBe('founder@real-inbox.test');        // delivered to founder, NOT unverified hello@ inbound
    expect(captured!.body.reply_to).toBe('ada@bornclock-test.invalid'); // founder can reply straight to the user
    expect(captured!.body.from).toContain('hello@bornclock.com');       // verified sender unchanged
  });

  test('Resend 5xx → 502 error, NO false success', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    globalThis.fetch = (async () => new Response('upstream boom', { status: 500 })) as typeof fetch;
    const res = await contactPost(sendReq('10.0.0.2'));
    expect(res.status).toBe(502);
    const j = await res.json();
    expect(j.ok).toBeUndefined();
    expect(j.error).toMatch(/could not send/i);
  });

  test('Resend 4xx (e.g. domain not verified) → 502 error, NO false success', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    globalThis.fetch = (async () => new Response(JSON.stringify({ message: 'domain not verified' }), { status: 422 })) as typeof fetch;
    const res = await contactPost(sendReq('10.0.0.3'));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toMatch(/could not send/i);
  });
});

test.describe('FIX 2 — prerendered homepage carries the science-card row', () => {
  // The bug was a stale edge-cached shell WITHOUT the row. The prerendered artifact (source of
  // truth for what gets deployed) must always contain the row + all three card hrefs; if this
  // fails, the homepage will ship without the row regardless of edge caching.
  test('dist/index.html contains the row section and all three card hrefs', () => {
    let html: string;
    try { html = readFileSync(resolve(process.cwd(), 'dist/index.html'), 'utf8'); }
    catch { test.skip(true, 'dist/index.html not built — run after `npm run build`'); return; }
    expect(html).toContain('science-card-row');
    for (const href of ['/biological-age', '/country-comparison', '/energy-forecast']) {
      expect(html).toContain(`href="${href}"`);
    }
  });
});

test.describe('P7 — India life-expectancy constant', () => {
  test('single sourced UN WPP 2024 value', () => {
    expect(INDIA_LIFE_EXPECTANCY.overall).toBe(72);
    expect(INDIA_LIFE_EXPECTANCY.source).toMatch(/UN World Population Prospects 2024/);
    expect(INDIA_LIFE_EXPECTANCY.refYear).toBe(2024);
    expect(INDIA_LIFE_EXPECTANCY.historical1947).toBe(32);
  });
});

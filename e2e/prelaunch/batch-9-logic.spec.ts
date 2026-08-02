/**
 * Suite — batch-9-logic.spec.ts  (pure logic: P2 stale-chunk retry, P7 life-expectancy facts)
 * No browser/servers.
 */
import { test, expect } from '@playwright/test';
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

test.describe('P7 — India life-expectancy constant', () => {
  test('single sourced UN WPP 2024 value', () => {
    expect(INDIA_LIFE_EXPECTANCY.overall).toBe(72);
    expect(INDIA_LIFE_EXPECTANCY.source).toMatch(/UN World Population Prospects 2024/);
    expect(INDIA_LIFE_EXPECTANCY.refYear).toBe(2024);
    expect(INDIA_LIFE_EXPECTANCY.historical1947).toBe(32);
  });
});

import { describe, it, expect, afterEach } from 'vitest';
import { geminiKey } from '../_gemini';

const saved = { n: process.env.NEW_GEMINI_API_KEY, o: process.env.GEMINI_API_KEY };
afterEach(() => {
  if (saved.n === undefined) delete process.env.NEW_GEMINI_API_KEY; else process.env.NEW_GEMINI_API_KEY = saved.n;
  if (saved.o === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = saved.o;
});

describe('geminiKey — NEW_GEMINI_API_KEY first, GEMINI_API_KEY as fallback', () => {
  it('uses the new key when both are set', () => {
    process.env.NEW_GEMINI_API_KEY = 'new'; process.env.GEMINI_API_KEY = 'old';
    expect(geminiKey()).toBe('new');
  });
  it('falls back to the old key', () => {
    delete process.env.NEW_GEMINI_API_KEY; process.env.GEMINI_API_KEY = 'old';
    expect(geminiKey()).toBe('old');
  });
  it('ignores a blank new key', () => {
    process.env.NEW_GEMINI_API_KEY = '  '; process.env.GEMINI_API_KEY = 'old';
    expect(geminiKey()).toBe('old');
  });
  it('is undefined when neither is set', () => {
    delete process.env.NEW_GEMINI_API_KEY; delete process.env.GEMINI_API_KEY;
    expect(geminiKey()).toBeUndefined();
  });
});

import { vi } from 'vitest';
import { geminiFetch } from '../_gemini';

describe('geminiFetch — falls back to the old key when Google rejects the new one', () => {
  afterEach(() => { vi.unstubAllGlobals(); });
  it('retries with GEMINI_API_KEY after a failure on NEW_GEMINI_API_KEY', async () => {
    process.env.NEW_GEMINI_API_KEY = 'new'; process.env.GEMINI_API_KEY = 'old';
    const seen: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (_u: string, init: RequestInit) => {
      const k = (init.headers as Record<string, string>)['x-goog-api-key']; seen.push(k);
      return k === 'new' ? new Response('{"error":{"status":"UNAVAILABLE"}}', { status: 503 }) : new Response('{"ok":1}', { status: 200 });
    }));
    const r = await geminiFetch('https://x', '{}');
    expect(r.status).toBe(200);
    expect(seen).toEqual(['new', 'old']);
  });
  it('throws with the status, key name and Google message when every key fails', async () => {
    process.env.NEW_GEMINI_API_KEY = 'new'; delete process.env.GEMINI_API_KEY;
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"error":{"message":"denied"}}', { status: 403 })));
    await expect(geminiFetch('https://x', '{}')).rejects.toThrow(/403 \[NEW_GEMINI_API_KEY\].*denied/);
  });
  it('uses one call when the new key works', async () => {
    process.env.NEW_GEMINI_API_KEY = 'new'; process.env.GEMINI_API_KEY = 'old';
    const f = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', f);
    await geminiFetch('https://x', '{}');
    expect(f).toHaveBeenCalledTimes(1);
  });
});

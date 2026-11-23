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

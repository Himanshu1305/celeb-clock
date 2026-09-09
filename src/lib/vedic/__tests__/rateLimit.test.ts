import { describe, it, expect } from 'vitest';
import {
  checkRateLimit, recordQuestion, currentRecord, isOverLimit, limitForTier,
  limitReachedMessage, FREE_DAILY_LIMIT, PAID_DAILY_LIMIT, type UsageRecord,
} from '../rateLimit';

const DAY = new Date(2026, 0, 15, 10, 0, 0);
const rec = (count: number, day = '2026-01-15'): UsageRecord => ({ day, count });

describe('rateLimit — tier limits', () => {
  it('free = 3/day, paid = 15/day', () => {
    expect(limitForTier('free')).toBe(FREE_DAILY_LIMIT);
    expect(FREE_DAILY_LIMIT).toBe(3);
    expect(limitForTier('paid')).toBe(PAID_DAILY_LIMIT);
    expect(PAID_DAILY_LIMIT).toBe(15);
  });
});

describe('rateLimit — free tier allows exactly 3 then blocks', () => {
  it('allows questions 1..3, blocks the 4th', () => {
    let r: UsageRecord | null = null;
    for (let i = 1; i <= 3; i++) {
      const s = checkRateLimit(r, 'free', DAY);
      expect(s.allowed).toBe(true);
      expect(s.remaining).toBe(3 - (i - 1));
      r = recordQuestion(r, DAY);
    }
    const blocked = checkRateLimit(r, 'free', DAY);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.used).toBe(3);
  });
});

describe('rateLimit — paid tier allows exactly 15 then blocks', () => {
  it('allows 15, blocks the 16th', () => {
    let r: UsageRecord | null = null;
    for (let i = 0; i < 15; i++) { expect(checkRateLimit(r, 'paid', DAY).allowed).toBe(true); r = recordQuestion(r, DAY); }
    expect(checkRateLimit(r, 'paid', DAY).allowed).toBe(false);
  });
});

describe('rateLimit — resets at day boundary', () => {
  it('a record from a previous day is treated as fresh (0 used) today', () => {
    const yesterday = rec(3, '2026-01-14');
    const s = checkRateLimit(yesterday, 'free', DAY); // DAY is 2026-01-15
    expect(s.allowed).toBe(true);
    expect(s.used).toBe(0);
    expect(currentRecord(yesterday, DAY)).toEqual({ day: '2026-01-15', count: 0 });
  });
});

describe('rateLimit — server-side guard + messages', () => {
  it('isOverLimit matches the tier cap', () => {
    expect(isOverLimit(3, 'free')).toBe(true);
    expect(isOverLimit(2, 'free')).toBe(false);
    expect(isOverLimit(15, 'paid')).toBe(true);
    expect(isOverLimit(14, 'paid')).toBe(false);
  });
  it('limit-reached message is clear and mentions when it refreshes', () => {
    expect(limitReachedMessage('free')).toMatch(/3 free questions/i);
    expect(limitReachedMessage('free')).toMatch(/refresh tomorrow/i);
    expect(limitReachedMessage('paid')).toMatch(/15 questions/i);
  });
  it('corrupted/negative counts normalise safely', () => {
    expect(currentRecord({ day: '2026-01-15', count: -5 } as UsageRecord, DAY)).toEqual({ day: '2026-01-15', count: 0 });
    expect(currentRecord(null, DAY)).toEqual({ day: '2026-01-15', count: 0 });
  });
});

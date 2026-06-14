import { describe, it, expect } from 'vitest';

// ── Pure function under test ───────────────────────────────────────────────────
// Parses URL slugs like "january-15" or "december-31" into {month, day}.
// Mirrors the logic used by BirthdayDate.tsx to parse route params.

const MONTH_MAP: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9,
  oct: 10, nov: 11, dec: 12,
};

export function parseBirthdaySlug(slug: string): { month: number; day: number } | null {
  if (!slug) return null;
  const parts = slug.toLowerCase().split('-');
  if (parts.length < 2) return null;

  const monthName = parts[0];
  const day = parseInt(parts[1], 10);

  const month = MONTH_MAP[monthName];
  if (!month || isNaN(day) || day < 1 || day > 31) return null;

  return { month, day };
}

// ─────────────────────────────────────────────────────────────────────────────
// BD1–BD8  Birthday slug parsing tests
// ─────────────────────────────────────────────────────────────────────────────

describe('BD1–BD8 — parseBirthdaySlug', () => {
  it('BD1: "january-15" → {month:1, day:15}', () => {
    expect(parseBirthdaySlug('january-15')).toEqual({ month: 1, day: 15 });
  });

  it('BD2: "december-31" → {month:12, day:31}', () => {
    expect(parseBirthdaySlug('december-31')).toEqual({ month: 12, day: 31 });
  });

  it('BD3: "march-1" → {month:3, day:1}', () => {
    expect(parseBirthdaySlug('march-1')).toEqual({ month: 3, day: 1 });
  });

  it('BD4: "feb-14" (short form) → {month:2, day:14}', () => {
    expect(parseBirthdaySlug('feb-14')).toEqual({ month: 2, day: 14 });
  });

  it('BD5: empty string → null', () => {
    expect(parseBirthdaySlug('')).toBeNull();
  });

  it('BD6: "invalid-slug" → null (unknown month)', () => {
    expect(parseBirthdaySlug('invalid-slug')).toBeNull();
  });

  it('BD7: "january-0" → null (day < 1)', () => {
    expect(parseBirthdaySlug('january-0')).toBeNull();
  });

  it('BD8: "january-32" → null (day > 31)', () => {
    expect(parseBirthdaySlug('january-32')).toBeNull();
  });
});

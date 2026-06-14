import { describe, it, expect } from 'vitest';

// ── Pure function under test ───────────────────────────────────────────────────
// Returns the Chinese zodiac animal for a given birth year.
// 2020 was the year of the Rat (index 0 in the 12-year cycle).

const CHINESE_ZODIAC_ANIMALS = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig',
] as const;

export type ChineseZodiacAnimal = typeof CHINESE_ZODIAC_ANIMALS[number];

export function getChineseZodiac(year: number): ChineseZodiacAnimal {
  // 2020 = Rat (index 0). Adding 1200 ensures modulo stays positive for ancient years.
  const index = ((year - 2020) % 12 + 12) % 12;
  return CHINESE_ZODIAC_ANIMALS[index];
}

// ─────────────────────────────────────────────────────────────────────────────
// CZ1–CZ8  Chinese zodiac tests
// ─────────────────────────────────────────────────────────────────────────────

describe('CZ1–CZ8 — getChineseZodiac', () => {
  it('CZ1: 2020 → Rat', () => {
    expect(getChineseZodiac(2020)).toBe('Rat');
  });

  it('CZ2: 2021 → Ox', () => {
    expect(getChineseZodiac(2021)).toBe('Ox');
  });

  it('CZ3: 2022 → Tiger', () => {
    expect(getChineseZodiac(2022)).toBe('Tiger');
  });

  it('CZ4: 2023 → Rabbit', () => {
    expect(getChineseZodiac(2023)).toBe('Rabbit');
  });

  it('CZ5: 2024 → Dragon', () => {
    expect(getChineseZodiac(2024)).toBe('Dragon');
  });

  it('CZ6: 1984 → Rat (1984 = 2020 − 9 complete cycles)', () => {
    expect(getChineseZodiac(1984)).toBe('Rat');
  });

  it('CZ7: 1990 → Horse', () => {
    expect(getChineseZodiac(1990)).toBe('Horse');
  });

  it('CZ8: 2000 → Dragon', () => {
    expect(getChineseZodiac(2000)).toBe('Dragon');
  });
});

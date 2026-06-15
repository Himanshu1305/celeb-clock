import { describe, it, expect } from 'vitest';
import { getChineseZodiac, getChineseZodiacAnimal } from '../ChineseZodiacService';

describe('getChineseZodiacAnimal — year-based', () => {
  it('CZS1: 2020 → Rat', () => expect(getChineseZodiacAnimal(2020)).toBe('Rat'));
  it('CZS2: 2021 → Ox', () => expect(getChineseZodiacAnimal(2021)).toBe('Ox'));
  it('CZS3: 2022 → Tiger', () => expect(getChineseZodiacAnimal(2022)).toBe('Tiger'));
  it('CZS4: 2023 → Rabbit', () => expect(getChineseZodiacAnimal(2023)).toBe('Rabbit'));
  it('CZS5: 2024 → Dragon', () => expect(getChineseZodiacAnimal(2024)).toBe('Dragon'));
  it('CZS6: 2025 → Snake', () => expect(getChineseZodiacAnimal(2025)).toBe('Snake'));
  it('CZS7: 1984 → Rat', () => expect(getChineseZodiacAnimal(1984)).toBe('Rat'));
  it('CZS8: 1990 → Horse', () => expect(getChineseZodiacAnimal(1990)).toBe('Horse'));
});

describe('getChineseZodiac — DOB including Jan/Feb edge cases', () => {
  it('CZS9: born 1990-06-15 → Horse (after CNY Feb 27)', () => {
    const result = getChineseZodiac(new Date('1990-06-15T12:00:00'));
    expect(result.animal).toBe('Horse');
  });

  it('CZS10: born 1990-01-15 → Snake (before CNY Jan 27 1990, belongs to 1989)', () => {
    const result = getChineseZodiac(new Date('1990-01-15T12:00:00'));
    expect(result.animal).toBe('Snake');
    expect(result.year).toBe(1989);
  });

  it('CZS11: born 1990-02-28 → Horse (after CNY Jan 27)', () => {
    const result = getChineseZodiac(new Date('1990-02-28T12:00:00'));
    expect(result.animal).toBe('Horse');
    expect(result.year).toBe(1990);
  });

  it('CZS12: born 2000-01-20 → Rabbit (before CNY Feb 5, belongs to 1999)', () => {
    const result = getChineseZodiac(new Date('2000-01-20T12:00:00'));
    expect(result.animal).toBe('Rabbit');
    expect(result.year).toBe(1999);
  });

  it('CZS13: result has all required fields', () => {
    const result = getChineseZodiac(new Date('1988-01-01T12:00:00'));
    expect(result).toHaveProperty('animal');
    expect(result).toHaveProperty('emoji');
    expect(result).toHaveProperty('element');
    expect(result).toHaveProperty('yin_yang');
    expect(result).toHaveProperty('traits');
    expect(result).toHaveProperty('famous');
    expect(result).toHaveProperty('description');
    expect(result).toHaveProperty('year');
    expect(Array.isArray(result.traits)).toBe(true);
    expect(Array.isArray(result.famous)).toBe(true);
  });

  it('CZS14: element cycles correctly (2024 Dragon is Wood)', () => {
    const result = getChineseZodiac(new Date('2024-06-01T12:00:00'));
    expect(result.element).toBe('Wood');
  });
});

import { describe, it, expect } from 'vitest';
import {
  birthdayNumber, attitudeNumber, chaldeanName, pythagoreanName, reduceKeepingMaster,
} from '../numerologyExtra';

describe('numerologyExtra', () => {
  it('birthday number reduces but keeps master numbers', () => {
    expect(birthdayNumber(7).number).toBe(7);
    expect(birthdayNumber(23).number).toBe(5);   // 2+3
    expect(birthdayNumber(29).number).toBe(11);  // 2+9 = 11 (master kept)
    expect(birthdayNumber(29).isMaster).toBe(true);
    expect(birthdayNumber(31).number).toBe(4);   // 3+1
  });

  it('attitude number = reduce(day + month)', () => {
    // 13 May → 13 + 5 = 18 → 9
    expect(attitudeNumber(13, 5).number).toBe(9);
    // 1 Jan → 1 + 1 = 2
    expect(attitudeNumber(1, 1).number).toBe(2);
  });

  it('reduceKeepingMaster', () => {
    expect(reduceKeepingMaster(38)).toBe(11);
    expect(reduceKeepingMaster(48)).toBe(3);
    expect(reduceKeepingMaster(9)).toBe(9);
  });

  it('Chaldean name uses the classical 1–8 map (no 9 for letters)', () => {
    // "ab" → a=1, b=2 → 3
    expect(chaldeanName('ab').total).toBe(3);
    // Chaldean never assigns 9 to a letter
    const letters = chaldeanName('abcdefghijklmnopqrstuvwxyz').letters;
    expect(letters.every(l => l.value >= 1 && l.value <= 8)).toBe(true);
  });

  it('Pythagorean differs from Chaldean for the same name', () => {
    const name = 'John Smith';
    const c = chaldeanName(name);
    const p = pythagoreanName(name);
    expect(c.root).toBeGreaterThanOrEqual(1);
    expect(p.root).toBeGreaterThanOrEqual(1);
    // The two systems generally disagree (different letter maps).
    expect(c.total).not.toBe(p.total);
  });

  it('ignores non-letters and is case-insensitive', () => {
    expect(chaldeanName('A!b 2').total).toBe(chaldeanName('ab').total);
  });
});

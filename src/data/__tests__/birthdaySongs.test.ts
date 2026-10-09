import { describe, it, expect } from 'vitest';
import { numberOneSong, hasSongData, NUMBER_ONE_RANGES, type NumberOneRange } from '../birthdaySongs';

const SAMPLE: NumberOneRange[] = [
  { from: '1990-11-03', to: '1990-11-09', title: 'Ice Ice Baby', artist: 'Vanilla Ice', chart: 'Billboard Hot 100' },
  { from: '1990-11-10', to: '1990-11-16', title: 'Love Takes Time', artist: 'Mariah Carey', chart: 'Billboard Hot 100' },
];

describe('numberOneSong — honest, data-driven lookup', () => {
  it('ships EMPTY so nothing is ever fabricated for real dates', () => {
    expect(NUMBER_ONE_RANGES.length).toBe(0);
    expect(hasSongData()).toBe(false);
    expect(numberOneSong(new Date('1990-11-05T12:00:00'))).toBeNull();
  });

  it('returns the covering range when a dataset is supplied (inclusive bounds)', () => {
    expect(numberOneSong(new Date('1990-11-05T12:00:00'), SAMPLE)?.title).toBe('Ice Ice Baby');
    expect(numberOneSong(new Date('1990-11-03T12:00:00'), SAMPLE)?.title).toBe('Ice Ice Baby'); // lower bound
    expect(numberOneSong(new Date('1990-11-16T12:00:00'), SAMPLE)?.artist).toBe('Mariah Carey'); // upper bound
  });

  it('returns null for a date outside every range, and for invalid dates', () => {
    expect(numberOneSong(new Date('1985-01-01T12:00:00'), SAMPLE)).toBeNull();
    expect(numberOneSong(new Date('invalid'), SAMPLE)).toBeNull();
  });
});

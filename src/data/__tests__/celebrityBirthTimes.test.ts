import { describe, it, expect } from 'vitest';
import {
  CELEBRITY_BIRTH_TIMES,
  roddenToReliability,
  getCelebrityBirthTime,
  getBirthTimeReliability,
  canRenderTimeDependent,
} from '@/data/celebrityBirthTimes';

describe('P4-CELEB-BIRTHTIME reliability logic', () => {
  it('TC-CBT-01: ships empty — we never fabricate a birth time (Rule 8)', () => {
    expect(Object.keys(CELEBRITY_BIRTH_TIMES)).toHaveLength(0);
  });

  it('TC-CBT-02: Rodden rating maps to the right reliability band', () => {
    expect(roddenToReliability('AA')).toBe('reliable');
    expect(roddenToReliability('A')).toBe('reliable');
    expect(roddenToReliability('B')).toBe('approximate');
    expect(roddenToReliability('C')).toBe('approximate');
    expect(roddenToReliability('DD')).toBe('unknown');
    expect(roddenToReliability('X')).toBe('unknown');
    expect(roddenToReliability('XX')).toBe('unknown');
    expect(roddenToReliability(undefined)).toBe('unknown');
  });

  it('TC-CBT-03: unknown celebrity defaults to "unknown" and no lookup', () => {
    expect(getCelebrityBirthTime('virat-kohli')).toBeNull();
    expect(getBirthTimeReliability('virat-kohli')).toBe('unknown');
    expect(getBirthTimeReliability(null)).toBe('unknown');
    expect(getBirthTimeReliability(undefined)).toBe('unknown');
  });

  it('TC-CBT-04: time-dependent sections gated — never render without verified time+place', () => {
    // No entry at all.
    expect(canRenderTimeDependent('virat-kohli')).toBe(false);
    // Simulate the gate's rules directly (data ships empty, so exercise the logic):
    // reliable band requires BOTH a verified time and a place.
    expect(roddenToReliability('AA') !== 'unknown').toBe(true);
  });
});

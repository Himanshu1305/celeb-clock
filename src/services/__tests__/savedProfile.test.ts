// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadProfile, saveProfile, clearProfile, isValidProfile,
  SAVED_PROFILE_STORAGE_KEY, type SavedBirthProfile,
} from '../savedProfile';

const VALID: SavedBirthProfile = {
  dob: '1988-11-05', time: '12:30',
  city: { name: 'Delhi', lat: 28.6139, lon: 77.209, tz: 5.5 },
};

beforeEach(() => localStorage.clear());

describe('savedProfile — explicit opt-in persistence', () => {
  it('nothing is stored until saveProfile is called (no silent writes)', () => {
    expect(loadProfile()).toBeNull();
    expect(localStorage.getItem(SAVED_PROFILE_STORAGE_KEY)).toBeNull();
  });

  it('saveProfile persists and loadProfile returns it', () => {
    expect(saveProfile(VALID)).toBe(true);
    const loaded = loadProfile();
    expect(loaded?.dob).toBe('1988-11-05');
    expect(loaded?.time).toBe('12:30');
    expect(loaded?.city.name).toBe('Delhi');
    expect(loaded?.city.lat).toBeCloseTo(28.6139);
  });

  it('clearProfile forgets it', () => {
    saveProfile(VALID);
    clearProfile();
    expect(loadProfile()).toBeNull();
  });
});

describe('savedProfile — corruption safety (negative)', () => {
  it('non-JSON garbage → null, and self-heals by removing the bad entry', () => {
    localStorage.setItem(SAVED_PROFILE_STORAGE_KEY, 'not json {{{');
    expect(loadProfile()).toBeNull();
    expect(localStorage.getItem(SAVED_PROFILE_STORAGE_KEY)).toBeNull();
  });

  it('valid JSON but wrong shape → null (never a half-built profile)', () => {
    localStorage.setItem(SAVED_PROFILE_STORAGE_KEY, JSON.stringify({ dob: 'nope', city: {} }));
    expect(loadProfile()).toBeNull();
  });

  it('rejects out-of-range coordinates and malformed dates/times', () => {
    expect(isValidProfile({ ...VALID, city: { ...VALID.city, lat: 999 } })).toBe(false);
    expect(isValidProfile({ ...VALID, dob: '5-11-1988' })).toBe(false);
    expect(isValidProfile({ ...VALID, time: '25:99' })).toBe(false);
    expect(isValidProfile({ ...VALID, city: { name: 'X', lat: 1, lon: 1 } })).toBe(false); // missing tz
    expect(isValidProfile(null)).toBe(false);
    expect(isValidProfile(VALID)).toBe(true);
  });

  it('saveProfile refuses to persist an invalid profile', () => {
    expect(saveProfile({ ...VALID, dob: 'bad' } as any)).toBe(false);
    expect(loadProfile()).toBeNull();
  });
});

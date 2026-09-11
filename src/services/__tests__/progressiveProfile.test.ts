import { describe, it, expect } from 'vitest';
import { isValidProfile, isFullVedicProfile, mergeProfile } from '../savedProfile';

const CITY = { name: 'Delhi', lat: 28.6139, lon: 77.209, tz: 5.5 };

describe('progressive profile schema (Part J)', () => {
  it('accepts a PARTIAL (date-only) profile as valid', () => {
    expect(isValidProfile({ dob: '1988-11-05' })).toBe(true);
    expect(isFullVedicProfile({ dob: '1988-11-05' })).toBe(false);
  });

  it('accepts a date+time (no place) profile, but it is not "full"', () => {
    expect(isValidProfile({ dob: '1988-11-05', time: '12:30' })).toBe(true);
    expect(isFullVedicProfile({ dob: '1988-11-05', time: '12:30' })).toBe(false);
  });

  it('a full date+time+place profile is valid AND full', () => {
    const full = { dob: '1988-11-05', time: '12:30', city: CITY };
    expect(isValidProfile(full)).toBe(true);
    expect(isFullVedicProfile(full)).toBe(true);
  });

  it('still rejects a bad date, a bad time (if present), or a bad city (if present)', () => {
    expect(isValidProfile({ dob: '1988-13-45' })).toBe(false);       // impossible date
    expect(isValidProfile({ dob: '1988-11-05', time: '25:99' })).toBe(false); // bad time
    expect(isValidProfile({ dob: '1988-11-05', city: { name: '', lat: 999, lon: 0, tz: 0 } })).toBe(false); // bad city
    expect(isValidProfile({ time: '12:30', city: CITY })).toBe(false); // no dob
  });

  it('mergeProfile extends without dropping what is already saved', () => {
    const partial = { dob: '1988-11-05' };
    const extended = mergeProfile(partial, { time: '12:30', city: CITY });
    expect(extended).toEqual({ dob: '1988-11-05', time: '12:30', city: CITY });
    expect(isFullVedicProfile(extended)).toBe(true);
    // a patch never erases existing fields it doesn't mention
    expect(mergeProfile(extended, { dob: '1990-01-01' })).toEqual({ dob: '1990-01-01', time: '12:30', city: CITY });
  });
});

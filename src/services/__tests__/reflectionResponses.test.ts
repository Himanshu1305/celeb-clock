// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordReflectionResponse, getAnsweredThemes, getReflectionResponses,
  clearReflectionResponses, REFLECTION_STORAGE_KEY,
} from '../reflectionResponses';

const DOB = '1978-03-22';
const OTHER = '1990-11-05';

describe('reflectionResponses (Part R persistence)', () => {
  beforeEach(() => localStorage.clear());

  it('CONSENT: nothing is stored without a saved profile', () => {
    expect(recordReflectionResponse(DOB, 'marriage', 'Yes, that fits', false)).toBe(false);
    expect(getReflectionResponses()).toEqual([]);
    expect(localStorage.getItem(REFLECTION_STORAGE_KEY)).toBeNull();
  });

  it('records an answer for a saved profile and reports it as answered', () => {
    expect(recordReflectionResponse(DOB, 'marriage', 'Not really', true)).toBe(true);
    expect(getAnsweredThemes(DOB).has('marriage')).toBe(true);
    expect(getReflectionResponses(DOB)[0]).toMatchObject({ dob: DOB, theme: 'marriage', response: 'Not really' });
  });

  it('ONCE EVER (immutable): a second answer for the same theme is ignored', () => {
    expect(recordReflectionResponse(DOB, 'career', 'Yes, that fits', true)).toBe(true);
    expect(recordReflectionResponse(DOB, 'career', 'Not really', true)).toBe(false); // ignored
    const rows = getReflectionResponses(DOB).filter(r => r.theme === 'career');
    expect(rows).toHaveLength(1);
    expect(rows[0].response).toBe('Yes, that fits'); // first answer stands
  });

  it('ADVERSARIAL: rapid different answers cannot create inconsistent state', () => {
    for (const r of ['Yes, that fits', 'Not really', "I don't remember"] as const) {
      recordReflectionResponse(DOB, 'travel', r, true);
    }
    const rows = getReflectionResponses(DOB).filter(r => r.theme === 'travel');
    expect(rows).toHaveLength(1);
    expect(rows[0].response).toBe('Yes, that fits');
  });

  it('ADVERSARIAL: keyed by dob — a different birth date tracks independently', () => {
    recordReflectionResponse(DOB, 'marriage', 'Yes, that fits', true);
    expect(getAnsweredThemes(OTHER).size).toBe(0);
    recordReflectionResponse(OTHER, 'marriage', 'Not really', true);
    expect(getAnsweredThemes(OTHER).has('marriage')).toBe(true);
    expect(getAnsweredThemes(DOB).has('marriage')).toBe(true);
  });

  it('ADVERSARIAL: clearing a DIFFERENT storage key does not reset reflection tracking', () => {
    recordReflectionResponse(DOB, 'marriage', 'Yes, that fits', true);
    localStorage.removeItem('bornclock-reading-history');   // Part P key
    localStorage.removeItem('bornclock-birth-profile');     // Part E key
    expect(getAnsweredThemes(DOB).has('marriage')).toBe(true); // still tracked
  });

  it('survives corrupted storage without throwing', () => {
    localStorage.setItem(REFLECTION_STORAGE_KEY, 'not json{{');
    expect(getReflectionResponses()).toEqual([]);
    expect(recordReflectionResponse(DOB, 'marriage', 'Yes, that fits', true)).toBe(true);
  });

  it('clearReflectionResponses wipes everything (user control)', () => {
    recordReflectionResponse(DOB, 'marriage', 'Yes, that fits', true);
    clearReflectionResponses();
    expect(getReflectionResponses()).toEqual([]);
  });
});

import { describe, it, expect } from 'vitest';
import {
  computeRashifal,
  RASHIS,
  rashiBySlug,
  RASHIFAL_PERIODS,
  type RashifalPeriod,
} from '../rashifal';
import { getSiderealLongitude } from '../engine/vedicEngine';

const REF = new Date('2026-10-09T12:00:00Z');

describe('rashifal engine', () => {
  it('has 12 rashis with worker-valid slugs in sign order', () => {
    expect(RASHIS).toHaveLength(12);
    expect(RASHIS.map(r => r.slug)).toEqual([
      'mesh', 'vrishabh', 'mithun', 'kark', 'simha', 'kanya',
      'tula', 'vrishchik', 'dhanu', 'makar', 'kumbh', 'meen',
    ]);
    expect(rashiBySlug('mesh')?.english).toBe('Aries');
    expect(rashiBySlug('nope')).toBeUndefined();
  });

  it('computes valid houses (1..12) for every planet and sign', () => {
    for (let s = 0; s < 12; s++) {
      for (const period of RASHIFAL_PERIODS) {
        const r = computeRashifal(s, period, REF);
        for (const t of r.transits) {
          expect(t.house).toBeGreaterThanOrEqual(1);
          expect(t.house).toBeLessThanOrEqual(12);
          expect(['favourable', 'mixed', 'challenging']).toContain(t.tone);
          expect(['strong', 'moderate', 'mild']).toContain(t.grade);
          expect(t.text.length).toBeGreaterThan(40);
        }
        expect(r.sections[0].key).toBe('overview');
        expect(r.sections).toHaveLength(5);
      }
    }
  });

  it('is deterministic for the same inputs', () => {
    const a = computeRashifal(4, 'today', REF);
    const b = computeRashifal(4, 'today', REF);
    expect(a.sections[0].text).toBe(b.sections[0].text);
  });

  it('produces different overviews for different signs on the same day', () => {
    const texts = new Set(RASHIS.map((_, i) => computeRashifal(i, 'today', REF).sections[0].text));
    // Each sign reads the same sky from a different Moon-sign house, so overviews differ.
    expect(texts.size).toBeGreaterThan(6);
  });

  it('house-from-Moon math matches the raw sidereal Saturn position', () => {
    const saturnSign = Math.floor((((getSiderealLongitude('Saturn', REF) % 360) + 360) % 360) / 30);
    const r = computeRashifal(0, 'today', REF); // Moon sign Mesha
    const saturn = r.transits.find(t => t.planet === 'Saturn')!;
    const expectedHouse = (((saturnSign - 0) % 12) + 12) % 12 + 1;
    expect(saturn.house).toBe(expectedHouse);
  });

  it('flags Sade Sati when Saturn is in the 12th/1st/2nd from the Moon', () => {
    const saturnSign = Math.floor((((getSiderealLongitude('Saturn', REF) % 360) + 360) % 360) / 30);
    const sadeSatiMoonSigns = [(saturnSign + 1) % 12, saturnSign, (saturnSign + 11) % 12];
    for (const ms of sadeSatiMoonSigns) {
      const r = computeRashifal(ms, 'today', REF);
      expect(r.transits.find(t => t.planet === 'Saturn')?.sadeSati).toBe(true);
    }
  });

  it('includes real ingress notes only for month/year periods', () => {
    const today = computeRashifal(0, 'today', REF);
    expect(today.ingress).toHaveLength(0);
    const year = computeRashifal(0, 'year', REF);
    // Jupiter changes sign roughly yearly, so a yearly scan should find ≥1 ingress.
    expect(year.ingress.length).toBeGreaterThanOrEqual(1);
    expect(year.ingress.join(' ')).toMatch(/enters .* on .*\d{4}/);
  });

  // K14: tips must match the tone ("handle with care … a good window to out-work competition").
  it('tips are tone-specific — a challenging reading never says "good window/time" or "favoured"', () => {
    for (let s = 0; s < 12; s++) {
      for (let d = 0; d < 40; d += 3) {
        const r = computeRashifal(s, 'today', new Date(Date.UTC(2026, 9, 1 + d, 12)));
        for (const t of r.transits) {
          if (t.tone === 'challenging') expect(t.text, `${t.planet} H${t.house}`).not.toMatch(/good window|good time|favoured/);
          if (t.tone === 'favourable') expect(t.text).not.toMatch(/handle with care|Watch spending|Keep a close eye/);
        }
      }
    }
  });

  // K14: the daily overview is led by the day's Moon and changes day to day.
  // Reference (Swiss Ephemeris, pyswisseph SIDM_LAHIRI): 2026-10-01 06:00 UT Moon 43.24°
  // (Vrishabha, Rohini); 2026-10-02 06:00 UT 57.52° (Vrishabha, Mrigashira); Moon enters
  // Mithuna 2026-10-02 15:41 IST (a Friday).
  it('daily overview leads with the Moon (house from the sign + nakshatra) and changes daily', () => {
    const d1 = computeRashifal(3, 'today', new Date('2026-10-01T12:00:00Z')).sections[0];
    expect(d1.text).toContain('The Moon, which sets the mood of the day, is in your 11th house');
    expect(d1.text).toContain('Rohini nakshatra');
    expect(d1.text).toContain('moves on to your 12th house on Friday, 2 October (IST)');
    const d2 = computeRashifal(3, 'today', new Date('2026-10-02T12:00:00Z')).sections[0];
    expect(d2.text).toContain('Mrigashira nakshatra');
    const en = new Set<string>(), hi = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const o = computeRashifal(3, 'today', new Date(Date.UTC(2026, 9, 1 + i, 12))).sections[0];
      en.add(o.text); hi.add(o.textHi);
    }
    expect(en.size).toBeGreaterThanOrEqual(25);   // was 2 distinct overviews in 30 days (round 2)
    expect(hi.size).toBeGreaterThanOrEqual(25);
  });

  // K15: Hindi strings — no "Today." in Hindi, no "1वें" style ordinals.
  it('Hindi text uses Hindi labels and ordinals (पहले/दूसरे…), never "Today" or "1वें"', () => {
    const d1 = computeRashifal(3, 'today', new Date('2026-10-01T12:00:00Z'));
    expect(d1.sections[0].textHi.startsWith('कर्क राशि — आज।')).toBe(true);
    expect(d1.sections[0].textHi).toContain('ग्यारहवें भाव');
    expect(d1.sections[0].textHi).toContain('रोहिणी नक्षत्र');
    for (let s = 0; s < 12; s++) {
      for (const period of RASHIFAL_PERIODS) {
        const r = computeRashifal(s, period, REF);
        for (const sec of r.sections) {
          expect(sec.textHi).not.toMatch(/\d+वें|Today|This week/);
        }
        for (const t of r.transits) expect(t.textHi).toMatch(/(पहले|दूसरे|तीसरे|चौथे|पाँचवें|छठे|सातवें|आठवें|नौवें|दसवें|ग्यारहवें|बारहवें) भाव/);
      }
    }
    expect(computeRashifal(3, 'month', new Date('2026-10-10T12:00:00Z')).sections[0].textHi.startsWith('कर्क राशि — अक्टूबर 2026।')).toBe(true);
  });
});

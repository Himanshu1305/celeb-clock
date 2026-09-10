import { describe, it, expect } from 'vitest';
import { NAKSHATRA_MEANINGS, getNakshatraMeaning, nakshatraMeaningLine } from '../nakshatraMeanings';
import { NAKSHATRA_NAMES } from '../engine/vedicEngine';
import { calculateBirthChart } from '../calculateBirthChart';
import { extractReadingFacts } from '../readingPrompts';

describe('Nakshatra meanings — completeness + canonical data', () => {
  it('covers all 27 Nakshatras with full data', () => {
    expect(Object.keys(NAKSHATRA_MEANINGS)).toHaveLength(27);
    for (const name of NAKSHATRA_NAMES) {
      const m = getNakshatraMeaning(name);
      expect(m, name).toBeTruthy();
      expect(m!.deity && m!.symbol && m!.rulingPlanet && m!.meaning && m!.significance).toBeTruthy();
    }
  });

  it('ruling planets match the canonical Vimshottari lords', () => {
    // A representative, verified sample.
    expect(getNakshatraMeaning('Ashwini')!.rulingPlanet).toBe('Ketu');
    expect(getNakshatraMeaning('Krittika')!.rulingPlanet).toBe('Sun');
    expect(getNakshatraMeaning('Pushya')!.rulingPlanet).toBe('Saturn');
    expect(getNakshatraMeaning('Uttara Phalguni')!.rulingPlanet).toBe('Sun');
    expect(getNakshatraMeaning('Revati')!.rulingPlanet).toBe('Mercury');
  });
});

describe('Nakshatra meanings — ANTI-INFLATION (significance is not uniform)', () => {
  it('only genuinely standout Nakshatras are "exceptional"', () => {
    const exceptional = Object.values(NAKSHATRA_MEANINGS).filter(m => m.significance === 'exceptional');
    // Pushya (King of Nakshatras) + Rohini (Moon's favourite) — not all 27.
    expect(exceptional.map(m => m.name).sort()).toEqual(['Pushya', 'Rohini']);
    expect(getNakshatraMeaning('Pushya')!.significance).toBe('exceptional');
  });

  it('classically "mixed" Nakshatras are marked neutral, not dramatized', () => {
    expect(getNakshatraMeaning('Krittika')!.significance).toBe('neutral');
    expect(getNakshatraMeaning('Vishakha')!.significance).toBe('neutral');
    const line = nakshatraMeaningLine('Vishakha')!;
    expect(line).toMatch(/neutral|mixed/i);
    expect(line).not.toMatch(/most auspicious|King of Nakshatras/i); // NOT inflated to Pushya's level
  });

  it('significance spans the honest range (not everything is "favorable" either)', () => {
    const counts = Object.values(NAKSHATRA_MEANINGS).reduce((a, m) => { a[m.significance] = (a[m.significance] || 0) + 1; return a; }, {} as Record<string, number>);
    expect(counts.exceptional).toBeGreaterThanOrEqual(1);
    expect(counts.neutral).toBeGreaterThanOrEqual(2);
    expect(counts.intense).toBeGreaterThanOrEqual(4);   // the Tikshna/Ugra ones, framed constructively
    expect(counts.exceptional).toBeLessThan(counts.favorable); // exceptional is rare
  });

  it('intense Nakshatras are framed as powerful/transformative, never as "bad"/"cursed"', () => {
    for (const m of Object.values(NAKSHATRA_MEANINGS).filter(x => x.significance === 'intense')) {
      expect(m.meaning, m.name).not.toMatch(/\b(bad|cursed|evil|doomed|unlucky|terrible)\b/i);
    }
    expect(nakshatraMeaningLine('Ashlesha')).toMatch(/powerful rather than simply/i);
  });
});

describe('Nakshatra meanings — integration into the reading facts', () => {
  it('the reference chart Moon Nakshatra (Uttara Phalguni) carries its meaning + honest significance', async () => {
    const chart = await calculateBirthChart({ year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6139, longitude: 77.2090, timezoneOffset: 5.5 }, { refDate: new Date(Date.UTC(2026, 8, 9)) });
    const f = extractReadingFacts(chart);
    expect(f.nakshatra.name).toBe('Uttara Phalguni');
    expect(f.nakshatra.meaning).toMatch(/friendship|contracts|partnership/i);
    expect(f.nakshatra.significance).toBe('favorable'); // reliable, but NOT inflated to exceptional
  });
});

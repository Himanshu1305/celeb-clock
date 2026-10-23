// @vitest-environment jsdom
/**
 * N13 regression tests (Oct 2026).
 *  - Y-vowel rule: Y is a vowel when no other vowel is in its syllable (astrogle.com
 *    "Soul Urge Numbers": "when there is no other vowel in a syllable (Lynn or Carolyn)";
 *    lailanicolevassell.substack.com: Y counts in "Lyla", "Benny", "Mystic", "Gwyneth").
 *    Expected numbers are hand-sums with the Pythagorean table (A1 … Y7 …).
 *  - December birthstones: one answer, the modern list Turquoise, Tanzanite & Zircon.
 *  - Orbital periods: NASA NSSDCA Planetary Fact Sheets, read 23 Oct 2026.
 *  - Saturn moons: NASA NSSDCA Saturn Fact Sheet "Number of natural satellites: 274"
 *    (page updated 18 Mar 2025), read 23 Oct 2026.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { calculateAllNameNumbers, getLetterBreakdown } from '@/data/nameNumerologyData';
import { getBirthstoneByMonth, birthstoneAnswer, DECEMBER_BIRTHSTONES } from '@/data/birthstoneData';
import { birthstoneForMonth } from '@/utils/homepageDecode';
import { ORBITAL_PERIOD_DAYS } from '@/lib/orbitalPeriods';
import { ORBITAL_PERIODS_DAYS } from '@/components/PlanetaryAge';
import { ORBITAL_PERIODS } from '@/services/BirthdayReportService';
import { calculatePlanetaryAges } from '@/utils/celebrityCalculations';

describe('N13 — Y as a vowel', () => {
  it('Lynn: Y is the only vowel → Soul Urge 7 (Y=7), Personality L3+N5+N5=13→4', () => {
    expect(calculateAllNameNumbers('Lynn')).toMatchObject({ soulUrge: 7, personality: 4, expression: 2 });
  });
  it('Mary: A1+Y7 = 8', () => expect(calculateAllNameNumbers('Mary').soulUrge).toBe(8));
  it('Carolyn: A1+O6+Y7 = 14 → 5', () => expect(calculateAllNameNumbers('Carolyn').soulUrge).toBe(5));
  it('Yolanda: initial Y before a vowel is a consonant → O6+A1+A1 = 8', () => {
    expect(calculateAllNameNumbers('Yolanda').soulUrge).toBe(8);
  });
  it('Murray: Y after a vowel is a consonant → U3+A1 = 4', () => {
    expect(calculateAllNameNumbers('Murray').soulUrge).toBe(4);
  });
  it('expression (all letters) is unchanged by the Y rule', () => {
    // L3 Y7 N5 N5 = 20 → 2
    expect(calculateAllNameNumbers('Lynn').expression).toBe(2);
  });
  it('letter breakdown marks Y the same way', () => {
    expect(getLetterBreakdown('Lynn').map(l => l.isVowel)).toEqual([false, true, false, false]);
    expect(getLetterBreakdown('Yolanda')[0].isVowel).toBe(false);
  });
});

describe('N13 — one December birthstone answer', () => {
  it('data, helper and homepage agree', () => {
    expect(DECEMBER_BIRTHSTONES).toBe('Turquoise, Tanzanite & Zircon');
    expect(birthstoneAnswer(getBirthstoneByMonth(12))).toBe(DECEMBER_BIRTHSTONES);
    expect(birthstoneForMonth(12)).toBe(DECEMBER_BIRTHSTONES);
    expect(birthstoneForMonth(1)).toBe('Garnet');
  });
  it('hard-coded month tables use the same answer', () => {
    for (const f of ['src/components/ZodiacAndFacts.tsx', 'src/components/CelebritySearch.tsx', 'src/pages/BirthdayResults.tsx', 'src/data/pageFaqs.ts', 'src/data/blogPosts.ts']) {
      expect(readFileSync(resolve(process.cwd(), f), 'utf8'), f).toContain('Turquoise, Tanzanite & Zircon');
    }
  });
});

describe('N13 — one orbital-period table (NASA fact sheets)', () => {
  const NASA: Record<string, number> = {
    Mercury: 87.969, Venus: 224.701, Earth: 365.256, Mars: 686.98,
    Jupiter: 4332.589, Saturn: 10755.699, Uranus: 30685.4, Neptune: 60189,
  };
  it('shared table matches NASA', () => expect({ ...ORBITAL_PERIOD_DAYS }).toEqual(NASA));
  it('planetary-age widget and birthday report use the shared table', () => {
    expect(ORBITAL_PERIODS_DAYS).toEqual(NASA);
    expect(ORBITAL_PERIODS).toEqual(NASA);
  });
  it('celebrity planetary ages divide by the shared periods', () => {
    const ages = calculatePlanetaryAges({ year: 2000, month: 1, day: 1, isFullDate: true });
    expect(ages.find(a => a.planet === 'Saturn')!.orbit_years).toBe(29.4);
    expect(ages.find(a => a.planet === 'Neptune')!.orbit_years).toBe(164.8);
  });
});

describe('N13 — Saturn moon count', () => {
  it('shows NASA\'s 274, not 146', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/components/PlanetaryAge.tsx'), 'utf8');
    expect(src).toContain('moons: 274');
    expect(src).not.toMatch(/146 (known )?moons/);
  });
});

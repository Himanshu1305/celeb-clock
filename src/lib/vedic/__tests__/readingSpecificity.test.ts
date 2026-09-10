import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { extractReadingFacts } from '../readingPrompts';
import { verifyReadingClaims, scoreReadingSpecificity } from '../readingSpecificity';

const REF = new Date(Date.UTC(2026, 8, 9));
async function refFacts() {
  const c = await calculateBirthChart({ year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6139, longitude: 77.2090, timezoneOffset: 5.5 }, { refDate: REF, includeShadbala: true });
  return extractReadingFacts(c);
}

describe('enriched facts — house lords, Shadbala, all 9 planets, Navamsa', () => {
  it('derives whole-sign house lords + finds the lord placement', async () => {
    const f = await refFacts();
    const h10 = f.houseLords.find(h => h.house === 10)!;
    expect(h10.sign).toBe('Tula');           // Makara lagna → 10th = Tula
    expect(h10.lord).toBe('Venus');
    expect(h10.lordSign).toBe('Kanya');       // Venus sits in Kanya
    expect(h10.lordHouse).toBe(9);
    expect(f.planets).toHaveLength(9);        // all 9 grahas, not just Sun/Moon
    expect(f.planets.every(p => p.navamsa && (p.shadbala || ['Rahu', 'Ketu'].includes(p.planet)))).toBe(true);
    expect(f.dashaLord).toMatchObject({ planet: 'Rahu', sign: 'Kumbha', house: 2 });
  });
});

describe('accuracy checker (anti-hallucination) — high precision', () => {
  it('passes a fully-correct reading (0 wrong)', async () => {
    const f = await refFacts();
    const reading = {
      career: 'Your 10th house is Tula, ruled by Venus, and Venus sits in Kanya in your 9th house.',
      rightNow: 'Rahu sits in your 2nd house in Kumbha.',
      divisional: 'In your Navamsa, Venus falls in Vrishabha and the Moon in Makara.',
    } as any;
    const r = verifyReadingClaims(reading, f);
    expect(r.wrong).toHaveLength(0);
    expect(r.checked).toBeGreaterThanOrEqual(5);
  });

  it('flags every fabricated placement with the real value', async () => {
    const f = await refFacts();
    const reading = { career: 'Your Mars sits in your 5th house, and your 10th house is Mesha. Saturn is in Karka.' } as any;
    const r = verifyReadingClaims(reading, f);
    const claims = r.wrong.map(w => `${w.claimed} :: ${w.actual}`);
    // Mars is really in the 3rd house; 10th is really Tula; Saturn is really in Dhanu (not Karka in any varga)
    expect(r.wrong.length).toBeGreaterThanOrEqual(3);
    expect(claims.some(c => /Mars in 5th house/.test(c) && /3rd house/.test(c))).toBe(true);
    expect(claims.some(c => /10th house is Mesha/.test(c) && /Tula/.test(c))).toBe(true);
  });

  it('does NOT false-flag a Navamsa/divisional sign the planet really occupies in a varga', async () => {
    const f = await refFacts();
    // Mars D1 = Meena, but Mars Navamsa = Simha — stating Simha must NOT be flagged.
    const reading = { divisional: 'In the Navamsa, Mars falls in Simha.' } as any;
    const r = verifyReadingClaims(reading, f);
    expect(r.wrong).toHaveLength(0);
  });
});

describe('specificity checker', () => {
  it('a chart-specific reading passes every section', async () => {
    const f = await refFacts();
    const good = {
      snapshot: 'With Makara rising and Saturn in the 12th house, your Moon in Kanya shapes a careful nature.',
      career: 'Your 10th house is Tula, ruled by Venus in the 9th house; Sun and Mercury in the 10th house add analytical strength.',
      relationships: 'Your 7th house is Karka, ruled by the Moon in Kanya; Venus in the 9th house, and in the Navamsa Venus is in Vrishabha.',
      health: 'Your 6th house is Mithuna ruled by Mercury in the 10th house; your Lagna lord Saturn in the 12th house asks for rest.',
      money: 'Your 2nd house is Kumbha ruled by Saturn; your 11th house is Vrischika ruled by Mars; Jupiter in the 5th house favours patience.',
      family: 'Your 4th house is Mesha ruled by Mars in the 3rd house; your 9th house is Kanya ruled by Mercury in the 10th house.',
      rightNow: 'Your Rahu period places Rahu in the 2nd house in Kumbha with its own tone.',
      doshas: 'No Mangal Dosha, since Mars sits in your 3rd house; no Kaal Sarp; no Sade Sati.',
      divisional: 'In your Navamsa the Moon is in Makara and Venus in Vrishabha; the Dasamsa Sun is in Mesha.',
    } as any;
    const s = scoreReadingSpecificity(good, f);
    expect(s.overallPass).toBe(true);
    expect(s.failing).toHaveLength(0);
  });

  it('flags a generic reading (the old style) as failing', async () => {
    const f = await refFacts();
    const generic = {
      snapshot: 'You have a grounded, quietly ambitious nature with a strong moral compass.',
      career: 'You may feel drawn toward roles where communication and steady craftsmanship are valued; work benefits from patience.',
      relationships: 'You value genuine loyalty and heartfelt devotion over grand gestures.',
      health: 'Your wellbeing flourishes with calm daily rhythms and gentle consistency.',
      money: 'Your financial mindset leans naturally toward caution and long-term planning.',
      family: 'Home life holds a special, grounding place in your heart.',
      rightNow: 'You are navigating a period of expansion and emotional recalibration.',
      doshas: 'You do not carry major dosha patterns; your path is free of pressing remedies.',
      divisional: 'Deeper frameworks highlight resilience that grows with maturity.',
    } as any;
    const s = scoreReadingSpecificity(generic, f);
    expect(s.overallPass).toBe(false);
    expect(s.failing).toContain('career');
    expect(s.failing).toContain('rightNow');
  });
});

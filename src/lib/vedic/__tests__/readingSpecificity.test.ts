import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { extractReadingFacts } from '../readingPrompts';
import { verifyReadingClaims, scoreReadingSpecificity, measureProse, measureRepetition } from '../readingSpecificity';
import { strengthWord } from '../readingPrompts';

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

  it('flags a FABRICATED Yoga but passes a real one (and passes correct negations)', async () => {
    const f = await refFacts();
    const present = f.yogas.map(y => y.name).join(', ');
    expect(present).toMatch(/Raj Yoga/); // reference chart really has Raj Yoga
    // Claiming a real Yoga → ok; claiming an ABSENT one (Gaja Kesari) → flagged; negating an absent one → ok.
    const reading = {
      career: 'You have a strong Raj Yoga giving professional rise.',
      snapshot: 'You also have a powerful Gaja Kesari Yoga of great wisdom.',
      doshas: 'You do not have Gaja Kesari Yoga.',
    } as any;
    const r = verifyReadingClaims(reading, f);
    const wrong = r.wrong.filter(w => w.type === 'yoga-claim');
    expect(wrong).toHaveLength(1);
    expect(wrong[0].claimed).toMatch(/Gaja Kesari/);
    expect(wrong[0].section).toBe('snapshot');
    // The true Raj Yoga claim and the negated Gaja Kesari must NOT be flagged.
    expect(r.byClaim.some(c => c.type === 'yoga-claim' && c.claimed.includes('Raj Yoga') && c.ok)).toBe(true);
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

  it('strengthWord maps categories to plain words (no numbers)', () => {
    expect(strengthWord('strong')).toBe('strong');
    expect(strengthWord('moderate')).toBe('moderately strong');
    expect(strengthWord('weak')).toMatch(/gentle/);
  });

  it('measureProse: denser prose scores MORE facts/sentence than looser prose', () => {
    const dense = { career: 'Your 10th house is Tula ruled by Venus in the 9th house in Kanya with Sun and Mercury also in the 10th house while Rahu sits in the 2nd house in Kumbha.' } as any;
    const loose = { career: 'Your 10th house is Tula. Venus rules it from your 9th house. The Sun adds warmth. Rahu sits in your 2nd house.' } as any;
    const md = measureProse(dense), ml = measureProse(loose);
    expect(md.avgFactsPerSentence).toBeGreaterThan(ml.avgFactsPerSentence);
    expect(ml.avgWordsPerSentence).toBeLessThan(md.avgWordsPerSentence);
  });

  it('measureProse: detects raw virupa numbers leaking into narrative', () => {
    expect(measureProse({ career: 'Venus has 310 virupas of strength.' } as any).virupaNumberMentions).toBeGreaterThan(0);
    expect(measureProse({ career: 'Venus is moderately strong.' } as any).virupaNumberMentions).toBe(0);
  });

  it('measureRepetition: counts the "indicative strength" filler + repeated openers per section', () => {
    const repetitive = {
      career: 'Venus shows strong indicative strength. Mercury shows moderate indicative strength. Saturn shows strong indicative strength here.',
      health: 'Your chart is steady. Your chart favours rest. Your chart rewards routine.', // 3× "your chart" opener
    } as any;
    const rep = measureRepetition(repetitive);
    expect(rep.strengthPhraseMax).toBe(3);        // career: "indicative strength" ×3
    expect(rep.worstSection).toBe('career');
    expect(rep.redundantStrengthPhrases).toBe(2); // 3 − 1 = 2 excess in career
    expect(rep.openerRepeatMax).toBe(3);          // health: "your chart" ×3 (same 2-word opener)

    const varied = {
      career: 'A strong Venus anchors your 10th house. Mercury sits gently in the 3rd. Saturn stands steady in the 9th, an indicative strength worth noting.',
    } as any;
    const rv = measureRepetition(varied);
    expect(rv.strengthPhraseMax).toBe(1);         // used once, on purpose
    expect(rv.redundantStrengthPhrases).toBe(0);
    expect(rv.openerRepeatMax).toBeLessThanOrEqual(1);
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

/**
 * N5 / N6 regression tests (Oct 2026).
 *
 * Reference for the 108 pada syllables: the standard Avakahada 108-pada table as
 * published by Drik Panchang ("Hindu Name Initials — 108 Pada Swars based on 27
 * Nakshatras", drikpanchang.com/swar-siddhanta/nakshatra/…; pages checked include
 * Ardra P3 "Ing" / P4 "Chha", Shravana P1 "Khee" / P3 "Khe" / P4 "Kho", Uttara
 * Bhadrapada P3 "Jha" / P4 "Yna", Purva Ashadha P2 "Dhaa" / P3 "Phaa" / P4 "Dha",
 * Uttara Ashadha P1 "Bhe" / P3 "Jaa" / P4 "Jee", Hasta P3 "Na" / P4 "Tha", Mula P3
 * "Bhaa", Krittika P2 "Ee", Rohini P4 "Vu", Swati P4 "Taa", Mrigashira P4 "Kee",
 * Pushya P4 "Daa"), with Devanagari from onlinejyotish.com/articles/rashi-nakshatra-with-name.php.
 * This copy is typed independently of src/data/nakshatraAksharas.ts on purpose.
 */
import { describe, it, expect } from 'vitest';
import { NAKSHATRA_PADA_AKSHARAS, NAKSHATRA_AKSHARAS, aksharaForPada } from '../nakshatraAksharas';
import { BABY_NAMES, aksharaKey, namesForPada, padasForName } from '../babyNamesByAkshara';
import { NAKSHATRA_EXTRA } from '../nakshatraPages';
import { buildChildKundli } from '@/lib/vedic/childKundli';

const REF_108: Record<string, string> = {
  'Ashwini': 'चू चे चो ला', 'Bharani': 'ली लू ले लो', 'Krittika': 'अ ई ऊ ए', 'Rohini': 'ओ वा वी वू',
  'Mrigashira': 'वे वो का की', 'Ardra': 'कू घ ङ छ', 'Punarvasu': 'के को हा ही', 'Pushya': 'हू हे हो डा',
  'Ashlesha': 'डी डू डे डो', 'Magha': 'मा मी मू मे', 'Purva Phalguni': 'मो टा टी टू',
  'Uttara Phalguni': 'टे टो पा पी', 'Hasta': 'पू ष ण ठ', 'Chitra': 'पे पो रा री', 'Swati': 'रू रे रो ता',
  'Vishakha': 'ती तू ते तो', 'Anuradha': 'ना नी नू ने', 'Jyeshtha': 'नो या यी यू', 'Mula': 'ये यो भा भी',
  'Purva Ashadha': 'भू धा फा ढा', 'Uttara Ashadha': 'भे भो जा जी', 'Shravana': 'खी खू खे खो',
  'Dhanishtha': 'गा गी गू गे', 'Shatabhisha': 'गो सा सी सू', 'Purva Bhadrapada': 'से सो दा दी',
  'Uttara Bhadrapada': 'दू थ झ ञ', 'Revati': 'दे दो चा ची',
};

describe('N5 — 108 pada syllables', () => {
  it('has 27 nakshatras × 4 padas', () => {
    expect(Object.keys(NAKSHATRA_PADA_AKSHARAS)).toHaveLength(27);
    expect(Object.values(NAKSHATRA_PADA_AKSHARAS).flat()).toHaveLength(108);
  });

  for (const [nak, ref] of Object.entries(REF_108)) {
    ref.split(' ').forEach((hi, i) => {
      it(`${nak} pada ${i + 1} = ${hi}`, () => {
        expect(aksharaForPada(nak, i + 1)?.hi).toBe(hi);
      });
    });
  }

  it('Ardra pada 4 is "Chha" (छ), not "Jha"', () => {
    expect(aksharaForPada('Ardra', 4)).toEqual({ en: 'Chha', hi: 'छ' });
    expect(NAKSHATRA_AKSHARAS['Ardra']).not.toContain('Jha');
  });

  it('/nakshatra pages use the same table', () => {
    for (const nak of Object.keys(REF_108)) {
      expect(NAKSHATRA_EXTRA[nak].padaSyllables).toEqual(NAKSHATRA_AKSHARAS[nak]);
    }
  });

  it('invalid pada gives null', () => {
    expect(aksharaForPada('Ardra', 0)).toBeNull();
    expect(aksharaForPada('Ardra', 5)).toBeNull();
    expect(aksharaForPada('Nope', 1)).toBeNull();
  });

  it('Child Kundli gives ONE syllable for the birth pada', () => {
    const c = buildChildKundli({
      nakshatra: { nakshatra: 'Ardra', pada: 4 },
      planets: [{ name: 'Moon', signIndex: 2, house: 1, longitude: 79 }],
    } as never)!;
    expect(c.nameLetters.aksharas).toEqual(['Chha (छ)']);
  });
});

describe('N6 — names indexed by first Devanagari akshara', () => {
  it('matra-aware keys', () => {
    expect(aksharaKey('देव')).toBe('द|e');
    expect(aksharaKey('रोहन')).toBe('र|o');
    expect(aksharaKey('दीपक')).toBe('द|i');
    expect(aksharaKey('ध्रुव')).toBe('ध|u');
    expect(aksharaKey('आरव')).toBe('|a');
    expect(aksharaKey('ऋषि')).toBe('र|i');
    expect(aksharaKey('गौरव')).toBe('ग|au');
    expect(aksharaKey('Dev')).toBeNull();
  });

  const where = (name: string) => {
    const n = BABY_NAMES.find(x => x.name === name)!;
    return padasForName(n).map(p => `${p.nakshatra} ${p.pada}`);
  };

  it('Dev is De (Revati 1), not Da', () => expect(where('Dev')).toEqual(['Revati 1']));
  it('Rohan is Ro (Swati 3), not Ra', () => expect(where('Rohan')).toEqual(['Swati 3']));
  it('Deepak is Di (Purva Bhadrapada 4), not De', () => expect(where('Deepak')).toEqual(['Purva Bhadrapada 4']));
  it('Ardra pada 4 lists Chha names', () => {
    expect(namesForPada('Ardra', 4).map(n => n.name)).toEqual(expect.arrayContaining(['Chhavi', 'Chhaya']));
  });

  // Roman initial must agree with the Devanagari first letter (catches a wrong spelling).
  const ROMAN: Record<string, RegExp> = {
    'क': /^K(?!h)/, 'ख': /^Kh/, 'ग': /^G(?!h)/, 'घ': /^Gh/, 'च': /^Ch(?!h)/, 'छ': /^Chh/, 'ज': /^J/, 'झ': /^Jh/,
    'ट': /^T/, 'ठ': /^Th/, 'ड': /^D/, 'ढ': /^Dh/, 'ण': /^N/, 'त': /^T(?!h)/, 'थ': /^Th/, 'द': /^D(?!h)/,
    'ध': /^Dh/, 'न': /^N/, 'प': /^P(?!h)/, 'फ': /^(Ph|F)/, 'ब': /^B(?!h)/, 'भ': /^Bh/, 'म': /^M/, 'य': /^Y/,
    'र': /^R/, 'ल': /^L/, 'व': /^V/, 'श': /^Sh/, 'स': /^S(?!h)/, 'ह': /^H/, '': /^[AEIOU]/,
  };
  const VOWEL: Record<string, RegExp> = {
    a: /^[^aeiou]*a(?!i|u)/i, i: /^[^aeiou]*(i|ee)/i, u: /^[^aeiou]*(u|oo)/i, e: /^[^aeiou]*e(?!e)/i,
    o: /^[^aeiou]*o(?!o)/i,
  };

  for (const n of BABY_NAMES) {
    it(`${n.name} (${n.hi}) is filed under a real pada with a matching spelling`, () => {
      const key = aksharaKey(n.hi);
      expect(key).not.toBeNull();
      const [cons, vowel] = key!.split('|');
      // ऋ is read as "Ri"
      if (n.hi.startsWith('ऋ')) expect(n.name).toMatch(/^Ri/);
      else expect(n.name).toMatch(ROMAN[cons]);
      expect(n.name).toMatch(VOWEL[vowel]);
      expect(padasForName(n).length).toBeGreaterThan(0);
    });
  }

  it('every pada lookup returns only names whose key matches that pada', () => {
    for (const [nak, row] of Object.entries(NAKSHATRA_PADA_AKSHARAS)) {
      row.forEach((p, i) => {
        for (const n of namesForPada(nak, i + 1)) expect(aksharaKey(n.hi)).toBe(aksharaKey(p.hi));
      });
    }
  });
});

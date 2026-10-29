import { describe, it, expect } from 'vitest';
import { readName, matchByName, rashiOfPada, type NameStar } from '../nameMatching';

/**
 * Name → Nakshatra pada. Expected padas are read straight off the 108-pada table in
 * src/data/nakshatraAksharas.ts (Drik Panchang "108 Pada Swars", cross-checked with
 * onlinejyotish.com); ब→व and श→स follow Drik Panchang's "Find Rashi with Name"
 * letter groups (opened 29 Oct 2026).
 */
const first = (n: string) => { const c = readName(n).candidates[0]; return c && `${c.nakshatra} ${c.pada}`; };
const all = (n: string) => readName(n).candidates.map(c => `${c.nakshatra} ${c.pada}`);

describe('name → nakshatra pada (English spellings)', () => {
  it.each([
    ['Rahul', 'Chitra 3'],          // Ra रा
    ['Priya', 'Uttara Phalguni 4'], // Pi पी (Pr- cluster skipped)
    ['Rohan', 'Swati 3'],           // Ro रो
    ['Vikram', 'Rohini 3'],         // Vi वी
    ['Pooja', 'Hasta 1'],           // Pu पू
    ['Neha', 'Anuradha 4'],         // Ne ने
    ['Krishna', 'Mrigashira 4'],    // Ki की (कृ read as "ri")
    ['Mukta', 'Magha 3'],           // Mu मू
    ['Hemant', 'Pushya 2'],         // He हे
    ['Chhavi', 'Ardra 4'],          // Chha छ (bare-letter syllable)
  ])('%s → %s', (name, expected) => {
    expect(first(name)).toBe(expected);
  });

  it('ambiguous Roman spellings list every reading (Dev = दे Revati 1 or डे Ashlesha 3)', () => {
    expect(all('Dev')).toEqual(['Revati 1', 'Ashlesha 3']);
    expect(all('Tara')).toEqual(['Swati 4', 'Purva Phalguni 2']);
  });
});

describe('name → nakshatra pada (Devanagari)', () => {
  it.each([
    ['देव', 'Revati 1'],
    ['दीपक', 'Purva Bhadrapada 4'],
    ['सोहन', 'Purva Bhadrapada 2'],
    ['राधा', 'Chitra 3'],
    ['नूतन', 'Anuradha 3'],
    ['फाल्गुन', 'Purva Ashadha 3'],
    ['ज्ञान', 'Uttara Ashadha 3'],  // ज्ञ → ज
    ['कृष्ण', 'Mrigashira 4'],
    ['बबीता', 'Rohini 2'],         // ब read as व (Drik Panchang groups ब, व)
    ['हेमंत', 'Pushya 2'],
  ])('%s → %s', (name, expected) => {
    expect(first(name)).toBe(expected);
  });

  it('Devanagari removes the Roman ambiguity: देव is only Revati 1', () => {
    expect(all('देव')).toEqual(['Revati 1']);
  });

  it('श-names get both Drik Panchang readings (Hasta via ष, Kumbha via स)', () => {
    expect(all('शालिनी')).toEqual(['Hasta 2', 'Shatabhisha 2']);
  });

  it('names with no syllable in the table return no candidate (user picks the closest)', () => {
    expect(readName('ऐश्वर्या').candidates).toEqual([]);
    expect(readName('123').candidates).toEqual([]);
  });
});

describe('rashi of a pada', () => {
  it('9 padas per sign', () => {
    expect(rashiOfPada('Ashwini', 1)).toBe(0);
    expect(rashiOfPada('Krittika', 1)).toBe(0);
    expect(rashiOfPada('Krittika', 2)).toBe(1);
    expect(rashiOfPada('Revati', 4)).toBe(11);
  });
});

/**
 * Totals for 5 name pairs. REFERENCE: AstroSage's own Guna Milan totals for couples whose
 * Moons sit in exactly these nakshatra padas — recorded from astrosage.com on 17 Oct 2026
 * (round2 audit, src/lib/vedic/__tests__/matchmakingAstroSage.test.ts). The names were
 * chosen so their first syllable gives the same pada as each audit couple's Moon.
 * AstroSage's own "match by name" tool posts its form and could not be read via WebFetch,
 * so its name→star step is NOT independently checked here.
 */
const pick = (name: string, nak: string) => readName(name).candidates.find(c => c.nakshatra === nak) as NameStar;
describe('name-pair totals equal AstroSage totals for the same nakshatra padas', () => {
  it.each([
    ['देव', 'Revati', 'Radha', 'Chitra', 12.5],                  // P1 × P2
    ['Hemant', 'Pushya', 'Tara', 'Purva Phalguni', 17.5],         // P9 × P3 (Tara read as टा)
    ['फाल्गुन', 'Purva Ashadha', 'Tara', 'Purva Phalguni', 17],   // Y1 × P3
    ['नूतन', 'Anuradha', 'Radha', 'Chitra', 7.5],                 // Y3 × P2
    ['Tarun', 'Purva Phalguni', 'Mukta', 'Magha', 30],            // P3 × P4 (Tarun read as ट)
  ] as const)('%s (%s) × %s (%s) = %s', (b, bn, g, gn, total) => {
    const boy = pick(b, bn), girl = pick(g, gn);
    expect(boy && girl).toBeTruthy();
    expect(matchByName(boy, girl).total).toBe(total);
  });
});

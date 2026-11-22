/**
 * B18 — Lal Kitab engine: house placement, the pakka ghar / uchcha / neech tables, sleeping
 * planets and houses, Rin triggers, teva types, masnui pairs and the Varshphal table, on
 * synthetic charts and on 12 real charts computed by the same engine as /api/kundali.
 *
 * Published comparisons (no invented charts):
 *  • Two charts published by Lal Kitab author Kamal Kapoor — https://kamalkapoor.com/narendra-modi.asp
 *    (17 Sep 1950, 09:35, Vadnagar: Libra rising; Moon+Mars 2nd, Rahu 6th, Saturn+Venus 11th,
 *    Sun+Mercury+Ketu 12th) and https://www.kamalkapoor.com/amitabh-bachchan.asp (11 Oct 1942,
 *    16:00 "unconfirmed", Allahabad: Aquarius rising; Ketu 1st, Saturn 4th, Jupiter 6th, Rahu 7th,
 *    Sun+Mars+Mercury+Venus 8th, Moon 9th). A Lal Kitab chart keeps these house positions
 *    (houses from the Lagna) and renumbers house 1 as Aries.
 *  • The worked Varshphal example in R. N. Bhandari's table (https://saptarishisastrology.com/?p=10498):
 *    Mars in the 1st house sits in the 3rd house in the 16th year.
 */
import { describe, it, expect } from 'vitest';
import { calculateBirthChart, type BirthChartInput } from '../../calculateBirthChart';
import { toKundaliLegacy } from '../../legacyAdapters';
import {
  buildLalKitabChart, lalKitabVarshphal, runningYearOfLife, cyclePlanetAt,
  PAKKA_GHAR, EXALTED, DEBILITATED, VARSHPHAL, ASPECTS, aspectedBy, RINS, CYCLE_35, LK_PLANETS,
  type LkPlanet,
} from '../index';
import { ALL_TEXT_FOR_TESTS, GLOSSARY, RIN_TEXT, TEVA_TEXT, reading, remedyFor } from '../text';

const REF = new Date('2026-11-22T00:00:00Z');
const CHARTS: Record<string, BirthChartInput> = {
  jammu1978: { year: 1978, month: 5, day: 13, hour: 19, minute: 30, latitude: 32.7266, longitude: 74.857, timezoneOffset: 5.5 },
  patna1981: { year: 1981, month: 7, day: 9, hour: 4, minute: 30, latitude: 25.5941, longitude: 85.1376, timezoneOffset: 5.5 },
  modi1950: { year: 1950, month: 9, day: 17, hour: 9, minute: 35, latitude: 23.7858, longitude: 72.6397, timezoneOffset: 5.5 },
  amitabh1942: { year: 1942, month: 10, day: 11, hour: 16, minute: 0, latitude: 25.4358, longitude: 81.8463, timezoneOffset: 5.5 },
  lucknow1996: { year: 1996, month: 8, day: 31, hour: 13, minute: 4, latitude: 26.8467, longitude: 80.9462, timezoneOffset: 5.5 },
  delhi1990: { year: 1990, month: 1, day: 15, hour: 6, minute: 30, latitude: 28.6139, longitude: 77.209, timezoneOffset: 5.5 },
  london1992: { year: 1992, month: 6, day: 10, hour: 14, minute: 20, latitude: 51.5074, longitude: -0.1278, timezoneOffset: 1 },
  sydney2001: { year: 2001, month: 12, day: 25, hour: 8, minute: 0, latitude: -33.8688, longitude: 151.2093, timezoneOffset: 11 },
  bengaluru2024: { year: 2024, month: 3, day: 10, hour: 9, minute: 15, latitude: 12.9716, longitude: 77.5946, timezoneOffset: 5.5 },
  mumbai1975: { year: 1975, month: 11, day: 2, hour: 23, minute: 45, latitude: 19.076, longitude: 72.8777, timezoneOffset: 5.5 },
  kolkata1965: { year: 1965, month: 2, day: 20, hour: 12, minute: 0, latitude: 22.5726, longitude: 88.3639, timezoneOffset: 5.5 },
  chennai2010: { year: 2010, month: 8, day: 5, hour: 5, minute: 10, latitude: 13.0827, longitude: 80.2707, timezoneOffset: 5.5 },
};
const SIGNS = ['Mesha', 'Vrisha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];

async function chartOf(k: string) {
  const res = await calculateBirthChart(CHARTS[k], { refDate: REF });
  const leg = toKundaliLegacy(res as any) as any;
  return { leg, lk: buildLalKitabChart(leg.planets) };
}
const houseOf = (lk: ReturnType<typeof buildLalKitabChart>, p: LkPlanet) => lk.placements.find(x => x.planet === p)!.house;
const synth = (m: Partial<Record<LkPlanet, number>>) => buildLalKitabChart(Object.entries(m).map(([name, house]) => ({ name, house: house! })));

describe('Lal Kitab house placement (houses from the Lagna, house 1 = Aries)', () => {
  for (const k of Object.keys(CHARTS)) {
    it(`${k}: every planet keeps its house from the Lagna; the fixed sign is house − 1`, async () => {
      const { leg, lk } = await chartOf(k);
      const lagnaIdx = SIGNS.indexOf(leg.lagna.sign);
      expect(lagnaIdx).toBeGreaterThanOrEqual(0);
      expect(lk.placements).toHaveLength(9);
      for (const pl of lk.placements) {
        const src = leg.planets.find((p: any) => p.name === pl.planet);
        const fromLagna = ((SIGNS.indexOf(src.sign) - lagnaIdx + 12) % 12) + 1;
        expect(pl.house).toBe(fromLagna);
        expect(pl.fixedSignIndex).toBe(pl.house - 1);
        expect(lk.houses[pl.house]).toContain(pl.planet);
      }
      // Rahu and Ketu are always six houses apart.
      expect(((houseOf(lk, 'Ketu') - houseOf(lk, 'Rahu') + 12) % 12)).toBe(6);
    });
  }
});

describe('Published charts (Kamal Kapoor) — same houses, then the Lal Kitab rules', () => {
  it('17 Sep 1950, 09:35, Vadnagar', async () => {
    const { leg, lk } = await chartOf('modi1950');
    expect(leg.lagna.sign).toBe('Tula');
    expect(lk.houses).toMatchObject({ 2: ['Moon', 'Mars'], 5: ['Jupiter'], 6: ['Rahu'], 11: ['Venus', 'Saturn'], 12: ['Sun', 'Mercury', 'Ketu'] });
    expect(lk.rins.map(r => r.key).sort()).toEqual(['ajanma', 'pitri', 'stri']); // Sun 12 · Mercury 12 · Moon 2
    expect(lk.teva.dharmi).toBe(true); // Saturn in the 11th
    expect(lk.placements.find(p => p.planet === 'Saturn')!.dharmi).toBe(true);
    expect(lk.placements.find(p => p.planet === 'Moon')!.exalted).toBe(true); // Moon in the 2nd
    expect(lk.masnui).toEqual(expect.arrayContaining([{ house: 12, pair: ['Sun', 'Mercury'], acts: 'Mars' }]));
  });
  it('11 Oct 1942, 16:00, Allahabad', async () => {
    const { leg, lk } = await chartOf('amitabh1942');
    expect(leg.lagna.sign).toBe('Kumbha');
    expect(lk.houses).toMatchObject({ 1: ['Ketu'], 4: ['Saturn'], 6: ['Jupiter'], 7: ['Rahu'], 9: ['Moon'] });
    expect([...lk.houses[8]].sort()).toEqual(['Mars', 'Mercury', 'Sun', 'Venus']);
    expect(lk.rins.map(r => r.key).sort()).toEqual(['bhai', 'stri']); // Mercury/Venus 8 · Rahu 7
    const mars = lk.placements.find(p => p.planet === 'Mars')!;
    expect(mars.pakkaGhar).toBe(true);
    expect(mars.sleeping).toBe(false); // pakka ghar is never sleeping
  });
});

describe('Reference tables (AstroSage Lal Kitab planet pages; Sushma Jee pakka ghar list)', () => {
  it('pakka ghar', () => {
    expect(PAKKA_GHAR).toEqual({ Sun: [1], Moon: [4], Mars: [3, 8], Mercury: [7, 6], Jupiter: [2, 5, 9, 12], Venus: [7], Saturn: [10, 8, 11], Rahu: [12], Ketu: [6] });
    // Every house is somebody's pakka ghar, as in the house → planet list.
    const all = new Set(Object.values(PAKKA_GHAR).flat());
    expect([...all].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
  it('exalted and debilitated houses', () => {
    expect(EXALTED).toEqual({ Sun: [1], Moon: [2], Mars: [10], Mercury: [6], Jupiter: [4], Venus: [12], Saturn: [7], Rahu: [3, 6], Ketu: [5, 9, 12] });
    expect(DEBILITATED).toEqual({ Sun: [7], Moon: [8], Mars: [4], Mercury: [12], Jupiter: [10], Venus: [6], Saturn: [1], Rahu: [8, 9, 11], Ketu: [6, 8] });
    // For the seven visible planets the debilitated house is opposite the exalted one.
    for (const p of ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as LkPlanet[]) {
      expect(DEBILITATED[p][0]).toBe(((EXALTED[p][0] + 5) % 12) + 1);
    }
  });
  it('flags dignity on a placement', () => {
    const c = synth({ Sun: 1, Moon: 8, Mars: 10, Jupiter: 2, Saturn: 7 });
    const by = (p: LkPlanet) => c.placements.find(x => x.planet === p)!;
    expect(by('Sun')).toMatchObject({ pakkaGhar: true, exalted: true, debilitated: false });
    expect(by('Moon')).toMatchObject({ pakkaGhar: false, exalted: false, debilitated: true });
    expect(by('Mars')).toMatchObject({ exalted: true });
    expect(by('Jupiter')).toMatchObject({ pakkaGhar: true });
    expect(by('Saturn')).toMatchObject({ exalted: true });
  });
  it('aspect table runs forward from houses 1–6 and 8', () => {
    expect(ASPECTS[1]).toEqual([7]); expect(ASPECTS[3]).toEqual([9, 11]); expect(ASPECTS[8]).toEqual([2]);
    for (const h of [7, 9, 10, 11, 12]) expect(ASPECTS[h]).toEqual([]);
    expect(aspectedBy(9).sort()).toEqual([3, 5]);
    expect(aspectedBy(1)).toEqual([]);
  });
});

describe('Sleeping planets and houses', () => {
  it('a planet that looks at no planet sleeps, unless it is in its pakka ghar', () => {
    const c = synth({ Sun: 3, Moon: 9, Mars: 5, Saturn: 10 });
    const by = (p: LkPlanet) => c.placements.find(x => x.planet === p)!;
    expect(by('Sun').sees).toEqual(['Moon']); expect(by('Sun').sleeping).toBe(false);   // 3 → 9 (Moon)
    expect(by('Mars').sleeping).toBe(false);                                            // 5 → 9 (Moon)
    expect(by('Moon').sleeping).toBe(true);                                             // 9 casts no aspect
    expect(by('Saturn').sleeping).toBe(false);                                          // 10 = pakka ghar
  });
  it('a house sleeps when it is empty and no planet looks at it', () => {
    const c = synth({ Sun: 3, Moon: 9, Mars: 5, Saturn: 10 });
    // 11 is aspected by 3 (Sun) → awake; 7 empty and 1 empty → asleep; 9 occupied.
    expect(c.sleepingHouses).toContain(7);
    expect(c.sleepingHouses).not.toContain(11);
    expect(c.sleepingHouses).not.toContain(9);
    expect(c.sleepingHouses).toContain(1); // nothing looks at the 1st in Lal Kitab
  });
  it('13 May 1978, 19:30, Jammu — worked by hand', async () => {
    const { lk } = await chartOf('jammu1978');
    // Ketu 5, Sun+Mercury 6, Venus 7, Jupiter 8, Moon+Mars 9, Saturn 10, Rahu 11.
    expect(lk.houses).toMatchObject({ 5: ['Ketu'], 6: ['Sun', 'Mercury'], 7: ['Venus'], 8: ['Jupiter'], 9: ['Moon', 'Mars'], 10: ['Saturn'], 11: ['Rahu'] });
    // Awake: Mercury (pakka 6), Venus (pakka 7), Saturn (pakka 10), Ketu (5 → 9 has Moon, Mars).
    expect(lk.placements.filter(p => p.sleeping).map(p => p.planet).sort()).toEqual(['Jupiter', 'Mars', 'Moon', 'Rahu', 'Sun']);
    // Empty houses 1, 2, 3, 4, 12: 2 is seen from 8 (Jupiter), 12 from 6 (Sun, Mercury).
    expect(lk.sleepingHouses).toEqual([1, 3, 4]);
    expect(lk.rins.map(r => r.key)).toEqual(['atma']); // Ketu in the 5th
    expect(lk.masnui).toEqual([{ house: 6, pair: ['Sun', 'Mercury'], acts: 'Mars' }]);
  });
  it('9 Jul 1981, 04:30, Patna — worked by hand', async () => {
    const { leg, lk } = await chartOf('patna1981');
    expect(leg.lagna.sign).toBe('Mithuna');
    expect(lk.houses).toMatchObject({ 1: ['Sun', 'Mercury', 'Mars'], 2: ['Venus', 'Rahu'], 4: ['Moon', 'Jupiter', 'Saturn'], 8: ['Ketu'] });
    // Sun (pakka 1), Moon (pakka 4) and Ketu (8 → 2 has Venus, Rahu) are awake.
    expect(lk.placements.filter(p => !p.sleeping).map(p => p.planet).sort()).toEqual(['Ketu', 'Moon', 'Sun']);
    expect(lk.sleepingHouses).toEqual([3, 5, 9, 11, 12]);
    expect(lk.rins.map(r => r.key).sort()).toEqual(['bhai', 'pitri', 'stri']);
    expect(lk.teva.dharmi).toBe(true); // Jupiter and Saturn together
    expect(lk.masnui).toEqual(expect.arrayContaining([{ house: 4, pair: ['Moon', 'Saturn'], acts: 'Ketu', quality: 'debilitated' }]));
  });
});

describe('Rin (debt) triggers', () => {
  const cases: Array<[string, Partial<Record<LkPlanet, number>>, string]> = [
    ['Venus in 9', { Venus: 9 }, 'pitri'], ['Rahu in 12', { Rahu: 12, Ketu: 6 }, 'pitri'], ['Mercury in 5', { Mercury: 5 }, 'pitri'],
    ['Saturn in 5', { Saturn: 5 }, 'atma'], ['Ketu in 4', { Ketu: 4, Rahu: 10 }, 'matri'],
    ['Moon in 7', { Moon: 7 }, 'stri'], ['Sun in 2', { Sun: 2 }, 'stri'], ['Venus in 1', { Venus: 1 }, 'bhai'],
    ['Mercury in 8', { Mercury: 8 }, 'bhai'], ['Moon in 3', { Moon: 3 }, 'behan'], ['Mars in 11', { Mars: 11 }, 'jaalim'],
    ['Sun in 10', { Sun: 10 }, 'jaalim'], ['Mars in 12', { Mars: 12 }, 'ajanma'], ['Moon in 6', { Moon: 6 }, 'prakritik'],
  ];
  for (const [name, m, key] of cases) {
    it(`${name} → ${key}`, () => { expect(synth(m).rins.map(r => r.key)).toContain(key); });
  }
  it('Moon in 6 gives both Behan and Prakritik Rin', () => {
    expect(synth({ Moon: 6 }).rins.map(r => r.key).sort()).toEqual(['behan', 'prakritik']);
  });
  it('no debt for planets outside their trigger houses', () => {
    expect(synth({ Sun: 1, Moon: 4, Mars: 3, Mercury: 7, Jupiter: 2, Venus: 7, Saturn: 10, Rahu: 3, Ketu: 9 }).rins).toEqual([]);
  });
  it('lists the nine debts in the documented order', () => {
    expect(RINS.map(r => r.key)).toEqual(['pitri', 'atma', 'matri', 'stri', 'bhai', 'behan', 'jaalim', 'ajanma', 'prakritik']);
  });
});

describe('Teva types and masnui planets', () => {
  it('andha teva: enemies together in the 10th', () => {
    expect(synth({ Sun: 10, Saturn: 10 }).teva.blind).toBe(true);
    expect(synth({ Sun: 10, Mars: 10 }).teva.blind).toBe(false); // friends
  });
  it('ratandha teva: Sun 4th and Saturn 7th', () => {
    expect(synth({ Sun: 4, Saturn: 7 }).teva.semiBlind).toBe(true);
    expect(synth({ Sun: 7, Saturn: 4 }).teva.semiBlind).toBe(false);
  });
  it('dharmi teva and dharmi planets', () => {
    expect(synth({ Rahu: 4, Ketu: 10 }).teva.dharmi).toBe(true);
    expect(synth({ Moon: 3, Ketu: 3, Rahu: 9 }).placements.find(p => p.planet === 'Ketu')!.dharmi).toBe(true);
    expect(synth({ Saturn: 2, Jupiter: 2 }).teva.dharmi).toBe(true);
    expect(synth({ Saturn: 2, Jupiter: 3 }).teva.dharmi).toBe(false);
  });
  it('nabaligh teva: kendras hold only Mercury, Saturn, Rahu or Ketu', () => {
    expect(synth({ Mercury: 1, Saturn: 4, Sun: 2 }).teva.nabaligh).toBe(true);
    expect(synth({ Sun: 1 }).teva.nabaligh).toBe(false);
  });
  it('masnui pairs in one house', () => {
    expect(synth({ Sun: 5, Venus: 5 }).masnui).toEqual([{ house: 5, pair: ['Sun', 'Venus'], acts: 'Jupiter' }]);
    expect(synth({ Sun: 5, Venus: 6 }).masnui).toEqual([]);
  });
  it('kaayam: no enemy beside it or looking at it', () => {
    const c = synth({ Sun: 1, Saturn: 7, Moon: 4 });
    // Saturn (7) is looked at from the 1st by its enemy the Sun → not kaayam; the Moon is.
    expect(c.placements.find(p => p.planet === 'Saturn')!.kaayam).toBe(false);
    expect(c.placements.find(p => p.planet === 'Moon')!.kaayam).toBe(true);
  });
});

describe('Varshphal (annual) table', () => {
  it('has 120 years, each a permutation of the 12 houses', () => {
    expect(VARSHPHAL).toHaveLength(120);
    for (const row of VARSHPHAL) expect([...row].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
  it('inside every 12-year block each column also uses each house once', () => {
    for (let b = 0; b < 10; b++) for (let c = 0; c < 12; c++) {
      const col = VARSHPHAL.slice(b * 12, b * 12 + 12).map(r => r[c]);
      expect(new Set(col).size).toBe(12);
    }
  });
  it('matches the published worked example: Mars in the 1st sits in the 3rd in the 16th year', () => {
    expect(lalKitabVarshphal([{ name: 'Mars', house: 1 }], 16)!.placements[0].yearHouse).toBe(3);
  });
  it('keeps the four corrected cells', () => {
    expect(VARSHPHAL[0]).toEqual([1, 9, 10, 3, 5, 2, 11, 7, 6, 12, 4, 8]);
    expect(VARSHPHAL[42][6]).toBe(1); expect(VARSHPHAL[116][4]).toBe(6); expect(VARSHPHAL[119][0]).toBe(6);
  });
  it('running year of life and the 35-year cycle', () => {
    expect(runningYearOfLife('1978-05-13', new Date(2026, 10, 22))).toBe(49);
    expect(runningYearOfLife('1981-07-09', new Date(2026, 6, 8))).toBe(45);
    expect(runningYearOfLife('1981-07-09', new Date(2026, 6, 9))).toBe(46);
    expect(lalKitabVarshphal([], 0)).toBeNull(); expect(lalKitabVarshphal([], 121)).toBeNull();
    expect(CYCLE_35.reduce((s, c) => s + c.years, 0)).toBe(35);
    expect(cyclePlanetAt(0).planet).toBe('Saturn');
    expect(cyclePlanetAt(14).planet).toBe('Ketu');
    expect(cyclePlanetAt(34.5).planet).toBe('Mercury');
    expect(cyclePlanetAt(48.5)).toMatchObject({ planet: 'Ketu', round: 2 });
  });
});

describe('Wording rules', () => {
  const texts = [
    ...ALL_TEXT_FOR_TESTS(),
    ...GLOSSARY.flatMap(g => [...g.term, ...g.def]),
    ...Object.values(RIN_TEXT).flatMap(r => [...r.name, ...r.meaning, ...r.remedy]),
    ...Object.values(TEVA_TEXT).flatMap(t => [...t.name, ...t.rule, ...t.meaning]),
  ];
  it('no death, disease, certainty or gemstone wording', () => {
    const bad = /\b(death|die|dies|dying|disease|illness|cancer|fatal|guarantee|guaranteed|certainly|definitely|scientifically|gemstone|ruby|sapphire|emerald|neelam|pukhraj|curse|doom)\b|मृत्यु|मौत|रोग|बीमारी|गारंटी|निश्चित रूप से|रत्न/i;
    for (const t of texts) expect(t, t).not.toMatch(bad);
  });
  it('every planet has a reading and a remedy for every house, in both languages', () => {
    for (const p of LK_PLANETS) for (let h = 1; h <= 12; h++) for (const l of ['en', 'hi'] as const) {
      expect(reading(p, h, l).length).toBeGreaterThan(20);
      expect(remedyFor(p, h, l).length).toBeGreaterThan(15);
    }
  });
});

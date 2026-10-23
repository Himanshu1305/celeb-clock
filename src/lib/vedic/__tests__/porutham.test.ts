import { describe, it, expect } from 'vitest';
import { calculatePorutham } from '../porutham';

describe('porutham (10-porutham South Indian matching)', () => {
  it('returns exactly 10 poruthams with a verdict', () => {
    const r = calculatePorutham({ nakshatra: 'Rohini', rashiIndex: 1 }, { nakshatra: 'Hasta', rashiIndex: 5 });
    expect(r.poruthams).toHaveLength(10);
    expect(r.total).toBe(10);
    expect(['Excellent', 'Good', 'Average', 'Challenging']).toContain(r.verdict);
    expect(r.metCount).toBe(r.poruthams.filter(p => p.met).length);
  });

  it('flags Rajju dosha when both stars share a Rajju group', () => {
    // Ashwini and Mula are both in the Pada (feet) rajju.
    const r = calculatePorutham({ nakshatra: 'Ashwini', rashiIndex: 0 }, { nakshatra: 'Mula', rashiIndex: 8 });
    const rajju = r.poruthams.find(p => p.key === 'rajju')!;
    expect(rajju.met).toBe(false);
    expect(rajju.essential).toBe(true);
    expect(r.essentialsMet).toBe(false);
  });

  it('flags Vedha for a classical obstructing pair', () => {
    // Ashwini <-> Jyeshtha is a vedha pair.
    const r = calculatePorutham({ nakshatra: 'Ashwini', rashiIndex: 0 }, { nakshatra: 'Jyeshtha', rashiIndex: 7 });
    expect(r.poruthams.find(p => p.key === 'vedha')!.met).toBe(false);
  });

  it('Stree Deergha needs the boy star more than 9 from the girl star', () => {
    // girl Ashwini(0) -> boy Hasta(12): count 13 > 9 => met
    const far = calculatePorutham({ nakshatra: 'Ashwini', rashiIndex: 0 }, { nakshatra: 'Hasta', rashiIndex: 5 });
    expect(far.poruthams.find(p => p.key === 'stree-deergha')!.met).toBe(true);
    // girl Ashwini(0) -> boy Pushya(7): count 8 <= 9 => not met
    const near = calculatePorutham({ nakshatra: 'Ashwini', rashiIndex: 0 }, { nakshatra: 'Pushya', rashiIndex: 3 });
    expect(near.poruthams.find(p => p.key === 'stree-deergha')!.met).toBe(false);
  });

  it('same star + same sign: strong Yoni/Gana but Rajju dosha', () => {
    const r = calculatePorutham({ nakshatra: 'Rohini', rashiIndex: 1 }, { nakshatra: 'Rohini', rashiIndex: 1 });
    expect(r.poruthams.find(p => p.key === 'yoni')!.met).toBe(true);
    expect(r.poruthams.find(p => p.key === 'gana')!.met).toBe(true);
    expect(r.poruthams.find(p => p.key === 'rajju')!.met).toBe(false);
  });

  // M10 regression — standard Tamil tables (references fetched 2026-10-24):
  //  Dina good counts 2,4,6,8,9,11,13,15,18,20,24,26 — astroved.com/articles/nakshatra-porutham,
  //    findyourfate.com/indianastro/10porutham.htm; same-star lists from prokerala dina-porutham.htm.
  //  Vedha triple Mrigashira–Chitra–Dhanishtha — epanchang.com/Vedha-Porutham, findyourfate.com.
  //  Vasya table — prokerala.com/astrology/porutham/vasya-porutham.htm, astroved.com/articles/vasya-porutham.
  const dina = (g: string, b: string) =>
    calculatePorutham({ nakshatra: g, rashiIndex: 0 }, { nakshatra: b, rashiIndex: 0 }).poruthams.find(p => p.key === 'dina')!.met;

  it('Dina: counts 10, 19, 22, 17, 27 do not agree (were wrongly "good")', () => {
    // girl Ashwini (#1) → boy at count N is NAK_ORDER[N-1]
    expect(dina('Ashwini', 'Magha')).toBe(false);          // count 10
    expect(dina('Ashwini', 'Mula')).toBe(false);           // count 19
    expect(dina('Ashwini', 'Shravana')).toBe(false);       // count 22
    expect(dina('Ashwini', 'Anuradha')).toBe(false);       // count 17
    expect(dina('Ashwini', 'Revati')).toBe(false);         // count 27
  });

  it('Dina: the favourable counts agree', () => {
    expect(dina('Ashwini', 'Bharani')).toBe(true);         // 2
    expect(dina('Ashwini', 'Ashlesha')).toBe(true);        // 9
    expect(dina('Ashwini', 'Purva Ashadha')).toBe(true);   // 20
    expect(dina('Ashwini', 'Uttara Bhadrapada')).toBe(true); // 26
    expect(dina('Ashwini', 'Krittika')).toBe(false);       // 3
  });

  it('Dina: same star agrees only for the listed stars', () => {
    expect(dina('Rohini', 'Rohini')).toBe(true);           // uttamam list
    expect(dina('Pushya', 'Pushya')).toBe(true);           // madhyamam list
    expect(dina('Bharani', 'Bharani')).toBe(false);        // not listed
    expect(dina('Jyeshtha', 'Jyeshtha')).toBe(false);
  });

  it('Vedha: Mrigashira, Chitra and Dhanishtha are mutually vedha', () => {
    const v = (g: string, b: string) =>
      calculatePorutham({ nakshatra: g, rashiIndex: 0 }, { nakshatra: b, rashiIndex: 0 }).poruthams.find(p => p.key === 'vedha')!.met;
    expect(v('Mrigashira', 'Chitra')).toBe(false);
    expect(v('Chitra', 'Dhanishtha')).toBe(false);
    expect(v('Dhanishtha', 'Mrigashira')).toBe(false);
    expect(v('Hasta', 'Shatabhisha')).toBe(false);
    expect(v('Mrigashira', 'Hasta')).toBe(true);
  });

  it('Vasya: standard Tamil Rasi Vasya table', () => {
    const vs = (g: number, b: number) =>
      calculatePorutham({ nakshatra: 'Ashwini', rashiIndex: g }, { nakshatra: 'Hasta', rashiIndex: b }).poruthams.find(p => p.key === 'vasya')!.met;
    expect(vs(0, 4)).toBe(true);    // Mesha–Simha (Mesha → Simha)
    expect(vs(1, 6)).toBe(true);    // Vrishabha–Tula
    expect(vs(9, 10)).toBe(true);   // Makara–Kumbha
    expect(vs(10, 0)).toBe(true);   // Kumbha–Mesha
    expect(vs(0, 0)).toBe(false);   // same sign not in table
    expect(vs(0, 1)).toBe(false);   // Mesha–Vrishabha
    expect(vs(2, 8)).toBe(false);   // Mithuna–Dhanu
  });
});

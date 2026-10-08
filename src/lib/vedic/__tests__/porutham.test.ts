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
});

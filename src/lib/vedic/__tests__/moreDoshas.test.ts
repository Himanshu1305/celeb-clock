import { describe, it, expect } from 'vitest';
import {
  computeGrahanDosha, computePitraDosha, computeMoolDosha, computeNadiInfo,
  doshaInputFromKundali, type DoshaChartInput,
} from '../moreDoshas';

// helper: longitude for sign (1-based) + degree
const L = (sign: number, deg: number) => (sign - 1) * 30 + deg;

function chart(partial: Partial<DoshaChartInput> & { planets: DoshaChartInput['planets'] }): DoshaChartInput {
  return { moonNakshatra: 'Rohini', moonPada: 2, ...partial };
}

describe('moreDoshas — Grahan', () => {
  it('Surya Grahan, tight gap → strong', () => {
    const r = computeGrahanDosha(chart({ planets: [
      { name: 'Sun', signIndex: 5, house: 1, longitude: L(5, 4) },
      { name: 'Rahu', signIndex: 5, house: 1, longitude: L(5, 6) },
      { name: 'Moon', signIndex: 2, house: 10, longitude: L(2, 10) },
      { name: 'Ketu', signIndex: 11, house: 7, longitude: L(11, 6) },
    ] }));
    expect(r.present).toBe(true);
    expect(r.surya).toBe(true);
    expect(r.chandra).toBe(false);
    expect(r.grade).toBe('strong');
  });

  it('no node with luminaries → none', () => {
    const r = computeGrahanDosha(chart({ planets: [
      { name: 'Sun', signIndex: 5, house: 1, longitude: L(5, 4) },
      { name: 'Moon', signIndex: 2, house: 10, longitude: L(2, 10) },
      { name: 'Rahu', signIndex: 9, house: 5, longitude: L(9, 6) },
      { name: 'Ketu', signIndex: 3, house: 11, longitude: L(3, 6) },
    ] }));
    expect(r.present).toBe(false);
    expect(r.grade).toBe('none');
  });
});

describe('moreDoshas — Pitra', () => {
  it('Sun + Rahu and Rahu in the 9th → strong', () => {
    const r = computePitraDosha(chart({ planets: [
      { name: 'Sun', signIndex: 5, house: 9, longitude: L(5, 10) },
      { name: 'Rahu', signIndex: 5, house: 9, longitude: L(5, 20) },
      { name: 'Moon', signIndex: 2, house: 6, longitude: L(2, 10) },
    ] }));
    expect(r.present).toBe(true);
    expect(r.grade).toBe('strong'); // 2 (Sun+Rahu) + 1 (Rahu in 9th) + 1 (Sun in 9th with Rahu)
    expect(r.reasons.length).toBe(3);
  });

  it('Sun + Rahu outside the 9th → moderate; Saturn in 9th alone adds nothing', () => {
    const r = computePitraDosha(chart({ planets: [
      { name: 'Sun', signIndex: 5, house: 1, longitude: L(5, 10) },
      { name: 'Rahu', signIndex: 5, house: 1, longitude: L(5, 20) },
      { name: 'Saturn', signIndex: 1, house: 9, longitude: L(1, 5) },
    ] }));
    expect(r.grade).toBe('moderate');
  });

  it('D5: Mars alone in the 9th no longer triggers Pitra Dosha', () => {
    const r = computePitraDosha(chart({ planets: [
      { name: 'Sun', signIndex: 5, house: 1, longitude: L(5, 10) },
      { name: 'Mars', signIndex: 1, house: 9, longitude: L(1, 12) },
      { name: 'Rahu', signIndex: 9, house: 5, longitude: L(9, 20) },
      { name: 'Ketu', signIndex: 3, house: 11, longitude: L(3, 20) },
    ] }));
    expect(r.present).toBe(false);
  });

  it('Ketu alone in the 9th, or Sun–Saturn outside the 9th → none', () => {
    const r = computePitraDosha(chart({ planets: [
      { name: 'Sun', signIndex: 5, house: 1, longitude: L(5, 10) },
      { name: 'Saturn', signIndex: 5, house: 1, longitude: L(5, 15) },
      { name: 'Ketu', signIndex: 1, house: 9, longitude: L(1, 20) },
      { name: 'Rahu', signIndex: 7, house: 3, longitude: L(7, 20) },
    ] }));
    expect(r.present).toBe(false);
  });

  it('Rahu alone in the 9th → mild', () => {
    const r = computePitraDosha(chart({ planets: [
      { name: 'Sun', signIndex: 5, house: 1, longitude: L(5, 10) },
      { name: 'Rahu', signIndex: 1, house: 9, longitude: L(1, 20) },
    ] }));
    expect(r.grade).toBe('mild');
  });
});

describe('moreDoshas — Mool', () => {
  // D7 reference: Drik Panchang Gandamool table (drikpanchang.com/panchang/gandamool-dates-timings.html, 23 Oct 2026).
  it.each([
    ['Ashwini', 'the father'], ['Ashlesha', 'the mother'], ['Magha', 'the father'],
    ['Jyeshtha', 'younger siblings'], ['Mula', 'the father or grandfather'], ['Revati', 'the mother'],
  ])('%s → %s (Drik Panchang)', (nak, rel) => {
    const r = computeMoolDosha(chart({ planets: [], moonNakshatra: nak, moonPada: 2 }));
    expect(r.relationNote).toBe(`traditionally linked to ${rel}`);
    expect(r.detail).not.toMatch(/mother-in-law/);
  });

  it('Mula pada 1 → present, strong', () => {
    const r = computeMoolDosha(chart({ planets: [], moonNakshatra: 'Mula', moonPada: 1 }));
    expect(r.present).toBe(true);
    expect(r.grade).toBe('strong');
  });
  it('Revati → present but mild', () => {
    const r = computeMoolDosha(chart({ planets: [], moonNakshatra: 'Revati', moonPada: 2 }));
    expect(r.present).toBe(true);
    expect(r.grade).toBe('mild');
  });
  it('non-mool star → none', () => {
    const r = computeMoolDosha(chart({ planets: [], moonNakshatra: 'Rohini', moonPada: 2 }));
    expect(r.present).toBe(false);
    expect(r.grade).toBe('none');
  });
});

describe('moreDoshas — Nadi + input adapter', () => {
  it('reports own Nadi from Moon nakshatra', () => {
    expect(computeNadiInfo(chart({ planets: [], moonNakshatra: 'Mula', moonPada: 1 })).nadi).toBe('Adi');
    expect(computeNadiInfo(chart({ planets: [], moonNakshatra: 'Rohini', moonPada: 2 })).nadi).toBe('Antya');
  });

  it('doshaInputFromKundali maps the legacy response shape (and rejects junk)', () => {
    const ok = doshaInputFromKundali({
      planets: [{ name: 'Sun', signIndex: 5, house: 1, longitude: 124 }],
      nakshatra: { nakshatra: 'Mula', pada: 1 },
    });
    expect(ok).not.toBeNull();
    expect(ok!.moonNakshatra).toBe('Mula');
    expect(doshaInputFromKundali({ planets: [], nakshatra: { nakshatra: 'Mula', pada: 1 } })).toBeNull();
    expect(doshaInputFromKundali({ planets: [{ name: 'Sun', signIndex: 5, house: 1, longitude: 1 }], nakshatra: { nakshatra: 'Nonsense', pada: 1 } })).toBeNull();
  });
});

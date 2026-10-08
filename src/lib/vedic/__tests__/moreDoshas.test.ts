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
  it('Sun + node (and malefic in 9th) → strong', () => {
    const r = computePitraDosha(chart({ planets: [
      { name: 'Sun', signIndex: 5, house: 1, longitude: L(5, 10) },
      { name: 'Rahu', signIndex: 5, house: 1, longitude: L(5, 20) },
      { name: 'Saturn', signIndex: 1, house: 9, longitude: L(1, 5) },
      { name: 'Moon', signIndex: 2, house: 10, longitude: L(2, 10) },
    ] }));
    expect(r.present).toBe(true);
    expect(r.grade).toBe('strong');
    expect(r.reasons.length).toBeGreaterThanOrEqual(2);
  });

  it('clean Sun, no malefic in 9th → none', () => {
    const r = computePitraDosha(chart({ planets: [
      { name: 'Sun', signIndex: 5, house: 1, longitude: L(5, 10) },
      { name: 'Rahu', signIndex: 9, house: 5, longitude: L(9, 20) },
      { name: 'Saturn', signIndex: 3, house: 11, longitude: L(3, 5) },
      { name: 'Moon', signIndex: 2, house: 10, longitude: L(2, 10) },
    ] }));
    expect(r.present).toBe(false);
  });
});

describe('moreDoshas — Mool', () => {
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

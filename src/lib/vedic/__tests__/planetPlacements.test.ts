import { describe, it, expect } from 'vitest';
import {
  PLANET_SLUGS, SIGNS, HOUSES,
  dignityOf, placementInSign, placementInHouse,
} from '../planetPlacements';

describe('planet-in-sign / planet-in-house engine', () => {
  it('has the classical exaltation & debilitation dignities', () => {
    const exalt: Array<[any, string]> = [['sun', 'aries'], ['moon', 'taurus'], ['mars', 'capricorn'], ['mercury', 'virgo'], ['jupiter', 'cancer'], ['venus', 'pisces'], ['saturn', 'libra']];
    for (const [p, s] of exalt) expect(dignityOf(p, s), `${p} exalt`).toBe('exalted');
    const debil: Array<[any, string]> = [['sun', 'libra'], ['moon', 'scorpio'], ['mars', 'cancer'], ['mercury', 'pisces'], ['jupiter', 'capricorn'], ['venus', 'virgo'], ['saturn', 'aries']];
    for (const [p, s] of debil) expect(dignityOf(p, s), `${p} debil`).toBe('debilitated');
  });

  it('marks own-sign placements', () => {
    expect(dignityOf('sun', 'leo')).toBe('moolatrikona'); // Leo is Sun's moolatrikona
    expect(dignityOf('mars', 'scorpio')).toBe('own');
    expect(dignityOf('saturn', 'capricorn')).toBe('own');
  });

  it('builds a 4-section reading for every planet in every sign (108), all distinct', () => {
    const bodies = new Set<string>();
    for (const p of PLANET_SLUGS) for (const s of SIGNS) {
      const pl = placementInSign(p, s.slug);
      expect(pl, `${p}/${s.slug}`).toBeTruthy();
      expect(pl!.sections).toHaveLength(4);
      for (const sec of pl!.sections) expect(sec.text.length).toBeGreaterThan(40);
      bodies.add(pl!.sections.map(x => x.text).join('|'));
    }
    expect(bodies.size).toBe(108);
  });

  it('builds a 4-section reading for every planet in every house (108), all distinct', () => {
    const bodies = new Set<string>();
    for (const p of PLANET_SLUGS) for (const h of HOUSES) {
      const pl = placementInHouse(p, h.num);
      expect(pl, `${p}/${h.num}`).toBeTruthy();
      expect(pl!.sections).toHaveLength(4);
      bodies.add(pl!.sections.map(x => x.text).join('|'));
    }
    expect(bodies.size).toBe(108);
  });

  it('rejects invalid planet/sign/house', () => {
    expect(placementInSign('pluto' as any, 'aries')).toBeNull();
    expect(placementInSign('sun', 'ophiuchus')).toBeNull();
    expect(placementInHouse('sun', 13)).toBeNull();
    expect(placementInHouse('sun', 0)).toBeNull();
  });
});

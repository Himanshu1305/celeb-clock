import { describe, it, expect } from 'vitest';
import { YOGAS, YOGA_SLUGS, yogaBySlug } from '../yogaExplainers';

describe('yoga explainers data', () => {
  it('has unique slugs and full content for each yoga', () => {
    expect(new Set(YOGA_SLUGS).size).toBe(YOGAS.length);
    for (const y of YOGAS) {
      expect(y.howItForms.length).toBeGreaterThan(40);
      expect(y.signifies.length).toBeGreaterThan(30);
      expect(y.strengthNote.length).toBeGreaterThan(30);
      expect(y.care.length).toBeGreaterThan(20);
    }
  });

  it('every worker/prerender slug resolves', () => {
    for (const s of YOGA_SLUGS) expect(yogaBySlug(s)).toBeTruthy();
    expect(yogaBySlug('not-a-yoga')).toBeUndefined();
  });

  it('includes the five Pancha Mahapurusha yogas', () => {
    const mp = YOGAS.filter(y => y.category === 'Pancha Mahapurusha').map(y => y.slug);
    expect(mp.sort()).toEqual(['bhadra-yoga', 'hamsa-yoga', 'malavya-yoga', 'ruchaka-yoga', 'shasha-yoga'].sort());
  });
});

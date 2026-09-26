import { describe, it, expect } from 'vitest';
import { VEDIC_TERMS, getTermDef, glossInline } from '../termDefinitions';

describe('Part AI — shared term-definition mechanism', () => {
  // Every term the spec requires must exist (Part 1).
  const required = ['lagna','rashi','nakshatra','dasha','antardasha','pratyantardasha','yoga','dosha',
    'ashtakoota','navamsa','kendra','trikona','yogakaraka','shadbala','kaalsarp','manglik','ayanamsa'];
  it('covers every term the spec requires', () => {
    for (const id of required) expect(getTermDef(id), id).toBeTruthy();
  });
  it('the sitewide-missing term (ayanamsa) is defined once, impact-first', () => {
    const d = getTermDef('ayanamsa')!;
    expect(d.impact).toMatch(/why your Vedic sign can differ/i); // impact stated first
    expect(d.why).toMatch(/sidereal|Lahiri/i);
  });
  it('getTermDef is case-insensitive; unknown → null', () => {
    expect(getTermDef('LAGNA')?.term).toMatch(/Lagna/);
    expect(getTermDef('not-a-term')).toBeNull();
  });
  it('glossInline returns a short parenthetical for prose, "" for unknown', () => {
    expect(glossInline('shadbala')).toMatch(/strong/i);
    expect(glossInline('nope')).toBe('');
  });
  it('every entry is impact-first (has a non-empty impact string)', () => {
    for (const [k, d] of Object.entries(VEDIC_TERMS)) {
      expect(d.impact && d.impact.length > 0, k).toBe(true);
      expect(d.term && d.term.length > 0, k).toBe(true);
    }
  });
});

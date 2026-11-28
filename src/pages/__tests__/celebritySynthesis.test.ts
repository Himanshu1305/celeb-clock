// @vitest-environment jsdom
/** B23 — the celebrity intro paragraph is whole sentences: no mid-word cuts, no "the The", no fixed "archer". */
import { describe, it, expect } from 'vitest';
import { buildPersonalitySynthesis, firstSentence } from '../CelebrityPage';
import { WESTERN_ZODIAC_PROFILES, LIFE_PATH_EXTENDED } from '@/data/astrologicalData';

describe('buildPersonalitySynthesis', () => {
  it('S1 — every sign × every Life Path reads cleanly', () => {
    for (const [sign, zp] of Object.entries(WESTERN_ZODIAC_PROFILES)) for (const [lp, lpp] of Object.entries(LIFE_PATH_EXTENDED)) {
      const t = buildPersonalitySynthesis('Test Person', zp, null, Number(lp), lpp, null, sign, null, null);
      expect(t, `${sign}/${lp}`).not.toMatch(/the The\b/);
      if (sign !== 'Sagittarius') expect(t).not.toMatch(/\barcher\b/i);
      expect(t.trim()).toMatch(/[.!?”"]$/);
      expect(t).toMatch(new RegExp(`is an? ${sign}`));
    }
  });
  it('S2 — firstSentence never truncates mid-word', () => {
    expect(firstSentence('Scorpio is intense. It is ruled by Pluto.')).toBe('Scorpio is intense.');
    expect(firstSentence('No full stop here')).toBe('No full stop here.');
  });
});

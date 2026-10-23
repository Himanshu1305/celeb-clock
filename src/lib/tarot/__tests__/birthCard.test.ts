import { describe, it, expect } from 'vitest';
import { tarotBirthCards, tarotBirthCardsFromIso, describeBirthCardWorking } from '../birthCard';
import { MAJOR_ARCANA, getTarotBirthCards } from '@/data/tarotData';

// Audit N7 — tarot birth card (Mary K. Greer method: month + day + year, digits added until <= 22).
// Reference worked examples (fetched Oct 2026):
//   [B] biddytarot.com "Tarot Birth Cards", Method 3 (Mary Greer): 7 Apr 1969 → 7+4+1969 = 1980 → 18 (Moon) → 9 (Hermit);
//       headings "Fool (22/0) & Emperor (4)" and "Sun (19), Wheel of Fortune (10) & Magician (1)".
//   [A] angelorum.co "How to calculate your personality and soul cards" (Mary K Greer):
//       13 Apr 1975 → 1992 → 21 (World) → 3 (Empress); 9 Jul 1984 → 2000 → 2;
//       19 Jan 2000 → 2020 → 4; 5 Dec 1989 → 2006 → 8; "22 corresponds to 0, the Fool, with 4, the Emperor";
//       "when the sum is 19 ... cards 1, 10 and 19".
//   [D] tools.devcomma.com/en/calculators/arcana, "Personality & Soul" mode: reduce month+day+year to 22 or less;
//       22 shown as The Fool (22/0) then 2+2 = 4 The Emperor; single digit = both cards.
describe('tarotBirthCards — published worked examples', () => {
  it('7 Apr 1969 → The Moon (18) + The Hermit (9) [B]', () => {
    const r = tarotBirthCards(7, 4, 1969);
    expect(r.total).toBe(1980);
    expect(r.cards).toEqual([18, 9]);
  });
  it('13 Apr 1975 → The World (21) + The Empress (3) [A]', () => {
    expect(tarotBirthCards(13, 4, 1975).cards).toEqual([21, 3]);
  });
  it('9 Jul 1984 → total 2000 → The High Priestess (2) alone [A]', () => {
    const r = tarotBirthCards(9, 7, 1984);
    expect(r.total).toBe(2000);
    expect(r.cards).toEqual([2]);
  });
  it('19 Jan 2000 → total 2020 → The Emperor (4) [A]', () => {
    const r = tarotBirthCards(19, 1, 2000);
    expect(r.total).toBe(2020);
    expect(r.cards).toEqual([4]);
  });
  it('5 Dec 1989 → total 2006 → Strength (8) [A]', () => {
    const r = tarotBirthCards(5, 12, 1989);
    expect(r.total).toBe(2006);
    expect(r.cards).toEqual([8]);
  });
});

describe('tarotBirthCards — convention cases [A][B][D]', () => {
  it('total reducing to 22 → The Fool (0) + The Emperor (4): 5 Apr 1975 → 1984 → 22', () => {
    expect(tarotBirthCards(5, 4, 1975).cards).toEqual([0, 4]);
  });
  it('total reducing to 19 → The Sun, Wheel of Fortune, The Magician: 1 Jan 1979 → 1981 → 19', () => {
    expect(tarotBirthCards(1, 1, 1979).cards).toEqual([19, 10, 1]);
  });
  it('digit sum above 22 is reduced again: 1 Jan 1997 → 1999 → 28 → 10 → 1', () => {
    expect(tarotBirthCards(1, 1, 1997).cards).toEqual([10, 1]);
  });
  it('audit N7 panel case: 31 Aug 1996 → 2035 → Wheel of Fortune (10) + The Magician (1)', () => {
    const r = tarotBirthCards(31, 8, 1996);
    expect(r.total).toBe(2035);
    expect(r.cards).toEqual([10, 1]);
    expect(describeBirthCardWorking(31, 8, 1996)).toBe('8 + 31 + 1996 = 2035 → 2+0+3+5 = 10 → 1+0 = 1');
  });
  it('ISO helper matches', () => {
    expect(tarotBirthCardsFromIso('1996-08-31')?.cards).toEqual([10, 1]);
    expect(tarotBirthCardsFromIso('bad')).toBeNull();
  });
});

describe('MAJOR_ARCANA data — all 22 cards, Rider–Waite numbering', () => {
  const RWS = ['The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor', 'The Hierophant',
    'The Lovers', 'The Chariot', 'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice', 'The Hanged Man',
    'Death', 'Temperance', 'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'];
  it('has exactly cards 0–21 with the standard names and full text', () => {
    expect(Object.keys(MAJOR_ARCANA).map(Number).sort((a, b) => a - b)).toEqual(RWS.map((_, i) => i));
    RWS.forEach((name, i) => {
      const c = MAJOR_ARCANA[i];
      expect(c.name, `card ${i}`).toBe(name);
      for (const f of ['upright', 'reversed', 'affirmation', 'deepMeaning', 'love', 'career', 'health', 'spirituality'] as const) {
        expect(c[f].length, `${name}.${f}`).toBeGreaterThan(40);
      }
      expect(c.keywords.length).toBeGreaterThanOrEqual(3);
      expect(c.deepMeaning).not.toMatch(/Life Path|Master Number/);
    });
  });
  it('getTarotBirthCards returns card objects in order', () => {
    expect(getTarotBirthCards(31, 8, 1996).cards.map(c => c.name)).toEqual(['Wheel of Fortune', 'The Magician']);
    expect(getTarotBirthCards(5, 4, 1975).cards.map(c => c.name)).toEqual(['The Fool', 'The Emperor']);
  });
});

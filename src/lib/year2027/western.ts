/**
 * B14 — Western (tropical) reading rules for /horoscope/:sign/2027.
 *
 * Sun-sign horoscopes count each planet's house from the Sun sign ("solar houses"). The
 * tone of a planet in a house follows the classical principle shared by Hellenistic and
 * Vedic astrology: the benefics (Jupiter, Venus) do best in the angles, trines and the
 * house of gains; the malefics (Saturn, Mars) give their best results in the 3rd, 6th, 10th
 * and 11th; the hidden houses (8th, 12th) ask for care. BornClock's table below states
 * that rule per planet so every page reads the same way.
 */
import type { Tone } from '../vedic/rashifal';
import type { YPlanet } from './sky';

export const WESTERN_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
export const WESTERN_SLUGS = WESTERN_SIGNS.map(s => s.toLowerCase());
export const WESTERN_DATES = [
  '21 March – 19 April', '20 April – 20 May', '21 May – 20 June', '21 June – 22 July', '23 July – 22 August', '23 August – 22 September',
  '23 September – 22 October', '23 October – 21 November', '22 November – 21 December', '22 December – 19 January', '20 January – 18 February', '19 February – 20 March',
];

const GOOD: Record<string, number[]> = {
  Jupiter: [1, 2, 5, 7, 9, 10, 11],
  Venus: [1, 2, 4, 5, 7, 10, 11],
  Saturn: [3, 6, 10, 11],
  Mars: [3, 6, 10, 11],
  Mercury: [1, 3, 5, 6, 9, 10, 11],
  Sun: [1, 5, 9, 10, 11],
};
const HARD: Record<string, number[]> = {
  Jupiter: [8, 12],
  Venus: [6, 8, 12],
  Saturn: [1, 4, 5, 7, 8, 12],
  Mars: [4, 7, 8, 12],
  Mercury: [4, 8, 12],
  Sun: [4, 8, 12],
};

export function westernTone(p: YPlanet, house: number): Tone {
  if (GOOD[p]?.includes(house)) return 'favourable';
  if (HARD[p]?.includes(house)) return 'challenging';
  return 'mixed';
}

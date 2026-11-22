/**
 * Lal Kitab reference tables (B18). Every table cites the page it was taken from; where the
 * mainstream sites disagree we use the most common reading and say which one we picked
 * (the page repeats these choices in plain words).
 *
 * Chart convention — the Lal Kitab chart keeps each planet in the HOUSE it occupies counted
 * from the Lagna (whole-sign houses), and then sets the signs aside: the 1st house is always
 * read as Aries, the 2nd as Taurus … the 12th as Pisces. A planet is judged by its house
 * alone. Sources:
 *   • https://www.astromitra.com/lal-kitab/lal-kitab-kundli.php — "every planet sits in a house
 *     counted from your lagna … The first house becomes Aries whatever your lagna is";
 *   • https://astrosage.com/lalkitab/IntroPage.asp — "the ascendant is treated as the first
 *     house" (linked to Aries), rashis are not used for prediction;
 *   • https://sushmajee.com/astrology/lal-kitaab/1-lk-howtostudy.htm — Lal Kitab sets aside
 *     rashi and nakshatra and treats the bhaav (house) as the fixed house.
 * (A chart that put each planet in the house numbered by its SIGN would be a Kalpurush /
 * Aries-rising chart, which is not what AstroSage, Astromitra or Lal Kitab authors draw.)
 */

export const LK_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] as const;
export type LkPlanet = typeof LK_PLANETS[number];

/**
 * Pakka ghar (permanent house). Planet → houses, from the house → planet list on
 * https://sushmajee.com/astrology/lal-kitaab/1-lk-howtostudy.htm (1 Sun, 2 Jupiter, 3 Mars,
 * 4 Moon, 5 Jupiter, 6 Mercury & Ketu, 7 Mercury & Venus, 8 Mars & Saturn, 9 Jupiter,
 * 10 Saturn, 11 Saturn, 12 Jupiter & Rahu). The first entry is the planet's primary pakka ghar
 * as AstroSage names it (LKSun.asp 1st, LKMoon.asp 4th, LKMercury.asp 7th, LKSaturn.asp 10th,
 * LKRahu.asp 12th, LKKetu.asp 6th; Jupiter 2nd and Mars 3rd from the Sushma Jee list).
 */
export const PAKKA_GHAR: Record<LkPlanet, number[]> = {
  Sun: [1], Moon: [4], Mars: [3, 8], Mercury: [7, 6], Jupiter: [2, 5, 9, 12],
  Venus: [7], Saturn: [10, 8, 11], Rahu: [12], Ketu: [6],
};

/**
 * Exalted (uchcha) and debilitated (neech) HOUSES per AstroSage's Lal Kitab planet pages
 * (https://astrosage.com/lalkitab/LKSun.asp, LKMoon.asp, LKMars.asp, LKMercury.asp,
 * https://www.astrosage.com/lalkitab/LKJupiter.asp, LKVenus.asp, LKSaturn.asp, LKRahu.asp,
 * LKKetu.asp). Mars: the page gives the 10th as exalted; its debilitation sentence is garbled
 * and the 4th is the traditional Lal Kitab entry (also listed there as a bad house), so we use
 * the 4th. Rahu and Ketu have more than one house each, as on those pages.
 */
export const EXALTED: Record<LkPlanet, number[]> = {
  Sun: [1], Moon: [2], Mars: [10], Mercury: [6], Jupiter: [4], Venus: [12], Saturn: [7], Rahu: [3, 6], Ketu: [5, 9, 12],
};
export const DEBILITATED: Record<LkPlanet, number[]> = {
  Sun: [7], Moon: [8], Mars: [4], Mercury: [12], Jupiter: [10], Venus: [6], Saturn: [1], Rahu: [8, 9, 11], Ketu: [6, 8],
};

/** Natural friends / enemies in Lal Kitab — same AstroSage planet pages as above. */
export const FRIENDS: Record<LkPlanet, LkPlanet[]> = {
  Sun: ['Moon', 'Jupiter', 'Mars'], Moon: ['Sun', 'Jupiter', 'Mars'], Mars: ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus', 'Rahu'], Jupiter: ['Sun', 'Mars', 'Moon'], Venus: ['Saturn', 'Mercury', 'Ketu'],
  Saturn: ['Venus', 'Mercury', 'Rahu'], Rahu: ['Saturn', 'Mercury', 'Ketu'], Ketu: ['Venus', 'Rahu'],
};
export const ENEMIES: Record<LkPlanet, LkPlanet[]> = {
  Sun: ['Saturn', 'Venus', 'Rahu', 'Ketu'], Moon: ['Saturn', 'Rahu', 'Ketu'], Mars: ['Mercury', 'Ketu'],
  Mercury: ['Moon'], Jupiter: ['Mercury', 'Venus'], Venus: ['Sun', 'Moon', 'Rahu'],
  Saturn: ['Sun', 'Moon', 'Mars'], Rahu: ['Sun', 'Mars', 'Venus'], Ketu: ['Moon', 'Mars'],
};
/** Two planets are inimical when either one counts the other as an enemy. */
export const inimical = (a: LkPlanet, b: LkPlanet) => ENEMIES[a].includes(b) || ENEMIES[b].includes(a);

/**
 * Lal Kitab aspects (drishti) — house → houses it looks at. Lal Kitab aspects run FORWARD
 * from the lower houses only. Confirmed on AstroSage: 1→7, 2→6 and 8→2
 * (https://astrosage.com/lalkitab/LKgeneral_principals.asp), 5→9 and 6→12 ("if the 6th is
 * unoccupied there is no aspect from the 6th to the 12th",
 * https://astrosage.com/lalkitab/LKtwelve_houses.asp). 3→9, 3→11 and 4→10 are the remaining
 * entries of the same standard Lal Kitab aspect table (summarised on
 * https://astrobix.com/lalkitabblog/5-aspects-of-planets-in-lal-kitab.html).
 * Houses 7, 9, 10, 11 and 12 cast no aspect in Lal Kitab.
 */
export const ASPECTS: Record<number, number[]> = {
  1: [7], 2: [6], 3: [9, 11], 4: [10], 5: [9], 6: [12], 7: [], 8: [2], 9: [], 10: [], 11: [], 12: [],
};
/** Houses that look AT house h. */
export const aspectedBy = (h: number): number[] =>
  Object.entries(ASPECTS).filter(([, to]) => to.includes(h)).map(([from]) => Number(from));

/**
 * Masnui (artificial) planets: two planets in the SAME house together behave like a third.
 * From https://astrobix.com/lalkitabblog/post/postamp/9 (Banavati grah); Sun + Venus = Jupiter
 * is also on https://www.astromitra.com/lal-kitab/lal-kitab-yogas.php. Saturn's artificial
 * form is listed inconsistently on that page, so it is left out. Venus = Rahu + Ketu cannot
 * occur in a birth chart (Rahu and Ketu are always six houses apart) and is kept only for
 * completeness.
 */
export const MASNUI: Array<{ pair: [LkPlanet, LkPlanet]; acts: LkPlanet; quality?: 'exalted' | 'debilitated' }> = [
  { pair: ['Mercury', 'Venus'], acts: 'Sun' },
  { pair: ['Sun', 'Jupiter'], acts: 'Moon' },
  { pair: ['Sun', 'Mercury'], acts: 'Mars' },
  { pair: ['Jupiter', 'Rahu'], acts: 'Mercury' },
  { pair: ['Sun', 'Venus'], acts: 'Jupiter' },
  { pair: ['Rahu', 'Ketu'], acts: 'Venus' },
  { pair: ['Mars', 'Saturn'], acts: 'Rahu', quality: 'exalted' },
  { pair: ['Sun', 'Saturn'], acts: 'Rahu', quality: 'debilitated' },
  { pair: ['Venus', 'Saturn'], acts: 'Ketu', quality: 'exalted' },
  { pair: ['Moon', 'Saturn'], acts: 'Ketu', quality: 'debilitated' },
];

/**
 * Lal Kitab Rin (karmic debts) — trigger = any of the listed planets in any of the listed
 * houses. Each debt is the house of a planet occupied by that planet's enemies.
 * Sources: https://www.kamalkapoor.com/lalkitab/ (Kamal Kapoor, Lal Kitab author) and
 * https://instaastro.com/lal-kitab/debts — both agree on Pitri, Matri, Stri, Bhai/Bandhu,
 * Ajanma and Prakritik; AstroSage (https://www.astrosage.com/lalkitab/default.asp) states the
 * same Pitri Rin rule. Where the two differ we follow the pattern above and note it:
 *   • Atma (Swa) Rin — InstaAstro lists Venus, Saturn, Rahu, Ketu in the 5th; Kamal Kapoor
 *     omits Venus. Venus is an enemy of the Sun (lord of the 5th's Rin), so we include it.
 *   • Behan/Putri Rin — Kamal Kapoor: Moon in the 3rd or 6th; InstaAstro: Mercury. The 3rd and
 *     6th are Mercury's houses and the Moon is Mercury's enemy, so we use the Moon.
 *   • Jaalim Rin — Kamal Kapoor: 10th or 11th (Saturn's houses); InstaAstro: 10th or 12th. We
 *     use the 10th or 11th.
 */
export type RinKey = 'pitri' | 'atma' | 'matri' | 'stri' | 'bhai' | 'behan' | 'jaalim' | 'ajanma' | 'prakritik';
export const RINS: Array<{ key: RinKey; planets: LkPlanet[]; houses: number[] }> = [
  { key: 'pitri', planets: ['Venus', 'Mercury', 'Rahu'], houses: [2, 5, 9, 12] },
  { key: 'atma', planets: ['Venus', 'Saturn', 'Rahu', 'Ketu'], houses: [5] },
  { key: 'matri', planets: ['Ketu'], houses: [4] },
  { key: 'stri', planets: ['Sun', 'Moon', 'Rahu'], houses: [2, 7] },
  { key: 'bhai', planets: ['Mercury', 'Venus'], houses: [1, 8] },
  { key: 'behan', planets: ['Moon'], houses: [3, 6] },
  { key: 'jaalim', planets: ['Sun', 'Moon', 'Mars'], houses: [10, 11] },
  { key: 'ajanma', planets: ['Sun', 'Venus', 'Mars'], houses: [12] },
  { key: 'prakritik', planets: ['Moon', 'Mars'], houses: [6] },
];

/**
 * Lal Kitab Varshphal (annual chart) house-rotation table, years 1–120: row = year of life,
 * column = natal house 1…12, value = the house that natal house's planets occupy that year.
 * Transcribed from the "LAL KITAB VARSH PHAL CHART" in R. N. Bhandari's article,
 * https://saptarishisastrology.com/?p=10498 (whose worked example — Mars in the 1st house sits
 * in the 3rd in the 16th year — is a test). The printed table repeats a house in four cells;
 * the table's own rule (every row, and every column inside each 12-year block, uses each house
 * exactly once) fixes each of those cells uniquely, so they are corrected here:
 * year 1 house 6 → 2, year 43 house 7 → 1, year 117 house 5 → 6, year 120 house 1 → 6.
 */
export const VARSHPHAL: number[][] = [
  [1, 9, 10, 3, 5, 2, 11, 7, 6, 12, 4, 8],
  [4, 1, 12, 9, 3, 7, 5, 6, 2, 8, 10, 11],
  [9, 4, 1, 2, 8, 3, 10, 5, 7, 11, 12, 6],
  [3, 8, 4, 1, 10, 9, 6, 11, 5, 7, 2, 12],
  [11, 3, 8, 4, 1, 5, 9, 2, 12, 6, 7, 10],
  [5, 12, 3, 8, 4, 11, 2, 9, 1, 10, 6, 7],
  [7, 6, 9, 5, 12, 4, 1, 10, 11, 2, 8, 3],
  [2, 7, 6, 12, 9, 10, 3, 1, 8, 5, 11, 4],
  [12, 2, 7, 6, 11, 1, 8, 4, 10, 3, 5, 9],
  [10, 11, 2, 7, 6, 12, 4, 8, 3, 1, 9, 5],
  [8, 5, 11, 10, 7, 6, 12, 3, 9, 4, 1, 2],
  [6, 10, 5, 11, 2, 8, 7, 12, 4, 9, 3, 1],
  [1, 5, 10, 8, 11, 6, 7, 2, 12, 3, 9, 4],
  [4, 1, 3, 2, 5, 7, 8, 11, 6, 12, 10, 9],
  [9, 4, 1, 6, 8, 5, 2, 7, 11, 10, 12, 3],
  [3, 9, 4, 1, 12, 8, 6, 5, 2, 7, 11, 10],
  [11, 3, 9, 4, 1, 10, 5, 6, 7, 8, 2, 12],
  [5, 11, 6, 9, 4, 1, 12, 8, 10, 2, 3, 7],
  [7, 10, 11, 3, 9, 4, 1, 12, 8, 5, 6, 2],
  [2, 7, 5, 12, 3, 9, 10, 1, 4, 6, 8, 11],
  [12, 2, 8, 5, 10, 3, 9, 4, 1, 11, 7, 6],
  [10, 12, 2, 7, 6, 11, 3, 9, 5, 1, 4, 8],
  [8, 6, 12, 10, 7, 2, 11, 3, 9, 4, 1, 5],
  [6, 8, 7, 11, 2, 12, 4, 10, 3, 9, 5, 1],
  [1, 6, 10, 3, 2, 8, 7, 4, 11, 5, 12, 9],
  [4, 1, 3, 8, 6, 7, 2, 11, 12, 9, 5, 10],
  [9, 4, 1, 5, 10, 11, 12, 7, 6, 8, 2, 3],
  [3, 9, 4, 1, 11, 5, 6, 8, 7, 2, 10, 12],
  [11, 3, 9, 4, 1, 6, 8, 2, 10, 12, 7, 5],
  [5, 11, 8, 9, 4, 1, 3, 12, 2, 10, 6, 7],
  [7, 5, 11, 12, 9, 4, 1, 10, 8, 6, 3, 2],
  [2, 7, 5, 11, 3, 12, 10, 6, 4, 1, 9, 8],
  [12, 2, 6, 10, 8, 3, 9, 1, 5, 7, 4, 11],
  [10, 12, 2, 7, 5, 9, 11, 3, 1, 4, 8, 6],
  [8, 10, 12, 6, 7, 2, 4, 5, 9, 3, 11, 1],
  [6, 8, 7, 2, 12, 10, 5, 9, 3, 11, 1, 4],
  [1, 3, 10, 6, 9, 12, 7, 5, 11, 2, 4, 8],
  [4, 1, 3, 8, 6, 5, 2, 7, 12, 10, 11, 9],
  [9, 4, 1, 12, 8, 2, 10, 11, 6, 3, 5, 7],
  [3, 9, 4, 1, 11, 8, 6, 12, 2, 5, 7, 10],
  [11, 7, 9, 4, 1, 6, 8, 2, 10, 12, 3, 5],
  [5, 11, 8, 9, 12, 1, 3, 4, 7, 6, 10, 2],
  [7, 5, 11, 2, 3, 4, 1, 10, 8, 9, 12, 6],
  [2, 10, 5, 3, 4, 9, 12, 8, 1, 7, 6, 11],
  [12, 2, 6, 5, 10, 7, 9, 1, 3, 11, 8, 4],
  [10, 12, 2, 7, 5, 3, 11, 6, 4, 8, 9, 1],
  [8, 6, 12, 10, 7, 11, 4, 9, 5, 1, 2, 3],
  [6, 8, 7, 11, 2, 10, 5, 3, 9, 4, 1, 12],
  [1, 7, 10, 6, 12, 2, 8, 4, 11, 9, 3, 5],
  [4, 1, 8, 3, 6, 12, 5, 11, 2, 7, 10, 9],
  [9, 4, 1, 2, 8, 3, 12, 6, 7, 10, 5, 11],
  [3, 9, 4, 1, 11, 7, 2, 12, 5, 8, 6, 10],
  [11, 10, 7, 4, 1, 6, 3, 9, 12, 5, 8, 2],
  [5, 11, 3, 9, 4, 1, 6, 2, 10, 12, 7, 8],
  [7, 5, 11, 8, 3, 9, 1, 10, 6, 4, 2, 12],
  [2, 3, 5, 11, 9, 4, 10, 1, 8, 6, 12, 7],
  [12, 2, 6, 5, 10, 8, 9, 7, 4, 11, 1, 3],
  [10, 12, 2, 7, 5, 11, 4, 8, 3, 1, 9, 6],
  [8, 6, 12, 10, 7, 5, 11, 3, 9, 2, 4, 1],
  [6, 8, 9, 12, 2, 10, 7, 5, 1, 3, 11, 4],
  [1, 11, 10, 6, 12, 2, 4, 7, 8, 9, 5, 3],
  [4, 1, 6, 8, 3, 12, 2, 10, 9, 5, 7, 11],
  [9, 4, 1, 2, 8, 6, 12, 11, 7, 3, 10, 5],
  [3, 9, 4, 1, 6, 8, 7, 12, 5, 2, 11, 10],
  [11, 2, 9, 4, 1, 5, 8, 3, 10, 12, 6, 7],
  [5, 10, 3, 9, 2, 1, 6, 8, 11, 7, 12, 4],
  [7, 5, 11, 3, 10, 4, 1, 9, 12, 6, 8, 2],
  [2, 3, 5, 11, 9, 7, 10, 1, 6, 8, 4, 12],
  [12, 8, 7, 5, 11, 3, 9, 4, 1, 10, 2, 6],
  [10, 12, 2, 7, 5, 11, 3, 6, 4, 1, 9, 8],
  [8, 6, 12, 10, 7, 9, 11, 5, 2, 4, 3, 1],
  [6, 7, 8, 12, 4, 10, 5, 2, 3, 11, 1, 9],
  [1, 4, 10, 6, 12, 11, 7, 8, 2, 5, 9, 3],
  [4, 2, 3, 8, 6, 12, 1, 11, 7, 10, 5, 9],
  [9, 10, 1, 3, 8, 6, 2, 7, 5, 4, 12, 11],
  [3, 9, 6, 1, 2, 8, 5, 12, 11, 7, 10, 4],
  [11, 3, 9, 4, 1, 2, 8, 10, 12, 6, 7, 5],
  [5, 11, 4, 9, 7, 1, 6, 2, 10, 12, 3, 8],
  [7, 5, 11, 2, 9, 4, 12, 6, 3, 1, 8, 10],
  [2, 8, 5, 11, 4, 7, 10, 3, 1, 9, 6, 12],
  [12, 1, 7, 5, 11, 10, 9, 4, 8, 3, 2, 6],
  [10, 12, 2, 7, 5, 3, 4, 9, 6, 8, 11, 1],
  [8, 6, 12, 10, 3, 5, 11, 1, 9, 2, 4, 7],
  [6, 7, 8, 12, 10, 9, 3, 5, 4, 11, 1, 2],
  [1, 3, 10, 6, 12, 2, 8, 11, 5, 4, 9, 7],
  [4, 1, 8, 3, 6, 12, 11, 2, 7, 9, 10, 5],
  [9, 4, 1, 7, 3, 8, 12, 5, 2, 6, 11, 10],
  [3, 9, 4, 1, 8, 10, 2, 7, 12, 5, 6, 11],
  [11, 10, 9, 4, 1, 6, 7, 12, 3, 8, 5, 2],
  [5, 11, 6, 9, 4, 1, 3, 8, 10, 2, 7, 12],
  [7, 5, 11, 2, 10, 4, 6, 9, 8, 3, 12, 1],
  [2, 7, 5, 11, 9, 3, 10, 4, 1, 12, 8, 6],
  [12, 8, 7, 5, 2, 11, 9, 1, 6, 10, 3, 4],
  [10, 12, 2, 8, 11, 5, 4, 6, 9, 7, 1, 3],
  [8, 6, 12, 10, 5, 7, 1, 3, 4, 11, 2, 9],
  [6, 2, 3, 12, 7, 9, 5, 10, 11, 1, 4, 8],
  [1, 9, 10, 6, 12, 2, 7, 5, 3, 4, 8, 11],
  [4, 1, 6, 8, 10, 12, 11, 2, 9, 7, 3, 5],
  [9, 4, 1, 2, 6, 8, 12, 11, 5, 3, 10, 7],
  [3, 10, 8, 1, 5, 7, 6, 12, 2, 9, 11, 4],
  [11, 3, 9, 4, 1, 6, 8, 10, 7, 5, 12, 2],
  [5, 11, 3, 9, 4, 1, 2, 6, 8, 12, 7, 10],
  [7, 5, 11, 3, 9, 4, 1, 8, 12, 10, 2, 6],
  [2, 7, 5, 11, 3, 9, 10, 1, 6, 8, 4, 12],
  [12, 2, 4, 5, 11, 3, 9, 7, 10, 6, 1, 8],
  [10, 12, 2, 7, 8, 5, 3, 9, 4, 11, 6, 1],
  [8, 6, 12, 10, 7, 11, 4, 3, 1, 2, 5, 9],
  [6, 8, 7, 12, 2, 10, 5, 4, 11, 1, 9, 3],
  [1, 9, 10, 6, 12, 2, 7, 11, 5, 3, 4, 8],
  [4, 1, 6, 8, 10, 12, 3, 5, 7, 2, 11, 9],
  [9, 4, 1, 2, 5, 8, 12, 10, 6, 7, 3, 11],
  [3, 10, 8, 9, 11, 7, 4, 1, 2, 12, 6, 5],
  [11, 3, 9, 4, 1, 6, 2, 7, 10, 5, 8, 12],
  [5, 11, 3, 1, 4, 10, 6, 8, 12, 9, 7, 2],
  [7, 5, 11, 3, 9, 4, 1, 12, 8, 10, 2, 6],
  [2, 7, 5, 11, 3, 9, 10, 6, 4, 8, 12, 1],
  [12, 2, 4, 5, 6, 1, 8, 9, 3, 11, 10, 7],
  [10, 12, 2, 7, 8, 11, 9, 3, 1, 6, 5, 4],
  [8, 6, 12, 10, 7, 5, 11, 2, 9, 4, 1, 3],
  [6, 8, 7, 12, 2, 3, 5, 4, 11, 1, 9, 10],
];

/**
 * The Lal Kitab 35-year cycle of planetary periods, as given on
 * https://www.astromitra.com/lal-kitab/lal-kitab-dasha.php: Saturn 6, Rahu 6, Ketu 3,
 * Jupiter 6, Sun 2, Moon 1, Venus 3, Mars 6, Mercury 2 (= 35), starting with Saturn at birth
 * and beginning again at 35 and 70. Some sites list the same order starting from Jupiter;
 * the sequence of planets and their years is the same.
 */
export const CYCLE_35: Array<{ planet: LkPlanet; years: number }> = [
  { planet: 'Saturn', years: 6 }, { planet: 'Rahu', years: 6 }, { planet: 'Ketu', years: 3 },
  { planet: 'Jupiter', years: 6 }, { planet: 'Sun', years: 2 }, { planet: 'Moon', years: 1 },
  { planet: 'Venus', years: 3 }, { planet: 'Mars', years: 6 }, { planet: 'Mercury', years: 2 },
];

/** Remedy practice note — https://www.astromitra.com/lal-kitab/lal-kitab-remedies.php
 *  (40 to 43 days without a break, restart the count if a day is missed, one planet's remedy
 *  at a time, between sunrise and sunset; a blood relative may do it for you). The AstroSage
 *  planet pages repeat the 43-day count for many individual remedies. */
export const REMEDY_DAYS = { min: 40, max: 43 } as const;

// @ts-check
/**
 * Chinese (lunar) year helpers — the ONE place that decides which Chinese zodiac year a
 * date belongs to. Plain ES module (no TS, no path aliases) so the app, vitest AND the
 * Node prerender script (scripts/prerender-titles.mjs) all import the same code.
 *
 * The animal year changes at Chinese (Lunar) New Year, not on 1 January.
 *
 * Sources for CHINESE_NEW_YEAR_DATES:
 *  - 1900–1923 and 2032–2049: audit N11 reference table (python `lunardate` / `lunar_python`).
 *  - 1924–2031: cross-checked row by row (start AND end date, all 108 years, 0 mismatches,
 *    29 Oct 2026) against Wikipedia "Chinese zodiac" years table (start date / end date /
 *    stem / branch / animal / element / yin-yang), opened via WebFetch from the archived copy
 *    https://webcf.waybackmachine.org/web/20220329143420/https://en.wikipedia.org/wiki/East_Asian_zodiac
 *  - Spot-checked against Hong Kong Observatory Gregorian–Lunar conversion tables (WebFetch,
 *    29 Oct 2026): 1927/02/02, 2002/02/12, 2026/2/17 and 2027/2/6 are each "1st Lunar Month"
 *    day 1 (https://www.hko.gov.hk/en/gts/time/calendar/text/files/T2026e.txt, T2027e.txt,
 *    T2002e.txt, T1927e.txt). HKO titles: 2026 "Bing-wu – year of the Horse",
 *    2027 "Ding-wei – year of the Goat".
 */

/** @type {Record<number, [number, number]>} Chinese New Year (month, day), Gregorian. */
export const CHINESE_NEW_YEAR_DATES = {
  1900: [1, 31], 1901: [2, 19], 1902: [2, 8], 1903: [1, 29],
  1904: [2, 16], 1905: [2, 4], 1906: [1, 25], 1907: [2, 13],
  1908: [2, 2], 1909: [1, 22], 1910: [2, 10], 1911: [1, 30],
  1912: [2, 18], 1913: [2, 6], 1914: [1, 26], 1915: [2, 14],
  1916: [2, 3], 1917: [1, 23], 1918: [2, 11], 1919: [2, 1],
  1920: [2, 20], 1921: [2, 8], 1922: [1, 28], 1923: [2, 16],
  1924: [2, 5],  1925: [1, 24], 1926: [2, 13], 1927: [2, 2],
  1928: [1, 23], 1929: [2, 10], 1930: [1, 30], 1931: [2, 17],
  1932: [2, 6],  1933: [1, 26], 1934: [2, 14], 1935: [2, 4],
  1936: [1, 24], 1937: [2, 11], 1938: [1, 31], 1939: [2, 19],
  1940: [2, 8],  1941: [1, 27], 1942: [2, 15], 1943: [2, 5],
  1944: [1, 25], 1945: [2, 13], 1946: [2, 2],  1947: [1, 22],
  1948: [2, 10], 1949: [1, 29], 1950: [2, 17], 1951: [2, 6],
  1952: [1, 27], 1953: [2, 14], 1954: [2, 3],  1955: [1, 24],
  1956: [2, 12], 1957: [1, 31], 1958: [2, 18], 1959: [2, 8],
  1960: [1, 28], 1961: [2, 15], 1962: [2, 5],  1963: [1, 25],
  1964: [2, 13], 1965: [2, 2],  1966: [1, 21], 1967: [2, 9],
  1968: [1, 30], 1969: [2, 17], 1970: [2, 6],  1971: [1, 27],
  1972: [2, 15], 1973: [2, 3],  1974: [1, 23], 1975: [2, 11],
  1976: [1, 31], 1977: [2, 18], 1978: [2, 7],  1979: [1, 28],
  1980: [2, 16], 1981: [2, 5],  1982: [1, 25], 1983: [2, 13],
  1984: [2, 2],  1985: [2, 20], 1986: [2, 9],  1987: [1, 29],
  1988: [2, 17], 1989: [2, 6],  1990: [1, 27], 1991: [2, 15],
  1992: [2, 4],  1993: [1, 23], 1994: [2, 10], 1995: [1, 31],
  1996: [2, 19], 1997: [2, 7],  1998: [1, 28], 1999: [2, 16],
  2000: [2, 5],  2001: [1, 24], 2002: [2, 12], 2003: [2, 1],
  2004: [1, 22], 2005: [2, 9],  2006: [1, 29], 2007: [2, 18],
  2008: [2, 7],  2009: [1, 26], 2010: [2, 14], 2011: [2, 3],
  2012: [1, 23], 2013: [2, 10], 2014: [1, 31], 2015: [2, 19],
  2016: [2, 8],  2017: [1, 28], 2018: [2, 16], 2019: [2, 5],
  2020: [1, 25], 2021: [2, 12], 2022: [2, 1],  2023: [1, 22],
  2024: [2, 10], 2025: [1, 29], 2026: [2, 17], 2027: [2, 6],
  2028: [1, 26], 2029: [2, 13], 2030: [2, 3],  2031: [1, 23],
  2032: [2, 11], 2033: [1, 31], 2034: [2, 19], 2035: [2, 8],
  2036: [1, 28], 2037: [2, 15], 2038: [2, 4], 2039: [1, 24],
  2040: [2, 12], 2041: [2, 1], 2042: [1, 22], 2043: [2, 10],
  2044: [1, 30], 2045: [2, 17], 2046: [2, 6], 2047: [1, 26],
  2048: [2, 14], 2049: [2, 2],
};

export const CHINESE_ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
export const CHINESE_ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n) => String(n).padStart(2, '0');
const mod = (a, n) => ((a % n) + n) % n;

/**
 * The Chinese year a calendar date (y, m 1-12, d) belongs to.
 * @param {number} y @param {number} m @param {number} d
 */
export function chineseYearForYmd(y, m, d) {
  const cny = CHINESE_NEW_YEAR_DATES[y];
  if (cny) {
    const [cm, cd] = cny;
    if (m < cm || (m === cm && d < cd)) return y - 1;
  }
  return y;
}

/** @param {number} chineseYear */
export function animalForChineseYear(chineseYear) {
  return CHINESE_ANIMALS[mod(chineseYear - 4, 12)];
}
/** Each element rules two consecutive years (stems): 2024–25 Wood, 2026–27 Fire … @param {number} chineseYear */
export function elementForChineseYear(chineseYear) {
  return CHINESE_ELEMENTS[Math.floor(mod(chineseYear - 4, 10) / 2)];
}
/**
 * Yang and Yin alternate year by year. Yang years are the Rat, Tiger, Dragon, Horse, Monkey
 * and Dog years (Chinese years beginning in an even-numbered Gregorian year, e.g. 2026 Fire
 * Horse = Yang); Yin years are Ox, Rabbit, Snake, Goat, Rooster, Pig (odd). Source: the
 * Wikipedia years table cited above (yin/yang column).
 * @param {number} chineseYear
 */
export function yinYangForChineseYear(chineseYear) {
  return mod(chineseYear, 2) === 0 ? 'Yang' : 'Yin';
}

/**
 * Start and end (inclusive) of a Chinese year as ISO dates, or null if outside the table.
 * @param {number} chineseYear
 * @returns {{ start: string, end: string } | null}
 */
export function chineseYearRange(chineseYear) {
  const s = CHINESE_NEW_YEAR_DATES[chineseYear];
  const n = CHINESE_NEW_YEAR_DATES[chineseYear + 1];
  if (!s || !n) return null;
  const endDate = new Date(Date.UTC(chineseYear + 1, n[0] - 1, n[1]) - 86400000);
  return {
    start: `${chineseYear}-${pad(s[0])}-${pad(s[1])}`,
    end: `${endDate.getUTCFullYear()}-${pad(endDate.getUTCMonth() + 1)}-${pad(endDate.getUTCDate())}`,
  };
}

/** "2026-02-17" → "17 Feb 2026" @param {string} iso */
export function formatIsoDateShort(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

/** "17 Feb 2026 – 5 Feb 2027" @param {number} chineseYear */
export function formatChineseYearRange(chineseYear) {
  const r = chineseYearRange(chineseYear);
  return r ? `${formatIsoDateShort(r.start)} – ${formatIsoDateShort(r.end)}` : '';
}

/**
 * The calendar date in China (Asia/Shanghai, UTC+8, no DST) for an instant. Chinese New Year
 * is reckoned on Beijing time, so this is the date we compare against the table.
 * @param {Date} now
 */
export function chinaDateParts(now) {
  const t = new Date(now.getTime() + 8 * 3600000);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

/**
 * The Chinese zodiac year in force right now (changes at Chinese New Year, Beijing date).
 * Used for every "current year" label: /chinese-zodiac lead, /chinese-horoscope pages and
 * the prerendered /chinese-horoscope title.
 * @param {Date} [now]
 */
export function currentChineseYear(now = new Date()) {
  const { y, m, d } = chinaDateParts(now);
  return chineseYearForYmd(y, m, d);
}

/**
 * Everything a page needs to name a Chinese year.
 * @param {number} chineseYear
 */
export function chineseYearInfo(chineseYear) {
  const range = chineseYearRange(chineseYear);
  return {
    year: chineseYear,
    animal: animalForChineseYear(chineseYear),
    element: elementForChineseYear(chineseYear),
    yinYang: yinYangForChineseYear(chineseYear),
    start: range ? range.start : null,
    end: range ? range.end : null,
    rangeLabel: formatChineseYearRange(chineseYear),
  };
}

/**
 * Title for /chinese-horoscope — shared by the live <SEO> and the prerender (so they match).
 * e.g. "2026 Chinese Zodiac: Year of the Fire Horse (17 Feb 2026 – 5 Feb 2027) | BornClock"
 * @param {number} chineseYear
 */
export function chineseHoroscopeIndexTitle(chineseYear) {
  const i = chineseYearInfo(chineseYear);
  return `${chineseYear} Chinese Zodiac: Year of the ${i.element} ${i.animal} (${i.rangeLabel}) | BornClock`;
}
/** @param {number} chineseYear */
export function chineseHoroscopeIndexDescription(chineseYear) {
  const i = chineseYearInfo(chineseYear);
  const n = chineseYearInfo(chineseYear + 1);
  return `The Year of the ${i.element} ${i.animal} runs ${i.rangeLabel}. Free yearly forecast for all 12 Chinese zodiac animals — career, money, love and health for ${chineseYear} and the ${n.element} ${n.animal} year ${chineseYear + 1}.`;
}

/** Year range of the public table on /articles/chinese-zodiac-by-year (each row sourced). */
export const CHINESE_YEAR_TABLE_FIRST = 1924;
export const CHINESE_YEAR_TABLE_LAST = 2031;

/**
 * Meta description for /chinese-zodiac/:animal — shared by the live <SEO> and the prerender.
 * @param {string} cap capitalised animal name, e.g. "Goat"
 */
export function chineseSignDescription(cap) {
  return `Complete guide to the ${cap} in the Chinese zodiac — personality traits, compatible animals, famous ${cap} people, lucky numbers and colours, and every ${cap} year.`;
}

/** Title + description for /articles/chinese-zodiac-by-year — shared by the page and the prerender. */
export const CHINESE_BY_YEAR_TITLE = 'Chinese Zodiac by Year: 1924–2031 Table with Exact New Year Dates | BornClock';
export const CHINESE_BY_YEAR_DESC = 'Chinese zodiac by year: every year from 1924 to 2031 with its start and end date, animal, element and yin/yang. Born in January or February? Check your date — the animal changes at Chinese New Year.';

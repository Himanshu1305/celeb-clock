import { describe, it, expect } from 'vitest';
import {
  CHINESE_NEW_YEAR_DATES,
  currentChineseYear,
  chineseYearInfo,
  chineseYearRange,
  formatChineseYearRange,
  chineseHoroscopeIndexTitle,
  chineseSignDescription,
} from '@/lib/chineseCalendar.js';
import { getChineseZodiac } from '@/services/ChineseZodiacService';
import { currentAndNextYear } from '@/services/chineseYearlyForecast';

/**
 * Reference: Wikipedia "Chinese zodiac" years table (start date / end date), opened via
 * WebFetch 29 Oct 2026 from the archived copy
 * https://webcf.waybackmachine.org/web/20220329143420/https://en.wikipedia.org/wiki/East_Asian_zodiac
 * Copied here independently of the implementation table: "year startMonDay endMonDay".
 */
const WIKI_ROWS = `1924 Feb05 Jan23;1925 Jan24 Feb12;1926 Feb13 Feb01;1927 Feb02 Jan22;1928 Jan23 Feb09;1929 Feb10 Jan29;1930 Jan30 Feb16;1931 Feb17 Feb05;1932 Feb06 Jan25;1933 Jan26 Feb13;1934 Feb14 Feb03;1935 Feb04 Jan23;1936 Jan24 Feb10;1937 Feb11 Jan30;1938 Jan31 Feb18;1939 Feb19 Feb07;1940 Feb08 Jan26;1941 Jan27 Feb14;1942 Feb15 Feb04;1943 Feb05 Jan24;1944 Jan25 Feb12;1945 Feb13 Feb01;1946 Feb02 Jan21;1947 Jan22 Feb09;1948 Feb10 Jan28;1949 Jan29 Feb16;1950 Feb17 Feb05;1951 Feb06 Jan26;1952 Jan27 Feb13;1953 Feb14 Feb02;1954 Feb03 Jan23;1955 Jan24 Feb11;1956 Feb12 Jan30;1957 Jan31 Feb17;1958 Feb18 Feb07;1959 Feb08 Jan27;1960 Jan28 Feb14;1961 Feb15 Feb04;1962 Feb05 Jan24;1963 Jan25 Feb12;1964 Feb13 Feb01;1965 Feb02 Jan20;1966 Jan21 Feb08;1967 Feb09 Jan29;1968 Jan30 Feb16;1969 Feb17 Feb05;1970 Feb06 Jan26;1971 Jan27 Feb14;1972 Feb15 Feb02;1973 Feb03 Jan22;1974 Jan23 Feb10;1975 Feb11 Jan30;1976 Jan31 Feb17;1977 Feb18 Feb06;1978 Feb07 Jan27;1979 Jan28 Feb15;1980 Feb16 Feb04;1981 Feb05 Jan24;1982 Jan25 Feb12;1983 Feb13 Feb01;1984 Feb02 Feb19;1985 Feb20 Feb08;1986 Feb09 Jan28;1987 Jan29 Feb16;1988 Feb17 Feb05;1989 Feb06 Jan26;1990 Jan27 Feb14;1991 Feb15 Feb03;1992 Feb04 Jan22;1993 Jan23 Feb09;1994 Feb10 Jan30;1995 Jan31 Feb18;1996 Feb19 Feb06;1997 Feb07 Jan27;1998 Jan28 Feb15;1999 Feb16 Feb04;2000 Feb05 Jan23;2001 Jan24 Feb11;2002 Feb12 Jan31;2003 Feb01 Jan21;2004 Jan22 Feb08;2005 Feb09 Jan28;2006 Jan29 Feb17;2007 Feb18 Feb06;2008 Feb07 Jan25;2009 Jan26 Feb13;2010 Feb14 Feb02;2011 Feb03 Jan22;2012 Jan23 Feb09;2013 Feb10 Jan30;2014 Jan31 Feb18;2015 Feb19 Feb07;2016 Feb08 Jan27;2017 Jan28 Feb15;2018 Feb16 Feb04;2019 Feb05 Jan24;2020 Jan25 Feb11;2021 Feb12 Jan31;2022 Feb01 Jan21;2023 Jan22 Feb09;2024 Feb10 Jan28;2025 Jan29 Feb16;2026 Feb17 Feb05;2027 Feb06 Jan25;2028 Jan26 Feb12;2029 Feb13 Feb02;2030 Feb03 Jan22;2031 Jan23 Feb10`;

const MON: Record<string, string> = { Jan: '01', Feb: '02' };
const iso = (y: number, md: string) => `${y}-${MON[md.slice(0, 3)]}-${md.slice(3)}`;

/** Instant at a given Beijing wall-clock time (UTC+8). */
const beijing = (y: number, m: number, d: number, hh = 12, mm = 0) => new Date(Date.UTC(y, m - 1, d, hh - 8, mm));

describe('Chinese New Year table vs Wikipedia years table (1924–2031, every row)', () => {
  const rows = WIKI_ROWS.split(';').map(r => r.split(' '));
  it('has 108 reference rows', () => expect(rows.length).toBe(108));
  for (const [ys, start, end] of rows) {
    const y = Number(ys);
    it(`${y}: ${start} – ${end}`, () => {
      expect(chineseYearRange(y)).toEqual({ start: iso(y, start), end: iso(y + 1, end) });
    });
  }
});

describe('animal / element / yin-yang (spot rows from the same Wikipedia table)', () => {
  const ref: [number, string, string, string][] = [
    [1924, 'Rat', 'Wood', 'Yang'], [1931, 'Goat', 'Metal', 'Yin'], [1966, 'Horse', 'Fire', 'Yang'],
    [1997, 'Ox', 'Fire', 'Yin'], [1998, 'Tiger', 'Earth', 'Yang'], [2025, 'Snake', 'Wood', 'Yin'],
    [2026, 'Horse', 'Fire', 'Yang'], [2027, 'Goat', 'Fire', 'Yin'], [2031, 'Pig', 'Metal', 'Yin'],
  ];
  for (const [y, animal, element, yinYang] of ref) {
    it(`${y} = ${element} ${animal} (${yinYang})`, () => {
      expect(chineseYearInfo(y)).toMatchObject({ animal, element, yinYang });
    });
  }
});

describe('Hong Kong Observatory spot checks (1st day of 1st lunar month)', () => {
  // T1927e / T2002e / T2026e / T2027e.txt, opened via WebFetch 29 Oct 2026.
  it.each([[1927, [2, 2]], [2002, [2, 12]], [2026, [2, 17]], [2027, [2, 6]]])('%i', (y, md) => {
    expect(CHINESE_NEW_YEAR_DATES[y as number]).toEqual(md);
  });
});

describe('birth dates around Chinese New Year (the year-only calculator bug)', () => {
  it('1998-01-20 is Fire Ox (1997 year), not Earth Tiger', () => {
    const r = getChineseZodiac(new Date(1998, 0, 20, 12));
    expect([r.element, r.animal, r.year]).toEqual(['Fire', 'Ox', 1997]);
  });
  it('1998-01-27 still Ox; 1998-01-28 is Earth Tiger', () => {
    expect(getChineseZodiac(new Date(1998, 0, 27, 12)).animal).toBe('Ox');
    expect(getChineseZodiac(new Date(1998, 0, 28, 12))).toMatchObject({ animal: 'Tiger', element: 'Earth', year: 1998 });
  });
});

describe('current Chinese year changes at Chinese New Year, not 1 January', () => {
  it('2026-02-16 → 2025 (Snake); 2026-02-17 → 2026 (Fire Horse)', () => {
    expect(currentChineseYear(beijing(2026, 2, 16))).toBe(2025);
    expect(currentChineseYear(beijing(2026, 2, 17))).toBe(2026);
  });
  it('2027-01-01 and 2027-02-05 → still 2026; 2027-02-06 → 2027 (Fire Goat)', () => {
    expect(currentChineseYear(beijing(2027, 1, 1))).toBe(2026);
    expect(currentChineseYear(beijing(2027, 2, 5, 23, 59))).toBe(2026);
    expect(currentChineseYear(beijing(2027, 2, 6, 0, 0))).toBe(2027);
    expect(chineseYearInfo(2027)).toMatchObject({ animal: 'Goat', element: 'Fire' });
  });
  it('uses the Beijing date: 00:30 on 17 Feb Beijing is still 16 Feb in India/UTC', () => {
    expect(currentChineseYear(new Date('2026-02-16T16:30:00Z'))).toBe(2026); // 00:30 Beijing 17 Feb
    expect(currentChineseYear(new Date('2026-02-16T15:59:00Z'))).toBe(2025); // 23:59 Beijing 16 Feb
  });
  it('currentAndNextYear (horoscope pages) follows the Chinese year', () => {
    expect(currentAndNextYear(beijing(2027, 1, 15))).toEqual([2026, 2027]);
    expect(currentAndNextYear(beijing(2027, 2, 6))).toEqual([2027, 2028]);
    expect(currentAndNextYear(beijing(2026, 2, 16))).toEqual([2025, 2026]);
  });
});

describe('labels', () => {
  it('Fire Horse 2026 range', () => {
    expect(formatChineseYearRange(2026)).toBe('17 Feb 2026 – 5 Feb 2027');
  });
  it('/chinese-horoscope title', () => {
    expect(chineseHoroscopeIndexTitle(2026)).toBe('2026 Chinese Zodiac: Year of the Fire Horse (17 Feb 2026 – 5 Feb 2027) | BornClock');
    expect(chineseHoroscopeIndexTitle(2027)).toBe('2027 Chinese Zodiac: Year of the Fire Goat (6 Feb 2027 – 25 Jan 2028) | BornClock');
  });
  it('sign description is Chinese, not Vedic (no "Jyotish")', () => {
    expect(chineseSignDescription('Goat')).not.toMatch(/jyotish/i);
  });
});

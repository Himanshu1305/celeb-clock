/**
 * Batch 3 — celebrity birth-date corrections.
 *
 * SOURCES: every expected date below is the birth (or death) date in the
 * person's English Wikipedia infobox, fetched with WebFetch on 23 Oct 2026:
 * https://en.wikipedia.org/wiki/<Page> where <Page> is the third column.
 */
import { describe, it, expect } from 'vitest';
import {
  CELEB_BIRTH_FIXES, CELEB_DEATH_OVERRIDES, applyCelebRecordFixes, correctCelebDates,
  fixBirthDate, ageAtDeath,
} from '../celebrityFacts';
import { parseCelebrityDOB, formatDOBDisplay } from '@/utils/celebrityUtils';
import celebritiesData from '@/data/celebrities.json';
import { INDIAN_CELEBRITIES } from '@/data/indianCelebrities';
import { allBirthdays } from '@/data/birthdays';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];
const display = (iso: string) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}, ${Number(iso.slice(0, 4))}`;

// [display name, verified birth date, Wikipedia page]
const VERIFIED_BIRTHS: Array<[string, string, string]> = [
  ['Dhanush', '1983-07-28', 'Dhanush'],
  ['Kajol', '1974-08-05', 'Kajol'],
  ['Atal Bihari Vajpayee', '1924-12-25', 'Atal_Bihari_Vajpayee'],
  ['Ranbir Kapoor', '1982-09-28', 'Ranbir_Kapoor'],
  ['Om Puri', '1950-10-18', 'Om_Puri'],
  ['Samantha Ruth Prabhu', '1987-04-28', 'Samantha_Ruth_Prabhu'],
  ['Indra Nooyi', '1955-10-28', 'Indra_Nooyi'],
  ['Gulzar', '1934-08-18', 'Gulzar'],
  ['Sonu Sood', '1973-07-30', 'Sonu_Sood'],
  ['Kader Khan', '1937-10-22', 'Kader_Khan'],
  ['Mammootty', '1951-09-07', 'Mammootty'],
  ['Kumar Sanu', '1957-10-20', 'Kumar_Sanu'],
  ['Paresh Rawal', '1955-05-30', 'Paresh_Rawal'],
  ['Rajkummar Rao', '1984-08-31', 'Rajkummar_Rao'],
  ['Alok Nath', '1956-07-10', 'Alok_Nath'],
  ['Usha Uthup', '1947-11-08', 'Usha_Uthup'],
  ['Prithviraj Sukumaran', '1982-10-16', 'Prithviraj_Sukumaran'],
  ['Mohammed Shami', '1990-09-03', 'Mohammed_Shami'],
  ['Ajinkya Rahane', '1988-06-06', 'Ajinkya_Rahane'],
  ['Mary Kom', '1982-11-24', 'Mary_Kom'],
  ['Akbar', '1542-10-15', 'Akbar'],
  ['Charu Majumdar', '1918-05-15', 'Charu_Majumdar'],
  ['Meena', '1976-09-16', 'Meena_(actress)'],
  ['Amit Trivedi', '1979-04-08', 'Amit_Trivedi'],
  ['Sam Pitroda', '1942-11-16', 'Sam_Pitroda'],
  ['Atlee', '1986-09-21', 'Atlee_(director)'],
  ['Varalaxmi Sarathkumar', '1985-03-05', 'Varalaxmi_Sarathkumar'],
  ['Jahnu Barua', '1952-10-18', 'Jahnu_Barua'],
  ['Sundar Pichai', '1972-06-10', 'Sundar_Pichai'],
  ['Shubman Gill', '1999-09-08', 'Shubman_Gill'],
  ['Shraddha Kapoor', '1987-03-03', 'Shraddha_Kapoor'],
  ['Hariharan', '1955-04-03', 'Hariharan_(singer)'],
  ['Nitish Kumar', '1951-03-01', 'Nitish_Kumar'],
  ['Nushrratt Bharuccha', '1985-05-17', 'Nushrratt_Bharuccha'],
  ['Pritam Chakraborty', '1971-06-14', 'Pritam'],
  ['Puri Jagannadh', '1966-09-28', 'Puri_Jagannadh'],
  ['Rati Agnihotri', '1960-12-10', 'Rati_Agnihotri'],
  ['Sameera Reddy', '1978-12-14', 'Sameera_Reddy'],
  ['Saurabh Shukla', '1963-03-05', 'Saurabh_Shukla'],
  ['Shreyas Talpade', '1976-01-27', 'Shreyas_Talpade'],
  ['Sneha Ullal', '1987-12-18', 'Sneha_Ullal'],
  ['Somdev Devvarman', '1985-02-13', 'Somdev_Devvarman'],
  ['Suresh Oberoi', '1946-12-17', 'Suresh_Oberoi'],
  ['Zayed Khan', '1980-07-05', 'Zayed_Khan'],
  ['Leonardo da Vinci', '1452-04-15', 'Leonardo_da_Vinci'],
  ['Galileo Galilei', '1564-02-15', 'Galileo_Galilei'],
  ['Michelangelo', '1475-03-06', 'Michelangelo'],
  ['Martin Luther', '1483-11-10', 'Martin_Luther'],
  ['Niccolò Machiavelli', '1469-05-03', 'Niccolò_Machiavelli'],
  ['Nicolaus Copernicus', '1473-02-19', 'Nicolaus_Copernicus'],
  ['Francis Bacon', '1561-01-22', 'Francis_Bacon'],
  ['William Shakespeare', '1564-04-23', 'William_Shakespeare (c. 23 April 1564)'],
  ['Tilda Swinton', '1960-11-05', 'Tilda_Swinton'],
  ['Lucy Lawless', '1968-03-29', 'Lucy_Lawless'],
  ['Joss Whedon', '1964-06-23', 'Joss_Whedon'],
  ['Michael B. Jordan', '1987-02-09', 'Michael_B._Jordan'],
  ['Ryan Reynolds', '1976-10-23', 'Ryan_Reynolds'],
  ["Georgia O'Keeffe", '1887-11-15', "Georgia_O'Keeffe"],
  ['Tyra Banks', '1973-12-04', 'Tyra_Banks'],
  ['Mary J. Blige', '1971-01-11', 'Mary_J._Blige'],
  ['Diane Keaton', '1946-01-05', 'Diane_Keaton'],
  ['Paco de Lucía', '1947-12-21', 'Paco_de_Lucía'],
  ['George III of Great Britain', '1738-06-04', 'George_III'],
  ['Elizabeth I of England', '1533-09-07', 'Elizabeth_I'],
  ['Mary I of England', '1516-02-18', 'Mary_I_of_England'],
  ['Leonid Brezhnev', '1906-12-19', 'Leonid_Brezhnev'],
  ['Paul Samuelson', '1915-05-15', 'Paul_Samuelson'],
  ["Catherine de' Medici", '1519-04-13', "Catherine_de'_Medici"],
  ['Alexandra Kollontai', '1872-03-31', 'Alexandra_Kollontai'],
  ['Harry Martinson', '1904-05-06', 'Harry_Martinson'],
  ['Hugo Grotius', '1583-04-10', 'Hugo_Grotius'],
  ['Philipp Melanchthon', '1497-02-16', 'Philipp_Melanchthon'],
];

const bySlug = new Map((celebritiesData.celebrities as Array<Record<string, unknown>>).map(c => [String(c.slug), c]));

describe('Batch 3: every birth fix matches the Wikipedia-verified date', () => {
  it('the fix table and the verified list cover the same people', () => {
    expect(Object.keys(CELEB_BIRTH_FIXES).length).toBe(VERIFIED_BIRTHS.length);
  });

  it.each(VERIFIED_BIRTHS)('%s renders %s', (name, iso) => {
    const slugFix = Object.entries(CELEB_BIRTH_FIXES).find(([, f]) => f.correct === iso && fixBirthDate(name, f.wrong[0]) === iso);
    expect(slugFix, `no fix for ${name}`).toBeTruthy();
    for (const wrong of slugFix![1].wrong) {
      // The DB row with the wrong value, as CelebrityPage / the export see it:
      const rec = applyCelebRecordFixes({ name, birth_date: wrong, birth_month_day: wrong.slice(5), birth_year: Number(wrong.slice(0, 4)), death_year: null });
      expect(rec.birth_date).toBe(iso);
      expect(rec.birth_month_day).toBe(iso.slice(5));
      expect(rec.birth_year).toBe(Number(iso.slice(0, 4)));
      const dob = parseCelebrityDOB(rec);
      expect(dob?.isFullDate).toBe(true);
      expect(formatDOBDisplay(dob)).toBe(display(iso));
      // The live DB path (BirthdaySearchService → correctCelebDates):
      expect(correctCelebDates({ name, birthDate: wrong, deathDate: null }).birthDate).toBe(iso);
    }
  });

  it('never touches a different person with the same name', () => {
    // Francis Bacon the painter (DB 1909-10-28) and John Adams the composer (DB 1947-02-15).
    expect(fixBirthDate('Francis Bacon', '1909-10-28')).toBe('1909-10-28');
    expect(correctCelebDates({ name: 'John Adams', birthDate: '1947-02-15', deathDate: null }).birthDate).toBe('1947-02-15');
    // A correct row stays as it is (fix switches off once the DB is updated).
    expect(fixBirthDate('Kajol', '1974-08-05')).toBe('1974-08-05');
  });
});

describe('Batch 3: static files carry the verified date', () => {
  // [name, slug, verified date] — rows that were wrong in indianCelebrities.ts / celebrities.json
  const STATIC: Array<[string, string]> = [
    ['Shubman Gill', '1999-09-08'], ['Preity Zinta', '1975-01-31'], ['Shraddha Kapoor', '1987-03-03'],
    // Batch 7: the DB row 'Ameesha Patel' was merged into 'Amisha Patel' (same person;
    // /celebrity/ameesha-patel 301s), so only the kept record is checked.
    ['Sundar Pichai', '1972-06-10'], ['Amisha Patel', '1975-06-09'],
    ['Kunal Nayyar', '1981-04-30'], ['Kangana Ranaut', '1986-03-23'], ['Sharmila Tagore', '1944-12-08'],
    ['Kiara Advani', '1991-07-31'], ['Nandita Das', '1969-11-07'], ['Allu Arjun', '1982-04-08'],
    ['Pooja Bhatt', '1972-02-24'], ['Dino Morea', '1975-12-09'], ['Tisca Chopra', '1973-11-01'],
    ['Sameera Reddy', '1978-12-14'], ['Somdev Devvarman', '1985-02-13'], ['Nitish Kumar', '1951-03-01'],
    ['Sneha Ullal', '1987-12-18'], ['Zayed Khan', '1980-07-05'], ['Charu Majumdar', '1918-05-15'],
    ['Rati Agnihotri', '1960-12-10'], ['Revathi', '1966-07-08'], ['Pritam Chakraborty', '1971-06-14'],
    ['Nushrratt Bharuccha', '1985-05-17'], ['Meena', '1976-09-16'], ['Saurabh Shukla', '1963-03-05'],
    ['Hariharan', '1955-04-03'], ['Amit Trivedi', '1979-04-08'], ['Suresh Oberoi', '1946-12-17'],
    ['Shreyas Talpade', '1976-01-27'], ['Sam Pitroda', '1942-11-16'], ['Puri Jagannadh', '1966-09-28'],
    ['Atlee', '1986-09-21'], ['Varalaxmi Sarathkumar', '1985-03-05'], ['Jahnu Barua', '1952-10-18'],
    ['Girish Kasaravalli', '1950-12-03'], ['Mani Shankar Aiyar', '1941-04-10'], ['Chhagan Bhujbal', '1947-10-15'],
    // DB-sourced rows in the export that the fixes corrected
    ['George III of Great Britain', '1738-06-04'], ['Leonid Brezhnev', '1906-12-19'], ['Nicolaus Copernicus', '1473-02-19'],
  ];
  it.each(STATIC)('%s → %s in celebrities.json (and indianCelebrities.ts)', (name, iso) => {
    const rows = (celebritiesData.celebrities as Array<Record<string, unknown>>).filter(c => c.name === name);
    expect(rows.length).toBeGreaterThan(0);
    for (const c of rows) {
      expect(c.birth_date).toBe(iso);
      expect(c.birth_month_day).toBe(iso.slice(5));
      expect(c.birth_year).toBe(Number(iso.slice(0, 4)));
      expect(formatDOBDisplay(parseCelebrityDOB(bySlug.get(String(c.slug))!))).toBe(display(iso));
    }
    const ts = INDIAN_CELEBRITIES.filter(c => c.name === name);
    for (const c of ts) { expect(c.birth_date).toBe(iso); expect(c.birth_year).toBe(Number(iso.slice(0, 4))); }
  });

  it('monthly "born on this day" files list people on their verified day', () => {
    const where = (name: string) => Object.entries(allBirthdays)
      .flatMap(([k, v]) => v.people.filter(p => p.name === name).map(p => `${k}|${p.birthDate}`));
    // Wikipedia: Zuckerberg_ May 14 1984; Woody_Allen Nov 30 1935; Alexander_Graham_Bell Mar 3 1847;
    // Shah_Rukh_Khan 2 Nov 1965; Viswanathan_Anand 11 Dec 1969; Pedro_Almodóvar 25 Sep 1949;
    // Victoria_Beckham 17 Apr 1974; Wentworth_Miller Jun 2 1972; Jeff_Gordon Aug 4 1971; Joe_Louis May 13 1914;
    // Vidya_Balan 1 Jan 1979; Alexander_Ovechkin 17 Sep 1985; Reggie_Miller Aug 24 1965; Rajesh_Khanna 29 Dec 1942;
    // Christian_Louboutin 7 Jan 1964; Nikola_Tesla 10 Jul 1856; Isaac_Newton 4 Jan 1643 [O.S. 25 Dec 1642];
    // Leo_Tolstoy 9 Sep [O.S. 28 Aug] 1828; Johann_Sebastian_Bach 31 Mar [O.S. 21 Mar] 1685;
    // John_Adams Oct 30 [O.S. Oct 19] 1735; Ryan_Gosling Nov 12 1980.
    expect(where('Mark Zuckerberg')).toEqual(['05-14|1984-05-14']);
    expect(where('Woody Allen')).toEqual(['11-30|1935-11-30']);
    expect(where('Alexander Graham Bell')).toEqual(['03-03|1847-03-03']);
    expect(where('Shah Rukh Khan')).toEqual(['11-02|1965-11-02']);
    expect(where('Viswanathan Anand')).toEqual(['12-11|1969-12-11']);
    expect(where('Pedro Almodóvar')).toEqual(['09-25|1949-09-25']);
    expect(where('Victoria Beckham')).toEqual(['04-17|1974-04-17']);
    expect(where('Wentworth Miller')).toEqual(['06-02|1972-06-02']);
    expect(where('Jeff Gordon')).toEqual(['08-04|1971-08-04']);
    expect(where('Joe Louis')).toEqual(['05-13|1914-05-13']);
    expect(where('Vidya Balan')).toEqual(['01-01|1979-01-01']);
    expect(where('Alexander Ovechkin')).toEqual(['09-17|1985-09-17']);
    expect(where('Reggie Miller')).toEqual(['08-24|1965-08-24']);
    expect(where('Rajesh Khanna')).toEqual(['12-29|1942-12-29']);
    expect(where('Christian Louboutin')).toEqual(['01-07|1964-01-07']);
    expect(where('Nikola Tesla')).toEqual(['07-10|1856-07-10']);
    expect(where('Isaac Newton')).toEqual(['01-04|1643-01-04']);
    expect(where('Leo Tolstoy')).toEqual(['09-09|1828-09-09']);
    expect(where('Johann Sebastian Bach')).toEqual(['03-31|1685-03-31']);
    expect(where('John Adams')).toEqual(['10-30|1735-10-30']);
    expect(where('Ryan Gosling')).toEqual(['11-12|1980-11-12']);
    // Joan_of_Arc: "c. 1412 … Her date of birth is unknown" — no day-specific listing.
    expect(where('Joan of Arc')).toEqual([]);
  });
});

describe('Batch 3: 1 January births and deaths', () => {
  it('real 1 January births show the full date (Sándor_Petőfi, Omar_al-Bashir, E._M._Forster)', () => {
    for (const [name, iso] of [['Sándor Petőfi', '1823-01-01'], ['Omar al-Bashir', '1944-01-01'], ['E. M. Forster', '1879-01-01']]) {
      const dob = parseCelebrityDOB({ name, birth_date: iso });
      expect(dob?.isFullDate).toBe(true);
      expect(formatDOBDisplay(dob)).toBe(display(iso));
    }
  });
  it('placeholder 1 January rows without a known date stay year-only', () => {
    // Joan_of_Arc "c. 1412"; Dante_Alighieri "c. May 1265"; Mustafa_Kemal_Atatürk "c. 1881"
    for (const [name, iso] of [['Joan of Arc', '1412-01-01'], ['Dante Alighieri', '1265-01-01'], ['Mustafa Kemal Atatürk', '1881-01-01']]) {
      const rec = applyCelebRecordFixes({ name, birth_date: iso, birth_year: Number(iso.slice(0, 4)) });
      expect(parseCelebrityDOB(rec)?.isFullDate).toBe(false);
    }
  });
  it.each([
    // [name, DB birth, verified death, age at death] — Wikipedia infobox
    ['Diane Keaton', '1946-01-01', '2025-10-11', 79],
    ['George III of Great Britain', '1738-01-01', '1820-01-29', 81],
    ['Elizabeth I of England', '1533-01-01', '1603-03-24', 69],
    ['Catherine de\' Medici', '1519-01-01', '1589-01-05', 69],
    ['Charu Majumdar', '1918-03-12', '1972-07-28', 54],
  ] as Array<[string, string, string, number]>)('%s died %s', (name, birth, death, age) => {
    const d = correctCelebDates({ name, birthDate: birth, deathDate: null });
    expect(d.deathDate).toBe(death);
    expect(d.isLiving).toBe(false);
    expect(ageAtDeath(d)).toBe(age);
    expect(Object.values(CELEB_DEATH_OVERRIDES)).toContain(death);
  });
});

/**
 * Code-side corrections for celebrity data (S7, S8, S9, S14).
 *
 * Celebrity rows come from Supabase (celebrity_sitelinks) and from the static
 * export src/data/celebrities.json. Until the founder applies
 * supabase/migrations/NOTES-celebrity-data-corrections.sql, these overrides are
 * applied wherever celebrity data is loaded so pages are correct regardless.
 *
 * Every date below was checked against the person's English Wikipedia infobox
 * (WebFetch, 23 Oct 2026). Do not add an entry without a source.
 */

/** "Pope Francis" → "pope-francis" (same shape as the site's celebrity slugs). */
export function slugifyName(name: string): string {
  return name
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/['’.]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** S7 — deaths missing from the data. Keyed by slug. */
export const CELEB_DEATH_OVERRIDES: Record<string, string> = {
  'jimmy-carter': '2024-12-29',   // en.wikipedia.org/wiki/Jimmy_Carter
  'pope-francis': '2025-04-21',   // en.wikipedia.org/wiki/Pope_Francis
  'rohit-bal': '2024-11-01',      // en.wikipedia.org/wiki/Rohit_Bal
  'dharmendra': '2025-11-24',     // en.wikipedia.org/wiki/Dharmendra
  'asrani': '2025-10-20',         // en.wikipedia.org/wiki/Asrani
  'm-karunanidhi': '2018-08-07',  // en.wikipedia.org/wiki/M._Karunanidhi (DB had 2018-01-01)
  // Batch 3 (23 Oct 2026): missing death, and "YYYY-01-01" placeholder deaths with a known day.
  'diane-keaton': '2025-10-11',                // en.wikipedia.org/wiki/Diane_Keaton
  'charu-majumdar': '1972-07-28',              // en.wikipedia.org/wiki/Charu_Majumdar (DB 1972-01-01)
  'elizabeth-i-of-england': '1603-03-24',      // en.wikipedia.org/wiki/Elizabeth_I
  'mary-i-of-england': '1558-11-17',           // en.wikipedia.org/wiki/Mary_I_of_England
  'catherine-de-medici': '1589-01-05',         // en.wikipedia.org/wiki/Catherine_de'_Medici
  'harry-martinson': '1978-02-11',             // en.wikipedia.org/wiki/Harry_Martinson
  'philipp-melanchthon': '1560-04-19',         // en.wikipedia.org/wiki/Philipp_Melanchthon
  'george-iii-of-great-britain': '1820-01-29', // en.wikipedia.org/wiki/George_III
  'john-donne': '1631-03-31',                  // en.wikipedia.org/wiki/John_Donne
  'lady-jane-grey': '1554-02-12',              // en.wikipedia.org/wiki/Lady_Jane_Grey
  'anne-boleyn': '1536-05-19',                 // en.wikipedia.org/wiki/Anne_Boleyn
};

/** S6 — birth dates wrong in the DB (static data was fixed in place). */
export const CELEB_BIRTH_OVERRIDES: Record<string, string> = {
  'rohit-bal': '1961-05-08',      // en.wikipedia.org/wiki/Rohit_Bal
  'ilayaraja': '1943-06-03',      // en.wikipedia.org/wiki/Ilaiyaraaja (infobox: 3 June 1943)
};

/**
 * Batch 3 — birth dates that are wrong in celebrity_sitelinks (Wikidata import,
 * proleptic-Gregorian conversion of Julian dates, "YYYY-01-01" placeholders for
 * people whose full date is known, and seed rows copied from old static data).
 *
 * A fix applies ONLY while the row still holds one of the known-wrong values, so
 * it can never touch a different person with the same name (e.g. Francis Bacon
 * the painter, born 1909) and it switches itself off once the founder applies
 * supabase/migrations/NOTES-celebrity-dates-batch3.sql.
 *
 * `correct` is the date in the person's English Wikipedia infobox (WebFetch,
 * 23 Oct 2026; page in the comment). Do not add an entry without a source.
 */
export interface CelebBirthFix { wrong: string[]; correct: string }
export const CELEB_BIRTH_FIXES: Record<string, CelebBirthFix> = {
  // ── Static data was right, DB wrong ──
  'dhanush': { wrong: ['1983-02-25'], correct: '1983-07-28' },               // Dhanush
  'kajol': { wrong: ['1975-08-05'], correct: '1974-08-05' },                 // Kajol
  'atal-bihari-vajpayee': { wrong: ['1924-12-24'], correct: '1924-12-25' },  // Atal_Bihari_Vajpayee
  'ranbir-kapoor': { wrong: ['1982-09-25'], correct: '1982-09-28' },         // Ranbir_Kapoor
  'om-puri': { wrong: ['1949-10-18'], correct: '1950-10-18' },               // Om_Puri
  'samantha-ruth-prabhu': { wrong: ['1987-04-27'], correct: '1987-04-28' },  // Samantha_Ruth_Prabhu
  'indra-nooyi': { wrong: ['1955-09-28'], correct: '1955-10-28' },           // Indra_Nooyi
  'gulzar': { wrong: ['1933-08-19'], correct: '1934-08-18' },                // Gulzar
  'sonu-sood': { wrong: ['1976-07-30'], correct: '1973-07-30' },             // Sonu_Sood
  'kader-khan': { wrong: ['1930-10-22'], correct: '1937-10-22' },            // Kader_Khan
  'mammootty': { wrong: ['1951-09-06'], correct: '1951-09-07' },             // Mammootty
  'kumar-sanu': { wrong: ['1957-09-23'], correct: '1957-10-20' },            // Kumar_Sanu
  'paresh-rawal': { wrong: ['1950-05-30'], correct: '1955-05-30' },          // Paresh_Rawal
  'rajkummar-rao': { wrong: ['1984-06-13'], correct: '1984-08-31' },         // Rajkummar_Rao
  'alok-nath': { wrong: ['1950-07-10'], correct: '1956-07-10' },             // Alok_Nath
  'usha-uthup': { wrong: ['1947-11-07'], correct: '1947-11-08' },            // Usha_Uthup
  'prithviraj-sukumaran': { wrong: ['1979-10-15'], correct: '1982-10-16' },  // Prithviraj_Sukumaran
  'mohammed-shami': { wrong: ['1990-03-09'], correct: '1990-09-03' },        // Mohammed_Shami
  'ajinkya-rahane': { wrong: ['1988-06-05'], correct: '1988-06-06' },        // Ajinkya_Rahane
  'mary-kom': { wrong: ['1982-03-01'], correct: '1982-11-24' },              // Mary_Kom
  'akbar': { wrong: ['1542-10-25'], correct: '1542-10-15' },                 // Akbar
  // ── Both static data and DB were wrong ──
  'charu-majumdar': { wrong: ['1918-03-12', '1918-01-15'], correct: '1918-05-15' },        // Charu_Majumdar
  'meena': { wrong: ['1974-09-16', '1980-09-16'], correct: '1976-09-16' },                 // Meena_(actress)
  'amit-trivedi': { wrong: ['1979-07-11', '1979-03-09'], correct: '1979-04-08' },          // Amit_Trivedi
  'sam-pitroda': { wrong: ['1942-05-04', '1942-05-16'], correct: '1942-11-16' },           // Sam_Pitroda
  'atlee': { wrong: ['1983-09-21', '1986-09-03'], correct: '1986-09-21' },                 // Atlee_(director)
  'varalaxmi-sarathkumar': { wrong: ['1985-03-03', '1987-10-19'], correct: '1985-03-05' }, // Varalaxmi_Sarathkumar
  'jahnu-barua': { wrong: ['1952-10-17', '1952-12-07'], correct: '1952-10-18' },           // Jahnu_Barua
  // ── DB was right; duplicate seed rows (sitelinks 0) still carry the old static date ──
  'sundar-pichai': { wrong: ['1972-07-10', '1972-07-12'], correct: '1972-06-10' },  // Sundar_Pichai
  'shubman-gill': { wrong: ['2002-09-08'], correct: '1999-09-08' },                 // Shubman_Gill
  'shraddha-kapoor': { wrong: ['1989-03-03'], correct: '1987-03-03' },              // Shraddha_Kapoor
  'hariharan': { wrong: ['1955-04-15'], correct: '1955-04-03' },                    // Hariharan_(singer)
  'nitish-kumar': { wrong: ['1951-03-08'], correct: '1951-03-01' },                 // Nitish_Kumar
  'nushrratt-bharuccha': { wrong: ['1985-02-17'], correct: '1985-05-17' },          // Nushrratt_Bharuccha
  'pritam-chakraborty': { wrong: ['1971-06-21'], correct: '1971-06-14' },           // Pritam
  'puri-jagannadh': { wrong: ['1966-07-01'], correct: '1966-09-28' },               // Puri_Jagannadh
  'rati-agnihotri': { wrong: ['1960-02-10'], correct: '1960-12-10' },               // Rati_Agnihotri
  'sameera-reddy': { wrong: ['1980-12-14'], correct: '1978-12-14' },                // Sameera_Reddy
  'saurabh-shukla': { wrong: ['1966-10-01'], correct: '1963-03-05' },               // Saurabh_Shukla
  'shreyas-talpade': { wrong: ['1976-10-27'], correct: '1976-01-27' },              // Shreyas_Talpade
  'sneha-ullal': { wrong: ['1985-09-23'], correct: '1987-12-18' },                  // Sneha_Ullal
  'somdev-devvarman': { wrong: ['1985-12-01'], correct: '1985-02-13' },             // Somdev_Devvarman
  'suresh-oberoi': { wrong: ['1946-12-01'], correct: '1946-12-17' },                // Suresh_Oberoi
  'zayed-khan': { wrong: ['1980-07-06'], correct: '1980-07-05' },                   // Zayed_Khan
  // ── International: Wikipedia gives the Julian (Old Style) date; the import converted it ──
  'leonardo-da-vinci': { wrong: ['1452-04-24'], correct: '1452-04-15' },     // Leonardo_da_Vinci
  'galileo-galilei': { wrong: ['1564-02-25'], correct: '1564-02-15' },       // Galileo_Galilei
  'michelangelo': { wrong: ['1475-03-15'], correct: '1475-03-06' },          // Michelangelo
  'martin-luther': { wrong: ['1483-11-19'], correct: '1483-11-10' },         // Martin_Luther
  'niccolo-machiavelli': { wrong: ['1469-05-12'], correct: '1469-05-03' },   // Niccolò_Machiavelli
  'nicolaus-copernicus': { wrong: ['1473-02-28'], correct: '1473-02-19' },   // Nicolaus_Copernicus
  'francis-bacon': { wrong: ['1561-02-01'], correct: '1561-01-22' },         // Francis_Bacon (not the 1909 painter)
  // c. 23 April 1564 per Wikipedia (traditional date; baptised 26 April). DB had a 1 April month placeholder.
  'william-shakespeare': { wrong: ['1564-04-01'], correct: '1564-04-23' },   // William_Shakespeare
  // ── International: other wrong days ──
  'tilda-swinton': { wrong: ['1960-11-04'], correct: '1960-11-05' },         // Tilda_Swinton
  'lucy-lawless': { wrong: ['1969-03-29'], correct: '1968-03-29' },          // Lucy_Lawless
  'joss-whedon': { wrong: ['1964-01-23'], correct: '1964-06-23' },           // Joss_Whedon
  'michael-b-jordan': { wrong: ['1987-02-23'], correct: '1987-02-09' },      // Michael_B._Jordan (duplicate row, no Wikidata id)
  'ryan-reynolds': { wrong: ['1986-11-01'], correct: '1976-10-23' },         // Ryan_Reynolds (duplicate row, no Wikidata id)
  // ── "YYYY-01-01" placeholders for people whose full date is known ──
  'georgia-okeeffe': { wrong: ['1887-01-01'], correct: '1887-11-15' },       // Georgia_O'Keeffe
  'tyra-banks': { wrong: ['1973-01-01'], correct: '1973-12-04' },            // Tyra_Banks
  'mary-j-blige': { wrong: ['1971-01-01'], correct: '1971-01-11' },          // Mary_J._Blige
  'diane-keaton': { wrong: ['1946-01-01'], correct: '1946-01-05' },          // Diane_Keaton
  'paco-de-lucia': { wrong: ['1947-01-01'], correct: '1947-12-21' },         // Paco_de_Lucía
  'george-iii-of-great-britain': { wrong: ['1738-01-01'], correct: '1738-06-04' }, // George_III ("4 June 1738 [NS]")
  'elizabeth-i-of-england': { wrong: ['1533-01-01'], correct: '1533-09-07' },// Elizabeth_I
  'mary-i-of-england': { wrong: ['1516-01-01'], correct: '1516-02-18' },     // Mary_I_of_England
  'leonid-brezhnev': { wrong: ['1907-01-01'], correct: '1906-12-19' },       // Leonid_Brezhnev
  'paul-samuelson': { wrong: ['1915-01-01'], correct: '1915-05-15' },        // Paul_Samuelson
  'catherine-de-medici': { wrong: ['1519-01-01'], correct: '1519-04-13' },   // Catherine_de'_Medici
  'alexandra-kollontai': { wrong: ['1872-01-01'], correct: '1872-03-31' },   // Alexandra_Kollontai
  'harry-martinson': { wrong: ['1904-01-01'], correct: '1904-05-06' },       // Harry_Martinson
  'hugo-grotius': { wrong: ['1583-01-01'], correct: '1583-04-10' },          // Hugo_Grotius
  'philipp-melanchthon': { wrong: ['1497-01-01'], correct: '1497-02-16' },   // Philipp_Melanchthon
};

/** Corrected birth date for a row (Batch 3 fixes), or the row's own value. */
export function fixBirthDate(nameOrSlug: string, birthDate: string | null | undefined): string | null {
  if (!birthDate) return birthDate ?? null;
  const fix = CELEB_BIRTH_FIXES[slugifyName(nameOrSlug)];
  const iso = birthDate.slice(0, 10);
  return fix && fix.wrong.includes(iso) ? fix.correct : birthDate;
}

/**
 * Apply birth/death corrections to a celebrities.json-shaped record
 * ({ name, slug?, birth_date, birth_month_day, birth_year, death_year }).
 * Used by scripts/export-celebrities.ts (so the nightly export never brings a
 * wrong DB date back) and by CelebrityPage at load time.
 */
export function applyCelebRecordFixes<T extends Record<string, unknown>>(rec: T): T {
  const name = String(rec.name ?? '');
  const slug = slugifyName(name);
  const bd = typeof rec.birth_date === 'string' ? rec.birth_date : null;
  const fixedBd = CELEB_BIRTH_OVERRIDES[slug] ?? fixBirthDate(slug, bd);
  const death = CELEB_DEATH_OVERRIDES[slug];
  if (fixedBd === bd && !death) return rec;
  const out: Record<string, unknown> = { ...rec };
  if (fixedBd && fixedBd !== bd) {
    out.birth_date = fixedBd;
    if ('birth_month_day' in rec) out.birth_month_day = fixedBd.slice(5, 10);
    if ('birth_year' in rec) out.birth_year = Number(fixedBd.slice(0, 4));
  }
  if (death && 'death_year' in rec) out.death_year = Number(death.slice(0, 4));
  return out as T;
}

/**
 * S9 — people whose dates are not known to the day/year (ancient, BCE).
 * The import stored BCE years as CE (Chanakya "371 → 283", i.e. "died aged
 * -88"). For these we show the era text and never compute an age.
 */
export const CELEB_ERA_OVERRIDES: Record<string, string> = {
  // en.wikipedia.org/wiki/Chanakya — only an era is given, no birth/death year.
  chanakya: '4th–3rd century BCE',
};

/**
 * S8 — the data has no date-precision field, and many imported rows use
 * YYYY-01-01 as a stand-in for "year only". These people really were born on
 * 1 January (en.wikipedia.org infobox, checked 23 Oct 2026), so their pages
 * must show the full date, zodiac and numerology.
 */
export const CONFIRMED_JAN1_BIRTHS = new Set<string>([
  'vidya-balan',        // 1 January 1979
  'nana-patekar',       // 1 January 1951
  'satyen-bose',        // Satyendra Nath Bose, 1 January 1894
  'satyendra-nath-bose',
  'asrani',             // 1 January 1941
  'christine-lagarde',  // 1 January 1956
  // Batch 3 (Wikipedia infobox, 23 Oct 2026)
  'sandor-petofi',      // Sándor Petőfi, 1 January 1823
  'omar-al-bashir',     // 1 January 1944
  'e-m-forster',        // E. M. Forster, 1 January 1879
]);

/** S14 — never list these people as "celebrity birthday twins". */
const BLOCKED_SLUGS = new Set<string>([
  'dawood-ibrahim', 'osama-bin-laden', 'pablo-escobar', 'ayman-al-zawahiri',
  'anders-behring-breivik', 'ted-bundy', 'jeffrey-dahmer', 'joaquin-guzman-loera',
  'andrei-chikatilo', 'albert-fish', 'timothy-mcveigh', 'salvatore-riina',
  'john-wayne-gacy', 'aileen-wuornos', 'john-gotti', 'ed-gein', 'jihadi-john',
  'h-h-holmes', 'richard-ramirez', 'abimael-guzman', 'harold-shipman',
  'salah-abdeslam', 'seung-hui-cho', 'edmund-kemper', 'gary-ridgway',
  'dennis-rader', 'issei-sagawa', 'whitey-bulger', 'atique-ahmed', 'afzal-guru',
  'lucky-luciano', 'bugsy-siegel', 'meyer-lansky',
]);
// Description guard for rows not in the list. "murdered by"/"killed by" (victims) don't match.
const CRIMINAL_DESC = /\b(gangster|terrorist|serial killer|drug lord|mobster|crime boss|mafia (?:boss|don)|mass murderer)\b/i;

export function isBlockedCelebrity(name: string, description?: string | null): boolean {
  if (BLOCKED_SLUGS.has(slugifyName(name))) return true;
  return !!description && CRIMINAL_DESC.test(description);
}

/** Oldest age we will ever show for someone recorded as living. */
export const MAX_LIVING_AGE = 105;

const yearOf = (iso: string | null | undefined): number | null => {
  if (!iso) return null;
  const y = parseInt(iso.slice(0, 4), 10);
  return Number.isFinite(y) ? y : null;
};

/** Whole years between two ISO dates (birthday-aware). Null if either is missing or order is impossible. */
export function yearsBetween(birthIso: string | null | undefined, endIso: string | null | undefined): number | null {
  if (!birthIso || !endIso) return null;
  const b = birthIso.slice(0, 10).split('-').map(Number);
  const e = endIso.slice(0, 10).split('-').map(Number);
  if (b.length < 3 || e.length < 3 || b.some(n => !Number.isFinite(n)) || e.some(n => !Number.isFinite(n))) return null;
  let age = e[0] - b[0];
  if (e[1] < b[1] || (e[1] === b[1] && e[2] < b[2])) age -= 1;
  return age >= 0 ? age : null;
}

export interface CelebDatesIn {
  name: string;
  birthDate: string | null | undefined;
  deathDate: string | null | undefined;
}
export interface CelebDatesOut {
  birthDate: string | null;
  deathDate: string | null;
  isLiving: boolean;
  /** e.g. "4th–3rd century BCE" — when set, never show a birth year or age. */
  era: string | null;
  /** True when the stored dates can't be trusted for an age (death before birth, BCE stored as CE). */
  datesUnreliable: boolean;
}

/** Apply the overrides above to one celebrity's dates. */
export function correctCelebDates(row: CelebDatesIn): CelebDatesOut {
  const slug = slugifyName(row.name);
  const birthDate = CELEB_BIRTH_OVERRIDES[slug] ?? fixBirthDate(slug, row.birthDate);
  const deathDate = CELEB_DEATH_OVERRIDES[slug] ?? row.deathDate ?? null;
  const era = CELEB_ERA_OVERRIDES[slug] ?? null;
  const by = yearOf(birthDate), dy = yearOf(deathDate);
  const datesUnreliable = !!era || (by != null && dy != null && dy < by);
  return { birthDate, deathDate, isLiving: !deathDate && !era, era, datesUnreliable };
}

/** Age at death, or null when it can't honestly be stated. */
export function ageAtDeath(d: CelebDatesOut): number | null {
  if (d.datesUnreliable || !d.deathDate) return null;
  return yearsBetween(d.birthDate, d.deathDate);
}

/** Current age of a living person, or null ("age not shown") above MAX_LIVING_AGE. */
export function livingAge(birthIso: string | null | undefined, now: Date = new Date()): number | null {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const age = yearsBetween(birthIso, today);
  if (age == null || age > MAX_LIVING_AGE) return null;
  return age;
}

/** S8 — the record's own nationality text, else the country name for its ISO code ("US" → "United States"). Null if neither. */
export function nationalityLabel(nationality: string | null | undefined, code: string | null | undefined): string | null {
  if (nationality && nationality.trim()) return nationality.trim();
  if (!code) return null;
  try {
    const dn = new Intl.DisplayNames(['en'], { type: 'region' });
    return dn.of(code.toUpperCase()) ?? null;
  } catch {
    return null;
  }
}

/**
 * Years and age for a celebrity card. Applies the overrides, never shows an age
 * computed from unreliable (BCE / death-before-birth) dates, and returns
 * age = null for a "living" person older than MAX_LIVING_AGE.
 */
export function celebYearsForDisplay(
  row: CelebDatesIn & { datesUnreliable?: boolean },
  now: Date = new Date(),
): { birthYear: number | null; deathYear: number | null; age: number | null; isLiving: boolean; era: string | null } {
  const d = correctCelebDates(row);
  if (d.datesUnreliable || row.datesUnreliable) {
    return { birthYear: null, deathYear: null, age: null, isLiving: false, era: d.era };
  }
  const birthYear = yearOf(d.birthDate);
  const deathYear = yearOf(d.deathDate);
  const age = d.isLiving ? livingAge(d.birthDate, now) : ageAtDeath(d);
  return { birthYear, deathYear, age, isLiving: d.isLiving, era: null };
}

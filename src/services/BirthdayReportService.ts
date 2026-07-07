import { supabase } from '@/integrations/supabase/client';
import { getRankedBirthdayCelebrities } from '@/services/BirthdaySearchService';
import { getChineseZodiac } from '@/services/ChineseZodiacService';
import { getVedicRashi, compareZodiacs } from '@/services/VedicZodiacService';
import { getZodiacByDate } from '@/data/zodiacData';
import { getBirthstoneByMonth } from '@/data/birthstoneData';
import { getNumerologyByNumber } from '@/data/numerologyData';
import { getGenerationBasic } from '@/services/GenerationService';

// ── Constants ──────────────────────────────────────────────────────────────────

export const ORBITAL_PERIODS: Record<string, number> = {
  Mercury: 88,
  Venus: 224.7,
  Mars: 687,
  Jupiter: 4331,
  Saturn: 10759,
  Uranus: 30589,
  Neptune: 59800,
};

export const PLANET_SHOCKING_FACTS: Record<string, string> = {
  Mercury: 'Mercury spins so slowly that one day lasts 59 Earth days — but a Mercury year is only 88 days. A Mercurian day is longer than its year.',
  Venus: 'Venus rotates backwards. The Sun rises in the west and sets in the east. A day on Venus lasts 243 Earth days — longer than its 225-day year.',
  Mars: 'Mars has the tallest volcano in the solar system — Olympus Mons stands 22 km high, nearly 3× the height of Everest.',
  Jupiter: 'The Great Red Spot on Jupiter is a storm that has been raging for over 350 years. It is so large that Earth could fit inside it with room to spare.',
  Saturn: 'Saturn is the only planet in the solar system less dense than water. If you could find a bathtub large enough, Saturn would float in it.',
  Uranus: 'Uranus rotates on its side — its axial tilt is 98°. Its poles experience 42 years of continuous sunlight followed by 42 years of total darkness.',
  Neptune: 'It rains diamonds on Neptune. Extreme pressure converts carbon into diamond crystals that sink toward the core. Scientists estimate millions of tonnes precipitate annually. [Science, 2017]',
};

const HISTORICAL_EVENTS: Record<string, Array<{ year: number; event: string }>> = {
  '01-01': [{ year: 1863, event: 'Emancipation Proclamation took effect, freeing enslaved people in Confederate states' }, { year: 2000, event: 'The world celebrated the millennium without the feared Y2K computer collapse' }],
  '01-15': [{ year: 1929, event: 'Martin Luther King Jr. was born in Atlanta, Georgia' }, { year: 2001, event: 'Wikipedia launched, becoming the world\'s largest collaborative encyclopedia' }],
  '01-20': [{ year: 2009, event: 'Barack Obama was inaugurated as the 44th President of the United States' }, { year: 1981, event: 'Iran released 52 American hostages after 444 days in captivity' }],
  '01-28': [{ year: 1986, event: 'Space Shuttle Challenger broke apart 73 seconds after launch, killing all 7 crew members' }],
  '02-04': [{ year: 2004, event: 'Mark Zuckerberg launched Facebook from his Harvard dorm room' }, { year: 1945, event: 'Roosevelt, Churchill and Stalin met at the Yalta Conference to plan the post-war world' }],
  '02-12': [{ year: 1809, event: 'Charles Darwin and Abraham Lincoln were born on the exact same day' }, { year: 1924, event: 'IBM was incorporated under its current name' }],
  '02-14': [{ year: 1876, event: 'Alexander Graham Bell filed his patent for the telephone — just hours before a rival inventor' }, { year: 1929, event: 'The St. Valentine\'s Day Massacre: seven men were gunned down in Chicago' }],
  '02-22': [{ year: 1732, event: 'George Washington was born in Westmoreland County, Virginia' }],
  '03-05': [{ year: 1953, event: 'Joseph Stalin died after ruling the Soviet Union for nearly 30 years' }],
  '03-14': [{ year: 1879, event: 'Albert Einstein was born in Ulm, Kingdom of Württemberg' }, { year: 1883, event: 'Karl Marx died in London, leaving Das Kapital unfinished' }],
  '03-20': [{ year: 2003, event: 'The United States invaded Iraq, beginning the Iraq War' }],
  '03-28': [{ year: 1979, event: 'The Three Mile Island nuclear accident began — the worst nuclear accident in US history' }],
  '04-12': [{ year: 1961, event: 'Soviet cosmonaut Yuri Gagarin became the first human to travel into outer space' }, { year: 1865, event: 'The Civil War effectively ended as Confederate forces surrendered at Appomattox Court House' }],
  '04-15': [{ year: 1912, event: 'The RMS Titanic sank in the North Atlantic Ocean, killing over 1,500 people' }, { year: 1865, event: 'President Abraham Lincoln died after being shot at Ford\'s Theatre the previous evening' }],
  '04-22': [{ year: 1970, event: 'The first Earth Day was celebrated, launching the modern environmental movement' }],
  '04-30': [{ year: 1789, event: 'George Washington was inaugurated as the first President of the United States' }, { year: 1975, event: 'Saigon fell to North Vietnamese forces, ending the Vietnam War' }],
  '05-06': [{ year: 1954, event: 'Roger Bannister broke the 4-minute mile barrier, running it in 3:59.4 at Oxford' }],
  '05-08': [{ year: 1945, event: 'Victory in Europe Day (V-E Day): Germany\'s unconditional surrender ended World War II in Europe' }],
  '05-25': [{ year: 1961, event: 'President Kennedy declared before Congress the goal of landing on the Moon before the decade\'s end' }, { year: 1977, event: 'Star Wars was released in cinemas, transforming popular culture forever' }],
  '05-29': [{ year: 1953, event: 'Edmund Hillary and Tenzing Norgay became the first climbers confirmed to have reached the summit of Everest' }],
  '06-06': [{ year: 1944, event: 'D-Day: Allied forces launched the largest seaborne invasion in history on the beaches of Normandy, France' }],
  '06-28': [{ year: 1914, event: 'Archduke Franz Ferdinand of Austria was assassinated in Sarajevo, triggering World War I' }, { year: 1919, event: 'The Treaty of Versailles was signed, officially ending World War I' }],
  '07-04': [{ year: 1776, event: 'The United States Declaration of Independence was adopted by the Continental Congress' }, { year: 1997, event: 'NASA\'s Mars Pathfinder spacecraft landed on Mars, deploying the Sojourner rover' }],
  '07-16': [{ year: 1945, event: 'The first atomic bomb was successfully tested at Trinity Site in New Mexico' }, { year: 1969, event: 'Apollo 11 launched from Kennedy Space Center, beginning humanity\'s journey to the Moon' }],
  '07-20': [{ year: 1969, event: 'Apollo 11 landed on the Moon. Neil Armstrong became the first human to walk on the lunar surface' }, { year: 1944, event: 'A bomb exploded in Hitler\'s conference room in a failed assassination attempt' }],
  '07-28': [{ year: 1914, event: 'World War I began as Austria-Hungary declared war on Serbia' }],
  '08-06': [{ year: 1945, event: 'The United States dropped an atomic bomb on Hiroshima, Japan, killing approximately 140,000 people' }, { year: 1991, event: 'Tim Berners-Lee made the World Wide Web publicly available for the first time' }],
  '08-09': [{ year: 1945, event: 'The United States dropped a second atomic bomb on Nagasaki, Japan' }],
  '08-15': [{ year: 1945, event: 'Japan announced its surrender, ending World War II' }, { year: 1969, event: 'The Woodstock Music Festival began in upstate New York, defining a generation' }],
  '08-28': [{ year: 1963, event: 'Martin Luther King Jr. delivered his "I Have a Dream" speech at the March on Washington before 250,000 people' }],
  '09-01': [{ year: 1939, event: 'Germany invaded Poland, triggering the start of World War II' }],
  '09-11': [{ year: 2001, event: 'Terrorist attacks destroyed the World Trade Center and damaged the Pentagon, killing 2,977 people' }],
  '09-12': [{ year: 1962, event: 'President Kennedy delivered his famous "We choose to go to the Moon" speech at Rice University' }],
  '09-25': [{ year: 1789, event: 'The US Congress proposed the Bill of Rights — the first 10 amendments to the Constitution' }],
  '10-04': [{ year: 1957, event: 'The Soviet Union launched Sputnik 1, the world\'s first artificial satellite, beginning the Space Age' }],
  '10-14': [{ year: 1947, event: 'Chuck Yeager became the first person to travel faster than the speed of sound, flying at Mach 1.06' }, { year: 1066, event: 'The Battle of Hastings took place; William the Conqueror defeated King Harold II' }],
  '10-29': [{ year: 1929, event: 'Black Tuesday: the Wall Street Crash triggered the Great Depression' }, { year: 1969, event: 'The first message was sent over ARPANET, the precursor to the internet' }],
  '10-31': [{ year: 1517, event: 'Martin Luther posted his 95 Theses, sparking the Protestant Reformation' }, { year: 2011, event: 'The world\'s population officially reached 7 billion people' }],
  '11-09': [{ year: 1989, event: 'The Berlin Wall fell, symbolizing the end of the Cold War and the reunification of Germany' }, { year: 1938, event: 'Kristallnacht: Nazi Germany carried out a night of violent pogroms against Jewish people' }],
  '11-19': [{ year: 1863, event: 'Abraham Lincoln delivered the Gettysburg Address at the dedication of the Soldiers\' National Cemetery' }],
  '11-22': [{ year: 1963, event: 'President John F. Kennedy was assassinated in Dallas, Texas' }],
  '11-24': [{ year: 1859, event: 'Charles Darwin published "On the Origin of Species," transforming biology and human self-understanding' }],
  '12-07': [{ year: 1941, event: 'Japan attacked Pearl Harbor; the United States entered World War II the next day' }],
  '12-17': [{ year: 1903, event: 'Orville Wright made the first successful powered airplane flight at Kitty Hawk, lasting 12 seconds' }],
  '12-21': [{ year: 1898, event: 'Marie and Pierre Curie discovered radium, a breakthrough that revolutionized nuclear physics' }],
  '12-25': [{ year: 1776, event: 'George Washington crossed the Delaware River to surprise Hessian troops at Trenton' }, { year: 1991, event: 'Mikhail Gorbachev resigned and the Soviet Union was formally dissolved' }],
  '12-26': [{ year: 2004, event: 'A magnitude 9.1 earthquake off Indonesia triggered the deadliest tsunami in recorded history, killing 230,000 people' }],
};

const COMPATIBILITY: Record<string, { best: string[]; challenging: string[] }> = {
  aries:       { best: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],   challenging: ['Cancer', 'Capricorn'] },
  taurus:      { best: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],     challenging: ['Leo', 'Aquarius'] },
  gemini:      { best: ['Libra', 'Aquarius', 'Aries', 'Leo'],          challenging: ['Virgo', 'Pisces'] },
  cancer:      { best: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],       challenging: ['Aries', 'Libra'] },
  leo:         { best: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],    challenging: ['Taurus', 'Scorpio'] },
  virgo:       { best: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],   challenging: ['Gemini', 'Sagittarius'] },
  libra:       { best: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],   challenging: ['Cancer', 'Capricorn'] },
  scorpio:     { best: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],     challenging: ['Leo', 'Aquarius'] },
  sagittarius: { best: ['Aries', 'Leo', 'Libra', 'Aquarius'],          challenging: ['Virgo', 'Pisces'] },
  capricorn:   { best: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],       challenging: ['Aries', 'Libra'] },
  aquarius:    { best: ['Gemini', 'Libra', 'Sagittarius', 'Aries'],    challenging: ['Taurus', 'Scorpio'] },
  pisces:      { best: ['Cancer', 'Scorpio', 'Capricorn', 'Taurus'],   challenging: ['Gemini', 'Sagittarius'] },
};

export const PERSONAL_YEAR_MEANINGS: Record<number, { title: string; meaning: string; focus: string }> = {
  1:  { title: 'Year of New Beginnings',    meaning: 'A powerful year to initiate new projects, start fresh chapters, and assert your independence. The seeds you plant now define the next 9-year cycle.', focus: 'Independence, new ventures, leadership, self-discovery' },
  2:  { title: 'Year of Partnership',       meaning: 'Relationships and cooperation take center stage. Patience, diplomacy, and sensitivity are your superpowers this year. Work with others rather than alone.', focus: 'Relationships, cooperation, patience, emotional awareness' },
  3:  { title: 'Year of Expression',        meaning: 'Your creativity, communication, and joy expand dramatically. This is a year to share your gifts with the world — through art, writing, speaking, or social connection.', focus: 'Creativity, communication, social life, self-expression' },
  4:  { title: 'Year of Foundation',        meaning: 'Hard work, discipline, and building solid foundations define this year. What you construct now with dedication will last for years to come.', focus: 'Work, structure, discipline, long-term planning' },
  5:  { title: 'Year of Freedom',           meaning: 'Change, adventure, and liberation define this dynamic year. Expect the unexpected — this is a year of movement, travel, and exciting new experiences.', focus: 'Freedom, change, adventure, flexibility, new opportunities' },
  6:  { title: 'Year of Responsibility',    meaning: 'Family, home, relationships, and service to others come into focus. This is a year of deep nurturing — of yourself, your loved ones, and your community.', focus: 'Family, home, love, service, responsibility' },
  7:  { title: 'Year of Reflection',        meaning: 'A deeply introspective year calling you inward. Spiritual growth, inner wisdom, and solitude bring profound insights. This is a year to study, research, and seek truth.', focus: 'Spirituality, inner growth, solitude, wisdom, analysis' },
  8:  { title: 'Year of Power',             meaning: 'Achievement, authority, and financial abundance are the themes of this powerhouse year. Your efforts gain material recognition — leadership and ambition are rewarded.', focus: 'Career success, financial growth, authority, achievement' },
  9:  { title: 'Year of Completion',        meaning: 'A year of endings, release, and completion. Let go of what no longer serves you — clearing the way for the new 9-year cycle that begins next year.', focus: 'Release, completion, humanitarian service, endings, forgiveness' },
  11: { title: 'Year of Illumination',      meaning: 'This master number year brings heightened intuition, spiritual insight, and the potential for inspiration and enlightenment. You may feel called to a higher purpose.', focus: 'Intuition, spiritual awareness, inspiration, higher calling' },
  22: { title: 'Year of the Master Builder', meaning: 'The most powerful year in numerology. Grand visions can become tangible reality. This is a year for large-scale achievement and turning dreams into lasting structures.', focus: 'Mastery, large-scale achievement, manifestation, legacy' },
};

// ── Helper functions ───────────────────────────────────────────────────────────

function getZodiacKey(dob: Date): string {
  const month = dob.getMonth() + 1;
  const day = dob.getDate();
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  return 'pisces';
}

function getLifePath(dob: Date): number {
  const dd = String(dob.getDate()).padStart(2, '0');
  const mm = String(dob.getMonth() + 1).padStart(2, '0');
  const yyyy = String(dob.getFullYear());
  const s = `${dd}${mm}${yyyy}`;
  let sum = s.split('').reduce((a, c) => a + parseInt(c, 10), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').reduce((a, c) => a + parseInt(c, 10), 0);
  }
  return sum;
}

function getPersonalYear2026(dob: Date): number {
  const universalYear = 10; // 2+0+2+6 = 10
  const birthMonth = dob.getMonth() + 1;
  const birthDay = dob.getDate();
  let sum = birthMonth + birthDay + universalYear;
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = String(sum).split('').reduce((a, c) => a + parseInt(c, 10), 0);
  }
  return sum;
}

const GENERATION_DESCS: Record<string, string> = {
  'Gen Alpha':        'Digital natives born into a world of AI and smartphones — they will likely live to see the 22nd century.',
  'Gen Z':            'The first true digital generation — pragmatic, inclusive, entrepreneurial, and fluent in social media from birth.',
  'Millennial':       'Shaped by the internet revolution, the 2008 financial crisis, and a reinvention of work, relationships, and values.',
  'Gen X':            'Independent, self-reliant, and the first latchkey generation — raised to figure things out for themselves.',
  'Baby Boomer':      'Grew up in post-war prosperity and redefined culture, commerce, and the meaning of adulthood.',
  'Silent Generation':'Shaped by the Great Depression and World War II — disciplined, resilient, and defined by duty over self.',
};

function getGeneration(year: number): { name: string; range: string; emoji: string; desc: string } {
  const g = getGenerationBasic(year) ?? { name: 'Silent Generation', range: '1928–1945', emoji: '📻' };
  return { ...g, desc: GENERATION_DESCS[g.name] ?? '' };
}

function getHistoricalEvents(dob: Date): Array<{ year: number; event: string }> {
  const mm = String(dob.getMonth() + 1).padStart(2, '0');
  const dd = String(dob.getDate()).padStart(2, '0');
  return HISTORICAL_EVENTS[`${mm}-${dd}`] ?? [];
}

function getCompatibility(zodiacKey: string): { best: string[]; challenging: string[] } {
  return COMPATIBILITY[zodiacKey] ?? { best: [], challenging: [] };
}

// ── Interface ──────────────────────────────────────────────────────────────────

export interface BirthdayReportData {
  recipientName: string;
  recipientDob: string;
  gifterName: string;
  personalMessage: string;
  country: string;
  celebrities: any[];
  historicalEvents: Array<{ year: number; event: string }>;
  westernZodiac: any;
  chineseZodiac: any;
  vedicRashi: any;
  zodiacComparison: any;
  compatibility: { best: string[]; challenging: string[] };
  lifePathNumber: number;
  lifePathData: any;
  personalYear2026: number;
  personalYearMeaning: any;
  birthstone: any;
  generation: any;
  planetaryAges: Record<string, number>;
  planetaryFacts: Record<string, string>;
  age: number;
  daysSinceBirth: number;
  daysUntilNextBirthday: number;
  nextBirthdayDate: string;
  dayOfWeekBorn: string;
  zodiacKey: string;
}

// ── Exported functions ─────────────────────────────────────────────────────────

export async function generateReportData(
  recipientName: string,
  dobString: string,
  gifterName: string,
  personalMessage: string,
  country: string
): Promise<BirthdayReportData> {
  const dob = new Date(dobString + 'T12:00:00');
  if (dob > new Date()) throw new Error("Birth date cannot be in the future.");
  const today = new Date();

  const age =
    today.getFullYear() -
    dob.getFullYear() -
    (today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
      ? 1
      : 0);

  const daysSinceBirth = Math.floor((today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));

  const nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBirthday <= today) nextBirthday.setFullYear(today.getFullYear() + 1);
  const daysUntilNextBirthday = Math.floor(
    (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const nextBirthdayDate = nextBirthday.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const dayOfWeekBorn = dob.toLocaleDateString('en-US', { weekday: 'long' });
  const zodiacKey = getZodiacKey(dob);

  const mm = String(dob.getMonth() + 1).padStart(2, '0');
  const dd = String(dob.getDate()).padStart(2, '0');

  const celebrities = await getRankedBirthdayCelebrities(`${mm}-${dd}`, country, 6);
  const historicalEvents = getHistoricalEvents(dob);
  const westernZodiac = getZodiacByDate(dob.getMonth() + 1, dob.getDate());
  const chineseZodiac = getChineseZodiac(dob);
  const vedicRashi = getVedicRashi(dob);
  const zodiacComparison = compareZodiacs(dob);
  const compatibility = getCompatibility(zodiacKey);

  const lifePathNumber = getLifePath(dob);
  const lifePathData = getNumerologyByNumber(lifePathNumber);

  const personalYear2026 = getPersonalYear2026(dob);
  const personalYearMeaning = PERSONAL_YEAR_MEANINGS[personalYear2026] ?? null;

  const birthstone = getBirthstoneByMonth(dob.getMonth() + 1);
  const generation = getGeneration(dob.getFullYear());

  const planetaryAges: Record<string, number> = {};
  for (const [planet, period] of Object.entries(ORBITAL_PERIODS)) {
    planetaryAges[planet] = parseFloat((daysSinceBirth / period).toFixed(2));
  }

  return {
    recipientName,
    recipientDob: dobString,
    gifterName,
    personalMessage,
    country,
    celebrities,
    historicalEvents,
    westernZodiac,
    chineseZodiac,
    vedicRashi,
    zodiacComparison,
    compatibility,
    lifePathNumber,
    lifePathData,
    personalYear2026,
    personalYearMeaning,
    birthstone,
    generation,
    planetaryAges,
    planetaryFacts: PLANET_SHOCKING_FACTS,
    age,
    daysSinceBirth,
    daysUntilNextBirthday,
    nextBirthdayDate,
    dayOfWeekBorn,
    zodiacKey,
  };
}

export async function saveReport(
  _userId: string | null,
  data: BirthdayReportData,
  isPremium: boolean,
  gender = ''
): Promise<string | null> {
  let authToken: string | null = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    authToken = session?.access_token ?? null;
  } catch {
    // proceed without auth header
  }

  try {
    const res = await fetch('/api/save-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({ reportData: data, isPremium, gender }),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.slug ?? null;
  } catch {
    return null;
  }
}

export async function getReport(slug: string): Promise<any | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data, error } = await db
    .from('birthday_reports')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;

  // Increment view count via SECURITY DEFINER RPC — the anon/authed client
  // has no UPDATE policy on birthday_reports, so a direct .update() silently fails.
  supabase.rpc('increment_report_view_count', { report_id: data.id }).then(() => {});

  return data;
}

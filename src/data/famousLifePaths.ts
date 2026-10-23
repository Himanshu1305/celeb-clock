/**
 * Famous people for "Famous Life Path N" lists — GENERATED from the one shared
 * Life Path function (audit N3). Never hand-file a person under a number: list
 * them here once with their birth date and let `famousForLifePath` decide.
 *
 * Birth dates are the ones already used on the site (numerologyData.ts,
 * NumerologyArticle.tsx, NumerologyLifePath.tsx), all Gregorian dates as given
 * on Wikipedia. People whose recorded date is pre-Gregorian (Julian) or disputed
 * — e.g. Leonardo da Vinci (1452), Guru Nanak (1469), Kabir (1440), Sai Baba of
 * Shirdi, Bhagat Singh (27 or 28 Sep) — are deliberately left out.
 */
import { lifePathWorking } from '@/lib/lifePath';

export interface FamousPerson {
  name: string;
  /** ISO YYYY-MM-DD (Gregorian). */
  dob: string;
  /** true for people shown in India-specific example lists. */
  indian?: boolean;
}

export const FAMOUS_PEOPLE: FamousPerson[] = [
  // Previously listed on /numerology/:n
  { name: 'Steve Jobs', dob: '1955-02-24' },
  { name: 'Martin Luther King Jr.', dob: '1929-01-15' },
  { name: 'Lady Gaga', dob: '1986-03-28' },
  { name: 'Nikola Tesla', dob: '1856-07-10' },
  { name: 'Barack Obama', dob: '1961-08-04' },
  { name: 'Ronald Reagan', dob: '1911-02-06' },
  { name: 'Jennifer Aniston', dob: '1969-02-11' },
  { name: 'Diana, Princess of Wales', dob: '1961-07-01' },
  { name: 'John Travolta', dob: '1954-02-18' },
  { name: 'David Bowie', dob: '1947-01-08' },
  { name: 'Celine Dion', dob: '1968-03-30' },
  { name: 'Snoop Dogg', dob: '1971-10-20' },
  { name: 'Oprah Winfrey', dob: '1954-01-29' },
  { name: 'Clint Eastwood', dob: '1930-05-31' },
  { name: 'Arnold Schwarzenegger', dob: '1947-07-30' },
  { name: 'Bill Gates', dob: '1955-10-28' },
  { name: 'Angelina Jolie', dob: '1975-06-04' },
  { name: 'Mick Jagger', dob: '1943-07-26' },
  { name: 'Abraham Lincoln', dob: '1809-02-12' },
  { name: 'Beyoncé', dob: '1981-09-04' },
  { name: 'Michael Jackson', dob: '1958-08-29' },
  { name: 'John Lennon', dob: '1940-10-09' },
  { name: 'Jessica Simpson', dob: '1980-07-10' },
  { name: 'Bruce Willis', dob: '1955-03-19' },
  { name: 'Stephen Hawking', dob: '1942-01-08' },
  { name: 'Taylor Swift', dob: '1989-12-13' },
  { name: 'Keira Knightley', dob: '1985-03-26' },
  { name: 'Jerry Seinfeld', dob: '1954-04-29' },
  { name: 'Pablo Picasso', dob: '1881-10-25' },
  { name: 'Nelson Mandela', dob: '1918-07-18' },
  { name: 'Sandra Bullock', dob: '1964-07-26' },
  { name: 'Naomi Campbell', dob: '1970-05-22' },
  { name: 'Mahatma Gandhi', dob: '1869-10-02', indian: true },
  { name: 'Mother Teresa', dob: '1910-08-26' },
  { name: 'Morgan Freeman', dob: '1937-06-01' },
  { name: 'Jim Carrey', dob: '1962-01-17' },
  { name: 'Kobe Bryant', dob: '1978-08-23' },
  { name: 'Prince William', dob: '1982-06-21' },
  { name: 'Paul McCartney', dob: '1942-06-18' },
  { name: 'Albert Einstein', dob: '1879-03-14' },
  { name: 'Stephen King', dob: '1947-09-21' },
  { name: 'Meryl Streep', dob: '1949-06-22' },
  // Previously listed in the Life Path card (NumerologyLifePath.tsx)
  { name: 'Michelle Obama', dob: '1964-01-17' },
  { name: 'Wolfgang Amadeus Mozart', dob: '1756-01-27' },
  { name: 'David Beckham', dob: '1975-05-02' },
  { name: 'Tina Fey', dob: '1970-05-18' },
  { name: 'Francis Ford Coppola', dob: '1939-04-07' },
  { name: 'Kanye West', dob: '1977-06-08' },
  { name: 'Elton John', dob: '1947-03-25' },
  { name: 'Victoria Beckham', dob: '1974-04-17' },
  { name: 'Leonardo DiCaprio', dob: '1974-11-11' },
  { name: 'Julia Roberts', dob: '1967-10-28' },
  { name: 'Elvis Presley', dob: '1935-01-08' },
  { name: 'Bob Marley', dob: '1945-02-06' },
  // Previously listed as "Famous Indians" in the Life Path article
  { name: 'B. R. Ambedkar', dob: '1891-04-14', indian: true },
  { name: 'Rabindranath Tagore', dob: '1861-05-07', indian: true },
  { name: 'Dharmendra', dob: '1935-12-08', indian: true },
  { name: 'Vicky Kaushal', dob: '1988-05-16', indian: true },
  { name: 'Subhas Chandra Bose', dob: '1897-01-23', indian: true },
  { name: 'Swami Vivekananda', dob: '1863-01-12', indian: true },
  { name: 'Bal Gangadhar Tilak', dob: '1856-07-23', indian: true },
  { name: 'Sri Aurobindo', dob: '1872-08-15', indian: true },
  { name: 'Jawaharlal Nehru', dob: '1889-11-14', indian: true },
  { name: 'Ram Prasad Bismil', dob: '1897-06-11', indian: true },
  { name: 'Vinoba Bhave', dob: '1895-09-11', indian: true },
  { name: 'Sardar Vallabhbhai Patel', dob: '1875-10-31', indian: true },
  { name: 'Gopal Krishna Gokhale', dob: '1866-05-09', indian: true },
  { name: 'Maulana Abul Kalam Azad', dob: '1888-11-11', indian: true },
  { name: 'Sharad Pawar', dob: '1940-12-12', indian: true },
  { name: 'Usha Uthup', dob: '1947-11-08', indian: true },
  { name: 'M. S. Oberoi', dob: '1898-08-15', indian: true },
  { name: 'Mahesh Bhatt', dob: '1948-09-20', indian: true },
  { name: 'Puneeth Rajkumar', dob: '1975-03-17', indian: true },
];

export interface FamousLifePathEntry {
  name: string;
  /** e.g. "August 4, 1961" */
  born: string;
  /** The shared function's working, e.g. "Day 4 → 4 · Month 8 → 8 · Year 1961 → 17 → 8 · 4 + 8 + 8 = 20 → 2". */
  calculation: string;
  result: number;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function toFamousEntry(p: FamousPerson): FamousLifePathEntry {
  const [y, m, d] = p.dob.split('-').map(Number);
  const w = lifePathWorking(d, m, y);
  return { name: p.name, born: `${MONTHS[m - 1]} ${d}, ${y}`, calculation: w.steps, result: w.number };
}

/** Everyone in the list whose Life Path (shared function) is `n`. */
export function famousForLifePath(n: number, opts: { indianOnly?: boolean; limit?: number } = {}): FamousLifePathEntry[] {
  const out = FAMOUS_PEOPLE
    .filter(p => !opts.indianOnly || p.indian)
    .map(toFamousEntry)
    .filter(e => e.result === n);
  return opts.limit ? out.slice(0, opts.limit) : out;
}

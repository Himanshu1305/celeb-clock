// Chinese New Year start dates (month, day) for Jan/Feb edge cases
const CHINESE_NEW_YEAR_DATES: Record<number, [number, number]> = {
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
};

const ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'] as const;
const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'] as const;
const YIN_YANG = ['Yang', 'Yin'] as const;

export interface ChineseZodiacResult {
  animal: string;
  emoji: string;
  element: string;
  yin_yang: string;
  traits: string[];
  famous: string[];
  description: string;
  year: number;
}

const ANIMAL_DATA: Record<string, { emoji: string; traits: string[]; famous: string[]; description: string }> = {
  Rat:     { emoji: '🐀', traits: ['Clever', 'Adaptable', 'Quick-witted', 'Resourceful'], famous: ['Mozart', 'Shakespeare', 'George Washington'], description: 'Rats are quick-witted, resourceful, and versatile. They are charming, imaginative, and good at finding practical solutions.' },
  Ox:      { emoji: '🐂', traits: ['Diligent', 'Reliable', 'Patient', 'Strong-willed'], famous: ['Barack Obama', 'Napoleon Bonaparte', 'Walt Disney'], description: 'Oxen are diligent, dependable, and determined. They work hard with great patience and rarely seek shortcuts.' },
  Tiger:   { emoji: '🐅', traits: ['Brave', 'Confident', 'Competitive', 'Unpredictable'], famous: ['Marilyn Monroe', 'Leonardo DiCaprio', 'Tom Cruise'], description: 'Tigers are brave, competitive, and unpredictable. They are charming and well-liked but can be stubborn too.' },
  Rabbit:  { emoji: '🐇', traits: ['Gentle', 'Elegant', 'Alert', 'Quick'], famous: ['Albert Einstein', 'Brad Pitt', 'Angelina Jolie'], description: 'Rabbits are gentle, elegant, and alert. They tend to be cautious and conservative but highly popular in social circles.' },
  Dragon:  { emoji: '🐉', traits: ['Energetic', 'Fearless', 'Warm-hearted', 'Charismatic'], famous: ['Bruce Lee', 'John Lennon', 'Rihanna'], description: 'Dragons are energetic and fearless, seen as the luckiest zodiac sign. They are natural leaders who are passionate and determined.' },
  Snake:   { emoji: '🐍', traits: ['Enigmatic', 'Intuitive', 'Introspective', 'Wise'], famous: ['Mahatma Gandhi', 'Abraham Lincoln', 'Bob Dylan'], description: 'Snakes are enigmatic, intuitive, and wise. They rely on gut feelings and can be deeply philosophical and spiritual.' },
  Horse:   { emoji: '🐎', traits: ['Animated', 'Active', 'Energetic', 'Independent'], famous: ['Genghis Khan', 'Isaac Newton', 'Rembrandt'], description: 'Horses are animated, active, and energetic. They are free spirits who love to travel and hate constraints.' },
  Goat:    { emoji: '🐐', traits: ['Calm', 'Gentle', 'Creative', 'Sympathetic'], famous: ['Michelangelo', 'Bill Gates', 'Steve Jobs'], description: 'Goats are calm, gentle, and creative. They have a tender nature and are deeply connected to art and beauty.' },
  Monkey:  { emoji: '🐒', traits: ['Witty', 'Intelligent', 'Mischievous', 'Curious'], famous: ['Leonardo da Vinci', 'Elizabeth I', 'Julius Caesar'], description: 'Monkeys are witty, intelligent, and mischievous. They are fast learners with excellent memories and love a good challenge.' },
  Rooster: { emoji: '🐓', traits: ['Observant', 'Hardworking', 'Courageous', 'Honest'], famous: ['Beyoncé', 'Justin Timberlake', 'Roger Federer'], description: 'Roosters are observant, hardworking, and courageous. They are very observant and rarely miss things, always prepared and proud.' },
  Dog:     { emoji: '🐕', traits: ['Loyal', 'Honest', 'Amiable', 'Kind'], famous: ['Donald Trump', 'Michael Jackson', 'Madonna'], description: 'Dogs are loyal, honest, and amiable. They are the most lovable zodiac sign — always there to support others.' },
  Pig:     { emoji: '🐷', traits: ['Compassionate', 'Generous', 'Diligent', 'Sincere'], famous: ['Elton John', 'Arnold Schwarzenegger', 'Woody Allen'], description: 'Pigs are compassionate, generous, and diligent. They never harm others and are always ready to give everything to those in need.' },
};

function getChineseYear(dob: Date): number {
  const year = dob.getFullYear();
  const month = dob.getMonth() + 1;
  const day = dob.getDate();

  const cnyEntry = CHINESE_NEW_YEAR_DATES[year];
  if (cnyEntry) {
    const [cnyMonth, cnyDay] = cnyEntry;
    if (month < cnyMonth || (month === cnyMonth && day < cnyDay)) {
      return year - 1;
    }
  }
  return year;
}

export function getChineseZodiacAnimal(year: number): string {
  return ANIMALS[((year - 4) % 12 + 12) % 12];
}

export function getChineseZodiac(dob: Date): ChineseZodiacResult {
  const chineseYear = getChineseYear(dob);
  const animal = getChineseZodiacAnimal(chineseYear);
  const elementIndex = Math.floor(((chineseYear - 4) % 10 + 10) % 10 / 2);
  const element = ELEMENTS[elementIndex];
  const yin_yang = YIN_YANG[((chineseYear - 4) % 2 + 2) % 2];
  const data = ANIMAL_DATA[animal];
  return {
    animal,
    emoji: data.emoji,
    element,
    yin_yang,
    traits: data.traits,
    famous: data.famous,
    description: data.description,
    year: chineseYear,
  };
}

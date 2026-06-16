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

export interface ChineseSignExtended {
  years: number[];
  personality_deep: string;
  strengths_detail: string;
  challenges_detail: string;
  in_love: string;
  in_career: string;
  in_health: string;
  cultural_significance: string;
  lucky_colors: string[];
  lucky_numbers: number[];
  lucky_directions: string[];
  unlucky: string[];
  compatibility_best: string[];
  compatibility_worst: string[];
  famous_people: Array<{ name: string; born: number }>;
  outlook_2026: string;
}

export const CHINESE_SIGN_EXTENDED: Record<string, ChineseSignExtended> = {
  Rat: {
    years: [1924,1936,1948,1960,1972,1984,1996,2008,2020,2032],
    personality_deep: 'The Rat is the first sign of the Chinese Zodiac and carries the energy of new beginnings. Rat people are exceptionally quick-witted — they process information faster than almost any other sign and have an uncanny ability to spot opportunities before others even notice them. They are natural survivors who thrive in challenging environments.\n\nRats have a deep social intelligence. They read people exceptionally well and adapt their communication style effortlessly to different audiences. This makes them powerful networkers and natural influencers. Their charm is subtle rather than flashy — it grows on people over time.\n\nAt their best, Rats are resourceful, kind, and genuinely curious about the world. They are the friend who always knows where to find what you need and who to call. At their most challenged, they can become overly cautious, hoard resources out of anxiety, or manipulate situations to maintain control.',
    strengths_detail: 'Rats excel at problem-solving under pressure. Their quick minds cut through complexity to find practical solutions. They are exceptional at managing finances and have an intuitive sense for value. Rats are also gifted storytellers — their social intelligence allows them to craft narratives that resonate deeply with their audience.',
    challenges_detail: 'Rats can struggle with anxiety and a tendency to overthink. Their resourcefulness can tip into cunning when they feel threatened, and their desire for security can make them resistant to change even when change is clearly needed. Learning to trust others and release control is the core growth edge for this sign.',
    in_love: 'Rats are devoted partners who express love through acts of service and practical care. They remember every detail about the people they love and go to extraordinary lengths to make them comfortable. Best matched with Dragon and Monkey — both signs who can match Rat\'s energy and ambition without feeling threatened by it.',
    in_career: 'Rats thrive in careers that reward quick thinking and adaptability: finance, entrepreneurship, journalism, politics, and technology. They are excellent at launching new projects but need to consciously develop the discipline to see long-term commitments through.',
    in_health: 'Rats tend to carry stress in their nervous system and digestive tract. Regular sleep, reduced caffeine, and mindfulness practices are particularly beneficial. Their active minds need physical exercise as an outlet.',
    cultural_significance: 'In Chinese mythology, the Rat won the Great Race — the competition that determined the order of the zodiac — through cleverness rather than speed. It hitched a ride on the Ox\'s back and jumped off at the finish line to claim first place. This origin story perfectly encapsulates the Rat\'s character: not the strongest or fastest, but always the smartest in the room. In Chinese culture, Rats represent wealth, prosperity, and surplus — a rat in the granary was once seen as a sign of abundance.',
    lucky_colors: ['Blue','Gold','Green'],
    lucky_numbers: [2,3],
    lucky_directions: ['West','Northwest','Southwest'],
    unlucky: ['Yellow','Brown — colors','5,9 — numbers'],
    compatibility_best: ['Dragon','Monkey','Ox'],
    compatibility_worst: ['Horse','Rooster'],
    famous_people: [
      {name:'Wolfgang Amadeus Mozart',born:1756},{name:'William Shakespeare',born:1564},
      {name:'George Washington',born:1732},{name:'Scarlett Johansson',born:1984},{name:'Eminem',born:1972},
    ],
    outlook_2026: '2026 is a Horse year, which creates natural tension for the Rat — Horse and Rat are opposing signs. This calls for extra patience in partnerships and avoiding impulsive financial decisions. Focus on consolidating existing strengths rather than launching major new ventures. Relationships will require more nurturing than usual.',
  },
  Ox: {
    years: [1925,1937,1949,1961,1973,1985,1997,2009,2021,2033],
    personality_deep: 'The Ox is the second sign and one of the most dependable in the entire Chinese Zodiac. Ox people are the builders of the world — patient, methodical, and possessed of extraordinary endurance. Where others give up, the Ox continues steadily forward.\n\nWhat makes the Ox remarkable is their combination of physical and mental stamina. They do not look for shortcuts. They believe in doing things properly the first time, and this commitment to quality means their work stands the test of time. An Ox\'s reputation is everything to them.\n\nOx individuals are often misread as slow because they take time to make decisions. In reality, they are thorough — considering every angle before committing. Once committed, nothing moves them.',
    strengths_detail: 'Extraordinary reliability, patience that outlasts any challenge, practical intelligence, and a natural authority that comes from consistent follow-through. Ox people are excellent managers and leaders because they lead by example rather than by directive.',
    challenges_detail: 'Stubbornness is the Ox\'s greatest challenge. They can hold positions long after new information suggests a change is needed. They can also struggle to express emotions, appearing cold when they are actually deeply caring. Developing flexibility and emotional vocabulary is key growth work.',
    in_love: 'Ox people are slow to fall in love but completely devoted once they do. They show love through stability, reliability, and consistent care rather than grand gestures. Best matched with Rat, Snake, and Rooster.',
    in_career: 'Agriculture, medicine, engineering, banking, and management all suit the Ox\'s methodical nature. They excel in roles requiring precision and long-term commitment. Not suited to fast-paced, constantly changing environments.',
    in_health: 'Ox people tend to ignore health issues until they become serious. Regular preventive care, physical activity to prevent rigidity, and stress management are essential. They carry tension in their neck and shoulders.',
    cultural_significance: 'The Ox came second in the Great Race — crossing the finishing line faithfully after carrying the Rat on its back. This story of dignified service and reliable strength is central to the Ox\'s cultural identity. In agrarian China, the Ox was the most valuable animal — essential for plowing fields and sustaining life. To be called an Ox was the highest compliment a farmer could receive.',
    lucky_colors: ['Blue','Red','Purple'],
    lucky_numbers: [1,4],
    lucky_directions: ['North','South'],
    unlucky: ['White','Green — colors','5,6 — numbers'],
    compatibility_best: ['Rat','Snake','Rooster'],
    compatibility_worst: ['Goat','Horse','Dog'],
    famous_people: [
      {name:'Barack Obama',born:1961},{name:'Napoleon Bonaparte',born:1769},
      {name:'Princess Diana',born:1961},{name:'George Clooney',born:1961},{name:'Meryl Streep',born:1949},
    ],
    outlook_2026: '2026 is generally favorable for the Ox. Horse years reward the Ox\'s characteristic endurance. Career advancement is possible for those who have been quietly building their skills. Health deserves attention — prioritize rest and avoid overcommitting.',
  },
  Tiger: {
    years: [1926,1938,1950,1962,1974,1986,1998,2010,2022,2034],
    personality_deep: 'The Tiger is the great adventurer of the Chinese Zodiac — bold, magnetic, and utterly impossible to ignore. Tiger people walk into a room and change its energy. They are natural leaders not because they seek authority but because their confidence and passion naturally draw others to follow them.\n\nTigers live with extraordinary intensity. They feel everything deeply — their enthusiasm is infectious, their anger is formidable, and their love is fierce and protective. They have a warrior\'s spirit: they will fight passionately for those they care about and for causes they believe in.\n\nThe Tiger\'s greatest challenge is their own restlessness. They are easily bored by routine and may abandon projects once the initial excitement fades. Learning to sustain effort through the less glamorous middle phases of any endeavor is crucial growth work.',
    strengths_detail: 'Natural leadership, extraordinary courage, the ability to inspire others, decisive action under pressure, and a genuine warmth that makes people feel seen and valued. Tigers have a magnetic charisma that is difficult to quantify but impossible to deny.',
    challenges_detail: 'Impulsiveness, difficulty with authority, a tendency to take on more than can be sustained, and a pride that makes apology difficult. Tigers can also be overly optimistic, underestimating obstacles and overestimating their own resources.',
    in_love: 'Tigers love passionately and protectively. They need partners who can match their intensity without being overwhelmed by it. Best matched with Horse and Dog — signs that appreciate Tiger\'s energy and give them the freedom they need.',
    in_career: 'Military, politics, entrepreneurship, acting, and any role requiring courage and public presence suit the Tiger. They are exceptional in crisis situations where decisive action is needed.',
    in_health: 'Tigers need physical outlets for their intense energy — without regular exercise, their restlessness becomes anxiety. They should avoid stimulants and prioritize consistent sleep despite their preference for late nights.',
    cultural_significance: 'The Tiger is the King of all animals in Chinese culture — not the Dragon, as many Westerners assume. The Tiger is considered the protector against evil spirits, fire, and theft. In traditional Chinese homes, Tiger images were displayed to ward off bad fortune. The White Tiger is one of the four sacred beasts of Chinese cosmology, guarding the West.',
    lucky_colors: ['Blue','Grey','Orange'],
    lucky_numbers: [1,3,4],
    lucky_directions: ['East','North','South'],
    unlucky: ['Gold','Silver — colors','6,7,8 — numbers'],
    compatibility_best: ['Horse','Dog','Pig'],
    compatibility_worst: ['Ox','Snake','Monkey'],
    famous_people: [
      {name:'Leonardo DiCaprio',born:1974},{name:'Marilyn Monroe',born:1926},
      {name:'Queen Elizabeth II',born:1926},{name:'Tom Cruise',born:1962},{name:'Lady Gaga',born:1986},
    ],
    outlook_2026: 'Horse years energize the Tiger. 2026 brings opportunities for bold moves that have been building for some time. Career and creative projects launched this year have strong momentum. Relationships need attention — the Tiger\'s intensity can feel overwhelming to partners in high-energy years. Channel passion productively.',
  },
  Rabbit: {
    years: [1927,1939,1951,1963,1975,1987,1999,2011,2023,2035],
    personality_deep: 'The Rabbit is the diplomat of the Chinese Zodiac — graceful, perceptive, and possessed of an exquisite sensitivity to the emotional environment around them. Rabbit people have a rare gift: they make everyone they meet feel genuinely comfortable and valued.\n\nBeneath the Rabbit\'s gentle exterior lies considerable strength. They are not pushovers — they simply prefer to achieve their goals through intelligence, patience, and carefully cultivated relationships rather than direct confrontation. They are exceptional strategic thinkers who rarely show their hand prematurely.\n\nThe Rabbit\'s connection to beauty and aesthetics is profound. They instinctively create beautiful environments and have impeccable taste.',
    strengths_detail: 'Exceptional interpersonal intelligence, a gift for creating harmony in tense situations, refined aesthetic sense, patience, and a strategic mind that works quietly in the background. Rabbits are often the person behind the scenes who makes everything work smoothly.',
    challenges_detail: 'Rabbits can be conflict-avoidant to the point of self-betrayal — suppressing their own needs to maintain peace. They can also be indecisive, overthinking decisions until the moment has passed. Their sensitivity, while a gift, can become a vulnerability if they absorb too much of others\' emotional energy.',
    in_love: 'Rabbits are tender, attentive partners who create genuinely beautiful relationship experiences. They need partners who appreciate subtlety and do not mistake gentleness for weakness. Best matched with Goat, Dog, and Pig.',
    in_career: 'Law, diplomacy, counseling, design, fashion, literature, and public relations all suit the Rabbit\'s gifts. They excel in any role requiring tact, aesthetic judgment, or the ability to navigate complex social dynamics.',
    in_health: 'Rabbits are prone to stress-related conditions when their need for harmony is chronically unmet. They benefit enormously from regular quiet time, nature, and beauty. Overstimulating environments drain them quickly.',
    cultural_significance: 'The Rabbit represents longevity, peace, and prosperity in Chinese culture. The Moon Rabbit — a jade rabbit who lives on the Moon and pounds the elixir of immortality — is one of the most beloved figures in Chinese mythology. During the Mid-Autumn Festival, children are told the story of Chang\'e and her companion, the Moon Rabbit.',
    lucky_colors: ['Red','Pink','Purple','Blue'],
    lucky_numbers: [3,4,6],
    lucky_directions: ['East','Southeast','South'],
    unlucky: ['Dark Brown','Dark Yellow — colors','1,7,8 — numbers'],
    compatibility_best: ['Goat','Dog','Pig'],
    compatibility_worst: ['Rat','Rooster','Dragon'],
    famous_people: [
      {name:'Albert Einstein',born:1879},{name:'Angelina Jolie',born:1975},
      {name:'Brad Pitt',born:1963},{name:'Frank Sinatra',born:1915},{name:'Confucius',born:-551},
    ],
    outlook_2026: 'Horse years require the Rabbit to step slightly outside their comfort zone. The energy of 2026 favors bold action — Rabbits who trust their instincts and act decisively will be rewarded. Relationships flourish with open, honest communication.',
  },
  Dragon: {
    years: [1928,1940,1952,1964,1976,1988,2000,2012,2024,2036],
    personality_deep: 'The Dragon is the only mythical creature in the Chinese Zodiac — and this distinction tells you everything. Dragon people carry an energy that seems larger than life. They are the most vital, visionary, and powerful sign in the entire cycle.\n\nUnlike the Western dragon (associated with destruction and greed), the Chinese Dragon is the supreme symbol of good fortune, imperial power, and divine blessing. Dragon people are genuinely extraordinary — gifted with talents that often border on the supernatural in the eyes of those around them.\n\nDragons are not merely confident — they are magnetizing. They have a presence that makes rooms quiet when they enter and conversations spring to life when they speak. Their enthusiasm for life is genuinely infectious and their vision for what is possible consistently exceeds what others believe achievable.',
    strengths_detail: 'Visionary thinking, extraordinary natural charisma, genuine courage, creative brilliance, and an energy that inspires those around them to reach beyond their own perceived limitations. Dragons are the people who change industries and redefine what is possible.',
    challenges_detail: 'Dragons can struggle with perfectionism and an unwillingness to accept help — their self-sufficiency becomes isolation. Their high standards can make them harsh critics of both themselves and others. Learning humility and the value of collaboration is the Dragon\'s core growth journey.',
    in_love: 'Dragons love with extraordinary passion and generosity. They need partners who can appreciate their magnitude without being intimidated by it. Best matched with Rat, Monkey, and Rooster.',
    in_career: 'Dragons excel as entrepreneurs, artists, politicians, military leaders, and in any role that allows them to pioneer new territory. They are not suited to following others\' rules and thrive when given full creative and strategic authority.',
    in_health: 'Dragons burn bright and can burn out. Managing energy levels is crucial — they tend to go at full intensity until they collapse. Building in genuine rest and physical exercise that matches their energy level is essential.',
    cultural_significance: 'The Dragon is the supreme symbol of imperial China. The Emperor was called the Son of the Dragon and sat on the Dragon Throne. Five-clawed dragons were reserved exclusively for imperial use — commoners who displayed five-clawed dragons could be executed. The Dragon represents yang energy at its most concentrated: heaven, thunder, lightning, and the sea. In China, Dragon years consistently see the highest birth rates as parents compete to have Dragon children.',
    lucky_colors: ['Gold','Silver','Hoary'],
    lucky_numbers: [1,6,7],
    lucky_directions: ['East','North','Northwest'],
    unlucky: ['Blue','Green — colors','3,8 — numbers'],
    compatibility_best: ['Rat','Tiger','Monkey','Rooster'],
    compatibility_worst: ['Ox','Goat','Dog'],
    famous_people: [
      {name:'Bruce Lee',born:1940},{name:'Rihanna',born:1988},
      {name:'Adele',born:1988},{name:'Martin Luther King Jr.',born:1929},{name:'Deng Xiaoping',born:1904},
    ],
    outlook_2026: '2026 is a mixed year for the Dragon following the powerful 2024 Dragon year. Focus on consolidating gains made in 2024–2025. Major launches are better suited to 2027. Personal relationships and health deserve priority attention this year.',
  },
  Snake: {
    years: [1929,1941,1953,1965,1977,1989,2001,2013,2025,2037],
    personality_deep: 'The Snake is the philosopher of the Chinese Zodiac — the deepest thinker, the most mysterious, and arguably the most complex sign in the entire cycle. Snakes operate at a frequency that most people around them cannot fully perceive.\n\nSnake people possess extraordinary intuition that functions almost like a sixth sense. They know things without being able to explain how they know them. They read people with a precision that can feel unsettling to those being read. This gift, combined with their natural reserve, gives them tremendous power in any negotiation or social situation.\n\nThe Snake\'s relationship with wisdom is deep. They are drawn to philosophy, spiritual practice, and the fundamental questions of existence. Many of history\'s great spiritual teachers have been Snakes.',
    strengths_detail: 'Profound intuition, elegant problem-solving, the ability to remain calm in crisis, deep wisdom, and a magnetic personal style that draws people irresistibly. Snakes are masters of the long game.',
    challenges_detail: 'Snakes can be possessive in relationships, slow to forgive, and prone to jealousy when they feel their territory is threatened. Their secretive nature can create distance with those who love them. Learning to trust and to release is the Snake\'s essential growth work.',
    in_love: 'Snakes are intensely devoted partners who expect total loyalty in return. They love with depth and permanence — a Snake who truly loves you will do so for life. Best matched with Dragon and Rooster.',
    in_career: 'Philosophy, spiritual teaching, psychology, finance, fashion, and the arts all suit the Snake\'s combination of depth and aesthetic intelligence. They are exceptional in roles requiring strategic patience.',
    in_health: 'Snakes need physical warmth and regular movement to maintain their energy. They are prone to tension headaches and should prioritize stress reduction. Yoga and meditation are particularly beneficial.',
    cultural_significance: 'Unlike the Western serpent (associated with evil since the Garden of Eden), the Chinese Snake is a symbol of wisdom, longevity, and good fortune. The Snake is considered a "Little Dragon" — sharing many of the Dragon\'s qualities in a more subtle, interior form. In ancient Chinese medicine, the Snake represents the healing principle itself.',
    lucky_colors: ['Red','Light Yellow','Black'],
    lucky_numbers: [2,8,9],
    lucky_directions: ['Northeast','Southwest','South'],
    unlucky: ['White','Gold — colors','1,6,7 — numbers'],
    compatibility_best: ['Dragon','Rooster','Ox'],
    compatibility_worst: ['Tiger','Pig'],
    famous_people: [
      {name:'Mahatma Gandhi',born:1869},{name:'Abraham Lincoln',born:1809},
      {name:'Taylor Swift',born:1989},{name:'Bob Dylan',born:1941},{name:'Audrey Hepburn',born:1929},
    ],
    outlook_2026: 'Following the Snake\'s own year in 2025, 2026 brings a natural consolidation period. The wisdom gained in 2025 now needs to be applied practically. Financial decisions made this year have long-lasting consequences — proceed thoughtfully.',
  },
  Horse: {
    years: [1930,1942,1954,1966,1978,1990,2002,2014,2026,2038],
    personality_deep: 'The Horse is the free spirit of the Chinese Zodiac — energetic, independent, and possessed of an irresistible joie de vivre. Horse people are the life of any gathering: warm, funny, and genuinely interested in the people around them.\n\nWhat makes Horses remarkable is their combination of social brilliance and deep need for personal freedom. They are among the most sociable of all zodiac signs yet require more independence than almost any other. This paradox is the central tension of the Horse personality.\n\nHorses have a natural performing energy — they come alive in front of audiences and have an innate sense of timing that makes them magnetic communicators and entertainers.',
    strengths_detail: 'Infectious enthusiasm, quick wit, natural performing ability, adaptability, and a genuine warmth that creates instant connection. Horses have remarkable physical energy and mental agility.',
    challenges_detail: 'Impatience, difficulty with commitment, a tendency to bolt when feeling confined, and a short attention span that can leave important things unfinished. Learning to stay present through difficulty is the Horse\'s essential work.',
    in_love: 'Horses fall in love quickly and intensely but need partners who give them breathing room. Possessiveness is the fastest way to lose a Horse. Best matched with Tiger, Dog, and Goat.',
    in_career: 'Politics, entertainment, sales, journalism, travel, and any role with variety and public interaction suit the Horse. They are exceptional at starting things but need support systems for follow-through.',
    in_health: 'Horses have strong physical constitutions but must manage their tendency to burn the candle at both ends. Regular sleep and physical exercise are essential — Horses who stop moving become anxious.',
    cultural_significance: 'The Horse has been central to Chinese civilization for millennia — as the vehicle of war, trade, and exploration. The famous Terracotta Army of Qin Shi Huang included thousands of horses. The Eight Horses of King Mu of Zhou are legendary in Chinese mythology, representing freedom, speed, and the ability to cross impossible distances.',
    lucky_colors: ['Topaz','Brown','Yellow'],
    lucky_numbers: [2,3,7],
    lucky_directions: ['East','West','South'],
    unlucky: ['White','Blue','Gold — colors','1,5,6 — numbers'],
    compatibility_best: ['Tiger','Dog','Goat'],
    compatibility_worst: ['Rat','Ox','Horse'],
    famous_people: [
      {name:'Oprah Winfrey',born:1954},{name:'Isaac Newton',born:1643},
      {name:'Kobe Bryant',born:1978},{name:'Emma Watson',born:1990},{name:'Genghis Khan',born:1162},
    ],
    outlook_2026: '2026 is the Horse\'s own year — the most significant year in the 12-year cycle. This is the year to launch, to commit, to take the bold step that has been building for years. Traditional Chinese astrology notes that one\'s own year can also bring turbulence — the key is to stay grounded while embracing the opportunities that arise.',
  },
  Goat: {
    years: [1931,1943,1955,1967,1979,1991,2003,2015,2027,2039],
    personality_deep: 'The Goat is the artist of the Chinese Zodiac — the most creative, empathetic, and spiritually inclined of all twelve signs. Goat people experience life more intensely than others and transform that intensity into art, music, writing, or any creative medium that can hold it.\n\nGoats have a profound capacity for compassion. They feel others\' pain as their own and are drawn instinctively toward healing and nurturing roles. This makes them extraordinary caregivers, therapists, and creative collaborators.\n\nThe Goat\'s gentleness is sometimes misread as weakness. In reality, Goats have considerable inner strength — the strength of the artist who persists through rejection, the strength of the empath who holds space for others\' pain without breaking.',
    strengths_detail: 'Extraordinary creative talent, deep empathy, spiritual sensitivity, the ability to create beauty in any medium, and a gentleness that creates safe space for others.',
    challenges_detail: 'Goats can struggle with self-doubt, financial management, and a tendency to become dependent on stronger personalities. Their sensitivity, while a profound gift, can tip into anxiety or depression when unsupported.',
    in_love: 'Goats are tender, romantic partners who create genuinely beautiful relationship experiences. They need partners who provide stability and appreciate their creative nature. Best matched with Rabbit, Horse, and Pig.',
    in_career: 'Art, music, design, therapy, nursing, childcare, and the healing arts all suit the Goat. They thrive when their creativity is valued and they have the support of a stable structure.',
    in_health: 'Goats are prone to anxiety and stress-related digestive issues. Regular creative expression is literally therapeutic for them. Beautiful, harmonious environments significantly improve their wellbeing.',
    cultural_significance: 'The Goat (also written as Sheep or Ram in some traditions) is one of the most auspicious signs in Chinese culture, associated with filial piety, peace, and harmonious family life. The character for "beautiful" (美 měi) in Chinese is composed of the characters for "big" and "sheep" — reflecting the deep cultural association between the Goat/Sheep and all that is beautiful and good.',
    lucky_colors: ['Brown','Red','Purple'],
    lucky_numbers: [2,7],
    lucky_directions: ['North','Northwest'],
    unlucky: ['Blue','Black','Dark Red — colors','4,9 — numbers'],
    compatibility_best: ['Rabbit','Horse','Pig'],
    compatibility_worst: ['Ox','Dog','Rat'],
    famous_people: [
      {name:'Steve Jobs',born:1955},{name:'Bill Gates',born:1955},
      {name:'Michelangelo',born:1475},{name:'Julia Roberts',born:1967},{name:'Bruce Willis',born:1955},
    ],
    outlook_2026: 'Horse years are generally favorable for the Goat — the Horse and Goat share a natural compatibility. Creative projects find their audience, relationships deepen, and financial situations improve for those who focus on their core strengths.',
  },
  Monkey: {
    years: [1932,1944,1956,1968,1980,1992,2004,2016,2028,2040],
    personality_deep: 'The Monkey is the brilliant improviser of the Chinese Zodiac — curious, inventive, and possessed of a quicksilver intelligence that can solve in seconds what takes others hours. Monkey people are the Swiss Army knives of the zodiac: adaptable, multi-talented, and effective in almost any situation.\n\nWhat makes Monkeys extraordinary is their combination of intellectual brilliance and social playfulness. They are serious thinkers who never take themselves too seriously — a rare and winning combination. Their humor is sophisticated and their timing is impeccable.\n\nMonkeys learn faster than almost any other sign. They pick up new skills, languages, and concepts with remarkable speed and find genuine joy in the process of learning.',
    strengths_detail: 'Exceptional intelligence, creative problem-solving, adaptability, natural humor, multi-talented versatility, and the ability to find innovative solutions to any challenge.',
    challenges_detail: 'Monkeys can be opportunistic, inconsistent, and prone to abandoning commitments when something more interesting appears. Their cleverness can tip into manipulation when they feel cornered. Building genuine trust requires them to develop follow-through.',
    in_love: 'Monkeys need partners who can engage their intellect and keep them genuinely interested. Boredom is the Monkey\'s greatest relationship threat. Best matched with Rat and Dragon.',
    in_career: 'Science, technology, finance, entrepreneurship, comedy, writing, and any role requiring creative intelligence suit the Monkey perfectly. They are exceptional at identifying and exploiting opportunities others miss.',
    in_health: 'Monkeys have strong constitutions but are prone to stress and nervous exhaustion from their constantly active minds. Regular physical exercise and periods of genuine mental rest are essential.',
    cultural_significance: 'The Monkey holds a special place in Chinese culture through the beloved figure of Sun Wukong — the Monkey King — hero of the classic novel Journey to the West. Sun Wukong embodies all the Monkey\'s qualities taken to mythological extremes: supernatural intelligence, shape-shifting adaptability, irrepressible energy, and a mischievous spirit that ultimately serves a higher purpose.',
    lucky_colors: ['White','Gold','Blue'],
    lucky_numbers: [4,9],
    lucky_directions: ['North','Northwest'],
    unlucky: ['Red','Pink','Black — colors','2,7 — numbers'],
    compatibility_best: ['Rat','Dragon','Snake'],
    compatibility_worst: ['Tiger','Pig'],
    famous_people: [
      {name:'Will Smith',born:1968},{name:'Tom Hanks',born:1956},
      {name:'Daniel Craig',born:1968},{name:'Celine Dion',born:1968},{name:'Ryan Reynolds',born:1976},
    ],
    outlook_2026: 'Horse years bring exciting opportunities for the Monkey — particularly in career and financial areas. The key is to focus rather than scatter energy across too many pursuits. Choose one major initiative and commit fully.',
  },
  Rooster: {
    years: [1933,1945,1957,1969,1981,1993,2005,2017,2029,2041],
    personality_deep: 'The Rooster is the perfectionist of the Chinese Zodiac — meticulous, observant, and possessed of extraordinarily high standards for themselves and everything they do. Rooster people are the ones who notice what everyone else misses and fix what everyone else ignores.\n\nRoosters are among the most hardworking signs in the zodiac. They take genuine pride in doing things properly and find something deeply satisfying in mastering a skill to the point of perfection.\n\nThe Rooster\'s confidence can appear as vanity to those who don\'t know them well. In reality, it comes from a deep commitment to presenting their best self to the world — a form of respect for others as much as for themselves.',
    strengths_detail: 'Extraordinary attention to detail, reliability, courage (the Rooster is among the bravest signs), organizational brilliance, and a loyalty to those they love that is absolute.',
    challenges_detail: 'Roosters can be critical — of themselves above all, but also of others. Their perfectionism can tip into inflexibility and their directness into tactlessness. Learning to accept imperfection — in themselves and others — is crucial growth.',
    in_love: 'Roosters are devoted, attentive partners who express love through acts of service and maintaining beautiful, well-organized shared spaces. Best matched with Ox, Snake, and Dragon.',
    in_career: 'Medicine, law, accounting, military, restaurant management, fashion, and any role requiring precision and high standards suit the Rooster. They are exceptional at systems, processes, and quality control.',
    in_health: 'Roosters tend toward perfectionism-driven stress. They need to consciously schedule downtime and resist the urge to optimize every moment. Meditation and time in nature are particularly beneficial.',
    cultural_significance: 'The Rooster is the timekeeper of the farmyard — its crow announcing the dawn and marking the rhythm of agricultural life. In Chinese culture, the Rooster\'s crow drives away evil spirits and announces the return of light. Red rooster images were traditionally placed on doors to ward off fire.',
    lucky_colors: ['Gold','Brown','Yellow'],
    lucky_numbers: [5,7,8],
    lucky_directions: ['West','Southwest','Northeast'],
    unlucky: ['Red','Green — colors','1,3,9 — numbers'],
    compatibility_best: ['Ox','Dragon','Snake'],
    compatibility_worst: ['Rat','Rabbit','Dog'],
    famous_people: [
      {name:'Beyoncé',born:1981},{name:'Justin Timberlake',born:1981},
      {name:'Dolly Parton',born:1946},{name:'Britney Spears',born:1981},{name:'Serena Williams',born:1981},
    ],
    outlook_2026: 'Horse years bring mixed energy for the Rooster. Professional recognition is possible for those who have been building their expertise. Avoid being overly critical in relationships — the high energy of a Horse year requires flexibility.',
  },
  Dog: {
    years: [1934,1946,1958,1970,1982,1994,2006,2018,2030,2042],
    personality_deep: 'The Dog is the most loyal sign in the entire Chinese Zodiac — faithful, honest, and possessed of a profound sense of justice that makes them natural defenders of the vulnerable.\n\nDog people are the friends who show up at 3am without question. The colleagues who notice when you\'re struggling before you\'ve said a word. The partners who stand by their commitments through whatever the world throws at them. Their reliability is not a performance — it is simply who they are.\n\nWhat makes Dogs extraordinary is their combination of emotional intelligence and unwavering integrity. They are intensely empathetic yet principled — they care deeply about people while maintaining clear ethical boundaries.',
    strengths_detail: 'Absolute loyalty, deep integrity, exceptional empathy, a natural ability to create trust, and a moral courage that speaks truth even when it is uncomfortable.',
    challenges_detail: 'Dogs can be prone to anxiety and pessimism when their sense of security is threatened. Their loyalty can tip into stubbornness and their protectiveness into territorial behavior. Learning to trust that things will work out is key growth.',
    in_love: 'Dogs are the most devoted partners in the zodiac. Once committed, they are in for life. They need partners who appreciate their loyalty without taking it for granted. Best matched with Tiger, Rabbit, and Horse.',
    in_career: 'Social work, medicine, law, teaching, military service, and nonprofit leadership all suit the Dog\'s combination of empathy and integrity. They thrive when their work has clear moral purpose.',
    in_health: 'Dogs carry anxiety in their bodies and are prone to stress-related conditions. Regular exercise, particularly with others (team sports, group fitness), is particularly beneficial. They need close friendships for their emotional health.',
    cultural_significance: 'The Dog is considered one of the most auspicious signs in Chinese culture, associated with loyalty, honesty, and good fortune. In ancient China, dogs were among the first animals domesticated and were considered protectors of the home. Dog statues were placed at entrances to guard against evil.',
    lucky_colors: ['Red','Green','Purple'],
    lucky_numbers: [3,4,9],
    lucky_directions: ['East','South','Northeast'],
    unlucky: ['Blue','Gold','White — colors','1,6,7 — numbers'],
    compatibility_best: ['Tiger','Rabbit','Horse'],
    compatibility_worst: ['Ox','Dragon','Goat'],
    famous_people: [
      {name:'Madonna',born:1958},{name:'Michael Jackson',born:1958},
      {name:'Mother Teresa',born:1910},{name:'Winston Churchill',born:1874},{name:'Bill Clinton',born:1946},
    ],
    outlook_2026: 'Horse years are generally positive for the Dog — Horse and Dog share a natural compatibility. Career advancement is possible through consistent effort. Friendships and family relationships are highlighted — invest in these connections.',
  },
  Pig: {
    years: [1935,1947,1959,1971,1983,1995,2007,2019,2031,2043],
    personality_deep: 'The Pig is the most generous sign in the Chinese Zodiac — warm-hearted, giving, and possessed of an infectious optimism that makes the world a genuinely better place.\n\nPig people experience life with a fullness that others envy. They enjoy good food, good company, and good conversation with a wholeheartedness that is both charming and inspiring. They have a remarkable capacity for pleasure — not hedonism, but genuine, grateful appreciation for life\'s good things.\n\nWhat makes Pigs remarkable is their combination of generosity and diligence. They work hard — very hard — but always in service of something larger than themselves. They are not driven by ambition alone but by a genuine desire to create good in the world.',
    strengths_detail: 'Extraordinary generosity, a capacity for genuine joy, diligence, compassion, and an honesty that makes them completely trustworthy.',
    challenges_detail: 'Pigs can be naive — their trust in others\' goodness makes them vulnerable to those who would exploit it. Their love of comfort can tip into indulgence and their generosity into a failure to set healthy boundaries.',
    in_love: 'Pigs are devoted, generous partners who create warm, comfortable relationship environments. They love deeply and need partners who appreciate their giving nature without taking advantage of it. Best matched with Rabbit, Goat, and Tiger.',
    in_career: 'Entertainment, hospitality, medicine, social work, and any role that allows them to combine hard work with genuine service to others. They are exceptional team players and natural collaborators.',
    in_health: 'Pigs tend toward indulgence in food and comfort, which can create weight and digestive issues over time. Regular exercise and mindful eating habits are important. They have strong immune systems when they maintain healthy routines.',
    cultural_significance: 'In Chinese culture, the Pig is associated with wealth, good fortune, and abundance. The piggy bank — still used globally — originated in China, where pig-shaped money containers were considered lucky. Pigs represent the completion of the 12-year cycle and carry the wisdom of all that came before.',
    lucky_colors: ['Yellow','Grey','Brown'],
    lucky_numbers: [2,5,8],
    lucky_directions: ['Southeast','Northeast'],
    unlucky: ['Red','Blue','Green — colors','1,3,9 — numbers'],
    compatibility_best: ['Tiger','Rabbit','Goat'],
    compatibility_worst: ['Snake','Monkey'],
    famous_people: [
      {name:'Elton John',born:1947},{name:'Ernest Hemingway',born:1899},
      {name:'Woody Allen',born:1935},{name:'Arnold Schwarzenegger',born:1947},{name:'Hillary Clinton',born:1947},
    ],
    outlook_2026: 'Horse years bring busy, productive energy for the Pig. New opportunities appear in career and finance — the key is to evaluate them carefully rather than saying yes to everything. Health deserves particular attention this year.',
  },
};

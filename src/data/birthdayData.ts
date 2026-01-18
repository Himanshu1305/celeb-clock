import { WikiPerson, WikiEvent } from '@/services/WikimediaService';
import { 
  Star, 
  Clapperboard, 
  Music, 
  Palette, 
  Wifi, 
  Beaker, 
  Briefcase, 
  Trophy, 
  Users 
} from 'lucide-react';

interface BirthdayData {
  people: WikiPerson[];
  events: WikiEvent[];
}

// Comprehensive birthday database organized by month-day
export const birthdayDatabase: Record<string, BirthdayData> = {
  '01-01': {
    people: [
      { name: 'J. Edgar Hoover', birthDate: '1895-01-01', profession: 'FBI Director', category: 'other', wikipediaUrl: 'https://en.wikipedia.org/wiki/J._Edgar_Hoover' },
      { name: 'Betsy Ross', birthDate: '1752-01-01', profession: 'Seamstress', category: 'other', wikipediaUrl: 'https://en.wikipedia.org/wiki/Betsy_Ross' },
    ],
    events: [
      { title: 'Euro Currency Introduced', date: '1999-01-01', year: 1999, description: 'The euro was introduced as an accounting currency', category: 'Economic', wikipediaUrl: 'https://en.wikipedia.org/wiki/Euro' },
    ]
  },
  '01-02': {
    people: [
      { name: 'Isaac Asimov', birthDate: '1920-01-02', profession: 'Author & Biochemist', category: 'scientist', wikipediaUrl: 'https://en.wikipedia.org/wiki/Isaac_Asimov' },
      { name: 'Cuba Gooding Jr.', birthDate: '1968-01-02', profession: 'Actor', category: 'celebrity', wikipediaUrl: 'https://en.wikipedia.org/wiki/Cuba_Gooding_Jr.' },
    ],
    events: []
  },
  '10-02': {
    people: [
      { name: 'Mahatma Gandhi', birthDate: '1869-10-02', profession: 'Independence Leader', category: 'other', description: 'Leader of Indian independence movement through nonviolent civil disobedience', wikipediaUrl: 'https://en.wikipedia.org/wiki/Mahatma_Gandhi' },
      { name: 'Lal Bahadur Shastri', birthDate: '1904-10-02', profession: 'Prime Minister of India', category: 'other', description: 'Second Prime Minister of India, known for his slogan "Jai Jawan Jai Kisan"', wikipediaUrl: 'https://en.wikipedia.org/wiki/Lal_Bahadur_Shastri' },
      { name: 'Groucho Marx', birthDate: '1890-10-02', profession: 'Comedian & Actor', category: 'celebrity', description: 'American comedian and film star', wikipediaUrl: 'https://en.wikipedia.org/wiki/Groucho_Marx' },
      { name: 'Sting', birthDate: '1951-10-02', profession: 'Musician', category: 'celebrity', description: 'British musician, singer, and songwriter', wikipediaUrl: 'https://en.wikipedia.org/wiki/Sting_(musician)' },
    ],
    events: [
      { title: 'First Peanuts Comic Strip Published', date: '1950-10-02', year: 1950, description: 'Charles M. Schulz\'s Peanuts comic strip appeared in newspapers', category: 'Cultural', wikipediaUrl: 'https://en.wikipedia.org/wiki/Peanuts' },
    ]
  },
  '02-14': {
    people: [
      { name: 'Alexander Graham Bell', birthDate: '1847-02-14', profession: 'Inventor', category: 'scientist', description: 'Inventor of the telephone', wikipediaUrl: 'https://en.wikipedia.org/wiki/Alexander_Graham_Bell' },
      { name: 'Michael Bloomberg', birthDate: '1942-02-14', profession: 'Entrepreneur & Politician', category: 'entrepreneur', description: 'Founder of Bloomberg L.P. and former NYC Mayor', wikipediaUrl: 'https://en.wikipedia.org/wiki/Michael_Bloomberg' },
    ],
    events: [
      { title: 'YouTube Founded', date: '2005-02-14', year: 2005, description: 'YouTube was founded by Steve Chen, Chad Hurley, and Jawed Karim', category: 'Technology', wikipediaUrl: 'https://en.wikipedia.org/wiki/YouTube' },
    ]
  },
  '04-15': {
    people: [
      { name: 'Leonardo da Vinci', birthDate: '1452-04-15', profession: 'Artist & Inventor', category: 'scientist', description: 'Renaissance polymath', wikipediaUrl: 'https://en.wikipedia.org/wiki/Leonardo_da_Vinci' },
      { name: 'Emma Watson', birthDate: '1990-04-15', profession: 'Actress', category: 'celebrity', description: 'British actress known for Harry Potter series', wikipediaUrl: 'https://en.wikipedia.org/wiki/Emma_Watson' },
    ],
    events: [
      { title: 'Titanic Sank', date: '1912-04-15', year: 1912, description: 'RMS Titanic sank after hitting an iceberg', category: 'Historical', wikipediaUrl: 'https://en.wikipedia.org/wiki/Sinking_of_the_RMS_Titanic' },
    ]
  },
  '07-04': {
    people: [
      { name: 'Nathaniel Hawthorne', birthDate: '1804-07-04', profession: 'Author', category: 'other', description: 'American novelist', wikipediaUrl: 'https://en.wikipedia.org/wiki/Nathaniel_Hawthorne' },
      { name: 'Calvin Coolidge', birthDate: '1872-07-04', profession: '30th US President', category: 'other', wikipediaUrl: 'https://en.wikipedia.org/wiki/Calvin_Coolidge' },
    ],
    events: [
      { title: 'US Declaration of Independence', date: '1776-07-04', year: 1776, description: 'United States declared independence from Great Britain', category: 'Historical', wikipediaUrl: 'https://en.wikipedia.org/wiki/United_States_Declaration_of_Independence' },
    ]
  },
  '12-25': {
    people: [
      { name: 'Isaac Newton', birthDate: '1642-12-25', profession: 'Physicist & Mathematician', category: 'scientist', description: 'Discovered laws of motion and gravity', wikipediaUrl: 'https://en.wikipedia.org/wiki/Isaac_Newton' },
      { name: 'Justin Trudeau', birthDate: '1971-12-25', profession: 'Prime Minister of Canada', category: 'other', wikipediaUrl: 'https://en.wikipedia.org/wiki/Justin_Trudeau' },
    ],
    events: [
      { title: 'Christmas Day', date: '0001-12-25', year: 1, description: 'Traditional celebration of the birth of Jesus Christ', category: 'Religious', wikipediaUrl: 'https://en.wikipedia.org/wiki/Christmas' },
    ]
  },
  '01-08': {
    people: [
      { name: 'Elvis Presley', birthDate: '1935-01-08', profession: 'Singer & Actor', category: 'celebrity', description: 'King of Rock and Roll', wikipediaUrl: 'https://en.wikipedia.org/wiki/Elvis_Presley' },
      { name: 'Stephen Hawking', birthDate: '1942-01-08', profession: 'Theoretical Physicist', category: 'scientist', description: 'Renowned cosmologist and author', wikipediaUrl: 'https://en.wikipedia.org/wiki/Stephen_Hawking' },
    ],
    events: []
  },
  '03-14': {
    people: [
      { name: 'Albert Einstein', birthDate: '1879-03-14', profession: 'Theoretical Physicist', category: 'scientist', description: 'Developer of theory of relativity', wikipediaUrl: 'https://en.wikipedia.org/wiki/Albert_Einstein' },
      { name: 'Billy Crystal', birthDate: '1948-03-14', profession: 'Actor & Comedian', category: 'celebrity', wikipediaUrl: 'https://en.wikipedia.org/wiki/Billy_Crystal' },
    ],
    events: [
      { title: 'Pi Day', date: '2000-03-14', year: 2000, description: 'Celebration of the mathematical constant π (3.14)', category: 'Cultural', wikipediaUrl: 'https://en.wikipedia.org/wiki/Pi_Day' },
    ]
  },
  '06-23': {
    people: [
      { name: 'Alan Turing', birthDate: '1912-06-23', profession: 'Computer Scientist & Mathematician', category: 'scientist', description: 'Father of computer science and artificial intelligence', wikipediaUrl: 'https://en.wikipedia.org/wiki/Alan_Turing' },
      { name: 'Zinedine Zidane', birthDate: '1972-06-23', profession: 'Football Player', category: 'athlete', description: 'French football legend', wikipediaUrl: 'https://en.wikipedia.org/wiki/Zinedine_Zidane' },
    ],
    events: []
  },
  '11-09': {
    people: [
      { name: 'Carl Sagan', birthDate: '1934-11-09', profession: 'Astronomer & Author', category: 'scientist', description: 'Renowned astronomer and science communicator', wikipediaUrl: 'https://en.wikipedia.org/wiki/Carl_Sagan' },
      { name: 'Hedy Lamarr', birthDate: '1914-11-09', profession: 'Actress & Inventor', category: 'celebrity', description: 'Hollywood actress and inventor of frequency hopping', wikipediaUrl: 'https://en.wikipedia.org/wiki/Hedy_Lamarr' },
    ],
    events: [
      { title: 'Fall of Berlin Wall', date: '1989-11-09', year: 1989, description: 'The Berlin Wall fell, marking the end of the Cold War', category: 'Historical', wikipediaUrl: 'https://en.wikipedia.org/wiki/Berlin_Wall' },
    ]
  },
  '05-04': {
    people: [
      { name: 'Audrey Hepburn', birthDate: '1929-05-04', profession: 'Actress', category: 'celebrity', description: 'Iconic actress and humanitarian', wikipediaUrl: 'https://en.wikipedia.org/wiki/Audrey_Hepburn' },
      { name: 'George Clooney', birthDate: '1961-05-06', profession: 'Actor', category: 'celebrity', wikipediaUrl: 'https://en.wikipedia.org/wiki/George_Clooney' },
    ],
    events: []
  },
  '08-29': {
    people: [
      { name: 'Michael Jackson', birthDate: '1958-08-29', profession: 'Singer & Entertainer', category: 'celebrity', description: 'King of Pop', wikipediaUrl: 'https://en.wikipedia.org/wiki/Michael_Jackson' },
      { name: 'Ingrid Bergman', birthDate: '1915-08-29', profession: 'Actress', category: 'celebrity', wikipediaUrl: 'https://en.wikipedia.org/wiki/Ingrid_Bergman' },
    ],
    events: []
  },
  '09-15': {
    people: [
      { name: 'Agatha Christie', birthDate: '1890-09-15', profession: 'Author', category: 'other', description: 'Mystery novelist', wikipediaUrl: 'https://en.wikipedia.org/wiki/Agatha_Christie' },
      { name: 'Tom Hardy', birthDate: '1977-09-15', profession: 'Actor', category: 'celebrity', wikipediaUrl: 'https://en.wikipedia.org/wiki/Tom_Hardy' },
    ],
    events: []
  },
  '10-05': {
    people: [
      { name: 'Steve Jobs', birthDate: '1955-02-24', profession: 'Entrepreneur', category: 'entrepreneur', description: 'Co-founder of Apple Inc.', wikipediaUrl: 'https://en.wikipedia.org/wiki/Steve_Jobs' },
      { name: 'Kate Winslet', birthDate: '1975-10-05', profession: 'Actress', category: 'celebrity', wikipediaUrl: 'https://en.wikipedia.org/wiki/Kate_Winslet' },
    ],
    events: []
  },
  '11-27': {
    people: [
      { name: 'Bruce Lee', birthDate: '1940-11-27', profession: 'Martial Artist & Actor', category: 'athlete', description: 'Legendary martial artist', wikipediaUrl: 'https://en.wikipedia.org/wiki/Bruce_Lee' },
      { name: 'Jimi Hendrix', birthDate: '1942-11-27', profession: 'Musician', category: 'celebrity', description: 'Legendary guitarist', wikipediaUrl: 'https://en.wikipedia.org/wiki/Jimi_Hendrix' },
    ],
    events: []
  },
  '12-16': {
    people: [
      { name: 'Jane Austen', birthDate: '1775-12-16', profession: 'Author', category: 'other', description: 'English novelist', wikipediaUrl: 'https://en.wikipedia.org/wiki/Jane_Austen' },
      { name: 'Ludwig van Beethoven', birthDate: '1770-12-16', profession: 'Composer', category: 'celebrity', description: 'Classical composer', wikipediaUrl: 'https://en.wikipedia.org/wiki/Ludwig_van_Beethoven' },
    ],
    events: []
  },
  '07-20': {
    people: [
      { name: 'Sir Edmund Hillary', birthDate: '1919-07-20', profession: 'Mountaineer', category: 'athlete', description: 'First to summit Mount Everest', wikipediaUrl: 'https://en.wikipedia.org/wiki/Edmund_Hillary' },
      { name: 'Gisele Bündchen', birthDate: '1980-07-20', profession: 'Model', category: 'celebrity', wikipediaUrl: 'https://en.wikipedia.org/wiki/Gisele_B%C3%BCndchen' },
    ],
    events: [
      { title: 'Apollo 11 Moon Landing', date: '1969-07-20', year: 1969, description: 'Neil Armstrong and Buzz Aldrin became the first humans to walk on the Moon', category: 'Historical', wikipediaUrl: 'https://en.wikipedia.org/wiki/Apollo_11' },
    ]
  },
  '04-23': {
    people: [
      { name: 'William Shakespeare', birthDate: '1564-04-23', profession: 'Playwright & Poet', category: 'other', description: 'English playwright and poet', wikipediaUrl: 'https://en.wikipedia.org/wiki/William_Shakespeare' },
      { name: 'Shirley Temple', birthDate: '1928-04-23', profession: 'Actress', category: 'celebrity', wikipediaUrl: 'https://en.wikipedia.org/wiki/Shirley_Temple' },
    ],
    events: []
  },
  '02-12': {
    people: [
      { name: 'Abraham Lincoln', birthDate: '1809-02-12', profession: '16th US President', category: 'other', description: 'President during Civil War', wikipediaUrl: 'https://en.wikipedia.org/wiki/Abraham_Lincoln' },
      { name: 'Charles Darwin', birthDate: '1809-02-12', profession: 'Naturalist', category: 'scientist', description: 'Developed theory of evolution', wikipediaUrl: 'https://en.wikipedia.org/wiki/Charles_Darwin' },
    ],
    events: []
  },
  '06-28': {
    people: [
      { name: 'Elon Musk', birthDate: '1971-06-28', profession: 'Entrepreneur', category: 'entrepreneur', description: 'CEO of Tesla and SpaceX', wikipediaUrl: 'https://en.wikipedia.org/wiki/Elon_Musk' },
      { name: 'Mel Brooks', birthDate: '1926-06-28', profession: 'Director & Comedian', category: 'celebrity', wikipediaUrl: 'https://en.wikipedia.org/wiki/Mel_Brooks' },
    ],
    events: []
  },
  '05-21': {
    people: [
      { name: 'Mark Zuckerberg', birthDate: '1984-05-14', profession: 'Entrepreneur', category: 'entrepreneur', description: 'Co-founder of Facebook', wikipediaUrl: 'https://en.wikipedia.org/wiki/Mark_Zuckerberg' },
      { name: 'Mr. T', birthDate: '1952-05-21', profession: 'Actor', category: 'celebrity', wikipediaUrl: 'https://en.wikipedia.org/wiki/Mr._T' },
    ],
    events: []
  },
  '03-01': {
    people: [
      { name: 'Justin Bieber', birthDate: '1994-03-01', profession: 'Singer', category: 'celebrity', wikipediaUrl: 'https://en.wikipedia.org/wiki/Justin_Bieber' },
      { name: 'Ron Howard', birthDate: '1954-03-01', profession: 'Director', category: 'celebrity', wikipediaUrl: 'https://en.wikipedia.org/wiki/Ron_Howard' },
    ],
    events: []
  },
  '08-04': {
    people: [
      { name: 'Barack Obama', birthDate: '1961-08-04', profession: '44th US President', category: 'other', description: 'First African American President', wikipediaUrl: 'https://en.wikipedia.org/wiki/Barack_Obama' },
      { name: 'Louis Armstrong', birthDate: '1901-08-04', profession: 'Musician', category: 'celebrity', description: 'Jazz legend', wikipediaUrl: 'https://en.wikipedia.org/wiki/Louis_Armstrong' },
    ],
    events: []
  },
  '09-26': {
    people: [
      { name: 'Serena Williams', birthDate: '1981-09-26', profession: 'Tennis Player', category: 'athlete', description: 'Tennis champion', wikipediaUrl: 'https://en.wikipedia.org/wiki/Serena_Williams' },
      { name: 'George Gershwin', birthDate: '1898-09-26', profession: 'Composer', category: 'celebrity', wikipediaUrl: 'https://en.wikipedia.org/wiki/George_Gershwin' },
    ],
    events: []
  },
  '10-28': {
    people: [
      { name: 'Bill Gates', birthDate: '1955-10-28', profession: 'Entrepreneur', category: 'entrepreneur', description: 'Co-founder of Microsoft', wikipediaUrl: 'https://en.wikipedia.org/wiki/Bill_Gates' },
      { name: 'Julia Roberts', birthDate: '1967-10-28', profession: 'Actress', category: 'celebrity', wikipediaUrl: 'https://en.wikipedia.org/wiki/Julia_Roberts' },
    ],
    events: []
  },
};

// Function to get birthday data for a specific date
export const getBirthdayData = (month: number, day: number): BirthdayData => {
  const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return birthdayDatabase[key] || { people: [], events: [] };
};

// Function to get icon component for each category
export const getCategoryIcon = (category: WikiPerson['category']) => {
  const icons = {
    celebrity: Star,
    actor: Clapperboard,
    dancer: Music,
    artist: Palette,
    internet_celebrity: Wifi,
    scientist: Beaker,
    entrepreneur: Briefcase,
    sports: Trophy,
    athlete: Trophy,
    other: Users
  };
  return icons[category] || Users;
};

// Function to search celebrities by name or profession
export const searchCelebrities = (query: string, category?: string): WikiPerson[] => {
  const searchTerm = query.toLowerCase().trim();
  const results: WikiPerson[] = [];
  
  // Search through all dates in the database
  for (const key in birthdayDatabase) {
    const data = birthdayDatabase[key];
    for (const person of data.people) {
      // Check if person matches search criteria
      const matchesQuery = 
        person.name.toLowerCase().includes(searchTerm) ||
        person.profession.toLowerCase().includes(searchTerm);
      
      const matchesCategory = !category || person.category === category;
      
      if (matchesQuery && matchesCategory) {
        results.push(person);
      }
    }
  }
  
  // Return up to 50 results
  return results.slice(0, 50);
};

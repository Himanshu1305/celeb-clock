export interface Celebrity {
  name: string;
  birthDate: string; // YYYY-MM-DD format
  profession: string;
  image?: string;
  funFact?: string;
}

export const celebrities: Celebrity[] = [
  {
    name: "Leonardo DiCaprio",
    birthDate: "1974-11-11",
    profession: "Actor & Environmental Activist",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    funFact: "Won his first Oscar at age 41 for 'The Revenant'"
  },
  {
    name: "Taylor Swift",
    birthDate: "1989-12-13",
    profession: "Singer & Songwriter",
    image: "https://images.unsplash.com/photo-1494790108755-2616c9434af6?w=400&h=400&fit=crop&crop=face",
    funFact: "Has won 12 Grammy Awards and counting"
  },
  {
    name: "Elon Musk",
    birthDate: "1971-06-28",
    profession: "Entrepreneur & Innovator",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    funFact: "CEO of Tesla, SpaceX, and owner of X (formerly Twitter)"
  },
  {
    name: "Emma Watson",
    birthDate: "1990-04-15",
    profession: "Actress & Activist",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    funFact: "UN Women Goodwill Ambassador"
  },
  {
    name: "Ryan Reynolds",
    birthDate: "1976-10-23",
    profession: "Actor & Producer",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    funFact: "Known for his witty social media presence"
  },
  {
    name: "Zendaya",
    birthDate: "1996-09-01",
    profession: "Actress & Singer",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    funFact: "Youngest actress to win Emmy for Lead Actress in a Drama"
  },
  {
    name: "Dwayne Johnson",
    birthDate: "1972-05-02",
    profession: "Actor & Former Wrestler",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    funFact: "One of the highest-paid actors in Hollywood"
  },
  {
    name: "Beyoncé",
    birthDate: "1981-09-04",
    profession: "Singer & Businesswoman",
    image: "https://images.unsplash.com/photo-1494790108755-2616c9434af6?w=400&h=400&fit=crop&crop=face",
    funFact: "Most Grammy-winning artist of all time"
  },
  {
    name: "Chris Pratt",
    birthDate: "1979-06-21",
    profession: "Actor",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    funFact: "Star-Lord in Guardians of the Galaxy"
  },
  {
    name: "Ariana Grande",
    birthDate: "1993-06-26",
    profession: "Singer & Actress",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    funFact: "Has one of the most powerful voices in pop music"
  },
  {
    name: "Tom Holland",
    birthDate: "1996-06-01",
    profession: "Actor",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    funFact: "The youngest actor to play Spider-Man"
  },
  {
    name: "Selena Gomez",
    birthDate: "1992-07-22",
    profession: "Singer & Actress",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    funFact: "Most-followed woman on Instagram"
  },
  {
    name: "Michael B. Jordan",
    birthDate: "1987-02-09",
    profession: "Actor & Producer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    funFact: "Named one of Time's most influential people"
  },
  {
    name: "Jennifer Lawrence",
    birthDate: "1990-08-15",
    profession: "Actress",
    image: "https://images.unsplash.com/photo-1494790108755-2616c9434af6?w=400&h=400&fit=crop&crop=face",
    funFact: "Won Oscar at age 22 for 'Silver Linings Playbook'"
  },
  {
    name: "Chris Evans",
    birthDate: "1981-06-13",
    profession: "Actor",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    funFact: "Played Captain America in the Marvel Cinematic Universe"
  },
  {
    name: "Scarlett Johansson",
    birthDate: "1984-11-22",
    profession: "Actress",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    funFact: "Highest-grossing female actor of all time"
  },
  {
    name: "Ryan Gosling",
    birthDate: "1980-11-12",
    profession: "Actor",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    funFact: "Started as a child actor on Disney Channel"
  },
  {
    name: "Emma Stone",
    birthDate: "1988-11-06",
    profession: "Actress",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    funFact: "Won Oscar for 'La La Land' and 'Poor Things'"
  },
  {
    name: "Justin Timberlake",
    birthDate: "1981-01-31",
    profession: "Singer & Actor",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    funFact: "Former member of *NSYNC"
  },
  {
    name: "Rihanna",
    birthDate: "1988-02-20",
    profession: "Singer & Entrepreneur",
    image: "https://images.unsplash.com/photo-1494790108755-2616c9434af6?w=400&h=400&fit=crop&crop=face",
    funFact: "Billionaire businesswoman with Fenty Beauty empire"
  }
];

export const findCelebrityByBirthday = (birthDate: Date): Celebrity[] => {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  
  return celebrities.filter(celebrity => {
    const celeBirthDate = new Date(celebrity.birthDate);
    const celebMonth = celeBirthDate.getMonth() + 1;
    const celebDay = celeBirthDate.getDate();
    
    return celebMonth === month && celebDay === day;
  });
};
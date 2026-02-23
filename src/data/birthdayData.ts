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
import { allBirthdays, BirthdayData } from './birthdays';

// Use the expanded modular birthday database
export const birthdayDatabase = allBirthdays;

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
  
  for (const key in birthdayDatabase) {
    const data = birthdayDatabase[key];
    for (const person of data.people) {
      const matchesQuery = 
        person.name.toLowerCase().includes(searchTerm) ||
        person.profession.toLowerCase().includes(searchTerm);
      
      const matchesCategory = !category || person.category === category;
      
      if (matchesQuery && matchesCategory) {
        results.push(person);
      }
    }
  }
  
  return results.slice(0, 50);
};

import { WikiPerson } from '@/services/WikimediaService';
import { allBirthdays, BirthdayData } from './birthdays';

// Use the expanded modular birthday database
export const birthdayDatabase = allBirthdays;

// Function to get birthday data for a specific date
export const getBirthdayData = (month: number, day: number): BirthdayData => {
  const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return birthdayDatabase[key] || { people: [], events: [] };
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

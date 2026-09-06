/** Notable events in Indian history, keyed by [month, day, year, event, category]. */
export type EventTuple = [number, number, number, string, string];

export const INDIAN_EVENTS: EventTuple[] = [
  [1, 26, 1950, "India's Republic Day — the Constitution of India came into effect", 'national'],
  [8, 15, 1947, "India's Independence Day — India became free from British rule", 'national'],
  [10, 2, 1869, 'Mahatma Gandhi born in Porbandar, Gujarat', 'birth'],
  [11, 14, 1889, 'Jawaharlal Nehru, India\'s first Prime Minister, born', 'birth'],
  [4, 14, 1891, 'Dr. B.R. Ambedkar, architect of the Indian Constitution, born', 'birth'],
  [10, 31, 1875, 'Sardar Vallabhbhai Patel, the Iron Man of India, born', 'birth'],
  [4, 13, 1919, 'Jallianwala Bagh massacre in Amritsar', 'historical'],
  [3, 12, 1930, "Gandhi's Salt March (Dandi March) begins", 'historical'],
  [5, 18, 1974, "India's first nuclear test, Smiling Buddha, at Pokhran", 'historical'],
  [1, 30, 1948, 'Mahatma Gandhi assassinated in New Delhi', 'historical'],
  [8, 15, 1872, 'Sri Aurobindo, philosopher and freedom fighter, born', 'birth'],
  [11, 7, 1888, 'C.V. Raman, Nobel laureate physicist, born', 'birth'],
  [12, 22, 1887, 'Srinivasa Ramanujan, mathematical genius, born', 'birth'],
  [10, 22, 1900, 'Ashfaqulla Khan, revolutionary freedom fighter, born', 'birth'],
  [9, 5, 1888, 'Dr. Sarvepalli Radhakrishnan (Teachers\' Day) born', 'birth'],
  [11, 19, 1917, 'Indira Gandhi, first woman Prime Minister of India, born', 'birth'],
  [12, 25, 1924, 'Atal Bihari Vajpayee, former Prime Minister, born', 'birth'],
  [9, 27, 1907, 'Bhagat Singh, revolutionary freedom fighter, born', 'birth'],
  [3, 23, 1931, 'Bhagat Singh, Rajguru and Sukhdev executed', 'historical'],
  [1, 23, 1897, 'Netaji Subhas Chandra Bose born', 'birth'],
  [7, 23, 1856, 'Bal Gangadhar Tilak, freedom fighter, born', 'birth'],
  [2, 13, 1879, 'Sarojini Naidu, the Nightingale of India, born', 'birth'],
  [10, 15, 1931, 'Dr. A.P.J. Abdul Kalam, Missile Man and President, born', 'birth'],
  [5, 7, 1861, 'Rabindranath Tagore, Nobel laureate poet, born', 'birth'],
  [8, 29, 1905, 'Major Dhyan Chand, hockey legend (National Sports Day), born', 'birth'],
  [11, 30, 1858, 'Jagadish Chandra Bose, scientist, born', 'birth'],
  [1, 12, 1863, 'Swami Vivekananda (National Youth Day) born', 'birth'],
  [4, 15, 1469, 'Guru Nanak Dev Ji, founder of Sikhism, born', 'birth'],
  [12, 6, 1956, 'Dr. B.R. Ambedkar passed away (Mahaparinirvan Diwas)', 'historical'],
  [6, 25, 1975, 'The Emergency declared in India', 'historical'],
  [12, 16, 1971, 'India-Pakistan War of 1971 ends; Bangladesh liberated', 'historical'],
  [10, 20, 1962, 'Sino-Indian War begins', 'historical'],
  [7, 21, 1947, 'The Indian national flag officially adopted', 'historical'],
  [2, 28, 1928, 'C.V. Raman discovers the Raman Effect (National Science Day)', 'historical'],
  [8, 20, 1944, 'Rajiv Gandhi, former Prime Minister, born', 'birth'],
  [5, 21, 1991, 'Rajiv Gandhi assassinated', 'historical'],
  [9, 15, 1861, 'Sir M. Visvesvaraya, engineer (Engineers\' Day), born', 'birth'],
  [11, 11, 1888, 'Maulana Abul Kalam Azad (National Education Day) born', 'birth'],
  [4, 6, 1930, "Gandhi breaks the salt law at Dandi", 'historical'],
  [8, 9, 1942, 'Quit India Movement launched', 'historical'],
  [1, 15, 1949, 'Indian Army Day', 'national'],
  [10, 8, 1932, 'Indian Air Force founded', 'national'],
  [12, 4, 1971, 'Indian Navy Day', 'national'],
  [2, 24, 1938, 'First Indian-made feature film milestone in cinema history', 'historical'],
  [3, 22, 1957, 'India adopts the Saka national calendar', 'historical'],
  [7, 18, 1918, 'Nelson Mandela born (global; widely observed in India)', 'birth'],
  [9, 17, 1950, 'Narendra Modi, Prime Minister of India, born', 'birth'],
  [12, 23, 1902, 'Chaudhary Charan Singh (Kisan Diwas) born', 'birth'],
  [4, 3, 1903, 'Kamaladevi Chattopadhyay, social reformer, born', 'birth'],
  [11, 4, 1845, 'Vasudev Balwant Phadke, early revolutionary, born', 'birth'],
  [6, 23, 1953, 'Syama Prasad Mukherjee passed away', 'historical'],
  [8, 5, 2019, 'Article 370 revoked in Jammu & Kashmir', 'historical'],
  [1, 22, 2024, 'Ram Mandir consecration in Ayodhya', 'historical'],
];

export interface HistoricalEvent { month: number; day: number; year: number; event: string; category: string; }

export function getEventsForDate(month: number, day: number): HistoricalEvent[] {
  return INDIAN_EVENTS
    .filter(([m, d]) => m === month && d === day)
    .map(([m, d, year, event, category]) => ({ month: m, day: d, year, event, category }));
}

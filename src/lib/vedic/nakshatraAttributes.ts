/**
 * Shared Nakshatra attribute tables — single source of truth for the
 * matchmaking (Ashtakoota + 10-porutham) and standalone-dosha engines.
 *
 * Extracted from matchmaking.ts (Growth P2) so the 10-porutham system and the
 * Pitra/Mool/Grahan/Nadi standalone doshas reuse exactly the same classical
 * data — no drift between features. Behaviour of matchmaking.ts is unchanged.
 */

export const NAK_ORDER = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

// Vimshottari lord of each nakshatra (by index mod 9).
export const DASHA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
export const nakLord = (idx: number) => DASHA_LORDS[idx % 9];

export const GANA: Record<string, 'Deva' | 'Manushya' | 'Rakshasa'> = {
  Ashwini: 'Deva', Mrigashira: 'Deva', Punarvasu: 'Deva', Pushya: 'Deva', Hasta: 'Deva', Swati: 'Deva', Anuradha: 'Deva', Shravana: 'Deva', Revati: 'Deva',
  Bharani: 'Manushya', Rohini: 'Manushya', Ardra: 'Manushya', 'Purva Phalguni': 'Manushya', 'Uttara Phalguni': 'Manushya', 'Purva Ashadha': 'Manushya', 'Uttara Ashadha': 'Manushya', 'Purva Bhadrapada': 'Manushya', 'Uttara Bhadrapada': 'Manushya',
  Krittika: 'Rakshasa', Ashlesha: 'Rakshasa', Magha: 'Rakshasa', Chitra: 'Rakshasa', Vishakha: 'Rakshasa', Jyeshtha: 'Rakshasa', Mula: 'Rakshasa', Dhanishtha: 'Rakshasa', Shatabhisha: 'Rakshasa',
};

export const NADI: Record<string, 'Adi' | 'Madhya' | 'Antya'> = {
  Ashwini: 'Adi', Ardra: 'Adi', Punarvasu: 'Adi', 'Uttara Phalguni': 'Adi', Hasta: 'Adi', Jyeshtha: 'Adi', Mula: 'Adi', Shatabhisha: 'Adi', 'Purva Bhadrapada': 'Adi',
  Bharani: 'Madhya', Mrigashira: 'Madhya', Pushya: 'Madhya', 'Purva Phalguni': 'Madhya', Chitra: 'Madhya', Anuradha: 'Madhya', 'Purva Ashadha': 'Madhya', Dhanishtha: 'Madhya', 'Uttara Bhadrapada': 'Madhya',
  Krittika: 'Antya', Rohini: 'Antya', Ashlesha: 'Antya', Magha: 'Antya', Swati: 'Antya', Vishakha: 'Antya', 'Uttara Ashadha': 'Antya', Shravana: 'Antya', Revati: 'Antya',
};

export const YONI: Record<string, string> = {
  Ashwini: 'Horse', Shatabhisha: 'Horse', Bharani: 'Elephant', Revati: 'Elephant', Pushya: 'Sheep', Krittika: 'Sheep',
  Rohini: 'Snake', Mrigashira: 'Snake', Mula: 'Dog', Ardra: 'Dog', Ashlesha: 'Cat', Punarvasu: 'Cat',
  Magha: 'Rat', 'Purva Phalguni': 'Rat', 'Uttara Phalguni': 'Cow', 'Uttara Bhadrapada': 'Cow', Hasta: 'Buffalo', Swati: 'Buffalo',
  Vishakha: 'Tiger', Chitra: 'Tiger', Jyeshtha: 'Hare', Anuradha: 'Hare', 'Purva Ashadha': 'Monkey', Shravana: 'Monkey',
  'Purva Bhadrapada': 'Lion', Dhanishtha: 'Lion', 'Uttara Ashadha': 'Mongoose',
};

export const YONI_ENEMY: Record<string, string> = {
  Horse: 'Buffalo', Buffalo: 'Horse', Elephant: 'Lion', Lion: 'Elephant', Sheep: 'Monkey', Monkey: 'Sheep',
  Snake: 'Mongoose', Mongoose: 'Snake', Dog: 'Hare', Hare: 'Dog', Cat: 'Rat', Rat: 'Cat', Cow: 'Tiger', Tiger: 'Cow',
};

// Varna by Moon sign (0-based Mesha..Meena): water=Brahmin(4), fire=Kshatriya(3), earth=Vaishya(2), air=Shudra(1).
export const VARNA_LEVEL = [3, 2, 1, 4, 3, 2, 1, 4, 3, 2, 1, 4];
export const VARNA_NAME = ['—', 'Shudra', 'Vaishya', 'Kshatriya', 'Brahmin'];

// Vashya group by Moon sign (whole-sign mainstream convention).
export type VashyaGroup = 'Manava' | 'Chatushpada' | 'Jalachara' | 'Vanachara' | 'Keeta';
export const VASHYA: VashyaGroup[] = ['Chatushpada', 'Chatushpada', 'Manava', 'Jalachara', 'Vanachara', 'Manava', 'Manava', 'Keeta', 'Manava', 'Chatushpada', 'Manava', 'Jalachara'];

// The 9 Taras by count-position (1-9). 3/5/7 (Vipat/Pratyari/Vadha) are inauspicious.
export const TARA_NAMES = ['—', 'Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyari', 'Sadhaka', 'Vadha', 'Mitra', 'Parama Mitra'];

/** Inclusive count-position (1-9) from one nakshatra index to another. */
export function taraNum(fromIdx: number, toIdx: number): number {
  const count = ((toIdx - fromIdx + 27) % 27) + 1;
  const t = count % 9;
  return t === 0 ? 9 : t;
}

/** Index 0..26 of a nakshatra name (tolerant of minor spelling), or -1. */
export function nakshatraIndex(name: string): number {
  return NAK_ORDER.indexOf(name);
}

/**
 * Supplementary per-Nakshatra data for the /nakshatra hub (Growth P1).
 *
 * The narrative facts (deity, symbol, ruling planet, shakti, meaning,
 * significance) come from the already-verified NAKSHATRA_MEANINGS
 * (src/lib/vedic/nakshatraMeanings.ts). This file adds the classical
 * reference attributes used to make each page genuinely distinct and useful:
 *   • pada name-sounds (the traditional starting syllables for each of the 4
 *     padas — the basis for Nakshatra-based baby names),
 *   • Gana (Deva / Manushya / Rakshasa temperament),
 *   • Yoni (animal symbol, used in Kundali matching),
 *   • Nadi (Aadi / Madhya / Antya — the heaviest koota in matching).
 *
 * These are standard, classical attributes (consistent across Brihat Parashara
 * Hora Shastra / Muhurta references); no values are invented. Sign span, pada
 * degrees and the Vimshottari period are COMPUTED in the page from the index.
 *
 * Order: Ashwini → Revati (index 0..26), matching the engine's NAKSHATRA_NAMES.
 */

export type Gana = 'Deva' | 'Manushya' | 'Rakshasa';
export type Nadi = 'Aadi' | 'Madhya' | 'Antya';

export interface NakshatraExtra {
  name: string;
  slug: string;
  padaSyllables: [string, string, string, string];
  gana: Gana;
  yoni: string;        // animal symbol
  nadi: Nadi;
}

export const NAKSHATRA_ORDER = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
];

export const NAKSHATRA_EXTRA: Record<string, NakshatraExtra> = {
  Ashwini:            { name: 'Ashwini',            slug: 'ashwini',            padaSyllables: ['Chu', 'Che', 'Cho', 'La'],  gana: 'Deva',     yoni: 'Horse',     nadi: 'Aadi' },
  Bharani:            { name: 'Bharani',            slug: 'bharani',            padaSyllables: ['Li', 'Lu', 'Le', 'Lo'],     gana: 'Manushya', yoni: 'Elephant',  nadi: 'Madhya' },
  Krittika:           { name: 'Krittika',           slug: 'krittika',           padaSyllables: ['A', 'I', 'U', 'E'],         gana: 'Rakshasa', yoni: 'Sheep',     nadi: 'Antya' },
  Rohini:             { name: 'Rohini',             slug: 'rohini',             padaSyllables: ['O', 'Va', 'Vi', 'Vu'],      gana: 'Manushya', yoni: 'Serpent',   nadi: 'Antya' },
  Mrigashira:         { name: 'Mrigashira',         slug: 'mrigashira',         padaSyllables: ['Ve', 'Vo', 'Ka', 'Ki'],     gana: 'Deva',     yoni: 'Serpent',   nadi: 'Madhya' },
  Ardra:              { name: 'Ardra',              slug: 'ardra',              padaSyllables: ['Ku', 'Gha', 'Nga', 'Chha'], gana: 'Manushya', yoni: 'Dog',       nadi: 'Aadi' },
  Punarvasu:          { name: 'Punarvasu',          slug: 'punarvasu',          padaSyllables: ['Ke', 'Ko', 'Ha', 'Hi'],     gana: 'Deva',     yoni: 'Cat',       nadi: 'Aadi' },
  Pushya:             { name: 'Pushya',             slug: 'pushya',             padaSyllables: ['Hu', 'He', 'Ho', 'Da'],     gana: 'Deva',     yoni: 'Sheep',     nadi: 'Madhya' },
  Ashlesha:           { name: 'Ashlesha',           slug: 'ashlesha',           padaSyllables: ['Di', 'Du', 'De', 'Do'],     gana: 'Rakshasa', yoni: 'Cat',       nadi: 'Antya' },
  Magha:              { name: 'Magha',              slug: 'magha',              padaSyllables: ['Ma', 'Mi', 'Mu', 'Me'],     gana: 'Rakshasa', yoni: 'Rat',       nadi: 'Antya' },
  'Purva Phalguni':   { name: 'Purva Phalguni',     slug: 'purva-phalguni',     padaSyllables: ['Mo', 'Ta', 'Ti', 'Tu'],     gana: 'Manushya', yoni: 'Rat',       nadi: 'Madhya' },
  'Uttara Phalguni':  { name: 'Uttara Phalguni',    slug: 'uttara-phalguni',    padaSyllables: ['Te', 'To', 'Pa', 'Pi'],     gana: 'Manushya', yoni: 'Cow',       nadi: 'Aadi' },
  Hasta:              { name: 'Hasta',              slug: 'hasta',              padaSyllables: ['Pu', 'Sha', 'Na', 'Tha'],   gana: 'Deva',     yoni: 'Buffalo',   nadi: 'Aadi' },
  Chitra:             { name: 'Chitra',             slug: 'chitra',             padaSyllables: ['Pe', 'Po', 'Ra', 'Ri'],     gana: 'Rakshasa', yoni: 'Tiger',     nadi: 'Madhya' },
  Swati:              { name: 'Swati',              slug: 'swati',              padaSyllables: ['Ru', 'Re', 'Ro', 'Ta'],     gana: 'Deva',     yoni: 'Buffalo',   nadi: 'Antya' },
  Vishakha:           { name: 'Vishakha',           slug: 'vishakha',           padaSyllables: ['Ti', 'Tu', 'Te', 'To'],     gana: 'Rakshasa', yoni: 'Tiger',     nadi: 'Antya' },
  Anuradha:           { name: 'Anuradha',           slug: 'anuradha',           padaSyllables: ['Na', 'Ni', 'Nu', 'Ne'],     gana: 'Deva',     yoni: 'Deer',      nadi: 'Madhya' },
  Jyeshtha:           { name: 'Jyeshtha',           slug: 'jyeshtha',           padaSyllables: ['No', 'Ya', 'Yi', 'Yu'],     gana: 'Rakshasa', yoni: 'Deer',      nadi: 'Aadi' },
  Mula:               { name: 'Mula',               slug: 'mula',               padaSyllables: ['Ye', 'Yo', 'Bha', 'Bhi'],   gana: 'Rakshasa', yoni: 'Dog',       nadi: 'Aadi' },
  'Purva Ashadha':    { name: 'Purva Ashadha',      slug: 'purva-ashadha',      padaSyllables: ['Bhu', 'Dha', 'Pha', 'Dha'], gana: 'Manushya', yoni: 'Monkey',    nadi: 'Madhya' },
  'Uttara Ashadha':   { name: 'Uttara Ashadha',     slug: 'uttara-ashadha',     padaSyllables: ['Bhe', 'Bho', 'Ja', 'Ji'],   gana: 'Manushya', yoni: 'Mongoose',  nadi: 'Antya' },
  Shravana:           { name: 'Shravana',           slug: 'shravana',           padaSyllables: ['Ju', 'Je', 'Jo', 'Gha'],    gana: 'Deva',     yoni: 'Monkey',    nadi: 'Antya' },
  Dhanishtha:         { name: 'Dhanishtha',         slug: 'dhanishtha',         padaSyllables: ['Ga', 'Gi', 'Gu', 'Ge'],     gana: 'Rakshasa', yoni: 'Lion',      nadi: 'Madhya' },
  Shatabhisha:        { name: 'Shatabhisha',        slug: 'shatabhisha',        padaSyllables: ['Go', 'Sa', 'Si', 'Su'],     gana: 'Rakshasa', yoni: 'Horse',     nadi: 'Aadi' },
  'Purva Bhadrapada': { name: 'Purva Bhadrapada',   slug: 'purva-bhadrapada',   padaSyllables: ['Se', 'So', 'Da', 'Di'],     gana: 'Manushya', yoni: 'Lion',      nadi: 'Aadi' },
  'Uttara Bhadrapada':{ name: 'Uttara Bhadrapada',  slug: 'uttara-bhadrapada',  padaSyllables: ['Du', 'Tha', 'Jha', 'Tra'],  gana: 'Manushya', yoni: 'Cow',       nadi: 'Madhya' },
  Revati:             { name: 'Revati',             slug: 'revati',             padaSyllables: ['De', 'Do', 'Cha', 'Chi'],   gana: 'Deva',     yoni: 'Elephant',  nadi: 'Antya' },
};

export const NAKSHATRA_SLUGS = NAKSHATRA_ORDER.map(n => NAKSHATRA_EXTRA[n].slug);

export function nakshatraBySlug(slug: string): NakshatraExtra | undefined {
  return Object.values(NAKSHATRA_EXTRA).find(n => n.slug === slug);
}

export function nakshatraIndexBySlug(slug: string): number {
  return NAKSHATRA_ORDER.findIndex(n => NAKSHATRA_EXTRA[n].slug === slug);
}

/** Short plain-language note for each Gana. */
export const GANA_NOTE: Record<Gana, string> = {
  Deva: 'Deva (divine) — gentle, generous and refined by temperament.',
  Manushya: 'Manushya (human) — balanced, practical and relationship-oriented.',
  Rakshasa: 'Rakshasa (intense) — strong-willed, independent and determined.',
};

/** Short plain-language note for each Nadi (used in matching). */
export const NADI_NOTE: Record<Nadi, string> = {
  Aadi: 'Aadi (Vata) — the first Nadi group.',
  Madhya: 'Madhya (Pitta) — the middle Nadi group.',
  Antya: 'Antya (Kapha) — the last Nadi group.',
};

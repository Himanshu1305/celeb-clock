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

import { NAKSHATRA_PADA_AKSHARAS } from './nakshatraAksharas';

/** Pada name-sounds come from the ONE site-wide table (nakshatraAksharas.ts, Drik Panchang 108-pada). */
const syl = (n: string): [string, string, string, string] => {
  const r = NAKSHATRA_PADA_AKSHARAS[n];
  return [r[0].en, r[1].en, r[2].en, r[3].en];
};

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
  Ashwini:            { name: 'Ashwini',            slug: 'ashwini',            padaSyllables: syl('Ashwini'),  gana: 'Deva',     yoni: 'Horse',     nadi: 'Aadi' },
  Bharani:            { name: 'Bharani',            slug: 'bharani',            padaSyllables: syl('Bharani'),     gana: 'Manushya', yoni: 'Elephant',  nadi: 'Madhya' },
  Krittika:           { name: 'Krittika',           slug: 'krittika',           padaSyllables: syl('Krittika'),         gana: 'Rakshasa', yoni: 'Sheep',     nadi: 'Antya' },
  Rohini:             { name: 'Rohini',             slug: 'rohini',             padaSyllables: syl('Rohini'),      gana: 'Manushya', yoni: 'Serpent',   nadi: 'Antya' },
  Mrigashira:         { name: 'Mrigashira',         slug: 'mrigashira',         padaSyllables: syl('Mrigashira'),     gana: 'Deva',     yoni: 'Serpent',   nadi: 'Madhya' },
  Ardra:              { name: 'Ardra',              slug: 'ardra',              padaSyllables: syl('Ardra'), gana: 'Manushya', yoni: 'Dog',       nadi: 'Aadi' },
  Punarvasu:          { name: 'Punarvasu',          slug: 'punarvasu',          padaSyllables: syl('Punarvasu'),     gana: 'Deva',     yoni: 'Cat',       nadi: 'Aadi' },
  Pushya:             { name: 'Pushya',             slug: 'pushya',             padaSyllables: syl('Pushya'),     gana: 'Deva',     yoni: 'Sheep',     nadi: 'Madhya' },
  Ashlesha:           { name: 'Ashlesha',           slug: 'ashlesha',           padaSyllables: syl('Ashlesha'),     gana: 'Rakshasa', yoni: 'Cat',       nadi: 'Antya' },
  Magha:              { name: 'Magha',              slug: 'magha',              padaSyllables: syl('Magha'),     gana: 'Rakshasa', yoni: 'Rat',       nadi: 'Antya' },
  'Purva Phalguni':   { name: 'Purva Phalguni',     slug: 'purva-phalguni',     padaSyllables: syl('Purva Phalguni'),     gana: 'Manushya', yoni: 'Rat',       nadi: 'Madhya' },
  'Uttara Phalguni':  { name: 'Uttara Phalguni',    slug: 'uttara-phalguni',    padaSyllables: syl('Uttara Phalguni'),     gana: 'Manushya', yoni: 'Cow',       nadi: 'Aadi' },
  Hasta:              { name: 'Hasta',              slug: 'hasta',              padaSyllables: syl('Hasta'),   gana: 'Deva',     yoni: 'Buffalo',   nadi: 'Aadi' },
  Chitra:             { name: 'Chitra',             slug: 'chitra',             padaSyllables: syl('Chitra'),     gana: 'Rakshasa', yoni: 'Tiger',     nadi: 'Madhya' },
  Swati:              { name: 'Swati',              slug: 'swati',              padaSyllables: syl('Swati'),     gana: 'Deva',     yoni: 'Buffalo',   nadi: 'Antya' },
  Vishakha:           { name: 'Vishakha',           slug: 'vishakha',           padaSyllables: syl('Vishakha'),     gana: 'Rakshasa', yoni: 'Tiger',     nadi: 'Antya' },
  Anuradha:           { name: 'Anuradha',           slug: 'anuradha',           padaSyllables: syl('Anuradha'),     gana: 'Deva',     yoni: 'Deer',      nadi: 'Madhya' },
  Jyeshtha:           { name: 'Jyeshtha',           slug: 'jyeshtha',           padaSyllables: syl('Jyeshtha'),     gana: 'Rakshasa', yoni: 'Deer',      nadi: 'Aadi' },
  Mula:               { name: 'Mula',               slug: 'mula',               padaSyllables: syl('Mula'),   gana: 'Rakshasa', yoni: 'Dog',       nadi: 'Aadi' },
  'Purva Ashadha':    { name: 'Purva Ashadha',      slug: 'purva-ashadha',      padaSyllables: syl('Purva Ashadha'), gana: 'Manushya', yoni: 'Monkey',    nadi: 'Madhya' },
  'Uttara Ashadha':   { name: 'Uttara Ashadha',     slug: 'uttara-ashadha',     padaSyllables: syl('Uttara Ashadha'),   gana: 'Manushya', yoni: 'Mongoose',  nadi: 'Antya' },
  Shravana:           { name: 'Shravana',           slug: 'shravana',           padaSyllables: syl('Shravana'),    gana: 'Deva',     yoni: 'Monkey',    nadi: 'Antya' },
  Dhanishtha:         { name: 'Dhanishtha',         slug: 'dhanishtha',         padaSyllables: syl('Dhanishtha'),     gana: 'Rakshasa', yoni: 'Lion',      nadi: 'Madhya' },
  Shatabhisha:        { name: 'Shatabhisha',        slug: 'shatabhisha',        padaSyllables: syl('Shatabhisha'),     gana: 'Rakshasa', yoni: 'Horse',     nadi: 'Aadi' },
  'Purva Bhadrapada': { name: 'Purva Bhadrapada',   slug: 'purva-bhadrapada',   padaSyllables: syl('Purva Bhadrapada'),     gana: 'Manushya', yoni: 'Lion',      nadi: 'Aadi' },
  'Uttara Bhadrapada':{ name: 'Uttara Bhadrapada',  slug: 'uttara-bhadrapada',  padaSyllables: syl('Uttara Bhadrapada'),  gana: 'Manushya', yoni: 'Cow',       nadi: 'Madhya' },
  Revati:             { name: 'Revati',             slug: 'revati',             padaSyllables: syl('Revati'),   gana: 'Deva',     yoni: 'Elephant',  nadi: 'Antya' },
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

// Correct plural / demonym labels for zodiac signs and Chinese zodiac animals.
// The report previously did naive `${sign}s` concatenation, which produced
// "Famous Sagittariuss", "Famous Piscess", "Famous Oxs", etc. English zodiac
// demonyms are irregular, so an explicit map is the only correct approach.

// Western zodiac — the conventional demonym plural for "Famous <plural>".
const WESTERN_PLURALS: Record<string, string> = {
  Aries: 'Aries',            // invariant
  Taurus: 'Taureans',
  Gemini: 'Geminis',
  Cancer: 'Cancerians',
  Leo: 'Leos',
  Virgo: 'Virgos',
  Libra: 'Librans',
  Scorpio: 'Scorpios',
  Sagittarius: 'Sagittarians',
  Capricorn: 'Capricorns',
  Aquarius: 'Aquarians',
  Pisces: 'Pisceans',        // invariant-looking; "Pisceans" is the demonym
};

// Chinese zodiac animals — mostly regular, but "Ox" → "Oxen" is irregular.
const CHINESE_PLURALS: Record<string, string> = {
  Rat: 'Rats',
  Ox: 'Oxen',
  Tiger: 'Tigers',
  Rabbit: 'Rabbits',
  Dragon: 'Dragons',
  Snake: 'Snakes',
  Horse: 'Horses',
  Goat: 'Goats',
  Monkey: 'Monkeys',
  Rooster: 'Roosters',
  Dog: 'Dogs',
  Pig: 'Pigs',
};

// Safe fallback: naive "+s" only if an unknown label slips through.
export function westernZodiacPlural(sign: string): string {
  return WESTERN_PLURALS[sign?.trim()] ?? `${sign}s`;
}

export function chineseZodiacPlural(animal: string): string {
  return CHINESE_PLURALS[animal?.trim()] ?? `${animal}s`;
}

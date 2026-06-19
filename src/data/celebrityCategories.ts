export type DisplayTier = 'entertainment' | 'public_figure' | 'historical';

export function classifyDisplayTier(celeb: {
  name?: string;
  category?: string;
  profession?: string;
  known_for?: string;
  description?: string;
  birth_year?: number;
  death_year?: number | null;
  [key: string]: unknown;
}): DisplayTier {
  const allText = [celeb.category, celeb.profession, celeb.known_for, celeb.description]
    .filter(Boolean).join(' ').toLowerCase();
  const birthYear = celeb.birth_year || 0;

  // Historical tier: born before 1900
  if (birthYear > 0 && birthYear < 1900) return 'historical';

  // Historical tier: known for ruling, dictatorship, terrorism, mass violence
  if (/dictator|tyrant|genocide|mass murder|war criminal|terrorist|militant|jihadist|extremist|al-qaeda|isis|taliban/.test(allText)) {
    return 'historical';
  }

  // Entertainment tier: actors, musicians, athletes, creators
  if (/actor|actress|singer|musician|athlete|player|sport|director|comedian|model|youtuber|influencer|artist|dancer|rapper|composer|bollywood|cricket|football|tennis|basketball/.test(allText)) {
    return 'entertainment';
  }

  // Public figure tier: everyone else
  return 'public_figure';
}

export const TIER_LABELS: Record<DisplayTier, { heading: string; subtext: string; badge: string }> = {
  entertainment: {
    heading: '🎬 Famous People Born Today',
    subtext: '',
    badge: '',
  },
  public_figure: {
    heading: '🏛️ Notable Figures Born Today',
    subtext: '',
    badge: 'Notable Figure',
  },
  historical: {
    heading: '📚 Historical Figures Born Today',
    subtext: 'Historical record — presented factually for educational context.',
    badge: 'Historical Figure',
  },
};

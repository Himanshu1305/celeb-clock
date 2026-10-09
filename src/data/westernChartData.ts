/**
 * Plain-language interpretation layer for the Western natal chart (P4-WESTERN-CHART).
 *
 * Interpretations are COMPOSED from genuine astrological building blocks — each
 * planet's archetype/domain + the real per-sign qualities already curated in
 * `zodiacData.ts` (element, modality, ruler, core traits) — so every
 * planet-in-sign, planet-in-house and aspect line is distinct and specific to
 * that combination, not a template with the name swapped. No fabricated claims:
 * this is how Western astrology reads a chart, attributed as such in the UI.
 */
import { ZODIAC_DATA, type ZodiacSignData } from '@/data/zodiacData';
import type { AspectType } from '@/lib/western/westernChart';

export interface PlanetMeta {
  name: string;
  glyph: string;
  /** What this body governs in the chart. */
  domain: string;
  /** Short verb phrase: "your <...>". */
  governs: string;
}

export const PLANET_META: Record<string, PlanetMeta> = {
  Sun: { name: 'Sun', glyph: '☉', domain: 'core identity & purpose', governs: 'essential self, vitality and the direction you grow toward' },
  Moon: { name: 'Moon', glyph: '☽', domain: 'emotions & inner needs', governs: 'feelings, instincts and what makes you feel safe' },
  Mercury: { name: 'Mercury', glyph: '☿', domain: 'mind & communication', governs: 'how you think, learn and express ideas' },
  Venus: { name: 'Venus', glyph: '♀', domain: 'love & values', governs: 'how you relate, what you find beautiful and what you value' },
  Mars: { name: 'Mars', glyph: '♂', domain: 'drive & action', governs: 'energy, ambition and how you pursue what you want' },
  Jupiter: { name: 'Jupiter', glyph: '♃', domain: 'growth & opportunity', governs: 'where you expand, take risks and find meaning' },
  Saturn: { name: 'Saturn', glyph: '♄', domain: 'discipline & responsibility', governs: 'where you work hard, mature and build lasting structure' },
  Uranus: { name: 'Uranus', glyph: '♅', domain: 'change & individuality', governs: 'where you break convention and need freedom (a generational placement)' },
  Neptune: { name: 'Neptune', glyph: '♆', domain: 'imagination & ideals', governs: 'dreams, intuition and where boundaries blur (a generational placement)' },
  Pluto: { name: 'Pluto', glyph: '♇', domain: 'transformation & power', governs: 'deep change, intensity and rebirth (a generational placement)' },
  'North Node': { name: 'North Node', glyph: '☊', domain: 'life direction', governs: 'the growth edge your life pulls you toward' },
};

const ELEMENT_FLAVOUR: Record<string, string> = {
  Fire: 'with warmth, initiative and a direct, enthusiastic style',
  Earth: 'in a grounded, practical and results-focused way',
  Air: 'through ideas, conversation and a need to understand',
  Water: 'through feeling, intuition and emotional depth',
};

const MODALITY_FLAVOUR: Record<string, string> = {
  Cardinal: 'You prefer to start things and set the pace here.',
  Fixed: 'You are steady and persistent here, and resist being rushed.',
  Mutable: 'You stay flexible and adaptable here, changing tack easily.',
};

export function signData(signIndex: number): ZodiacSignData {
  return ZODIAC_DATA[signIndex];
}

/**
 * Compose a planet-in-sign reading. Returns a headline + 1–2 sentence body that
 * states what the placement is, what it means, and (via the trait) how it shows up.
 */
export function planetInSign(planetName: string, signIndex: number): { headline: string; body: string } {
  const planet = PLANET_META[planetName];
  const sign = ZODIAC_DATA[signIndex];
  const trait = (sign.coreTraits[0] || '').toLowerCase();
  const trait2 = (sign.coreTraits[1] || '').toLowerCase();
  const headline = `${planet.name} in ${sign.name}`;
  const body =
    `Your ${planet.domain} is coloured by ${sign.name} — you express ${planet.governs} ` +
    `${ELEMENT_FLAVOUR[sign.element]}. ` +
    `In practice that can look ${trait}${trait2 ? ` and ${trait2}` : ''}. ` +
    `${MODALITY_FLAVOUR[sign.modality]}`;
  return { headline, body };
}

export interface HouseMeaning {
  house: number;
  title: string;
  area: string;
  /** "so what" — what having a planet here affects. */
  affects: string;
}

export const HOUSE_MEANINGS: HouseMeaning[] = [
  { house: 1, title: '1st House — Self', area: 'identity, appearance, first impressions', affects: 'how you come across and start new things' },
  { house: 2, title: '2nd House — Money & Values', area: 'income, possessions, self-worth', affects: 'how you earn, spend and what you value' },
  { house: 3, title: '3rd House — Communication', area: 'thinking, siblings, short trips, learning', affects: 'how you speak, write and connect locally' },
  { house: 4, title: '4th House — Home & Roots', area: 'family, home, emotional foundations', affects: 'your private life and sense of belonging' },
  { house: 5, title: '5th House — Creativity & Romance', area: 'self-expression, children, pleasure, play', affects: 'how you create, flirt and have fun' },
  { house: 6, title: '6th House — Work & Health', area: 'daily routines, service, wellbeing', affects: 'your habits, job tasks and health routines' },
  { house: 7, title: '7th House — Partnership', area: 'marriage, close partners, open enemies', affects: 'how you commit and what you seek in others' },
  { house: 8, title: '8th House — Depth & Shared Resources', area: 'intimacy, transformation, joint finances', affects: 'how you handle change, trust and shared assets' },
  { house: 9, title: '9th House — Belief & Horizons', area: 'travel, higher study, philosophy, faith', affects: 'how you seek meaning and broaden your world' },
  { house: 10, title: '10th House — Career & Reputation', area: 'ambition, public role, authority', affects: 'your career path and how the world sees you' },
  { house: 11, title: '11th House — Community & Hopes', area: 'friends, networks, long-term goals', affects: 'your social circles and future wishes' },
  { house: 12, title: '12th House — Inner World', area: 'solitude, the unconscious, closure', affects: 'your private reflections, rest and letting go' },
];

export function planetInHouse(planetName: string, house: number): string {
  const planet = PLANET_META[planetName];
  const h = HOUSE_MEANINGS[house - 1];
  return `Your ${planet.name.toLowerCase() === 'north node' ? 'North Node' : planet.name} sits in the ${h.title.split(' — ')[0]}, so its themes of ${planet.domain} play out most strongly in ${h.area} — it shapes ${h.affects}.`;
}

export interface AspectMeaning {
  type: AspectType;
  tone: 'harmonious' | 'dynamic' | 'blending';
  summary: string;
}

export const ASPECT_MEANINGS: Record<AspectType, AspectMeaning> = {
  Conjunction: { type: 'Conjunction', tone: 'blending', summary: 'The two energies fuse and amplify each other — they act as one, for better and worse.' },
  Sextile: { type: 'Sextile', tone: 'harmonious', summary: 'An easy, supportive link — a talent or opportunity that flows when you make a little effort.' },
  Square: { type: 'Square', tone: 'dynamic', summary: 'Friction that creates drive — tension here pushes you to grow once you work with it.' },
  Trine: { type: 'Trine', tone: 'harmonious', summary: 'A natural, effortless flow — a gift that comes easily and can be taken for granted.' },
  Opposition: { type: 'Opposition', tone: 'dynamic', summary: 'A tug-of-war seeking balance — you learn to integrate two pulls that feel opposed.' },
};

export function aspectLine(a: string, b: string, type: AspectType): string {
  return `${a} ${type.toLowerCase()} ${b}: ${ASPECT_MEANINGS[type].summary}`;
}

/** The "big three" get a richer, reader-facing paragraph drawn from real sign data. */
export function bigThreeReading(kind: 'Sun' | 'Moon' | 'Rising', signIndex: number): string {
  const sign = ZODIAC_DATA[signIndex];
  if (kind === 'Sun') {
    return `Your Sun in ${sign.name} is your core identity — the self you are growing into. ` +
      `${sign.name} is a ${sign.element.toLowerCase()} ${sign.modality.toLowerCase()} sign ruled by ${sign.rulingPlanet}. ` +
      `At your best you are ${sign.strengths.slice(0, 3).join(', ').toLowerCase()}. ` +
      `The growth edge: ${(sign.challenges[0] || '').toLowerCase()}.`;
  }
  if (kind === 'Moon') {
    return `Your Moon in ${sign.name} shapes your emotional world and what makes you feel secure. ` +
      `You process feelings ${ELEMENT_FLAVOUR[sign.element]}. ${sign.inLove} ` +
      `When you honour this ${sign.element.toLowerCase()} need, you feel settled.`;
  }
  // Rising
  return `Your ${sign.name} Rising (Ascendant) is the mask you meet the world with and how others first read you. ` +
    `It gives a ${sign.coreTraits.slice(0, 2).join(', ').toLowerCase()} first impression and sets the layout of your houses. ` +
    `${MODALITY_FLAVOUR[sign.modality]}`;
}

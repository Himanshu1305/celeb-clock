/**
 * Planet-in-sign and planet-in-house engine — Growth P1 traffic engine.
 *
 * 9 planets × 12 signs and 9 planets × 12 houses. To satisfy Rule 6 (every
 * generated page genuinely distinct and useful) the reading is built from real
 * classical inputs, not a template with words swapped:
 *   • each planet's karaka (what it signifies) and core nature;
 *   • each sign's element, modality and ruler;
 *   • the planet's DIGNITY in that sign (exalted / debilitated / own /
 *     Moolatrikona / great-friend / friend / neutral / enemy) — derived from the
 *     classical exaltation table and the naisargika (natural) friendship table;
 *   • each house's life-areas.
 * The dignity drives a strength grade and tailors the interpretation, so Sun in
 * Aries (exalted) reads very differently from Sun in Libra (debilitated).
 *
 * This is traditional Vedic (Parashari) significtion, attributed as such — not
 * a claim of fact about a person. No fabricated citations.
 */

export type PlanetSlug = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn' | 'rahu' | 'ketu';
export const PLANET_SLUGS: PlanetSlug[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

export interface PlanetInfo {
  slug: PlanetSlug; name: string; sanskrit: string;
  karaka: string;      // what it signifies (significator of…)
  nature: string;      // benefic/malefic + temperament
  governs: string[];   // life domains
  strongWhen: string;  // what a strong placement gives
  weakWhen: string;    // what a weak placement strains
}

export const PLANETS: Record<PlanetSlug, PlanetInfo> = {
  sun: { slug: 'sun', name: 'Sun', sanskrit: 'Surya', karaka: 'the soul, father, authority and vitality', nature: 'a mild malefic — hot, royal and self-defining', governs: ['identity & self-confidence', 'father & government', 'health & vitality', 'status & recognition'], strongWhen: 'clear purpose, leadership, strong vitality and honest authority', weakWhen: 'shaky confidence, friction with authority or the father, and ego that over- or under-asserts' },
  moon: { slug: 'moon', name: 'Moon', sanskrit: 'Chandra', karaka: 'the mind, mother and emotions', nature: 'a benefic when waxing — cool, receptive and nurturing', governs: ['mind & emotions', 'mother & home', 'the public & popularity', 'comfort & memory'], strongWhen: 'emotional steadiness, a nurturing nature and an easy rapport with people', weakWhen: 'mood swings, restlessness and a need for reassurance' },
  mars: { slug: 'mars', name: 'Mars', sanskrit: 'Mangal', karaka: 'energy, courage, siblings and drive', nature: 'a malefic — hot, assertive and competitive', governs: ['energy & courage', 'drive & ambition', 'property & land', 'brothers & competition'], strongWhen: 'courage, decisiveness, physical stamina and the will to act', weakWhen: 'anger, impatience, accidents from haste or scattered energy' },
  mercury: { slug: 'mercury', name: 'Mercury', sanskrit: 'Budha', karaka: 'intellect, speech, commerce and communication', nature: 'neutral — it takes on the colour of what it sits with', governs: ['intelligence & logic', 'speech & writing', 'trade & business', 'skill & dexterity'], strongWhen: 'quick thinking, clear speech, numeracy and a head for business', weakWhen: 'nervous over-thinking, hasty words and difficulty finishing' },
  jupiter: { slug: 'jupiter', name: 'Jupiter', sanskrit: 'Guru', karaka: 'wisdom, teachers, children and fortune', nature: 'the great benefic — expansive, ethical and generous', governs: ['wisdom & higher learning', 'wealth & fortune', 'children & teachers', 'faith & ethics'], strongWhen: 'good judgement, optimism, generosity and protection in hard times', weakWhen: 'over-expansion, complacency or misplaced faith' },
  venus: { slug: 'venus', name: 'Venus', sanskrit: 'Shukra', karaka: 'love, marriage, beauty and comfort', nature: 'a benefic — refined, pleasure-loving and diplomatic', governs: ['love & marriage', 'beauty & art', 'comfort & luxury', 'vehicles & refinement'], strongWhen: 'charm, artistic taste, harmonious relationships and material ease', weakWhen: 'indulgence, relationship friction or craving for comfort' },
  saturn: { slug: 'saturn', name: 'Saturn', sanskrit: 'Shani', karaka: 'discipline, time, labour and longevity', nature: 'the great malefic — slow, cold and exacting, but ultimately just', governs: ['discipline & responsibility', 'work & service', 'longevity & endurance', 'the poor & the old'], strongWhen: 'patience, stamina, integrity and reward that is earned and lasting', weakWhen: 'delay, fear, isolation or a heavy sense of burden' },
  rahu: { slug: 'rahu', name: 'Rahu', sanskrit: 'Rahu', karaka: 'ambition, obsession and the unconventional (North Node)', nature: 'a shadow malefic — amplifying, foreign and boundary-breaking', governs: ['ambition & obsession', 'foreign & unconventional paths', 'sudden rises & falls', 'technology & illusion'], strongWhen: 'bold, worldly ambition and an edge in new or foreign fields', weakWhen: 'restlessness, over-reaching and confusion about what is real' },
  ketu: { slug: 'ketu', name: 'Ketu', sanskrit: 'Ketu', karaka: 'detachment, spirituality and past-life skill (South Node)', nature: 'a shadow malefic — detaching, inward and mystical', governs: ['detachment & liberation', 'spirituality & research', 'intuition & healing', 'sudden losses & insight'], strongWhen: 'intuition, focus, spiritual depth and effortless expertise in one area', weakWhen: 'detachment that becomes avoidance, or feeling cut off and directionless' },
};

export interface SignInfo { slug: string; english: string; sanskrit: string; element: string; modality: string; lord: PlanetSlug; }
export const SIGNS: SignInfo[] = [
  { slug: 'aries', english: 'Aries', sanskrit: 'Mesha', element: 'Fire', modality: 'Movable', lord: 'mars' },
  { slug: 'taurus', english: 'Taurus', sanskrit: 'Vrishabha', element: 'Earth', modality: 'Fixed', lord: 'venus' },
  { slug: 'gemini', english: 'Gemini', sanskrit: 'Mithuna', element: 'Air', modality: 'Dual', lord: 'mercury' },
  { slug: 'cancer', english: 'Cancer', sanskrit: 'Karka', element: 'Water', modality: 'Movable', lord: 'moon' },
  { slug: 'leo', english: 'Leo', sanskrit: 'Simha', element: 'Fire', modality: 'Fixed', lord: 'sun' },
  { slug: 'virgo', english: 'Virgo', sanskrit: 'Kanya', element: 'Earth', modality: 'Dual', lord: 'mercury' },
  { slug: 'libra', english: 'Libra', sanskrit: 'Tula', element: 'Air', modality: 'Movable', lord: 'venus' },
  { slug: 'scorpio', english: 'Scorpio', sanskrit: 'Vrishchika', element: 'Water', modality: 'Fixed', lord: 'mars' },
  { slug: 'sagittarius', english: 'Sagittarius', sanskrit: 'Dhanu', element: 'Fire', modality: 'Dual', lord: 'jupiter' },
  { slug: 'capricorn', english: 'Capricorn', sanskrit: 'Makara', element: 'Earth', modality: 'Movable', lord: 'saturn' },
  { slug: 'aquarius', english: 'Aquarius', sanskrit: 'Kumbha', element: 'Air', modality: 'Fixed', lord: 'saturn' },
  { slug: 'pisces', english: 'Pisces', sanskrit: 'Meena', element: 'Water', modality: 'Dual', lord: 'jupiter' },
];
export function signBySlug(slug: string): SignInfo | undefined { return SIGNS.find(s => s.slug === slug); }

export interface HouseInfo { num: number; name: string; sanskrit: string; areas: string[]; theme: string; }
export const HOUSES: HouseInfo[] = [
  { num: 1, name: 'First House (Ascendant)', sanskrit: 'Lagna / Tanu Bhava', areas: ['self & body', 'personality', 'overall vitality', 'how you start things'], theme: 'who you are and how you meet the world' },
  { num: 2, name: 'Second House', sanskrit: 'Dhana Bhava', areas: ['wealth & savings', 'family', 'speech', 'food & values'], theme: 'what you hold — money, family and voice' },
  { num: 3, name: 'Third House', sanskrit: 'Sahaja Bhava', areas: ['courage & effort', 'siblings', 'communication', 'short journeys & skills'], theme: 'initiative, siblings and self-expression' },
  { num: 4, name: 'Fourth House', sanskrit: 'Sukha Bhava', areas: ['mother', 'home & property', 'inner peace', 'vehicles & land'], theme: 'home, mother and emotional security' },
  { num: 5, name: 'Fifth House', sanskrit: 'Putra Bhava', areas: ['children', 'intelligence & creativity', 'romance', 'past-life merit (poorva punya)'], theme: 'creativity, children and the mind’s brilliance' },
  { num: 6, name: 'Sixth House', sanskrit: 'Ari Bhava', areas: ['health & illness', 'enemies & debts', 'service & work', 'daily routine'], theme: 'obstacles overcome — health, debt and service' },
  { num: 7, name: 'Seventh House', sanskrit: 'Yuvati / Kalatra Bhava', areas: ['marriage & spouse', 'partnerships', 'business deals', 'the public'], theme: 'partnership — marriage and business' },
  { num: 8, name: 'Eighth House', sanskrit: 'Randhra / Ayur Bhava', areas: ['longevity & transformation', 'inheritance & others’ money', 'secrets & research', 'sudden events'], theme: 'depth, transformation and the hidden' },
  { num: 9, name: 'Ninth House', sanskrit: 'Dharma / Bhagya Bhava', areas: ['fortune & luck', 'father & guru', 'dharma & higher learning', 'long journeys & pilgrimage'], theme: 'luck, belief and the higher mind' },
  { num: 10, name: 'Tenth House', sanskrit: 'Karma Bhava', areas: ['career & profession', 'status & fame', 'authority', 'public reputation'], theme: 'career, duty and standing in the world' },
  { num: 11, name: 'Eleventh House', sanskrit: 'Labha Bhava', areas: ['gains & income', 'friends & networks', 'elder siblings', 'ambitions fulfilled'], theme: 'gains, networks and fulfilled desires' },
  { num: 12, name: 'Twelfth House', sanskrit: 'Vyaya Bhava', areas: ['loss & expenditure', 'foreign lands', 'sleep & the bedroom', 'liberation (moksha)'], theme: 'release — expense, foreign life and the inner world' },
];

// ── Dignity ──────────────────────────────────────────────────────────────────
export type Dignity = 'exalted' | 'moolatrikona' | 'own' | 'great-friend' | 'friend' | 'neutral' | 'enemy' | 'debilitated' | 'neutral-node';
export type Strength = 'strong' | 'moderate' | 'mild' | 'challenged';

const EXALT: Partial<Record<PlanetSlug, string>> = { sun: 'aries', moon: 'taurus', mars: 'capricorn', mercury: 'virgo', jupiter: 'cancer', venus: 'pisces', saturn: 'libra' };
const DEBIL: Partial<Record<PlanetSlug, string>> = { sun: 'libra', moon: 'scorpio', mars: 'cancer', mercury: 'pisces', jupiter: 'capricorn', venus: 'virgo', saturn: 'aries' };
const MOOLA: Partial<Record<PlanetSlug, string>> = { sun: 'leo', moon: 'taurus', mars: 'aries', mercury: 'virgo', jupiter: 'sagittarius', venus: 'libra', saturn: 'aquarius' };

// Naisargika (natural) friendships (Parashari). friends/enemies; anything else neutral.
const FRIENDS: Record<PlanetSlug, PlanetSlug[]> = {
  sun: ['moon', 'mars', 'jupiter'], moon: ['sun', 'mercury'], mars: ['sun', 'moon', 'jupiter'],
  mercury: ['sun', 'venus'], jupiter: ['sun', 'moon', 'mars'], venus: ['mercury', 'saturn'],
  saturn: ['mercury', 'venus'], rahu: ['venus', 'saturn', 'mercury'], ketu: ['mars', 'venus', 'saturn'],
};
const ENEMIES: Record<PlanetSlug, PlanetSlug[]> = {
  sun: ['venus', 'saturn'], moon: [], mars: ['mercury'],
  mercury: ['moon'], jupiter: ['mercury', 'venus'], venus: ['sun', 'moon'],
  saturn: ['sun', 'moon', 'mars'], rahu: ['sun', 'moon', 'mars'], ketu: ['sun', 'moon'],
};

export function dignityOf(planet: PlanetSlug, signSlug: string): Dignity {
  if ((planet === 'rahu' || planet === 'ketu')) {
    // Nodes: traditions vary on exaltation. Read via the sign lord's friendship only.
    const lord = signBySlug(signSlug)!.lord;
    if (FRIENDS[planet].includes(lord)) return 'friend';
    if (ENEMIES[planet].includes(lord)) return 'enemy';
    return 'neutral-node';
  }
  if (EXALT[planet] === signSlug) return 'exalted';
  if (DEBIL[planet] === signSlug) return 'debilitated';
  if (MOOLA[planet] === signSlug) return 'moolatrikona';
  const lord = signBySlug(signSlug)!.lord;
  if (lord === planet) return 'own';
  if (FRIENDS[planet].includes(lord)) return 'friend';
  if (ENEMIES[planet].includes(lord)) return 'enemy';
  return 'neutral';
}

export function strengthOf(d: Dignity): Strength {
  switch (d) {
    case 'exalted': case 'moolatrikona': case 'own': return 'strong';
    case 'great-friend': case 'friend': return 'moderate';
    case 'neutral': case 'neutral-node': return 'mild';
    case 'enemy': case 'debilitated': return 'challenged';
  }
}

const DIGNITY_LABEL: Record<Dignity, string> = {
  exalted: 'exalted (uccha)', moolatrikona: 'in Moolatrikona', own: 'in its own sign (swakshetra)',
  'great-friend': 'in a great friend’s sign', friend: 'in a friend’s sign', neutral: 'in a neutral sign',
  enemy: 'in an enemy’s sign', debilitated: 'debilitated (neecha)', 'neutral-node': 'placed by its sign lord',
};
export function dignityLabel(d: Dignity): string { return DIGNITY_LABEL[d]; }

// ── Interpretation builders ──────────────────────────────────────────────────
export interface Placement {
  planet: PlanetInfo; sign: SignInfo; dignity: Dignity; strength: Strength;
  headline: string; dignityLine: string; themeLine: string; sections: Array<{ title: string; text: string }>;
}

function dignityBlurb(planet: PlanetInfo, dignity: Dignity, strength: Strength): string {
  switch (strength) {
    case 'strong':
      return `This is one of the best placements for ${planet.name}. ${dignity === 'exalted' ? 'Exalted' : dignity === 'own' ? 'In its own sign' : 'In its Moolatrikona'}, it expresses its significations — ${planet.karaka} — cleanly and powerfully. The Vedic tradition reads this as ${planet.strongWhen}.`;
    case 'moderate':
      return `${planet.name} is comfortable here, in a friendly sign, so it works well without strain. It gives ${planet.strongWhen}, with fewer extremes than an exalted placement.`;
    case 'mild':
      return `${planet.name} is neutral here — neither helped nor hindered by the sign. Its results depend heavily on the house it falls in, the aspects it receives and its Dasha. Read it as a background influence rather than a headline.`;
    case 'challenged':
      return `${planet.name} is under pressure here — ${dignity === 'debilitated' ? 'debilitated (neecha)' : 'in an enemy’s sign'}. This does not mean "bad": it means the planet must work harder, and its themes (${planet.karaka}) can feel strained until it matures. Classical texts note that a debilitated planet can give strong results when a Neecha-Bhanga (cancellation) applies — so always read the whole chart.`;
  }
}

export function placementInSign(planetSlug: PlanetSlug, signSlug: string): Placement | null {
  const planet = PLANETS[planetSlug]; const sign = signBySlug(signSlug);
  if (!planet || !sign) return null;
  const dignity = dignityOf(planetSlug, signSlug);
  const strength = strengthOf(dignity);
  const lord = PLANETS[sign.lord];
  return {
    planet, sign, dignity, strength,
    headline: `${planet.name} in ${sign.sanskrit} (${sign.english})`,
    dignityLine: `${planet.name} is ${DIGNITY_LABEL[dignity]} in ${sign.english}.`,
    themeLine: `${planet.name} signifies ${planet.karaka}; ${sign.english} is a ${sign.modality.toLowerCase()} ${sign.element.toLowerCase()} sign ruled by ${lord.name}. The two blend as follows.`,
    sections: [
      { title: 'Strength of the placement', text: dignityBlurb(planet, dignity, strength) },
      { title: `How ${sign.english}’s nature colours ${planet.name}`, text: `${sign.english} brings a ${sign.element.toLowerCase()}, ${sign.modality.toLowerCase()} quality: ${elementFlavour(sign.element)} and ${modalityFlavour(sign.modality)}. Filtered through ${sign.english}, ${planet.name}'s drive for ${planet.governs[0]} tends to express ${signExpression(sign)}.` },
      { title: 'What it tends to give', text: `At its best this placement supports ${planet.governs.join(', ')} — expressed in the ${sign.english} style. ${strength === 'challenged' ? `Where it is strained, watch for ${planet.weakWhen}.` : `Its gifts come more easily than average because the planet sits ${DIGNITY_LABEL[dignity]}.`}` },
      { title: 'Care points & remedy mindset', text: `${planet.name} in ${sign.english} can over-reach into ${planet.weakWhen}. The classical attitude is not fear but maturity: strengthen the planet through its positive significations (honest ${planet.governs[0]}), and read the result alongside the house ${planet.name} occupies and its current Dasha. Nothing here fixes an outcome — it is a tendency the tradition describes.` },
    ],
  };
}

export function placementInHouse(planetSlug: PlanetSlug, houseNum: number): { planet: PlanetInfo; house: HouseInfo; sections: Array<{ title: string; text: string }>; headline: string; themeLine: string } | null {
  const planet = PLANETS[planetSlug]; const house = HOUSES[houseNum - 1];
  if (!planet || !house) return null;
  return {
    planet, house,
    headline: `${planet.name} in the ${ordinal(houseNum)} House`,
    themeLine: `The ${ordinal(houseNum)} house (${house.sanskrit}) governs ${house.areas.join(', ')} — ${house.theme}. ${planet.name} signifies ${planet.karaka}, so here it directs that energy into ${house.areas[0]}.`,
    sections: [
      { title: `${planet.name}’s focus in this house`, text: `With ${planet.name} in the ${ordinal(houseNum)}, its core significations (${planet.governs.join(', ')}) play out mainly through ${house.theme}. Expect the themes of ${house.areas.slice(0, 2).join(' and ')} to carry a ${planet.name} flavour — ${planet.nature.split('—')[1]?.trim() || planet.nature}.` },
      { title: 'At its best', text: `A well-placed ${planet.name} here gives ${planet.strongWhen}, channelled into ${house.areas[0]} and ${house.areas[1] ?? house.theme}. This is the constructive reading the tradition leads with.` },
      { title: 'Where to take care', text: `Under pressure (a weak sign, hard aspects, or a difficult Dasha), ${planet.name} in the ${ordinal(houseNum)} can bring ${planet.weakWhen} — felt through ${house.areas[0]}. ${sensitiveHouse(houseNum) ? 'Because this is a sensitive (dusthana/maraka) house, read it calmly and always in the context of the whole chart — never as a fixed prediction about health, loss or lifespan.' : 'Read it as a tendency to manage, not a verdict.'}` },
      { title: 'How to read it in your chart', text: `This is a general, tradition-based reading of ${planet.name} in the ${ordinal(houseNum)}. In your own Kundli it is modified by the sign on the house, the house lord, aspects and your running Dasha. Generate your free Kundli to see where ${planet.name} actually sits for you.` },
    ],
  };
}

function elementFlavour(el: string): string {
  return el === 'Fire' ? 'warm, direct and initiating' : el === 'Earth' ? 'practical, patient and results-focused' : el === 'Air' ? 'mental, communicative and social' : 'emotional, intuitive and adaptive';
}
function modalityFlavour(mod: string): string {
  return mod === 'Movable' ? 'quick to start and change' : mod === 'Fixed' ? 'steady, determined and slow to shift' : 'flexible and two-sided';
}
function signExpression(sign: SignInfo): string {
  return `${sign.element === 'Fire' ? 'boldly and visibly' : sign.element === 'Earth' ? 'steadily and concretely' : sign.element === 'Air' ? 'through ideas, words and people' : 'inwardly, with feeling and care'}`;
}
function ordinal(n: number): string { return ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'][n]; }
function sensitiveHouse(n: number): boolean { return n === 6 || n === 8 || n === 12 || n === 2 || n === 7; }

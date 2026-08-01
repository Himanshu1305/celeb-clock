/**
 * Compatibility composed prose — the ONE data module that drives the pair-specific
 * Love / Friendship / Work sections on all 78 /compatibility/{a}/{b} pages.
 *
 * Architecture (stated for the report): every pair page's three long-form sections are
 * COMPOSED at render time from a sign's four astrological primitives below —
 * element, modality, ruling planet, polarity — plus the sign-distance ASPECT between the
 * two. Change a sign's primitive here (e.g. re-rule Scorpio) and every one of its pair
 * pages regenerates on the next build. Zero per-pair hand maintenance.
 *
 * The three sections are deliberately driven by DIFFERENT primitives so they read as
 * genuinely distinct for the SAME pair (the anti-thin-content rule):
 *   • Love      → ruling planets (desire/affection) + element heat + polarity
 *   • Friendship→ element affinity + aspect ease (planets muted, ego stakes low)
 *   • Work      → modality (who initiates/sustains/adapts) + polarity as conflict engine
 */

export type Sign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo'
  | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export const SIGN_ORDER: Sign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export const ELEMENT: Record<Sign, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

export const MODALITY: Record<Sign, 'Cardinal' | 'Fixed' | 'Mutable'> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};

// Traditional + modern co-ruler in parentheses where it adds colour.
export const RULING_PLANET: Record<Sign, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'the Moon',
  Leo: 'the Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Pluto & Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

// One-line desire/affection signature of each ruler — the LOVE-section engine.
const PLANET_DESIRE: Record<Sign, string> = {
  Aries: 'Mars-driven pursuit and heat',
  Taurus: 'Venus-ruled sensuality and steady devotion',
  Gemini: 'Mercury’s flirtation, banter and mental spark',
  Cancer: 'the Moon’s tenderness and need for emotional safety',
  Leo: 'the Sun’s warmth, romance and need to be adored',
  Virgo: 'Mercury’s attentive, quietly devoted care',
  Libra: 'Venus-ruled romance, charm and craving for harmony',
  Scorpio: 'Pluto’s all-or-nothing intensity and depth',
  Sagittarius: 'Jupiter’s adventurous, freedom-loving affection',
  Capricorn: 'Saturn’s slow-burn, deeply committed loyalty',
  Aquarius: 'Uranus’ unconventional, friendship-first attachment',
  Pisces: 'Neptune’s dreamy, romantic, self-sacrificing love',
};

// Polarity: Fire & Air are Yang (outgoing/initiating); Earth & Water are Yin (receptive).
const POLARITY: Record<Sign, 'Yang' | 'Yin'> = {
  Aries: 'Yang', Leo: 'Yang', Sagittarius: 'Yang', Gemini: 'Yang', Libra: 'Yang', Aquarius: 'Yang',
  Taurus: 'Yin', Virgo: 'Yin', Capricorn: 'Yin', Cancer: 'Yin', Scorpio: 'Yin', Pisces: 'Yin',
};

const ELEMENT_HEAT: Record<string, string> = {
  Fire: 'fast, passionate and combustible',
  Earth: 'sensual, physical and slow to ignite but slow to cool',
  Air: 'playful and verbal, needing conversation to feel close',
  Water: 'deep, intuitive and emotionally immersive',
};

/** Sign distance 0..6 on the wheel (0 = same sign, 6 = opposite). */
export function signDistance(a: Sign, b: Sign): number {
  const i = SIGN_ORDER.indexOf(a), j = SIGN_ORDER.indexOf(b);
  const raw = Math.abs(i - j);
  return Math.min(raw, 12 - raw);
}

export function aspectName(a: Sign, b: Sign): string {
  return ['conjunction', 'semi-sextile', 'sextile', 'square', 'trine', 'quincunx', 'opposition'][signDistance(a, b)];
}

// How the aspect FEELS — the friendship-section engine (ease vs friction).
const ASPECT_EASE: Record<number, string> = {
  0: 'You share the same sign, so being together feels like looking in a mirror — instant recognition, with the catch that you also double each other’s blind spots.',
  1: 'You sit side by side on the zodiac wheel (a semi-sextile), which means neighbouring but different tempos — there’s something to learn from each other, though it rarely feels effortless at first.',
  2: 'You form a sextile (two signs apart) — one of the easiest, most cooperative angles, where each of you gently draws the other out without pressure.',
  3: 'You form a square (three signs apart), the zodiac’s classic friction angle — the tension is real, but it’s also the aspect that pushes you both to grow rather than stagnate.',
  4: 'You form a trine (four signs apart, same element) — the smoothest angle there is, where understanding is so natural you rarely have to explain yourselves.',
  5: 'You form a quincunx (five signs apart), an awkward-angle pairing of signs with almost nothing structurally in common — it works only through deliberate, ongoing adjustment.',
  6: 'You sit directly opposite each other on the wheel — the axis of magnetic attraction, where you’re each other’s missing half and, at your worst, each other’s mirror-opposite frustration.',
};

const MODALITY_ROLE: Record<string, string> = {
  Cardinal: 'an initiator who starts things and sets direction',
  Fixed: 'a sustainer who holds the vision and sees things through',
  Mutable: 'an adapter who stays flexible and smooths the path',
};

function polarityLoveNote(s1: Sign, s2: Sign): string {
  const p1 = POLARITY[s1], p2 = POLARITY[s2];
  if (p1 === p2 && p1 === 'Yang') return 'Both are Yang (outgoing) signs, so both instinctively want to lead the dance — electric when aimed at the world together, a contest when aimed at each other.';
  if (p1 === p2 && p1 === 'Yin') return 'Both are Yin (receptive) signs, so the bond is tender and safe — the risk is that each waits for the other to make the first move.';
  return 'One of you is Yang (initiating) and the other Yin (receptive), which sets up a natural pursuer-and-receiver rhythm — usually the easiest polarity balance in romance.';
}

function polarityWorkNote(s1: Sign, s2: Sign): string {
  const p1 = POLARITY[s1], p2 = POLARITY[s2];
  if (p1 === p2 && p1 === 'Yang') return 'With two assertive Yang signs, the failure mode at work is a turf war — agree who owns which call before egos collide.';
  if (p1 === p2 && p1 === 'Yin') return 'With two steady Yin signs, the risk is that decisions stall while you both wait for consensus — appoint a tie-breaker in advance.';
  return 'The Yang–Yin balance helps here: one of you pushes and the other absorbs, so friction rarely escalates as long as both feel heard.';
}

/** LOVE — driven by ruling planets + element heat + polarity. */
export function loveProse(s1: Sign, s2: Sign): string {
  const heat1 = ELEMENT_HEAT[ELEMENT[s1]], heat2 = ELEMENT_HEAT[ELEMENT[s2]];
  const sameEl = ELEMENT[s1] === ELEMENT[s2];
  const elLine = sameEl
    ? `Romantically you speak the same language — both ${heat1} — so attraction is instant and the heat is easy to sustain; the work is keeping enough contrast alive to stay intrigued.`
    : `In romance ${s1} runs ${heat1} while ${s2} is ${heat2}, so the spark comes from difference — learning to want in each other’s register is the whole art of it.`;
  return `${s1} brings ${PLANET_DESIRE[s1]}; ${s2} brings ${PLANET_DESIRE[s2]}. ${elLine} ${polarityLoveNote(s1, s2)}`;
}

/** FRIENDSHIP — driven by element affinity + aspect ease (planets muted). */
export function friendshipProse(s1: Sign, s2: Sign): string {
  const sameEl = ELEMENT[s1] === ELEMENT[s2];
  const elLine = sameEl
    ? `As friends you share the ${ELEMENT[s1]} temperament — you recharge the same way and rarely have to translate yourselves to each other.`
    : `${ELEMENT[s1]} and ${ELEMENT[s2]} approach downtime differently, so a ${s1}–${s2} friendship widens both your worlds rather than echoing them back.`;
  return `Strip away romance and the ego stakes drop, which is why many ${s1}–${s2} pairs are better friends than the love scores suggest. ${elLine} ${ASPECT_EASE[signDistance(s1, s2)]}`;
}

/** WORK — driven by modality roles + polarity as the conflict engine. */
export function workProse(s1: Sign, s2: Sign): string {
  const m1 = MODALITY[s1], m2 = MODALITY[s2];
  const roleLine = m1 === m2
    ? `Both are ${m1} signs, so you’re each ${MODALITY_ROLE[m1]} — powerful when you’re rowing the same way, gridlocked when you’re not, because neither naturally yields the role the other also wants.`
    : `${s1} is ${m1} (${MODALITY_ROLE[m1]}) and ${s2} is ${m2} (${MODALITY_ROLE[m2]}), a genuinely complementary split — one of you gets the project moving and the other carries it home.`;
  return `At work the story is about roles, not romance. ${roleLine} ${polarityWorkNote(s1, s2)}`;
}

/** Fast top-of-page verdict — where you click / where you clash. */
export function clicksAndClashes(s1: Sign, s2: Sign): { click: string; clash: string } {
  const sameEl = ELEMENT[s1] === ELEMENT[s2];
  const dist = signDistance(s1, s2);
  const click = sameEl
    ? `A shared ${ELEMENT[s1]} wavelength — you get each other without explaining.`
    : dist === 6
      ? 'Opposite-sign magnetism — you each supply what the other lacks.'
      : dist === 2 || dist === 4
        ? 'An easy, low-friction angle that makes cooperation feel natural.'
        : 'Real difference that keeps things interesting when you respect it.';
  const clash = MODALITY[s1] === MODALITY[s2]
    ? `Two ${MODALITY[s1]} signs digging in — compromise is the muscle to train.`
    : dist === 3
      ? 'A square’s built-in friction — pace and priorities need negotiating.'
      : POLARITY[s1] === POLARITY[s2]
        ? `Same-polarity ${POLARITY[s1]} signs both wanting the same role.`
        : 'Different speeds — patience is the price of the balance.';
  return { click, clash };
}

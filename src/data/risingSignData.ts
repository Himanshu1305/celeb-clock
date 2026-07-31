// src/data/risingSignData.ts — simplified rising-sign (ascendant) model.
// The exact ascendant needs the precise birth time AND birth latitude/longitude to
// find which sign was on the eastern horizon. Without a full ephemeris we use the
// standard 2-hour-block approximation taught in beginner astrology: the ascendant
// equals the Sun sign at sunrise (~6am) and advances one sign roughly every two
// hours. It is an APPROXIMATION — see RISING_DISCLAIMER — but it is the same table
// most "rising sign by birth time" tools use, and it is honest about its limits.

export interface RisingSignInfo {
  name: string;
  slug: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  ruler: string;
  // The rising sign is the "mask" — the first impression and outward style.
  firstImpression: string;   // how others read you on first meeting
  appearance: string;        // classic physical/energetic signature (kept light, non-deterministic)
  approach: string;          // how you meet the world / new situations
}

// Aries → Pisces, in zodiacal order (index 0..11). The ascendant math walks this ring.
export const SIGN_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export const RISING_SIGN_DATA: Record<string, RisingSignInfo> = {
  Aries: {
    name: 'Aries', slug: 'aries', symbol: '♈︎', element: 'Fire', ruler: 'Mars',
    firstImpression: 'People meet you as direct, energetic and quick off the mark — you seem ready to lead before anyone else has decided to move.',
    appearance: 'An Aries rising often carries a brisk, athletic energy and a head-first way of entering a room.',
    approach: 'You approach new situations as challenges to be taken on immediately, trusting instinct over deliberation.',
  },
  Taurus: {
    name: 'Taurus', slug: 'taurus', symbol: '♉︎', element: 'Earth', ruler: 'Venus',
    firstImpression: 'You come across as calm, grounded and reassuringly steady — the person others instinctively trust to stay unflustered.',
    appearance: 'Taurus rising tends to project warmth, ease and a settled, sensual presence.',
    approach: 'You meet the world slowly and deliberately, preferring comfort and certainty to sudden change.',
  },
  Gemini: {
    name: 'Gemini', slug: 'gemini', symbol: '♊︎', element: 'Air', ruler: 'Mercury',
    firstImpression: 'Curious, chatty and quick-witted — you seem to know a little about everything and put people at ease with conversation.',
    appearance: 'Gemini rising reads as youthful, expressive and animated, often talking with the hands.',
    approach: 'You approach the new by asking questions and gathering information, keeping your options open.',
  },
  Cancer: {
    name: 'Cancer', slug: 'cancer', symbol: '♋︎', element: 'Water', ruler: 'the Moon',
    firstImpression: 'You give a gentle, protective, emotionally attuned first impression — approachable but quietly guarded until you feel safe.',
    appearance: 'Cancer rising often has a soft, nurturing presence and an expressive, feeling face.',
    approach: 'You feel your way into new situations, reading the emotional temperature before committing.',
  },
  Leo: {
    name: 'Leo', slug: 'leo', symbol: '♌︎', element: 'Fire', ruler: 'the Sun',
    firstImpression: 'Warm, confident and hard to miss — you seem to light up a space and draw attention without asking for it.',
    appearance: 'Leo rising carries a dramatic, dignified presence, often with memorable hair or a bright smile.',
    approach: 'You meet the world generously and expressively, expecting to be seen and to make an impression.',
  },
  Virgo: {
    name: 'Virgo', slug: 'virgo', symbol: '♍︎', element: 'Earth', ruler: 'Mercury',
    firstImpression: 'Composed, observant and precise — you seem thoughtful and quietly capable, noticing details others miss.',
    appearance: 'Virgo rising reads as neat, understated and self-contained, with an alert, considered manner.',
    approach: 'You approach the new analytically, wanting to understand how things work before you engage.',
  },
  Libra: {
    name: 'Libra', slug: 'libra', symbol: '♎︎', element: 'Air', ruler: 'Venus',
    firstImpression: 'Charming, gracious and easy to like — you seem to smooth situations and make others feel considered.',
    appearance: 'Libra rising often has a balanced, pleasant presence and an instinct for style and harmony.',
    approach: 'You meet the world through relationship, weighing others’ views and seeking fairness and rapport.',
  },
  Scorpio: {
    name: 'Scorpio', slug: 'scorpio', symbol: '♏︎', element: 'Water', ruler: 'Mars & Pluto',
    firstImpression: 'Intense, magnetic and hard to read — you give little away at first, and people sense depth beneath the surface.',
    appearance: 'Scorpio rising carries a penetrating, self-possessed presence, often with a steady, direct gaze.',
    approach: 'You approach the new cautiously and observantly, holding back until you have taken someone’s measure.',
  },
  Sagittarius: {
    name: 'Sagittarius', slug: 'sagittarius', symbol: '♐︎', element: 'Fire', ruler: 'Jupiter',
    firstImpression: 'Open, optimistic and frank — you seem adventurous and free, quick to laugh and to say what you think.',
    appearance: 'Sagittarius rising reads as expansive and casual, with a restless, on-the-move energy.',
    approach: 'You meet the world as an explorer, drawn to whatever is new, wide-ranging or full of possibility.',
  },
  Capricorn: {
    name: 'Capricorn', slug: 'capricorn', symbol: '♑︎', element: 'Earth', ruler: 'Saturn',
    firstImpression: 'Serious, capable and self-controlled — you give an impression of maturity and quiet authority.',
    appearance: 'Capricorn rising often has a reserved, dignified bearing that can seem older than its years.',
    approach: 'You approach the new methodically and responsibly, thinking about structure, cost and the long game.',
  },
  Aquarius: {
    name: 'Aquarius', slug: 'aquarius', symbol: '♒︎', element: 'Air', ruler: 'Saturn & Uranus',
    firstImpression: 'Original, friendly and slightly detached — you seem like your own person, marching to a private drum.',
    appearance: 'Aquarius rising reads as distinctive and unconventional, comfortable standing a little apart.',
    approach: 'You meet the world through ideas and principles, curious about people but keeping some independence.',
  },
  Pisces: {
    name: 'Pisces', slug: 'pisces', symbol: '♓︎', element: 'Water', ruler: 'Jupiter & Neptune',
    firstImpression: 'Gentle, dreamy and empathetic — you give a soft, receptive first impression and seem to feel what others feel.',
    appearance: 'Pisces rising often has a fluid, otherworldly presence and expressive, faraway eyes.',
    approach: 'You approach the new intuitively and adaptively, flowing around obstacles rather than confronting them.',
  },
};

export const RISING_DISCLAIMER =
  'This is an approximation. Your exact rising sign (ascendant) depends on your precise birth time AND birth location, because it is the zodiac sign rising over the eastern horizon at the moment you were born. This tool uses the standard simplified 2-hour-block table (ascendant ≈ your Sun sign at ~6am, advancing one sign roughly every two hours). It is a good starting point, but for an exact ascendant you need a full birth chart calculated with your birth time and place. Your birth time is used only in your browser to do this calculation — it is never sent anywhere or stored.';

/**
 * Simplified ascendant: start from the Sun sign at sunrise (~6am) and advance one
 * sign per two hours of local birth time. hour is 0–23 (local birth-place time).
 */
export function calculateRisingSign(sunSign: string, hour: number): RisingSignInfo {
  const sunIdx = SIGN_ORDER.indexOf(sunSign as typeof SIGN_ORDER[number]);
  const base = sunIdx < 0 ? 0 : sunIdx;
  const blocks = Math.floor((((hour - 6) % 24) + 24) % 24 / 2); // 0..11
  const idx = (base + blocks) % 12;
  return RISING_SIGN_DATA[SIGN_ORDER[idx]];
}

export function getRisingSign(slug: string): RisingSignInfo | undefined {
  return Object.values(RISING_SIGN_DATA).find(r => r.slug === slug);
}

/**
 * Batch 10 — plain-language text for the Kundali's Yogini Dasha and Ashtakavarga sections.
 *
 * Yogini meanings (opened 29 Oct 2026), paraphrased in calm, plain English:
 *   vedicmarga.com/yogini-dasha/ — nature (benefic / malefic) and described results per Yogini;
 *   satyori.com/jyotish/dasha/yogini/ — Mangala, Dhanya, Bhadrika, Siddha (16 yrs) the gentler stretches,
 *     Pingala, Bhramari, Ulka, Sankata (20 yrs) the more testing ones;
 *   dekhopanchang.com/en/learn/modules/11-2 — themes per Yogini (agrees with the above).
 * Ashtakavarga guidance:
 *   dekhopanchang.com/en/learn/ashtakavarga — "Signs scoring 28 or above in SAV are considered strong",
 *     "below 25 are weak"; a planet transiting a sign where it has 4 or more bindus in its BAV is favourable;
 *   onlinejyotish.com lesson 113 — above 28 strong, 25–28 average, below 25 weak.
 * House themes: the same list as the glossary's "bhava" entry (termDefinitions.ts).
 */

export interface YoginiMeta {
  name: string;
  lord: string;
  years: number;
  /** 'gentle' = classically benefic Yogini; 'testing' = classically malefic — phrased with care. */
  tone: 'gentle' | 'testing';
  meaning: string;
  guidance: string;
}

export const YOGINI_META: Record<string, YoginiMeta> = {
  Mangala: { name: 'Mangala', lord: 'Moon', years: 1, tone: 'gentle',
    meaning: 'Comfort, a settled mind, happiness at home and closer family ties.',
    guidance: 'A good time to look after home life and the people close to you.' },
  Pingala: { name: 'Pingala', lord: 'Sun', years: 2, tone: 'testing',
    meaning: 'Authority, your father and dealings with government or seniors — recognition when the Sun is strong in your chart, some friction with people in charge when it is weaker.',
    guidance: 'Keep relations with bosses and officials polite and paperwork in order.' },
  Dhanya: { name: 'Dhanya', lord: 'Jupiter', years: 3, tone: 'gentle',
    meaning: 'Income, learning, children, teachers and faith — gains that come slower if Jupiter is weak in your chart.',
    guidance: 'A good stretch for study, saving and guidance from teachers or elders.' },
  Bhramari: { name: 'Bhramari', lord: 'Mars', years: 4, tone: 'testing',
    meaning: 'Travel, moving, new ventures and a restless, driven energy — productive when channelled.',
    guidance: 'Put the energy into one clear project; avoid hasty arguments and take extra care on the road.' },
  Bhadrika: { name: 'Bhadrika', lord: 'Mercury', years: 5, tone: 'gentle',
    meaning: 'Study, trade, writing, friendships and skilled work.',
    guidance: 'A good time to learn a skill, write, or build a business network — keep efforts focused.' },
  Ulka: { name: 'Ulka', lord: 'Saturn', years: 6, tone: 'testing',
    meaning: 'Hard work, duty and some delays — results come slowly, but what is earned tends to last.',
    guidance: 'Steady routines, patience and honest effort work best; elders may need more of your support.' },
  Siddha: { name: 'Siddha', lord: 'Venus', years: 7, tone: 'gentle',
    meaning: 'Success in work, comfort, art and relationships.',
    guidance: 'Enjoy it and invest in relationships and creative work — just avoid overdoing comforts.' },
  Sankata: { name: 'Sankata', lord: 'Rahu', years: 8, tone: 'testing',
    meaning: 'A period of change and unconventional paths — ambition and sudden shifts in the first half, a more inward, reflective mood in the second.',
    guidance: 'Plan carefully, keep finances and routines steady, and take big decisions slowly.' },
};

/** Life-area theme of each house (1–12), as in the glossary's Bhava entry. */
export const HOUSE_THEMES = [
  'self & health', 'money & family', 'courage & siblings', 'home & mother', 'children & creativity',
  'daily work & health', 'marriage & partners', 'change & shared resources', 'luck & higher learning',
  'career', 'gains & friends', 'expenses & letting go',
];

export const SAV_STRONG = 28;
export const SAV_WEAK = 25;

export type SavBand = 'strong' | 'average' | 'lighter';
export function savBand(points: number): SavBand {
  if (points >= SAV_STRONG) return 'strong';
  if (points >= SAV_WEAK) return 'average';
  return 'lighter';
}
export const SAV_BAND_LABEL: Record<SavBand, string> = {
  strong: 'Well supported',
  average: 'Average',
  lighter: 'Needs steadier effort',
};

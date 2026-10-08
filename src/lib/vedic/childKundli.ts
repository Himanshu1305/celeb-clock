/**
 * Child (Bal) Kundli composer — Growth P2 (P2-2, improvements GP2-CHILD-KUNDLI).
 *
 * Builds a calm, parent-facing reading from the shared /api/kundali response
 * (client-side; no new engine). Rule 7 throughout — especially the health
 * section, which is "areas to care for" wellbeing guidance ONLY, never "your
 * child will be ill", never anything that could sway a medical decision, and
 * always points to the paediatrician. Temperament/learning/talents are gentle
 * tendencies, not labels; favourable periods are windows, never fixed events.
 */
import { GANA, NADI } from './nakshatraAttributes';
import { NAKSHATRA_AKSHARAS } from '@/data/nakshatraAksharas';
import { computeMoolDosha, type DoshaChartInput } from './moreDoshas';

interface KundaliLike {
  rashi?: string;
  nakshatra?: { nakshatra: string; pada: number };
  planets?: Array<{ name: string; signIndex: number; house: number; longitude: number }>;
  dashaTimeline?: Array<{ lord: string; start: string; end: string }>;
}

export interface ChildSection { title: string; body: string }
export interface ChildKundli {
  temperament: ChildSection;
  learning: ChildSection;
  talents: ChildSection;
  health: ChildSection;      // wellbeing framing only
  favourablePeriods: ChildSection;
  nameLetters: { title: string; aksharas: string[]; note: string };
  doshas: ChildSection;
  support: ChildSection;      // how to support your child
  disclaimer: string;
}

const GANA_TEMPERAMENT: Record<string, string> = {
  Deva: 'a gentle, cheerful and cooperative temperament — children with this birth star are often sensitive to harmony, kind-hearted and eager to please.',
  Manushya: 'a balanced, people-oriented temperament — a blend of drive and empathy, usually sociable and quick to find their place among others.',
  Rakshasa: 'a strong-willed, independent and determined temperament — plenty of energy and a mind of their own, which flourishes with clear, loving structure and good outlets.',
};

// Gentle, qualitative notes for a planet occupying the learning houses (4th/5th).
const LEARNING_NOTE: Record<string, string> = {
  Mercury: 'quick comprehension, language and numbers',
  Jupiter: 'a love of knowledge, ethics and the big picture',
  Venus: 'the arts, aesthetics and harmony',
  Moon: 'imagination, memory and emotional learning',
  Sun: 'confidence, leadership and a wish to shine',
  Mars: 'energy, courage and hands-on, practical learning',
  Saturn: 'patience, depth and a methodical, persevering style',
  Rahu: 'originality and an unconventional, curious streak',
  Ketu: 'intuition and a reflective, inward way of learning',
};

const PLANET_TALENT: Record<string, string> = {
  Sun: 'leadership and performance', Moon: 'care, imagination and the public touch',
  Mars: 'sport, engineering and hands-on skill', Mercury: 'writing, speaking and problem-solving',
  Jupiter: 'teaching, counsel and philosophy', Venus: 'art, music and design',
  Saturn: 'craft, structure and long-form focus', Rahu: 'invention and bold new fields', Ketu: 'research and the intuitive arts',
};

export function buildChildKundli(data: KundaliLike): ChildKundli | null {
  const nak = data.nakshatra?.nakshatra;
  if (!nak || !data.planets?.length) return null;
  const gana = GANA[nak] || 'Manushya';
  const occ = (house: number) => data.planets!.filter(p => p.house === house).map(p => p.name);
  const fourth = occ(4), fifth = occ(5);

  const learningPlanets = [...new Set([...fourth, ...fifth])];
  const learningBody = learningPlanets.length
    ? `With ${learningPlanets.join(' and ')} touching the learning houses (4th foundation, 5th intelligence), your child\'s learning is coloured by ${learningPlanets.map(p => LEARNING_NOTE[p]).filter(Boolean).join('; ')}. Every child learns in their own way — treat this as a hint about what may come easily, not a limit.`
    : 'No planet sits directly in the learning houses, which simply means no single style dominates — a flexible learner. Follow what genuinely sparks their curiosity.';

  const talentPlanets = fifth.length ? fifth : (data.planets.find(p => p.house === 1) ? [data.planets.find(p => p.house === 1)!.name] : []);
  const talentBody = talentPlanets.length
    ? `The 5th house (creativity and self-expression) and the chart\'s prominent planets point gently toward ${talentPlanets.map(p => PLANET_TALENT[p]).filter(Boolean).join(', ')}. Offer a range of activities and watch which they light up with.`
    : 'A broad, open field of talents — the best approach is variety, letting their own enthusiasm reveal where they shine.';

  // Mool / gandanta note (calm) via the shared engine.
  const input: DoshaChartInput = { planets: data.planets.map(p => ({ name: p.name, signIndex: p.signIndex, house: p.house, longitude: p.longitude })), moonNakshatra: nak, moonPada: data.nakshatra!.pada };
  const mool = computeMoolDosha(input);
  const doshaBody = mool.present
    ? `Your child\'s Moon is in ${mool.nakshatra}, one of the six mool/gandanta birth stars. ${mool.detail} This has NO medical meaning and says nothing about your child\'s health — it is a cultural/astrological note only.`
    : `Your child\'s Moon is in ${nak}, not a mool/gandanta star, so there is no Mool-dosha consideration. The ${NADI[nak] || 'Adi'} Nadi is a matching factor for much later in life, nothing to act on now.`;

  // Favourable childhood periods from the Dasha (benefic framing, windows not events).
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmt = (iso: string) => { const d = new Date(iso); return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
  const BENEFIC = new Set(['Jupiter', 'Venus', 'Mercury', 'Moon']);
  const favWindows = (data.dashaTimeline || []).filter(m => BENEFIC.has(m.lord)).slice(0, 3)
    .map(m => `${m.lord} period (${fmt(m.start)} – ${fmt(m.end)}) — classically a supportive stretch for growth, confidence and learning`);
  const favBody = favWindows.length
    ? `Looking at the running Vimshottari Dasha, some naturally supportive windows through childhood and youth: ${favWindows.join('; ')}. These are gentle tailwinds, not fixed events — every period has its own gifts.`
    : 'The early Dasha periods set a steady tone; focus on consistency and warmth rather than any single "best" window.';

  return {
    temperament: { title: 'Temperament', body: `Your child\'s Moon sits in ${data.rashi || 'their Moon sign'}, in the ${nak} birth star — a ${gana} (${gana === 'Deva' ? 'divine' : gana === 'Manushya' ? 'human' : 'intense'}) nature. This suggests ${GANA_TEMPERAMENT[gana]}` },
    learning: { title: 'Learning & education', body: learningBody },
    talents: { title: 'Natural talents', body: talentBody },
    health: { title: 'Health & wellbeing — areas to care for', body: `This is gentle wellbeing guidance, never a diagnosis or a prediction of illness. Like every child, yours thrives on steady sleep, nourishing food, active play and lots of warmth. ${gana === 'Rakshasa' ? 'With a high-energy birth star, plenty of physical outlets and a calm bedtime routine help most.' : gana === 'Deva' ? 'With a sensitive birth star, a gentle, reassuring routine and room to recharge help most.' : 'A balanced routine of activity and rest suits them well.'} Nothing here should influence any health decision — for anything at all about your child\'s health, your paediatrician is the only right source.` },
    favourablePeriods: { title: 'Favourable periods through childhood', body: favBody },
    nameLetters: { title: 'Auspicious name-starting sounds', aksharas: NAKSHATRA_AKSHARAS[nak] || [], note: `Traditionally a child born in ${nak} is given a name beginning with one of these sounds. It is a lovely custom, entirely optional.` },
    doshas: { title: 'Doshas — calmly', body: doshaBody },
    support: { title: 'How to support your child', body: `${gana === 'Deva' ? 'Lead with warmth and encouragement; this nature responds to gentleness far more than pressure, and needs reassurance that it is safe to be sensitive.' : gana === 'Rakshasa' ? 'Give clear, loving boundaries and real outlets for their big energy and strong will — channelled well, that intensity becomes drive and leadership.' : 'Balance encouragement with responsibility; this nature grows when trusted with real tasks and treated as capable.'} Above all, let their own enthusiasm lead — the chart is a starting hint, never a script for who your child must become.` },
    disclaimer: 'A Child (Bal) Kundli is a gentle, traditional lens on tendencies — never a fixed verdict on your child\'s future, abilities or health. It must never influence a medical, educational or parenting decision against your own judgement or your paediatrician\'s advice.',
  };
}

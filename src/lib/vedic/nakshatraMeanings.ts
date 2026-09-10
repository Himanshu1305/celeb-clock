/**
 * Nakshatra meanings reference (Part G.0). For all 27 Nakshatras: presiding deity,
 * symbol, ruling planet (Vimshottari lord), the classical "Shakti" (special power),
 * a plain-language distinctive meaning, and an HONEST significance level.
 *
 * Sources (multi-source verification, the project standard):
 * - Deity / symbol / ruling planet: canonical Brihat Parashara Hora Shastra
 *   assignments (consistent across all sources).
 * - Shakti (distinctive power): the classical Shakti list (Frawley/Harness lineage;
 *   vedanet.com/shaktis-of-the-nakshatras).
 * - Significance level: grounded in the classical Muhurta 7-fold nature
 *   (drikpanchang Nakshatra classification: Dhruva/Sthira, Chara, Ugra, Kshipra,
 *   Mridu, Tikshna, Mishra) + standout reputations (Pushya = "King of Nakshatras",
 *   most auspicious per BPHS & Muhurta Chintamani).
 *
 * ANTI-INFLATION RULE (explicit project requirement): significance is NOT uniform.
 * Only genuinely standout Nakshatras are 'exceptional'; the classical "Mishra"
 * (mixed) ones (Krittika, Vishakha) are 'neutral'; intense/fierce ones are 'intense'
 * (framed constructively, never as "bad"). Do not manufacture significance.
 */

export type NakshatraSignificance = 'exceptional' | 'favorable' | 'neutral' | 'intense';

export interface NakshatraMeaning {
  name: string;
  deity: string;
  symbol: string;
  rulingPlanet: string;      // Vimshottari lord
  muhurta: string;           // classical activity-nature category
  shakti: string;            // distinctive classical power
  meaning: string;           // 1-2 sentence plain-language, distinctive
  significance: NakshatraSignificance;
}

// Ordered Ashwini → Revati (matches engine NAKSHATRA_NAMES).
export const NAKSHATRA_MEANINGS: Record<string, NakshatraMeaning> = {
  Ashwini: { name: 'Ashwini', deity: 'the Ashwini Kumaras (divine physicians)', symbol: "a horse's head", rulingPlanet: 'Ketu', muhurta: 'Kshipra (swift)', shakti: 'the power to quickly reach things and heal', meaning: 'The first Nakshatra — fast-moving, pioneering and healing, associated with fresh starts, speed and quick recovery.', significance: 'favorable' },
  Bharani: { name: 'Bharani', deity: 'Yama (lord of restraint and death)', symbol: 'the yoni (womb)', rulingPlanet: 'Venus', muhurta: 'Ugra (fierce)', shakti: 'the power to take things away, to bear and transform', meaning: 'A Nakshatra of intense creative and moral force — it carries themes of birth, endurance and the discipline of consequences.', significance: 'intense' },
  Krittika: { name: 'Krittika', deity: 'Agni (fire)', symbol: 'a razor or flame', rulingPlanet: 'Sun', muhurta: 'Mishra (mixed)', shakti: 'the power to burn and purify', meaning: 'A sharp, purifying Nakshatra of fire and cutting clarity; classically "mixed" in nature — capable of both nourishing warmth and burning critique.', significance: 'neutral' },
  Rohini: { name: 'Rohini', deity: 'Brahma / Prajapati (the creator)', symbol: 'a cart or chariot', rulingPlanet: 'Moon', muhurta: 'Dhruva (fixed)', shakti: 'the power of growth and creation', meaning: 'Traditionally the Moon’s favourite Nakshatra — fertile, beautiful and growth-giving, strongly associated with abundance, sensual richness and material flourishing.', significance: 'exceptional' },
  Mrigashira: { name: 'Mrigashira', deity: 'Soma (the Moon god)', symbol: "a deer's head", rulingPlanet: 'Mars', muhurta: 'Mridu (tender)', shakti: 'the power of seeking and giving fulfilment', meaning: 'A gentle, searching Nakshatra of curiosity and quest — restless, refined and drawn to explore, learn and find what fulfils.', significance: 'favorable' },
  Ardra: { name: 'Ardra', deity: 'Rudra (the storm god)', symbol: 'a teardrop', rulingPlanet: 'Rahu', muhurta: 'Tikshna (sharp)', shakti: 'the power of effort that clears the way, through storm', meaning: 'A stormy, transformative Nakshatra — emotional intensity and upheaval that washes the old away to make room for renewal.', significance: 'intense' },
  Punarvasu: { name: 'Punarvasu', deity: 'Aditi (mother of the gods)', symbol: 'a quiver of arrows', rulingPlanet: 'Jupiter', muhurta: 'Chara (movable)', shakti: 'the power to gain wealth or substance again', meaning: 'A Nakshatra of return, renewal and safe repetition — resilient and optimistic, associated with recovery, homecoming and second chances.', significance: 'favorable' },
  Pushya: { name: 'Pushya', deity: 'Brihaspati (guru of the gods)', symbol: 'a cow’s udder / lotus', rulingPlanet: 'Saturn', muhurta: 'Kshipra (swift)', shakti: 'the power to nourish and create spiritual energy', meaning: 'Classically called the "King of Nakshatras" and the single most auspicious of the 27 — a rare blend of Saturn’s discipline and Jupiter’s wisdom, traditionally favoured above all others for beginning important ventures.', significance: 'exceptional' },
  Ashlesha: { name: 'Ashlesha', deity: 'the Nagas (serpent deities)', symbol: 'a coiled serpent', rulingPlanet: 'Mercury', muhurta: 'Tikshna (sharp)', shakti: 'the power to entwine, with penetrating (serpentine) insight', meaning: 'A sharp, penetrating Nakshatra of hypnotic insight and deep instinct — perceptive and strategic, with intense, kundalini-like inner power.', significance: 'intense' },
  Magha: { name: 'Magha', deity: 'the Pitris (ancestors)', symbol: 'a royal throne', rulingPlanet: 'Ketu', muhurta: 'Ugra (fierce)', shakti: 'the power of ancestral authority and change of state', meaning: 'A regal Nakshatra of lineage, tradition and inherited status — dignified and ceremonial, deeply connected to ancestors and legacy.', significance: 'favorable' },
  'Purva Phalguni': { name: 'Purva Phalguni', deity: 'Bhaga (god of delight and fortune)', symbol: 'the front legs of a bed', rulingPlanet: 'Venus', muhurta: 'Ugra (fierce)', shakti: 'the power of procreation and enjoyment', meaning: 'A Nakshatra of pleasure, romance and creative rest — warm and generous, associated with relaxation, affection and the enjoyment of life.', significance: 'favorable' },
  'Uttara Phalguni': { name: 'Uttara Phalguni', deity: 'Aryaman (god of contracts and friendship)', symbol: 'the back legs of a bed', rulingPlanet: 'Sun', muhurta: 'Dhruva (fixed)', shakti: 'the giving of prosperity through union / partnership', meaning: 'A steady, dignified Nakshatra of friendship, contracts and marriage — reliable and generous, associated with prosperity earned through partnership and social responsibility.', significance: 'favorable' },
  Hasta: { name: 'Hasta', deity: 'Savitar (the Sun as inspirer)', symbol: 'a hand', rulingPlanet: 'Moon', muhurta: 'Kshipra (swift)', shakti: 'the power to place what is sought into one’s hands', meaning: 'A skilful, dexterous Nakshatra of craft and cleverness — hands-on and resourceful, associated with practical skill, wit and the ability to manifest goals.', significance: 'favorable' },
  Chitra: { name: 'Chitra', deity: 'Tvashtar / Vishwakarma (the divine architect)', symbol: 'a bright jewel or pearl', rulingPlanet: 'Mars', muhurta: 'Mridu (tender)', shakti: 'the power to accumulate lustre and merit', meaning: 'A brilliant, design-oriented Nakshatra of beauty and craftsmanship — charismatic and artistic, drawn to create things of striking form and shine.', significance: 'favorable' },
  Swati: { name: 'Swati', deity: 'Vayu (the wind god)', symbol: 'a young sprout swaying in the wind', rulingPlanet: 'Rahu', muhurta: 'Chara (movable)', shakti: 'the power to scatter and move like the wind', meaning: 'An independent, adaptable Nakshatra of self-reliance and movement — flexible and freedom-loving, associated with trade, diplomacy and going one’s own way.', significance: 'favorable' },
  Vishakha: { name: 'Vishakha', deity: 'Indra-Agni (power and fire)', symbol: 'a triumphal archway', rulingPlanet: 'Jupiter', muhurta: 'Mishra (mixed)', shakti: 'the power to achieve many and varied fruits', meaning: 'A goal-driven, determined Nakshatra of focused ambition; classically "mixed" in nature — great achievement is possible, but often through single-minded, sometimes restless striving.', significance: 'neutral' },
  Anuradha: { name: 'Anuradha', deity: 'Mitra (god of friendship)', symbol: 'a lotus', rulingPlanet: 'Saturn', muhurta: 'Mridu (tender)', shakti: 'the power of worship, devotion and friendship', meaning: 'A warm, cooperative Nakshatra of devotion and loyal friendship — able to build bonds and thrive far from home through steady, sincere connection.', significance: 'favorable' },
  Jyeshtha: { name: 'Jyeshtha', deity: 'Indra (king of the gods)', symbol: 'an earring / talisman', rulingPlanet: 'Mercury', muhurta: 'Tikshna (sharp)', shakti: 'the power to rise and gain courage in battle', meaning: 'A sharp, senior Nakshatra of seniority and hard-won responsibility — courageous and protective, carrying the weight and isolation that can come with authority.', significance: 'intense' },
  Mula: { name: 'Mula', deity: 'Nirriti (goddess of dissolution)', symbol: 'a bunch of tied roots', rulingPlanet: 'Ketu', muhurta: 'Tikshna (sharp)', shakti: 'the power to ruin in order to reach the root', meaning: 'A deep, investigative Nakshatra that gets to the root of things — philosophical and truth-seeking, often through dismantling the surface to find what is foundational.', significance: 'intense' },
  'Purva Ashadha': { name: 'Purva Ashadha', deity: 'Apas (the cosmic waters)', symbol: 'a fan / winnowing basket', rulingPlanet: 'Venus', muhurta: 'Ugra (fierce)', shakti: 'the power of invigoration and rising energy', meaning: 'An "unconquerable" Nakshatra of conviction and buoyant confidence — persuasive and idealistic, associated with steady rising influence.', significance: 'favorable' },
  'Uttara Ashadha': { name: 'Uttara Ashadha', deity: 'the Vishvedevas (universal gods)', symbol: 'an elephant’s tusk', rulingPlanet: 'Sun', muhurta: 'Dhruva (fixed)', shakti: 'the power to grant unchallengeable, lasting victory', meaning: 'A Nakshatra of lasting achievement and integrity — patient and principled, associated with success that endures because it is earned the right way.', significance: 'favorable' },
  Shravana: { name: 'Shravana', deity: 'Vishnu (the preserver)', symbol: 'an ear / three footprints', rulingPlanet: 'Moon', muhurta: 'Chara (movable)', shakti: 'the power of connection through listening', meaning: 'A receptive Nakshatra of listening, learning and knowledge — wise and well-connected, associated with study, counsel and the preservation of tradition.', significance: 'favorable' },
  Dhanishtha: { name: 'Dhanishtha', deity: 'the eight Vasus (gods of abundance)', symbol: 'a drum', rulingPlanet: 'Mars', muhurta: 'Chara (movable)', shakti: 'the power to give abundance and fame', meaning: 'A rhythmic, prosperous Nakshatra of wealth, music and reputation — energetic and generous, associated with fame, group success and material abundance.', significance: 'favorable' },
  Shatabhisha: { name: 'Shatabhisha', deity: 'Varuna (god of cosmic waters and law)', symbol: 'an empty circle / a hundred healers', rulingPlanet: 'Rahu', muhurta: 'Chara (movable)', shakti: 'the power of healing and making whole', meaning: 'A secretive, healing Nakshatra of research and mysticism — independent and unconventional, drawn to medicine, hidden knowledge and solitary insight.', significance: 'favorable' },
  'Purva Bhadrapada': { name: 'Purva Bhadrapada', deity: 'Aja Ekapada (the one-footed goat)', symbol: 'a sword / a two-faced man', rulingPlanet: 'Jupiter', muhurta: 'Ugra (fierce)', shakti: 'the fire that raises spiritual persons', meaning: 'An intense, idealistic Nakshatra of spiritual fire and unconventional vision — passionate and penetrating, capable of profound transformation and extremes.', significance: 'intense' },
  'Uttara Bhadrapada': { name: 'Uttara Bhadrapada', deity: 'Ahir Budhnya (serpent of the deep)', symbol: 'twins / a serpent in water', rulingPlanet: 'Saturn', muhurta: 'Dhruva (fixed)', shakti: 'the power to bring rain and cosmic stability', meaning: 'A deep, steadying Nakshatra of wisdom and calm — patient and compassionate, associated with depth, stability and quiet spiritual strength.', significance: 'favorable' },
  Revati: { name: 'Revati', deity: 'Pushan (the nourisher, protector of travellers)', symbol: 'a fish / a drum', rulingPlanet: 'Mercury', muhurta: 'Mridu (tender)', shakti: 'the power of nourishment, symbolised by milk', meaning: 'The final, gentle Nakshatra of nourishment and safe passage — kind, protective and all-embracing, associated with completion, generosity and care for others.', significance: 'favorable' },
};

/** Look up a Nakshatra meaning by name (tolerant of minor spelling). */
export function getNakshatraMeaning(name: string): NakshatraMeaning | null {
  if (!name) return null;
  if (NAKSHATRA_MEANINGS[name]) return NAKSHATRA_MEANINGS[name];
  const key = Object.keys(NAKSHATRA_MEANINGS).find(k => k.toLowerCase() === name.toLowerCase());
  return key ? NAKSHATRA_MEANINGS[key] : null;
}

/** A short line for prompts/UI: distinctive meaning + honest significance framing. */
export function nakshatraMeaningLine(name: string): string | null {
  const m = getNakshatraMeaning(name);
  if (!m) return null;
  const sig = m.significance === 'exceptional' ? ' (classically one of the most auspicious Nakshatras)'
    : m.significance === 'neutral' ? ' (a classically "mixed"/neutral Nakshatra — not considered especially auspicious or inauspicious)'
    : m.significance === 'intense' ? ' (an intense, transformative Nakshatra — powerful rather than simply "good" or "bad")'
    : '';
  return `${m.name} — ruled by ${m.rulingPlanet}, deity ${m.deity}, symbol ${m.symbol}. ${m.meaning}${sig}`;
}

/**
 * Additional dosha engine — Growth P2 (P2-9, improvements GP2-DOSHAS).
 *
 * Computes Pitra, Mool (Mula)-Nakshatra, Grahan and standalone Nadi readings
 * from the planetary data the shared /api/kundali endpoint already returns — so
 * no engine change and no cache-versioning risk (RC3 Item 2 caution). All are
 * CLASSICAL readings of one tradition, graded strong/moderate/mild and framed
 * calmly (Rule 7): a pattern to understand, never a verdict, never a fear-based
 * paid "fix". Grahan and Pitra use whole-sign conjunction (the mainstream
 * computable rule), with the degree gap used only to grade intensity.
 */
import { NADI, nakshatraIndex } from './nakshatraAttributes';

export type DoshaGrade = 'strong' | 'moderate' | 'mild' | 'none';

export interface DoshaPlanet {
  name: string;
  signIndex: number; // 1-based 1..12
  house: number;     // 1..12
  longitude: number; // 0..360 sidereal
}

export interface DoshaChartInput {
  planets: DoshaPlanet[];
  moonNakshatra: string;
  moonPada: number;
}

const NATURAL_MALEFICS = new Set(['Saturn', 'Mars', 'Rahu', 'Ketu']);

function byName(planets: DoshaPlanet[], name: string): DoshaPlanet | undefined {
  return planets.find(p => p.name === name);
}

/** Smallest separation (0..180°) between two longitudes. */
function sep(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

// ── Grahan (eclipse) dosha ────────────────────────────────────────────────────
export interface GrahanResult {
  present: boolean;
  grade: DoshaGrade;
  surya: boolean;   // Sun + node
  chandra: boolean; // Moon + node
  detail: string;
}

export function computeGrahanDosha(input: DoshaChartInput): GrahanResult {
  const sun = byName(input.planets, 'Sun');
  const moon = byName(input.planets, 'Moon');
  const rahu = byName(input.planets, 'Rahu');
  const ketu = byName(input.planets, 'Ketu');
  const nodes = [rahu, ketu].filter(Boolean) as DoshaPlanet[];

  const conj = (p?: DoshaPlanet) => {
    if (!p) return { hit: false, gap: 999 };
    let best = 999; let hit = false;
    for (const n of nodes) {
      if (n.signIndex === p.signIndex) { hit = true; best = Math.min(best, sep(p.longitude, n.longitude)); }
    }
    return { hit, gap: best };
  };

  const s = conj(sun);
  const c = conj(moon);
  const present = s.hit || c.hit;
  let grade: DoshaGrade = 'none';
  if (present) {
    const tightest = Math.min(s.hit ? s.gap : 999, c.hit ? c.gap : 999);
    grade = tightest <= 8 ? 'strong' : tightest <= 15 ? 'moderate' : 'mild';
  }
  const parts: string[] = [];
  if (s.hit) parts.push(`the Sun shares its sign with ${rahu && rahu.signIndex === sun!.signIndex ? 'Rahu' : 'Ketu'} (Surya Grahan pattern)`);
  if (c.hit) parts.push(`the Moon shares its sign with ${rahu && rahu.signIndex === moon!.signIndex ? 'Rahu' : 'Ketu'} (Chandra Grahan pattern)`);
  return {
    present, grade, surya: s.hit, chandra: c.hit,
    detail: present
      ? `In this chart, ${parts.join(' and ')}. The classical "eclipse" reading applies with ${grade} intensity (based on how close the degrees sit).`
      : 'Neither the Sun nor the Moon sits with Rahu or Ketu here, so the classical Grahan (eclipse) pattern does not apply.',
  };
}

// ── Pitra dosha ───────────────────────────────────────────────────────────────
export interface PitraResult {
  present: boolean;
  grade: DoshaGrade;
  reasons: string[];
  detail: string;
}

export function computePitraDosha(input: DoshaChartInput): PitraResult {
  const sun = byName(input.planets, 'Sun');
  const rahu = byName(input.planets, 'Rahu');
  const ketu = byName(input.planets, 'Ketu');
  const saturn = byName(input.planets, 'Saturn');
  const reasons: string[] = [];
  let weight = 0;

  if (sun) {
    const withNode = [rahu, ketu].some(n => n && n.signIndex === sun.signIndex);
    const withSaturn = saturn && saturn.signIndex === sun.signIndex;
    if (withNode) { reasons.push('the Sun shares its sign with a node (Rahu/Ketu) — the clearest classical Pitra signature'); weight += 2; }
    if (withSaturn) { reasons.push('the Sun shares its sign with Saturn'); weight += 1; }
  }
  // Natural malefic in the 9th house (house of father / ancestry / dharma).
  const malefic9 = input.planets.filter(p => p.house === 9 && NATURAL_MALEFICS.has(p.name));
  if (malefic9.length) { reasons.push(`a natural malefic (${malefic9.map(p => p.name).join(', ')}) sits in the 9th house of father and lineage`); weight += 1; }
  // Sun itself in the 9th with any node present in the chart's 9th.
  if (sun && sun.house === 9 && [rahu, ketu].some(n => n && n.house === 9)) {
    reasons.push('the Sun and a node both occupy the 9th house'); weight += 1;
  }

  const present = weight >= 1 && reasons.length > 0;
  const grade: DoshaGrade = !present ? 'none' : weight >= 3 ? 'strong' : weight === 2 ? 'moderate' : 'mild';
  return {
    present, grade, reasons,
    detail: present
      ? `The classical Pitra-dosha reading applies with ${grade} intensity because ${reasons.join('; ')}.`
      : 'None of the classical Pitra-dosha signatures (Sun with a node or Saturn, or malefics in the 9th house of lineage) are present here.',
  };
}

// ── Mool (Mula) Nakshatra dosha ───────────────────────────────────────────────
// Being born under one of the "gandanta/mool" nakshatras. Tradition assigns a
// relative said to be affected and a first-month "Mool Shanti" as cultural
// custom. Framed here as tradition only — NO medical meaning, NO fear (Rule 7).
const MOOL_NAKSHATRAS = new Set(['Ashwini', 'Ashlesha', 'Magha', 'Jyeshtha', 'Mula', 'Revati']);
// Gandanta-junction padas held to be the most intense in the tradition.
const INTENSE_PADA: Record<string, number> = { Revati: 4, Ashlesha: 4, Jyeshtha: 4, Ashwini: 1, Magha: 1, Mula: 1 };
// Traditional note on which relationship the texts associate with each (gentle).
const MOOL_RELATION: Record<string, string> = {
  Ashwini: 'traditionally linked to the mother-in-law in classical texts',
  Ashlesha: 'traditionally linked to the mother',
  Magha: 'traditionally linked to the father',
  Jyeshtha: 'traditionally linked to an elder sibling',
  Mula: 'traditionally linked to the father (the most-discussed of the mool stars)',
  Revati: 'traditionally considered gentle, with only a mild note',
};

export interface MoolResult {
  present: boolean;
  grade: DoshaGrade;
  nakshatra: string;
  pada: number;
  relationNote: string;
  detail: string;
}

export function computeMoolDosha(input: DoshaChartInput): MoolResult {
  const nak = input.moonNakshatra;
  const present = MOOL_NAKSHATRAS.has(nak);
  if (!present) {
    return { present: false, grade: 'none', nakshatra: nak, pada: input.moonPada, relationNote: '',
      detail: `The Moon's birth star (${nak}) is not one of the six mool/gandanta nakshatras, so the Mool-Nakshatra reading does not apply.` };
  }
  const intense = INTENSE_PADA[nak] === input.moonPada;
  const grade: DoshaGrade = nak === 'Revati' ? 'mild' : intense ? 'strong' : 'moderate';
  return {
    present: true, grade, nakshatra: nak, pada: input.moonPada,
    relationNote: MOOL_RELATION[nak] || '',
    detail: `The Moon is in ${nak} (pada ${input.moonPada}), one of the six mool/gandanta birth stars. The classical reading is ${grade}${intense ? ' (a gandanta-junction pada, held to be the most intense)' : ''}, ${MOOL_RELATION[nak]}. In tradition a simple "Mool Shanti" is sometimes done in the first month — purely a cultural custom with no medical meaning.`,
  };
}

// ── Standalone Nadi reading ───────────────────────────────────────────────────
// Nadi is fundamentally a *matching* factor: the "dosha" only arises between two
// people who share the same Nadi. Standalone we report the person's own Nadi and
// explain what it means for compatibility — never framed as an affliction.
export interface NadiInfoResult {
  nadi: 'Adi' | 'Madhya' | 'Antya';
  nakshatra: string;
  element: string;
  detail: string;
}

const NADI_ELEMENT: Record<string, string> = {
  Adi: 'Vata (air/movement) in the Ayurvedic reading',
  Madhya: 'Pitta (fire/metabolism) in the Ayurvedic reading',
  Antya: 'Kapha (earth-water/structure) in the Ayurvedic reading',
};

export function computeNadiInfo(input: DoshaChartInput): NadiInfoResult {
  const nadi = (NADI[input.moonNakshatra] || 'Adi') as NadiInfoResult['nadi'];
  return {
    nadi, nakshatra: input.moonNakshatra, element: NADI_ELEMENT[nadi],
    detail: `Your birth star ${input.moonNakshatra} falls in the ${nadi} Nadi, linked to ${NADI_ELEMENT[nadi]}. Nadi matters in marriage matching: when two partners share the same Nadi the tradition flags "Nadi dosha" (worth 8 of the 36 Guna-Milan points), but it is often cancelled — and it says nothing negative about you on your own.`,
  };
}

/** Build the engine input from the /api/kundali legacy response shape. */
export function doshaInputFromKundali(data: {
  planets?: Array<{ name: string; signIndex: number; house: number; longitude: number }>;
  nakshatra?: { nakshatra: string; pada: number };
}): DoshaChartInput | null {
  if (!data?.planets?.length || !data.nakshatra?.nakshatra) return null;
  // guard: the nakshatra name must be known
  if (nakshatraIndex(data.nakshatra.nakshatra) < 0) return null;
  return {
    planets: data.planets.map(p => ({ name: p.name, signIndex: p.signIndex, house: p.house, longitude: p.longitude })),
    moonNakshatra: data.nakshatra.nakshatra,
    moonPada: data.nakshatra.pada,
  };
}

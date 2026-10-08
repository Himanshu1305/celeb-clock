/**
 * Life-area readings — Growth P2 (P2-4/P2-5, improvements GP2-LIFE-SECTIONS):
 * Wealth & finances, Education & learning, Foreign travel & settlement, and
 * Health & vitality. Each is a graded (strong/moderate/mild) indication built
 * from the real chart — the relevant house lords' Shadbala strength and the
 * benefic/malefic occupants — reasoned and attributed to the tradition (Rule 7).
 *
 * Health is strictly WELLBEING framing: "areas to care for", never a diagnosis,
 * never an illness or a date; always points to a doctor (Rule 7). No LLM.
 */
import type { BirthChartResult } from './calculateBirthChart';
import { SIGN_LORDS } from './engine/sthanaBala';

const BENEFIC = new Set(['Jupiter', 'Venus', 'Mercury', 'Moon']);
const MALEFIC = new Set(['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun']);

export type AreaGrade = 'strong' | 'moderate' | 'mild';

export interface LifeAreaReading {
  key: 'wealth' | 'education' | 'foreign' | 'health';
  label: string;
  grade: AreaGrade;
  lead: string;      // the clear answer first
  reason: string;    // the reason from the chart
  meaning: string;   // what it means / what to do or expect
}

function strengthCat(chart: BirthChartResult, planet: string): 'strong' | 'moderate' | 'weak' {
  const t = chart.shadbala?.[planet]?.total;
  if (typeof t !== 'number') return 'moderate';
  return t >= 300 ? 'strong' : t >= 225 ? 'moderate' : 'weak';
}

/** Lord of a house (1-based) given the lagna. */
function houseLord(chart: BirthChartResult, house: number): string {
  const signIdx = (chart.lagna.rashiIndex + (house - 1)) % 12;
  return SIGN_LORDS[signIdx];
}

function occupantsOf(chart: BirthChartResult, house: number) {
  return chart.planets.filter(p => p.house === house).map(p => p.name);
}

/** Score a set of houses: lords' strength + benefic/malefic occupants → grade. */
function assess(chart: BirthChartResult, houses: number[]): { grade: AreaGrade; score: number; lords: string[]; benefics: string[]; malefics: string[] } {
  let score = 0;
  const lords: string[] = [];
  const benefics: string[] = [];
  const malefics: string[] = [];
  for (const h of houses) {
    const lord = houseLord(chart, h);
    lords.push(lord);
    const cat = strengthCat(chart, lord);
    score += cat === 'strong' ? 2 : cat === 'moderate' ? 1 : 0;
    for (const occ of occupantsOf(chart, h)) {
      if (BENEFIC.has(occ)) { score += 1; benefics.push(`${occ} in the ${ordinal(h)}`); }
      else if (MALEFIC.has(occ)) { score -= 0.5; malefics.push(`${occ} in the ${ordinal(h)}`); }
    }
  }
  const max = houses.length * 2 + 2; // rough ceiling
  const rel = score / Math.max(1, max);
  const grade: AreaGrade = rel >= 0.6 ? 'strong' : rel >= 0.3 ? 'moderate' : 'mild';
  return { grade, score, lords: [...new Set(lords)], benefics, malefics };
}

function ordinal(n: number): string { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
const gradeWord = (g: AreaGrade) => g === 'strong' ? 'a strong' : g === 'moderate' ? 'a moderate' : 'a mild';

export function buildLifeAreas(chart: BirthChartResult): LifeAreaReading[] {
  const out: LifeAreaReading[] = [];

  // Wealth & finances — 2nd (savings) + 11th (gains).
  {
    const a = assess(chart, [2, 11]);
    out.push({
      key: 'wealth', label: 'Wealth & finances', grade: a.grade,
      lead: `Vedic astrology reads ${gradeWord(a.grade)} indication for wealth-building in your chart.`,
      reason: `Your 2nd house of accumulated wealth (lord ${houseLord(chart, 2)}) and 11th house of gains (lord ${houseLord(chart, 11)}) carry ${a.grade} support${a.benefics.length ? `, helped by ${a.benefics.join(' and ')}` : ''}${a.malefics.length ? `; ${a.malefics.join(' and ')} ask for discipline` : ''}.`,
      meaning: a.grade === 'strong'
        ? 'The tradition reads this as a natural capacity to earn and hold wealth — the work is to channel it with a plan, not to chase it.'
        : a.grade === 'moderate'
          ? 'Steady, planned saving suits your chart better than speculation; wealth tends to build through consistent effort rather than windfalls.'
          : 'This is the area that rewards the most conscious habit-building — budgeting and steady saving matter more here than any single opportunity. Not a limit, a cue.',
    });
  }

  // Education & learning — 4th (foundation) + 5th (intelligence) + 9th (higher learning).
  {
    const a = assess(chart, [4, 5, 9]);
    const mercury = strengthCat(chart, 'Mercury'), jupiter = strengthCat(chart, 'Jupiter');
    out.push({
      key: 'education', label: 'Education & learning', grade: a.grade,
      lead: `Vedic astrology reads ${gradeWord(a.grade)} indication for education and learning.`,
      reason: `Your 4th (foundation), 5th (intelligence) and 9th (higher learning) houses carry ${a.grade} support; Mercury (analysis) is ${mercury} and Jupiter (wisdom) is ${jupiter}${a.benefics.length ? `, with ${a.benefics.join(' and ')}` : ''}.`,
      meaning: a.grade === 'strong'
        ? 'A naturally supportive chart for study — formal qualifications and continued learning tend to come well; lean into it.'
        : a.grade === 'moderate'
          ? 'Learning goes best with structure and a clear goal; your chart supports steady academic progress, especially in your stronger-planet subjects.'
          : 'Learning rewards patience and a method that fits you; don\'t read a mild indication as a ceiling — many thrive academically with the right support and persistence.',
    });
  }

  // Foreign travel & settlement — 12th (foreign lands) + 9th (long journeys) + 3rd (movement).
  {
    const a = assess(chart, [12, 9, 3]);
    const rahu = chart.planets.find(p => p.name === 'Rahu');
    const rahuForeign = rahu && [12, 9, 3, 7].includes(rahu.house);
    out.push({
      key: 'foreign', label: 'Foreign travel & settlement', grade: a.grade,
      lead: `Vedic astrology reads ${gradeWord(a.grade)} indication for foreign travel or settlement.`,
      reason: `Your 12th (distant lands), 9th (long journeys) and 3rd (movement) houses carry ${a.grade} support${rahuForeign ? `, and Rahu — the classical significator of foreign connection — sits in your ${ordinal(rahu!.house)} house, which strengthens the pull abroad` : ''}.`,
      meaning: a.grade === 'strong'
        ? 'The tradition reads clear promise of meaningful time abroad — study, work or settlement overseas are well supported if you pursue them.'
        : a.grade === 'moderate'
          ? 'Travel and periods abroad are supported, often tied to work or study; the door opens with effort rather than on its own.'
          : 'Foreign ties are a milder theme — travel is of course still open to you; it simply isn\'t one of the chart\'s headline pulls.',
    });
  }

  // Health & vitality — 1st (body) + Sun (vitality) + Moon (mind). Wellbeing only.
  {
    const lagnaLord = houseLord(chart, 1);
    const lagnaCat = strengthCat(chart, lagnaLord);
    const sunCat = strengthCat(chart, 'Sun'), moonCat = strengthCat(chart, 'Moon');
    const sixth = occupantsOf(chart, 6), eighth = occupantsOf(chart, 8);
    const careAreas = [...sixth, ...eighth].filter(p => MALEFIC.has(p));
    const score = (lagnaCat === 'strong' ? 2 : lagnaCat === 'moderate' ? 1 : 0) + (sunCat === 'strong' ? 1 : 0) + (moonCat === 'strong' ? 1 : 0) - careAreas.length * 0.5;
    const grade: AreaGrade = score >= 3 ? 'strong' : score >= 1.5 ? 'moderate' : 'mild';
    out.push({
      key: 'health', label: 'Health & vitality (wellbeing)', grade,
      lead: `Vedic astrology reads ${gradeWord(grade)} indication for natural vitality.`,
      reason: `Your 1st house of the body (lord ${lagnaLord}, ${lagnaCat}), the Sun (vitality, ${sunCat}) and the Moon (mind and rest, ${moonCat}) set the tone${careAreas.length ? `; the tradition would simply note gentle care around the themes of your ${careAreas.join(' and ')} placement` : ''}.`,
      meaning: `This is a wellbeing reading, never a diagnosis. ${grade === 'strong' ? 'Your chart suggests robust natural energy — the classic advice is simply to not take it for granted: keep good routines.' : grade === 'moderate' ? 'Steady routines of sleep, food and movement suit your chart well.' : 'Your chart gently suggests prioritising rest, routine and stress management.'} Nothing here predicts any illness or event, and it must never influence a medical decision — for anything health-related, please see a qualified doctor.`,
    });
  }

  return out;
}

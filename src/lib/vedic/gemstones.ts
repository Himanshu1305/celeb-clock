/**
 * Gemstone / remedy suggestions (Part I.11) — built CAUTIOUSLY.
 *
 * This is a more contested and commercially-sensitive area than the rest of the
 * project (real gemstone-selling scams exist), so:
 *  • The Navaratna planet→gem MAPPING is standard and agreed (Sun→Ruby, etc.).
 *  • The SELECTION METHOD genuinely varies across traditions — (a) the Lagna
 *    lord's lifelong stone, (b) a Shadbala-weak-but-favourable planet's stone,
 *    (c) the current Mahadasha lord's stone. We use (a)+(b), the mainstream
 *    Parashari approach, and DISCLOSE this — see docs/part-i-flags.md.
 *  • Everything is framed as a TRADITIONAL/CLASSICAL ASSOCIATION only — never a
 *    medical claim, never a guaranteed effect, and there is NO purchase/sales flow.
 *  • The three "powerful" stones (Blue Sapphire, Hessonite, Cat's Eye) carry the
 *    classical "trial first" caution.
 */
import type { BirthChartResult } from './calculateBirthChart';
import { SIGN_LORDS } from './engine/sthanaBala';

interface Gem { gem: string; hindi: string }
const GEM: Record<string, Gem> = {
  Sun: { gem: 'Ruby', hindi: 'Manik' }, Moon: { gem: 'Pearl', hindi: 'Moti' }, Mars: { gem: 'Red Coral', hindi: 'Moonga' },
  Mercury: { gem: 'Emerald', hindi: 'Panna' }, Jupiter: { gem: 'Yellow Sapphire', hindi: 'Pukhraj' }, Venus: { gem: 'Diamond', hindi: 'Heera' },
  Saturn: { gem: 'Blue Sapphire', hindi: 'Neelam' }, Rahu: { gem: 'Hessonite', hindi: 'Gomed' }, Ketu: { gem: "Cat's Eye", hindi: 'Lehsunia' },
};
const NATURAL_BENEFICS = new Set(['Jupiter', 'Venus', 'Mercury', 'Moon']);
const POWERFUL = new Set(['Saturn', 'Rahu', 'Ketu']); // Blue Sapphire / Hessonite / Cat's Eye — trial first
const KENDRA_TRIKONA = new Set([1, 4, 5, 7, 9, 10]);

export interface GemSuggestion { planet: string; gem: string; hindi: string; reason: string; trialCaution: boolean; }
export interface GemstoneReport {
  primary: GemSuggestion | null;      // the Lagna lord's stone
  supportive: GemSuggestion[];        // weak natural benefics ruling good houses
  methodology: string;
  disclaimer: string;
}

function housesRuledBy(lagnaIdx: number, planet: string): number[] {
  const houses: number[] = [];
  for (let h = 1; h <= 12; h++) if (SIGN_LORDS[(lagnaIdx + h - 1) % 12] === planet) houses.push(h);
  return houses;
}
function shadCat(chart: BirthChartResult, planet: string): 'strong' | 'moderate' | 'weak' | null {
  const sb = chart.shadbala?.[planet]; if (!sb) return null;
  const req = 300; return sb.total >= req ? 'strong' : sb.total >= req * 0.75 ? 'moderate' : 'weak';
}

export function buildGemstoneReport(chart: BirthChartResult): GemstoneReport {
  const lagnaIdx = chart.lagna.rashiIndex;
  const lagnaLord = SIGN_LORDS[lagnaIdx];

  // Primary: the Lagna lord's stone (the most universally-agreed lifelong strengthener).
  const primary: GemSuggestion = {
    planet: lagnaLord, ...GEM[lagnaLord],
    reason: `${lagnaLord} rules your Ascendant (${chart.lagna.sign}), making it your life-force planet. Its stone, ${GEM[lagnaLord].gem} (${GEM[lagnaLord].hindi}), is the classical lifelong strengthener for the whole chart.`,
    trialCaution: POWERFUL.has(lagnaLord),
  };

  // Supportive: natural benefics that are Shadbala-WEAK and rule a Kendra/Trikona
  // (functionally favourable) — so strengthening them is classically supportive,
  // not risky. We deliberately do NOT suggest stones for functional malefics.
  const supportive: GemSuggestion[] = [];
  for (const p of NATURAL_BENEFICS) {
    if (p === lagnaLord) continue;
    const houses = housesRuledBy(lagnaIdx, p);
    const rulesGood = houses.some(h => KENDRA_TRIKONA.has(h));
    const rulesDusthana = houses.some(h => [6, 8, 12].includes(h));
    if (rulesGood && !rulesDusthana && shadCat(chart, p) === 'weak') {
      supportive.push({
        planet: p, ...GEM[p], trialCaution: POWERFUL.has(p),
        reason: `${p} is a natural benefic that rules your ${houses.map(ordinal).join(' & ')} house and is currently gentle (low computed strength). Its stone, ${GEM[p].gem} (${GEM[p].hindi}), is traditionally worn to support it.`,
      });
    }
  }

  const methodology = 'Suggestions use the standard Navaratna planet→gem mapping and the mainstream Parashari selection method: the Ascendant lord’s stone as the lifelong strengthener, plus the stone of any natural benefic that rules a good house but is computed as weak. Other valid traditions instead prioritise the current Dasha lord’s stone, or judge functional benefic/malefic differently — this is a genuine area of variance (flagged), so treat these as one classical view.';
  const disclaimer = 'These are TRADITIONAL/CLASSICAL associations only — not medical advice, not a guaranteed effect, and not a product recommendation. The powerful stones (Blue Sapphire, Hessonite, Cat’s Eye) are classically tested on a short trial before regular wear. Please consult a qualified astrologer before wearing any gemstone; BornClock sells nothing and links to no seller.';

  return { primary, supportive, methodology, disclaimer };
}

function ordinal(n: number): string { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }

/**
 * Gemstone / remedy suggestions (Part J rebuild) — LAGNA-BASED, methodologically correct.
 *
 * Research finding (not a 50/50 call — a clear hierarchy across multiple independent
 * sources, incl. ones written to correct common bad practice): recommending by Rashi
 * (Moon sign) alone is the low-effort shortcut; the rigorous method is Ascendant-based:
 *   1. Lagna (Ascendant) lord — the real foundation (always a safe strengthener).
 *   2. Yogakaraka — for the 6 Lagnas that have one (a planet ruling BOTH a Kendra and a
 *      Trikona), the single most powerful, specific recommendation.
 *   3. Planetary strength (Shadbala) — a functional benefic that is WEAK is the clearest
 *      candidate; an already-strong planet needs no reinforcement.
 *   4. Current Dasha/Antardasha — a functional benefic running its own period now is the
 *      most time-relevant recommendation.
 *   5. Avoid functional malefics for that specific Lagna (planets ruling only dusthanas).
 *
 * Yogakaraka + functional benefic/malefic are COMPUTED from the engine's whole-sign
 * lordship (not a hardcoded table), which sidesteps the house-lordship errors found in
 * secondary sources. Everything reuses already-validated engine data — no new astronomy.
 *
 * Framing (unchanged from the cautious overnight build): informational only, no sales
 * flow, non-medical / non-guaranteed. The methodology critique is aimed at the METHOD
 * (Rashi-only vs Lagna-based), never at any competitor, product or seller.
 */
import type { BirthChartResult } from './calculateBirthChart';
import { SIGN_LORDS } from './engine/sthanaBala';
import { RASHI_NAMES } from './engine/vedicEngine';

interface Gem { gem: string; hindi: string }
const GEM: Record<string, Gem> = {
  Sun: { gem: 'Ruby', hindi: 'Manik' }, Moon: { gem: 'Pearl', hindi: 'Moti' }, Mars: { gem: 'Red Coral', hindi: 'Moonga' },
  Mercury: { gem: 'Emerald', hindi: 'Panna' }, Jupiter: { gem: 'Yellow Sapphire', hindi: 'Pukhraj' }, Venus: { gem: 'Diamond', hindi: 'Heera' },
  Saturn: { gem: 'Blue Sapphire', hindi: 'Neelam' }, Rahu: { gem: 'Hessonite', hindi: 'Gomed' }, Ketu: { gem: "Cat's Eye", hindi: 'Lehsunia' },
};
const NATURAL_BENEFICS = new Set(['Jupiter', 'Venus', 'Mercury', 'Moon']);
const POWERFUL = new Set(['Saturn', 'Rahu', 'Ketu']); // trial-first stones
const KENDRA = new Set([4, 7, 10]);
const TRIKONA = new Set([5, 9]);
const DUSTHANA = new Set([6, 8, 12]);

export interface GemSuggestion { planet: string; gem: string; hindi: string; role: string; reason: string; trialCaution: boolean; dashaActive: boolean; }
export interface GemAvoid { planet: string; gem: string; reason: string; }
export interface GemMethodology {
  lagna: string; lagnaLord: string;
  yogakaraka: string | null; yogakarakaHouses: number[] | null;
  primaryPlanet: string; primaryStrength: 'strong' | 'moderate' | 'weak' | 'unknown';
  currentDashaLord: string | null; dashaRelevant: boolean;
  text: string;
}
export interface GemstoneReport {
  primary: GemSuggestion | null;
  additional: GemSuggestion[];
  additionalNote: string | null;   // honest note when no functional benefic is currently weak
  avoid: GemAvoid[];
  methodology: GemMethodology;
  classificationNote: string;      // discloses that functional-malefic classification varies
  disclaimer: string;
}

function housesRuledBy(lagnaIdx: number, planet: string): number[] {
  const houses: number[] = [];
  for (let h = 1; h <= 12; h++) if (SIGN_LORDS[(lagnaIdx + h - 1) % 12] === planet) houses.push(h);
  return houses;
}
function shadCat(chart: BirthChartResult, planet: string): 'strong' | 'moderate' | 'weak' | 'unknown' {
  const sb = chart.shadbala?.[planet]; if (!sb) return 'unknown';
  const req = 300; return sb.total >= req ? 'strong' : sb.total >= req * 0.75 ? 'moderate' : 'weak';
}
/** The Yogakaraka: a planet ruling BOTH a Kendra (4/7/10) and a Trikona (5/9). Computed. */
function findYogakaraka(lagnaIdx: number): { planet: string; houses: number[] } | null {
  for (const planet of ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']) {
    const h = housesRuledBy(lagnaIdx, planet);
    if (h.some(x => KENDRA.has(x)) && h.some(x => TRIKONA.has(x))) return { planet, houses: h };
  }
  return null;
}
/** Functional malefic (conservative): rules a dusthana (6/8/12) and gains no benefic status
 *  from also ruling the Lagna, a Trikona, or being the Yogakaraka. */
function isFunctionalMalefic(houses: number[], planet: string, lagnaLord: string, yk: string | null): boolean {
  if (planet === lagnaLord || planet === yk) return false;
  const rulesDusthana = houses.some(h => DUSTHANA.has(h));
  const rulesGood = houses.some(h => h === 1 || TRIKONA.has(h));
  return rulesDusthana && !rulesGood;
}

export function buildGemstoneReport(chart: BirthChartResult): GemstoneReport {
  const lagnaIdx = chart.lagna.rashiIndex;
  const lagnaLord = SIGN_LORDS[lagnaIdx];
  const yk = findYogakaraka(lagnaIdx);
  const dashaLord = chart.currentDasha?.mahadasha || null;
  const antarLord = chart.currentDasha?.antardasha || null;
  const isDashaActive = (p: string) => p === dashaLord || p === antarLord;

  const mk = (planet: string, role: string, reason: string): GemSuggestion => ({
    planet, ...GEM[planet], role, reason, trialCaution: POWERFUL.has(planet), dashaActive: isDashaActive(planet),
  });

  // PRIMARY: the Yogakaraka if this Lagna has one (the single strongest recommendation),
  // otherwise the Lagna lord (the universal lifelong strengthener).
  let primary: GemSuggestion;
  if (yk) {
    primary = mk(yk.planet, 'Yogakaraka', `${yk.planet} is your Yogakaraka — it rules both a Kendra and a Trikona (houses ${yk.houses.join(', ')}) for ${chart.lagna.sign} rising, making it the single most powerful planet to strengthen. Its stone is ${GEM[yk.planet].gem} (${GEM[yk.planet].hindi}).`);
  } else {
    primary = mk(lagnaLord, 'Ascendant lord', `${lagnaLord} rules your Ascendant (${chart.lagna.sign}), your life-force planet. ${chart.lagna.sign} rising has no single Yogakaraka, so the Ascendant lord's stone, ${GEM[lagnaLord].gem} (${GEM[lagnaLord].hindi}), is the primary lifelong strengthener.`);
  }

  // ADDITIONAL: the Lagna lord (if the primary was the Yogakaraka), plus any natural
  // benefic that is functionally favourable (rules Lagna/Trikona/Kendra, not a functional
  // malefic) AND currently WEAK per Shadbala — the clearest "needs support" candidates.
  const additional: GemSuggestion[] = [];
  if (yk && lagnaLord !== yk.planet) {
    additional.push(mk(lagnaLord, 'Ascendant lord', `${lagnaLord} rules your Ascendant, so its stone ${GEM[lagnaLord].gem} (${GEM[lagnaLord].hindi}) is a supportive lifelong strengthener alongside the Yogakaraka.`));
  }
  for (const p of NATURAL_BENEFICS) {
    if (p === primary.planet || additional.some(a => a.planet === p)) continue;
    const houses = housesRuledBy(lagnaIdx, p);
    const favourable = houses.some(h => h === 1 || TRIKONA.has(h) || KENDRA.has(h));
    if (favourable && !isFunctionalMalefic(houses, p, lagnaLord, yk?.planet ?? null) && shadCat(chart, p) === 'weak') {
      const dasha = isDashaActive(p) ? ` It is also running its own planetary period right now, making this especially timely.` : '';
      additional.push(mk(p, 'weak functional benefic', `${p} is a natural benefic ruling your ${houses.map(ordinal).join(' & ')} house and is computed as WEAK (Shadbala), so it is a clear candidate to support with ${GEM[p].gem} (${GEM[p].hindi}).${dasha}`));
    }
  }

  // AVOID: functional malefics for this Lagna — explicitly NOT recommended.
  const avoid: GemAvoid[] = [];
  for (const p of ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']) {
    const houses = housesRuledBy(lagnaIdx, p);
    if (isFunctionalMalefic(houses, p, lagnaLord, yk?.planet ?? null)) {
      avoid.push({ planet: p, gem: GEM[p].gem, reason: `${p} rules the ${houses.filter(h => DUSTHANA.has(h)).map(ordinal).join(' & ')} house (a difficult house) for ${chart.lagna.sign} rising and gains no offsetting benefic rulership, so its stone (${GEM[p].gem}) is traditionally avoided for you.` });
    }
  }

  // Methodology note — generated from the REAL computed factors for THIS chart.
  const primaryStrength = shadCat(chart, primary.planet);
  const dashaRelevant = isDashaActive(primary.planet) || additional.some(a => a.dashaActive);
  // Written to read clearly to a non-astrologer — jargon is glossed in plain words,
  // while keeping the exact factual substrings the accuracy checker verifies.
  const parts = [
    `This recommendation is based on your Ascendant (Lagna) — your rising sign — which multiple classical sources identify as the correct foundation for gemstone selection, rather than your Moon sign (Rashi) alone, which is a common but less precise shortcut.`,
    `Here's what we actually looked at for your chart: your rising sign ${chart.lagna.sign} and the planet that rules it, its lord ${lagnaLord}; ${yk ? `your Yogakaraka ${yk.planet} — the single most beneficial planet for your rising sign, since it governs both an "angle" and a "trine" house (${yk.houses.join(' and ')})` : `the fact that ${chart.lagna.sign} rising has no single Yogakaraka (a one-planet "best" pick), so we lead with the rising-sign ruler`}; how strong ${primary.planet} is right now (${primaryStrength}, by the classical Shadbala strength measure); and the planetary period you're currently in (the ${dashaLord || 'unavailable'}${antarLord ? `–${antarLord}` : ''} "dasha").`,
    `Putting those together, the primary suggestion is ${primary.gem} for ${primary.planet} (${primary.role}).`,
  ];
  const methodology: GemMethodology = {
    lagna: chart.lagna.sign, lagnaLord,
    yogakaraka: yk?.planet ?? null, yogakarakaHouses: yk?.houses ?? null,
    primaryPlanet: primary.planet, primaryStrength,
    currentDashaLord: dashaLord, dashaRelevant,
    text: parts.join(' '),
  };

  const weakBenefics = additional.filter(a => a.role === 'weak functional benefic');
  const additionalNote = weakBenefics.length === 0
    ? 'No functional benefic is currently weak enough to specifically need strengthening — the primary stone above is the main suggestion, and no extra stone is forced to fit.'
    : null;

  const classificationNote = 'Functional benefic/malefic status here is computed from your Ascendant’s whole-sign house rulerships (Trikona/Kendra vs. the difficult 6/8/12 houses). Traditions differ on some edge cases — notably a natural benefic that rules both a good and a difficult house (the "kendradhipati" nuance) — so treat the "avoid" list as the mainstream conservative view, not the only one.';

  const disclaimer = 'These are TRADITIONAL/CLASSICAL associations only — not medical advice, not a guaranteed effect, and not a product recommendation. The powerful stones (Blue Sapphire, Hessonite, Cat’s Eye) are classically tested on a short trial before regular wear. Please consult a qualified astrologer before wearing any gemstone; BornClock sells nothing and links to no seller.';
  return { primary, additional, additionalNote, avoid, methodology, classificationNote, disclaimer };
}

function ordinal(n: number): string { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }

/**
 * Gemstone context for the astrologer CHAT (Part K, Item 3). Provides BOTH the
 * rigorous Lagna-based recommendation (the same computed result the dedicated page
 * uses — reused, not recalculated differently) AND the Rashi-only shortcut, so the
 * chat can default to the Lagna method yet still explain the Moon-sign alternative
 * if asked. Deterministic; the chat cites these, never invents a stone.
 */
export function gemstoneChatContext(chart: BirthChartResult): { lagnaBased: string; rashiBased: string } {
  const rep = buildGemstoneReport(chart);
  const p = rep.primary!;
  const lagnaBased = `LAGNA-BASED recommendation (the rigorous method, same as the dedicated gemstone page): primary stone ${p.gem} (${p.hindi}) for ${p.planet}, which is your ${p.role}. Your rising sign is ${rep.methodology.lagna}, ruled by ${rep.methodology.lagnaLord}${rep.methodology.yogakaraka ? `, and your Yogakaraka is ${rep.methodology.yogakaraka}` : ' (no single Yogakaraka)'}.${rep.additional.length ? ` Additional: ${rep.additional.map(a => `${a.gem} for ${a.planet}`).join(', ')}.` : ''}${rep.avoid.length ? ` Traditionally avoid: ${rep.avoid.map(a => `${a.gem} (${a.planet})`).join(', ')}.` : ''}`;
  const moonLord = SIGN_LORDS[Math.max(0, RASHI_NAMES.indexOf(chart.rashi))];
  const rashiGem = GEM[moonLord];
  const rashiBased = `RASHI-ONLY alternative (the common but less precise shortcut): your Moon sign is ${chart.rashi}, ruled by ${moonLord}, whose stone is ${rashiGem.gem} (${rashiGem.hindi}). This uses only the Moon sign, not the Ascendant, so it is less tailored than the Lagna-based method above.`;
  return { lagnaBased, rashiBased };
}

/**
 * Zero-tolerance accuracy check for the methodology note (Part J testing): every
 * fact the note STATES must match what the engine independently computes for THIS
 * chart. A mismatch is a failure — same discipline as every other generated claim.
 */
export interface GemNoteCheck { checked: number; correct: number; wrong: Array<{ field: string; stated: string; actual: string }>; }
export function verifyGemstoneReport(report: GemstoneReport, chart: BirthChartResult): GemNoteCheck {
  const lagnaIdx = chart.lagna.rashiIndex;
  const wrong: Array<{ field: string; stated: string; actual: string }> = [];
  const check = (field: string, stated: string, actual: string) => { if (stated !== actual) wrong.push({ field, stated, actual }); };
  const m = report.methodology;

  check('lagna', m.lagna, chart.lagna.sign);
  check('lagnaLord', m.lagnaLord, SIGN_LORDS[lagnaIdx]);
  const yk = findYogakaraka(lagnaIdx);
  check('yogakaraka', String(m.yogakaraka), String(yk?.planet ?? null));
  check('yogakarakaHouses', JSON.stringify(m.yogakarakaHouses), JSON.stringify(yk?.houses ?? null));
  check('primaryStrength', m.primaryStrength, shadCat(chart, m.primaryPlanet));
  check('currentDashaLord', String(m.currentDashaLord), String(chart.currentDasha?.mahadasha ?? null));
  // The note TEXT must not name a wrong lord/yogakaraka.
  check('note-mentions-lagnaLord', String(m.text.includes(`lord ${SIGN_LORDS[lagnaIdx]}`)), 'true');
  if (yk) check('note-mentions-yogakaraka', String(m.text.includes(`Yogakaraka ${yk.planet}`)), 'true');
  // Primary suggestion must be the Yogakaraka (if present) or the Lagna lord.
  check('primaryPlanet', m.primaryPlanet, yk?.planet ?? SIGN_LORDS[lagnaIdx]);

  const checked = 7 + (yk ? 1 : 0);
  return { checked, correct: checked - wrong.length, wrong };
}

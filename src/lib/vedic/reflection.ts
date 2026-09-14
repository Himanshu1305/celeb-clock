/**
 * Past-Period Reflection (Part R) — a carefully-scoped, trust-building feature.
 *
 * It identifies a small number of distinct, ALREADY-COMPLETED past Dasha/Antardasha
 * periods in the user's own chart, selected by REAL, SOURCED classical house-
 * signification rules, and asks — as a genuine, low-pressure question, never a
 * confident assertion — whether a traditionally-associated life theme matched the
 * user's real experience during that period.
 *
 * WHAT THIS IS NOT: not past-life content (explicitly rejected — unfalsifiable and
 * adjacent to cold-reading). Not a confident claim about what happened. The hedging
 * ("traditionally linked to", "no right or wrong answer") is LOAD-BEARING, not
 * decoration — see buildReflectionQuestionText.
 *
 * SOURCED RULES (verified fresh, Sep 2026; see docs/part-r-touchpoints.md):
 *  - Marriage/relationships: operating Dasha+Antardasha lords jointly signify 2, 7, 11.
 *    (Jagannath Hora's Vimshottari marriage-timing methodology; corroborated: "look
 *     for periods when the operating planets jointly signify houses 2, 7 and 11".)
 *  - Career/education: lords jointly signify 2, 6, 10, 11 (the classical career
 *    combination; "the 2-6-10-11 combination is seen in top bureaucrats and CEOs").
 *    The education-specific 4th/9th split was researched and found genuinely MORE
 *    AMBIGUOUS than the clean career rule (sources fold education into the same
 *    cluster and lean on divisional charts), so we use the well-sourced 2/6/10/11
 *    rule as a single career/education theme rather than forcing the ambiguous split.
 *  - Foreign travel/relocation: lords jointly signify 3, 9, 12 (3 short journeys,
 *    9 long journeys, 12 foreign residence/settlement abroad).
 *
 * "Signify a house" = whole-sign LORDSHIP of it OR OCCUPATION of it — the same
 * deterministic definition already used by the D-Fix3 timing engine
 * (categorySignificators), reusing existing engine data, no new astronomy. We require
 * FULL joint coverage of a theme's houses; if a chart has no qualifying completed
 * period for a theme, that theme is simply not offered (never a forced weak match).
 */
import type { BirthChartResult } from './calculateBirthChart';
import { houseLordOf, planetsInHouse, formatMonthYear } from './yogaTiming';

export type ReflectionTheme = 'marriage' | 'career' | 'travel';

interface ThemeDef {
  theme: ReflectionTheme;
  houses: number[];
  /** The EXACT theme-description text used in the question (do not soften). */
  description: string;
}

/** The three sourced themes, in a stable display order. */
export const REFLECTION_THEMES: ThemeDef[] = [
  { theme: 'marriage', houses: [2, 7, 11], description: 'partnership, marriage, or significant relationships' },
  { theme: 'career', houses: [2, 6, 10, 11], description: 'career changes, professional growth, or educational milestones' },
  { theme: 'travel', houses: [3, 9, 12], description: 'travel, relocation, or connections abroad' },
];

/** The three response options, EXACTLY (order + wording are part of the spec). */
export const REFLECTION_OPTIONS = ['Yes, that fits', 'Not really', "I don't remember"] as const;
export type ReflectionResponse = typeof REFLECTION_OPTIONS[number];

/**
 * EXACT response-handling acknowledgments — tone matters (warm, never triumphant,
 * never defensive, never re-explaining why it "should" have matched, no pressure).
 */
export const REFLECTION_ACK: Record<ReflectionResponse, string> = {
  'Yes, that fits': "That's good to know — thank you for sharing.",
  'Not really': "That's completely normal — not every classical pattern shows up the same way for everyone. Thanks for letting us know.",
  "I don't remember": 'No problem — thanks anyway.',
};

export interface ReflectionQuestion {
  theme: ReflectionTheme;
  dashaLord: string;        // Mahadasha lord
  antardashaLord: string;   // Antardasha lord
  start: string;            // ISO — the period's real computed start
  end: string;              // ISO — the period's real computed end (always < now)
  houses: number[];         // the theme's classical houses (transparency/testing)
  themeDescription: string; // exact description text
  questionText: string;     // the full, exact question as shown to the user
}

/** Houses a planet SIGNIFIES for this chart: whole-sign lordship OR occupation. */
function housesSignified(chart: BirthChartResult, planet: string): Set<number> {
  const s = new Set<number>();
  for (let h = 1; h <= 12; h++) {
    if (houseLordOf(chart, h) === planet) s.add(h);
    if (planetsInHouse(chart, h).includes(planet)) s.add(h);
  }
  return s;
}

/**
 * The EXACT question wording (Part R spec). The hedging is load-bearing — do not
 * loosen. "[Antardasha lord, if applicable]" collapses to a single planet name when
 * the Mahadasha and Antardasha lords are the same (the first sub-period of a period).
 */
export function buildReflectionQuestionText(
  dashaLord: string, antardashaLord: string, start: string, end: string, themeDescription: string,
): string {
  const period = dashaLord === antardashaLord ? `${dashaLord}` : `${dashaLord}–${antardashaLord}`;
  return `A quick reflection — no right or wrong answer here. Looking at your chart, your ${period} period ran from ${formatMonthYear(start)} to ${formatMonthYear(end)}. In classical Vedic astrology, this combination of periods is traditionally linked to themes of ${themeDescription}. Did anything along those lines happen for you during that time?`;
}

/**
 * Select the reflection question (at most one) per theme for a chart, using the
 * sourced rules. For each theme, picks the MOST RECENT already-completed Antardasha
 * period whose Maha+Antar lords jointly signify ALL of the theme's houses. Themes
 * with no qualifying completed period are omitted (never forced). Deterministic.
 *
 * A qualifying period must have been genuinely LIVED: its start is on/after the
 * birth date (the Vimshottari timeline includes the pre-birth "balance" of the first
 * Mahadasha — we never ask about time before the person was born) AND its end is
 * before `now` (already completed). This is what makes a very young chart correctly
 * return "nothing to ask yet".
 */
export function selectReflectionQuestions(chart: BirthChartResult, birthDate: Date, now: Date = new Date()): ReflectionQuestion[] {
  const tl = chart.dashaTimeline;
  if (!tl || !tl.length) return [];
  const bornMs = birthDate.getTime();
  // Precompute per-planet signified houses once.
  const sigCache = new Map<string, Set<number>>();
  const sigOf = (p: string) => {
    let s = sigCache.get(p);
    if (!s) { s = housesSignified(chart, p); sigCache.set(p, s); }
    return s;
  };

  const out: ReflectionQuestion[] = [];
  for (const def of REFLECTION_THEMES) {
    let chosen: { maha: string; antar: string; start: string; end: string } | null = null;
    for (const maha of tl) {
      const mahaSig = sigOf(maha.lord);
      for (const antar of maha.antardashas) {
        if (new Date(antar.end).getTime() >= now.getTime()) continue;   // must be fully completed (past)
        if (new Date(antar.start).getTime() < bornMs) continue;         // must have been lived (post-birth)
        const antarSig = sigOf(antar.lord);
        const covers = def.houses.every(h => mahaSig.has(h) || antarSig.has(h));
        if (!covers) continue;
        if (!chosen || new Date(antar.end).getTime() > new Date(chosen.end).getTime()) {
          chosen = { maha: maha.lord, antar: antar.lord, start: antar.start, end: antar.end };
        }
      }
    }
    if (chosen) {
      out.push({
        theme: def.theme,
        dashaLord: chosen.maha,
        antardashaLord: chosen.antar,
        start: chosen.start,
        end: chosen.end,
        houses: def.houses,
        themeDescription: def.description,
        questionText: buildReflectionQuestionText(chosen.maha, chosen.antar, chosen.start, chosen.end, def.description),
      });
    }
  }
  return out;
}

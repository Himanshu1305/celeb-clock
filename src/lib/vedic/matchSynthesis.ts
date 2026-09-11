/**
 * Matching narrative SYNTHESIS (Part M, Part 2) — applies the D-Fix2 method to
 * Kundali Matching: the report already states 8 correct, individually-computed
 * Koota facts, but never connects them. This adds a short "Overall reading" that
 *   1) reasons from the two most heavily-weighted factors (Nadi, Bhakoot),
 *   2) connects multiple Kootas into an explicit trade-off (not adjacent bullets),
 *   3) lands on a calibrated, decisive-but-not-guaranteed conclusion, and
 *   4) cites the real marriage-timing overlap where present.
 *
 * DETERMINISTIC (no LLM): every sentence is computed from the same GunaMilanResult
 * the page already shows, so accuracy is guaranteed by construction — and
 * `verifyMatchSynthesis` independently re-derives the facts as a safety net,
 * matching the accuracy-checker pattern used by the readings (D-Fix / Part G).
 *
 * Tone matches the project standard: doshas are "an area to be mindful of", never
 * alarm; compatibility is described as patterns of ease/effort, never a prediction
 * of success or failure.
 */
import type { GunaMilanResult, KootaDetail } from './matchmaking';

export interface MatchSynthesisInput {
  gunaMilan: GunaMilanResult;
  overlaps?: Array<{ range: string }>;
}
export interface MatchSynthesis {
  verdict: string;
  paragraphs: string[];
}

const ACCEPT = 18; // classical "acceptable" line out of 36

/** Plain-language gloss of what each Koota speaks to. */
const GLOSS: Record<string, string> = {
  varna: 'shared work ethic and values',
  vashya: 'natural mutual pull and influence',
  tara: 'birth-star fortune for health and luck',
  yoni: 'instinctive and physical rhythm',
  graha_maitri: 'mental and psychological rapport',
  gana: 'day-to-day temperament',
  bhakoot: 'emotional and financial harmony',
  nadi: 'health and genetic vitality',
};

const byKey = (r: GunaMilanResult): Record<string, KootaDetail> =>
  Object.fromEntries(r.kootas.map(k => [k.key, k]));

const joinNames = (arr: { name: string }[]) => arr.map(d => d.name).join(' and ');

/** Build the synthesis. Pure + deterministic. */
export function buildMatchSynthesis({ gunaMilan, overlaps = [] }: MatchSynthesisInput): MatchSynthesis {
  const r = gunaMilan;
  const k = byKey(r);
  const nadiK = k.nadi, bhakootK = k.bhakoot;
  const nadiDosha = r.doshas.find(d => d.name === 'Nadi Dosha');
  // A CANCELLED Nadi dosha (koota scores 0 but is classically neutralised) is not a
  // standing affliction; Bhakoot has no cancellation mechanism, so score 0 counts.
  const nadiRealAffl = nadiK.score === 0 && !nadiDosha?.cancelled;
  const bhakootRealAffl = bhakootK.score === 0;
  const heavyRealAffl = [nadiRealAffl, bhakootRealAffl].filter(Boolean).length;
  const heavySat = [nadiK, bhakootK].filter(x => x && x.score === x.max);
  const lighter = r.kootas.filter(x => !x.heavy);
  const strongest = [...lighter].sort((a, b) => (b.score / b.max) - (a.score / a.max) || b.max - a.max)[0];
  const weakest = [...lighter].sort((a, b) => (a.score / a.max) - (b.score / b.max) || a.score - b.score)[0];
  const uncancelled = r.doshas.filter(d => d.present && !d.cancelled);
  const cancelledPresent = r.doshas.filter(d => d.present && d.cancelled);
  const total = r.total;
  const many = uncancelled.length > 1;

  // ── Verdict (calibrated to the real evidence) ───────────────────────────────
  let verdict: string;
  const strong = total >= 24 && heavyRealAffl === 0 && !uncancelled.length;
  if (strong) {
    verdict = `A strong match — ${total}/36 (${r.compatibility}). The classical picture is genuinely favourable, and the factors that carry the most weight are on side.`;
  } else if (uncancelled.length) {
    verdict = `A mixed but honest picture — ${total}/36 (${r.compatibility}). Real strengths sit alongside ${joinNames(uncancelled)} — ${many ? 'the areas that ask' : 'the one area that asks'} for conscious attention rather than worry.`;
  } else if (total >= ACCEPT) {
    verdict = `A workable match — ${total}/36 (${r.compatibility}), above the classical ${ACCEPT}-point line, with no uncancelled dosha left standing.`;
  } else {
    verdict = `A more challenging match — ${total}/36 (${r.compatibility}), below the classical ${ACCEPT}-point line: the compatibility here rewards deliberate effort more than an easy-flowing pairing would.`;
  }

  // ── Paragraph 1: reason from the two heaviest factors (Nadi 8, Bhakoot 7) ────
  let p1: string;
  if (heavySat.length === 2) {
    p1 = `The two most heavily weighted factors — Nadi (8 points, ${GLOSS.nadi}) and Bhakoot (7 points, ${GLOSS.bhakoot}) — are both fully satisfied. The Ashtakoota system deliberately loads these two above all the others, so both being clean matters more than the ${total}/36 total alone suggests: the single largest classical risks simply aren't on the table here.`;
  } else {
    const parts: string[] = [];
    if (nadiK.score === 0) {
      const d = r.doshas.find(x => x.name === 'Nadi Dosha');
      const soft = d?.cancelled
        ? ' Because it is classically cancelled here, its weight is considerably reduced.'
        : ' Traditionally this is the area to approach most consciously — a pattern to be mindful of, not a verdict on the relationship.';
      parts.push(`Nadi — the heaviest factor of all (8 points, ${GLOSS.nadi}) — shows a Nadi Dosha. Put plainly rather than fearfully: ${d?.reason}${soft}`);
    } else {
      parts.push(`Nadi, the heaviest factor (8 points, ${GLOSS.nadi}), is fully satisfied — the single strongest classical signal is on side.`);
    }
    if (bhakootK.score === 0) {
      const alsoWord = nadiK.score === 0 ? 'also ' : '';
      parts.push(`Bhakoot (7 points, ${GLOSS.bhakoot}) ${alsoWord}carries a Bhakoot Dosha here — a rhythm the couple would want to tend consciously.`);
    } else {
      parts.push(`Bhakoot (7 points, ${GLOSS.bhakoot}) is intact.`);
    }
    p1 = parts.join(' ');
  }

  // ── Paragraph 2: connect the lighter Kootas as an explicit trade-off ─────────
  let p2: string;
  if (!strongest || !weakest || strongest.key === weakest.key) {
    p2 = `Among the lighter factors, the scores sit at a similar level, so no single one dominates the everyday texture of the match.`;
  } else {
    p2 = `Beyond the heavyweights, ${strongest.label} (${strongest.score}/${strongest.max}) is the clear strength — ${GLOSS[strongest.key]} — while ${weakest.label} (${weakest.score}/${weakest.max}) is the softer spot, where ${GLOSS[weakest.key]} may need more deliberate tending. Read together rather than as separate scores: lean on the ${GLOSS[strongest.key]}, and invest in the ${GLOSS[weakest.key]}.`;
  }

  // ── Paragraph 3: calibrated conclusion + real timing overlap ─────────────────
  const okAcc = total >= ACCEPT && !uncancelled.length;
  let conclusion: string;
  if (strong) {
    conclusion = heavySat.length === 2
      ? `Taken together, this reads as a genuinely strong pairing: both of the heaviest factors are satisfied and the lighter ones lean positive.`
      : `Taken together, this reads as a genuinely strong pairing: the one heavyweight concern is classically cancelled, and the rest of the chart leans positive.`;
  } else if (uncancelled.length) {
    conclusion = `Taken together, this is a real but uneven match — the strengths are genuine, and ${joinNames(uncancelled)} ${many ? 'are the specific things' : 'is the specific thing'} to work with honestly rather than a reason for alarm.`;
  } else if (okAcc) {
    conclusion = `Taken together, this is a workable, above-threshold match with no standing affliction — solid ground, with the softer factor above worth some attention.`;
  } else {
    conclusion = `Taken together, this is a genuinely mixed match that sits below the classical comfort line; it can absolutely work, but with more conscious effort in the weaker areas than a higher score would ask.`;
  }
  const cancelNote = cancelledPresent.length
    ? ` Note too that ${joinNames(cancelledPresent)} ${cancelledPresent.length > 1 ? 'are' : 'is'} present but classically cancelled, which is why ${cancelledPresent.length > 1 ? 'they don’t' : 'it doesn’t'} pull the reading down further.`
    : '';
  const timingNote = overlaps.length
    ? ` The charts also point to ${overlaps[0].range} as a window when both people are simultaneously in a favourable marriage period — a natural time for a significant step.`
    : ` There’s no overlapping favourable window in the near future; each person’s individual windows are shown below.`;
  const p3 = `${conclusion}${cancelNote} This describes compatibility patterns and where ease or effort is likely — not a prediction of whether the relationship will succeed.${timingNote}`;

  return { verdict, paragraphs: [p1, p2, p3] };
}

// ── Accuracy checker (independent re-derivation) ───────────────────────────────
export interface SynthesisCheck { checked: number; correct: number; failures: string[]; }

/**
 * Cross-checks every specific claim in the synthesis against the real computed
 * data — the same zero-tolerance pattern as the reading checkers. Verifies: the
 * X/36 total, every "(score/max)" pair maps to a real Koota, "N points" weights,
 * the strong/mixed/below-line tier vs the real total, dosha names surfaced iff
 * uncancelled, and any cited timing range existing in the real overlaps.
 */
export function verifyMatchSynthesis(
  synthesis: MatchSynthesis,
  gunaMilan: GunaMilanResult,
  overlaps: Array<{ range: string }> = [],
): SynthesisCheck {
  const text = [synthesis.verdict, ...synthesis.paragraphs].join('\n');
  const failures: string[] = [];
  let checked = 0;
  const assert = (cond: boolean, msg: string) => { checked++; if (!cond) failures.push(msg); };

  const kootas = gunaMilan.kootas;
  const total = gunaMilan.total;

  // 1) Every "s/m" fraction is either the total/36 or a real Koota score/max.
  for (const m of text.matchAll(/(\d+(?:\.\d+)?)\s*\/\s*(\d+)/g)) {
    const s = parseFloat(m[1]), mx = parseInt(m[2], 10);
    if (mx === 36) { assert(s === total, `cited ${s}/36 but real total is ${total}`); continue; }
    assert(kootas.some(k => k.score === s && k.max === mx), `cited ${s}/${mx} matches no real Koota`);
  }
  // 2) Every "N points" weight is a real Koota max.
  for (const m of text.matchAll(/(\d+)\s*points/g)) {
    const n = parseInt(m[1], 10);
    assert(kootas.some(k => k.max === n), `cited "${n} points" matches no Koota weight`);
  }
  // 3) Tier language matches the real total.
  if (/below the classical 18-point line/.test(text)) assert(total < ACCEPT, `says "below the 18 line" but total ${total} ≥ 18`);
  if (/above the classical 18-point line/.test(text)) assert(total >= ACCEPT, `says "above the 18 line" but total ${total} < 18`);
  if (/\bA strong match\b/.test(text)) assert(total >= 24, `verdict "strong" but total ${total} < 24`);

  // 4) Uncancelled doshas must be named (surfaced); cancelled-only doshas must NOT be
  //    described as needing attention without the "cancelled" note.
  const uncancelled = gunaMilan.doshas.filter(d => d.present && !d.cancelled);
  for (const d of uncancelled) assert(text.includes(d.name), `uncancelled ${d.name} not surfaced in synthesis`);
  const cancelledPresent = gunaMilan.doshas.filter(d => d.present && d.cancelled);
  for (const d of cancelledPresent) {
    if (text.includes(d.name)) assert(/cancelled/.test(text), `${d.name} named but its cancellation not stated`);
  }

  // 5) Any cited timing range must exist in the real overlaps.
  const strongClaim = /window when both people are simultaneously/.test(text);
  if (strongClaim) assert(overlaps.length > 0 && overlaps.some(o => text.includes(o.range)), `cites a joint timing window not in the real overlaps`);
  if (/no overlapping favourable window/.test(text)) assert(overlaps.length === 0, `says "no overlap" but overlaps exist`);

  return { checked, correct: checked - failures.length, failures };
}

/**
 * Ashtakoota (Guna Milan) — full 8-Koota marriage compatibility (Part I, 2.1-2.4).
 *
 * Replaces the earlier simplified util (which hardcoded Varna=1, Vashya=2,
 * Graha Maitri=3 and used an inverted Tara rule). Every Koota is genuinely
 * computed from each person's Moon Nakshatra + Moon sign, with a per-Koota score,
 * max, and plain-language explanation, plus explicit Nadi/Gana dosha-cancellation
 * reasoning. Rules researched from multiple independent sources (drikpanchang,
 * astrosaxena, jagannathhora, muhuratchoghadiya, Saravali); worked examples in the
 * test suite. Where software differs (Varna/Gana direction, Vashya half-signs,
 * Yoni tiers) BornClock follows AstroSage (founder decision, Oct 2026), verified
 * against real AstroSage results in matchmakingAstroSage.test.ts.
 *
 * Reuses the engine's validated planetary FRIENDS/ENEMIES/SIGN_LORDS.
 */
import { FRIENDS, ENEMIES, SIGN_LORDS } from './engine/sthanaBala';
import { glossInline } from './termDefinitions';
import {
  NAK_ORDER, nakLord, GANA, NADI, YONI,
  VARNA_LEVEL, VARNA_NAME, VASHYA, TARA_NAMES, taraNum, type VashyaGroup,
} from './nakshatraAttributes';
// What each Koota governs, in plain language — used for the "what a strong/weak
// score practically means" note appended to every Koota.
const KOOTA_GIST: Record<string, string> = {
  varna: 'a shared work ethic and sense of values',
  vashya: 'natural mutual influence and attraction',
  tara: 'health, fortune and general auspiciousness between the two birth stars',
  yoni: 'instinctive and physical compatibility',
  graha_maitri: 'mental and psychological rapport',
  gana: 'day-to-day temperament and disposition',
  bhakoot: 'emotional and financial harmony as a couple',
  nadi: 'health and constitutional compatibility',
};
/** A calm, non-fear practical note on what THIS Koota's score means for the couple. */
function practicalNote(key: string, score: number, max: number): string {
  const gist = KOOTA_GIST[key] || 'this dimension';
  const ratio = max > 0 ? score / max : 0;
  if (ratio >= 1) return ` In practice, ${gist} is a natural strength here — an area that tends to flow with little effort.`;
  if (ratio <= 0) return ` In practice, ${gist} is the softer spot of this pairing — not a barrier to the relationship, but the area that rewards the most conscious effort and understanding.`;
  return ` In practice, ${gist} is partly supported — workable, with a little conscious care in this area.`;
}

/**
 * One person's Moon data. `moonLongitude` (sidereal, 0-360) is used for the
 * Vashya half-sign split (Sagittarius / Capricorn at 15°); when it is missing the
 * midpoint of the nakshatra pada is used instead.
 */
export interface PersonInput { nakshatra: string; pada: number; rashiIndex: number; moonLongitude?: number } // rashiIndex 0-based
export interface KootaDetail { key: string; label: string; score: number; max: number; explanation: string; heavy?: boolean; }
export interface DoshaDetail { name: string; present: boolean; cancelled: boolean; reason: string; }
export interface GunaMilanResult {
  kootas: KootaDetail[];
  total: number; max: number;
  compatibility: 'Excellent' | 'Good' | 'Acceptable' | 'Challenging';
  doshas: DoshaDetail[];
  methodology: string;
  /** a = the groom (boy), b = the bride (girl). */
  a: PersonInput; b: PersonInput;
}
/** Display labels for the groom (boy) and bride (girl) used inside explanations. */
export interface MatchLabels { groom: string; bride: string }
const DEFAULT_LABELS: MatchLabels = { groom: 'Person A', bride: 'Person B' };

const relation = (p1: string, p2: string): 'friend' | 'enemy' | 'neutral' =>
  FRIENDS[p1]?.includes(p2) ? 'friend' : ENEMIES[p1]?.includes(p2) ? 'enemy' : 'neutral';

// ── AstroSage-convention tables (founder decision: match AstroSage exactly) ─────
// Every table below is read [groom][bride] unless stated. Regression-tested against
// 7 couples entered on AstroSage on 17 Oct 2026 (src/lib/vedic/__tests__/matchmakingAstroSage.test.ts).

/** Vashya group from the Moon's sidereal longitude. Sagittarius: 0-15° Manava,
 *  15-30° Chatushpada. Capricorn: 0-15° Chatushpada, 15-30° Jalachara. */
export function vashyaGroup(moonLongitude: number): VashyaGroup {
  const lon = ((moonLongitude % 360) + 360) % 360;
  const sign = Math.floor(lon / 30), deg = lon - sign * 30;
  if (sign === 8) return deg < 15 ? 'Manava' : 'Chatushpada';
  if (sign === 9) return deg < 15 ? 'Chatushpada' : 'Jalachara';
  return VASHYA[sign];
}
/** Approximate Moon longitude from nakshatra + pada (pada midpoint) when the real one is absent. */
function moonLon(p: PersonInput): number {
  if (typeof p.moonLongitude === 'number' && Number.isFinite(p.moonLongitude)) return p.moonLongitude;
  const idx = Math.max(0, NAK_ORDER.indexOf(p.nakshatra));
  const lon = idx * (360 / 27) + (Math.min(4, Math.max(1, p.pada || 1)) - 0.5) * (360 / 108);
  // Keep inside the stated sign if the caller's rashi disagrees with the approximation.
  const sign = Math.floor(lon / 30);
  return sign === p.rashiIndex ? lon : p.rashiIndex * 30 + 15;
}
const VASHYA_ORDER: VashyaGroup[] = ['Chatushpada', 'Manava', 'Jalachara', 'Vanachara', 'Keeta'];
/** Vashya points, rows = BRIDE group, columns = GROOM group (order as VASHYA_ORDER).
 *  Source: onlinejyotish.com Vashya Kootam table (bride rows × groom columns); the
 *  cells exercised by the AstroSage regression couples (bride Manava × groom
 *  Jalachara = ½; bride Vanachara × groom Chatushpada = 0) match AstroSage. */
const VASHYA_POINTS: number[][] = [
  [2, 1, 1, 0, 1],
  [1, 2, 0.5, 0, 1],
  [1, 0.5, 2, 1, 1],
  [0, 0, 1, 2, 0],
  [1, 0, 1, 0, 2],
];
const YONI_ORDER = ['Horse', 'Elephant', 'Sheep', 'Snake', 'Dog', 'Cat', 'Rat', 'Cow', 'Buffalo', 'Tiger', 'Hare', 'Monkey', 'Mongoose', 'Lion'];
/** Classical symmetric 14×14 Yoni table (saravali.github.io "Yoni Koota" / aaps.space yoni chart;
 *  Hare = Deer/Mriga). */
const YONI_POINTS: number[][] = [
  [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1],
  [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0],
  [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
  [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2],
  [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1],
  [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
  [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2],
  [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1],
  [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
  [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1],
  [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1],
  [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
  [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2],
  [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4],
];
/** Cells where AstroSage's published results differ from the classical table above.
 *  Derived from AstroSage outputs recorded on 17 Oct 2026 (round2 audit):
 *  P6 (Ashwini, Horse) × P8 (Mrigashira, Snake) → Yoni 2 (classical 3);
 *  P9 (Pushya, Sheep) × P3 (Purva Phalguni, Rat) → Yoni 3 (classical 1).
 *  Applied both ways (Yoni is a mutual relation in every published table). */
const ASTROSAGE_YONI_OVERRIDES: Array<[string, string, number]> = [
  ['Horse', 'Snake', 2],
  ['Sheep', 'Rat', 3],
];
export function yoniPoints(groomYoni: string, brideYoni: string): number {
  for (const [x, y, v] of ASTROSAGE_YONI_OVERRIDES) {
    if ((groomYoni === x && brideYoni === y) || (groomYoni === y && brideYoni === x)) return v;
  }
  const i = YONI_ORDER.indexOf(groomYoni), j = YONI_ORDER.indexOf(brideYoni);
  if (i < 0 || j < 0) return 2;
  return YONI_POINTS[i][j];
}
const GANA_ORDER = ['Deva', 'Manushya', 'Rakshasa'] as const;
/** Gana points, rows = GROOM, columns = BRIDE. Direction matters: groom Deva × bride
 *  Manushya = 6 but groom Manushya × bride Deva = 5; groom Deva × bride Rakshasa = 0
 *  but groom Rakshasa × bride Deva = 1 (AstroSage results for P1×P2 / Y3×P2 / P9×P3). */
const GANA_POINTS: number[][] = [
  [6, 6, 0],
  [5, 6, 0],
  [1, 0, 6],
];

function varna(a: PersonInput, b: PersonInput, L: MatchLabels): KootaDetail {
  const la = VARNA_LEVEL[a.rashiIndex], lb = VARNA_LEVEL[b.rashiIndex];
  // Classical directional rule: groom's varna ≥ bride's → 1.
  const score = la >= lb ? 1 : 0;
  return { key: 'varna', label: 'Varna', score, max: 1,
    explanation: `Spiritual/temperamental caste from the Moon sign — ${L.groom} (groom) is ${VARNA_NAME[la]}, ${L.bride} (bride) is ${VARNA_NAME[lb]}. ${score ? 'Compatible (the groom’s Varna is equal or higher).' : 'The groom’s Varna is lower than the bride’s, so no point by the classical convention.'}` + practicalNote('varna', score, 1) };
}
function vashya(a: PersonInput, b: PersonInput, L: MatchLabels): KootaDetail {
  const ga = vashyaGroup(moonLon(a)), gb = vashyaGroup(moonLon(b));
  const score = VASHYA_POINTS[VASHYA_ORDER.indexOf(gb)][VASHYA_ORDER.indexOf(ga)];
  return { key: 'vashya', label: 'Vashya', score, max: 2,
    explanation: `Mutual attraction/control from the Moon-sign group — ${L.groom} is ${ga}, ${L.bride} is ${gb}. ${ga === gb ? 'Same group: full magnetic pull.' : score >= 1 ? 'Different but compatible groups.' : score > 0 ? 'Only a weak pull between these groups.' : 'These groups do not attract each other: no point.'}` + practicalNote('vashya', score, 2) };
}
function tara(a: PersonInput, b: PersonInput, L: MatchLabels): KootaDetail {
  const ia = NAK_ORDER.indexOf(a.nakshatra), ib = NAK_ORDER.indexOf(b.nakshatra);
  const BAD = new Set([3, 5, 7]); // Vipat, Pratyari, Vadha
  const tAB = taraNum(ia, ib), tBA = taraNum(ib, ia);
  const okAB = !BAD.has(tAB), okBA = !BAD.has(tBA);
  const score = (okAB ? 1.5 : 0) + (okBA ? 1.5 : 0);
  return { key: 'tara', label: 'Tara', score, max: 3,
    explanation: `Birth-star compatibility for health & fortune, counted between the two Nakshatras (the favourable Taras are Janma, Sampat, Kshema, Sadhaka, Mitra and Parama Mitra; the inauspicious ones are Vipat, Pratyari and Vadha). From ${L.groom} to ${L.bride} the Tara is ${TARA_NAMES[tAB]} (${okAB ? 'favourable' : 'inauspicious'}); from ${L.bride} to ${L.groom} it is ${TARA_NAMES[tBA]} (${okBA ? 'favourable' : 'inauspicious'}).` + practicalNote('tara', score, 3) };
}
function yoni(a: PersonInput, b: PersonInput, L: MatchLabels): KootaDetail {
  const ya = YONI[a.nakshatra] || 'Horse', yb = YONI[b.nakshatra] || 'Horse';
  const score = yoniPoints(ya, yb);
  const kind = score === 4 ? 'Same yoni: naturally in tune.' : score === 3 ? 'Friendly animals.' : score === 2 ? 'Neutral pairing.' : score === 1 ? 'Unfriendly animals.' : 'Natural adversary animals.';
  return { key: 'yoni', label: 'Yoni', score, max: 4,
    explanation: `Instinctive/physical compatibility via the Nakshatra animal — ${L.groom} is ${ya}, ${L.bride} is ${yb}. ${kind}` + practicalNote('yoni', score, 4) };
}
function grahaMaitri(a: PersonInput, b: PersonInput, L: MatchLabels): KootaDetail {
  const la = SIGN_LORDS[a.rashiIndex], lb = SIGN_LORDS[b.rashiIndex];
  let score: number;
  if (la === lb) score = 5;
  else {
    const r1 = relation(la, lb), r2 = relation(lb, la);
    const set = [r1, r2].sort().join('-');
    score = set === 'friend-friend' ? 5 : set === 'friend-neutral' ? 4 : set === 'neutral-neutral' ? 3
      : set === 'enemy-friend' ? 1 : set === 'enemy-neutral' ? 0.5 : 0; // enemy-enemy
  }
  return { key: 'graha_maitri', label: 'Graha Maitri', score, max: 5,
    explanation: `Mental/psychological friendship via the Moon-sign lords — ${L.groom}’s lord ${la}, ${L.bride}’s lord ${lb}. ${la === lb ? 'Same lord: minds run alike.' : `Their planetary relationship scores ${score}/5.`}` + practicalNote('graha_maitri', score, 5) };
}
function gana(a: PersonInput, b: PersonInput, L: MatchLabels): KootaDetail {
  const ga = GANA[a.nakshatra] || 'Manushya', gb = GANA[b.nakshatra] || 'Manushya';
  const score = GANA_POINTS[GANA_ORDER.indexOf(ga)][GANA_ORDER.indexOf(gb)];
  return { key: 'gana', label: 'Gana', score, max: 6,
    explanation: `Temperament class — ${L.groom} (groom) is ${ga}, ${L.bride} (bride) is ${gb}. ${ga === gb ? 'Same temperament class.' : score >= 5 ? 'Harmonious temperaments.' : score === 1 ? 'Groom Rakshasa with bride Deva: mild friction.' : 'The largest temperament gap in this system.'}` + practicalNote('gana', score, 6) };
}
function bhakoot(a: PersonInput, b: PersonInput): KootaDetail {
  const posAB = ((b.rashiIndex - a.rashiIndex + 12) % 12) + 1;
  const posBA = ((a.rashiIndex - b.rashiIndex + 12) % 12) + 1;
  const pair = [posAB, posBA].sort((x, y) => x - y).join('-');
  const dosha = pair === '2-12' || pair === '5-9' || pair === '6-8';
  const score = dosha ? 0 : 7;
  return { key: 'bhakoot', label: 'Bhakoot', score, max: 7, heavy: true,
    explanation: `Emotional & financial harmony via the Moon-sign pair (positions ${posAB}/${posBA}) — one of the two most heavily-weighted Kootas. ${dosha ? `Bhakoot Dosha (${pair}): classically a heavy affliction, held calmly as an area to be mindful of rather than a verdict.` : 'No Bhakoot Dosha — full harmony.'}` + practicalNote('bhakoot', score, 7) };
}
function nadi(a: PersonInput, b: PersonInput, L: MatchLabels): KootaDetail {
  const na = NADI[a.nakshatra] || 'Adi', nb = NADI[b.nakshatra] || 'Adi';
  const dosha = na === nb;
  const score = dosha ? 0 : 8;
  return { key: 'nadi', label: 'Nadi', score, max: 8, heavy: true,
    explanation: `Health & constitutional compatibility (the single heaviest Koota, worth 8 of the 36 points) — ${L.groom} is ${na} Nadi, ${L.bride} is ${nb} Nadi. ${dosha ? 'Same Nadi = Nadi Dosha — classically the most significant single concern, framed calmly here as an area to approach consciously, not a verdict on the relationship.' : 'Different Nadi — the strongest single factor is satisfied.'}` + practicalNote('nadi', score, 8) };
}

// ── Cancellation transparency (Part 2.2) — Nadi, Gana & Bhakoot ──────────────
function nadiCancellation(a: PersonInput, b: PersonInput): DoshaDetail {
  const present = (NADI[a.nakshatra] || 'Adi') === (NADI[b.nakshatra] || 'Adi');
  if (!present) return { name: 'Nadi Dosha', present: false, cancelled: false, reason: 'Different Nadi — no dosha.' };
  // Same Nakshatra AND same pada: no exception applies (M11) — say so plainly.
  if (a.nakshatra === b.nakshatra && a.pada === b.pada) {
    return { name: 'Nadi Dosha', present: true, cancelled: false,
      reason: `Present and not cancelled: both Moons are in the same Nakshatra (${a.nakshatra}) and the same pada (${a.pada}), where the classical exceptions do not apply.` };
  }
  const sameNakDiffPada = a.nakshatra === b.nakshatra && a.pada !== b.pada;
  const sameRashiDiffNak = a.rashiIndex === b.rashiIndex && a.nakshatra !== b.nakshatra;
  const la = SIGN_LORDS[a.rashiIndex], lb = SIGN_LORDS[b.rashiIndex];
  const friendlyOrSameLord = la === lb || relation(la, lb) === 'friend' || relation(lb, la) === 'friend';
  const reasons: string[] = [];
  if (sameNakDiffPada) reasons.push('same Nakshatra but different padas');
  if (sameRashiDiffNak) reasons.push('same Moon sign but different Nakshatras');
  if (friendlyOrSameLord) reasons.push(`Moon-sign lords are ${la === lb ? 'identical' : 'friendly'} (${la}/${lb})`);
  const cancelled = reasons.length > 0;
  return { name: 'Nadi Dosha', present: true, cancelled,
    reason: cancelled ? `Present, but classically cancelled: ${reasons.join('; ')}.` : 'Present and not cancelled by the standard exceptions (different padas, same-sign, or friendly sign-lords) — treat as significant.' };
}
function ganaCancellation(a: PersonInput, b: PersonInput): DoshaDetail {
  const ga = GANA[a.nakshatra] || 'Manushya', gb = GANA[b.nakshatra] || 'Manushya';
  const present = ga !== gb && (ga === 'Rakshasa' || gb === 'Rakshasa'); // Rakshasa-vs-other is the real clash
  if (!present) return { name: 'Gana Dosha', present: false, cancelled: false, reason: ga === gb ? 'Same Gana — no dosha.' : 'Deva–Manushya pairing — no significant Gana dosha.' };
  const la = SIGN_LORDS[a.rashiIndex], lb = SIGN_LORDS[b.rashiIndex];
  const sameSign = a.rashiIndex === b.rashiIndex;
  const lordFriendly = la === lb || relation(la, lb) === 'friend' || relation(lb, la) === 'friend';
  const nla = nakLord(NAK_ORDER.indexOf(a.nakshatra)), nlb = nakLord(NAK_ORDER.indexOf(b.nakshatra));
  const nakLordFriendly = nla === nlb || relation(nla, nlb) === 'friend' || relation(nlb, nla) === 'friend';
  const reasons: string[] = [];
  if (sameSign) reasons.push('both share the same Moon sign');
  if (lordFriendly) reasons.push(`Moon-sign lords are ${la === lb ? 'the same' : 'friends'} (${la}/${lb})`);
  if (nakLordFriendly) reasons.push(`Nakshatra lords are ${nla === nlb ? 'the same' : 'friends'} (${nla}/${nlb})`);
  const cancelled = reasons.length > 0;
  return { name: 'Gana Dosha', present: true, cancelled,
    reason: cancelled ? `Present (${ga}–${gb}), but classically cancelled: ${reasons.join('; ')}.` : `Present (${ga}–${gb}) and not cancelled by friendly sign-lords or Nakshatra-lords — a genuine temperament gap to be mindful of.` };
}
function bhakootDosha(a: PersonInput, b: PersonInput): DoshaDetail {
  const posAB = ((b.rashiIndex - a.rashiIndex + 12) % 12) + 1;
  const posBA = ((a.rashiIndex - b.rashiIndex + 12) % 12) + 1;
  const pair = [posAB, posBA].sort((x, y) => x - y).join('-');
  const present = pair === '2-12' || pair === '5-9' || pair === '6-8';
  if (!present) return { name: 'Bhakoot Dosha', present: false, cancelled: false, reason: 'No Bhakoot Dosha.' };
  return { name: 'Bhakoot Dosha', present: true, cancelled: false,
    reason: `Present: the two Moon signs sit ${pair.replace('-', '/')} from each other, which scores 0 of 7 in Bhakoot. Held calmly as an area of emotional and financial rhythm to tend, not a verdict.` };
}

const METHODOLOGY =
  `Computed by the classical Ashtakoota (Guna Milan) system of the Brihat Parashara Hora Shastra (the foundational classical text of Vedic astrology), using the Lahiri ayanamsa — ${glossInline('ayanamsa')}. All eight Kootas derive from each person’s Moon Nakshatra and Moon sign. Where software differs, BornClock follows the AstroSage convention: Varna and Gana are read in the groom → bride direction (so who is the boy and who is the girl matters), Vashya splits Sagittarius and Capricorn at 15°, and half points are allowed. Nadi and Bhakoot are the two heaviest Kootas and are emphasised accordingly.`;

/**
 * Guna Milan. `a` is the GROOM (boy) and `b` the BRIDE (girl); Varna, Vashya and
 * Gana are directional. `labels` only changes the names used in the explanations.
 */
export function calculateGunaMilan(a: PersonInput, b: PersonInput, labels: MatchLabels = DEFAULT_LABELS): GunaMilanResult {
  const L = labels;
  const kootas = [varna(a, b, L), vashya(a, b, L), tara(a, b, L), yoni(a, b, L), grahaMaitri(a, b, L), gana(a, b, L), bhakoot(a, b), nadi(a, b, L)];
  const total = kootas.reduce((s, k) => s + k.score, 0);
  const compatibility = total >= 28 ? 'Excellent' : total >= 24 ? 'Good' : total >= 18 ? 'Acceptable' : 'Challenging';
  const doshas = [nadiCancellation(a, b), ganaCancellation(a, b), bhakootDosha(a, b)];
  return { kootas, total, max: 36, compatibility, doshas, methodology: METHODOLOGY, a, b };
}

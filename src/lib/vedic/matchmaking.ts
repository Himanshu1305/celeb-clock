/**
 * Ashtakoota (Guna Milan) — full 8-Koota marriage compatibility (Part I, 2.1-2.4).
 *
 * Replaces the earlier simplified util (which hardcoded Varna=1, Vashya=2,
 * Graha Maitri=3 and used an inverted Tara rule). Every Koota is genuinely
 * computed from each person's Moon Nakshatra + Moon sign, with a per-Koota score,
 * max, and plain-language explanation, plus explicit Nadi/Gana dosha-cancellation
 * reasoning. Rules researched from multiple independent sources (drikpanchang,
 * astrosaxena, jagannathhora, muhuratchoghadiya, Saravali); worked examples in the
 * test suite. Where genuine cross-software variance exists (Varna direction,
 * Vashya half-signs, Yoni tiers) the mainstream convention is used and disclosed
 * in the methodology note — see docs/part-i-flags.md.
 *
 * Reuses the engine's validated planetary FRIENDS/ENEMIES/SIGN_LORDS.
 */
import { FRIENDS, ENEMIES, SIGN_LORDS } from './engine/sthanaBala';
import { glossInline } from './termDefinitions';

const NAK_ORDER = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];
// Vimshottari lord of each nakshatra (for Gana-dosha cancellation via nakshatra-lord friendship).
const DASHA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const nakLord = (idx: number) => DASHA_LORDS[idx % 9];

const GANA: Record<string, 'Deva' | 'Manushya' | 'Rakshasa'> = {
  Ashwini: 'Deva', Mrigashira: 'Deva', Punarvasu: 'Deva', Pushya: 'Deva', Hasta: 'Deva', Swati: 'Deva', Anuradha: 'Deva', Shravana: 'Deva', Revati: 'Deva',
  Bharani: 'Manushya', Rohini: 'Manushya', Ardra: 'Manushya', 'Purva Phalguni': 'Manushya', 'Uttara Phalguni': 'Manushya', 'Purva Ashadha': 'Manushya', 'Uttara Ashadha': 'Manushya', 'Purva Bhadrapada': 'Manushya', 'Uttara Bhadrapada': 'Manushya',
  Krittika: 'Rakshasa', Ashlesha: 'Rakshasa', Magha: 'Rakshasa', Chitra: 'Rakshasa', Vishakha: 'Rakshasa', Jyeshtha: 'Rakshasa', Mula: 'Rakshasa', Dhanishtha: 'Rakshasa', Shatabhisha: 'Rakshasa',
};
const NADI: Record<string, 'Adi' | 'Madhya' | 'Antya'> = {
  Ashwini: 'Adi', Ardra: 'Adi', Punarvasu: 'Adi', 'Uttara Phalguni': 'Adi', Hasta: 'Adi', Jyeshtha: 'Adi', Mula: 'Adi', Shatabhisha: 'Adi', 'Purva Bhadrapada': 'Adi',
  Bharani: 'Madhya', Mrigashira: 'Madhya', Pushya: 'Madhya', 'Purva Phalguni': 'Madhya', Chitra: 'Madhya', Anuradha: 'Madhya', 'Purva Ashadha': 'Madhya', Dhanishtha: 'Madhya', 'Uttara Bhadrapada': 'Madhya',
  Krittika: 'Antya', Rohini: 'Antya', Ashlesha: 'Antya', Magha: 'Antya', Swati: 'Antya', Vishakha: 'Antya', 'Uttara Ashadha': 'Antya', Shravana: 'Antya', Revati: 'Antya',
};
const YONI: Record<string, string> = {
  Ashwini: 'Horse', Shatabhisha: 'Horse', Bharani: 'Elephant', Revati: 'Elephant', Pushya: 'Sheep', Krittika: 'Sheep',
  Rohini: 'Snake', Mrigashira: 'Snake', Mula: 'Dog', Ardra: 'Dog', Ashlesha: 'Cat', Punarvasu: 'Cat',
  Magha: 'Rat', 'Purva Phalguni': 'Rat', 'Uttara Phalguni': 'Cow', 'Uttara Bhadrapada': 'Cow', Hasta: 'Buffalo', Swati: 'Buffalo',
  Vishakha: 'Tiger', Chitra: 'Tiger', Jyeshtha: 'Hare', Anuradha: 'Hare', 'Purva Ashadha': 'Monkey', Shravana: 'Monkey',
  'Purva Bhadrapada': 'Lion', Dhanishtha: 'Lion', 'Uttara Ashadha': 'Mongoose',
};
const YONI_ENEMY: Record<string, string> = {
  Horse: 'Buffalo', Buffalo: 'Horse', Elephant: 'Lion', Lion: 'Elephant', Sheep: 'Monkey', Monkey: 'Sheep',
  Snake: 'Mongoose', Mongoose: 'Snake', Dog: 'Hare', Hare: 'Dog', Cat: 'Rat', Rat: 'Cat', Cow: 'Tiger', Tiger: 'Cow',
};
// Varna by Moon sign (0-based Mesha..Meena): water=Brahmin(4), fire=Kshatriya(3), earth=Vaishya(2), air=Shudra(1).
const VARNA_LEVEL = [3, 2, 1, 4, 3, 2, 1, 4, 3, 2, 1, 4]; // Mesha..Meena
const VARNA_NAME = ['—', 'Shudra', 'Vaishya', 'Kshatriya', 'Brahmin'];
// Vashya group by Moon sign (whole-sign mainstream convention; half-sign variance disclosed).
type VG = 'Manava' | 'Chatushpada' | 'Jalachara' | 'Vanachara' | 'Keeta';
const VASHYA: VG[] = ['Chatushpada', 'Chatushpada', 'Manava', 'Jalachara', 'Vanachara', 'Manava', 'Manava', 'Keeta', 'Manava', 'Chatushpada', 'Manava', 'Jalachara'];

// ── Per-Koota depth (Part O Item 1.3) ────────────────────────────────────────
// The 9 Taras by count-position (1-9). 3/5/7 (Vipat/Pratyari/Vadha) are the
// inauspicious ones; the rest are favourable. Named explicitly rather than just
// "auspicious/inauspicious".
const TARA_NAMES = ['—', 'Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyari', 'Sadhaka', 'Vadha', 'Mitra', 'Parama Mitra'];
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

export interface PersonInput { nakshatra: string; pada: number; rashiIndex: number; } // rashiIndex 0-based
export interface KootaDetail { key: string; label: string; score: number; max: number; explanation: string; heavy?: boolean; }
export interface DoshaDetail { name: string; present: boolean; cancelled: boolean; reason: string; }
export interface GunaMilanResult {
  kootas: KootaDetail[];
  total: number; max: number;
  compatibility: 'Excellent' | 'Good' | 'Acceptable' | 'Challenging';
  doshas: DoshaDetail[];
  methodology: string;
  a: PersonInput; b: PersonInput;
}

const relation = (p1: string, p2: string): 'friend' | 'enemy' | 'neutral' =>
  FRIENDS[p1]?.includes(p2) ? 'friend' : ENEMIES[p1]?.includes(p2) ? 'enemy' : 'neutral';

function varna(a: PersonInput, b: PersonInput): KootaDetail {
  const la = VARNA_LEVEL[a.rashiIndex], lb = VARNA_LEVEL[b.rashiIndex];
  // Classical directional rule (groom's varna ≥ bride's → 1). No gender is collected,
  // so Person A is treated as the groom-position; disclosed in the methodology note.
  const score = la >= lb ? 1 : 0;
  return { key: 'varna', label: 'Varna', score, max: 1,
    explanation: `Spiritual/temperamental caste from the Moon sign — Person A is ${VARNA_NAME[la]}, Person B is ${VARNA_NAME[lb]}. ${score ? 'Compatible (A’s Varna is equal or higher).' : 'A’s Varna is lower than B’s, so no point by the classical convention.'}` + practicalNote('varna', score, 1) };
}
function vashya(a: PersonInput, b: PersonInput): KootaDetail {
  const ga = VASHYA[a.rashiIndex], gb = VASHYA[b.rashiIndex];
  let score = 2;
  if (ga !== gb) score = (ga === 'Vanachara' || gb === 'Vanachara') && (ga === 'Chatushpada' || gb === 'Chatushpada') ? 0 : 1;
  return { key: 'vashya', label: 'Vashya', score, max: 2,
    explanation: `Mutual attraction/control from the Moon-sign group — Person A is ${ga}, Person B is ${gb}. ${ga === gb ? 'Same group: full magnetic pull.' : score ? 'Different but compatible groups.' : 'Predator/prey groups: no point.'}` + practicalNote('vashya', score, 2) };
}
function taraNum(fromIdx: number, toIdx: number): number {
  const count = ((toIdx - fromIdx + 27) % 27) + 1; // inclusive count
  const t = count % 9; return t === 0 ? 9 : t;
}
function tara(a: PersonInput, b: PersonInput): KootaDetail {
  const ia = NAK_ORDER.indexOf(a.nakshatra), ib = NAK_ORDER.indexOf(b.nakshatra);
  const BAD = new Set([3, 5, 7]); // Vipat, Pratyari, Vadha
  const tAB = taraNum(ia, ib), tBA = taraNum(ib, ia);
  const okAB = !BAD.has(tAB), okBA = !BAD.has(tBA);
  const score = (okAB ? 1.5 : 0) + (okBA ? 1.5 : 0);
  return { key: 'tara', label: 'Tara', score, max: 3,
    explanation: `Birth-star compatibility for health & fortune, counted between the two Nakshatras (the favourable Taras are Janma, Sampat, Kshema, Sadhaka, Mitra and Parama Mitra; the inauspicious ones are Vipat, Pratyari and Vadha). From Person A to Person B the Tara is ${TARA_NAMES[tAB]} (${okAB ? 'favourable' : 'inauspicious'}); from Person B to Person A it is ${TARA_NAMES[tBA]} (${okBA ? 'favourable' : 'inauspicious'}).` + practicalNote('tara', score, 3) };
}
function yoni(a: PersonInput, b: PersonInput): KootaDetail {
  const ya = YONI[a.nakshatra] || 'Horse', yb = YONI[b.nakshatra] || 'Horse';
  const score = ya === yb ? 4 : YONI_ENEMY[ya] === yb ? 0 : 2; // same / deadly-enemy / neutral (tiers simplified, disclosed)
  return { key: 'yoni', label: 'Yoni', score, max: 4,
    explanation: `Instinctive/physical compatibility via the Nakshatra animal — Person A is ${ya}, Person B is ${yb}. ${score === 4 ? 'Same yoni: naturally in tune.' : score === 0 ? 'Natural adversary animals.' : 'Neutral pairing.'}` + practicalNote('yoni', score, 4) };
}
function grahaMaitri(a: PersonInput, b: PersonInput): KootaDetail {
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
    explanation: `Mental/psychological friendship via the Moon-sign lords — Person A’s lord ${la}, Person B’s lord ${lb}. ${la === lb ? 'Same lord: minds run alike.' : `Their planetary relationship scores ${score}/5.`}` + practicalNote('graha_maitri', score, 5) };
}
function gana(a: PersonInput, b: PersonInput): KootaDetail {
  const ga = GANA[a.nakshatra] || 'Manushya', gb = GANA[b.nakshatra] || 'Manushya';
  let score: number;
  if (ga === gb) score = 6;
  else if ((ga === 'Deva' && gb === 'Manushya') || (ga === 'Manushya' && gb === 'Deva')) score = 5;
  else if ((ga === 'Deva' && gb === 'Rakshasa') || (ga === 'Rakshasa' && gb === 'Deva')) score = 1;
  else score = 0; // Manushya + Rakshasa
  return { key: 'gana', label: 'Gana', score, max: 6,
    explanation: `Temperament class — Person A is ${ga}, Person B is ${gb}. ${score >= 5 ? 'Harmonious temperaments.' : score === 1 ? 'Deva–Rakshasa: mild friction.' : 'Manushya–Rakshasa: the largest temperament gap.'}` + practicalNote('gana', score, 6) };
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
function nadi(a: PersonInput, b: PersonInput): KootaDetail {
  const na = NADI[a.nakshatra] || 'Adi', nb = NADI[b.nakshatra] || 'Adi';
  const dosha = na === nb;
  const score = dosha ? 0 : 8;
  return { key: 'nadi', label: 'Nadi', score, max: 8, heavy: true,
    explanation: `Health & constitutional compatibility (the single heaviest Koota, worth 8 of the 36 points) — Person A is ${na} Nadi, Person B is ${nb} Nadi. ${dosha ? 'Same Nadi = Nadi Dosha — classically the most significant single concern, framed calmly here as an area to approach consciously, not a verdict on the relationship.' : 'Different Nadi — the strongest single factor is satisfied.'}` + practicalNote('nadi', score, 8) };
}

// ── Cancellation transparency (Part 2.2) — Nadi & Gana ────────────────────────
function nadiCancellation(a: PersonInput, b: PersonInput): DoshaDetail {
  const present = (NADI[a.nakshatra] || 'Adi') === (NADI[b.nakshatra] || 'Adi');
  if (!present) return { name: 'Nadi Dosha', present: false, cancelled: false, reason: 'Different Nadi — no dosha.' };
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

const METHODOLOGY =
  `Computed by the classical Ashtakoota (Guna Milan) system of the Brihat Parashara Hora Shastra (the foundational classical text of Vedic astrology), using the Lahiri ayanamsa — ${glossInline('ayanamsa')}. All eight Kootas derive from each person’s Moon Nakshatra and Moon sign. Where mainstream software genuinely differs — the Varna direction (groom ≥ bride; Person A is taken as the groom-position here since no gender is collected), the Vashya half-sign splits, and the Yoni friend/enemy tiers — the common convention is used; these are lower-precision by nature. Nadi and Bhakoot are the two heaviest Kootas and are emphasised accordingly.`;

export function calculateGunaMilan(a: PersonInput, b: PersonInput): GunaMilanResult {
  const kootas = [varna(a, b), vashya(a, b), tara(a, b), yoni(a, b), grahaMaitri(a, b), gana(a, b), bhakoot(a, b), nadi(a, b)];
  const total = kootas.reduce((s, k) => s + k.score, 0);
  const compatibility = total >= 28 ? 'Excellent' : total >= 24 ? 'Good' : total >= 18 ? 'Acceptable' : 'Challenging';
  const doshas = [nadiCancellation(a, b), ganaCancellation(a, b)];
  return { kootas, total, max: 36, compatibility, doshas, methodology: METHODOLOGY, a, b };
}

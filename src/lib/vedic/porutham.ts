/**
 * Ten Porutham (South-Indian / Tamil) marriage matching — Growth P2 (P2-7,
 * improvements GP2-10PORUTHAM). The Dravidian system used in Tamil Nadu, Kerala
 * and Sri Lanka, offered alongside the North-Indian 36-guna Ashtakoota.
 *
 * All ten poruthams derive from each person's Moon Nakshatra + Moon sign, reusing
 * the shared classical tables (nakshatraAttributes.ts) and the engine's validated
 * planetary friendships (sthanaBala). Convention follows mainstream Tamil Jothidam
 * sources (Pambu Panchangam lineage); where tiers are simplified it is disclosed
 * in the methodology note. calculatePorutham(bride, groom): the API passes the
 * bride/groom chosen on the match form for the directional poruthams —
 * disclosed on the page. Honest, calm framing (Rule 7): a guide, never a verdict.
 */
import { FRIENDS, ENEMIES, SIGN_LORDS } from './engine/sthanaBala';
import {
  NAK_ORDER, GANA, YONI, YONI_ENEMY,
} from './nakshatraAttributes';

export interface PoruthamPerson { nakshatra: string; rashiIndex: number; } // rashiIndex 0-based

export interface PoruthamDetail {
  key: string;
  label: string;
  met: boolean;
  essential?: boolean;   // Rajju & Dina are the make-or-break poruthams
  explanation: string;
}

export interface PoruthamResult {
  poruthams: PoruthamDetail[];
  metCount: number;
  total: number;             // 10
  essentialsMet: boolean;    // Rajju + Dina both met
  verdict: 'Excellent' | 'Good' | 'Average' | 'Challenging';
  methodology: string;
}

const relation = (p1: string, p2: string): 'friend' | 'enemy' | 'neutral' =>
  FRIENDS[p1]?.includes(p2) ? 'friend' : ENEMIES[p1]?.includes(p2) ? 'enemy' : 'neutral';

// Rajju grouping (5 body-part groups; same group between partners = Rajju dosha).
const RAJJU: Record<string, string> = {};
([
  ['Pada (feet)', ['Ashwini', 'Ashlesha', 'Magha', 'Jyeshtha', 'Mula', 'Revati']],
  ['Kati (waist)', ['Bharani', 'Pushya', 'Purva Phalguni', 'Anuradha', 'Purva Ashadha', 'Uttara Bhadrapada']],
  ['Udara (stomach)', ['Krittika', 'Punarvasu', 'Uttara Phalguni', 'Vishakha', 'Uttara Ashadha', 'Purva Bhadrapada']],
  ['Kanta (neck)', ['Rohini', 'Ardra', 'Hasta', 'Swati', 'Shravana', 'Shatabhisha']],
  ['Siro (head)', ['Mrigashira', 'Chitra', 'Dhanishtha']],
] as Array<[string, string[]]>).forEach(([group, stars]) => stars.forEach(s => { RAJJU[s] = group; }));

// Vedha (mutual obstruction) nakshatra pairs — the standard Tamil table: twelve
// pairs plus Mrigashira, Chitra and Dhanishtha (Avittam), which are all mutually
// vedha to one another. Sources (fetched 2026-10-24): epanchang.com/Vedha-Porutham
// ("Chithirai, Mrigasirsham and Avittam are mutually vedha to each other") and
// findyourfate.com/indianastro/10porutham.htm (same 12 pairs + the triple).
const VEDHA_PAIRS: Array<[string, string]> = [
  ['Ashwini', 'Jyeshtha'], ['Bharani', 'Anuradha'], ['Krittika', 'Vishakha'],
  ['Rohini', 'Swati'], ['Ardra', 'Shravana'],
  ['Punarvasu', 'Uttara Ashadha'], ['Pushya', 'Purva Ashadha'], ['Ashlesha', 'Mula'],
  ['Magha', 'Revati'], ['Purva Phalguni', 'Uttara Bhadrapada'],
  ['Uttara Phalguni', 'Purva Bhadrapada'], ['Hasta', 'Shatabhisha'],
  ['Mrigashira', 'Chitra'], ['Mrigashira', 'Dhanishtha'], ['Chitra', 'Dhanishtha'],
];
const VEDHA_SET = new Set<string>();
VEDHA_PAIRS.forEach(([a, b]) => { VEDHA_SET.add(`${a}|${b}`); VEDHA_SET.add(`${b}|${a}`); });
export const isVedhaPair = (a: string, b: string): boolean => VEDHA_SET.has(`${a}|${b}`);

// Dina: count from the girl's star to the boy's star (inclusive). Uttamam counts
// 2,4,6,8,9,11,13,15,18,20,24,26 per astroved.com/articles/nakshatra-porutham and
// findyourfate.com/indianastro/10porutham.htm (prokerala dina-porutham.htm gives
// the same list without 6). Every other count (incl. 10, 17, 19, 22, 27) does not
// agree; both prokerala and findyourfate state the 27th is rejected.
const DINA_GOOD_COUNTS = new Set([2, 4, 6, 8, 9, 11, 13, 15, 18, 20, 24, 26]);
// Same star (count 1): agrees (uttamam) for these eight stars; agrees at a
// secondary (madhyamam) level for the second group; otherwise does not agree.
// Both lists as given by prokerala.com dina-porutham and findyourfate.com.
const DINA_SAME_STAR_UTTAMAM = new Set(['Rohini', 'Ardra', 'Magha', 'Vishakha', 'Shravana', 'Hasta', 'Uttara Ashadha', 'Revati']);
const DINA_SAME_STAR_MADHYAMAM = new Set(['Ashwini', 'Krittika', 'Mrigashira', 'Punarvasu', 'Pushya', 'Uttara Phalguni', 'Chitra', 'Purva Ashadha']);

// Vasya (Rasi Vasya) — standard Tamil table, rasi → its vasya rasis (0 = Mesha).
// Identical on prokerala.com/astrology/porutham/vasya-porutham.htm and
// astroved.com/articles/vasya-porutham. The porutham agrees when either
// partner's Moon sign is vasya to the other's.
const RASI_VASYA: number[][] = [
  [7, 4],    // Mesha → Vrischika, Simha
  [3, 6],    // Vrishabha → Karka, Tula
  [5],       // Mithuna → Kanya
  [7, 8],    // Karka → Vrischika, Dhanu
  [6],       // Simha → Tula
  [2, 11],   // Kanya → Mithuna, Meena
  [9],       // Tula → Makara
  [3, 5],    // Vrischika → Karka, Kanya
  [11],      // Dhanu → Meena
  [10, 0],   // Makara → Kumbha, Mesha
  [0],       // Kumbha → Mesha
  [9],       // Meena → Makara
];
const RASI_NAMES = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];

// Mahendra: boy's star counted from girl's star landing on these is favourable.
const MAHENDRA_COUNTS = new Set([4, 7, 10, 13, 16, 19, 22, 25]);

export function calculatePorutham(a: PoruthamPerson, b: PoruthamPerson): PoruthamResult {
  const ia = NAK_ORDER.indexOf(a.nakshatra);
  const ib = NAK_ORDER.indexOf(b.nakshatra);
  // Count inclusive from girl (A) to boy (B), 1..27.
  const countAB = ((ib - ia + 27) % 27) + 1;

  const poruthams: PoruthamDetail[] = [];

  // 1. Dina (star health/prosperity) — standard Tamil count list (see DINA_GOOD_COUNTS).
  let dinaMet: boolean;
  let dinaWhy: string;
  if (countAB === 1) {
    if (DINA_SAME_STAR_UTTAMAM.has(a.nakshatra)) {
      dinaMet = true; dinaWhy = `Both share ${a.nakshatra} — one of the birth stars for which the same star agrees.`;
    } else if (DINA_SAME_STAR_MADHYAMAM.has(a.nakshatra)) {
      dinaMet = true; dinaWhy = `Both share ${a.nakshatra} — the same star agrees here at a middling (madhyamam) level.`;
    } else {
      dinaMet = false; dinaWhy = `Both share ${a.nakshatra} — for this star the tradition does not count the same star as agreeing.`;
    }
  } else {
    dinaMet = DINA_GOOD_COUNTS.has(countAB);
    dinaWhy = dinaMet
      ? `The boy's star is count ${countAB} from the girl's — a favourable Dina count.`
      : `The boy's star is count ${countAB} from the girl's — not one of the favourable counts (2, 4, 6, 8, 9, 11, 13, 15, 18, 20, 24, 26). One of the essential poruthams to be mindful of.`;
  }
  poruthams.push({ key: 'dina', label: 'Dina', met: dinaMet, essential: true,
    explanation: `Health, prosperity and general wellbeing of the couple, counted from the girl's birth star to the boy's. ${dinaWhy}` });

  // 2. Gana (temperament).
  const ga = GANA[a.nakshatra] || 'Manushya', gb = GANA[b.nakshatra] || 'Manushya';
  const ganaMet = ga === gb || !((ga === 'Rakshasa') !== (gb === 'Rakshasa'));
  poruthams.push({ key: 'gana', label: 'Gana', met: ganaMet,
    explanation: `Temperament class — ${ga} and ${gb}. ${ganaMet ? 'Compatible temperaments.' : 'A Rakshasa–non-Rakshasa pairing — the classic temperament gap.'}` });

  // 3. Mahendra (progeny & wellbeing).
  const mahendraMet = MAHENDRA_COUNTS.has(countAB);
  poruthams.push({ key: 'mahendra', label: 'Mahendra', met: mahendraMet,
    explanation: `Progeny and lasting wellbeing — the boy's star is count ${countAB} from the girl's. ${mahendraMet ? 'Lands on a favourable Mahendra count.' : 'Not on a Mahendra count (favourable counts are 4,7,10,13,16,19,22,25).'}` });

  // 4. Stree Deergha (longevity & prosperity of the wife) — boy's star > 9 from girl's.
  const streeMet = countAB > 9;
  poruthams.push({ key: 'stree-deergha', label: 'Stree Deergha', met: streeMet,
    explanation: `Longevity and prosperity, especially of the wife — the boy's star should be more than 9 nakshatras from the girl's (here ${countAB}). ${streeMet ? 'Satisfied.' : 'Count is 9 or fewer — the tradition reads this as weaker on this factor.'}` });

  // 5. Yoni (physical/instinctive compatibility).
  const ya = YONI[a.nakshatra] || 'Horse', yb = YONI[b.nakshatra] || 'Horse';
  const yoniMet = ya === yb || YONI_ENEMY[ya] !== yb;
  poruthams.push({ key: 'yoni', label: 'Yoni', met: yoniMet,
    explanation: `Instinctive and physical compatibility via the nakshatra animal — ${ya} and ${yb}. ${ya === yb ? 'Same animal: naturally in tune.' : yoniMet ? 'Neutral/compatible animals.' : 'Natural adversary animals.'}` });

  // 6. Rasi (Moon-sign relationship) — dosha on the 2/12, 5/9, 6/8 pairs.
  const posAB = ((b.rashiIndex - a.rashiIndex + 12) % 12) + 1;
  const posBA = ((a.rashiIndex - b.rashiIndex + 12) % 12) + 1;
  const rasiPair = [posAB, posBA].sort((x, y) => x - y).join('-');
  const rasiMet = !(rasiPair === '2-12' || rasiPair === '5-9' || rasiPair === '6-8');
  poruthams.push({ key: 'rasi', label: 'Rasi', met: rasiMet,
    explanation: `Emotional and material harmony via the Moon-sign pair (positions ${posAB}/${posBA}). ${rasiMet ? 'No adverse pairing.' : `An adverse ${rasiPair} pairing — an area to approach consciously.`}` });

  // 7. Rasyadhipathi (Moon-sign lords' friendship).
  const la = SIGN_LORDS[a.rashiIndex], lb = SIGN_LORDS[b.rashiIndex];
  const lordMet = la === lb || relation(la, lb) === 'friend' || relation(lb, la) === 'friend' ||
    (relation(la, lb) === 'neutral' && relation(lb, la) === 'neutral');
  poruthams.push({ key: 'rasyadhipathi', label: 'Rasyadhipathi', met: lordMet,
    explanation: `Mental rapport via the Moon-sign lords — ${la} and ${lb}. ${la === lb ? 'Same lord: minds run alike.' : lordMet ? 'Friendly or neutral lords.' : 'The lords are mutual enemies — the softer spot of this match.'}` });

  // 8. Vasya (mutual attraction / influence) — standard Tamil Rasi Vasya table.
  const vasyaAB = RASI_VASYA[a.rashiIndex]?.includes(b.rashiIndex) ?? false;
  const vasyaBA = RASI_VASYA[b.rashiIndex]?.includes(a.rashiIndex) ?? false;
  const vasyaMet = vasyaAB || vasyaBA;
  const ra8 = RASI_NAMES[a.rashiIndex], rb8 = RASI_NAMES[b.rashiIndex];
  poruthams.push({ key: 'vasya', label: 'Vasya', met: vasyaMet,
    explanation: `Mutual attraction and influence via the Moon signs — ${ra8} (girl) and ${rb8} (boy). ${vasyaMet ? `${vasyaAB ? `${rb8} is vasya to ${ra8}` : `${ra8} is vasya to ${rb8}`} in the standard table — satisfied.` : 'Neither sign is vasya to the other in the standard table — weaker on natural pull, often offset by other poruthams.'}` });

  // 9. Rajju (longevity of the marriage — the most important).
  const ra = RAJJU[a.nakshatra], rb = RAJJU[b.nakshatra];
  const rajjuMet = ra !== rb;
  poruthams.push({ key: 'rajju', label: 'Rajju', met: rajjuMet, essential: true,
    explanation: `Longevity and bond of the marriage — the single most important porutham. Both stars fall in ${ra === rb ? `the same Rajju (${ra}) — Rajju dosha, classically the most significant concern and the one to weigh carefully` : `different Rajjus (${ra} / ${rb}) — satisfied`}.` });

  // 10. Vedha (mutual obstruction).
  const vedhaMet = !isVedhaPair(a.nakshatra, b.nakshatra);
  poruthams.push({ key: 'vedha', label: 'Vedha', met: vedhaMet,
    explanation: `Freedom from mutual obstruction between the two stars. ${vedhaMet ? 'The stars are not a vedha pair — clear.' : `${a.nakshatra} and ${b.nakshatra} are a classical vedha (obstructing) pair — an area to be mindful of.`}` });

  const metCount = poruthams.filter(p => p.met).length;
  const essentialsMet = poruthams.filter(p => p.essential).every(p => p.met);
  const verdict: PoruthamResult['verdict'] =
    metCount >= 8 && essentialsMet ? 'Excellent'
      : metCount >= 6 && essentialsMet ? 'Good'
        : metCount >= 5 ? 'Average'
          : 'Challenging';

  const methodology =
    'Computed by the ten-porutham (Dravidian / Tamil Jothidam) system used in South India and Sri Lanka, from each person’s Moon Nakshatra and Moon sign (Lahiri ayanamsa). Rajju and Dina are the essential poruthams. The directional poruthams (Stree Deergha, Mahendra) use the boy and girl you selected on the form. Dina, Vasya and Vedha use the standard Tamil tables; where tiers are simplified (Yoni, Rasi) the mainstream convention is used; this is disclosed and the reading is offered calmly as guidance, never a verdict.';

  return { poruthams, metCount, total: 10, essentialsMet, verdict, methodology };
}

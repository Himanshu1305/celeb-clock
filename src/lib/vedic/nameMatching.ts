/**
 * Kundli milan by NAME (Batch 9b) — the traditional shortcut used when birth details
 * are not known: each name's FIRST SYLLABLE points to a Nakshatra pada (the same
 * 108-pada naming table used for baby names), the pada gives the Moon sign, and the
 * usual 36-point Ashtakoota is then read from those two stars.
 *
 * NO new matching logic here — the score comes from `calculateGunaMilan`
 * (matchmaking.ts, AstroSage-parity tested). This file only turns a name into
 * candidate padas.
 *
 * Sources:
 *  - Syllable → pada: src/data/nakshatraAksharas.ts (Drik Panchang 108-pada table,
 *    cross-checked with onlinejyotish.com) and its Devanagari first-akshara reader
 *    `aksharaKey` (src/data/babyNamesByAkshara.ts).
 *  - Letter equivalences: Drik Panchang "Find Rashi with Name"
 *    (drikpanchang.com/astrology/prediction/info/find-rashi-with-name.html, opened
 *    29 Oct 2026) lists ब together with व under Vrishabha ("Ba, Va (ब, व)") and श/ष
 *    under Kumbha ("Ga, Sa, Sha, Sh (ग, श, ष)") as well as "Sha" under Kanya. So a
 *    ब-name is read with the व syllables, and a श-name is offered both its Hasta
 *    reading (ष) and the स (Kumbha-side) reading.
 *  - aaps.space/kundli-milan-by-name (opened 29 Oct 2026): "Select closest sound word if
 *    No exact match available" — hence the manual syllable picker when nothing matches.
 *
 * Accuracy limit (shown on the page): a name only says which syllable the family chose;
 * it does not say where the Moon really was. Name matching is an approximation.
 */
import { NAKSHATRA_PADA_AKSHARAS, type PadaAkshara } from '@/data/nakshatraAksharas';
import { aksharaKey } from '@/data/babyNamesByAkshara';
import { calculateGunaMilan, type GunaMilanResult, type MatchLabels } from './matchmaking';

export const NAK_LIST = Object.keys(NAKSHATRA_PADA_AKSHARAS);

/** How a candidate was found. */
export type NameMatchVia = 'exact' | 'firstLetter' | 'equivalent';

export interface NameStar {
  nakshatra: string;
  pada: number;
  /** 0 = Mesha/Aries. */
  rashiIndex: number;
  akshara: PadaAkshara;
  via: NameMatchVia;
}

export interface NameReading {
  name: string;
  script: 'devanagari' | 'roman' | 'none';
  /** Candidate padas, most likely first. Empty → ask the user to pick a syllable. */
  candidates: NameStar[];
}

/** Moon sign of a Nakshatra pada: 9 padas per sign (2¼ nakshatras). */
export function rashiOfPada(nakshatra: string, pada: number): number {
  const i = NAK_LIST.indexOf(nakshatra);
  if (i < 0 || pada < 1 || pada > 4) return -1;
  return Math.floor((i * 4 + (pada - 1)) / 9);
}

function star(nakshatra: string, pada: number, via: NameMatchVia): NameStar {
  return { nakshatra, pada, rashiIndex: rashiOfPada(nakshatra, pada), akshara: NAKSHATRA_PADA_AKSHARAS[nakshatra][pada - 1], via };
}

/** Every pada in the table, in zodiac order — for the "pick the closest syllable" list. */
export const ALL_PADAS: NameStar[] = NAK_LIST.flatMap(n => [1, 2, 3, 4].map(p => star(n, p, 'exact')));

const PADA_KEYS = ALL_PADAS.map(s => ({ s, key: aksharaKey(s.akshara.hi) }));

/** A syllable written as a bare consonant (घ, ङ, छ, ष, ण, ठ, थ, झ, ञ) — the table gives only the letter. */
const isBare = (hi: string) => Array.from(hi).length === 1 && !/[अआइईउऊएऐओऔ]/.test(hi);

/** Drik Panchang letter groups (see header). */
const EQUIVALENT: Record<string, string> = { 'ब': 'व', 'श': 'स' };

function padasForKey(key: string): NameStar[] {
  const out: NameStar[] = [];
  const [c, v] = key.split('|');
  for (const { s, key: k } of PADA_KEYS) if (k === key) out.push({ ...s, via: 'exact' });
  if (!out.length && c) {
    for (const { s, key: k } of PADA_KEYS) {
      if (isBare(s.akshara.hi) && k === `${c}|a`) out.push({ ...s, via: 'firstLetter' });
    }
  }
  const eq = c ? EQUIVALENT[c] : undefined;
  if (eq) {
    let eqOut = PADA_KEYS.filter(p => p.key === `${eq}|${v}`).map(p => ({ ...p.s, via: 'equivalent' as const }));
    if (!eqOut.length) eqOut = PADA_KEYS.filter(p => isBare(p.s.akshara.hi) && p.key === `${eq}|a`).map(p => ({ ...p.s, via: 'equivalent' as const }));
    out.push(...eqOut);
  }
  return out;
}

// ── Roman spelling → Devanagari first-akshara keys ────────────────────────────
// Roman spelling is ambiguous (t = त or ट, d = द or ड, n = न or ण, th = थ or ठ), so
// every plausible reading is returned, the common (dental) one first.
const ONSETS: Array<[string, string[]]> = [
  ['chh', ['छ']], ['ksh', ['क']], ['ch', ['च', 'छ']], ['kh', ['ख']], ['gh', ['घ']], ['jh', ['झ']],
  ['th', ['थ', 'ठ', 'त']], ['dh', ['ध', 'ढ']], ['ph', ['फ']], ['bh', ['भ']], ['sh', ['श']],
  ['gy', ['ज', 'ग']], ['gn', ['ज', 'ग']],
  ['k', ['क']], ['q', ['क']], ['c', ['क']], ['g', ['ग']], ['j', ['ज']], ['z', ['ज']],
  ['t', ['त', 'ट']], ['d', ['द', 'ड']], ['n', ['न', 'ण']], ['p', ['प']], ['f', ['फ']],
  ['b', ['ब']], ['m', ['म']], ['y', ['य']], ['r', ['र']], ['l', ['ल']], ['v', ['व']], ['w', ['व']],
  ['s', ['स']], ['h', ['ह']],
];
const VOWELS: Array<[string, string[]]> = [
  ['aa', ['a']], ['ai', ['ai']], ['au', ['au']], ['ay', ['a']], ['a', ['a']],
  ['ee', ['i']], ['ei', ['e']], ['e', ['e']], ['ii', ['i']], ['i', ['i']],
  ['oo', ['u']], ['ou', ['au']], ['o', ['o']], ['uu', ['u']], ['u', ['u']],
];
const isVowelCh = (c: string) => 'aeiou'.includes(c);

function vowelAt(s: string, i: number): string[] {
  for (const [pat, vs] of VOWELS) if (s.startsWith(pat, i)) return vs;
  return ['a'];
}

/** Devanagari keys ("<consonant>|<vowel>") a Roman-spelt name could start with. */
export function romanKeys(name: string): string[] {
  const s = (name || '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z]/g, '');
  if (!s) return [];
  if (isVowelCh(s[0])) {
    const vs = vowelAt(s, 0);
    // Initial "E" is written both ए (Ekta) and ई (Esha) in Hindi names.
    const all = s[0] === 'e' && !s.startsWith('ei') ? ['e', 'i'] : vs;
    return all.map(v => `|${v}`);
  }
  const onset = ONSETS.find(([pat]) => s.startsWith(pat));
  if (!onset) return [];
  let i = onset[0].length;
  // Skip the rest of a consonant cluster (Pr-, Kr-, Shr-, Sw-, Sn-, Dhr-, Shy-…).
  while (i < s.length && !isVowelCh(s[i])) i++;
  const vs = vowelAt(s, i);
  const keys: string[] = [];
  for (const c of onset[1]) for (const v of vs) keys.push(`${c}|${v}`);
  return keys;
}

const DEVANAGARI = /^[ऀ-ॿ]/;

/** Read a name (Roman or Devanagari) into candidate Nakshatra padas. */
export function readName(raw: string): NameReading {
  const name = (raw || '').trim();
  const script: NameReading['script'] = !name ? 'none' : DEVANAGARI.test(name) ? 'devanagari' : /^[A-Za-zÀ-ɏ]/.test(name) ? 'roman' : 'none';
  const keys = script === 'devanagari' ? [aksharaKey(name)].filter((k): k is string => !!k) : script === 'roman' ? romanKeys(name) : [];
  const seen = new Set<string>();
  const candidates: NameStar[] = [];
  for (const k of keys) {
    for (const c of padasForKey(k)) {
      const id = `${c.nakshatra}#${c.pada}`;
      if (!seen.has(id)) { seen.add(id); candidates.push(c); }
    }
  }
  return { name, script, candidates };
}

/** Guna Milan from two name-stars — the same engine as birth-detail matching. */
export function matchByName(boy: NameStar, girl: NameStar, labels?: MatchLabels): GunaMilanResult {
  return calculateGunaMilan(
    { nakshatra: boy.nakshatra, pada: boy.pada, rashiIndex: boy.rashiIndex },
    { nakshatra: girl.nakshatra, pada: girl.pada, rashiIndex: girl.rashiIndex },
    labels,
  );
}

export const RASHI_EN = ['Aries (Mesha)', 'Taurus (Vrishabha)', 'Gemini (Mithuna)', 'Cancer (Karka)', 'Leo (Simha)', 'Virgo (Kanya)', 'Libra (Tula)', 'Scorpio (Vrishchika)', 'Sagittarius (Dhanu)', 'Capricorn (Makara)', 'Aquarius (Kumbha)', 'Pisces (Meena)'];
export const RASHI_HI_LIST = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'];

/** Hindi labels for the eight kootas, by engine key. */
export const KOOTA_HI: Record<string, string> = {
  varna: 'वर्ण', vashya: 'वश्य', tara: 'तारा', yoni: 'योनि',
  graha_maitri: 'ग्रह मैत्री', gana: 'गण', bhakoot: 'भकूट', nadi: 'नाड़ी',
};
/** Koota key → TermTip id. */
export const KOOTA_TERM_ID: Record<string, string> = {
  varna: 'varna', vashya: 'vashya', tara: 'tara', yoni: 'yoni',
  graha_maitri: 'grahaMaitri', gana: 'gana', bhakoot: 'bhakoot', nadi: 'nadi',
};
export const COMPAT_HI: Record<string, string> = {
  Excellent: 'उत्तम मिलान', Good: 'अच्छा मिलान', Acceptable: 'स्वीकार्य मिलान', Challenging: 'कम गुण — ध्यान से देखें',
};
export const DOSHA_HI: Record<string, string> = { 'Nadi Dosha': 'नाड़ी दोष', 'Bhakoot Dosha': 'भकूट दोष', 'Gana Dosha': 'गण दोष' };

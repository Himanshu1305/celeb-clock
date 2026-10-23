/**
 * Baby names by Nakshatra pada syllable (akshara) — Growth P1-6, re-indexed N6 (Oct 2026).
 *
 * ORIGINAL, hand-curated dataset: common Indian given names, each with its Devanagari
 * spelling, gender and a well-established meaning. Compiled from general knowledge of
 * Sanskrit/Hindi name meanings — not scraped from any competitor or paid names database.
 *
 * N6: names are NOT filed by hand any more. Each name is matched to a pada by the
 * first Devanagari akshara of its spelling — consonant AND vowel (matra) — so
 * देव (Dev) is "De", not "Da"; रोहन (Rohan) is "Ro", not "Ra"; दीपक (Deepak) is "Di",
 * not "De". Rules (see aksharaKey):
 *   • the first consonant of the akshara counts (a conjunct like ध्रु → ध); dental and
 *     retroflex are different letters (द ≠ ड, त ≠ ट, न ≠ ण), as in the 108-pada table;
 *   • श and ष are treated as one sound (they are pronounced alike in modern Hindi);
 *   • short and long vowels pair up (अ/आ, इ/ई, उ/ऊ), as in every pada-syllable list;
 *     ऐ and औ are their own vowels (गौरव is "Gau", not "Ga");
 *   • ऋ / ृ are read as "ri" (ऋषि → री).
 */
import { NAKSHATRA_PADA_AKSHARAS } from './nakshatraAksharas';

export type Gender = 'boy' | 'girl' | 'unisex';
export interface BabyName { name: string; hi: string; gender: Gender; meaning: string; }

const N = (name: string, hi: string, gender: Gender, meaning: string): BabyName => ({ name, hi, gender, meaning });

export const BABY_NAMES: BabyName[] = [
  // अ / ई / ऊ / ए (Krittika) · ओ (Rohini)
  N('Aarav', 'आरव', 'boy', 'peaceful, wise'), N('Ananya', 'अनन्या', 'girl', 'unique, matchless'),
  N('Arjun', 'अर्जुन', 'boy', 'bright, shining; the Pandava hero'), N('Aditi', 'अदिति', 'girl', 'boundless; mother of the gods'),
  N('Ira', 'इरा', 'girl', 'the earth; goddess Saraswati'), N('Ishaan', 'ईशान', 'boy', 'the sun; a form of Shiva'),
  N('Indira', 'इंदिरा', 'girl', 'goddess Lakshmi'),
  N('Utkarsh', 'उत्कर्ष', 'boy', 'advancement, prosperity'), N('Uma', 'उमा', 'girl', 'goddess Parvati; tranquillity'),
  N('Udhav', 'उद्धव', 'boy', 'festival; a friend of Krishna'),
  N('Ekta', 'एकता', 'girl', 'unity'), N('Ekansh', 'एकांश', 'boy', 'whole, complete'),
  N('Om', 'ओम', 'boy', 'the sacred primordial sound'), N('Ojas', 'ओजस', 'boy', 'vitality, lustre'),
  N('Omisha', 'ओमिशा', 'girl', 'goddess of birth and death'),
  // व
  N('Varun', 'वरुण', 'boy', 'god of the waters'), N('Vani', 'वाणी', 'girl', 'speech; goddess Saraswati'),
  N('Vasudha', 'वसुधा', 'girl', 'the earth'),
  N('Vihaan', 'विहान', 'boy', 'dawn, the start of a new day'), N('Vidya', 'विद्या', 'girl', 'knowledge, learning'),
  N('Vivaan', 'विवान', 'boy', 'full of life'),
  N('Vedant', 'वेदांत', 'boy', 'the end of the Vedas; ultimate wisdom'), N('Veda', 'वेदा', 'girl', 'sacred knowledge'),
  // क
  N('Karan', 'करण', 'boy', 'skilful; the warrior Karna'), N('Kavya', 'काव्या', 'girl', 'poetry'),
  N('Kartik', 'कार्तिक', 'boy', 'bestowing courage; son of Shiva'),
  N('Kiran', 'किरण', 'unisex', 'a ray of light'), N('Kirti', 'कीर्ति', 'girl', 'fame, glory'),
  N('Kunal', 'कुणाल', 'boy', 'lotus; a bird with beautiful eyes'), N('Kumud', 'कुमुद', 'unisex', 'the night lotus'),
  N('Keshav', 'केशव', 'boy', 'a name of Krishna'), N('Ketan', 'केतन', 'boy', 'home; a banner'),
  N('Komal', 'कोमल', 'girl', 'tender, soft'),
  // घ / छ (Ardra)
  N('Ghanshyam', 'घनश्याम', 'boy', 'dark as a rain-cloud; a name of Krishna'),
  N('Chhavi', 'छवि', 'girl', 'image, radiance'), N('Chhaya', 'छाया', 'girl', 'shade, shadow'),
  // ह
  N('Harsh', 'हर्ष', 'boy', 'joy, happiness'), N('Hansa', 'हंसा', 'girl', 'a swan; purity'),
  N('Hari', 'हरि', 'boy', 'a name of Vishnu'),
  N('Hitesh', 'हितेश', 'boy', 'one who wishes others well'), N('Himani', 'हिमानी', 'girl', 'goddess Parvati; snow'),
  N('Humera', 'हुमेरा', 'girl', 'a mythical bird of fortune'),
  N('Hemant', 'हेमंत', 'boy', 'early winter; golden'), N('Hema', 'हेमा', 'girl', 'golden'),
  // द (dental) — Purva Bhadrapada / Uttara Bhadrapada / Revati
  N('Daksh', 'दक्ष', 'boy', 'capable, skilled'),
  N('Divya', 'दिव्या', 'girl', 'divine, brilliant'), N('Dinesh', 'दिनेश', 'boy', 'the sun (lord of the day)'),
  N('Diya', 'दीया', 'girl', 'a lamp, light'), N('Deepak', 'दीपक', 'boy', 'a lamp; light'),
  N('Deepa', 'दीपा', 'girl', 'a lamp'),
  N('Durga', 'दुर्गा', 'girl', 'the invincible goddess'), N('Dushyant', 'दुष्यंत', 'boy', 'a king; the father of Bharata'),
  N('Dev', 'देव', 'boy', 'god, divine'),
  // म
  N('Manish', 'मनीष', 'boy', 'lord of the mind; intellect'), N('Maya', 'माया', 'girl', 'illusion; divine creative power'),
  N('Madhav', 'माधव', 'boy', 'a name of Krishna'),
  N('Mira', 'मीरा', 'girl', 'the devotee-saint Mirabai'), N('Mihir', 'मिहिर', 'boy', 'the sun'),
  N('Mukul', 'मुकुल', 'boy', 'a bud, a blossom'), N('Mukta', 'मुक्ता', 'girl', 'a pearl; liberated'),
  N('Megh', 'मेघ', 'boy', 'a cloud'), N('Meghna', 'मेघना', 'girl', 'a river; of the clouds'),
  N('Mohan', 'मोहन', 'boy', 'charming; a name of Krishna'), N('Mohini', 'मोहिनी', 'girl', 'enchanting'),
  // त (dental) — Swati P4 / Vishakha
  N('Tara', 'तारा', 'girl', 'a star'), N('Tanish', 'तनिष', 'boy', 'ambition'), N('Tanvi', 'तन्वी', 'girl', 'slender, delicate'),
  N('Tilak', 'तिलक', 'boy', 'the auspicious mark on the forehead'),
  N('Tushar', 'तुषार', 'boy', 'snow, frost'), N('Tulsi', 'तुलसी', 'girl', 'the sacred basil plant'),
  N('Tejas', 'तेजस', 'boy', 'brilliance, radiance'), N('Tejal', 'तेजल', 'girl', 'lustrous'),
  // प
  N('Parth', 'पार्थ', 'boy', 'a name of Arjuna'), N('Pallavi', 'पल्लवी', 'girl', 'new leaves, a sprout'),
  N('Pavan', 'पवन', 'boy', 'the wind; pure'),
  N('Piyush', 'पीयूष', 'boy', 'nectar'), N('Piya', 'पिया', 'girl', 'beloved'),
  N('Puneet', 'पुनीत', 'boy', 'pure, holy'), N('Puja', 'पूजा', 'girl', 'worship, prayer'),
  // श / ष (Hasta P2)
  N('Shalini', 'शालिनी', 'girl', 'modest, well-behaved'), N('Sharv', 'शर्व', 'boy', 'a name of Shiva'),
  N('Shanti', 'शांति', 'girl', 'peace'), N('Shashank', 'शशांक', 'boy', 'the moon'),
  // स
  N('Sahil', 'साहिल', 'boy', 'the shore, a guide'), N('Saanvi', 'सान्वी', 'girl', 'goddess Lakshmi'),
  N('Samarth', 'समर्थ', 'boy', 'capable, powerful'),
  N('Siddharth', 'सिद्धार्थ', 'boy', 'one who has achieved a goal'), N('Simran', 'सिमरन', 'girl', 'remembrance of God'),
  N('Suresh', 'सुरेश', 'boy', 'ruler of the gods (Indra)'), N('Sunita', 'सुनीता', 'girl', 'well-mannered, righteous'),
  N('Suhani', 'सुहानी', 'girl', 'pleasant, lovely'),
  N('Sejal', 'सेजल', 'girl', 'pure river water'),
  N('Sohan', 'सोहन', 'boy', 'charming, handsome'), N('Sonal', 'सोनल', 'girl', 'golden'),
  // न (dental) — Anuradha
  N('Nakul', 'नकुल', 'boy', 'the youngest Pandava'), N('Nandini', 'नंदिनी', 'girl', 'joyful; a sacred cow'),
  N('Navya', 'नव्या', 'girl', 'new, young'), N('Naveen', 'नवीन', 'boy', 'new'),
  N('Nikhil', 'निखिल', 'boy', 'complete, whole'), N('Nisha', 'निशा', 'girl', 'the night'),
  N('Niraj', 'नीरज', 'boy', 'the lotus'), N('Neel', 'नील', 'boy', 'blue; sapphire'),
  N('Nutan', 'नूतन', 'unisex', 'new, fresh'),
  N('Neha', 'नेहा', 'girl', 'love, affection'),
  // य
  N('Yash', 'यश', 'boy', 'fame, success'), N('Yamini', 'यामिनी', 'girl', 'the night'),
  N('Yuvan', 'युवान', 'boy', 'youthful'),
  N('Yogesh', 'योगेश', 'boy', 'lord of yoga (Shiva)'),
  // भ
  N('Bhavya', 'भव्य', 'unisex', 'grand, magnificent'), N('Bharat', 'भरत', 'boy', 'to be maintained; India'),
  N('Bhim', 'भीम', 'boy', 'formidable; the Pandava'),
  N('Bhumi', 'भूमि', 'girl', 'the earth'),
  // ध
  N('Dhara', 'धारा', 'girl', 'a stream; the earth'),
  // ज
  N('Jay', 'जय', 'boy', 'victory'), N('Janya', 'जन्या', 'girl', 'life, born'),
  N('Jitesh', 'जितेश', 'boy', 'lord of victory'),
  // ख (Shravana)
  N('Khushi', 'खुशी', 'girl', 'happiness'),
  // ग
  N('Ganesh', 'गणेश', 'boy', 'lord of the ganas'), N('Garima', 'गरिमा', 'girl', 'dignity, grace'),
  N('Gayatri', 'गायत्री', 'girl', 'the Vedic hymn; a goddess'),
  N('Girish', 'गिरीश', 'boy', 'lord of the mountain (Shiva)'), N('Geeta', 'गीता', 'girl', 'song; the Bhagavad Gita'),
  N('Gunjan', 'गुंजन', 'unisex', 'the humming of a bee'),
  N('Gopal', 'गोपाल', 'boy', 'the cowherd; Krishna'), N('Gomati', 'गोमती', 'girl', 'a sacred river'),
  // र
  N('Rahul', 'राहुल', 'boy', 'conqueror of miseries; son of the Buddha'), N('Radha', 'राधा', 'girl', 'the beloved of Krishna; prosperity'),
  N('Riya', 'रिया', 'girl', 'a singer; graceful'), N('Rishi', 'ऋषि', 'boy', 'a sage'),
  N('Ruchi', 'रुचि', 'girl', 'interest, lustre'), N('Rudra', 'रुद्र', 'boy', 'a fierce form of Shiva'),
  N('Rehan', 'रेहान', 'boy', 'sweet basil; a bunch of flowers'),
  N('Rohan', 'रोहन', 'boy', 'ascending; sandalwood'), N('Rohit', 'रोहित', 'boy', 'red; the first ray of the sun'),
  N('Roshni', 'रोशनी', 'girl', 'light, brightness'),
  // च
  N('Charvi', 'चार्वी', 'girl', 'a beautiful woman'), N('Chirag', 'चिराग', 'boy', 'a lamp, light'),
  // ल
  N('Lakshya', 'लक्ष्य', 'boy', 'aim, target'), N('Lavanya', 'लावण्या', 'girl', 'grace, beauty'),
  N('Lila', 'लीला', 'girl', 'play; the divine play'), N('Lekha', 'लेखा', 'girl', 'writing'),
  N('Lokesh', 'लोकेश', 'boy', 'lord of the world'),
];

// ── Devanagari first-akshara key ─────────────────────────────────────────────
const VIRAMA = '्';
const NUKTA = '़';
const NUKTA_FORMS: Record<string, string> = {
  'क़': 'क', 'ख़': 'ख', 'ग़': 'ग', 'ज़': 'ज', 'ड़': 'ड', 'ढ़': 'ढ', 'फ़': 'फ', 'य़': 'य',
};
const INDEPENDENT_VOWEL: Record<string, string> = {
  'अ': 'a', 'आ': 'a', 'इ': 'i', 'ई': 'i', 'उ': 'u', 'ऊ': 'u', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
};
const MATRA: Record<string, string> = {
  'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'ृ': 'i', 'े': 'e', 'ॆ': 'e', 'ॅ': 'e',
  'ै': 'ai', 'ो': 'o', 'ॊ': 'o', 'ॉ': 'o', 'ौ': 'au',
};
const isConsonant = (c: string) => (c >= 'क' && c <= 'ह') || (c >= 'क़' && c <= 'य़');
const baseConsonant = (c: string) => {
  const b = NUKTA_FORMS[c] || c;
  return b === 'ष' ? 'श' : b; // श and ष sound alike in modern Hindi
};

/**
 * Key of the first akshara of a Devanagari word: "<consonant>|<vowel>", e.g.
 * देव → "द|e", रोहन → "र|o", दीपक → "द|i", ध्रुव → "ध|u", अर्जुन → "|a".
 * Returns null for text that does not start with Devanagari.
 */
export function aksharaKey(word: string): string | null {
  const s = (word || '').normalize('NFC');
  const chars = Array.from(s);
  const c0 = chars[0];
  if (!c0) return null;
  if (c0 === 'ऋ') return 'र|i';
  if (INDEPENDENT_VOWEL[c0]) return `|${INDEPENDENT_VOWEL[c0]}`;
  if (!isConsonant(c0)) return null;
  let i = 1;
  if (chars[i] === NUKTA) i++;
  // Skip the rest of a conjunct (virama + consonant [+ nukta]).
  while (chars[i] === VIRAMA && chars[i + 1] && isConsonant(chars[i + 1])) {
    i += 2;
    if (chars[i] === NUKTA) i++;
  }
  const vowel = chars[i] && MATRA[chars[i]] ? MATRA[chars[i]] : 'a';
  return `${baseConsonant(c0)}|${vowel}`;
}

/** All names whose first akshara matches a Devanagari pada syllable. */
export function namesForSyllable(hi: string): BabyName[] {
  const key = aksharaKey(hi);
  if (!key) return [];
  return BABY_NAMES.filter(n => aksharaKey(n.hi) === key);
}

/** Names for one Nakshatra pada (1–4). */
export function namesForPada(nakshatra: string, pada: number): BabyName[] {
  const row = NAKSHATRA_PADA_AKSHARAS[nakshatra];
  if (!row || pada < 1 || pada > 4) return [];
  return namesForSyllable(row[pada - 1].hi);
}

/** Every (nakshatra, pada) a name fits — used by tests to check the whole list. */
export function padasForName(n: BabyName): { nakshatra: string; pada: number }[] {
  const key = aksharaKey(n.hi);
  const out: { nakshatra: string; pada: number }[] = [];
  for (const [nak, row] of Object.entries(NAKSHATRA_PADA_AKSHARAS)) {
    row.forEach((p, i) => { if (aksharaKey(p.hi) === key) out.push({ nakshatra: nak, pada: i + 1 }); });
  }
  return out;
}

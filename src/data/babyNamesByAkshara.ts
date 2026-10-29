/**
 * Baby names by Nakshatra pada syllable (akshara) — Growth P1-6, re-indexed N6 (Oct 2026),
 * fully re-sourced in Batch 8 (26 Oct 2026).
 *
 * EVERY name below carries the URL of a page that was opened with WebFetch and that states
 * its meaning (and, where noted, its gender). Nothing is from "general knowledge" any more:
 * names that could not be sourced were removed, and meanings were corrected to what the
 * source says. Sources used: behindthename.com (curated name pages and the "Hindi names"
 * usage list), en.wikipedia.org given-name / mythology pages, wisdomlib.org (Monier-Williams,
 * Apte/DDSA, Shabda-Sagara and DDSA Hindi-English dictionaries), kosha.sanskrit.today
 * (Monier-Williams, Apte, Macdonell), Britannica, nordicnames.de, nameberry.com and
 * rekhtadictionary.com. Riya stays out: behindthename forum found no reliable etymology.
 * Where a dictionary gives a word rather than a name, gender follows the dictionary's own
 * grammatical label (m. / f.) for that word, as quoted in the comment.
 *
 * A second Batch 8 pass (same day) re-sourced many of the removed names and filled empty
 * syllables; see the block at the end of the list.
 *
 * Batch 8 removals (not sourceable in the first pass, or the sourced meaning was not positive):
 *   Aarav — behindthename "Hindi names" list: "crying, howling, noise" (not positive).
 *   Ekansh — Monier-Williams ekāṃśa = "a single part, one part" (not "whole").
 *   Vivaan — swarajyamag.com: the Sanskrit word means "a woven chair", not "full of life".
 *   Sharv — Monier-Williams śarva: "a god who kills people with arrows" (harm).
 *   Saanvi — behindthename forum: no reliable etymology.
 *   Piya — DDSA Hindi: piyā = "(darling) husband" (gender/meaning mismatch).
 *   Kumud, Ketan — dictionary words are neuter, no source for a name's gender.
 *   Komal, Samarth — adjectives only, no source for a name's gender.
 *   Hansa, Humera, Maya, Meghna, Tejal, Sejal, Sahil, Ghanshyam — the pages opened gave no
 *   meaning or no gender. Every other earlier name that is not in the list below was removed
 *   because the web-search budget ran out before a source page could be opened; such a name
 *   may come back only together with a source URL.
 *
 * Batch 9b removal (29 Oct 2026): Sohan — rekhtadictionary.com/meaning-of-sohan gives the
 *   Sanskrit adjective "beautiful, handsome" with no gender and does not describe it as a
 *   personal name; behindthename.com/name/sohan and nameberry.com list only an unrelated
 *   French name. No source states the Hindi name's gender, so it was removed (as Komal and
 *   Samarth were).
 *
 * N6: names are NOT filed by hand. Each name is matched to a pada by the
 * first Devanagari akshara of its spelling — consonant AND vowel (matra) — so
 * देव (Dev) is "De", not "Da"; सोहन (Sohan) is "So", not "Sa"; दीपक (Deepak) is "Di",
 * not "De". Rules (see aksharaKey):
 *   • the first consonant of the akshara counts (a conjunct like प्रे → प); dental and
 *     retroflex are different letters (द ≠ ड, त ≠ ट, न ≠ ण), as in the 108-pada table;
 *   • श and ष are treated as one sound (they are pronounced alike in modern Hindi);
 *   • short and long vowels pair up (अ/आ, इ/ई, उ/ऊ), as in every pada-syllable list;
 *     ऐ and औ are their own vowels (गौरव is "Gau", not "Ga");
 *   • ऋ / ृ are read as "ri" (ऋषि → री).
 */
import { NAKSHATRA_PADA_AKSHARAS } from './nakshatraAksharas';

export type Gender = 'boy' | 'girl' | 'unisex';
export interface BabyName {
  name: string;
  hi: string;
  gender: Gender;
  meaning: string;
  /** URL of the page (opened via WebFetch) that states this meaning. Required. */
  source: string;
}

const N = (name: string, hi: string, gender: Gender, meaning: string, source: string): BabyName =>
  ({ name, hi, gender, meaning, source });

const BTN_HINDI_1 = 'https://www.behindthename.com/names/usage/hindi';
const BTN_HINDI_2 = 'https://www.behindthename.com/names/usage/hindi/2';
const WL = (slug: string) => `https://www.wisdomlib.org/definition/${slug}`;
const WP = (slug: string) => `https://en.wikipedia.org/wiki/${slug}`;
const BTN = (slug: string) => `https://www.behindthename.com/name/${slug}`;

export const BABY_NAMES: BabyName[] = [
  // ── Vowels: अ / ई / ऊ / ए (Krittika) · ओ (Rohini) ─────────────────────────────
  // kosha अनन्य: Spoken Sanskrit "unique"; MW 1872 "no other"; BTN /name/ananya: feminine.
  N('Ananya', 'अनन्या', 'girl', 'unique, one of a kind', 'https://kosha.sanskrit.today/word/sa/अनन्य'),
  // WP Arjuna: "according to Monier Monier-Williams, the word Arjuna means white, clear or
  // silver"; BTN Hindi list: Arjun, masculine.
  N('Arjun', 'अर्जुन', 'boy', 'white, clear, bright', WP('Arjuna')),
  // BTN Hindi list: Aditi f, "boundless, entire" or "freedom, security".
  N('Aditi', 'अदिति', 'girl', 'boundless; freedom', BTN_HINDI_1),
  // MW irā "f. … the earth, speech, the goddess of speech, Sarasvatī".
  N('Ira', 'इरा', 'girl', 'the earth; speech; the goddess Sarasvati', WL('ira')),
  // MW īśāna "m. a ruler, master, one of the older names of Śiva-Rudra".
  N('Ishaan', 'ईशान', 'boy', 'ruler, master; a name of Shiva', WL('ishana')),
  // Shabda-Sagara indirā "f. Name of Lakṣmī …; beauty or splendour".
  N('Indira', 'इंदिरा', 'girl', 'a name of Lakshmi; beauty, splendour', WL('indira')),
  // WP Utkarsh: "primarily for males", "prosperity, awakening, development and flourishing".
  N('Utkarsh', 'उत्कर्ष', 'boy', 'prosperity, development, flourishing', WP('Utkarsh')),
  // MW umā: "splendour, light", "quiet, tranquillity"; daughter of Himavat, wife of Śiva (Pārvatī).
  N('Uma', 'उमा', 'girl', 'light, tranquillity; a name of Parvati', WL('uma')),
  // MW uddhava "m. … a festival, holiday; joy, pleasure; Name of a Yādava (Kṛṣṇa's friend)".
  N('Udhav', 'उद्धव', 'boy', 'joy, festival; Krishna’s friend Uddhava', WL('uddhava')),
  // MW ekatā "f. oneness, unity, union"; DDSA Hindi "(nf) oneness; unity, solidarity".
  N('Ekta', 'एकता', 'girl', 'oneness, unity', WL('ekata')),
  // BTN Hindi list p.2: Om, m, ओम, "sacred syllable".
  N('Om', 'ओम', 'boy', 'the sacred syllable Om', BTN_HINDI_2),

  // ── व ─────────────────────────────────────────────────────────────────────────
  // BTN Varuna: masculine; "a god of water and the ocean, also associated with the sky and law".
  N('Varun', 'वरुण', 'boy', 'Varuna, god of water and the ocean', BTN('varuna')),
  // WP Vani (given name): female, "eloquent in words".
  N('Vani', 'वाणी', 'girl', 'eloquent in words', WP('Vani_(given_name)')),
  // BTN Vasudha: feminine, "holding wealth", used to refer to the earth.
  N('Vasudha', 'वसुधा', 'girl', 'the earth (literally “holding wealth”)', BTN('vasudha')),
  // BTN Vihaan: masculine, Sanskrit vihāna "dawn, morning".
  N('Vihaan', 'विहान', 'boy', 'dawn, morning', BTN('vihaan')),
  // MW vidyā "f. knowledge, science, learning".
  N('Vidya', 'विद्या', 'girl', 'knowledge, learning', WL('vidya')),
  // MW vedānta "m. end of the Veda" (the Upaniṣads; the Vedānta philosophy).
  N('Vedant', 'वेदांत', 'boy', 'the end of the Vedas; the Vedanta philosophy', WL('vedanta')),

  // ── क ─────────────────────────────────────────────────────────────────────────
  // WP Karan (given name): masculine; derives from Karna of the Mahabharata.
  N('Karan', 'करण', 'boy', 'from Karna, a hero of the Mahabharata', WP('Karan_(given_name)')),
  // MW kāvyā "f. intelligence"; DDSA Hindi kāvya "(nm) poetry".
  N('Kavya', 'काव्या', 'girl', 'poetry; intelligence', WL('kavya')),
  // wisdomlib kārtika: "An epithet of Skanda" (son of Śiva); the month Kārtika.
  N('Kartik', 'कार्तिक', 'boy', 'an epithet of Skanda (Kartikeya)', WL('kartika')),
  // WP Kiran (given name): unisex, "ray of sun".
  N('Kiran', 'किरण', 'unisex', 'a ray of sun', WP('Kiran_(given_name)')),
  // MW kīrti "good report, fame, renown, glory"; DDSA Hindi noun, feminine.
  N('Kirti', 'कीर्ति', 'girl', 'fame, glory', WL('kirti')),
  // WP Kunala (son of Emperor Ashoka): "Kunal also means 'bird with beautiful eyes' … 'one with beautiful eyes'".
  N('Kunal', 'कुणाल', 'boy', 'one with beautiful eyes', WP('Kunala')),
  // MW keśava "having long or much or handsome hair"; "m. Name of Viṣṇu or Kṛṣṇa".
  N('Keshav', 'केशव', 'boy', 'having beautiful hair; a name of Krishna', WL('kesava')),

  // ── छ (Ardra P4) ──────────────────────────────────────────────────────────────
  // MW chavi "f. … complexion, colour; beauty, splendour; a ray of light".
  N('Chhavi', 'छवि', 'girl', 'beauty, splendour; a ray of light', WL('chavi')),
  // MW chāyā (feminine) "shade, shadow"; "colour, complexion, beauty".
  N('Chhaya', 'छाया', 'girl', 'shade; beauty', WL('chaya')),

  // ── ह ─────────────────────────────────────────────────────────────────────────
  // MW harṣa "m. joy, pleasure, happiness".
  N('Harsh', 'हर्ष', 'boy', 'joy, happiness', WL('harsha')),
  // WP Hari: one of the main epithets of Vishnu, "the one who takes away (sins)".
  N('Hari', 'हरि', 'boy', 'a name of Vishnu', WP('Hari')),
  // WP Hitesh: "a common Hindu masculine given name", "one who thinks well of everyone".
  N('Hitesh', 'हितेश', 'boy', 'one who thinks well of everyone', WP('Hitesh')),
  // Shabda-Sagara / MW himānī "f. Ice and snow"; Cappeller "a mass or collection of snow".
  N('Himani', 'हिमानी', 'girl', 'snow', WL('himani')),
  // WP Hemant: male; "namesake of Hemanta, one of the six Indian ecological seasons" (early winter).
  N('Hemant', 'हेमंत', 'boy', 'named after Hemanta, the early-winter season', WP('Hemant')),
  // MW hema "n. gold"; feminine hemā "a handsome woman"; DDSA Hindi "gold".
  N('Hema', 'हेमा', 'girl', 'gold', WL('hema')),

  // ── द (dental) — Purva Bhadrapada / Uttara Bhadrapada / Revati ───────────────
  // MW dakṣa "able, fit, adroit, expert, clever"; m. "ability, talent"; Name of an Āditya.
  N('Daksh', 'दक्ष', 'boy', 'able, skilful, clever', WL('daksha')),
  // MW divya "divine, heavenly, celestial … charming, beautiful"; Divyā is a woman's name in the Purāṇas.
  N('Divya', 'दिव्या', 'girl', 'divine, heavenly', WL('divya')),
  // WP Dinesh: male, "lord of the day", "Sun".
  N('Dinesh', 'दिनेश', 'boy', 'lord of the day; the Sun', WP('Dinesh')),
  // WP Diya (name): female, "Light, lamp".
  N('Diya', 'दीया', 'girl', 'light, lamp', WP('Diya_(name)')),
  // WP Deepak: masculine; "a Hindi word meaning 'lamp'".
  N('Deepak', 'दीपक', 'boy', 'a lamp', WP('Deepak')),
  // WP Deepa: "Unisex (traditionally Female)", "lamp" and "light".
  N('Deepa', 'दीपा', 'girl', 'lamp, light', WP('Deepa')),
  // Britannica Durga: the Sanskrit name means "the Inaccessible" or "the Impassable".
  N('Durga', 'दुर्गा', 'girl', 'the goddess Durga (“the inaccessible”)', 'https://britannica.com/topic/Durga'),
  // wisdomlib Duṣyanta: "a valiant king of the Lunar race", husband of Śakuntalā, father of Bharata.
  N('Dushyant', 'दुष्यंत', 'boy', 'a valiant king, father of Bharata', WL('dushyanta')),
  // BTN Dev: masculine, देव, from Sanskrit deva "god".
  N('Dev', 'देव', 'boy', 'god', BTN('dev')),
  // BTN Devika: feminine, देविका, "little goddess".
  N('Devika', 'देविका', 'girl', 'little goddess', BTN('devika')),

  // ── म ─────────────────────────────────────────────────────────────────────────
  // WP Manish: masculine, "The God of the Mind".
  N('Manish', 'मनीष', 'boy', 'god of the mind', WP('Manish')),
  // WP Manisha: "a Hindu female name", मनीषा, "meaning intelligence and desire".
  N('Manisha', 'मनीषा', 'girl', 'intelligence', WP('Manisha')),
  // MW mādhava "m. … Name of Kṛṣṇa-Viṣṇu".
  N('Madhav', 'माधव', 'boy', 'a name of Krishna', WL('madhava')),
  // WP Mira (given name): female; "In Sanskrit, it means 'ocean', 'sea'".
  N('Mira', 'मीरा', 'girl', 'the ocean, the sea', WP('Mira_(given_name)')),
  // wisdomlib names/mihir: "a masculine given name of Sanskrit origin" meaning "sun".
  N('Mihir', 'मिहिर', 'boy', 'the sun', 'https://www.wisdomlib.org/names/mihir'),
  // MW muktā "a pearl"; DDSA Hindi feminine noun "a pearl".
  N('Mukta', 'मुक्ता', 'girl', 'a pearl', WL('mukta')),
  // MW megha "m. a cloud".
  N('Megh', 'मेघ', 'boy', 'a cloud', WL('megha')),
  // BTN Mohana: मोहन (m.) "bewitching, infatuating, charming"; a title of Shiva and Krishna.
  N('Mohan', 'मोहन', 'boy', 'charming; a title of Krishna', BTN('mohana')),
  // MW mohinī "a fascinating woman"; DDSA Hindi "one who charms, attracts".
  N('Mohini', 'मोहिनी', 'girl', 'enchanting, fascinating', WL('mohini')),

  // ── त (dental) — Swati P4 / Vishakha ─────────────────────────────────────────
  // BTN Tara (2): feminine, तारा, "star".
  N('Tara', 'तारा', 'girl', 'a star', BTN('tara-2')),
  // WP Tanvi: feminine given name, "slender-bodied maiden".
  N('Tanvi', 'तन्वी', 'girl', 'slender, delicate', WP('Tanvi')),
  // DDSA Hindi tilaka "an ornamental or religious mark over the forehead"; MW "m.".
  N('Tilak', 'तिलक', 'boy', 'the auspicious mark on the forehead', WL('tilaka')),
  // MW tulasī "f. holy basil".
  N('Tulsi', 'तुलसी', 'girl', 'the holy basil plant', WL('tulasi')),
  // MW tejas "glow, splendour, brilliance, light"; nameberry.com/babyname/tejas: masculine.
  N('Tejas', 'तेजस', 'boy', 'brilliance, splendour, light', WL('tejas')),
  // MW tejasvin "brilliant, splendid"; "m. Name of a son of Indra"; DDSA Hindi tejasvī "brilliant".
  N('Tejasvi', 'तेजस्वी', 'boy', 'brilliant, splendid', WL('tejasvin')),

  // ── प ─────────────────────────────────────────────────────────────────────────
  // WP Partha: "an epithet of Arjuna"; BTN /name/parth: masculine, पार्थ.
  N('Parth', 'पार्थ', 'boy', 'an epithet of Arjuna', WP('Partha')),
  // BTN Pallav: masculine, पल्लव, "budding leaf, shoot".
  N('Pallav', 'पल्लव', 'boy', 'budding leaf, shoot', BTN('pallav')),
  // BTN Hindi list p.2: Pallavi f, "Feminine form of Pallav".
  N('Pallavi', 'पल्लवी', 'girl', 'budding leaf, new shoot', BTN_HINDI_2),
  // BTN Pavana: masculine, पवन, "purification, wind, air".
  N('Pavan', 'पवन', 'boy', 'wind, air; purification', BTN('pavana')),
  // BTN Hindi list p.2 (all below): Padma f & m "lotus"; Prakash m "light, bright, shining";
  // Prashant m "calm, quiet"; Pratibha f "light, splendour, intelligence".
  N('Padma', 'पद्मा', 'unisex', 'lotus', BTN_HINDI_2),
  N('Prakash', 'प्रकाश', 'boy', 'light, bright, shining', BTN_HINDI_2),
  N('Prashant', 'प्रशान्त', 'boy', 'calm, quiet', BTN_HINDI_2),
  N('Pratibha', 'प्रतिभा', 'girl', 'light, splendour, intelligence', BTN_HINDI_2),
  // WP Piyush: "Hindu masculine given name", "milk" or "nectar".
  N('Piyush', 'पीयूष', 'boy', 'nectar', WP('Piyush')),
  // WP Priya (given name): female, प्रिया, "beloved", "favorite", "dear".
  N('Priya', 'प्रिया', 'girl', 'beloved, dear', WP('Priya_(given_name)')),
  // BTN Hindi list p.2: Priti f "pleasure, joy, love"; Pritam m "most beloved, dearest";
  // Priyanka f "agreeable, amiable"; Prem m "love, affection"; Prema f "Feminine form of Prem".
  N('Priti', 'प्रीति', 'girl', 'joy, love', BTN_HINDI_2),
  N('Pritam', 'प्रीतम', 'boy', 'most beloved, dearest', BTN_HINDI_2),
  N('Priyanka', 'प्रियंका', 'girl', 'agreeable, amiable', BTN_HINDI_2),
  N('Prem', 'प्रेम', 'boy', 'love, affection', BTN_HINDI_2),
  N('Prema', 'प्रेमा', 'girl', 'love, affection (feminine of Prem)', BTN_HINDI_2),
  // BTN Hindi list p.2: Puneet m (alt. of Punit "cleaned, purified"); Puja f "honour, worship";
  // Pushpa f & m "flower"; Purnima f "full moon".
  N('Puneet', 'पुनीत', 'boy', 'pure, purified', BTN_HINDI_2),
  N('Puja', 'पूजा', 'girl', 'honour, worship', BTN_HINDI_2),
  N('Pushpa', 'पुष्पा', 'unisex', 'a flower', BTN_HINDI_2),
  N('Purnima', 'पूर्णिमा', 'girl', 'the full moon', BTN_HINDI_2),

  // ── श / ष (Hasta P2) ──────────────────────────────────────────────────────────
  // DDSA śālinī "f. A mistress of the house"; WP Shalini: "a feminine name used in India".
  N('Shalini', 'शालिनी', 'girl', 'lady of the house', WL('shalini')),
  // MW śānti "f. tranquillity, peace, quiet, calmness of mind".
  N('Shanti', 'शांति', 'girl', 'peace, tranquillity', WL('shanti')),
  // WP Shashank: male, "Hare-marked" (the Moon).
  N('Shashank', 'शशांक', 'boy', 'the moon (literally “hare-marked”)', WP('Shashank')),
  // DDSA / Shabda-Sagara śarvāṇī "f. A name of Pārvatī".
  N('Sharvani', 'शर्वाणी', 'girl', 'a name of Parvati', WL('sharvani')),

  // ── स ─────────────────────────────────────────────────────────────────────────
  // BTN Siddhartha: masculine, "one who has accomplished a goal".
  N('Siddharth', 'सिद्धार्थ', 'boy', 'one who has accomplished a goal', BTN('siddhartha')),
  // BTN Simran: feminine & masculine, सिमरन, "continuous remembrance" (Punjabi).
  N('Simran', 'सिमरन', 'unisex', 'continuous remembrance', BTN('simran')),
  // kosha सुरेश: MW "a lord of the gods … of Indra"; Apte Hindi "इन्द्र का नाम"; BTN /name/suresh: masculine.
  N('Suresh', 'सुरेश', 'boy', 'lord of the gods; a name of Indra', 'https://kosha.sanskrit.today/word/sa/सुरेश'),
  // nordicnames.de Sunita: female; Sanskrit सुनीता "well conducted".
  N('Sunita', 'सुनीता', 'girl', 'well conducted', 'https://nordicnames.de/wiki/Sunita'),
  // rekhtadictionary सोहन: "beautiful, handsome; charming, pleasing" (सुंदर पुरुष).
  // WP Sonal: "unisex name", "golden" / "precious".
  N('Sonal', 'सोनल', 'unisex', 'golden', WP('Sonal')),

  // ── न (dental) — Anuradha ─────────────────────────────────────────────────────
  // WP Nakul: "an Indian masculine given name"; WP Nakula: the fourth of the five Pandava brothers.
  N('Nakul', 'नकुल', 'boy', 'Nakula, one of the five Pandava brothers', WP('Nakula')),
  // BTN Hindi list p.2: Naveen m (alt. of Navin "new, fresh"); Namrata f "bowing, humility";
  // Nandita f "joy"; Narendra m "lord of men"; Nikhil m "whole, entire"; Nisha f "night";
  // Niraj m "water-born, lotus"; Nishant m "night's end, dawn"; Nitya f & m "always, eternal";
  // Nirupama f "unequaled, matchless"; Neha f "love, tenderness".
  N('Naveen', 'नवीन', 'boy', 'new, fresh', BTN_HINDI_2),
  N('Namrata', 'नम्रता', 'girl', 'humility', BTN_HINDI_2),
  N('Nandita', 'नंदिता', 'girl', 'joy', BTN_HINDI_2),
  N('Narendra', 'नरेंद्र', 'boy', 'lord of men', BTN_HINDI_2),
  N('Nikhil', 'निखिल', 'boy', 'whole, entire', BTN_HINDI_2),
  N('Nisha', 'निशा', 'girl', 'the night', BTN_HINDI_2),
  N('Niraj', 'नीरज', 'boy', 'the lotus (literally “water-born”)', BTN_HINDI_2),
  N('Nishant', 'निशांत', 'boy', 'dawn (literally “night’s end”)', BTN_HINDI_2),
  N('Nitya', 'नित्या', 'unisex', 'eternal', BTN_HINDI_2),
  N('Nirupama', 'निरुपमा', 'girl', 'unequalled, matchless', BTN_HINDI_2),
  N('Neha', 'नेहा', 'girl', 'love, tenderness', BTN_HINDI_2),

  // ── भ ─────────────────────────────────────────────────────────────────────────
  // BTN Hindi list: Bharat m (modern form of Bharata); WP Names of India: Bharata "also means
  // 'one who is engaged in search for knowledge'"; Bharat is a name of India.
  N('Bharat', 'भरत', 'boy', 'a name of India; one who seeks knowledge', WP('Names_of_India')),
  // BTN Hindi list: Bharati f "descendant of Bharata"; Bhavana f "producing, manifesting, thought, emotion".
  N('Bharati', 'भारती', 'girl', 'descendant of Bharata', BTN_HINDI_1),
  N('Bhavana', 'भावना', 'girl', 'thought, feeling', BTN_HINDI_1),

  // ── ग ─────────────────────────────────────────────────────────────────────────
  // WP Gana: Ganesha's title gaṇeśa / gaṇapati means "lord or leader of the ganas".
  N('Ganesh', 'गणेश', 'boy', 'lord of the ganas (Lord Ganesha)', WP('Gana')),
  // WP List of titles and names of Krishna: "Gopāla — He who is a cow-protector".
  N('Gopal', 'गोपाल', 'boy', 'protector of cows; a name of Krishna', WP('List_of_titles_and_names_of_Krishna')),

  // ── र ─────────────────────────────────────────────────────────────────────────
  // WP Rahul: male, "Conqueror of all miseries".
  N('Rahul', 'राहुल', 'boy', 'conqueror of all miseries', WP('Rahul')),
  // BTN Hindi list p.2: Radha f "success, prosperity"; Raj m "empire, royalty"; Rachana f "creation".
  N('Radha', 'राधा', 'girl', 'success, prosperity', BTN_HINDI_2),
  N('Raj', 'राज', 'boy', 'royalty', BTN_HINDI_2),
  N('Rachana', 'रचना', 'girl', 'creation', BTN_HINDI_2),

  // ── च ─────────────────────────────────────────────────────────────────────────
  // BTN Hindi list: Chandan m, चन्दन, "sandalwood".
  N('Chandan', 'चन्दन', 'boy', 'sandalwood', BTN_HINDI_1),
  // Batch 7 (opened then via WebFetch): behindthename.com/name/chetan — masculine, चेतन, from
  // Sanskrit cetana "visible, conscious, soul"; behindthename.com/name/chetana — feminine form.
  N('Chetan', 'चेतन', 'boy', 'conscious, aware; the soul', BTN('chetan')),
  N('Chetana', 'चेतना', 'girl', 'consciousness, awareness (feminine of Chetan)', BTN('chetana')),
  // Batch 7: wisdomlib.org/definition/bhola, DDSA Hindi: भोला "innocent, simple-hearted; ~nātha Lord Shiv".
  N('Bholanath', 'भोलानाथ', 'boy', 'a name of Lord Shiva (bhola = innocent, simple-hearted)', WL('bhola')),
  // ── Batch 8, second pass (fresh search budget): each source opened via WebFetch ──────
  // Bharani — WP Lila (Hinduism): लीला "divine play"; nameberry.com/babyname/Leela: girl name, "play".
  N('Leela', 'लीला', 'girl', 'play; divine play', WP('Lila_(Hinduism)')),
  // MW lokeśa "m. lord of the world".
  N('Lokesh', 'लोकेश', 'boy', 'lord of the world', WL('lokesha')),
  // MW lohita "red, red-coloured"; also "Name … of a man".
  N('Lohit', 'लोहित', 'boy', 'red', WL('lohita')),
  // Jyeshtha — BTN Yash: masculine, यश, "fame, praise, glory".
  N('Yash', 'यश', 'boy', 'fame, glory', BTN('yash')),
  // WP Yamini (given name): female, यामिनी, "starry night".
  N('Yamini', 'यामिनी', 'girl', 'starry night', WP('Yamini_(given_name)')),
  // DDSA Hindi yuvraj "(nm) a prince".
  N('Yuvraj', 'युवराज', 'boy', 'a prince', WL('yuvraj')),
  // Mula — WP Yogesh: male, from yogeśa, "master of yoga".
  N('Yogesh', 'योगेश', 'boy', 'master of yoga', WP('Yogesh')),
  // Purva Ashadha — MW bhūmi "f. the earth, soil, ground".
  N('Bhumi', 'भूमि', 'girl', 'the earth', 'https://wisdomlib.org/definition/bhumi'),
  // MW bhūṣaṇa "decorating, adorning"; "m. Name of Viṣṇu".
  N('Bhushan', 'भूषण', 'boy', 'adorning; a name of Vishnu', WL('bhushana')),
  // nameberry.com Dhara: girl, Hindi, "the earth".
  N('Dhara', 'धारा', 'girl', 'the earth', 'https://nameberry.com/b/girl-baby-name-dhara'),
  // MW dhanya "fortunate, happy, auspicious"; dhanyā "f. Name of Dhruva's wife".
  N('Dhanya', 'धन्या', 'girl', 'fortunate, happy', WL('dhanya')),
  // Shravana — BTN Khushi: feminine, खुशी, "happiness" in Hindi.
  N('Khushi', 'खुशी', 'girl', 'happiness', BTN('khushi')),
  // WP Khushboo: "female given name", "fragrance".
  N('Khushboo', 'खुशबू', 'girl', 'fragrance', WP('Khushboo')),
  // Rekhta खेम: "Noun, Masculine" "well being, welfare" (क्षेम, कल्याण).
  N('Khem', 'खेम', 'boy', 'well-being, welfare', 'https://rekhtadictionary.com/meaning-of-khem'),
  // Ashwini — BTN Lata: feminine, लता, "vine, creeping plant".
  N('Lata', 'लता', 'girl', 'a vine, a creeper', BTN('lata')),
  // Caturvedi Hindi lakṣya "(nm) the aim, object/objective, target, goal".
  N('Lakshya', 'लक्ष्य', 'boy', 'aim, goal', WL('lakshya')),
  // Uttara Ashadha — BTN Jaya: जय (m.) / जया (f.), "victory"; BTN Jayanta: masculine, "victorious".
  N('Jay', 'जय', 'boy', 'victory', BTN('jaya')),
  N('Jaya', 'जया', 'girl', 'victory', BTN('jaya')),
  N('Jayant', 'जयंत', 'boy', 'victorious', BTN('jayanta')),
  // Dhanishtha — BTN Gita: feminine, गीता, from gīta "song".
  N('Geeta', 'गीता', 'girl', 'song', BTN('gita-1')),
  // BTN Girisha: masculine, गिरीश, "lord of the mountain", a title of Shiva.
  N('Girish', 'गिरीश', 'boy', 'lord of the mountain (Shiva)', BTN('girisha')),
  // Pushya — WP Hemlata: female, "Golden creeper".
  N('Hemlata', 'हेमलता', 'girl', 'golden creeper', WP('Hemlata')),
  // Purva Phalguni — WP Mohit: "attractive (also another name for Lord Krishna)"; BTN Mohit: masculine, मोहित.
  N('Mohit', 'मोहित', 'boy', 'attractive; a name of Krishna', WP('Mohit')),
  // Swati — WP Rohit (name): typically male, रोहित, "signifies the color red".
  N('Rohit', 'रोहित', 'boy', 'red', WP('Rohit_(name)')),
  // BTN Rupa: feminine, रूपा, from rūpa "shape, form".
  N('Rupa', 'रूपा', 'girl', 'form, shape', BTN('rupa')),
  // WP Rekha (given name): feminine, "Sanskrit word, meaning line".
  N('Rekha', 'रेखा', 'girl', 'a line', WP('Rekha_(given_name)')),
  // BTN Roshni: feminine, रोशनी, "light, brightness".
  N('Roshni', 'रोशनी', 'girl', 'light, brightness', BTN('roshni')),
  // Uttara Bhadrapada — MW dūrvā "f. bent grass, panic grass, Dūrb grass" (the sacred durva grass).
  N('Durva', 'दूर्वा', 'girl', 'the sacred durva grass', WL('durva')),
  // Ashlesha (retroflex ड) — English-origin names written with ड in Hindi.
  // wisdomlib names/dimple: feminine, English "dymple"; BTN Dolly: feminine, "Diminutive of Dorothy".
  N('Dimple', 'डिंपल', 'girl', 'a dimple (English-origin name)', 'https://www.wisdomlib.org/names/dimple'),
  N('Dolly', 'डॉली', 'girl', 'a pet form of Dorothy (English-origin name)', BTN('dolly')),
  // Anuradha — WP Nandini: female, "a woman who brings joy".
  N('Nandini', 'नंदिनी', 'girl', 'one who brings joy', WP('Nandini')),
  // Chitra — WP Rishi: ऋषि, "an accomplished and enlightened person"; MW ṛṣi "m.".
  N('Rishi', 'ऋषि', 'boy', 'a sage, an enlightened person', WP('Rishi')),
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

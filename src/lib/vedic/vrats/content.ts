/**
 * Batch 10 — vrat katha + puja vidhi content, English + Hindi.
 *
 * SOURCING RULE (religious texts — nothing invented): every section below paraphrases ONLY
 * pages opened with WebFetch on 29 Oct 2026, and each section lists the page(s) it came from.
 * Mantras are kept only where the source gives the text WITH a transliteration and a meaning
 * (Drik Panchang's Ekadashi vidhi, Karwa Chauth vidhi and Shravana Somavara katha pages);
 * other mantras those pages print without a meaning (Hanuman, Navadurga, Janmashtami) are left
 * out. Where traditions differ by region the section says so. The "gentle note" on each page
 * is BornClock's own guidance (no source claimed), not part of any tradition.
 *
 * Pages opened (29 Oct 2026):
 *   en.wikipedia.org/wiki/Ekadashi · /Satyanarayana_Puja · /Pradosha · /Sankashti_Chaturthi ·
 *   /Karva_Chauth · /Navaratri · /Navadurga · /Maha_Shivaratri · /Krishna_Janmashtami
 *   drikpanchang.com: ekadashis/kamada (2019) · ekadashis/mohini (2025) · ekadashis/apara (2024) ·
 *   ekadashis/vidhi-vidhan · ekadashis/parana · legends/ekadashi/ekadashi-vrat-katha ·
 *   vrat-katha/satyanarayana · vrats/pradoshdates (2022) · sankashti/bhalachandra (2021) ·
 *   festivals/karwa-chauth/info/karwa-chauth-puja-vidhi · vrat-katha/weekdays/deities-weekdays ·
 *   vrat-katha/shravana-somavara · vrats/weekdays/mangalavara/hanumana-mangalavara-vrat ·
 *   navratri/info/ghatasthapana-puja-vidhi · festivals/maha-shivaratri (2019) ·
 *   dashavatara/lord-krishna/janmashtami/puja-vidhi (Hindi)
 */
import type { VratSlug } from './meta';

export interface L { en: string; hi: string }
export interface Source { label: string; url: string }
export interface VratSection {
  id: 'about' | 'katha' | 'samagri' | 'steps' | 'timing' | 'regional' | 'ekadashis' | 'days';
  heading: L;
  paras?: L[];
  /** bullet list (samagri) */
  list?: L[];
  /** numbered list (steps) */
  steps?: L[];
  /** label → text rows (the 24 Ekadashis, the nine days) */
  rows?: Array<{ label: L; text: L }>;
  sources: Source[];
}
export interface Mantra { deva: string; translit: string; meaning: L; use: L; source: Source }
export interface VratContent {
  slug: VratSlug;
  /** 2–3 sentence answer-first summary (static). */
  summary: L;
  sections: VratSection[];
  mantras: Mantra[];
  faq: Array<{ q: L; a: L }>;
  faqSources: Source[];
}

// ── Sources ──────────────────────────────────────────────────────────────────
const S = {
  wEkadashi: { label: 'Wikipedia — Ekadashi', url: 'https://en.wikipedia.org/wiki/Ekadashi' },
  dKamada: { label: 'Drik Panchang — Kamada Ekadashi', url: 'https://www.drikpanchang.com/ekadashis/kamada/kamada-ekadashi-date-time.html?year=2019' },
  dMohini: { label: 'Drik Panchang — Mohini Ekadashi', url: 'https://www.drikpanchang.com/ekadashis/mohini/mohini-ekadashi-date-time.html?year=2025' },
  dApara: { label: 'Drik Panchang — Apara Ekadashi', url: 'https://www.drikpanchang.com/ekadashis/apara/apara-ekadashi-date-time.html?year=2024' },
  dEkVidhi: { label: 'Drik Panchang — Ekadashi vrat vidhi', url: 'https://www.drikpanchang.com/ekadashis/vidhi-vidhan/ekadashi-vrat-vidhi-vidhan.html' },
  dEkParana: { label: 'Drik Panchang — Ekadashi parana', url: 'https://www.drikpanchang.com/ekadashis/parana/ekadashi-vrat-parana.html' },
  dEkKatha: { label: 'Drik Panchang — Ekadashi vrat katha list', url: 'https://www.drikpanchang.com/legends/ekadashi/ekadashi-vrat-katha.html' },
  wSatya: { label: 'Wikipedia — Satyanarayana Puja', url: 'https://en.wikipedia.org/wiki/Satyanarayana_Puja' },
  dSatya: { label: 'Drik Panchang — Satyanarayana vrat katha', url: 'https://www.drikpanchang.com/vrat-katha/satyanarayana/satyanarayana-vrat-katha.html' },
  wPradosha: { label: 'Wikipedia — Pradosha', url: 'https://en.wikipedia.org/wiki/Pradosha' },
  dPradosh: { label: 'Drik Panchang — Pradosh dates and rule', url: 'https://www.drikpanchang.com/vrats/pradoshdates.html?year=2022' },
  wSankashti: { label: 'Wikipedia — Sankashti Chaturthi', url: 'https://en.wikipedia.org/wiki/Sankashti_Chaturthi' },
  dSankashti: { label: 'Drik Panchang — Bhalachandra Sankashti (vidhi)', url: 'https://www.drikpanchang.com/sankashti/bhalachandra/bhalachandra-sankashti-date-time.html?year=2021' },
  wKarva: { label: 'Wikipedia — Karva Chauth', url: 'https://en.wikipedia.org/wiki/Karva_Chauth' },
  dKarva: { label: 'Drik Panchang — Karwa Chauth puja vidhi', url: 'https://www.drikpanchang.com/festivals/karwa-chauth/info/karwa-chauth-puja-vidhi.html' },
  dWeekday: { label: 'Drik Panchang — weekday vrat kathas', url: 'https://www.drikpanchang.com/vrat-katha/weekdays/deities-weekdays-vrat-katha.html' },
  dShravanSom: { label: 'Drik Panchang — Shravana Somavara vrat katha (Skanda Purana)', url: 'https://www.drikpanchang.com/vrat-katha/shravana-somavara/shravana-somavara-vrat-katha.html' },
  dHanuman: { label: 'Drik Panchang — Hanuman Mangalavara vrat', url: 'https://www.drikpanchang.com/vrats/weekdays/mangalavara/hanumana-mangalavara-vrat.html' },
  wNavaratri: { label: 'Wikipedia — Navaratri', url: 'https://en.wikipedia.org/wiki/Navaratri' },
  wNavadurga: { label: 'Wikipedia — Navadurga', url: 'https://en.wikipedia.org/wiki/Navadurga' },
  dGhata: { label: 'Drik Panchang — Ghatasthapana puja vidhi', url: 'https://www.drikpanchang.com/navratri/info/ghatasthapana-puja-vidhi.html' },
  wShivaratri: { label: 'Wikipedia — Maha Shivaratri', url: 'https://en.wikipedia.org/wiki/Maha_Shivaratri' },
  dShivaratri: { label: 'Drik Panchang — Maha Shivaratri (fasting and puja rules)', url: 'https://www.drikpanchang.com/festivals/maha-shivaratri/maha-shivaratri-date-time.html?year=2019' },
  wJanma: { label: 'Wikipedia — Krishna Janmashtami', url: 'https://en.wikipedia.org/wiki/Krishna_Janmashtami' },
  dJanma: { label: 'Drik Panchang — Janmashtami puja vidhi', url: 'https://www.drikpanchang.com/dashavatara/lord-krishna/janmashtami/puja-vidhi/krishna-janmashtami-puja-vidhi.html?lang=hi' },
  festivals: { label: 'BornClock festival calendar (dates checked against Drik Panchang, New Delhi)', url: '/festivals' },
} satisfies Record<string, Source>;
export const VRAT_SOURCES = S;

const timing = (en: string, hi: string, extra: Source[] = []): VratSection => ({
  id: 'timing',
  heading: { en: 'When it falls and what time to keep', hi: 'कब पड़ता है और कौन-सा समय' },
  paras: [{ en, hi }],
  sources: [S.festivals, ...extra],
});

// ── The 24 (+2) Ekadashis — one line each ───────────────────────────────────────
// Katha hook: Drik Panchang's Ekadashi katha list. Presiding deity of the month: the
// table in Wikipedia's "Ekadashi" article (rows are purnimanta months, so a Krishna-paksha
// Ekadashi takes the deity of the NEXT amanta month's row).
const EK = (name: string, hiName: string, monthEn: string, monthHi: string, en: string, hi: string) =>
  ({ label: { en: `${name} Ekadashi — ${monthEn}`, hi: `${hiName} एकादशी — ${monthHi}` }, text: { en, hi } });

export const EKADASHI_ROWS = [
  EK('Kamada', 'कामदा', 'Chaitra Shukla', 'चैत्र शुक्ल', 'Katha of the Gandharva couple Lalit and Lalita and King Pundarika. Drik Panchang: believed to fulfil wishes and wash away sins. Month deity: Rama / Vishnu.', 'गंधर्व दंपति ललित-ललिता और राजा पुंडरीक की कथा। द्रिक पंचांग: मनोकामना पूरी करने और पाप नष्ट करने वाली मानी जाती है। मास के देवता: राम / विष्णु।'),
  EK('Varuthini', 'वरूथिनी', 'Vaishakha Krishna (purnimanta) / Chaitra Krishna (amanta)', 'वैशाख कृष्ण (पूर्णिमांत) / चैत्र कृष्ण (अमांत)', 'Its glory is narrated by Lord Krishna. Month deity: Madhusudana (Vishnu).', 'इसकी महिमा भगवान श्रीकृष्ण ने बताई है। मास के देवता: मधुसूदन (विष्णु)।'),
  EK('Mohini', 'मोहिनी', 'Vaishakha Shukla', 'वैशाख शुक्ल', 'Katha of Dhanapal’s wayward son and his redemption. Drik Panchang notes the Kurma Purana praises it, that Rama kept it while searching for Sita, and that Vishnu’s Mohini form is worshipped. Month deity: Madhusudana.', 'धनपाल के भटके हुए पुत्र के उद्धार की कथा। द्रिक पंचांग के अनुसार कूर्म पुराण में इसकी महिमा है, सीता जी की खोज में श्रीराम ने यह व्रत किया, और इस दिन विष्णु के मोहिनी रूप की पूजा होती है। मास के देवता: मधुसूदन।'),
  EK('Apara', 'अपरा', 'Jyeshtha Krishna (purnimanta) / Vaishakha Krishna (amanta)', 'ज्येष्ठ कृष्ण (पूर्णिमांत) / वैशाख कृष्ण (अमांत)', '“Apara” means boundless; Lord Krishna explains its merit to Arjuna (Drik Panchang). Month deity: Trivikrama.', '“अपरा” का अर्थ है असीम; श्रीकृष्ण अर्जुन को इसकी महिमा बताते हैं (द्रिक पंचांग)। मास के देवता: त्रिविक्रम।'),
  EK('Nirjala', 'निर्जला', 'Jyeshtha Shukla', 'ज्येष्ठ शुक्ल', 'Katha of sage Vyasa and Bhimsena. Kept without water (nirjala). Month deity: Trivikrama.', 'महर्षि व्यास और भीमसेन की कथा। यह बिना जल (निर्जल) रखा जाता है। मास के देवता: त्रिविक्रम।'),
  EK('Yogini', 'योगिनी', 'Ashadha Krishna (purnimanta) / Jyeshtha Krishna (amanta)', 'आषाढ़ कृष्ण (पूर्णिमांत) / ज्येष्ठ कृष्ण (अमांत)', 'Katha of Kubera and the Yaksha Hemamali. Month deity: Vamana.', 'कुबेर और यक्ष हेममाली की कथा। मास के देवता: वामन।'),
  EK('Devshayani', 'देवशयनी', 'Ashadha Shukla', 'आषाढ़ शुक्ल', 'Katha of a famine in King Mandhata’s kingdom. Drik Panchang lists it as the last Ekadashi before Chaturmasa. Month deity: Vamana.', 'राजा मांधाता के राज्य में अकाल की कथा। द्रिक पंचांग इसे चातुर्मास से पहले की अंतिम एकादशी बताता है। मास के देवता: वामन।'),
  EK('Kamika', 'कामिका', 'Shravana Krishna (purnimanta) / Ashadha Krishna (amanta)', 'श्रावण कृष्ण (पूर्णिमांत) / आषाढ़ कृष्ण (अमांत)', 'Katha told between Lord Brahma and sage Narada. Month deity: Sridhara.', 'ब्रह्मा जी और नारद मुनि के संवाद की कथा। मास के देवता: श्रीधर।'),
  EK('Shravana Putrada', 'श्रावण पुत्रदा', 'Shravana Shukla', 'श्रावण शुक्ल', 'Katha of the childless King Mahajit, who is blessed with a son. Month deity: Sridhara.', 'निःसंतान राजा महीजित की कथा, जिन्हें पुत्र प्राप्त होता है। मास के देवता: श्रीधर।'),
  EK('Aja', 'अजा', 'Bhadrapada Krishna (purnimanta) / Shravana Krishna (amanta)', 'भाद्रपद कृष्ण (पूर्णिमांत) / श्रावण कृष्ण (अमांत)', 'Katha of King Harishchandra and sage Gautama. Also called Annada. Month deity: Hrishikesha.', 'राजा हरिश्चंद्र और गौतम ऋषि की कथा। इसे अन्नदा भी कहते हैं। मास के देवता: हृषीकेश।'),
  EK('Parsva (Parivartini)', 'पार्श्व (परिवर्तिनी)', 'Bhadrapada Shukla', 'भाद्रपद शुक्ल', 'Katha of Lord Vamana and the demon king Bali. Month deity: Hrishikesha.', 'भगवान वामन और दैत्यराज बलि की कथा। मास के देवता: हृषीकेश।'),
  EK('Indira', 'इंदिरा', 'Ashwina Krishna (purnimanta) / Bhadrapada Krishna (amanta)', 'आश्विन कृष्ण (पूर्णिमांत) / भाद्रपद कृष्ण (अमांत)', 'Katha of King Indrasen, whose father is freed from Yamaloka. Month deity: Padmanabha.', 'राजा इंद्रसेन की कथा, जिनके पिता यमलोक से मुक्त होते हैं। मास के देवता: पद्मनाभ।'),
  EK('Papankusha', 'पापांकुशा', 'Ashwina Shukla', 'आश्विन शुक्ल', 'Its merit is explained by Lord Krishna to Arjuna. Month deity: Padmanabha.', 'श्रीकृष्ण अर्जुन को इसकी महिमा बताते हैं। मास के देवता: पद्मनाभ।'),
  EK('Rama', 'रमा', 'Kartika Krishna (purnimanta) / Ashwina Krishna (amanta)', 'कार्तिक कृष्ण (पूर्णिमांत) / आश्विन कृष्ण (अमांत)', 'Katha of King Muchukunda, Shobhana and Chandrabhaga. Month deity: Damodara.', 'राजा मुचुकुंद, शोभन और चंद्रभागा की कथा। मास के देवता: दामोदर।'),
  EK('Devutthana (Prabodhini)', 'देवउठनी (प्रबोधिनी)', 'Kartika Shukla', 'कार्तिक शुक्ल', 'Katha told between sage Narada and Lord Brahma. Month deity: Damodara.', 'नारद मुनि और ब्रह्मा जी के संवाद की कथा। मास के देवता: दामोदर।'),
  EK('Utpanna', 'उत्पन्ना', 'Margashirsha Krishna (purnimanta) / Kartika Krishna (amanta)', 'मार्गशीर्ष कृष्ण (पूर्णिमांत) / कार्तिक कृष्ण (अमांत)', 'The day Goddess Ekadashi appeared and slew the demon Mura — the origin of the Ekadashi vrat (Drik Panchang). Month deity: Keshava.', 'वह दिन जब देवी एकादशी प्रकट हुईं और मुर दैत्य का वध किया — एकादशी व्रत का आरंभ (द्रिक पंचांग)। मास के देवता: केशव।'),
  EK('Mokshada', 'मोक्षदा', 'Margashirsha Shukla', 'मार्गशीर्ष शुक्ल', 'Katha of King Vaikhanasa and sage Parvata. Also called Vaikuntha Ekadashi in some lists. Month deity: Keshava.', 'राजा वैखानस और पर्वत मुनि की कथा। कुछ सूचियों में इसे वैकुंठ एकादशी भी कहा जाता है। मास के देवता: केशव।'),
  EK('Saphala', 'सफला', 'Pausha Krishna (purnimanta) / Margashirsha Krishna (amanta)', 'पौष कृष्ण (पूर्णिमांत) / मार्गशीर्ष कृष्ण (अमांत)', 'Katha of Lumpaka, the wayward son of King Mahishmana. Month deity: Narayana.', 'राजा महिष्मान के भटके हुए पुत्र लुम्पक की कथा। मास के देवता: नारायण।'),
  EK('Pausha Putrada', 'पौष पुत्रदा', 'Pausha Shukla', 'पौष शुक्ल', 'Katha of the childless King Suketuman, who is blessed with a son. Month deity: Narayana.', 'निःसंतान राजा सुकेतुमान की कथा, जिन्हें पुत्र प्राप्त होता है। मास के देवता: नारायण।'),
  EK('Shattila', 'षटतिला', 'Magha Krishna (purnimanta) / Pausha Krishna (amanta)', 'माघ कृष्ण (पूर्णिमांत) / पौष कृष्ण (अमांत)', 'Katha of a woman who had never given in charity. Month deity: Madhava.', 'एक स्त्री की कथा जिसने कभी दान नहीं किया था। मास के देवता: माधव।'),
  EK('Jaya', 'जया', 'Magha Shukla', 'माघ शुक्ल', 'Katha of the Gandharvas Malyavan and Pushpavati, freed from a pishacha (ghostly) birth. Also called Bhaimi. Month deity: Madhava.', 'गंधर्व माल्यवान और पुष्पवती की कथा, जो पिशाच योनि से मुक्त होते हैं। इसे भैमी भी कहते हैं। मास के देवता: माधव।'),
  EK('Vijaya', 'विजया', 'Phalguna Krishna (purnimanta) / Magha Krishna (amanta)', 'फाल्गुन कृष्ण (पूर्णिमांत) / माघ कृष्ण (अमांत)', 'Katha of sage Vakadalbhya and Lord Rama. Month deity: Govinda.', 'वकदाल्भ्य मुनि और भगवान श्रीराम की कथा। मास के देवता: गोविंद।'),
  EK('Amalaki', 'आमलकी', 'Phalguna Shukla', 'फाल्गुन शुक्ल', 'Katha of a hunter and Prince Vasuratha. Month deity: Govinda.', 'एक शिकारी और राजकुमार वसुरथ की कथा। मास के देवता: गोविंद।'),
  EK('Papamochani', 'पापमोचनी', 'Chaitra Krishna (purnimanta) / Phalguna Krishna (amanta)', 'चैत्र कृष्ण (पूर्णिमांत) / फाल्गुन कृष्ण (अमांत)', 'Katha of sage Medhavi and the apsara Manjughosha. Month deity: Rama / Vishnu.', 'मेधावी ऋषि और अप्सरा मंजुघोषा की कथा। मास के देवता: राम / विष्णु।'),
  EK('Padmini', 'पद्मिनी', 'Adhik (leap) month', 'अधिक मास', 'Only in a leap month. Katha of King Kartavirya, who captured Ravana. Leap-month deity: Purushottama. (Sources differ on which half of the leap month is Padmini and which Parama.)', 'केवल अधिक मास में। राजा कार्तवीर्य की कथा, जिन्होंने रावण को बंदी बनाया। अधिक मास के देवता: पुरुषोत्तम। (अधिक मास के किस पक्ष में पद्मिनी और किसमें परमा — इस पर स्रोतों में अंतर है।)'),
  EK('Parama', 'परमा', 'Adhik (leap) month', 'अधिक मास', 'Only in a leap month. Katha of the Brahmin Sumedha, freed from poverty. Leap-month deity: Purushottama.', 'केवल अधिक मास में। ब्राह्मण सुमेधा की कथा, जिनकी दरिद्रता दूर होती है। अधिक मास के देवता: पुरुषोत्तम।'),
];

// ── Content ─────────────────────────────────────────────────────────────────
export const VRAT_CONTENT: Record<VratSlug, VratContent> = {
  'ekadashi': {
    slug: 'ekadashi',
    summary: {
      en: 'Ekadashi is the eleventh lunar day of each fortnight — about 24 times a year — kept as a fast for Lord Vishnu. The fast runs from sunrise to the next sunrise and is broken (parana) on Dwadashi. You can keep it at the level that suits you: no water, water only, milk, fruit, or one grain-free meal.',
      hi: 'एकादशी हर पक्ष की ग्यारहवीं तिथि है — साल में लगभग 24 बार — और भगवान विष्णु के लिए व्रत रखा जाता है। व्रत एक सूर्योदय से अगले सूर्योदय तक चलता है और द्वादशी को पारण से खोला जाता है। आप अपनी क्षमता के अनुसार रख सकते हैं: निर्जल, केवल जल, दूध, फल, या अनाज रहित एक समय का भोजन।',
    },
    sections: [
      {
        id: 'about', heading: { en: 'What Ekadashi is', hi: 'एकादशी क्या है' },
        paras: [
          { en: 'Ekadashi (“eleventh”) is the 11th tithi of both the bright (Shukla) and dark (Krishna) halves of the lunar month. It is observed above all in Vaishnava tradition as a day of worship of Vishnu, often with Krishna. There are usually 24 in a year, and two more in a leap (Adhik) year.', hi: 'एकादशी (“ग्यारहवीं”) चंद्र मास के शुक्ल और कृष्ण दोनों पक्षों की ग्यारहवीं तिथि है। वैष्णव परंपरा में यह विशेष रूप से भगवान विष्णु (और प्रायः श्रीकृष्ण) की उपासना का दिन है। साल में सामान्यतः 24 एकादशी होती हैं, और अधिक मास वाले वर्ष में दो और।' },
          { en: 'The main aim, as Wikipedia puts it, is to steady the mind and senses and turn them towards spiritual practice.', hi: 'इसका मुख्य उद्देश्य मन और इंद्रियों को स्थिर करके उन्हें साधना की ओर मोड़ना है।' },
        ],
        sources: [S.wEkadashi],
      },
      {
        id: 'katha', heading: { en: 'The katha — how Ekadashi began', hi: 'कथा — एकादशी का आरंभ' },
        paras: [
          { en: 'While Vishnu rested in yogic sleep, the demon Mura (called Murdanav in some tellings) came to attack him. A beautiful woman arose from Vishnu’s eleventh “sense”, the mind; she agreed to Mura’s demand to marry her only if he could defeat her in battle, and in the fight he was slain. When Vishnu awoke he named her Ekadashi and blessed the day: whoever fasts on it, gathering all eleven senses (five of knowing, five of action, and the mind) towards God, moves towards liberation.', hi: 'जब भगवान विष्णु योगनिद्रा में थे, तब मुर (कुछ कथाओं में मुरदानव) नाम का दैत्य उन पर आक्रमण करने आया। विष्णु की ग्यारहवीं “इंद्रिय” — मन — से एक सुंदर देवी प्रकट हुईं; मुर ने उनसे विवाह करना चाहा तो उन्होंने शर्त रखी कि पहले युद्ध में उन्हें हराए, और उसी युद्ध में मुर मारा गया। जागने पर विष्णु ने उनका नाम एकादशी रखा और यह वर दिया कि जो इस दिन ग्यारहों इंद्रियों (पाँच ज्ञानेंद्रियाँ, पाँच कर्मेंद्रियाँ और मन) को ईश्वर की ओर लगाकर व्रत करेगा, वह मोक्ष की ओर बढ़ेगा।' },
          { en: 'Drik Panchang calls Goddess Ekadashi the Yoga Maya of Vishnu and marks Utpanna Ekadashi (Margashirsha Krishna) as the day she appeared. Each of the 24 Ekadashis also has its own katha — see the list below. The Bhagavata Purana (Skandha 9, chapter 4) tells of King Ambarisha’s devotion to this vrat.', hi: 'द्रिक पंचांग देवी एकादशी को विष्णु की योगमाया बताता है और उत्पन्ना एकादशी (मार्गशीर्ष कृष्ण) को उनके प्रकट होने का दिन मानता है। 24 में से हर एकादशी की अपनी कथा भी है — नीचे सूची देखें। भागवत पुराण (स्कंध 9, अध्याय 4) में राजा अंबरीष की इस व्रत में निष्ठा का वर्णन है।' },
        ],
        sources: [S.wEkadashi, S.dEkKatha],
      },
      {
        id: 'samagri', heading: { en: 'What you need', hi: 'पूजा सामग्री' },
        list: [
          { en: 'A picture or image of Lord Vishnu / Krishna', hi: 'भगवान विष्णु / श्रीकृष्ण का चित्र या प्रतिमा' },
          { en: 'Incense (dhoop) and a lamp (deep)', hi: 'धूप और दीपक' },
          { en: 'Fruit to offer before you eat it', hi: 'फल — खाने से पहले भगवान को अर्पित करें' },
          { en: 'The Gita or Vishnu Sahasranama to read or listen to', hi: 'पढ़ने या सुनने के लिए गीता या विष्णु सहस्रनाम' },
          { en: 'Food to give in charity, as you are able', hi: 'सामर्थ्य अनुसार दान के लिए अन्न' },
        ],
        sources: [S.dEkVidhi],
      },
      {
        id: 'steps', heading: { en: 'Puja vidhi — simple steps', hi: 'पूजा विधि — सरल चरण' },
        steps: [
          { en: 'Dashami (the day before): eat one simple meal; avoid meat, onion and masoor dal.', hi: 'दशमी (एक दिन पहले): एक समय सादा भोजन करें; मांस, प्याज़ और मसूर दाल से बचें।' },
          { en: 'Ekadashi morning: bathe, then take the vow (sankalpa) before God — to fast, to speak no harsh word and to keep the day for prayer.', hi: 'एकादशी की सुबह: स्नान करके भगवान के सामने संकल्प लें — व्रत रखने, कठोर वचन न बोलने और दिन प्रार्थना में बिताने का।' },
          { en: 'Worship Vishnu with dhoop and deep, and offer fruit before eating it. Tulsi leaves are not eaten on this day.', hi: 'धूप-दीप से भगवान विष्णु की पूजा करें और कोई भी फल खाने से पहले उन्हें अर्पित करें। इस दिन तुलसी के पत्ते नहीं खाए जाते।' },
          { en: 'Read or listen to the Gita, chant the twelve-syllable mantra and the names of Rama, Krishna and Vishnu; many keep a night of kirtan.', hi: 'गीता पढ़ें या सुनें, द्वादशाक्षर मंत्र और राम, कृष्ण, विष्णु के नाम जपें; बहुत से लोग रात में कीर्तन करते हैं।' },
          { en: 'Choose your fast: nirjala (no water), jalahar (water), ksheerbhoji (milk), phalahari (fruit) or naktabhoji (one meal of sabudana, singhara, sweet potato, potato or peanuts — no grains or dals).', hi: 'अपना व्रत चुनें: निर्जल, जलाहार (केवल जल), क्षीरभोजी (दूध), फलाहारी (फल) या नक्तभोजी (साबूदाना, सिंघाड़ा, शकरकंद, आलू या मूँगफली से एक भोजन — अनाज और दाल नहीं)।' },
          { en: 'Dwadashi: after sunrise, give food (or the raw ingredients) in charity, then break the fast (parana) within Dwadashi — not in its first quarter (Hari Vasara).', hi: 'द्वादशी: सूर्योदय के बाद अन्न (या कच्ची सामग्री) दान करें, फिर द्वादशी के भीतर पारण करें — उसके पहले चौथाई भाग (हरि वासर) में नहीं।' },
        ],
        sources: [S.dEkVidhi, S.dEkParana, S.dKamada, S.wEkadashi],
      },
      timing(
        'Our Panchang marks Ekadashi on the day the Ekadashi tithi prevails at sunrise in New Delhi (the Smarta date, as Drik Panchang lists it), moving it so the fast never lands on the parana day. Parana is after the next sunrise, within Dwadashi, preferably in the morning and not during Hari Vasara. Vaishnava (e.g. ISKCON) calendars sometimes keep Ekadashi a day later.',
        'हमारा पंचांग एकादशी उस दिन मानता है जिस दिन नई दिल्ली में सूर्योदय के समय एकादशी तिथि हो (स्मार्त तिथि, जैसा द्रिक पंचांग देता है), और ध्यान रखता है कि व्रत पारण के दिन न पड़े। पारण अगले सूर्योदय के बाद, द्वादशी के भीतर, अच्छा हो सुबह, और हरि वासर में नहीं। वैष्णव (जैसे इस्कॉन) पंचांग कभी-कभी एकादशी एक दिन बाद मानते हैं।',
        [S.dKamada, S.dEkParana],
      ),
      {
        id: 'regional', heading: { en: 'Traditions differ', hi: 'परंपराओं में अंतर' },
        paras: [
          { en: 'When Ekadashi touches two days, Drik Panchang notes that Shaiva devotees accept the Ekadashi joined with Dashami, while Vaishnavas fast on the Ekadashi joined with Dwadashi and break the fast before Trayodashi. Some traditions keep certain Ekadashis (for example Saphala, Kamada, Devshayani) a day apart from the main listing.', hi: 'जब एकादशी दो दिनों में पड़ती है, तो द्रिक पंचांग के अनुसार शैव भक्त दशमी-युक्त एकादशी मानते हैं, जबकि वैष्णव द्वादशी-युक्त एकादशी का व्रत करके त्रयोदशी से पहले पारण करते हैं। कुछ परंपराओं में कुछ एकादशियाँ (जैसे सफला, कामदा, देवशयनी) मुख्य सूची से एक दिन अलग पड़ती हैं।' },
        ],
        sources: [S.dEkVidhi, S.wEkadashi],
      },
      {
        id: 'ekadashis', heading: { en: 'The 24 Ekadashis (and the two leap-month ones)', hi: '24 एकादशियाँ (और अधिक मास की दो)' },
        paras: [{ en: 'Each Ekadashi has its own name and katha. One line on each — the katha it is known for, and the form of Vishnu honoured that month:', hi: 'हर एकादशी का अपना नाम और कथा है। हर एक पर एक पंक्ति — उसकी प्रसिद्ध कथा, और उस मास में पूजे जाने वाला विष्णु का रूप:' }],
        rows: EKADASHI_ROWS,
        sources: [S.dEkKatha, S.wEkadashi, S.dKamada, S.dMohini, S.dApara],
      },
    ],
    mantras: [{
      deva: 'ॐ नमो भगवते वासुदेवाय', translit: 'Om Namo Bhagavate Vasudevaya',
      meaning: { en: 'Salutations to the Divine Lord Vasudeva (Vishnu / Krishna).', hi: 'भगवान वासुदेव (विष्णु / श्रीकृष्ण) को नमस्कार।' },
      use: { en: 'The twelve-syllable mantra chanted on Ekadashi.', hi: 'एकादशी पर जपा जाने वाला द्वादशाक्षर मंत्र।' },
      source: S.dEkVidhi,
    }],
    faq: [
      { q: { en: 'What can I eat on Ekadashi?', hi: 'एकादशी पर क्या खा सकते हैं?' }, a: { en: 'Grains (rice, wheat, millets) and pulses are avoided. Depending on the level you choose: water, milk, fruit, or one meal of sabudana, singhara, sweet potato, potato or peanuts. Drik Panchang lists mango, grapes, banana, almonds and pistachios for a fruit fast, and suggests leaving out buckwheat and millet as they are debated.', hi: 'अनाज (चावल, गेहूँ, बाजरा आदि) और दालें नहीं ली जातीं। आपके चुने स्तर के अनुसार: जल, दूध, फल, या साबूदाना, सिंघाड़ा, शकरकंद, आलू या मूँगफली से एक भोजन। द्रिक पंचांग फलाहार में आम, अंगूर, केला, बादाम और पिस्ता बताता है, और कुट्टू व बाजरे को विवादित मानकर छोड़ने की सलाह देता है।' } },
      { q: { en: 'When do I break the Ekadashi fast?', hi: 'एकादशी का व्रत कब खोलें?' }, a: { en: 'On Dwadashi, after sunrise and before Dwadashi ends — preferably in the morning, and not during Hari Vasara (the first quarter of Dwadashi). This page shows the next sunrise and the Dwadashi end time for New Delhi.', hi: 'द्वादशी को, सूर्योदय के बाद और द्वादशी समाप्त होने से पहले — अच्छा हो सुबह, और हरि वासर (द्वादशी का पहला चौथाई भाग) में नहीं। यह पृष्ठ नई दिल्ली के लिए अगला सूर्योदय और द्वादशी समाप्ति का समय दिखाता है।' } },
      { q: { en: 'Is a full nirjala fast required?', hi: 'क्या निर्जल व्रत ज़रूरी है?' }, a: { en: 'No. The strict form (no food or water) does not suit everyone, so lighter forms — water, milk, fruit or one grain-free meal — are common and accepted.', hi: 'नहीं। कठोर रूप (बिना अन्न-जल) सबके लिए उचित नहीं, इसलिए हल्के रूप — जल, दूध, फल या अनाज रहित एक भोजन — आम हैं और मान्य हैं।' } },
      { q: { en: 'Why is the Ekadashi date sometimes different in two calendars?', hi: 'दो पंचांगों में एकादशी की तिथि कभी अलग क्यों होती है?' }, a: { en: 'Because a tithi can span two sunrises, and Smarta and Vaishnava traditions pick the day differently; local sunrise also matters. We show the Smarta date for New Delhi.', hi: 'क्योंकि एक तिथि दो सूर्योदयों में पड़ सकती है, और स्मार्त व वैष्णव परंपराएँ दिन अलग ढंग से चुनती हैं; स्थानीय सूर्योदय से भी अंतर पड़ता है। हम नई दिल्ली की स्मार्त तिथि दिखाते हैं।' } },
    ],
    faqSources: [S.wEkadashi, S.dKamada, S.dEkVidhi, S.dEkParana],
  },

  'satyanarayan-katha': {
    slug: 'satyanarayan-katha',
    summary: {
      en: 'The Satyanarayan puja honours Satyanarayana — Vishnu as the embodiment of truth — and centres on listening to a set of stories (the vrat katha). It has no fixed day, but Purnima (full moon) is considered especially auspicious; devotees fast and the evening is preferred so the fast can be broken with the prasad.',
      hi: 'सत्यनारायण पूजा भगवान सत्यनारायण — सत्य के स्वरूप विष्णु — की उपासना है, जिसका केंद्र कुछ कथाओं (व्रत कथा) को सुनना है। इसका कोई निश्चित दिन नहीं, पर पूर्णिमा विशेष शुभ मानी जाती है; भक्त व्रत रखते हैं और शाम का समय अच्छा माना जाता है ताकि प्रसाद से व्रत खोला जा सके।',
    },
    sections: [
      {
        id: 'about', heading: { en: 'What the Satyanarayan puja is', hi: 'सत्यनारायण पूजा क्या है' },
        paras: [
          { en: 'It is the worship of Satyanarayana, regarded as a form of Vishnu for the Kali Yuga. Its heart is the vrat katha — tales of a poor Brahmin, a woodcutter, a sea-merchant and his family, and in some versions a king — whose message is that keeping the vow brings well-being and forgetting it brings trouble until it is kept.', hi: 'यह भगवान सत्यनारायण की पूजा है, जिन्हें कलियुग के लिए विष्णु का रूप माना जाता है। इसका केंद्र व्रत कथा है — एक गरीब ब्राह्मण, एक लकड़हारे, एक व्यापारी और उसके परिवार, और कुछ संस्करणों में एक राजा की कहानियाँ — जिनका संदेश है कि संकल्प निभाने से सुख मिलता है और भूल जाने पर कष्ट, जब तक संकल्प पूरा न हो।' },
          { en: 'The most detailed text is in the Bhavishya Purana (Pratisarga Parva). The version usually called “Skanda Purana, Reva Khanda” is found in the Bengali editions, and scholars consider it a later addition.', hi: 'सबसे विस्तृत पाठ भविष्य पुराण (प्रतिसर्ग पर्व) में है। जिसे प्रायः “स्कंद पुराण, रेवा खंड” कहा जाता है, वह बांग्ला संस्करणों में मिलता है, और विद्वान उसे बाद में जोड़ा गया भाग मानते हैं।' },
        ],
        sources: [S.wSatya, S.dSatya],
      },
      {
        id: 'katha', heading: { en: 'The katha in brief (Bhavishya Purana version)', hi: 'कथा संक्षेप में (भविष्य पुराण के अनुसार)' },
        steps: [
          { en: 'At Naimisharanya, the sages led by Shaunaka ask Suta for a simple rite suited to the Kali Yuga; Suta names the worship of Satyanarayana.', hi: 'नैमिषारण्य में शौनक आदि ऋषि सूत जी से कलियुग के लिए सरल उपासना पूछते हैं; सूत जी सत्यनारायण की पूजा बताते हैं।' },
          { en: 'Sage Narada, saddened by human suffering, goes to Vishnu, who teaches him this vrat.', hi: 'मनुष्यों के दुख से व्यथित नारद मुनि भगवान विष्णु के पास जाते हैं, जो उन्हें यह व्रत बताते हैं।' },
          { en: 'Shatananda, a poor Brahmin of Kashi, is taught the vrat by Vishnu disguised as an old Brahmin, and his poverty ends.', hi: 'काशी के गरीब ब्राह्मण शतानंद को वृद्ध ब्राह्मण के वेश में भगवान विष्णु यह व्रत बताते हैं, और उनकी दरिद्रता दूर होती है।' },
          { en: 'King Chandrachuda, defeated by his enemies, learns the worship from Shatananda and regains his kingdom.', hi: 'शत्रुओं से हारे राजा चंद्रचूड़ शतानंद से यह पूजा सीखते हैं और अपना राज्य वापस पाते हैं।' },
          { en: 'A woodcutter sees the worship in Kashi, keeps it himself and prospers.', hi: 'एक लकड़हारा काशी में यह पूजा देखता है, स्वयं करता है और समृद्ध होता है।' },
          { en: 'The merchant Lakshapati vows the puja for a child, but keeps it only in part; he and his son-in-law are jailed for a theft they did not commit. His daughter Kalavati completes the rite and they are freed. When Lakshapati again neglects it his ships sink; when his wife Lilavati leaves the rite unfinished in her joy, trouble returns — until she prays and the rite is completed, and the family is made whole.', hi: 'व्यापारी लक्षपति संतान के लिए पूजा का संकल्प लेते हैं, पर उसे अधूरा करते हैं; वे और उनके दामाद एक ऐसी चोरी के लिए बंदी बनते हैं जो उन्होंने की ही नहीं। बेटी कलावती पूजा पूरी करती है और वे मुक्त होते हैं। लक्षपति फिर पूजा भूलते हैं तो उनके जहाज़ डूबते हैं; पत्नी लीलावती खुशी में पूजा अधूरी छोड़ती हैं तो फिर संकट आता है — जब तक वे प्रार्थना करके पूजा पूरी नहीं करतीं, और परिवार फिर से सुखी होता है।' },
        ],
        paras: [{ en: 'The Bengali Reva Khanda version leaves out King Chandrachuda and instead tells of King Vamshadhvaja, who refuses the worship, meets misfortune and then repents. Names differ between editions.', hi: 'बांग्ला रेवा खंड संस्करण में राजा चंद्रचूड़ की कथा नहीं है; उसकी जगह राजा वंशध्वज की कथा है, जो पूजा का अनादर करते हैं, कष्ट पाते हैं और फिर पछताते हैं। संस्करणों में नामों का अंतर है।' }],
        sources: [S.wSatya],
      },
      {
        id: 'samagri', heading: { en: 'What you need', hi: 'पूजा सामग्री' },
        list: [
          { en: 'An image of Satyanarayana / Vishnu (in Bengali homes, a shalagrama stone)', hi: 'सत्यनारायण / विष्णु की प्रतिमा या चित्र (बंगाली घरों में शालिग्राम)' },
          { en: 'For the prasad (shirni): wheat flour, ghee, milk, banana (plantain) and sugar or jaggery — some versions use rice', hi: 'प्रसाद (शिरनी) के लिए: गेहूँ का आटा, घी, दूध, केला और चीनी या गुड़ — कुछ परंपराओं में चावल भी' },
          { en: 'The katha text to read or listen to', hi: 'पढ़ने या सुनने के लिए कथा की पुस्तक' },
        ],
        sources: [S.wSatya],
      },
      {
        id: 'steps', heading: { en: 'Puja vidhi — simple steps', hi: 'पूजा विधि — सरल चरण' },
        steps: [
          { en: 'Make the vow (sankalpa) to do the puja, and keep a fast on the day.', hi: 'पूजा का संकल्प लें और उस दिन व्रत रखें।' },
          { en: 'In the evening (morning is also fine), worship Satyanarayana.', hi: 'शाम को (सुबह भी ठीक है) भगवान सत्यनारायण की पूजा करें।' },
          { en: 'Read or listen to the vrat katha with family and friends; singing and celebration are part of the tradition.', hi: 'परिवार और मित्रों के साथ व्रत कथा पढ़ें या सुनें; भजन-कीर्तन और उत्सव इस परंपरा का हिस्सा हैं।' },
          { en: 'Offer the prasad, and break the fast with it.', hi: 'प्रसाद अर्पित करें, और उसी से व्रत खोलें।' },
        ],
        sources: [S.dSatya, S.wSatya],
      },
      timing(
        'There is no fixed day; Purnima is considered especially auspicious, and the evening is preferred. Our Panchang marks Purnima on the day the full-moon tithi prevails at sunrise in New Delhi, and this page shows that day’s Purnima span and sunset.',
        'कोई निश्चित दिन नहीं; पूर्णिमा विशेष शुभ मानी जाती है, और शाम का समय अच्छा। हमारा पंचांग पूर्णिमा उस दिन मानता है जिस दिन नई दिल्ली में सूर्योदय के समय पूर्णिमा तिथि हो, और यह पृष्ठ उस दिन की पूर्णिमा अवधि और सूर्यास्त दिखाता है।',
        [S.dSatya],
      ),
      {
        id: 'regional', heading: { en: 'Traditions differ', hi: 'परंपराओं में अंतर' },
        paras: [
          { en: 'In Bengal the worship is closely linked with Satya Pir, honoured by Hindus and Muslims alike; in Bihar and North India Satyanarayana is worshipped purely as Vishnu. It is especially popular in Bengal and Maharashtra, and the Annavaram Satyanarayana temple in Andhra Pradesh is a famous shrine. The katha is recited in Sanskrit, in regional languages and sometimes in English.', hi: 'बंगाल में यह पूजा सत्य पीर से जुड़ी है, जिन्हें हिंदू और मुसलमान दोनों मानते हैं; बिहार और उत्तर भारत में सत्यनारायण की पूजा केवल विष्णु रूप में होती है। यह बंगाल और महाराष्ट्र में विशेष लोकप्रिय है, और आंध्र प्रदेश का अन्नवरम सत्यनारायण मंदिर प्रसिद्ध है। कथा संस्कृत, क्षेत्रीय भाषाओं और कभी-कभी अंग्रेज़ी में भी पढ़ी जाती है।' },
        ],
        sources: [S.wSatya],
      },
    ],
    mantras: [],
    faq: [
      { q: { en: 'Do I have to do the Satyanarayan puja on Purnima?', hi: 'क्या सत्यनारायण पूजा पूर्णिमा पर ही करनी चाहिए?' }, a: { en: 'No. There is no fixed day for it; Purnima is simply considered especially auspicious.', hi: 'नहीं। इसका कोई निश्चित दिन नहीं; पूर्णिमा बस विशेष शुभ मानी जाती है।' } },
      { q: { en: 'Morning or evening?', hi: 'सुबह या शाम?' }, a: { en: 'Either works; the evening is considered more suitable because you can break the day’s fast with the prasad.', hi: 'दोनों ठीक हैं; शाम को अधिक उपयुक्त माना जाता है क्योंकि दिन भर का व्रत प्रसाद से खोला जा सकता है।' } },
      { q: { en: 'Which scripture is the katha from?', hi: 'कथा किस ग्रंथ से है?' }, a: { en: 'The fullest version is in the Bhavishya Purana; the popular “Skanda Purana, Reva Khanda” version comes from Bengali editions and is considered a later addition.', hi: 'सबसे पूरा संस्करण भविष्य पुराण में है; प्रचलित “स्कंद पुराण, रेवा खंड” संस्करण बांग्ला प्रतियों से आता है और बाद का जोड़ माना जाता है।' } },
    ],
    faqSources: [S.wSatya, S.dSatya],
  },

  'pradosh-vrat': {
    slug: 'pradosh-vrat',
    summary: {
      en: 'Pradosh Vrat is a twice-monthly Shiva observance on Trayodashi, the 13th lunar day of each fortnight. The worship is done at dusk (pradosh kaal), the evening hours after sunset, after a day of fasting. When it falls on a Monday it is called Soma Pradosh, on a Tuesday Bhauma Pradosh, and on a Saturday Shani Pradosh.',
      hi: 'प्रदोष व्रत हर पक्ष की त्रयोदशी (13वीं तिथि) को महीने में दो बार किया जाने वाला शिव व्रत है। दिन भर व्रत के बाद पूजा संध्या (प्रदोष काल) में, सूर्यास्त के बाद होती है। सोमवार को पड़े तो सोम प्रदोष, मंगलवार को भौम प्रदोष और शनिवार को शनि प्रदोष कहलाता है।',
    },
    sections: [
      {
        id: 'about', heading: { en: 'What Pradosh is', hi: 'प्रदोष क्या है' },
        paras: [
          { en: '“Pradosha” refers to the early part of the night — evening twilight. It is kept on both Trayodashis of the month, Shukla and Krishna, in worship of Shiva. Maha Pradosha is the one that falls on or just before Maha Shivaratri.', hi: '“प्रदोष” रात के आरंभिक भाग — संध्या — को कहते हैं। यह महीने की दोनों त्रयोदशियों, शुक्ल और कृष्ण, को भगवान शिव की उपासना में रखा जाता है। महाशिवरात्रि पर या उससे ठीक पहले पड़ने वाला महा प्रदोष कहलाता है।' },
        ],
        sources: [S.wPradosha, S.dPradosh],
      },
      {
        id: 'katha', heading: { en: 'The katha', hi: 'कथा' },
        paras: [
          { en: 'The Skanda Purana tells of King Satyaratha of Vidarbha, killed in battle; his queen dies in the forest soon after giving birth, and the baby is raised by a Brahmin woman named Uma. Sage Shandilya explains that the family’s hardship came from lapses in worship in a past life, and teaches the Pradosh vow, which restores their fortune.', hi: 'स्कंद पुराण में विदर्भ के राजा सत्यरथ की कथा है, जो युद्ध में मारे जाते हैं; रानी वन में पुत्र को जन्म देकर चल बसती हैं, और बालक को उमा नाम की ब्राह्मणी पालती हैं। शांडिल्य ऋषि बताते हैं कि यह कष्ट पिछले जन्म में पूजा में चूक के कारण है, और प्रदोष व्रत बताते हैं, जिससे उनका भाग्य लौट आता है।' },
          { en: 'A legend of Ujjain tells of a siege on a Saturday Trayodashi (Shani Pradosh): a boy named Shrikhar and a priest named Vridhi pray to Shiva by the Kshipra river, Shiva appears as a pillar of light, the invaders are defeated, and Shiva remains there as the self-manifested Mahakaleshwar lingam.', hi: 'उज्जैन की एक कथा में शनिवार की त्रयोदशी (शनि प्रदोष) को नगर घिरा होता है: श्रीखर नाम का बालक और वृद्धि नाम के पुजारी क्षिप्रा तट पर शिव से प्रार्थना करते हैं, शिव ज्योति-स्तंभ के रूप में प्रकट होते हैं, आक्रमणकारी हारते हैं, और शिव वहीं स्वयंभू महाकालेश्वर लिंग के रूप में रहते हैं।' },
        ],
        sources: [S.wPradosha],
      },
      {
        id: 'samagri', heading: { en: 'What you need', hi: 'पूजा सामग्री' },
        list: [
          { en: 'Water (and other items) for abhisheka of the Shiva lingam', hi: 'शिवलिंग के अभिषेक के लिए जल (और अन्य सामग्री)' },
          { en: 'Sandalwood paste and bel (bilva) leaves', hi: 'चंदन और बेलपत्र' },
          { en: 'Fragrance, a lamp and a food offering (naivedya)', hi: 'सुगंध, दीपक और नैवेद्य' },
          { en: 'Rudraksha and vibhuti (sacred ash), if you use them', hi: 'रुद्राक्ष और विभूति (भस्म), यदि आप धारण करते हैं' },
        ],
        sources: [S.wPradosha],
      },
      {
        id: 'steps', heading: { en: 'Puja vidhi — simple steps', hi: 'पूजा विधि — सरल चरण' },
        steps: [
          { en: 'Keep a fast through the day.', hi: 'दिन भर व्रत रखें।' },
          { en: 'Bathe about an hour before sunset.', hi: 'सूर्यास्त से लगभग एक घंटा पहले स्नान करें।' },
          { en: 'In the pradosh time, worship Shiva with Parvati, Ganesha, Kartikeya and Nandi — abhisheka, sandal paste, bel leaves, fragrance, lamp and naivedya.', hi: 'प्रदोष काल में शिव-पार्वती, गणेश, कार्तिकेय और नंदी की पूजा करें — अभिषेक, चंदन, बेलपत्र, सुगंध, दीप और नैवेद्य।' },
          { en: 'After the worship, read or listen to the Pradosh katha.', hi: 'पूजा के बाद प्रदोष व्रत कथा पढ़ें या सुनें।' },
          { en: 'Some keep a night vigil after the worship.', hi: 'कुछ लोग पूजा के बाद रात्रि जागरण करते हैं।' },
        ],
        sources: [S.wPradosha],
      },
      timing(
        'The vrat day is the one on which Trayodashi prevails after sunset (pradosh kaal), so it can fall on Dwadashi by the calendar. Drik Panchang treats the time when Trayodashi and the pradosh window overlap as the best time for the Shiva puja; this page shows that window for New Delhi (from sunset, for the first fifth of the night). Wikipedia describes a wider custom of about 1½ hours either side of sunset.',
        'व्रत उस दिन होता है जिस दिन सूर्यास्त के बाद (प्रदोष काल में) त्रयोदशी हो, इसलिए कैलेंडर में यह द्वादशी को भी पड़ सकता है। द्रिक पंचांग त्रयोदशी और प्रदोष काल के मेल को शिव पूजा का सबसे अच्छा समय मानता है; यह पृष्ठ नई दिल्ली के लिए वह समय (सूर्यास्त से रात के पहले पाँचवें भाग तक) दिखाता है। विकिपीडिया सूर्यास्त के लगभग डेढ़ घंटे पहले और बाद तक की परंपरा भी बताता है।',
        [S.dPradosh, S.wPradosha],
      ),
      {
        id: 'regional', heading: { en: 'Traditions differ', hi: 'परंपराओं में अंतर' },
        paras: [
          { en: 'In South Indian Shiva temples Nandi is worshipped on Pradosham, and a festival image of Shiva and Parvati seated on Nandi is taken in procession around the temple. In Ujjain the Shani Pradosh legend is tied to the Mahakaleshwar temple.', hi: 'दक्षिण भारत के शिव मंदिरों में प्रदोषम् पर नंदी की पूजा होती है, और नंदी पर विराजमान शिव-पार्वती की उत्सव मूर्ति मंदिर परिसर में घुमाई जाती है। उज्जैन में शनि प्रदोष की कथा महाकालेश्वर मंदिर से जुड़ी है।' },
        ],
        sources: [S.wPradosha],
      },
    ],
    mantras: [],
    faq: [
      { q: { en: 'What is the best time for the Pradosh puja?', hi: 'प्रदोष पूजा का सबसे अच्छा समय क्या है?' }, a: { en: 'The evening after sunset, while Trayodashi lasts. This page shows that window for New Delhi; for another city, start from your own sunset.', hi: 'सूर्यास्त के बाद की संध्या, जब तक त्रयोदशी रहे। यह पृष्ठ नई दिल्ली का समय दिखाता है; दूसरे शहर में अपने सूर्यास्त से गिनें।' } },
      { q: { en: 'What are Soma, Bhauma and Shani Pradosh?', hi: 'सोम, भौम और शनि प्रदोष क्या हैं?' }, a: { en: 'The same vrat named by its weekday: Monday (Soma), Tuesday (Bhauma) and Saturday (Shani).', hi: 'यही व्रत, वार के नाम से: सोमवार (सोम), मंगलवार (भौम) और शनिवार (शनि)।' } },
      { q: { en: 'Ekadashi and Pradosh are on consecutive days — what do I do?', hi: 'एकादशी और प्रदोष लगातार दो दिन हैं — क्या करें?' }, a: { en: 'This is common. Drik Panchang suggests a symbolic Ekadashi parana with water only, so you can continue into the Pradosh fast.', hi: 'ऐसा अक्सर होता है। द्रिक पंचांग सुझाव देता है कि एकादशी का पारण प्रतीकात्मक रूप से केवल जल से करें, ताकि प्रदोष व्रत जारी रख सकें।' } },
    ],
    faqSources: [S.dPradosh, S.wPradosha],
  },

  'sankashti-chaturthi': {
    slug: 'sankashti-chaturthi',
    summary: {
      en: 'Sankashti (Sankatahara) Chaturthi is a monthly Ganesha vrat on the fourth day of the dark fortnight, after the full moon. Devotees fast through the day and break the fast at night after sighting the Moon and praying to Ganesha. When it falls on a Tuesday it is called Angaraki Chaturthi and held to be the most auspicious.',
      hi: 'संकष्टी (संकटहर) चतुर्थी पूर्णिमा के बाद कृष्ण पक्ष की चतुर्थी को हर महीने किया जाने वाला गणेश व्रत है। भक्त दिन भर व्रत रखते हैं और रात को चंद्र दर्शन व गणेश पूजा के बाद व्रत खोलते हैं। मंगलवार को पड़े तो इसे अंगारकी चतुर्थी कहते हैं और सबसे शुभ माना जाता है।',
    },
    sections: [
      {
        id: 'about', heading: { en: 'What Sankashti Chaturthi is', hi: 'संकष्टी चतुर्थी क्या है' },
        paras: [
          { en: 'Each month Ganesha is worshipped under a different name and seat (peetha) — for example Bhalachandra (“with the Moon on his forehead”) in Phalguna. Each month’s fast has its own vrat katha: thirteen in all, one for each month and one for the leap month. (Vinayaka Chaturthi is the Shukla-paksha Chaturthi after the new moon.)', hi: 'हर महीने गणेश जी की पूजा अलग नाम और पीठ के साथ होती है — जैसे फाल्गुन में भालचंद्र (“जिनके मस्तक पर चंद्रमा है”)। हर महीने के व्रत की अपनी कथा है: कुल तेरह, हर महीने की एक और अधिक मास की एक। (विनायक चतुर्थी अमावस्या के बाद शुक्ल पक्ष की चतुर्थी है।)' },
        ],
        sources: [S.wSankashti, S.dSankashti],
      },
      {
        id: 'katha', heading: { en: 'The katha of Angaraki Chaturthi', hi: 'अंगारकी चतुर्थी की कथा' },
        paras: [
          { en: 'Angaraka, a rishi and devotee of Ganesha, was the son of Prithvi, the Earth. Pleased with his devotion, Ganesha offered him a boon; Angaraka asked that his name be joined with Ganesha’s forever. Ganesha granted it and declared that prayers made on Angaraki Chaturthi would be fulfilled. “Angaraka” means the colour of glowing embers — and is the name of Mars, after whom Tuesday is named.', hi: 'अंगारक, जो ऋषि और गणेश भक्त थे, पृथ्वी के पुत्र थे। उनकी भक्ति से प्रसन्न होकर गणेश जी ने वर माँगने को कहा; अंगारक ने माँगा कि उनका नाम सदा गणेश जी के नाम से जुड़ा रहे। गणेश जी ने यह वर दिया और कहा कि अंगारकी चतुर्थी पर की गई प्रार्थना पूरी होगी। “अंगारक” का अर्थ है दहकते अंगारे जैसा रंग — और यह मंगल ग्रह का नाम है, जिनके नाम पर मंगलवार है।' },
          { en: 'The monthly kathas themselves differ by month; this page does not retell them, as we could not open a source for all thirteen.', hi: 'हर महीने की कथा अलग है; हमें तेरहों के लिए स्रोत नहीं मिला, इसलिए वे यहाँ नहीं दोहराई गईं।' },
        ],
        sources: [S.wSankashti],
      },
      {
        id: 'samagri', heading: { en: 'What you need', hi: 'पूजा सामग्री' },
        list: [
          { en: 'An image of Ganesha on a clean altar', hi: 'स्वच्छ आसन पर गणेश जी की प्रतिमा' },
          { en: 'Modak, durva grass and betel nut', hi: 'मोदक, दूर्वा और सुपारी' },
          { en: 'Scent and flowers for the Moon, and water for arghya', hi: 'चंद्रमा के लिए गंध और फूल, और अर्घ्य के लिए जल' },
        ],
        sources: [S.dSankashti, S.wSankashti],
      },
      {
        id: 'steps', heading: { en: 'Puja vidhi — simple steps', hi: 'पूजा विधि — सरल चरण' },
        steps: [
          { en: 'Bathe in the morning and take the vow to fast, keeping your mind on Ganesha.', hi: 'सुबह स्नान करके गणेश जी का ध्यान करते हुए व्रत का संकल्प लें।' },
          { en: 'Fast through the day; oily food is avoided.', hi: 'दिन भर व्रत रखें; तला-भुना भोजन वर्जित है।' },
          { en: 'In the evening bathe again, set up the altar and do the Ganesha puja with modak, durva and betel nut. The Ganapati Atharvasheersha is recited before moonrise.', hi: 'शाम को फिर स्नान करें, आसन सजाएँ और मोदक, दूर्वा व सुपारी से गणेश पूजा करें। चंद्रोदय से पहले गणपति अथर्वशीर्ष का पाठ किया जाता है।' },
          { en: 'At moonrise, worship the Moon with scent and flowers and offer arghya (water) and naivedya.', hi: 'चंद्रोदय पर गंध और फूल से चंद्रमा की पूजा करें और अर्घ्य (जल) व नैवेद्य अर्पित करें।' },
          { en: 'Then break the fast and eat.', hi: 'फिर व्रत खोलकर भोजन करें।' },
        ],
        sources: [S.dSankashti, S.wSankashti],
      },
      timing(
        'The vrat is kept on the day when Chaturthi prevails at moonrise; if two days qualify, the first. This page shows the moonrise for New Delhi — clouds or another city can change the sighting by some minutes.',
        'व्रत उस दिन होता है जिस दिन चंद्रोदय के समय चतुर्थी हो; दो दिन ऐसे हों तो पहला दिन। यह पृष्ठ नई दिल्ली का चंद्रोदय दिखाता है — बादल या दूसरा शहर होने पर चंद्र दर्शन कुछ मिनट आगे-पीछे हो सकता है।',
        [S.dSankashti],
      ),
      {
        id: 'regional', heading: { en: 'Traditions differ', hi: 'परंपराओं में अंतर' },
        paras: [
          { en: 'In North and Central India the Magha Krishna Chaturthi fast is called Sakat Chauth, and women offer arghya to the Moon at night; bhugga (sesame and jaggery) and radish are given and eaten to end the fast. Drik Panchang adds that some keep the vrat for 4 or 13 years and then complete it with an udyapan.', hi: 'उत्तर और मध्य भारत में माघ कृष्ण चतुर्थी के व्रत को सकट चौथ कहते हैं, और महिलाएँ रात को चंद्रमा को अर्घ्य देती हैं; व्रत खोलने के लिए भुग्गा (तिल और गुड़) और मूली दी व खाई जाती है। द्रिक पंचांग के अनुसार कुछ लोग यह व्रत 4 या 13 वर्ष रखकर उद्यापन करते हैं।' },
        ],
        sources: [S.wSankashti, S.dSankashti],
      },
    ],
    mantras: [],
    faq: [
      { q: { en: 'When do I break the Sankashti fast?', hi: 'संकष्टी का व्रत कब खोलें?' }, a: { en: 'At night, after you have seen the Moon, offered arghya and prayed to Ganesha.', hi: 'रात को, चंद्र दर्शन, अर्घ्य और गणेश पूजा के बाद।' } },
      { q: { en: 'What is Angaraki Chaturthi?', hi: 'अंगारकी चतुर्थी क्या है?' }, a: { en: 'A Sankashti Chaturthi that falls on a Tuesday. It is considered the most auspicious of them.', hi: 'मंगलवार को पड़ने वाली संकष्टी चतुर्थी। इसे सबसे शुभ माना जाता है।' } },
      { q: { en: 'What if clouds hide the Moon?', hi: 'बादलों से चंद्रमा न दिखे तो?' }, a: { en: 'Follow your family’s custom — there is no need to worry. This page shows the computed moonrise time for New Delhi as a guide.', hi: 'अपने परिवार की परंपरा के अनुसार करें — चिंता की कोई बात नहीं। यह पृष्ठ मार्गदर्शन के लिए नई दिल्ली का गणना किया हुआ चंद्रोदय समय दिखाता है।' } },
    ],
    faqSources: [S.wSankashti, S.dSankashti],
  },

  'karwa-chauth': {
    slug: 'karwa-chauth',
    summary: {
      en: 'Karwa Chauth is kept by married women, mainly in North and West India and Nepal, on the Chaturthi of the dark fortnight of Kartika (Ashwin in the amanta calendar). They fast from sunrise to moonrise for their husband’s well-being and long life, worship Parvati (Gauri), Shiva and Ganesha in the evening, and break the fast after offering water to the Moon.',
      hi: 'करवा चौथ विवाहित महिलाएँ, मुख्यतः उत्तर और पश्चिम भारत तथा नेपाल में, कार्तिक (अमांत में आश्विन) कृष्ण पक्ष की चतुर्थी को रखती हैं। वे पति के कल्याण और लंबी आयु के लिए सूर्योदय से चंद्रोदय तक व्रत रखती हैं, शाम को माता पार्वती (गौरी), शिव और गणेश की पूजा करती हैं, और चंद्रमा को अर्घ्य देकर व्रत खोलती हैं।',
    },
    sections: [
      {
        id: 'about', heading: { en: 'What Karwa Chauth is', hi: 'करवा चौथ क्या है' },
        paras: [
          { en: 'The karwa is the small pitcher used in the puja, and chauth is the fourth lunar day (Chaturthi). Women exchange painted karwas filled with bangles, sweets and small gifts, apply mehndi and spend the day with friends and family; in the evening they gather for a group puja.', hi: 'नाम करवा (मिट्टी का छोटा घड़ा) और चौथ (चतुर्थी) से बना है। महिलाएँ चूड़ियों, मिठाइयों और छोटे उपहारों से भरे सजे करवे एक-दूसरे को देती हैं, मेहंदी लगाती हैं और दिन परिवार-सखियों के साथ बिताती हैं; शाम को सामूहिक पूजा होती है।' },
        ],
        sources: [S.wKarva],
      },
      {
        id: 'katha', heading: { en: 'The katha', hi: 'कथा' },
        paras: [
          { en: 'Queen Veeravati, the only sister of seven brothers, could not bear her first fast. Her brothers tricked her with a mirror in a pipal tree that looked like the rising Moon; she broke the fast, and her husband died. When she kept the fast again with full devotion, Yama gave him back his life. (In another telling the brothers use a fire, and Parvati helps her revive him.)', hi: 'सात भाइयों की इकलौती बहन रानी वीरावती अपना पहला व्रत सह नहीं पाईं। भाइयों ने पीपल के पेड़ में दर्पण लगाकर ऐसा छल किया कि वह उगते चंद्रमा जैसा लगे; उन्होंने व्रत तोड़ा और उनके पति की मृत्यु हो गई। जब उन्होंने पूरी श्रद्धा से फिर व्रत रखा, तो यमराज ने उनके पति को जीवन लौटा दिया। (एक दूसरी कथा में भाई आग जलाकर छल करते हैं, और माता पार्वती पति को जीवित करने में सहायता करती हैं।)' },
          { en: 'In the story of Karwa, a devoted wife saves her husband from a crocodile: she threatens to curse Yama, who sends the crocodile away and grants her husband long life. In the Mahabharata tradition, Draupadi keeps this fast on Krishna’s advice, and the Pandavas’ troubles pass.', hi: 'करवा की कथा में एक पतिव्रता स्त्री अपने पति को मगरमच्छ से बचाती है: वह यमराज को श्राप देने की चेतावनी देती है, यमराज मगरमच्छ को दंड देते हैं और पति को लंबी आयु देते हैं। महाभारत की परंपरा में द्रौपदी श्रीकृष्ण के कहने पर यह व्रत रखती हैं, और पांडवों के संकट दूर होते हैं।' },
          { en: 'Drik Panchang says the Karwa Chauth Mahatmya (the story of the vrat’s greatness) is narrated during the group puja; which story is told varies by family and region.', hi: 'द्रिक पंचांग के अनुसार सामूहिक पूजा में करवा चौथ माहात्म्य (व्रत की महिमा की कथा) सुनाया जाता है; कौन-सी कथा सुनाई जाए, यह परिवार और क्षेत्र के अनुसार बदलता है।' },
        ],
        sources: [S.wKarva, S.dKarva],
      },
      {
        id: 'samagri', heading: { en: 'What you need', hi: 'पूजा सामग्री' },
        list: [
          { en: 'A karwa (small pitcher) filled with water or milk, with a coin or small precious item', hi: 'जल या दूध से भरा करवा, उसमें एक सिक्का या छोटी कीमती वस्तु' },
          { en: 'A drawing or printed picture of Gauri and Chauth Mata (in Uttar Pradesh, clay images of Shiva, Parvati and Ganesha)', hi: 'गौरी और चौथ माता का चित्र या छपा चित्र (उत्तर प्रदेश में शिव, पार्वती और गणेश की मिट्टी की मूर्तियाँ)' },
          { en: 'A decorated puja thali', hi: 'सजी हुई पूजा की थाली' },
          { en: 'A sieve (or dupatta) to view the Moon, and water for arghya', hi: 'चंद्र दर्शन के लिए छलनी (या दुपट्टा), और अर्घ्य के लिए जल' },
          { en: 'Sweets (baya / baayna) to give to the mother-in-law or sister-in-law', hi: 'सास या ननद को देने के लिए मिठाई (बया / बायना)' },
        ],
        sources: [S.dKarva, S.wKarva],
      },
      {
        id: 'steps', heading: { en: 'Puja vidhi — simple steps', hi: 'पूजा विधि — सरल चरण' },
        steps: [
          { en: 'Before dawn, eat the sargi — the pre-fast meal, traditionally sent by the mother-in-law.', hi: 'भोर से पहले सरगी खाएँ — व्रत से पहले का भोजन, जो परंपरा से सास भेजती हैं।' },
          { en: 'After the morning bath, take the sankalpa (the vow) — see the mantra below. The fast is without food and water until moonrise.', hi: 'सुबह स्नान के बाद संकल्प लें — नीचे मंत्र देखें। व्रत चंद्रोदय तक बिना अन्न-जल का होता है।' },
          { en: 'In the evening, draw or place Gauri and Chauth Mata. Worship Parvati first, then Shiva, Kartikeya and Ganesha — usually together with other women.', hi: 'शाम को गौरी और चौथ माता का चित्र बनाएँ या रखें। पहले माता पार्वती, फिर शिव, कार्तिकेय और गणेश की पूजा करें — प्रायः अन्य महिलाओं के साथ मिलकर।' },
          { en: 'Listen to the Karwa Chauth katha, told by an elder woman or a priest, passing the thalis around the circle.', hi: 'किसी बड़ी महिला या पुरोहित से करवा चौथ की कथा सुनें, थालियाँ गोले में घुमाते हुए।' },
          { en: 'Karwa daan: give the filled karwa to a Brahmin or a married woman.', hi: 'करवा दान: भरा हुआ करवा किसी ब्राह्मण या सुहागिन को दें।' },
          { en: 'At moonrise, worship the Moon and offer water (arghya); look at the Moon through the sieve, then at your husband.', hi: 'चंद्रोदय पर चंद्रमा की पूजा करके अर्घ्य दें; छलनी से चंद्रमा को, फिर पति को देखें।' },
          { en: 'Break the fast — traditionally the husband gives the first sip of water — and then have a full meal.', hi: 'व्रत खोलें — परंपरा से पति पहला घूँट पानी पिलाते हैं — फिर पूरा भोजन करें।' },
        ],
        sources: [S.dKarva, S.wKarva],
      },
      timing(
        'Karwa Chauth is kept on the day when Kartika Krishna Chaturthi prevails at moonrise. The evening puja is done after sunset (Drik Panchang, citing the Vratraj), and the fast ends after moonrise — this page shows New Delhi’s moonrise; your city may differ by some minutes.',
        'करवा चौथ उस दिन होता है जिस दिन चंद्रोदय के समय कार्तिक कृष्ण चतुर्थी हो। संध्या पूजा सूर्यास्त के बाद होती है (द्रिक पंचांग, व्रतराज के अनुसार), और व्रत चंद्रोदय के बाद खुलता है — यह पृष्ठ नई दिल्ली का चंद्रोदय दिखाता है; आपके शहर में कुछ मिनट का अंतर हो सकता है।',
        [S.dKarva],
      ),
      {
        id: 'regional', heading: { en: 'Traditions differ', hi: 'परंपराओं में अंतर' },
        paras: [
          { en: 'It is kept in Delhi, Haryana, Rajasthan, Punjab, Jammu, Madhya Pradesh, Uttar Pradesh and Himachal Pradesh, and in Nepal and Fiji; Andhra Pradesh has a related observance called Atla Tadde. In Punjab the sargi includes fenia; in Uttar Pradesh some eat soot feni with milk and sugar the night before. In Rajasthan the story of Gaur Mata is told. Some unmarried women keep the fast too, praying for a loving partner — this is not universal.', hi: 'यह दिल्ली, हरियाणा, राजस्थान, पंजाब, जम्मू, मध्य प्रदेश, उत्तर प्रदेश और हिमाचल प्रदेश में, तथा नेपाल और फ़िजी में रखा जाता है; आंध्र प्रदेश में इससे मिलता-जुलता अटला तद्दे होता है। पंजाब में सरगी में फेनिया होती है; उत्तर प्रदेश में कुछ लोग एक रात पहले दूध-चीनी के साथ सूत फेनी खाते हैं। राजस्थान में गौर माता की कथा कही जाती है। कुछ अविवाहित लड़कियाँ भी अच्छे जीवनसाथी की कामना से यह व्रत रखती हैं — पर यह सब जगह नहीं।' },
        ],
        sources: [S.wKarva],
      },
    ],
    mantras: [
      {
        deva: 'मम सुखसौभाग्य पुत्रपौत्रादि सुस्थिर श्री प्राप्तये करक चतुर्थी व्रतमहं करिष्ये।',
        translit: 'Mama sukha-saubhagya putra-pautradi susthira shri praptaye karaka chaturthi vratam aham karishye.',
        meaning: { en: 'I will observe the Karak Chaturthi fast to attain lasting happiness, marital good fortune and prosperity for my children and grandchildren.', hi: 'मैं स्थायी सुख, सौभाग्य और संतान-पौत्रों की समृद्धि के लिए करक चतुर्थी का व्रत करूँगी।' },
        use: { en: 'Sankalpa (the vow), in the morning.', hi: 'संकल्प, सुबह।' },
        source: S.dKarva,
      },
      {
        deva: 'नमः शिवायै शर्वाण्यै सौभाग्यं संतति शुभाम्। प्रयच्छ भक्तियुक्तानां नारीणां हरवल्लभे॥',
        translit: 'Namah shivayai sharvanyai saubhagyam santatim shubham. Prayachchha bhakti-yuktanam narinam haravallabhe.',
        meaning: { en: 'Salutations to the consort of Shiva. O beloved of Hara, grant good fortune and virtuous children to the women devoted to you.', hi: 'शिव-पत्नी को नमस्कार। हे हरवल्लभे, अपनी भक्त स्त्रियों को सौभाग्य और शुभ संतान प्रदान करें।' },
        use: { en: 'Prayer to Parvati at the evening puja.', hi: 'संध्या पूजा में माता पार्वती की प्रार्थना।' },
        source: S.dKarva,
      },
      {
        deva: 'करकं क्षीरसम्पूर्णा तोयपूर्णमथापि वा। ददामि रत्नसंयुक्तं चिरञ्जीवतु मे पतिः॥',
        translit: 'Karakam kshira-sampurna toya-purnam athapi va. Dadami ratna-samyuktam chiranjivatu me patih.',
        meaning: { en: 'I offer this pitcher, filled with milk or water and set with gems, so that my husband may live long.', hi: 'दूध या जल से भरा, रत्न-युक्त यह करवा मैं दान करती हूँ, ताकि मेरे पति दीर्घायु हों।' },
        use: { en: 'Karwa daan (giving the pitcher).', hi: 'करवा दान।' },
        source: S.dKarva,
      },
    ],
    faq: [
      { q: { en: 'When is the Karwa Chauth fast broken?', hi: 'करवा चौथ का व्रत कब खोलते हैं?' }, a: { en: 'After moonrise: worship the Moon, offer water (arghya), view the Moon and then your husband, and break the fast — traditionally with water from your husband.', hi: 'चंद्रोदय के बाद: चंद्रमा की पूजा करके अर्घ्य दें, चंद्रमा और फिर पति को देखें, और व्रत खोलें — परंपरा से पति के हाथ से जल पीकर।' } },
      { q: { en: 'Can unmarried women keep Karwa Chauth?', hi: 'क्या अविवाहित लड़कियाँ करवा चौथ रख सकती हैं?' }, a: { en: 'Some do, out of friendship or praying for a loving partner. It is not universal — follow your family’s custom.', hi: 'कुछ रखती हैं, सखियों के साथ या अच्छे जीवनसाथी की कामना से। यह सब जगह नहीं — अपने परिवार की परंपरा मानें।' } },
      { q: { en: 'Which deities are worshipped?', hi: 'किन देवताओं की पूजा होती है?' }, a: { en: 'Parvati (Gauri / Chauth Mata) first, then Shiva, Kartikeya and Ganesha, and the Moon at moonrise.', hi: 'पहले माता पार्वती (गौरी / चौथ माता), फिर शिव, कार्तिकेय और गणेश, और चंद्रोदय पर चंद्रमा।' } },
      { q: { en: 'What is sargi?', hi: 'सरगी क्या है?' }, a: { en: 'The meal eaten before dawn, before the fast begins. In Punjab it includes fenia and is traditionally sent by the mother-in-law.', hi: 'भोर से पहले, व्रत शुरू होने से पहले खाया जाने वाला भोजन। पंजाब में इसमें फेनिया होती है और परंपरा से सास भेजती हैं।' } },
    ],
    faqSources: [S.wKarva, S.dKarva],
  },

  'somvar-vrat': {
    slug: 'somvar-vrat',
    summary: {
      en: 'The Somvar (Monday) vrat is a weekly fast for Lord Shiva. Devotees bathe, worship Shiva with white flowers while chanting “Om Namah Shivaya”, listen to the katha in the evening, and eat one meal at night (nakta) or keep a full fast. The Skanda Purana especially praises the Mondays of Shravana.',
      hi: 'सोमवार व्रत भगवान शिव के लिए हर सप्ताह रखा जाने वाला व्रत है। भक्त स्नान करके “ॐ नमः शिवाय” जपते हुए सफ़ेद फूलों से शिव पूजा करते हैं, शाम को कथा सुनते हैं, और रात को एक बार भोजन (नक्त) करते हैं या पूरा उपवास रखते हैं। स्कंद पुराण श्रावण के सोमवारों की विशेष महिमा बताता है।',
    },
    sections: [
      {
        id: 'about', heading: { en: 'What the Somvar vrat is', hi: 'सोमवार व्रत क्या है' },
        paras: [
          { en: 'Monday (Somavara) is Shiva’s day. In the Shravana Masa Mahatmya of the Skanda Purana, Shiva tells Sanatkumara that Monday is his own form and that Lord Krishna and righteous kings kept this vrat.', hi: 'सोमवार भगवान शिव का दिन है। स्कंद पुराण के श्रावण मास माहात्म्य में शिव सनत्कुमार से कहते हैं कि सोमवार उनका अपना स्वरूप है, और श्रीकृष्ण तथा धर्मात्मा राजाओं ने यह व्रत रखा।' },
        ],
        sources: [S.dShravanSom],
      },
      {
        id: 'katha', heading: { en: 'The katha', hi: 'कथा' },
        paras: [
          { en: 'A man named Dhanika had no children. At Parvati’s request, Shiva blessed him with a son — but the son was destined to live only a short time. Through the power of the Monday fast, the boy was granted a long life.', hi: 'धनिक नाम के एक व्यक्ति की कोई संतान नहीं थी। माता पार्वती के आग्रह पर शिव ने उन्हें पुत्र का वरदान दिया — पर वह पुत्र अल्पायु था। सोमवार व्रत के प्रभाव से उस बालक को लंबी आयु मिली।' },
          { en: 'The Shravana Somavara Mahatmya adds that whatever is sincerely wished for is granted, and that simply listening to the mahatmya brings the merit of the vrat.', hi: 'श्रावण सोमवार माहात्म्य यह भी कहता है कि सच्चे मन से जो माँगा जाए वह मिलता है, और माहात्म्य को सुनने मात्र से व्रत का पुण्य मिलता है।' },
        ],
        sources: [S.dWeekday, S.dShravanSom],
      },
      {
        id: 'samagri', heading: { en: 'What you need', hi: 'पूजा सामग्री' },
        list: [
          { en: 'Clean white clothes to wear', hi: 'पहनने के लिए स्वच्छ सफ़ेद वस्त्र' },
          { en: 'White flowers (such as jasmine — malati, mallika)', hi: 'सफ़ेद फूल (जैसे मालती, मल्लिका)' },
          { en: 'Items for a full (shodashopachara) puja in the evening, if you do it', hi: 'शाम की षोडशोपचार पूजा की सामग्री, यदि आप करते हैं' },
        ],
        sources: [S.dShravanSom],
      },
      {
        id: 'steps', heading: { en: 'Puja vidhi — simple steps', hi: 'पूजा विधि — सरल चरण' },
        steps: [
          { en: 'Take the sankalpa — for the Shravana vrat, on the first Monday of Shravana Shukla paksha — and keep it on every Monday you have vowed.', hi: 'संकल्प लें — श्रावण के व्रत के लिए श्रावण शुक्ल पक्ष के पहले सोमवार को — और जितने सोमवार का संकल्प हो, हर सोमवार रखें।' },
          { en: 'In the morning, bathe and wear clean white clothes; let go of anger, pride and ill-will for the day.', hi: 'सुबह स्नान करके स्वच्छ सफ़ेद वस्त्र पहनें; दिन भर क्रोध, अहंकार और द्वेष छोड़ें।' },
          { en: 'Offer white flowers to Shiva while chanting “Namah Shivaya” / “Om Namah Shivaya”.', hi: '“नमः शिवाय” / “ॐ नमः शिवाय” जपते हुए शिव को सफ़ेद फूल अर्पित करें।' },
          { en: 'In the evening, do the puja and listen to the katha.', hi: 'शाम को पूजा करें और कथा सुनें।' },
          { en: 'Eat one meal at night (nakta vrat), or keep a full fast.', hi: 'रात को एक बार भोजन करें (नक्त व्रत), या पूरा उपवास रखें।' },
          { en: 'When your vowed Mondays are complete, an udyapan (closing rite) is traditionally done — a priest can guide you.', hi: 'संकल्पित सोमवार पूरे होने पर परंपरा से उद्यापन होता है — इसमें पुरोहित मार्गदर्शन कर सकते हैं।' },
        ],
        sources: [S.dShravanSom],
      },
      timing(
        'Every Monday. Worship is in the morning after the bath and again in the evening; the meal is taken at night. This page shows the next Monday with New Delhi’s sunrise and sunset.',
        'हर सोमवार। पूजा सुबह स्नान के बाद और फिर शाम को होती है; भोजन रात को। यह पृष्ठ अगला सोमवार नई दिल्ली के सूर्योदय-सूर्यास्त के साथ दिखाता है।',
        [S.dShravanSom],
      ),
      {
        id: 'regional', heading: { en: 'Traditions differ', hi: 'परंपराओं में अंतर' },
        paras: [
          { en: 'The Skanda Purana text allows either one meal at night (nakta) or a full fast. For the Shravana Mondays, note that North India ends each lunar month at the full moon (purnimanta) and Gujarat, Maharashtra and the South at the new moon (amanta), so “Shravana” starts about two weeks apart in the two calendars — follow your local Panchang.', hi: 'स्कंद पुराण के पाठ में रात को एक भोजन (नक्त) या पूरा उपवास — दोनों विकल्प हैं। श्रावण के सोमवारों के लिए ध्यान दें कि उत्तर भारत में चंद्र मास पूर्णिमा पर (पूर्णिमांत) और गुजरात, महाराष्ट्र व दक्षिण में अमावस्या पर (अमांत) पूरा होता है, इसलिए दोनों पंचांगों में “श्रावण” लगभग दो सप्ताह के अंतर से शुरू होता है — अपने स्थानीय पंचांग को मानें।' },
        ],
        sources: [S.dShravanSom, S.festivals],
      },
    ],
    mantras: [
      {
        deva: 'ॐ नमः शिवाय', translit: 'Om Namah Shivaya',
        meaning: { en: 'Om, salutations to Shiva.', hi: 'ॐ, भगवान शिव को नमस्कार।' },
        use: { en: 'The six-syllable (shadakshara) mantra, chanted while offering flowers; “Namah Shivaya” is the root (mula) mantra.', hi: 'षडक्षर मंत्र, फूल अर्पित करते समय जपें; “नमः शिवाय” मूल मंत्र है।' },
        source: S.dShravanSom,
      },
    ],
    faq: [
      { q: { en: 'What do I eat on a Monday fast?', hi: 'सोमवार व्रत में क्या खाएँ?' }, a: { en: 'Traditionally a single meal at night (nakta vrat), or nothing at all for a full fast. Choose what suits your health.', hi: 'परंपरा से रात को एक बार भोजन (नक्त व्रत), या पूरा उपवास। जो आपके स्वास्थ्य के लिए उचित हो वह चुनें।' } },
      { q: { en: 'Why are Shravana Mondays special?', hi: 'श्रावण के सोमवार विशेष क्यों हैं?' }, a: { en: 'The Shravana Masa Mahatmya of the Skanda Purana praises the vrat kept on every Monday of Shravana, beginning from its Shukla paksha.', hi: 'स्कंद पुराण का श्रावण मास माहात्म्य श्रावण के हर सोमवार, शुक्ल पक्ष से आरंभ करके, रखे गए व्रत की महिमा बताता है।' } },
      { q: { en: 'Which mantra do I chant?', hi: 'कौन-सा मंत्र जपें?' }, a: { en: '“Om Namah Shivaya” (Om, salutations to Shiva), while offering white flowers.', hi: '“ॐ नमः शिवाय” (ॐ, शिव को नमस्कार), सफ़ेद फूल अर्पित करते हुए।' } },
    ],
    faqSources: [S.dShravanSom, S.dWeekday],
  },

  'mangalvar-vrat': {
    slug: 'mangalvar-vrat',
    summary: {
      en: 'The Mangalvar (Tuesday) vrat is a weekly fast for Hanuman, kept for devotion, strength and to ease difficulties. Devotees usually vow 21, 31 or 51 Tuesdays, wear red, worship Hanuman with red flowers and sindoor, listen to the katha, and eat simple fruit-and-milk food or one sattvic meal.',
      hi: 'मंगलवार व्रत हनुमान जी के लिए हर सप्ताह रखा जाने वाला व्रत है — भक्ति, बल और कठिनाइयाँ दूर करने के लिए। भक्त प्रायः 21, 31 या 51 मंगलवार का संकल्प लेते हैं, लाल वस्त्र पहनते हैं, लाल फूल और सिंदूर से हनुमान पूजा करते हैं, कथा सुनते हैं, और फलाहार या एक सात्विक भोजन करते हैं।',
    },
    sections: [
      {
        id: 'about', heading: { en: 'What the Mangalvar vrat is', hi: 'मंगलवार व्रत क्या है' },
        paras: [
          { en: 'A Tuesday fast dedicated to Hanuman. Drik Panchang describes it as kept for devotion, strength and inner power, and to help with obstacles, illness, fear of enemies, planetary troubles and mental stress.', hi: 'हनुमान जी को समर्पित मंगलवार का व्रत। द्रिक पंचांग के अनुसार यह भक्ति, बल और आंतरिक शक्ति के लिए, और बाधाओं, रोग, शत्रु-भय, ग्रह-कष्ट व मानसिक तनाव में सहारे के लिए रखा जाता है।' },
        ],
        sources: [S.dHanuman],
      },
      {
        id: 'katha', heading: { en: 'The katha', hi: 'कथा' },
        paras: [
          { en: 'A Brahmin couple had no children and longed for a child. Through their devotion and the Tuesday fast, by Hanuman’s grace, they were blessed with a son.', hi: 'एक ब्राह्मण दंपति की कोई संतान नहीं थी और वे संतान के लिए तरसते थे। उनकी भक्ति और मंगलवार व्रत से, हनुमान जी की कृपा से, उन्हें पुत्र प्राप्त हुआ।' },
        ],
        sources: [S.dWeekday],
      },
      {
        id: 'samagri', heading: { en: 'What you need', hi: 'पूजा सामग्री' },
        list: [
          { en: 'Clean red clothes to wear, and a red cloth for the altar', hi: 'पहनने के लिए स्वच्छ लाल वस्त्र, और आसन के लिए लाल कपड़ा' },
          { en: 'An image or yantra of Hanuman', hi: 'हनुमान जी की प्रतिमा या यंत्र' },
          { en: 'Red flowers, sindoor (chola — sindoor with jasmine oil) and tulsi leaves', hi: 'लाल फूल, सिंदूर (चोला — चमेली के तेल में सिंदूर) और तुलसी दल' },
          { en: 'Jaggery, gram (chana), coconut and laddus; incense, lamp and naivedya', hi: 'गुड़, चना, नारियल और लड्डू; धूप, दीप और नैवेद्य' },
        ],
        sources: [S.dHanuman],
      },
      {
        id: 'steps', heading: { en: 'Puja vidhi — simple steps', hi: 'पूजा विधि — सरल चरण' },
        steps: [
          { en: 'At the start, vow the number of Tuesdays (21, 31 or 51).', hi: 'आरंभ में मंगलवारों की संख्या (21, 31 या 51) का संकल्प लें।' },
          { en: 'Bathe (at home with a little Gangajal in the water is fine) and wear clean red clothes.', hi: 'स्नान करें (घर पर पानी में थोड़ा गंगाजल मिलाकर भी ठीक है) और स्वच्छ लाल वस्त्र पहनें।' },
          { en: 'Take the sankalpa, clean the puja place, spread a red cloth and place Hanuman’s image.', hi: 'संकल्प लें, पूजा स्थान साफ़ करें, लाल कपड़ा बिछाएँ और हनुमान जी की प्रतिमा रखें।' },
          { en: 'Worship Hanuman with red flowers, sindoor, tulsi, jaggery, gram, incense, lamp and naivedya; chant as you are able.', hi: 'लाल फूल, सिंदूर, तुलसी, गुड़, चना, धूप, दीप और नैवेद्य से हनुमान पूजा करें; अपनी क्षमता अनुसार जप करें।' },
          { en: 'Read or listen to the vrat katha.', hi: 'व्रत कथा पढ़ें या सुनें।' },
          { en: 'After the puja, offer roti, jaggery and gram to a cow.', hi: 'पूजा के बाद गाय को रोटी, गुड़ और चना खिलाएँ।' },
          { en: 'For food: fruit, milk, coconut water, sabudana, makhana or peanuts — or one sattvic meal. Avoid meat, alcohol, onion, garlic, stale and very spicy food.', hi: 'भोजन: फल, दूध, नारियल पानी, साबूदाना, मखाना या मूँगफली — या एक सात्विक भोजन। मांस, शराब, प्याज़, लहसुन, बासी और बहुत तीखा भोजन न लें।' },
          { en: 'When the vowed Tuesdays are complete, an udyapan is done with Sundara Kanda and Hanuman Chalisa recitation — a priest can guide you.', hi: 'संकल्पित मंगलवार पूरे होने पर सुंदरकांड और हनुमान चालीसा के पाठ के साथ उद्यापन होता है — इसमें पुरोहित मार्गदर्शन कर सकते हैं।' },
        ],
        sources: [S.dHanuman],
      },
      timing(
        'Every Tuesday; both morning and evening are suitable for the puja. This page shows the next Tuesday with New Delhi’s sunrise and sunset.',
        'हर मंगलवार; पूजा के लिए सुबह और शाम दोनों उपयुक्त हैं। यह पृष्ठ अगला मंगलवार नई दिल्ली के सूर्योदय-सूर्यास्त के साथ दिखाता है।',
        [S.dHanuman],
      ),
      {
        id: 'regional', heading: { en: 'Traditions differ', hi: 'परंपराओं में अंतर' },
        paras: [
          { en: 'The udyapan is done after 11, 21, 31 or 51 Tuesdays depending on the tradition. Some keep a fruit fast, others one sattvic meal; in some regions sweet pua and bundi are offered to Hanuman and eaten as the evening prasad.', hi: 'परंपरा के अनुसार उद्यापन 11, 21, 31 या 51 मंगलवार के बाद होता है। कुछ लोग फलाहार रखते हैं, कुछ एक सात्विक भोजन; कुछ क्षेत्रों में मीठे पुए और बूंदी हनुमान जी को चढ़ाकर शाम को प्रसाद के रूप में खाए जाते हैं।' },
        ],
        sources: [S.dHanuman],
      },
    ],
    mantras: [],
    faq: [
      { q: { en: 'How many Tuesdays should I keep?', hi: 'कितने मंगलवार रखने चाहिए?' }, a: { en: 'Usually 21, 31 or 51, vowed at the start; the closing udyapan follows after 11, 21, 31 or 51 depending on the tradition.', hi: 'प्रायः 21, 31 या 51, जिनका संकल्प आरंभ में लिया जाता है; परंपरा के अनुसार उद्यापन 11, 21, 31 या 51 के बाद।' } },
      { q: { en: 'What can I eat on a Tuesday fast?', hi: 'मंगलवार व्रत में क्या खाएँ?' }, a: { en: 'Fruit, milk, coconut water, sabudana, makhana and peanuts, or one sattvic meal. Meat, alcohol, onion, garlic and very spicy food are avoided.', hi: 'फल, दूध, नारियल पानी, साबूदाना, मखाना और मूँगफली, या एक सात्विक भोजन। मांस, शराब, प्याज़, लहसुन और बहुत तीखा भोजन नहीं लिया जाता।' } },
      { q: { en: 'Can I recite the Hanuman Chalisa?', hi: 'क्या हनुमान चालीसा पढ़ सकते हैं?' }, a: { en: 'Yes — the Hanuman Chalisa and Sundara Kanda are recited, especially at the udyapan.', hi: 'हाँ — हनुमान चालीसा और सुंदरकांड का पाठ किया जाता है, विशेषकर उद्यापन पर।' } },
    ],
    faqSources: [S.dHanuman],
  },

  'navratri': {
    slug: 'navratri',
    summary: {
      en: 'Navratri (“nine nights”) honours the Goddess Durga in her nine forms. The two main ones are Sharad Navratri, from Ashwina Shukla Pratipada, ending in Vijayadashami (Dussehra), and Chaitra (Vasanta) Navratri in spring, ending with Ram Navami. It begins with Ghatasthapana (installing the kalash), and many fast for one, some or all nine days.',
      hi: 'नवरात्रि (“नौ रातें”) माँ दुर्गा के नौ रूपों की उपासना है। दो मुख्य नवरात्रि हैं — शारदीय नवरात्रि, आश्विन शुक्ल प्रतिपदा से, जिसके बाद विजयादशमी (दशहरा) आती है; और वसंत में चैत्र नवरात्रि, जो राम नवमी पर पूरी होती है। इसका आरंभ घटस्थापना (कलश स्थापना) से होता है, और बहुत से लोग एक, कुछ या सभी नौ दिन व्रत रखते हैं।',
    },
    sections: [
      {
        id: 'about', heading: { en: 'What Navratri is', hi: 'नवरात्रि क्या है' },
        paras: [
          { en: 'Four seasonal Navratris are recognised; Sharad (Ashwina, September–October) is the most widely celebrated and Chaitra (March–April) next, while the Gupt Navratris of Magha and Ashadha are kept by fewer people. At its centre is Durga’s victory over the buffalo demon Mahishasura, told in the Devi Mahatmya; the Durga Saptashati (700 verses) is read.', hi: 'चार ऋतु-नवरात्रियाँ मानी जाती हैं; शारदीय (आश्विन, सितंबर–अक्टूबर) सबसे अधिक मनाई जाती है और उसके बाद चैत्र (मार्च–अप्रैल), जबकि माघ और आषाढ़ की गुप्त नवरात्रियाँ कम लोग रखते हैं। इसके केंद्र में महिषासुर पर माँ दुर्गा की विजय है, जिसका वर्णन देवी माहात्म्य में है; दुर्गा सप्तशती (700 श्लोक) का पाठ होता है।' },
        ],
        sources: [S.wNavaratri],
      },
      {
        id: 'katha', heading: { en: 'The katha', hi: 'कथा' },
        paras: [
          { en: 'The nine forms are read as the nine stages of Durga during her nine-day battle with Mahishasura; on the tenth day, Vijayadashami, victory is celebrated. In North India, Chaitra Navratri ends with Ram Navami, and around Sharad Navratri the Ramlila retells Rama’s story, ending with Dussehra, when effigies of Ravana, Kumbhakarna and Indrajit are burnt.', hi: 'नौ रूपों को महिषासुर से नौ दिन के युद्ध में माँ दुर्गा की नौ अवस्थाएँ माना जाता है; दसवें दिन, विजयादशमी, को विजय का उत्सव होता है। उत्तर भारत में चैत्र नवरात्रि राम नवमी पर पूरी होती है, और शारदीय नवरात्रि में रामलीला में श्रीराम की कथा मंचित होती है, जो दशहरे पर रावण, कुंभकर्ण और मेघनाद के पुतले जलाने के साथ पूरी होती है।' },
        ],
        sources: [S.wNavaratri, S.wNavadurga],
      },
      {
        id: 'days', heading: { en: 'The nine days — the nine forms of Durga', hi: 'नौ दिन — माँ दुर्गा के नौ रूप' },
        rows: [
          { label: { en: 'Day 1 — Shailaputri', hi: 'पहला दिन — शैलपुत्री' }, text: { en: '“Daughter of the mountain”; Parvati as a child, riding Nandi, with trident and lotus.', hi: '“पर्वत की पुत्री”; बाल्यरूप पार्वती, नंदी पर सवार, त्रिशूल और कमल लिए।' } },
          { label: { en: 'Day 2 — Brahmacharini', hi: 'दूसरा दिन — ब्रह्मचारिणी' }, text: { en: 'Devotion and penance; the ascetic form, with rosary and water pot.', hi: 'भक्ति और तप; तपस्विनी रूप, माला और कमंडल लिए।' } },
          { label: { en: 'Day 3 — Chandraghanta', hi: 'तीसरा दिन — चंद्रघंटा' }, text: { en: 'The destroyer of demons: ten-armed, riding a tiger, nine hands armed and one blessing devotees.', hi: 'असुरों का नाश करने वाला रूप: दस भुजाएँ, बाघ पर सवार, नौ हाथों में शस्त्र और एक से भक्तों को आशीर्वाद।' } },
          { label: { en: 'Day 4 — Kushmanda', hi: 'चौथा दिन — कूष्मांडा' }, text: { en: 'Linked with the cosmic egg; eight-armed, riding a lion.', hi: 'ब्रह्मांड-अंड से जुड़ा रूप; आठ भुजाएँ, सिंह पर सवार।' } },
          { label: { en: 'Day 5 — Skandamata', hi: 'पाँचवाँ दिन — स्कंदमाता' }, text: { en: 'Motherhood; holding the infant Kartikeya (Skanda) on her lap.', hi: 'मातृत्व; गोद में बाल कार्तिकेय (स्कंद) को लिए।' } },
          { label: { en: 'Day 6 — Katyayani', hi: 'छठा दिन — कात्यायनी' }, text: { en: 'The warrior form, ready to fight the asuras.', hi: 'योद्धा रूप, असुरों से युद्ध के लिए तैयार।' } },
          { label: { en: 'Day 7 — Kalaratri', hi: 'सातवाँ दिन — कालरात्रि' }, text: { en: 'The fierce, protective form, three-eyed and four-armed — associated with auspiciousness and courage.', hi: 'उग्र, रक्षक रूप, तीन नेत्र और चार भुजाएँ — शुभता और साहस से जुड़ा।' } },
          { label: { en: 'Day 8 — Mahagauri', hi: 'आठवाँ दिन — महागौरी' }, text: { en: 'Linked with beauty; four-armed, riding a white bull, one hand granting protection.', hi: 'सौंदर्य से जुड़ा रूप; चार भुजाएँ, सफ़ेद बैल पर सवार, एक हाथ अभय देता हुआ।' } },
          { label: { en: 'Day 9 — Siddhidatri', hi: 'नौवाँ दिन — सिद्धिदात्री' }, text: { en: 'The giver of siddhis, seated on a full lotus.', hi: 'सिद्धियाँ देने वाली, पूर्ण कमल पर विराजमान।' } },
        ],
        paras: [{ en: 'The Navadurga forms come from the Devi Kavacha. Day-to-form order as given in Wikipedia’s Navaratri article.', hi: 'नवदुर्गा के रूप देवी कवच से आते हैं। दिन और रूप का क्रम विकिपीडिया के नवरात्रि लेख के अनुसार।' }],
        sources: [S.wNavaratri, S.wNavadurga],
      },
      {
        id: 'samagri', heading: { en: 'What you need for Ghatasthapana', hi: 'घटस्थापना की सामग्री' },
        list: [
          { en: 'A wide clay pot, clean soil and seeds of seven grains (sapta dhanya)', hi: 'चौड़ा मिट्टी का पात्र, साफ़ मिट्टी और सात अनाजों (सप्तधान्य) के बीज' },
          { en: 'A small clay or brass kalash with a lid', hi: 'ढक्कन सहित छोटा मिट्टी या पीतल का कलश' },
          { en: 'Gangajal or clean water, sacred thread (moli), scent, betel nut (supari) and coins', hi: 'गंगाजल या स्वच्छ जल, मौली, सुगंध, सुपारी और सिक्के' },
          { en: 'Five mango or Ashoka leaves, akshat (unbroken rice) and durva grass', hi: 'आम या अशोक के पाँच पत्ते, अक्षत और दूर्वा' },
          { en: 'An unpeeled coconut and a red cloth', hi: 'छिलके वाला नारियल और लाल कपड़ा' },
          { en: 'Flowers and a garland (marigold is preferred)', hi: 'फूल और माला (गेंदा अच्छा माना जाता है)' },
        ],
        sources: [S.dGhata],
      },
      {
        id: 'steps', heading: { en: 'Puja vidhi — simple steps', hi: 'पूजा विधि — सरल चरण' },
        steps: [
          { en: 'Grain pot: lay the soil in three layers, scattering the seeds on the first two near the edge; sprinkle a little water.', hi: 'अनाज का पात्र: मिट्टी की तीन परतें बिछाएँ, पहली दो परतों पर किनारे की ओर बीज डालें; थोड़ा जल छिड़कें।' },
          { en: 'Kalash: tie the moli round its neck, fill it with water, add supari, scent, durva, akshat and coins, set the five leaves at the rim and cover it.', hi: 'कलश: गले में मौली बाँधें, जल भरें, सुपारी, सुगंध, दूर्वा, अक्षत और सिक्के डालें, किनारे पर पाँच पत्ते रखें और ढक दें।' },
          { en: 'Wrap the coconut in red cloth, tie it with moli and place it on the kalash; set the kalash in the middle of the grain pot.', hi: 'नारियल को लाल कपड़े में लपेटकर मौली से बाँधें और कलश पर रखें; कलश को अनाज के पात्र के बीच में स्थापित करें।' },
          { en: 'Invite Goddess Durga to dwell in the kalash for the nine days.', hi: 'माँ दुर्गा का आवाहन करें कि वे नौ दिन कलश में विराजें।' },
          { en: 'Do a simple five-part puja: lamp, incense, flowers and scent, then naivedya (fruit and sweets). Many keep a lamp (akhand jyot) burning through the nine nights.', hi: 'सरल पंचोपचार पूजा करें: दीप, धूप, फूल और सुगंध, फिर नैवेद्य (फल और मिठाई)। बहुत से लोग नौ रातों तक अखंड ज्योति जलाते हैं।' },
          { en: 'Each day, worship that day’s form of Durga.', hi: 'हर दिन, उस दिन के दुर्गा रूप की पूजा करें।' },
          { en: 'On Ashtami or Navami, Kanya Puja: honour and feed young girls as forms of the Goddess, with small gifts.', hi: 'अष्टमी या नवमी को कन्या पूजन: छोटी कन्याओं को देवी का रूप मानकर आदर से भोजन कराएँ और छोटे उपहार दें।' },
          { en: 'Fasting is a personal choice — from one day to all nine, full or with fruit and milk. Many avoid meat, eggs, alcohol, onion, garlic, wheat or rice flour.', hi: 'व्रत आपकी अपनी इच्छा है — एक दिन से नौ दिन तक, पूरा या फल-दूध के साथ। बहुत से लोग मांस, अंडा, शराब, प्याज़, लहसुन, गेहूँ या चावल के आटे से परहेज़ करते हैं।' },
        ],
        sources: [S.dGhata, S.wNavaratri],
      },
      timing(
        'Ghatasthapana is done on Pratipada, never on Amavasya or at night. Drik Panchang gives the rule: the first third of the day while Pratipada prevails; if that is not possible, Abhijit muhurta — before midday. Chitra nakshatra and Vaidhriti yoga are best avoided but not forbidden. This page shows the first-third window for New Delhi; many Panchangs publish a shorter muhurta inside it.',
        'घटस्थापना प्रतिपदा को होती है, अमावस्या या रात में कभी नहीं। द्रिक पंचांग का नियम: प्रतिपदा रहते दिन का पहला तिहाई भाग; यह संभव न हो तो अभिजित मुहूर्त — मध्याह्न से पहले। चित्रा नक्षत्र और वैधृति योग से बचना अच्छा, पर वर्जित नहीं। यह पृष्ठ नई दिल्ली के लिए पहला तिहाई भाग दिखाता है; कई पंचांग इसी के भीतर छोटा मुहूर्त देते हैं।',
        [S.dGhata],
      ),
      {
        id: 'regional', heading: { en: 'Traditions differ', hi: 'परंपराओं में अंतर' },
        paras: [
          { en: 'Bengal and East India keep Durga Puja (Mahalaya, Kumari Puja, Sandhi Puja, Sindur Khela). Gujarat dances garba and dandiya raas around a lamp-lit pot. South India sets up Golu / Bommai Kolu doll displays; Kerala does Ayudha Puja and Vidyarambham. Maharashtra keeps Ghatasthapana with Bhondla and Gondhal; Bihar and Purvanchal have Kalash Sthapana; Punjab and Haryana have kanjak (Kanya Puja) and jagratas; in Kashmir barley is sown in clay pots.', hi: 'बंगाल और पूर्वी भारत में दुर्गा पूजा (महालया, कुमारी पूजा, संधि पूजा, सिंदूर खेला) होती है। गुजरात में दीप-जड़े घड़े के चारों ओर गरबा और डांडिया रास। दक्षिण भारत में गोलु / बोम्मई कोलु गुड़ियों की सजावट; केरल में आयुध पूजा और विद्यारंभम्। महाराष्ट्र में भोंडला और गोंधल के साथ घटस्थापना; बिहार-पूर्वांचल में कलश स्थापना; पंजाब-हरियाणा में कंजक (कन्या पूजन) और जगराते; कश्मीर में मिट्टी के पात्रों में जौ बोए जाते हैं।' },
        ],
        sources: [S.wNavaratri],
      },
    ],
    mantras: [],
    faq: [
      { q: { en: 'Which goddess is worshipped on which day?', hi: 'किस दिन किस देवी की पूजा होती है?' }, a: { en: 'Day 1 Shailaputri, 2 Brahmacharini, 3 Chandraghanta, 4 Kushmanda, 5 Skandamata, 6 Katyayani, 7 Kalaratri, 8 Mahagauri, 9 Siddhidatri.', hi: 'पहला दिन शैलपुत्री, दूसरा ब्रह्मचारिणी, तीसरा चंद्रघंटा, चौथा कूष्मांडा, पाँचवाँ स्कंदमाता, छठा कात्यायनी, सातवाँ कालरात्रि, आठवाँ महागौरी, नौवाँ सिद्धिदात्री।' } },
      { q: { en: 'When is Ghatasthapana done?', hi: 'घटस्थापना कब करें?' }, a: { en: 'On Pratipada, in the first third of the day while Pratipada lasts (otherwise in Abhijit muhurta), before midday — never at night or on Amavasya.', hi: 'प्रतिपदा को, प्रतिपदा रहते दिन के पहले तिहाई भाग में (अन्यथा अभिजित मुहूर्त में), मध्याह्न से पहले — रात या अमावस्या को कभी नहीं।' } },
      { q: { en: 'Do I have to fast all nine days?', hi: 'क्या नौ दिन व्रत रखना ज़रूरी है?' }, a: { en: 'No. People fast from a single day to all nine, fully or with fruit and milk — choose what suits you.', hi: 'नहीं। लोग एक दिन से नौ दिन तक, पूरा या फल-दूध के साथ व्रत रखते हैं — जो आपके लिए उचित हो वह चुनें।' } },
      { q: { en: 'When is Kanya Puja?', hi: 'कन्या पूजन कब होता है?' }, a: { en: 'Usually on Ashtami or Navami: young girls are honoured as forms of Durga, fed and given small gifts.', hi: 'प्रायः अष्टमी या नवमी को: छोटी कन्याओं को दुर्गा का रूप मानकर आदर, भोजन और छोटे उपहार दिए जाते हैं।' } },
    ],
    faqSources: [S.wNavaratri, S.dGhata],
  },

  'mahashivratri': {
    slug: 'mahashivratri',
    summary: {
      en: 'Mahashivratri, “the great night of Shiva”, falls on the Krishna Chaturdashi of Phalguna (Magha in the amanta calendar). Devotees fast, keep a night-long vigil, and worship the Shiva lingam with water, milk and bilva leaves — once in the night or in each of the four prahars — and break the fast the next morning.',
      hi: 'महाशिवरात्रि, “शिव की महान रात्रि”, फाल्गुन (अमांत में माघ) कृष्ण चतुर्दशी को पड़ती है। भक्त व्रत रखते हैं, रात भर जागरण करते हैं, और जल, दूध व बेलपत्र से शिवलिंग की पूजा करते हैं — रात में एक बार या चारों प्रहरों में — और अगली सुबह व्रत खोलते हैं।',
    },
    sections: [
      {
        id: 'about', heading: { en: 'What Mahashivratri is', hi: 'महाशिवरात्रि क्या है' },
        paras: [
          { en: 'Every lunar month has a Shivaratri on its 14th night of the dark half; Mahashivratri is the great one of the year. For Shaiva devotees it marks overcoming darkness and ignorance; Drik Panchang calls it the great festival of the meeting of Shiva and Shakti.', hi: 'हर चंद्र मास में कृष्ण पक्ष की चौदहवीं रात शिवरात्रि होती है; महाशिवरात्रि वर्ष की सबसे बड़ी है। शैव भक्तों के लिए यह अंधकार और अज्ञान पर विजय का प्रतीक है; द्रिक पंचांग इसे शिव और शक्ति के मिलन का महापर्व कहता है।' },
        ],
        sources: [S.wShivaratri, S.dShivaratri],
      },
      {
        id: 'katha', heading: { en: 'The katha', hi: 'कथा' },
        paras: [
          { en: 'Several stories are linked to this night: the marriage of Shiva and Parvati; Shiva’s cosmic Tandava; Shiva drinking the Halahala poison from the churning of the ocean and holding it in his throat, which turned blue (Nilakantha); and, from the Linga Purana, Shiva appearing as an endless pillar of fire to settle a dispute between Brahma and Vishnu (Lingodbhava).', hi: 'इस रात्रि से कई कथाएँ जुड़ी हैं: शिव-पार्वती का विवाह; शिव का तांडव; समुद्र मंथन से निकला हलाहल विष पीकर कंठ में रोकना, जिससे कंठ नीला हुआ (नीलकंठ); और लिंग पुराण से, ब्रह्मा और विष्णु के विवाद को शांत करने के लिए शिव का अनंत अग्नि-स्तंभ के रूप में प्रकट होना (लिंगोद्भव)।' },
          { en: 'The Shiva Purana — the earliest text to mention the festival — tells of the hunter Gurudruha (Lubdhaka), who spent the night in a bilva tree and, without knowing it, kept dropping its leaves on a lingam below. The merit of that unknowing worship led him to spare a deer, and Shiva blessed him.', hi: 'शिव पुराण — इस पर्व का सबसे पुराना उल्लेख — शिकारी गुरुद्रुह (लुब्धक) की कथा कहता है, जिसने रात बेल के पेड़ पर बिताई और अनजाने में नीचे के शिवलिंग पर बेलपत्र गिराता रहा। उस अनजानी पूजा के पुण्य से उसने एक हिरनी को छोड़ दिया, और शिव ने उसे आशीर्वाद दिया।' },
        ],
        sources: [S.wShivaratri],
      },
      {
        id: 'samagri', heading: { en: 'What you need', hi: 'पूजा सामग्री' },
        list: [
          { en: 'For abhisheka of the lingam: water, milk, curd (yogurt), honey and ghee', hi: 'शिवलिंग के अभिषेक के लिए: जल, दूध, दही, शहद और घी' },
          { en: 'Bilva (bel) leaves — the most common offering', hi: 'बेलपत्र — सबसे सामान्य अर्पण' },
          { en: 'Lamp and incense', hi: 'दीपक और धूप' },
        ],
        sources: [S.wShivaratri],
      },
      {
        id: 'steps', heading: { en: 'Puja vidhi — simple steps', hi: 'पूजा विधि — सरल चरण' },
        steps: [
          { en: 'The day before, eat only one meal.', hi: 'एक दिन पहले केवल एक बार भोजन करें।' },
          { en: 'On Shivaratri morning, after the bath, take the sankalpa to fast for the whole day and break it the next day.', hi: 'शिवरात्रि की सुबह स्नान के बाद पूरे दिन व्रत रखने और अगले दिन खोलने का संकल्प लें।' },
          { en: 'Choose your fast: nirjala, or fruit and milk. Grains, onion, garlic and alcohol are avoided; rock salt is used instead of ordinary salt.', hi: 'अपना व्रत चुनें: निर्जल, या फल और दूध। अनाज, प्याज़, लहसुन और शराब नहीं ली जाती; साधारण नमक की जगह सेंधा नमक।' },
          { en: 'Bathe again in the evening before the puja or the temple visit.', hi: 'पूजा या मंदिर जाने से पहले शाम को फिर स्नान करें।' },
          { en: 'Worship at night — once, or in each of the four prahars: abhisheka of the lingam with water, milk, curd, honey and ghee, and bilva leaves. Chant “Om Namah Shivaya”.', hi: 'रात में पूजा करें — एक बार, या चारों प्रहरों में: जल, दूध, दही, शहद और घी से अभिषेक, और बेलपत्र। “ॐ नमः शिवाय” का जप करें।' },
          { en: 'Keep the night vigil (jagaran) with prayer, meditation or bhajans.', hi: 'प्रार्थना, ध्यान या भजन के साथ रात्रि जागरण करें।' },
          { en: 'Next morning, after the bath, break the fast between sunrise and the end of Chaturdashi.', hi: 'अगली सुबह स्नान के बाद, सूर्योदय और चतुर्दशी समाप्ति के बीच व्रत खोलें।' },
        ],
        sources: [S.dShivaratri, S.wShivaratri, S.dShravanSom],
      },
      timing(
        'The festival day is the one whose midnight (Nishita kaal) falls in Krishna Chaturdashi. The night from sunset to the next sunrise is divided into four equal prahars for the four pujas; the Nishita puja is around midnight. Drik Panchang notes the general view that both the puja and the parana should fall within Chaturdashi, though one view waits until Chaturdashi ends. This page shows all these times for New Delhi.',
        'पर्व उस दिन होता है जिसकी मध्यरात्रि (निशीथ काल) में कृष्ण चतुर्दशी हो। सूर्यास्त से अगले सूर्योदय तक की रात चार बराबर प्रहरों में बँटती है; निशीथ पूजा आधी रात के आसपास होती है। द्रिक पंचांग के अनुसार सामान्य मत है कि पूजा और पारण दोनों चतुर्दशी के भीतर हों, हालाँकि एक मत चतुर्दशी समाप्त होने तक रुकने का है। यह पृष्ठ नई दिल्ली के ये सभी समय दिखाता है।',
        [S.dShivaratri],
      ),
      {
        id: 'regional', heading: { en: 'Traditions differ', hi: 'परंपराओं में अंतर' },
        paras: [
          { en: 'In Kashmir it is Herath (Har-ratri), observed by Kashmiri Pandits over about 23 days, with walnuts soaked in earthen pots shared as prasad. In Nepal it is a national holiday, with night vigils at the Pashupatinath temple. In Tamil Nadu devotees walk barefoot around the hill at Tiruvannamalai (girivalam), and in Kanyakumari district run the Sivalaya Ottam to twelve Shiva shrines.', hi: 'कश्मीर में इसे हेरथ (हर-रात्रि) कहते हैं, जिसे कश्मीरी पंडित लगभग 23 दिन मनाते हैं, और मिट्टी के घड़ों में भिगोए अखरोट प्रसाद के रूप में बाँटे जाते हैं। नेपाल में राष्ट्रीय अवकाश होता है, और पशुपतिनाथ मंदिर में रात्रि जागरण। तमिलनाडु में भक्त तिरुवन्नामलई पर्वत की नंगे पाँव परिक्रमा (गिरिवलम्) करते हैं, और कन्याकुमारी ज़िले में बारह शिवालयों तक शिवालय ओट्टम दौड़ होती है।' },
        ],
        sources: [S.wShivaratri],
      },
    ],
    mantras: [
      {
        deva: 'ॐ नमः शिवाय', translit: 'Om Namah Shivaya',
        meaning: { en: 'Om, salutations to Shiva.', hi: 'ॐ, भगवान शिव को नमस्कार।' },
        use: { en: 'The six-syllable Shiva mantra, chanted while offering bilva leaves.', hi: 'शिव का षडक्षर मंत्र, बेलपत्र अर्पित करते समय।' },
        source: S.dShravanSom,
      },
    ],
    faq: [
      { q: { en: 'When do I break the Mahashivratri fast?', hi: 'महाशिवरात्रि का व्रत कब खोलें?' }, a: { en: 'The next morning after the bath — between sunrise and the end of Chaturdashi, by the general view Drik Panchang gives.', hi: 'अगली सुबह स्नान के बाद — द्रिक पंचांग के बताए सामान्य मत के अनुसार सूर्योदय और चतुर्दशी समाप्ति के बीच।' } },
      { q: { en: 'What are the four prahar pujas?', hi: 'चार प्रहर की पूजा क्या है?' }, a: { en: 'The night from sunset to sunrise is split into four equal parts, with a puja in each. You may do the puja once or four times.', hi: 'सूर्यास्त से सूर्योदय तक की रात चार बराबर भागों में बँटती है, हर भाग में एक पूजा। आप एक बार या चार बार पूजा कर सकते हैं।' } },
      { q: { en: 'What is offered to the Shiva lingam?', hi: 'शिवलिंग पर क्या चढ़ाया जाता है?' }, a: { en: 'Water, milk, curd, honey and ghee for abhisheka, and bilva leaves — the most common offering.', hi: 'अभिषेक के लिए जल, दूध, दही, शहद और घी, और बेलपत्र — सबसे सामान्य अर्पण।' } },
      { q: { en: 'How is Mahashivratri different from the monthly Shivaratri?', hi: 'महाशिवरात्रि मासिक शिवरात्रि से कैसे अलग है?' }, a: { en: 'Every month has a Shivaratri; Mahashivratri is the greatest of the twelve, kept with longer fasting and all-night worship.', hi: 'हर महीने एक शिवरात्रि होती है; महाशिवरात्रि बारहों में सबसे बड़ी है, जिसमें लंबा व्रत और रात भर पूजा होती है।' } },
    ],
    faqSources: [S.wShivaratri, S.dShivaratri],
  },

  'janmashtami': {
    slug: 'janmashtami',
    summary: {
      en: 'Janmashtami celebrates the birth of Krishna on the Ashtami of the dark fortnight of Bhadrapada (Shravana in the amanta calendar). Devotees fast, sing and keep vigil until midnight — the hour of his birth — then bathe and dress the image of baby Krishna, place it in a cradle, and break the fast with sweets.',
      hi: 'जन्माष्टमी भाद्रपद (अमांत में श्रावण) कृष्ण पक्ष की अष्टमी को श्रीकृष्ण के जन्म का उत्सव है। भक्त व्रत रखते हैं, भजन-कीर्तन करते हैं और आधी रात — जन्म के समय — तक जागते हैं, फिर बाल कृष्ण का स्नान-श्रृंगार करके उन्हें पालने में झुलाते हैं, और मिठाई से व्रत खोलते हैं।',
    },
    sections: [
      {
        id: 'about', heading: { en: 'What Janmashtami is', hi: 'जन्माष्टमी क्या है' },
        paras: [
          { en: 'The birth of Krishna is told in the Mahabharata tradition, the Puranas and the Gita Govinda; the 10th book of the Bhagavata Purana is recited on this day. It usually falls in August or September. It is also called Ashtami Rohini.', hi: 'श्रीकृष्ण के जन्म की कथा महाभारत परंपरा, पुराणों और गीत गोविंद में है; इस दिन भागवत पुराण के दसवें स्कंध का पाठ होता है। यह प्रायः अगस्त या सितंबर में पड़ती है। इसे अष्टमी रोहिणी भी कहते हैं।' },
        ],
        sources: [S.wJanma],
      },
      {
        id: 'katha', heading: { en: 'The katha', hi: 'कथा' },
        paras: [
          { en: 'King Kamsa of Mathura heard a prophecy that the eighth son of his sister Devaki would cause his death, so he imprisoned Devaki and her husband Vasudeva and killed their first six sons. Krishna was born as their eighth son. At his birth the guards fell asleep and the prison doors opened; Vasudeva carried the baby across the Yamuna to Gokul, to his foster parents Yashoda and Nanda.', hi: 'मथुरा के राजा कंस ने भविष्यवाणी सुनी कि उनकी बहन देवकी का आठवाँ पुत्र उनकी मृत्यु का कारण बनेगा, इसलिए उन्होंने देवकी और उनके पति वसुदेव को कारागार में डाल दिया और उनके पहले छह पुत्रों को मार डाला। श्रीकृष्ण उनके आठवें पुत्र के रूप में जन्मे। जन्म के समय पहरेदार सो गए और कारागार के द्वार खुल गए; वसुदेव शिशु को यमुना पार गोकुल ले गए, पालक माता-पिता यशोदा और नंद के पास।' },
        ],
        sources: [S.wJanma],
      },
      {
        id: 'samagri', heading: { en: 'What you need', hi: 'पूजा सामग्री' },
        list: [
          { en: 'An image of baby Krishna (Bal Krishna) and a small cradle', hi: 'बाल कृष्ण की प्रतिमा और छोटा पालना' },
          { en: 'Water for the bath, new clothes and ornaments for the image', hi: 'स्नान के लिए जल, प्रतिमा के लिए नए वस्त्र और आभूषण' },
          { en: 'Sandalwood and saffron, flowers, incense and a lamp', hi: 'चंदन और केसर, फूल, धूप और दीपक' },
          { en: 'Food offering (naivedya) and sweets; betel leaf with areca nut', hi: 'नैवेद्य और मिठाई; सुपारी के साथ पान' },
        ],
        sources: [S.dJanma, S.wJanma],
      },
      {
        id: 'steps', heading: { en: 'Puja vidhi — simple steps', hi: 'पूजा विधि — सरल चरण' },
        steps: [
          { en: 'Fast through the day, with devotional singing; keep vigil until midnight.', hi: 'दिन भर व्रत रखें, भजन-कीर्तन करें; आधी रात तक जागें।' },
          { en: 'At midnight, meditate on Krishna and invite him into the image (dhyana, avahana); offer a seat and water for his feet, hands and sipping.', hi: 'आधी रात को श्रीकृष्ण का ध्यान और प्रतिमा में आवाहन करें; आसन, पाद्य, अर्घ्य और आचमन अर्पित करें।' },
          { en: 'Bathe the image (snana), dress it in new clothes and the sacred thread, and offer sandal and saffron, ornaments and flowers.', hi: 'प्रतिमा को स्नान कराएँ, नए वस्त्र और यज्ञोपवीत पहनाएँ, चंदन-केसर, आभूषण और फूल अर्पित करें।' },
          { en: 'Offer incense, a lamp and naivedya, then betel with areca nut and dakshina.', hi: 'धूप, दीप और नैवेद्य, फिर पान-सुपारी और दक्षिणा अर्पित करें।' },
          { en: 'Do the aarti, walk around the deity (pradakshina), bow, and ask forgiveness for any mistakes (kshamarpana).', hi: 'आरती करें, परिक्रमा करें, प्रणाम करें, और भूल-चूक के लिए क्षमा माँगें (क्षमार्पण)।' },
          { en: 'Place baby Krishna in the cradle, then break the fast with food and sweets.', hi: 'बाल कृष्ण को पालने में झुलाएँ, फिर भोजन और मिठाई से व्रत खोलें।' },
        ],
        sources: [S.dJanma, S.wJanma],
      },
      timing(
        'Our calendar keeps the Smarta date: the day whose midnight (Nishita) falls in Krishna Ashtami — moved to the next day when Ashtami only begins after that day’s sunset (as Drik Panchang does). ISKCON and other Vaishnava calendars sometimes keep Janmashtami a day later. This page shows the Nishita (midnight) puja window for New Delhi.',
        'हमारा पंचांग स्मार्त तिथि मानता है: वह दिन जिसकी मध्यरात्रि (निशीथ) में कृष्ण अष्टमी हो — और अगर अष्टमी उस दिन सूर्यास्त के बाद ही शुरू हो, तो अगला दिन (जैसा द्रिक पंचांग करता है)। इस्कॉन और अन्य वैष्णव पंचांग कभी-कभी जन्माष्टमी एक दिन बाद मानते हैं। यह पृष्ठ नई दिल्ली के लिए निशीथ (मध्यरात्रि) पूजा का समय दिखाता है।',
        [S.wJanma],
      ),
      {
        id: 'regional', heading: { en: 'Traditions differ', hi: 'परंपराओं में अंतर' },
        paras: [
          { en: 'In Maharashtra, Dahi Handi — breaking a hanging pot of curd — is celebrated the day after. Mathura and Vrindavan, and also Manipur, Gujarat and Rajasthan, stage the Rasa Lila. In Tamil Nadu small footprints are drawn from the doorway to the prayer room for the child Krishna. In Kashmiri Pandit and Odia temple traditions the image is given abhisheka at midnight. Amanta calendars call the month Shravana and purnimanta calendars Bhadrapada — it is the same day.', hi: 'महाराष्ट्र में अगले दिन दही हांडी — लटकी दही की मटकी फोड़ना — मनाई जाती है। मथुरा-वृंदावन, और मणिपुर, गुजरात व राजस्थान में रासलीला होती है। तमिलनाडु में बाल कृष्ण के लिए द्वार से पूजा-कक्ष तक छोटे पदचिह्न बनाए जाते हैं। कश्मीरी पंडित और ओडिया मंदिर परंपराओं में आधी रात को अभिषेक होता है। अमांत पंचांग में महीना श्रावण और पूर्णिमांत में भाद्रपद कहलाता है — दिन एक ही है।' },
        ],
        sources: [S.wJanma],
      },
    ],
    mantras: [],
    faq: [
      { q: { en: 'When is the Janmashtami fast broken?', hi: 'जन्माष्टमी का व्रत कब खोलते हैं?' }, a: { en: 'Many break it at midnight, after Krishna’s birth is celebrated, with food and sweets.', hi: 'बहुत से लोग आधी रात को, श्रीकृष्ण जन्मोत्सव के बाद, भोजन और मिठाई से व्रत खोलते हैं।' } },
      { q: { en: 'Why are there sometimes two Janmashtami dates?', hi: 'कभी जन्माष्टमी की दो तिथियाँ क्यों होती हैं?' }, a: { en: 'Smarta and Vaishnava (e.g. ISKCON) traditions use different rules for the Ashtami midnight, so they sometimes differ by a day. We show the Smarta date for New Delhi.', hi: 'स्मार्त और वैष्णव (जैसे इस्कॉन) परंपराएँ अष्टमी-मध्यरात्रि के अलग नियम मानती हैं, इसलिए कभी एक दिन का अंतर होता है। हम नई दिल्ली की स्मार्त तिथि दिखाते हैं।' } },
      { q: { en: 'What is Dahi Handi?', hi: 'दही हांडी क्या है?' }, a: { en: 'A Maharashtra celebration on the day after Janmashtami, when teams form human pyramids to break a hanging pot of curd.', hi: 'जन्माष्टमी के अगले दिन महाराष्ट्र का उत्सव, जिसमें टोलियाँ मानव पिरामिड बनाकर लटकी दही की मटकी फोड़ती हैं।' } },
    ],
    faqSources: [S.wJanma],
  },
};

/** Every source of a page (deduplicated), for the "Sources" list. */
export function vratSources(c: VratContent): Source[] {
  const seen = new Set<string>();
  const all = [...c.sections.flatMap(s => s.sources), ...c.mantras.map(m => m.source), ...c.faqSources];
  return all.filter(s => (seen.has(s.url) ? false : (seen.add(s.url), true)));
}

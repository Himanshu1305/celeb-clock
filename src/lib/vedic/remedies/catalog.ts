/**
 * Remedies catalogue (Batch 5, goal d) — one entry per finding BornClock actually
 * detects, so a user who sees "Manglik" or "Sade Sati" also sees, calmly, what it
 * means and what they can do.
 *
 * Detected findings covered (and where they are detected):
 *   Manglik (/manglik, Kundali, matching) · Kaal Sarp — full only (/kaal-sarp-dosha)
 *   Pitra, Grahan, Mool (/pitra-dosha, /grahan-dosha, /mool-dosha, Kundali)
 *   Sade Sati and Dhaiya (/sade-sati) · Nadi, Bhakoot, Gana dosha (/kundali-match)
 *   Mahadasha lord and debilitated planets (Kundali, /dasha-calculator) → the nine
 *   planet entries.
 * NOT covered because the site does not detect them: Guru Chandal, Shrapit and
 * Kemadruma (Kemadruma has an explainer page only, no detection).
 *
 * Content rules (FIX3 brief, Batch 5): calm tone; free remedies first; nothing is
 * "guaranteed"; no health/medical claims; gemstones only with the full-chart caution
 * and never for under-18s; every remedy carries a source; temples come only from
 * the verified list in temples.ts. "How common" figures are plain arithmetic from
 * the rule itself (e.g. 6 of 27 nakshatras), noted inline — not survey data.
 */
import type { L10n, PlanetName, Practice, RemedyEntry } from './types';
import { SRC } from './sources';
import { PLANET_BASE, PLANET_ORDER } from './planets';

const P = PLANET_BASE;

const MMJ = {
  name: { en: 'Maha Mrityunjaya mantra', hi: 'महामृत्युंजय मंत्र' },
  devanagari: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥',
  transliteration: 'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam, Urvarukamiva Bandhanan Mrityor Mukshiya Mamritat',
  count: { en: '108 times (one mala) a day, or 11 times if you are short of time', hi: 'प्रतिदिन 108 बार (एक माला), या समय कम हो तो 11 बार' },
  when: { en: 'Mornings, or Mondays; Nag Panchami and Maha Shivaratri are traditional days', hi: 'सुबह, या सोमवार; नाग पंचमी और महाशिवरात्रि पारंपरिक दिन हैं' },
  source: SRC.mahaMrityunjaya,
};
const PANCHAKSHARI = {
  name: { en: 'Om Namah Shivaya (Panchakshari)', hi: 'ॐ नमः शिवाय (पंचाक्षरी)' },
  devanagari: 'ॐ नमः शिवाय',
  transliteration: 'Om Namah Shivaya',
  count: { en: '108 times (one mala), any time of day', hi: '108 बार (एक माला), दिन में कभी भी' },
  when: { en: 'Daily, or on Mondays', hi: 'प्रतिदिन, या सोमवार को' },
  source: SRC.panchakshari,
};
const GANESHA = {
  name: { en: 'Ganesha mantra', hi: 'गणेश मंत्र' },
  devanagari: 'ॐ गं गणपतये नमः',
  transliteration: 'Om Gam Ganapataye Namah',
  count: { en: '108 times (one mala)', hi: '108 बार (एक माला)' },
  when: { en: 'Before any puja, or on Wednesdays and Chaturthi', hi: 'किसी भी पूजा से पहले, या बुधवार और चतुर्थी को' },
  source: SRC.ganesha,
};

const HANUMAN_CHALISA: Practice = { text: { en: 'Hanuman Chalisa — once a day, or on Tuesdays and Saturdays.', hi: 'हनुमान चालीसा — प्रतिदिन एक बार, या मंगलवार और शनिवार को।' }, source: SRC.hanumanChalisa };
const ADITYA_HRIDAYAM: Practice = { text: { en: 'Aditya Hridayam — recited at sunrise, especially on Sundays.', hi: 'आदित्य हृदय स्तोत्र — सूर्योदय पर, विशेषकर रविवार को।' }, source: SRC.adityaHridayam };
const DASHARATHA_SHANI: Practice = { text: { en: 'Shani Stotra attributed to King Dasharatha — on Saturday evenings.', hi: 'राजा दशरथ कृत शनि स्तोत्र — शनिवार शाम को।' }, source: SRC.dasharathaShani };
const SHIVA_PRAYER: Practice = { text: { en: 'A short prayer to Shiva and Parvati together (Uma–Maheshwar) — couples often do this side by side.', hi: 'शिव और पार्वती (उमा–महेश्वर) की संयुक्त छोटी प्रार्थना — दंपति प्रायः साथ बैठकर करते हैं।' }, source: SRC.devata };

const NO_GEM_MATCH: L10n = {
  en: 'No gemstone is a remedy for a matching dosha. If either person wants a stone for their own chart, that is a separate, full-chart question — see the Gemstone tool.',
  hi: 'मिलान दोष का कोई रत्न-उपाय नहीं है। यदि किसी को अपनी कुंडली के लिए रत्न चाहिए, तो वह पूरी कुंडली का अलग प्रश्न है — रत्न टूल देखें।',
};

const CONSULT_MATCH: L10n = {
  en: 'Consult an astrologer who reads BOTH full charts before any decision — never decide a marriage on one koota or one score. Also consult if anyone presses you to pay for urgent rituals.',
  hi: 'कोई भी निर्णय लेने से पहले ऐसे ज्योतिषी से मिलें जो दोनों की पूरी कुंडली देखें — एक कूट या एक अंक पर विवाह का निर्णय कभी न लें। अगर कोई जल्दबाज़ी में महँगे अनुष्ठान के लिए दबाव डाले, तब भी सलाह लें।',
};

function planetGemNote(planet: PlanetName, context: L10n): L10n {
  const g = P[planet].gem;
  return {
    en: `${g.en} is ${planet}'s traditional stone. ${context.en} Whether it suits YOU depends on your Lagna (Ascendant) — the same stone can help one chart and not another — so check the Gemstone tool, which reads the full chart.`,
    hi: `${g.hi} ${P[planet].name.hi} का पारंपरिक रत्न है। ${context.hi} यह आपके लिए उपयुक्त है या नहीं, यह आपके लग्न पर निर्भर करता है — वही रत्न एक कुंडली में सहायक और दूसरी में नहीं — इसलिए पूरी कुंडली देखने वाला रत्न टूल देखें।`,
  };
}

const NOT_DEFAULT: L10n = { en: 'It is NOT a default remedy for this finding.', hi: 'यह इस दोष का स्वतः उपाय नहीं है।' };

// ── Dosha / transit / nakshatra / matching entries ────────────────────────────
const DOSHAS: RemedyEntry[] = [
  {
    key: 'manglik', slug: 'manglik-dosha', kind: 'dosha', planets: ['Mars'], toolPath: '/manglik',
    name: { en: 'Manglik (Mangal Dosha)', hi: 'मांगलिक (मंगल दोष)' },
    meaning: {
      plain: {
        en: 'Mars sits in the 1st, 4th, 7th, 8th or 12th house from your Lagna or from your Moon. The tradition reads this as extra heat and drive in close partnerships — something to weigh in matching, not a defect in you and not a reason a marriage cannot work.',
        hi: 'आपकी कुंडली में मंगल लग्न या चंद्र से 1, 4, 7, 8 या 12वें भाव में है। परंपरा इसे निकट संबंधों में अधिक जोश और ऊर्जा के रूप में पढ़ती है — मिलान में ध्यान देने की बात, आपकी कोई कमी नहीं, और विवाह न चल पाने का कारण भी नहीं।',
      },
      howCommon: {
        en: 'Very common. Five of the twelve houses count, so on each check alone about 5 in 12 charts qualify — and more people qualify by at least one of the two checks.',
        hi: 'बहुत आम है। बारह में से पाँच भाव गिने जाते हैं, इसलिए हर जाँच में अकेले ही लगभग 12 में से 5 कुंडलियाँ मांगलिक आती हैं — और दो में से कम-से-कम एक जाँच से इससे भी अधिक।',
      },
      cancellations: {
        en: 'The tradition has many built-in cancellations: both partners Manglik, Mars in its own or exalted sign, benefic aspects on Mars, and many families give it far less weight after about 28. The Manglik page shows which apply to your chart.',
        hi: 'परंपरा में कई स्वाभाविक परिहार हैं: दोनों साथी मांगलिक हों, मंगल अपनी या उच्च राशि में हो, मंगल पर शुभ दृष्टि हो, और कई परिवार लगभग 28 वर्ष के बाद इसे बहुत कम महत्व देते हैं। मांगलिक पेज बताता है कि आपकी कुंडली में कौन से परिहार लागू हैं।',
      },
    },
    free: {
      mantras: [P.Mars.beej, P.Mars.stotra],
      prayers: [HANUMAN_CHALISA],
      fasting: P.Mars.fasting,
      lifestyle: P.Mars.lifestyle,
      seva: P.Mars.seva,
    },
    daan: [P.Mars.daan],
    puja: [
      P.Mars.puja[0],
      { name: { en: 'Mangal-dosha Bhaat Puja at Mangalnath, Ujjain', hi: 'मंगलनाथ, उज्जैन में मंगल दोष भात पूजा' }, when: { en: 'Timing is set by the temple priests; Tuesdays are held especially auspicious for Mangal', hi: 'समय मंदिर के पुरोहित तय करते हैं; मंगलवार मंगल के लिए विशेष शुभ माना जाता है' }, where: 'priest', note: { en: 'Done at the temple by its priests — optional, never required.', hi: 'मंदिर में वहीं के पुरोहित करते हैं — वैकल्पिक, अनिवार्य नहीं।' }, source: SRC.temple },
      P.Mars.puja[1],
    ],
    temples: ['mangalnath', 'vaitheeswaran'],
    gemstone: { planet: 'Mars', note: planetGemNote('Mars', NOT_DEFAULT) },
    consult: {
      en: 'Before fixing a marriage, have an astrologer read both full charts together — cancellations very often apply. Consult too if someone tells you an expensive ritual is urgent.',
      hi: 'विवाह तय करने से पहले किसी ज्योतिषी से दोनों की पूरी कुंडली साथ में दिखाएँ — परिहार बहुत बार लागू होते हैं। अगर कोई कहे कि महँगा अनुष्ठान तुरंत ज़रूरी है, तब भी सलाह लें।',
    },
  },
  {
    key: 'kaalSarp', slug: 'kaal-sarp-dosha', kind: 'dosha', planets: ['Rahu', 'Ketu'], toolPath: '/kaal-sarp-dosha',
    name: { en: 'Kaal Sarp Dosha', hi: 'कालसर्प दोष' },
    meaning: {
      plain: {
        en: 'All seven classical planets sit on one side of the Rahu–Ketu axis. The traditional reading is "effort first, reward later" — progress can feel slow or hard-won before it opens up. It is about delay, not danger.',
        hi: 'सातों ग्रह राहु–केतु अक्ष के एक ही ओर हैं। पारंपरिक अर्थ है "पहले परिश्रम, फिर फल" — प्रगति खुलने से पहले धीमी या कठिन लग सकती है। यह देरी की बात है, ख़तरे की नहीं।',
      },
      howCommon: {
        en: 'The full form is much less common than its reputation suggests. BornClock reports only the full form (every planet strictly inside the axis by degree); near-misses, often sold as "partial Kaal Sarp", are not counted.',
        hi: 'पूर्ण रूप उतना आम नहीं जितनी इसकी चर्चा है। BornClock केवल पूर्ण रूप बताता है (हर ग्रह अंश के हिसाब से अक्ष के भीतर); "आंशिक कालसर्प" कहे जाने वाले निकट-मामले नहीं गिने जाते।',
      },
      cancellations: {
        en: 'Kaal Sarp is not described in the oldest classical texts such as BPHS — it is a later tradition, which is one reason astrologers weigh it very differently. Strong yogas and well-placed planets elsewhere in the chart are widely read as easing it.',
        hi: 'कालसर्प का वर्णन BPHS जैसे प्राचीनतम शास्त्रीय ग्रंथों में नहीं है — यह बाद की परंपरा है, इसलिए ज्योतिषी इसे बहुत अलग-अलग महत्व देते हैं। कुंडली में मज़बूत योग और अच्छे स्थित ग्रह इसे हल्का करते माने जाते हैं।',
      },
    },
    free: {
      mantras: [MMJ, P.Rahu.beej, P.Ketu.beej],
      prayers: [{ text: { en: 'Om Namah Shivaya, 108 times, or a visit to any Shiva temple on Mondays.', hi: 'ॐ नमः शिवाय 108 बार, या सोमवार को किसी भी शिव मंदिर में दर्शन।' }, source: SRC.panchakshari }],
      fasting: { text: { en: 'Monday vrat, and Nag Panchami (Shravan Shukla Panchami) — a light fast is the usual form, and it is optional; skip it if you are pregnant, unwell, elderly or on medication.', hi: 'सोमवार व्रत, और नाग पंचमी (श्रावण शुक्ल पंचमी) — सामान्य रूप हल्का व्रत है और यह वैकल्पिक है; गर्भावस्था, बीमारी, बुढ़ापे या दवा चलने पर न करें।' }, source: SRC.devata },
      lifestyle: [
        { text: { en: 'Keep going through slow patches — the classical reading is delay, not denial, so persistence is the central remedy.', hi: 'धीमे समय में भी डटे रहें — शास्त्रीय अर्थ देरी है, इनकार नहीं, इसलिए लगन ही मुख्य उपाय है।' }, source: SRC.sense },
        P.Rahu.lifestyle[0],
      ],
      seva: [...P.Rahu.seva, ...P.Ketu.seva],
    },
    daan: [P.Rahu.daan, P.Ketu.daan],
    puja: [
      { name: { en: 'Shiva abhishek with water or milk', hi: 'जल या दूध से शिव अभिषेक' }, when: { en: 'Mondays, Nag Panchami, Maha Shivaratri', hi: 'सोमवार, नाग पंचमी, महाशिवरात्रि' }, where: 'home-or-priest', note: { en: 'Can be done at home or at any Shiva temple.', hi: 'घर पर या किसी भी शिव मंदिर में कर सकते हैं।' }, source: SRC.devata },
      { name: { en: 'Kalsarpa Shanti at Trimbakeshwar', hi: 'त्र्यंबकेश्वर में कालसर्प शांति' }, when: { en: 'On dates set by the temple priests', hi: 'मंदिर के पुरोहितों द्वारा तय तिथियों पर' }, where: 'priest', note: { en: 'Optional. Done at the temple by priests; no one should need to pay large sums urgently.', hi: 'वैकल्पिक। मंदिर में पुरोहित करते हैं; किसी को भी जल्दबाज़ी में बड़ी रकम देने की आवश्यकता नहीं।' }, source: SRC.temple },
      { name: { en: 'Rahu–Ketu pooja at Srikalahasti', hi: 'श्रीकालहस्ती में राहु–केतु पूजा' }, when: { en: 'Timings are set by the temple — ask there', hi: 'समय मंदिर तय करता है — वहीं पूछें' }, where: 'priest', note: { en: 'Optional; done at the temple.', hi: 'वैकल्पिक; मंदिर में होती है।' }, source: SRC.temple },
    ],
    temples: ['trimbakeshwar', 'srikalahasti', 'thirunageswaram', 'keezhaperumpallam'],
    gemstone: {
      planet: null,
      note: {
        en: 'Hessonite (Gomed) and Cat’s Eye (Lehsunia), the Rahu and Ketu stones, are NOT general Kaal Sarp remedies. They are among the most powerful stones and are worn, if at all, only when a full-chart check supports them, after a short trial.',
        hi: 'राहु–केतु के रत्न गोमेद और लहसुनिया कालसर्प के सामान्य उपाय नहीं हैं। ये सबसे प्रभावशाली रत्नों में हैं और पहनें भी तो केवल पूरी कुंडली की जाँच के बाद, थोड़े परीक्षण के साथ।',
      },
    },
    consult: {
      en: 'Consult an astrologer if you want the whole chart read — Kaal Sarp alone says little. Be wary of anyone charging a large fee to "remove" it urgently; that exploits fear rather than following tradition.',
      hi: 'पूरी कुंडली पढ़वानी हो तो ज्योतिषी से मिलें — अकेला कालसर्प बहुत कम बताता है। जो कोई इसे "हटाने" के लिए तुरंत बड़ी फ़ीस माँगे, उससे सावधान रहें; यह परंपरा नहीं, डर का दुरुपयोग है।',
    },
  },
  {
    key: 'pitra', slug: 'pitra-dosha', kind: 'dosha', planets: ['Sun', 'Rahu'], toolPath: '/pitra-dosha',
    name: { en: 'Pitra Dosha', hi: 'पितृ दोष' },
    meaning: {
      plain: {
        en: 'A classical reading of the Sun, Rahu, Saturn and the 9th house — the chart’s line of father, ancestors and dharma. The tradition treats it as an invitation to honour your ancestors and family duties, not as a curse.',
        hi: 'सूर्य, राहु, शनि और नवम भाव — पिता, पूर्वजों और धर्म की रेखा — का शास्त्रीय पठन। परंपरा इसे पूर्वजों और पारिवारिक कर्तव्यों के सम्मान का निमंत्रण मानती है, श्राप नहीं।',
      },
      howCommon: {
        en: 'A fairly common pattern: Rahu alone sits in the 9th house in about 1 in 12 charts, and the Sun shares its sign with Rahu in about another 1 in 12.',
        hi: 'काफ़ी आम योग है: अकेला राहु लगभग 12 में से 1 कुंडली में नवम भाव में होता है, और सूर्य–राहु एक राशि में लगभग और 12 में से 1 में।',
      },
      cancellations: {
        en: 'BornClock counts only the standard Sun–Rahu–Saturn signatures; Mars or Ketu alone in the 9th do not count. A strong Jupiter influence on the 9th house is widely read as softening it.',
        hi: 'BornClock केवल मानक सूर्य–राहु–शनि लक्षण गिनता है; नवम में अकेले मंगल या केतु नहीं गिने जाते। नवम भाव पर बलवान गुरु का प्रभाव इसे हल्का करता माना जाता है।',
      },
    },
    free: {
      mantras: [P.Sun.beej, P.Sun.stotra],
      prayers: [ADITYA_HRIDAYAM],
      fasting: { text: { en: 'Amavasya (new moon) — a simple observance with water offered to ancestors; a light fast is optional and should be skipped if you are pregnant, unwell, elderly or on medication.', hi: 'अमावस्या — पूर्वजों को जल अर्पित कर सादा पालन; हल्का व्रत वैकल्पिक है, गर्भावस्था, बीमारी, बुढ़ापे या दवा चलने पर न करें।' }, source: SRC.shraddha },
      lifestyle: [
        { text: { en: 'Honour your parents and elders while they are with you, and remember ancestors on their tithi.', hi: 'माता-पिता और बड़ों का उनके रहते सम्मान करें, और पूर्वजों को उनकी तिथि पर याद करें।' }, source: SRC.shraddha },
        { text: { en: 'Feed crows and cows during Pitru Paksha — part of the shraddha custom.', hi: 'पितृ पक्ष में कौवों और गायों को भोजन दें — श्राद्ध परंपरा का भाग।' }, source: SRC.shraddha },
      ],
      seva: [{ text: { en: 'Feed people in need in your ancestors’ names (anna daan) on their tithi or on Amavasya.', hi: 'पूर्वजों के नाम पर उनकी तिथि या अमावस्या को ज़रूरतमंदों को भोजन कराएँ (अन्नदान)।' }, source: SRC.shraddha }],
    },
    daan: [
      { what: { en: 'Food, grain and clothes in the ancestors’ names', hi: 'पूर्वजों के नाम पर भोजन, अनाज और वस्त्र' }, toWhom: { en: 'The poor, or a priest performing the shraddha', hi: 'गरीबों को, या श्राद्ध कराने वाले पुरोहित को' }, day: { en: 'The ancestor’s tithi in Pitru Paksha, or any Amavasya', hi: 'पितृ पक्ष में पूर्वज की तिथि, या कोई भी अमावस्या' }, source: SRC.shraddha },
      P.Sun.daan,
    ],
    puja: [
      { name: { en: 'Shraddha and tarpan', hi: 'श्राद्ध और तर्पण' }, when: { en: 'Pitru Paksha (Bhadrapada Purnima to Ashwin Amavasya), on the ancestor’s tithi; or Mahalaya Amavasya', hi: 'पितृ पक्ष (भाद्रपद पूर्णिमा से आश्विन अमावस्या), पूर्वज की तिथि पर; या महालया अमावस्या' }, where: 'home-or-priest', note: { en: 'Simple tarpan can be done at home; a full shraddha is usually done with the family priest.', hi: 'सरल तर्पण घर पर कर सकते हैं; पूरा श्राद्ध प्रायः कुल-पुरोहित के साथ होता है।' }, source: SRC.shraddha },
      { name: { en: 'Pind daan at Gaya', hi: 'गया में पिंडदान' }, when: { en: 'Most traditionally during Pitru Paksha', hi: 'सबसे पारंपरिक रूप से पितृ पक्ष में' }, where: 'priest', note: { en: 'Optional pilgrimage; done with local priests at Vishnupad, Akshayavat and the Phalgu river.', hi: 'वैकल्पिक तीर्थ; विष्णुपद, अक्षयवट और फल्गु नदी पर स्थानीय पुरोहितों के साथ।' }, source: SRC.temple },
      { name: { en: 'Narayan Nagbali / Tripindi Shraddha at Trimbakeshwar', hi: 'त्र्यंबकेश्वर में नारायण नागबलि / त्रिपिंडी श्राद्ध' }, when: { en: 'Narayan Nagbali is a three-day rite on dates fixed by the priests', hi: 'नारायण नागबलि तीन दिन का अनुष्ठान है, तिथियाँ पुरोहित तय करते हैं' }, where: 'priest', note: { en: 'Optional; usually considered only on a priest’s or astrologer’s specific advice.', hi: 'वैकल्पिक; प्रायः पुरोहित या ज्योतिषी की विशेष सलाह पर ही किया जाता है।' }, source: SRC.temple },
    ],
    temples: ['gayaVishnupad', 'trimbakeshwar'],
    gemstone: { planet: 'Sun', note: planetGemNote('Sun', NOT_DEFAULT) },
    consult: {
      en: 'Consult your family priest for the shraddha customs your family follows, and an astrologer if you want the 9th house read in full. No ritual should be sold to you as urgent.',
      hi: 'आपके परिवार में कौन-सी श्राद्ध रीतियाँ चलती हैं, इसके लिए कुल-पुरोहित से, और नवम भाव पूरा पढ़वाने के लिए ज्योतिषी से मिलें। कोई भी अनुष्ठान आपको "तुरंत ज़रूरी" कहकर नहीं बेचा जाना चाहिए।',
    },
  },
  {
    key: 'grahan', slug: 'grahan-dosha', kind: 'dosha', planets: ['Sun', 'Moon', 'Rahu', 'Ketu'], toolPath: '/grahan-dosha',
    name: { en: 'Grahan Dosha', hi: 'ग्रहण दोष' },
    meaning: {
      plain: {
        en: 'The Sun (Surya Grahan pattern) or the Moon (Chandra Grahan pattern) shares its sign with Rahu or Ketu — the same geometry as an eclipse. Traditionally it is read as a note on clarity and emotional weather, not a disaster.',
        hi: 'सूर्य (सूर्य ग्रहण योग) या चंद्र (चंद्र ग्रहण योग) राहु या केतु के साथ एक राशि में है — ग्रहण जैसी ही ज्यामिति। परंपरा इसे स्पष्टता और मन की स्थिति से जुड़ा संकेत मानती है, कोई आपदा नहीं।',
      },
      howCommon: {
        en: 'Roughly 3 in 10 charts: each of the Sun and Moon has about a 2-in-12 chance of sharing its sign with Rahu or Ketu.',
        hi: 'लगभग 10 में से 3 कुंडलियाँ: सूर्य और चंद्र, दोनों की राहु या केतु के साथ एक राशि में होने की संभावना लगभग 12 में 2 है।',
      },
      cancellations: {
        en: 'BornClock grades it by how close the degrees are — a wide gap is mild. A strong Jupiter aspect on the luminary is widely read as softening it.',
        hi: 'BornClock अंशों की निकटता से इसकी तीव्रता बताता है — अधिक दूरी हो तो हल्का। प्रकाशमान ग्रह पर बलवान गुरु की दृष्टि इसे हल्का करती मानी जाती है।',
      },
    },
    free: {
      mantras: [P.Sun.beej, P.Moon.beej, MMJ],
      prayers: [ADITYA_HRIDAYAM, { text: { en: 'For the Moon pattern: Om Namah Shivaya, or Shiva prayer on Mondays.', hi: 'चंद्र योग के लिए: ॐ नमः शिवाय, या सोमवार को शिव प्रार्थना।' }, source: SRC.panchakshari }],
      fasting: { text: { en: 'Sunday vrat for the Sun pattern, Monday vrat for the Moon pattern. Light and optional — skip it if you are pregnant, unwell, elderly or on medication.', hi: 'सूर्य योग के लिए रविवार, चंद्र योग के लिए सोमवार व्रत। हल्का और वैकल्पिक — गर्भावस्था, बीमारी, बुढ़ापे या दवा चलने पर न करें।' }, source: SRC.vara },
      lifestyle: [P.Sun.lifestyle[0], P.Moon.lifestyle[1]],
      seva: [...P.Sun.seva, ...P.Moon.seva],
    },
    daan: [
      { what: { en: 'Grain, clothes or food', hi: 'अनाज, वस्त्र या भोजन' }, toWhom: { en: 'The poor or a temple', hi: 'गरीबों या मंदिर को' }, day: { en: 'During or right after a real solar or lunar eclipse — the traditional time for daan', hi: 'वास्तविक सूर्य या चंद्र ग्रहण के दौरान या ठीक बाद — दान का पारंपरिक समय' }, source: SRC.daan },
      P.Sun.daan, P.Moon.daan,
    ],
    puja: [
      { name: { en: 'Mantra japa during an actual eclipse', hi: 'वास्तविक ग्रहण के समय मंत्र जप' }, when: { en: 'During a solar or lunar eclipse visible in your area (see the Panchang)', hi: 'आपके क्षेत्र में दिखने वाले सूर्य या चंद्र ग्रहण के समय (पंचांग देखें)' }, where: 'home', note: { en: 'Done quietly at home; no priest needed.', hi: 'घर पर शांति से करें; पुरोहित की आवश्यकता नहीं।' }, source: SRC.grahaShanti },
      { name: { en: 'Rahu–Ketu pooja at Srikalahasti', hi: 'श्रीकालहस्ती में राहु–केतु पूजा' }, when: { en: 'Timings are set by the temple; it also stays open during eclipses', hi: 'समय मंदिर तय करता है; ग्रहण के समय भी मंदिर खुला रहता है' }, where: 'priest', note: { en: 'Optional; done at the temple.', hi: 'वैकल्पिक; मंदिर में होती है।' }, source: SRC.temple },
      { name: { en: 'Grahan dosha shanti (japa and havan)', hi: 'ग्रहण दोष शांति (जप और हवन)' }, when: { en: 'A day chosen with a priest', hi: 'पुरोहित द्वारा चुना गया दिन' }, where: 'priest', note: { en: 'Optional.', hi: 'वैकल्पिक।' }, source: SRC.grahaShanti },
    ],
    temples: ['srikalahasti'],
    gemstone: {
      planet: null,
      note: {
        en: 'There is no default stone for Grahan dosha. Ruby (Sun) or Pearl (Moon) are considered only if your full chart supports that planet; Gomed and Cat’s Eye are not general remedies.',
        hi: 'ग्रहण दोष का कोई स्वतः रत्न नहीं है। माणिक्य (सूर्य) या मोती (चंद्र) तभी विचारणीय हैं जब पूरी कुंडली उस ग्रह का समर्थन करे; गोमेद और लहसुनिया सामान्य उपाय नहीं हैं।',
      },
    },
    consult: {
      en: 'Consult an astrologer if the grade is strong and you want it read alongside your Dasha and the rest of the chart.',
      hi: 'तीव्रता "strong" हो और आप इसे अपनी दशा व पूरी कुंडली के साथ पढ़वाना चाहें, तो ज्योतिषी से मिलें।',
    },
  },
  {
    key: 'mool', slug: 'mool-nakshatra', kind: 'nakshatra', planets: ['Ketu', 'Mercury'], toolPath: '/mool-dosha',
    name: { en: 'Mool (Gandamool) Nakshatra', hi: 'मूल (गंडमूल) नक्षत्र' },
    meaning: {
      plain: {
        en: 'The Moon at birth is in one of the six gandamool stars — Ashwini, Ashlesha, Magha, Jyeshtha, Mula or Revati. This is a cultural and astrological tradition only. It has NO medical meaning: a baby born in these stars is as healthy as any other — always follow your paediatrician.',
        hi: 'जन्म के समय चंद्र छह गंडमूल नक्षत्रों — अश्विनी, आश्लेषा, मघा, ज्येष्ठा, मूल या रेवती — में से एक में है। यह केवल सांस्कृतिक और ज्योतिषीय परंपरा है। इसका कोई चिकित्सीय अर्थ नहीं है: इन नक्षत्रों में जन्मा शिशु किसी भी अन्य शिशु जितना ही स्वस्थ है — हमेशा अपने बाल-रोग चिकित्सक की सलाह मानें।',
      },
      howCommon: {
        en: 'Common: 6 of the 27 nakshatras are gandamool, so about 2 in 9 people are born under one.',
        hi: 'आम है: 27 में से 6 नक्षत्र गंडमूल हैं, इसलिए लगभग 9 में से 2 लोग इनमें जन्म लेते हैं।',
      },
      cancellations: {
        en: 'The tradition treats the gandanta-junction padas as the most significant and the rest as milder; many families simply do one Mool Shanti and consider the matter settled.',
        hi: 'परंपरा गंडांत-संधि वाले पादों को सबसे महत्वपूर्ण और शेष को हल्का मानती है; कई परिवार एक बार मूल शांति करके इसे पूर्ण मान लेते हैं।',
      },
    },
    free: {
      mantras: [
        { ...P.Ketu.beej, when: { en: 'For Ashwini, Magha and Mula (Ketu-ruled stars) — chanted by a parent', hi: 'अश्विनी, मघा और मूल (केतु के नक्षत्र) के लिए — माता-पिता जपें' } },
        { ...P.Mercury.beej, when: { en: 'For Ashlesha, Jyeshtha and Revati (Mercury-ruled stars) — chanted by a parent', hi: 'आश्लेषा, ज्येष्ठा और रेवती (बुध के नक्षत्र) के लिए — माता-पिता जपें' } },
        GANESHA,
      ],
      prayers: [{ text: { en: 'A simple family prayer of thanks for the child’s birth — the spirit of the custom.', hi: 'शिशु के जन्म के लिए परिवार की सरल धन्यवाद-प्रार्थना — इस प्रथा की मूल भावना।' }, source: SRC.sense }],
      fasting: { text: { en: 'No fasting is needed — and never for a baby or a nursing mother. A parent may keep the Mool Shanti day simple and sattvic if they wish.', hi: 'किसी व्रत की आवश्यकता नहीं — शिशु या स्तनपान कराने वाली माँ के लिए तो कभी नहीं। माता-पिता चाहें तो मूल शांति का दिन सादा और सात्त्विक रख सकते हैं।' }, source: SRC.sense },
      lifestyle: [
        { text: { en: 'Celebrate the birth as you normally would; follow your paediatrician on every health matter.', hi: 'जन्म का उत्सव सामान्य रूप से मनाएँ; स्वास्थ्य के हर विषय में बाल-रोग चिकित्सक की सलाह मानें।' }, source: SRC.sense },
      ],
      seva: [{ text: { en: 'Feed people in need or give to a children’s cause on the Mool Shanti day.', hi: 'मूल शांति के दिन ज़रूरतमंदों को भोजन कराएँ या बच्चों के किसी काम में दान दें।' }, source: SRC.sense }],
    },
    daan: [{ what: { en: 'Grain, clothes, or as the priest advises for the Shanti', hi: 'अनाज, वस्त्र, या शांति के लिए पुरोहित की सलाह के अनुसार' }, toWhom: { en: 'The priest performing the Shanti, or people in need', hi: 'शांति कराने वाले पुरोहित, या ज़रूरतमंदों को' }, day: { en: 'The Mool Shanti day', hi: 'मूल शांति का दिन' }, source: SRC.gandamool }],
    puja: [
      { name: { en: 'Gandamool (Mool) Shanti puja', hi: 'गंडमूल (मूल) शांति पूजा' }, when: { en: 'On the 27th day after birth, or when the birth nakshatra next recurs', hi: 'जन्म के 27वें दिन, या जन्म-नक्षत्र के फिर आने पर' }, where: 'priest', note: { en: 'Done once, usually at home with the family priest. Optional custom — not a medical step.', hi: 'एक बार, प्रायः घर पर कुल-पुरोहित के साथ। वैकल्पिक प्रथा — कोई चिकित्सीय कदम नहीं।' }, source: SRC.gandamool },
    ],
    temples: [],
    templesNote: {
      en: 'No particular shrine is prescribed — Mool Shanti is normally done at home or at your family temple.',
      hi: 'कोई विशेष तीर्थ निर्धारित नहीं — मूल शांति सामान्यतः घर पर या कुल-मंदिर में होती है।',
    },
    gemstone: {
      planet: null,
      note: {
        en: 'No gemstone — never for a baby or anyone under 18.',
        hi: 'कोई रत्न नहीं — शिशु या 18 वर्ष से कम आयु के किसी के लिए कभी नहीं।',
      },
    },
    consult: {
      en: 'Ask your family priest about the Shanti custom your family follows. For anything about the baby’s health, consult a doctor — not an astrologer.',
      hi: 'आपके परिवार में कौन-सी शांति प्रथा है, यह कुल-पुरोहित से पूछें। शिशु के स्वास्थ्य से जुड़ी किसी भी बात के लिए डॉक्टर से मिलें — ज्योतिषी से नहीं।',
    },
  },
  {
    key: 'sadeSati', slug: 'sade-sati', kind: 'transit', planets: ['Saturn'], toolPath: '/sade-sati',
    name: { en: 'Sade Sati (Saturn’s 7½ years)', hi: 'साढ़ेसाती (शनि के साढ़े सात वर्ष)' },
    meaning: {
      plain: {
        en: 'Saturn is moving through the sign before, on, or after your Moon sign — a roughly 7½-year season. It asks for patience, routine and steady effort; many people look back on it as the period that built their strongest foundations.',
        hi: 'शनि आपकी चंद्र राशि से पहले, उस पर, या उसके बाद की राशि में गोचर कर रहे हैं — लगभग साढ़े सात वर्ष का समय। यह धैर्य, नियमितता और लगातार प्रयास माँगता है; बहुत से लोग इसे वह समय मानते हैं जिसने उनकी सबसे मज़बूत नींव बनाई।',
      },
      howCommon: {
        en: 'Everyone has it — about every 30 years, so two or three times in a lifetime. At any moment roughly 1 in 4 people are in Sade Sati (Saturn is in 3 of the 12 signs counted from the Moon).',
        hi: 'हर किसी की आती है — लगभग हर 30 वर्ष में, यानी जीवन में दो-तीन बार। किसी भी समय लगभग 4 में से 1 व्यक्ति साढ़ेसाती में होता है (चंद्र से गिनी 12 में से 3 राशियों में शनि)।',
      },
      cancellations: {
        en: 'It is widely read as much milder when Saturn is a friendly or yogakaraka planet for your Lagna (for Taurus and Libra Lagna, Saturn is yogakaraka) or is well placed in your birth chart.',
        hi: 'जब शनि आपके लग्न के लिए मित्र या योगकारक हों (वृषभ और तुला लग्न के लिए शनि योगकारक हैं) या जन्म-कुंडली में अच्छे स्थित हों, तो इसे बहुत हल्का माना जाता है।',
      },
    },
    free: {
      mantras: [P.Saturn.beej, P.Saturn.stotra],
      prayers: [HANUMAN_CHALISA, DASHARATHA_SHANI],
      fasting: P.Saturn.fasting,
      lifestyle: P.Saturn.lifestyle,
      seva: P.Saturn.seva,
    },
    daan: [P.Saturn.daan],
    puja: P.Saturn.puja,
    temples: ['thirunallar', 'shaniShingnapur'],
    gemstone: {
      planet: 'Saturn',
      note: {
        en: 'Blue Sapphire (Neelam) is NOT a general Sade Sati remedy. It is considered only when your full chart itself favours Saturn — the Sade Sati page shows it only in that case — and then only after a qualified astrologer’s check and a short trial.',
        hi: 'नीलम साढ़ेसाती का सामान्य उपाय नहीं है। इस पर तभी विचार होता है जब आपकी पूरी कुंडली स्वयं शनि का समर्थन करे — साढ़ेसाती पेज इसे केवल तभी दिखाता है — और तब भी योग्य ज्योतिषी की जाँच और थोड़े परीक्षण के बाद ही।',
      },
    },
    consult: {
      en: 'Consult an astrologer if you want your Sade Sati read with your Dasha and your Lagna — the same transit feels very different from chart to chart.',
      hi: 'अपनी साढ़ेसाती को दशा और लग्न के साथ पढ़वाना हो तो ज्योतिषी से मिलें — एक ही गोचर अलग-अलग कुंडलियों में बहुत अलग अनुभव होता है।',
    },
  },
  {
    key: 'dhaiya', slug: 'shani-dhaiya', kind: 'transit', planets: ['Saturn'], toolPath: '/sade-sati',
    name: { en: 'Shani Dhaiya (small Panoti)', hi: 'शनि ढैया (लघु पनौती)' },
    meaning: {
      plain: {
        en: 'Saturn is in the 4th (Kantaka) or 8th (Ashtama) sign from your Moon for about 2½ years. The 4th is read as a time to steady home and work routines; the 8th as a time of change and inner work. It is a season, not a sentence.',
        hi: 'शनि लगभग ढाई वर्ष के लिए आपकी चंद्र राशि से चौथी (कंटक) या आठवीं (अष्टम) राशि में हैं। चौथी को घर और काम की दिनचर्या स्थिर करने का, आठवीं को बदलाव और आत्म-चिंतन का समय माना जाता है। यह एक दौर है, कोई दंड नहीं।',
      },
      howCommon: {
        en: 'Common: Saturn is in one of these 2 signs (of 12) for about 1 in 6 people at any moment.',
        hi: 'आम है: किसी भी समय लगभग 6 में से 1 व्यक्ति के लिए शनि इन 2 राशियों (12 में से) में से एक में होते हैं।',
      },
      cancellations: {
        en: 'As with Sade Sati, it is read as much milder when Saturn is friendly or yogakaraka for your Lagna, or well placed in your birth chart.',
        hi: 'साढ़ेसाती की तरह, जब शनि आपके लग्न के लिए मित्र या योगकारक हों, या जन्म-कुंडली में अच्छे स्थित हों, तो इसे बहुत हल्का माना जाता है।',
      },
    },
    free: {
      mantras: [P.Saturn.beej, P.Saturn.stotra],
      prayers: [HANUMAN_CHALISA, DASHARATHA_SHANI],
      fasting: P.Saturn.fasting,
      lifestyle: P.Saturn.lifestyle,
      seva: P.Saturn.seva,
    },
    daan: [P.Saturn.daan],
    puja: P.Saturn.puja,
    temples: ['thirunallar', 'shaniShingnapur'],
    gemstone: {
      planet: 'Saturn',
      note: {
        en: 'Blue Sapphire (Neelam) is NOT a general Dhaiya remedy — only if your full chart favours Saturn, after a qualified astrologer’s check and a short trial.',
        hi: 'नीलम ढैया का सामान्य उपाय नहीं है — केवल तभी जब पूरी कुंडली शनि का समर्थन करे, योग्य ज्योतिषी की जाँच और थोड़े परीक्षण के बाद।',
      },
    },
    consult: {
      en: 'Consult an astrologer if you want the Dhaiya read with your running Dasha and your Lagna.',
      hi: 'ढैया को अपनी चल रही दशा और लग्न के साथ पढ़वाना हो तो ज्योतिषी से मिलें।',
    },
  },
  {
    key: 'nadi', slug: 'nadi-dosha', kind: 'matching', planets: [], toolPath: '/kundali-match',
    name: { en: 'Nadi Dosha (matching)', hi: 'नाड़ी दोष (मिलान)' },
    meaning: {
      plain: {
        en: 'Both partners’ birth stars fall in the same Nadi, so the Nadi koota scores 0 of 8. It is a compatibility note about the pair — it says nothing negative about either person on their own, and it is not a verdict on the relationship.',
        hi: 'दोनों के जन्म-नक्षत्र एक ही नाड़ी में हैं, इसलिए नाड़ी कूट को 8 में से 0 अंक मिलते हैं। यह जोड़ी की अनुकूलता पर टिप्पणी है — किसी एक व्यक्ति के बारे में कुछ बुरा नहीं कहती, और संबंध पर कोई फ़ैसला नहीं है।',
      },
      howCommon: {
        en: 'About 1 in 3 random pairs: each Nadi covers 9 of the 27 nakshatras.',
        hi: 'लगभग 3 में से 1 जोड़ी: हर नाड़ी 27 में से 9 नक्षत्रों को समेटती है।',
      },
      cancellations: {
        en: 'Often cancelled: same nakshatra but different padas, same Moon sign but different nakshatras, or friendly Moon-sign lords. The match result shows whether these apply to your pair.',
        hi: 'प्रायः निरस्त हो जाता है: एक ही नक्षत्र पर अलग पाद, एक ही चंद्र राशि पर अलग नक्षत्र, या चंद्र-राशि स्वामी मित्र हों। मिलान का परिणाम बताता है कि आपकी जोड़ी पर ये लागू हैं या नहीं।',
      },
    },
    free: {
      mantras: [MMJ, PANCHAKSHARI],
      prayers: [SHIVA_PRAYER],
      fasting: { text: { en: 'Monday vrat for Shiva, if you wish — light and optional; skip it if you are pregnant, unwell, elderly or on medication.', hi: 'चाहें तो शिव के लिए सोमवार व्रत — हल्का और वैकल्पिक; गर्भावस्था, बीमारी, बुढ़ापे या दवा चलने पर न करें।' }, source: SRC.devata },
      lifestyle: [
        { text: { en: 'Talk openly about family, lifestyle and expectations. If health is a worry, speak to a doctor — astrology is not a medical test.', hi: 'परिवार, जीवनशैली और अपेक्षाओं पर खुलकर बात करें। स्वास्थ्य की चिंता हो तो डॉक्टर से बात करें — ज्योतिष कोई चिकित्सीय जाँच नहीं है।' }, source: SRC.sense },
      ],
      seva: [{ text: { en: 'Do anna daan (feeding people in need) together as a couple.', hi: 'दंपति के रूप में साथ मिलकर अन्नदान करें।' }, source: SRC.matching }],
    },
    daan: [{ what: { en: 'Grain, clothes, or a contribution to a gaushala (cow shelter) — a modern form of the traditional godaan', hi: 'अनाज, वस्त्र, या गौशाला में योगदान — पारंपरिक गोदान का आधुनिक रूप' }, toWhom: { en: 'A temple, a gaushala or people in need', hi: 'मंदिर, गौशाला या ज़रूरतमंदों को' }, day: { en: 'An auspicious day before the wedding, chosen with the family priest', hi: 'विवाह से पहले कुल-पुरोहित द्वारा चुना गया शुभ दिन' }, source: SRC.matching }],
    puja: [
      { name: { en: 'Uma–Maheshwar (Shiva–Parvati) puja', hi: 'उमा–महेश्वर (शिव–पार्वती) पूजा' }, when: { en: 'Mondays, or before the wedding', hi: 'सोमवार, या विवाह से पहले' }, where: 'home-or-priest', note: { en: 'Can be done at home; a priest can do a fuller version.', hi: 'घर पर कर सकते हैं; पुरोहित इसका विस्तृत रूप करा सकते हैं।' }, source: SRC.devata },
      { name: { en: 'Maha Mrityunjaya japa (Nadi dosha shanti)', hi: 'महामृत्युंजय जप (नाड़ी दोष शांति)' }, when: { en: 'Before the wedding, on a day set by the priest', hi: 'विवाह से पहले, पुरोहित द्वारा तय दिन' }, where: 'priest', note: { en: 'Optional; usually suggested only when the dosha is uncancelled.', hi: 'वैकल्पिक; प्रायः तभी सुझाया जाता है जब दोष निरस्त न हो।' }, source: SRC.matching },
    ],
    temples: [],
    templesNote: {
      en: 'No specific temple is traditionally tied to Nadi dosha; many couples simply visit a Shiva temple together.',
      hi: 'नाड़ी दोष से कोई विशेष मंदिर पारंपरिक रूप से नहीं जुड़ा; कई दंपति साथ में किसी शिव मंदिर के दर्शन करते हैं।',
    },
    gemstone: { planet: null, note: NO_GEM_MATCH },
    consult: CONSULT_MATCH,
  },
  {
    key: 'bhakoot', slug: 'bhakoot-dosha', kind: 'matching', planets: ['Moon'], toolPath: '/kundali-match',
    name: { en: 'Bhakoot Dosha (matching)', hi: 'भकूट दोष (मिलान)' },
    meaning: {
      plain: {
        en: 'The two Moon signs sit 2/12, 5/9 or 6/8 from each other, so Bhakoot scores 0 of 7. The tradition reads it as an area of emotional and financial rhythm for the couple to tend — not a verdict.',
        hi: 'दोनों की चंद्र राशियाँ एक-दूसरे से 2/12, 5/9 या 6/8 पर हैं, इसलिए भकूट को 7 में से 0 अंक मिलते हैं। परंपरा इसे दंपति के भावनात्मक और आर्थिक तालमेल का विषय मानती है — कोई फ़ैसला नहीं।',
      },
      howCommon: {
        en: 'Very common — about half of random pairs, since 6 of the 12 relative sign positions count.',
        hi: 'बहुत आम — लगभग आधी जोड़ियाँ, क्योंकि 12 में से 6 सापेक्ष स्थितियाँ गिनी जाती हैं।',
      },
      cancellations: {
        en: 'Classical exceptions exist — for example when both Moon signs share the same lord, or the two lords are friends — but schools differ. BornClock shows the raw score, so ask an astrologer to check the exceptions for your pair.',
        hi: 'शास्त्रीय अपवाद हैं — जैसे दोनों चंद्र राशियों का स्वामी एक ही हो, या दोनों स्वामी मित्र हों — पर मत अलग-अलग हैं। BornClock मूल अंक दिखाता है, इसलिए अपनी जोड़ी के अपवाद ज्योतिषी से जँचवाएँ।',
      },
    },
    free: {
      mantras: [P.Moon.beej, PANCHAKSHARI],
      prayers: [SHIVA_PRAYER],
      fasting: P.Moon.fasting,
      lifestyle: [
        { text: { en: 'Agree early on money habits and shared goals; regular, honest check-ins help the "rhythm" this koota is about.', hi: 'पैसे की आदतों और साझा लक्ष्यों पर पहले ही सहमति बनाएँ; नियमित, ईमानदार बातचीत उसी "तालमेल" में मदद करती है जिसकी यह कूट बात करता है।' }, source: SRC.sense },
      ],
      seva: [{ text: { en: 'Do anna daan together as a couple.', hi: 'दंपति के रूप में साथ मिलकर अन्नदान करें।' }, source: SRC.matching }],
    },
    daan: [P.Moon.daan],
    puja: [
      { name: { en: 'Uma–Maheshwar (Shiva–Parvati) puja', hi: 'उमा–महेश्वर (शिव–पार्वती) पूजा' }, when: { en: 'Mondays, or before the wedding', hi: 'सोमवार, या विवाह से पहले' }, where: 'home-or-priest', note: { en: 'Can be done at home.', hi: 'घर पर कर सकते हैं।' }, source: SRC.devata },
      { name: { en: 'Puja to both partners’ Moon-sign lords', hi: 'दोनों की चंद्र-राशि के स्वामी ग्रहों की पूजा' }, when: { en: 'On each lord’s weekday', hi: 'हर स्वामी ग्रह के वार पर' }, where: 'home-or-priest', note: { en: 'See the planet pages for each lord’s mantra and day.', hi: 'हर स्वामी ग्रह का मंत्र और वार ग्रह-पेजों पर देखें।' }, source: SRC.matching },
    ],
    temples: [],
    templesNote: {
      en: 'No specific temple is traditionally tied to Bhakoot dosha; the Navagraha temple of either Moon-sign lord is a natural choice if you wish to visit one.',
      hi: 'भकूट दोष से कोई विशेष मंदिर पारंपरिक रूप से नहीं जुड़ा; चाहें तो किसी भी चंद्र-राशि स्वामी का नवग्रह मंदिर स्वाभाविक विकल्प है।',
    },
    gemstone: { planet: null, note: NO_GEM_MATCH },
    consult: CONSULT_MATCH,
  },
  {
    key: 'gana', slug: 'gana-dosha', kind: 'matching', planets: [], toolPath: '/kundali-match',
    name: { en: 'Gana Dosha (matching)', hi: 'गण दोष (मिलान)' },
    meaning: {
      plain: {
        en: 'One partner is Rakshasa gana and the other Deva or Manushya. The tradition reads this as a difference in temperament — one more intense, one gentler — that the couple can work with consciously.',
        hi: 'एक साथी राक्षस गण और दूसरा देव या मनुष्य गण है। परंपरा इसे स्वभाव का अंतर मानती है — एक अधिक तीव्र, एक अधिक कोमल — जिसके साथ दंपति समझदारी से चल सकते हैं।',
      },
      howCommon: {
        en: 'Common — about 4 in 9 random pairs, since each gana covers 9 of the 27 nakshatras.',
        hi: 'आम है — लगभग 9 में से 4 जोड़ियाँ, क्योंकि हर गण 27 में से 9 नक्षत्रों को समेटता है।',
      },
      cancellations: {
        en: 'Classically cancelled when both share the same Moon sign, or the Moon-sign lords or nakshatra lords are the same or friends. The match result shows whether these apply.',
        hi: 'शास्त्रीय रूप से निरस्त होता है जब दोनों की चंद्र राशि एक हो, या चंद्र-राशि स्वामी या नक्षत्र स्वामी एक ही या मित्र हों। मिलान का परिणाम बताता है कि ये लागू हैं या नहीं।',
      },
    },
    free: {
      mantras: [PANCHAKSHARI],
      prayers: [SHIVA_PRAYER, HANUMAN_CHALISA],
      fasting: { text: { en: 'Not needed. A Monday vrat together is a common optional custom — skip it if you are pregnant, unwell, elderly or on medication.', hi: 'आवश्यक नहीं। साथ में सोमवार व्रत एक प्रचलित वैकल्पिक प्रथा है — गर्भावस्था, बीमारी, बुढ़ापे या दवा चलने पर न करें।' }, source: SRC.devata },
      lifestyle: [
        { text: { en: 'Learn each other’s pace: agree how you handle disagreements before they happen.', hi: 'एक-दूसरे की गति समझें: असहमति कैसे सँभालेंगे, यह पहले ही तय कर लें।' }, source: SRC.sense },
      ],
      seva: [{ text: { en: 'Do anna daan together as a couple.', hi: 'दंपति के रूप में साथ मिलकर अन्नदान करें।' }, source: SRC.matching }],
    },
    daan: [{ what: { en: 'Food or clothes', hi: 'भोजन या वस्त्र' }, toWhom: { en: 'People in need or a temple', hi: 'ज़रूरतमंदों या मंदिर को' }, day: { en: 'Any Monday, or before the wedding', hi: 'कोई भी सोमवार, या विवाह से पहले' }, source: SRC.matching }],
    puja: [
      { name: { en: 'Uma–Maheshwar (Shiva–Parvati) puja', hi: 'उमा–महेश्वर (शिव–पार्वती) पूजा' }, when: { en: 'Mondays, or before the wedding', hi: 'सोमवार, या विवाह से पहले' }, where: 'home-or-priest', note: { en: 'Can be done at home.', hi: 'घर पर कर सकते हैं।' }, source: SRC.devata },
    ],
    temples: [],
    templesNote: {
      en: 'No specific temple is traditionally tied to Gana dosha.',
      hi: 'गण दोष से कोई विशेष मंदिर पारंपरिक रूप से नहीं जुड़ा।',
    },
    gemstone: { planet: null, note: NO_GEM_MATCH },
    consult: CONSULT_MATCH,
  },
];

// ── Planet entries (Mahadasha lord, or a planet in its debilitation sign) ─────
const PLANET_SLUG: Record<PlanetName, string> = {
  Sun: 'surya-sun', Moon: 'chandra-moon', Mars: 'mangal-mars', Mercury: 'budh-mercury', Jupiter: 'guru-jupiter',
  Venus: 'shukra-venus', Saturn: 'shani-saturn', Rahu: 'rahu', Ketu: 'ketu',
};

const PLANET_THEME: Record<PlanetName, L10n> = {
  Sun: { en: 'confidence, authority, your father and your sense of purpose', hi: 'आत्मविश्वास, अधिकार, पिता और जीवन-उद्देश्य' },
  Moon: { en: 'mind, emotions, home and your mother', hi: 'मन, भावनाएँ, घर और माता' },
  Mars: { en: 'energy, courage, property and siblings', hi: 'ऊर्जा, साहस, संपत्ति और भाई-बहन' },
  Mercury: { en: 'speech, learning, trade and quick thinking', hi: 'वाणी, शिक्षा, व्यापार और बुद्धि की फुर्ती' },
  Jupiter: { en: 'wisdom, teachers, children and good fortune', hi: 'ज्ञान, गुरु, संतान और सौभाग्य' },
  Venus: { en: 'love, marriage, comfort and the arts', hi: 'प्रेम, विवाह, सुख-सुविधा और कला' },
  Saturn: { en: 'discipline, hard work, responsibility and patience', hi: 'अनुशासन, परिश्रम, ज़िम्मेदारी और धैर्य' },
  Rahu: { en: 'ambition, the unconventional, foreign things and sudden change', hi: 'महत्वाकांक्षा, अपरंपरागत चीज़ें, विदेश और अचानक बदलाव' },
  Ketu: { en: 'detachment, spirituality, research and letting go', hi: 'वैराग्य, आध्यात्मिकता, शोध और छोड़ देना' },
};

const DASHA_YEARS: Record<PlanetName, number> = { Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17, Ketu: 7, Venus: 20 };

const POWERFUL_STONE = new Set<PlanetName>(['Saturn', 'Rahu', 'Ketu']);

function planetEntry(pl: PlanetName): RemedyEntry {
  const b = P[pl];
  const nodes = pl === 'Rahu' || pl === 'Ketu';
  const yrs = DASHA_YEARS[pl];
  return {
    key: `planet:${pl}`, slug: PLANET_SLUG[pl], kind: 'planet', planets: [pl], toolPath: '/dasha-calculator',
    name: { en: b.name.en, hi: b.name.hi },
    meaning: {
      plain: {
        en: `These remedies are for when ${b.name.en} is running its Mahadasha or Antardasha for you${nodes ? '' : ', or sits in its sign of debilitation in your chart'}. ${b.name.en} speaks of ${PLANET_THEME[pl].en}; the remedies simply strengthen your relationship with those themes.`,
        hi: `ये उपाय तब के लिए हैं जब आपकी ${b.name.hi} की महादशा या अंतर्दशा चल रही हो${nodes ? '' : `, या ${b.name.hi} आपकी कुंडली में नीच राशि में हों`}। ${b.name.hi} ${PLANET_THEME[pl].hi} के कारक हैं; उपाय बस इन विषयों से आपका संबंध मज़बूत करते हैं।`,
      },
      howCommon: {
        en: `Completely normal. In the Vimshottari system ${b.name.en}'s Mahadasha lasts ${yrs} years and everyone passes through several Mahadashas in a lifetime${nodes ? '' : '; and any one planet sits in its debilitation sign in about 1 in 12 charts'}.`,
        hi: `बिल्कुल सामान्य। विंशोत्तरी पद्धति में ${b.name.hi} की महादशा ${yrs} वर्ष की होती है और हर कोई जीवन में कई महादशाओं से गुज़रता है${nodes ? '' : '; और कोई भी एक ग्रह लगभग 12 में से 1 कुंडली में नीच राशि में होता है'}।`,
      },
      cancellations: {
        en: `A planet’s period is easy or hard depending on where it sits and what it rules in YOUR chart — not on the planet’s name.${nodes ? '' : ' Debilitation is also often cancelled (Neecha Bhanga), which your Kundali checks.'}`,
        hi: `किसी ग्रह की दशा आसान होगी या कठिन, यह आपकी कुंडली में उसकी स्थिति और स्वामित्व पर निर्भर है — ग्रह के नाम पर नहीं।${nodes ? '' : ' नीच भंग भी प्रायः होता है, जिसकी जाँच आपकी कुंडली में होती है।'}`,
      },
    },
    free: {
      mantras: [b.beej, b.stotra],
      prayers: pl === 'Sun' ? [ADITYA_HRIDAYAM] : pl === 'Saturn' ? [HANUMAN_CHALISA, DASHARATHA_SHANI] : pl === 'Mars' ? [HANUMAN_CHALISA] : pl === 'Moon' ? [{ text: { en: 'Om Namah Shivaya, or a Shiva prayer on Mondays.', hi: 'ॐ नमः शिवाय, या सोमवार को शिव प्रार्थना।' }, source: SRC.panchakshari }] : [{ text: { en: `The Navagraha Stotra — all nine verses — once a day; it honours every planet together.`, hi: 'नवग्रह स्तोत्र — सभी नौ श्लोक — प्रतिदिन एक बार; इसमें सभी ग्रहों का एक साथ वंदन है।' }, source: SRC.navagrahaStotra }],
      fasting: b.fasting,
      lifestyle: b.lifestyle,
      seva: b.seva,
    },
    daan: [b.daan],
    puja: b.puja,
    temples: b.temples,
    gemstone: {
      planet: pl,
      note: planetGemNote(pl, POWERFUL_STONE.has(pl)
        ? { en: 'It is one of the most powerful stones and is traditionally worn only after a short trial.', hi: 'यह सबसे प्रभावशाली रत्नों में है और परंपरा से थोड़े परीक्षण के बाद ही पहना जाता है।' }
        : { en: 'A running Dasha alone is not a reason to wear it.', hi: 'केवल दशा चलना इसे पहनने का कारण नहीं है।' }),
    },
    consult: {
      en: `Consult an astrologer if you want ${b.name.en}'s period read against your Lagna and the planet’s house lordship — that, not the planet’s name, decides how it plays out.`,
      hi: `${b.name.hi} की दशा को अपने लग्न और ग्रह के भाव-स्वामित्व के साथ पढ़वाना हो तो ज्योतिषी से मिलें — परिणाम यही तय करता है, ग्रह का नाम नहीं।`,
    },
  };
}

const PLANETS: RemedyEntry[] = PLANET_ORDER.map(planetEntry);

export const REMEDIES: RemedyEntry[] = [...DOSHAS, ...PLANETS];

export const remedyBySlug = (slug: string): RemedyEntry | undefined => REMEDIES.find(r => r.slug === slug);
export const remedyByKey = (key: string): RemedyEntry | undefined => REMEDIES.find(r => r.key === key);
export const planetRemedyKey = (planet: string): string => `planet:${planet}`;

/** The standard gemstone caution, shown with every gemstone section. */
export const GEM_CAUTION: L10n = {
  en: 'Consult a qualified astrologer and wear a gemstone only after a full-chart check. Never for anyone under 18. Lower-cost substitute stones (uparatna) exist — ask about them. Traditionally a new stone is first worn on a short trial and removed if it does not feel right. A gemstone is never a guaranteed fix, and the free remedies above need no stone at all.',
  hi: 'योग्य ज्योतिषी से सलाह लें और पूरी कुंडली की जाँच के बाद ही रत्न पहनें। 18 वर्ष से कम आयु के किसी के लिए कभी नहीं। कम कीमत के उपरत्न भी होते हैं — उनके बारे में पूछें। परंपरा से नया रत्न पहले थोड़े समय परीक्षण के लिए पहना जाता है और ठीक न लगे तो उतार दिया जाता है। रत्न कभी पक्का समाधान नहीं है, और ऊपर दिए निःशुल्क उपायों में किसी रत्न की आवश्यकता नहीं।',
};

/** Every source an entry cites (for display and tests). */
export function entrySources(e: RemedyEntry): string[] {
  const s = new Set<string>();
  e.free.mantras.forEach(m => s.add(m.source));
  e.free.prayers.forEach(p => s.add(p.source));
  s.add(e.free.fasting.source);
  e.free.lifestyle.forEach(p => s.add(p.source));
  e.free.seva.forEach(p => s.add(p.source));
  e.daan.forEach(d => s.add(d.source));
  e.puja.forEach(p => s.add(p.source));
  if (e.temples.length) s.add(SRC.temple);
  s.add(SRC.gemTradition);
  return [...s];
}

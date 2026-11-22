/**
 * B18 — glossary terms for the Varshphal (Tajik annual chart) tool. Own file (spread into
 * VEDIC_TERMS) like termDefinitionsAdvanced.ts. Same rules: impact first (≤ 2 sentences),
 * Hindi name + Hindi explanation, calm wording.
 * Sources: Dr. S.P. Gour, "Varshaphal", AIFAS (archive.org AIFASBooks) and Balabhadra's
 * Hayanaratna, tr. M. Gansten (Brill 2020, open access) — see src/lib/vedic/varshphal.ts.
 */
import type { TermDef } from './termDefinitions';

export const VARSHPHAL_TERMS: Record<string, TermDef> = {
  varshphal: {
    term: 'Varshphal (annual chart)', category: 'varshphal', hiTerm: 'वर्षफल',
    impact: 'A chart for one year of your life, read alongside your birth chart to see what that year emphasises.',
    why: 'It is cast for the exact moment the Sun returns to the sidereal degree it held when you were born — once a year, close to your birthday. This method comes from the Tajik school of Indian astrology.',
    guidance: 'Read it as the year’s weather: it shows where effort pays off and where to be careful, not fixed events.',
    hi: 'वर्षफल आपके जीवन के एक वर्ष की कुंडली है। यह उस क्षण के लिए बनती है जब सूर्य ठीक उसी अंश पर लौटता है जहाँ वह आपके जन्म के समय था।',
    aliases: ['Varshaphal', 'Varshphal', 'annual horoscope', 'Tajik chart', 'solar return (Vedic)'],
    link: '/varshphal/',
  },
  varshaPravesh: {
    term: 'Varsha Pravesh (start of the year)', category: 'varshphal', hiTerm: 'वर्ष प्रवेश',
    impact: 'The exact moment your astrological year begins — usually on or a day around your birthday.',
    why: 'It is the instant the Sun reaches its exact birth longitude again (Lahiri sidereal). The annual chart is drawn for this moment and place.',
    hi: 'वर्ष प्रवेश वह क्षण है जब सूर्य फिर से अपने जन्म के अंश पर पहुँचता है। इसी क्षण की कुंडली वर्षफल कहलाती है।',
    aliases: ['Varshapravesh', 'solar return time'],
  },
  muntha: {
    term: 'Muntha', category: 'varshphal', hiTerm: 'मुंथा',
    impact: 'A sensitive point that shows which area of life the year keeps pulling your attention to.',
    why: 'It starts in your birth Lagna sign and moves forward one sign every year of life. Its house in the annual chart, and its sign lord (Munthesh), are read for the year.',
    guidance: 'Muntha in the 9th, 10th or 11th house is classically the most supportive; in the 4th, 6th, 7th, 8th or 12th it asks for more care in that area.',
    hi: 'मुंथा एक संवेदनशील बिंदु है जो जन्म लग्न से हर वर्ष एक राशि आगे बढ़ता है। वर्ष कुंडली में इसका भाव बताता है कि वर्ष का ध्यान किस क्षेत्र पर रहेगा।',
    aliases: ['Munthesh', 'Muntha lord'],
  },
  varshesh: {
    term: 'Varshesh (lord of the year)', category: 'varshphal', hiTerm: 'वर्षेश',
    impact: 'The planet that sets the overall tone of the year — its strength shows how well the year supports you.',
    why: 'It is chosen from five candidates (the Pancha-adhikaris): the Muntha lord, the birth-Lagna lord, the annual-Lagna lord, the Tri-rashi lord and the Day/Night lord. The strongest of them that aspects the annual Lagna becomes Varshesh.',
    hi: 'वर्षेश वर्ष का स्वामी ग्रह है जो पूरे वर्ष का स्वर तय करता है। इसे पाँच अधिकारी ग्रहों में से चुना जाता है — जो सबसे बलवान हो और वर्ष लग्न को देखे।',
    aliases: ['Year lord', 'Varshesha', 'Varshpati'],
  },
  panchaAdhikari: {
    term: 'Pancha-adhikari (five office-bearers)', category: 'varshphal', hiTerm: 'पंचाधिकारी',
    impact: 'The five planets that compete to become the lord of your year.',
    why: 'Muntha lord, birth-Lagna lord, annual-Lagna lord, Tri-rashi pati (fixed by the annual Lagna sign and whether the year begins by day or night) and Dina-Ratri pati (lord of the Sun’s sign by day, the Moon’s by night).',
    hi: 'पाँच अधिकारी ग्रह — मुंथेश, जन्म लग्नेश, वर्ष लग्नेश, त्रिराशि पति और दिन-रात्रि पति — जिनमें से वर्षेश चुना जाता है।',
    aliases: ['Panchadhikari', 'office bearers', 'Tri-rashi pati', 'Dina-Ratri pati'],
  },
  saham: {
    term: 'Saham (sensitive point)', category: 'varshphal', hiTerm: 'सहम',
    impact: 'A calculated point for one theme of life (merit, learning, fame, friends, marriage, success in work) — where it falls shows how that theme fares this year.',
    why: 'Each Saham is found by taking the distance between two points and measuring it from a third, e.g. Punya Saham = Moon − Sun + Lagna by day. One sign is added when the third point is not between the other two (classical rule).',
    hi: 'सहम किसी एक विषय (पुण्य, विद्या, यश, मित्र, विवाह, कार्य-सिद्धि) का गणितीय बिंदु है। इसका भाव और स्वामी बताते हैं कि उस वर्ष वह विषय कैसा रहेगा।',
    aliases: ['Sahams', 'Arabic parts', 'Lots', 'Punya Saham', 'Vivaha Saham'],
  },
  muddaDasha: {
    term: 'Mudda Dasha (year periods)', category: 'varshphal', hiTerm: 'मुद्दा दशा',
    impact: 'Splits your year into nine planet-led stretches of a few weeks each, so you can see which part of the year favours what.',
    why: 'It is the 120-year Vimshottari Dasha compressed into one year (360 parts: Sun 18, Moon 30, Mars 21, Rahu 54, Jupiter 48, Saturn 57, Mercury 51, Ketu 21, Venus 60). The first period depends on your birth Nakshatra and age.',
    hi: 'मुद्दा दशा विंशोत्तरी दशा का एक वर्ष में संक्षिप्त रूप है — वर्ष नौ ग्रहों की छोटी अवधियों में बँटता है, जिससे पता चलता है कि वर्ष का कौन-सा भाग किस काम के लिए अच्छा है।',
    aliases: ['Mudda', 'Mudda Vimshottari'],
  },
  tajikAspect: {
    term: 'Tajik aspect (drishti)', category: 'varshphal', hiTerm: 'ताजिक दृष्टि',
    impact: 'How two planets in the annual chart “talk” to each other — as friends, as rivals, or not at all.',
    why: 'Counted by houses: 5th/9th openly friendly, 3rd/11th quietly friendly, 1st/7th openly tense, 4th/10th quietly tense, and 2nd/12th or 6th/8th no aspect.',
    hi: 'ताजिक दृष्टि भावों से गिनी जाती है — 5/9 खुली मित्र, 3/11 गुप्त मित्र, 1/7 खुली शत्रु, 4/10 गुप्त शत्रु; 2/12 और 6/8 में दृष्टि नहीं।',
  },
  ithasala: {
    term: 'Ithasala yoga', category: 'varshphal', hiTerm: 'इत्थशाल योग',
    impact: 'A “coming together” of two planets — the matters they rule tend to move forward and complete this year.',
    why: 'The faster planet is a few degrees behind the slower one, within their combined orb (Deeptamsha), and the two are in a Tajik aspect — so they are moving towards an exact meeting.',
    hi: 'इत्थशाल योग में तेज़ ग्रह धीमे ग्रह से कुछ अंश पीछे होता है और दोनों एक-दूसरे को देखते हैं — इनके विषय वर्ष में आगे बढ़ते और पूरे होते हैं।',
    aliases: ['Ithashal', 'Itthasala', 'Muthashila'],
  },
  ishrafa: {
    term: 'Ishrafa yoga', category: 'varshphal', hiTerm: 'ईशराफ योग',
    impact: 'A “moving apart” of two planets — something tied to them has already peaked, so effort is needed to restart it.',
    why: 'The faster planet has just passed the slower one (it is ahead in degrees) while still within orb and in aspect, so the contact is separating.',
    hi: 'ईशराफ योग में तेज़ ग्रह धीमे ग्रह से आगे निकल चुका होता है — संपर्क घट रहा होता है, इसलिए उस विषय में दोबारा प्रयास की ज़रूरत होती है।',
    aliases: ['Ishraf', 'Easarapha'],
  },
  naktaYamaya: {
    term: 'Nakta and Yamaya yoga', category: 'varshphal', hiTerm: 'नक्त व यमया योग',
    impact: 'Help arrives through a third person: two planets that do not see each other are joined by a go-between planet.',
    why: 'A third planet is in Ithasala with both; if it is faster than both the yoga is Nakta, if slower than both it is Yamaya.',
    hi: 'जब दो ग्रह एक-दूसरे को नहीं देखते पर तीसरा ग्रह दोनों से इत्थशाल करता है — तेज़ हो तो नक्त, धीमा हो तो यमया योग। काम किसी मध्यस्थ से बनता है।',
    aliases: ['Nakta', 'Yamaya', 'Yamya'],
  },
  kamboola: {
    term: 'Kamboola yoga', category: 'varshphal', hiTerm: 'कंबूल योग',
    impact: 'An Ithasala that the Moon also joins — the coming-together gets extra support.',
    why: 'Two planets are in Ithasala and the Moon is in Ithasala with one of them.',
    hi: 'जब दो ग्रहों के इत्थशाल में चंद्रमा भी किसी एक से इत्थशाल करे — तो वह योग और मज़बूत होता है।',
    aliases: ['Kambool'],
  },
  harshaBala: {
    term: 'Harsha bala', category: 'varshphal', hiTerm: 'हर्ष बल',
    impact: 'A quick 0–20 “happiness” score for each planet in the annual chart.',
    why: 'Four tests of 5 points each: the planet’s favourite house, its own or exaltation sign, a house of the opposite gender, and day/night (male planets by day, female by night).',
    hi: 'हर्ष बल वर्ष कुंडली में ग्रह का 0–20 का सरल अंक है — चार कसौटियाँ, हर एक के 5 अंक।',
  },
  panchaVargiyaBala: {
    term: 'Pancha-vargiya bala', category: 'varshphal', hiTerm: 'पंचवर्गीय बल',
    impact: 'The main 0–20 strength score of a planet in the annual chart; it decides which candidate becomes lord of the year.',
    why: 'Five dignities are added — sign 30, exaltation 20, term (hadda) 15, decan 10, navamsa 5 — each reduced if the ruler is not a friend, and the total divided by four.',
    hi: 'पंचवर्गीय बल वर्ष कुंडली में ग्रह का मुख्य बल (0–20) है — राशि, उच्च, हद्दा, द्रेष्काण और नवांश के अंक जोड़कर चार से भाग।',
    aliases: ['Vimshopaka (Tajik)', 'Panchavargiya'],
  },
};

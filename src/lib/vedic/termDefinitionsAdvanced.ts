/**
 * Batch 10 — glossary terms for the Bhava Chalit, KP and Jaimini sections of the Kundali.
 * Kept in their own file (spread into VEDIC_TERMS) so parallel work on termDefinitions.ts
 * does not collide. Same shape and rules as every other entry: impact first (≤ 2 sentences),
 * Hindi name + Hindi explanation, calm wording.
 * Sources for the definitions: Wikipedia "Bhāva" (Sripati houses, sandhi), jagannathhora.com
 * chara-karaka guide and astromedha.in "seven or eight karakas" (karakas, Karakamsha),
 * PyJHora 4.8.7 chara.py (K.N. Rao Chara Dasha rules) — all opened 29 Oct 2026.
 */
import type { TermDef } from './termDefinitions';

export const ADVANCED_TERMS: Record<string, TermDef> = {
  bhavaChalit: {
    term: 'Bhava Chalit (house chart)', category: 'basics', hiTerm: 'भाव चलित',
    impact: 'Shows which house a planet actually works through, which can differ from the sign-house in your main chart.',
    why: 'The main (Rashi) chart puts a whole sign in each house. The Chalit chart instead builds each house around its own middle point (bhava madhya), so a planet near the edge of a sign can fall into the house before or after.',
    guidance: 'When a planet shifts house in the Chalit chart, read its results for the Chalit house.',
    hi: 'भाव चलित कुंडली बताती है कि कोई ग्रह वास्तव में किस भाव का फल देता है। राशि कुंडली में पूरी राशि एक भाव होती है, जबकि चलित में हर भाव अपने भाव मध्य के चारों ओर बनता है।',
    aliases: ['Chalit chart', 'Chalit Chakra', 'Bhav Chalit', 'Sripati houses'],
  },
  bhavaMadhya: {
    term: 'Bhava madhya (house middle)', category: 'basics', hiTerm: 'भाव मध्य',
    impact: 'The strongest point of a house — a planet close to it gives that house’s results most fully.',
    why: 'In the Sripati method the Lagna is the middle of the 1st house and the Midheaven the middle of the 10th; the quarters between them are split into three equal parts.',
    hi: 'भाव मध्य किसी भाव का सबसे प्रभावी बिंदु है। श्रीपति पद्धति में लग्न पहले भाव का मध्य और दशम (मध्य आकाश) दसवें भाव का मध्य होता है।',
    aliases: ['bhav madhya', 'house cusp (Sripati)'],
  },
  bhavaSandhi: {
    term: 'Bhava sandhi (house junction)', category: 'basics', hiTerm: 'भाव संधि',
    impact: 'The border between two houses — a planet sitting right on it gives mixed or weaker results.',
    why: 'It is the midpoint between two neighbouring house middles (bhava madhya). A house runs from its own sandhi to the next one.',
    hi: 'भाव संधि दो भावों की सीमा है — दो भाव मध्यों के बीच का मध्य बिंदु। संधि पर बैठा ग्रह मिला-जुला फल देता है।',
    aliases: ['bhav sandhi', 'house junction'],
  },
  kp: {
    term: 'KP (Krishnamurti Paddhati)', category: 'basics', hiTerm: 'के.पी. पद्धति (कृष्णमूर्ति)',
    impact: 'A precise, rule-based school of Vedic astrology, popular for answering specific questions and timing.',
    why: 'Developed by K.S. Krishnamurti, it uses Placidus house cusps, its own (Krishnamurti) ayanamsa, and splits every Nakshatra into nine unequal "subs" in Vimshottari proportions.',
    guidance: 'KP results need a birth time accurate to the minute.',
    hi: 'के.पी. (कृष्णमूर्ति पद्धति) वैदिक ज्योतिष की एक सटीक, नियम-आधारित शाखा है। इसमें प्लेसिडस भाव, कृष्णमूर्ति अयनांश और हर नक्षत्र के नौ उप-भाग (सब) प्रयोग होते हैं।',
    aliases: ['Krishnamurti Paddhati', 'KP system', 'KP astrology'],
  },
  starLord: {
    term: 'Star lord (Nakshatra lord)', category: 'basics', hiTerm: 'नक्षत्र स्वामी',
    impact: 'The planet whose Nakshatra a point falls in — in KP it shows which matters a planet will deliver.',
    why: 'Each of the 27 Nakshatras is ruled by one of the nine Vimshottari Dasha planets, in the order Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury.',
    hi: 'जिस ग्रह के नक्षत्र में कोई बिंदु या ग्रह हो, वह उसका नक्षत्र स्वामी है। के.पी. में यह बताता है कि ग्रह किन विषयों का फल देगा।',
    aliases: ['nakshatra lord', 'star-lord'],
  },
  subLord: {
    term: 'Sub lord (KP)', category: 'basics', hiTerm: 'उप स्वामी (सब लॉर्ड)',
    impact: 'In KP, the deciding factor: a house cusp’s sub lord shows whether, and how, that house’s matters work out.',
    why: 'Every Nakshatra is divided into nine unequal parts in the same proportion as the Vimshottari Dasha years; the planet ruling the part a point falls in is its sub lord. Together with sign and star boundaries this gives the 249 KP subs.',
    guidance: 'Cusp sub lords can change with a birth-time difference of a couple of minutes, so read them only with an exact birth time.',
    hi: 'के.पी. में हर नक्षत्र को विंशोत्तरी अनुपात में नौ भागों में बाँटा जाता है; जिस भाग में बिंदु हो उसका स्वामी उप स्वामी (सब लॉर्ड) है। भाव के सब लॉर्ड से उस भाव का फल तय होता है।',
    aliases: ['sub-lord', 'cuspal sub lord', 'KP sub', '249 subs'],
  },
  kpSignificator: {
    term: 'Significators (KP)', category: 'basics', hiTerm: 'कारक ग्रह (के.पी.)',
    impact: 'The planets that “switch on” a house — their Dasha periods bring that house’s matters forward.',
    why: 'KP ranks them in four levels, strongest first: planets in the star of an occupant of the house, the occupants themselves, planets in the star of the house’s lord, and the lord itself.',
    hi: 'के.पी. में किसी भाव के कारक वे ग्रह हैं जिनकी दशा में उस भाव के विषय सामने आते हैं। चार स्तर: भाव में बैठे ग्रहों के नक्षत्र वाले ग्रह, भाव में बैठे ग्रह, भावेश के नक्षत्र वाले ग्रह, और भावेश।',
    aliases: ['KP significators', 'four-level significators'],
  },
  charaKaraka: {
    term: 'Chara karakas (Jaimini)', category: 'basics', hiTerm: 'चर कारक',
    impact: 'Seven planets take on personal roles in your life — soul, career, siblings, mother, children, rivals, spouse — based on your own chart.',
    why: 'Jaimini ranks the Sun to Saturn by how far each has travelled inside its sign: the highest becomes Atmakaraka, then Amatyakaraka, Bhratrikaraka, Matrikaraka, Putrakaraka, Gnatikaraka, and the lowest Darakaraka. This is the seven-karaka scheme (Rahu not included).',
    hi: 'जैमिनी ज्योतिष में सूर्य से शनि तक के सात ग्रह अपनी राशि में अंशों के क्रम से आपके जीवन की भूमिकाएँ लेते हैं — आत्मकारक से दारकारक तक। राहु इस सात-कारक पद्धति में शामिल नहीं है।',
    aliases: ['Chara Karaka', 'Jaimini karakas', 'Amatyakaraka', 'Darakaraka'],
  },
  atmakaraka: {
    term: 'Atmakaraka (soul planet)', category: 'basics', hiTerm: 'आत्मकारक',
    impact: 'The planet that stands for you yourself in Jaimini astrology — the theme your life keeps returning to.',
    why: 'It is the planet (Sun to Saturn) with the highest degree within its sign in your birth chart.',
    hi: 'आत्मकारक वह ग्रह है जो जैमिनी ज्योतिष में स्वयं आपका प्रतिनिधि है — सूर्य से शनि में जिसका अपनी राशि में अंश सबसे अधिक हो।',
    aliases: ['soul planet', 'AK'],
  },
  karakamsha: {
    term: 'Karakamsha', category: 'divisional', hiTerm: 'कारकांश',
    impact: 'A second starting point for reading your deeper calling and spiritual leanings.',
    why: 'It is the sign your Atmakaraka occupies in the Navamsa (D9) chart; Jaimini astrologers count houses from it like a second Lagna.',
    hi: 'कारकांश वह राशि है जिसमें आत्मकारक नवांश (D9) कुंडली में बैठा हो। इसे दूसरे लग्न की तरह पढ़ा जाता है।',
    aliases: ['Karakamsa', 'Karakamsa Lagna'],
  },
  charaDasha: {
    term: 'Chara Dasha (Jaimini)', category: 'dasha', hiTerm: 'चर दशा',
    impact: 'A sign-based timeline: each period highlights the life area of one sign of your chart.',
    why: 'Instead of planets, the 12 signs take turns. In K.N. Rao’s method the first period is your Lagna sign, the order runs forwards or backwards depending on the 9th sign, and each sign’s length (0–12 years) is counted from the sign to its lord.',
    guidance: 'Read it alongside your Vimshottari Dasha; astrologers trust a theme when both timelines point to it.',
    hi: 'चर दशा राशियों पर आधारित दशा है — हर अवधि आपकी कुंडली की एक राशि के विषयों को आगे लाती है। के.एन. राव पद्धति में पहली दशा लग्न राशि की होती है।',
    aliases: ['Jaimini Chara Dasa', 'Chara Dasa', 'K.N. Rao Chara Dasha'],
  },
  // B21 — Avkahada, Ghatak, Prastarashtakavarga, ayanamsa choice, East Indian chart, Prashna.
  avakahada: {
    term: 'Avkahada Chakra (birth summary)', category: 'basics', hiTerm: 'अवकहड़ा चक्र',
    impact: 'A one-table summary of your birth: Moon sign, birth star, nature (Gana), Nadi, Yoni, name syllable and more.',
    why: 'Every printed Indian Kundli opens with it. Almost every entry comes from where the Moon was when you were born; a few come from the Sun and Moon together (Tithi, Yoga, Karana) or the Moon’s house from your Lagna (Paya).',
    guidance: 'Use it as a quick reference — the same values are used in Kundli matching and for choosing a name.',
    hi: 'अवकहड़ा चक्र आपके जन्म का सार है — राशि, नक्षत्र, गण, नाड़ी, योनि, नाम अक्षर आदि। लगभग सब कुछ जन्म के समय चंद्रमा की स्थिति से निकलता है।',
    aliases: ['Avakhada Chakra', 'Avakahada', 'Avkahada', 'birth details table'],
  },
  ghatak: {
    term: 'Ghatak Chakra (days to take extra care)', category: 'basics', hiTerm: 'घातक चक्र',
    impact: 'A traditional list of a month, tithi, weekday, star and Moon position that are less supportive for you — days to avoid starting something big, not days to fear.',
    why: 'It is read from your Moon sign (Muhurta texts; Antim Parichay tabulates it). The Moon’s ghatak sign differs for men and women.',
    guidance: 'Use it like a calendar hint: if an important start falls on a ghatak combination, pick a nearby date. Traditional texts exempt weddings, upanayan, yajna and pilgrimage.',
    hi: 'घातक चक्र आपकी चंद्र राशि से वे मास, तिथि, वार, नक्षत्र आदि बताता है जो आपके लिए कम सहायक हैं — बड़े काम की शुरुआत के लिए दूसरा दिन चुनें, डरने की बात नहीं।',
    aliases: ['Ghat Chakra', 'Ghataka Chakra', 'Ghatak', 'malefics'],
  },
  paya: {
    term: 'Paya (birth “foot”)', category: 'basics', hiTerm: 'पाया',
    impact: 'A traditional label — gold, silver, copper or iron — given to every birth. It is a label, not a verdict on your life.',
    why: 'One Paya comes from the Moon’s house counted from your Lagna (1, 6, 11 gold; 2, 5, 9 silver; 3, 7, 10 copper; 4, 8, 12 iron), the other from the Moon’s birth star. Almanacs differ on the star-based grouping.',
    hi: 'पाया जन्म का एक पारंपरिक नाम है — सोना, चाँदी, ताँबा या लोहा। यह केवल एक लेबल है, जीवन का निर्णय नहीं।',
    aliases: ['Paya', 'Pada (foot)', 'gold paya', 'silver paya'],
  },
  yunja: {
    term: 'Yunja', category: 'basics', hiTerm: 'युंजा',
    impact: 'Says whether your birth star sits in the opening, middle or closing part of the 27-star cycle.',
    why: 'Revati to Mrigashira is Purva (opening), Ardra to Anuradha Madhya (middle), Jyeshtha to Uttara Bhadrapada Antya (closing).',
    hi: 'युंजा बताता है कि आपका जन्म नक्षत्र 27 नक्षत्रों के चक्र के आरंभ, मध्य या अंत भाग में है।',
    aliases: ['Yunja'],
  },
  hansak: {
    term: 'Hansak (element)', category: 'basics', hiTerm: 'हंसक / तत्व',
    impact: 'The element of your Moon sign — fire, earth, air or water — a quick read on temperament.',
    why: 'Aries, Leo, Sagittarius are fire (Agni); Taurus, Virgo, Capricorn earth (Bhoomi); Gemini, Libra, Aquarius air (Vayu); Cancer, Scorpio, Pisces water (Jal).',
    hi: 'हंसक आपकी चंद्र राशि का तत्व है — अग्नि, भूमि, वायु या जल।',
    aliases: ['Tatva', 'Tattva', 'Hamsak', 'Hansak'],
  },
  nameVarga: {
    term: 'Varga (name letter group)', category: 'basics', hiTerm: 'वर्ग',
    impact: 'The letter family of your name syllable, used to check name harmony with a partner or business.',
    why: 'Devanagari letters fall into eight groups, each with a symbol: vowels Garuda, क-group Marjar (cat), च-group Simha (lion), ट-group Shwan (dog), त-group Sarpa (snake), प-group Mooshak (rat), य-र-ल-व Mriga (deer), श-ष-स-ह Mesha (ram).',
    hi: 'वर्ग आपके नाम अक्षर का अक्षर-समूह है — नाम या साझेदारी के मेल देखने में प्रयोग होता है।',
    aliases: ['Varga', 'Akshar varga', 'name varga'],
  },
  prastarashtakavarga: {
    term: 'Prastarashtakavarga (point-by-point grid)', category: 'strength', hiTerm: 'प्रस्तार अष्टकवर्ग',
    impact: 'Shows exactly which planet gave a point to each house — the “why” behind every Ashtakavarga number.',
    why: 'For one planet, it lays out all eight contributors (seven planets and the Lagna) against the twelve houses; each cell is 1 or 0. Adding a column gives that planet’s Ashtakavarga score for the house.',
    guidance: 'Classical transit timing (Kakshya) uses it: a slow planet gives its best results while passing through the part of a sign whose owner gave a point.',
    hi: 'प्रस्तार अष्टकवर्ग दिखाता है कि किस भाव में किस ग्रह ने बिंदु दिया — हर अष्टकवर्ग अंक का कारण।',
    aliases: ['Prastar Ashtakvarga', 'Prastara', 'Prastarashtakvarga'],
  },
  eastIndianChart: {
    term: 'East Indian chart', category: 'basics', hiTerm: 'पूर्वी भारतीय कुंडली',
    impact: 'The chart style used in Bengal, Odisha and Assam — the same chart, only drawn differently.',
    why: 'Signs stay in fixed places: Aries at the top centre, then running anticlockwise, with the four corners split diagonally into two signs each. Planets are placed in their signs, like the South Indian style.',
    hi: 'पूर्वी भारतीय (बंगाली/ओड़िया) शैली में राशियाँ स्थिर रहती हैं — मेष ऊपर बीच में, फिर वामावर्त; कोनों में दो-दो राशियाँ। कुंडली वही है, केवल चित्र अलग।',
    aliases: ['Bengali chart', 'Oriya chart', 'East Indian style'],
  },
  prashna: {
    term: 'Prashna (horary astrology)', category: 'basics', hiTerm: 'प्रश्न कुंडली',
    impact: 'Answers one specific question from a chart cast for the moment you ask it — no birth time needed.',
    why: 'Classical Prashna reads the Lagna and Moon of the question moment. KP Prashna uses a number from 1 to 249 chosen by the person; each number fixes a Lagna point, and the sub-lords of the relevant houses give a yes or no.',
    guidance: 'Ask one clear question, once. Asking the same question again and again is traditionally not read.',
    hi: 'प्रश्न कुंडली प्रश्न पूछने के क्षण की कुंडली से एक विशिष्ट प्रश्न का उत्तर देती है — जन्म समय की आवश्यकता नहीं।',
    aliases: ['Prashna Kundli', 'Horary', 'KP horary', 'KP Prashna', 'question chart'],
    link: '/prashna/',
  },
};

/**
 * Shared astrology term-definition layer — the ONE glossary for the whole site
 * (Part AI, Part 1; extended in Batch 5 "explain every term", 24 Oct 2026).
 *
 * Every astrology term a user sees in a result (Kundali, matching, Panchang, doshas,
 * Shadbala, divisional charts, yogas, transits, numerology, tarot, gemstones, Chinese
 * zodiac, biorhythm) is defined here once, in plain language a 15-year-old with no
 * astrology background can follow. Three consumers read this one source:
 *   1. <TermTip id="..."> (src/components/vedic/TermTip.tsx) — the (i) popover on result pages.
 *   2. /glossary (src/pages/GlossaryPage.tsx) — searchable A–Z page, one anchor per term.
 *   3. glossInline(id) — a short parenthetical for prose built as strings.
 *
 * WRITING METHOD — impact-first (decided after real user testing):
 *   impact   → what it means for YOU, in plain language (stated FIRST)
 *   why      → what it actually is (second)
 *   guidance → practical "so what" (optional)
 *   learnMore→ one extra sentence for the curious (optional; shown in the glossary)
 *   hi       → the same idea in simple Hindi (1–2 sentences), for the Hindi pages
 *
 * Content rules: calm, never fear-based; a tendency, never a guarantee; no medical
 * claims. Classical facts follow the standard texts (Brihat Parashara Hora Shastra for
 * houses, dashas, Shadbala and vargas; Muhurta Chintamani / standard Panchang practice
 * for the daily limbs and windows; the Ashtakoota and 10-Porutham tables as used by
 * AstroSage and South Indian practice) and match how BornClock's own engine computes them.
 */

export type TermCategory =
  | 'basics' | 'dasha' | 'matching' | 'porutham' | 'panchang' | 'dosha' | 'strength'
  | 'divisional' | 'yoga' | 'transit' | 'gemstone' | 'numerology' | 'tarot' | 'chinese' | 'biorhythm';

export const CATEGORY_LABELS: Record<TermCategory, { en: string; hi: string }> = {
  basics: { en: 'Birth chart basics', hi: 'कुंडली की मूल बातें' },
  dasha: { en: 'Planetary periods (Dasha)', hi: 'दशा' },
  matching: { en: 'Kundali matching (Guna Milan)', hi: 'कुंडली मिलान (गुण मिलान)' },
  porutham: { en: '10 Porutham (South Indian matching)', hi: 'दस पोरुथम (दक्षिण भारतीय मिलान)' },
  panchang: { en: 'Panchang & daily timings', hi: 'पंचांग व मुहूर्त' },
  dosha: { en: 'Doshas', hi: 'दोष' },
  strength: { en: 'Planet strength', hi: 'ग्रह बल' },
  divisional: { en: 'Divisional charts (Vargas)', hi: 'वर्ग कुंडलियाँ' },
  yoga: { en: 'Yogas (planetary combinations)', hi: 'योग' },
  transit: { en: 'Transits & Rashifal', hi: 'गोचर व राशिफल' },
  gemstone: { en: 'Gemstones', hi: 'रत्न' },
  numerology: { en: 'Numerology', hi: 'अंक ज्योतिष' },
  tarot: { en: 'Tarot', hi: 'टैरो' },
  chinese: { en: 'Chinese zodiac', hi: 'चीनी राशि' },
  biorhythm: { en: 'Biorhythm', hi: 'बायोरिदम' },
};

export interface TermDef {
  /** Canonical display term. */
  term: string;
  /** Plain-language impact — what it means for the reader. Stated first. */
  impact: string;
  /** What it technically is. */
  why?: string;
  /** Practical guidance / "so what". */
  guidance?: string;
  /** Optional short parenthetical override for inline prose use. */
  inline?: string;
  /** Glossary grouping. */
  category?: TermCategory;
  /** Hindi (Devanagari) name. */
  hiTerm?: string;
  /** Plain-language Hindi explanation (1–2 sentences). */
  hi?: string;
  /** One optional "learn more" sentence (glossary). */
  learnMore?: string;
  /** Other names people search for (glossary search). */
  aliases?: string[];
  /** A page on the site that goes deeper. */
  link?: string;
}

export const VEDIC_TERMS: Record<string, TermDef> = {
  // ─────────────────────────── Birth chart basics ───────────────────────────
  kundali: {
    term: 'Kundali (birth chart)', category: 'basics', hiTerm: 'कुंडली / जन्म पत्री',
    impact: 'A map of where every planet was at the moment you were born — the starting point for every Vedic reading.',
    why: 'It is drawn from your birth date, exact time and place, and divides the sky into 12 houses, each covering an area of life.',
    hi: 'कुंडली आपके जन्म के समय आकाश में ग्रहों की स्थिति का नक्शा है। इसे जन्म तिथि, समय और स्थान से बनाया जाता है और हर ज्योतिषीय फल इसी से पढ़ा जाता है।',
    aliases: ['Kundli', 'Janam Kundali', 'Janma Patri', 'horoscope', 'birth chart'], link: '/kundali',
  },
  ayanamsa: {
    term: 'Sidereal (Lahiri ayanamsa)', category: 'basics', hiTerm: 'अयनांश (लाहिड़ी)',
    impact: 'This is why your Vedic sign can differ from your usual (Western) one.',
    why: 'Vedic astrology measures planets against the actual fixed stars ("sidereal"), while Western astrology uses the seasons ("tropical"). The two have drifted about 24° apart over the centuries; the correction for that gap is the "ayanamsa", and "Lahiri" is the standard version India uses.',
    guidance: 'It just means your chart is calculated the traditional Indian way — nothing you need to act on.',
    inline: 'the traditional Indian star-based calculation, which is why a Vedic sign can differ from a Western one',
    hi: 'वैदिक ज्योतिष ग्रहों को स्थिर तारों के सापेक्ष मापता है, इसलिए आपकी वैदिक राशि पश्चिमी राशि से अलग हो सकती है। दोनों के बीच लगभग 24° के अंतर को अयनांश कहते हैं; भारत में लाहिड़ी अयनांश मानक है।',
    aliases: ['ayanamsha', 'sidereal', 'Lahiri', 'Chitrapaksha'],
  },
  lagna: {
    term: 'Lagna (Ascendant / rising sign)', category: 'basics', hiTerm: 'लग्न',
    impact: 'Your outward personality and how the world first meets you.',
    why: 'The Lagna is the zodiac sign that was rising on the eastern horizon at the exact moment and place you were born — the anchor the whole chart is read from.',
    guidance: 'Read it together with your Moon sign (your inner, emotional self).',
    inline: 'the sign rising at your birth — your outward self',
    hi: 'लग्न वह राशि है जो आपके जन्म के समय पूर्वी क्षितिज पर उदय हो रही थी। यह आपके बाहरी व्यक्तित्व को दिखाता है और पूरी कुंडली इसी से पढ़ी जाती है।',
    aliases: ['Ascendant', 'rising sign'],
  },
  risingSign: {
    term: 'Rising sign (Ascendant / Lagna)', category: 'basics', hiTerm: 'लग्न राशि',
    impact: 'The "mask" you meet the world with — the third piece of your "Big Three".',
    why: 'The rising sign is the sign coming up on the horizon at your exact birth time and place. Unlike Sun and Moon signs, it needs an accurate birth time.',
    guidance: 'You can compute yours on the Kundli (birth chart) tool.',
    inline: 'the sign on the horizon at birth — your outward "mask"',
    hi: 'जन्म के समय क्षितिज पर उदय हो रही राशि — जिस रूप में दुनिया आपको पहली बार देखती है। इसके लिए सही जन्म समय ज़रूरी है।',
  },
  rashi: {
    term: 'Rashi (Moon sign)', category: 'basics', hiTerm: 'राशि (चंद्र राशि)',
    impact: 'Your emotional nature, instincts and inner life.',
    why: 'The Rashi is the sign the Moon occupied at your birth. In Vedic astrology the Moon sign carries at least as much weight as the Sun sign, and daily Rashifal is read from it.',
    inline: 'your Moon sign — your inner, emotional self',
    hi: 'जन्म के समय चंद्रमा जिस राशि में था, वही आपकी राशि है। यह आपके मन, भावनाओं और स्वभाव को दिखाती है; राशिफल इसी से पढ़ा जाता है।',
    aliases: ['Moon sign', 'Chandra Rashi', 'Rasi'], link: '/moon-sign',
  },
  sunSign: {
    term: 'Sun sign', category: 'basics', hiTerm: 'सूर्य राशि',
    impact: 'The "headline" sign most horoscopes use — your conscious drive and sense of self.',
    why: 'It is the sign the Sun was in on your birthday. Western astrology uses the season-based (tropical) zodiac, so a Western Sun sign is often one sign ahead of the Vedic one.',
    hi: 'जन्मदिन पर सूर्य जिस राशि में था, वह सूर्य राशि है। पश्चिमी ज्योतिष ऋतु-आधारित राशिचक्र मानता है, इसलिए पश्चिमी सूर्य राशि अक्सर वैदिक से एक राशि आगे होती है।',
    aliases: ['zodiac sign', 'star sign'],
  },
  cusp: {
    term: 'Cusp', category: 'basics', hiTerm: 'राशि संधि',
    impact: 'Being born within a day or two of where one sign changes to the next.',
    why: 'Sign boundaries shift by a day or so year to year, so births near a boundary ("on the cusp") can read as either sign — a precise birth time settles it.',
    inline: 'born right at the boundary between two signs',
    hi: 'जब जन्म दो राशियों की सीमा के बहुत पास हो। सटीक जन्म समय से तय होता है कि कौन-सी राशि लागू होगी।',
  },
  nakshatra: {
    term: 'Nakshatra (birth star)', category: 'basics', hiTerm: 'नक्षत्र',
    impact: 'A finer read on your temperament than the sign alone — and the key to your Dasha timeline and matching.',
    why: 'The 27 Nakshatras are lunar mansions — the sky divided into 27 equal parts of 13°20′ that the Moon travels through. Yours is the one the Moon sat in at birth, each with its own deity and "shakti" (special power).',
    inline: 'lunar mansion — a finer division of the sky than the 12 signs',
    hi: 'आकाश को 27 बराबर भागों (नक्षत्रों) में बाँटा गया है। जन्म के समय चंद्रमा जिस नक्षत्र में था वह आपका जन्म नक्षत्र है — इससे स्वभाव, दशा और कुंडली मिलान तय होते हैं।',
    aliases: ['birth star', 'Janma Nakshatra', 'lunar mansion', 'star'], link: '/nakshatra',
  },
  pada: {
    term: 'Pada (quarter)', category: 'basics', hiTerm: 'पद / चरण',
    impact: 'A more precise pinpoint within your birth star — it also gives the traditional first sound for a baby name.',
    why: 'Each Nakshatra is split into four quarters (padas) of 3°20′; your pada narrows down where exactly the Moon fell.',
    inline: 'one of the four quarters of a Nakshatra',
    hi: 'हर नक्षत्र के चार भाग (चरण) होते हैं। आपका चरण बताता है कि चंद्रमा नक्षत्र के किस हिस्से में था; नामकरण का पहला अक्षर भी इसी से लिया जाता है।',
    aliases: ['charan', 'quarter'],
  },
  shakti: {
    term: 'Shakti (a Nakshatra\'s special power)', category: 'basics', hiTerm: 'शक्ति',
    impact: 'The particular gift your birth star is said to carry — a way to understand your natural strengths.',
    why: 'Classical star lore (Taittiriya Brahmana) gives each of the 27 Nakshatras a deity and a "shakti", the power that deity bestows.',
    hi: 'हर नक्षत्र के देवता की विशेष शक्ति — आपकी स्वाभाविक क्षमता को समझने का एक तरीका।',
  },
  graha: {
    term: 'Graha (the nine planets)', category: 'basics', hiTerm: 'ग्रह / नवग्रह',
    impact: 'The nine "players" in your chart — each looks after different parts of life.',
    why: 'Vedic astrology uses nine grahas: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn and the two lunar nodes Rahu and Ketu. (Uranus, Neptune and Pluto are not used.)',
    hi: 'वैदिक ज्योतिष में नौ ग्रह माने जाते हैं: सूर्य, चंद्र, मंगल, बुध, गुरु, शुक्र, शनि, राहु और केतु। हर ग्रह जीवन के अलग क्षेत्रों का कारक है।',
    aliases: ['planets', 'Navagraha'],
  },
  bhava: {
    term: 'Bhava (house)', category: 'basics', hiTerm: 'भाव',
    impact: 'Tells you WHICH area of life a planet affects — e.g. the 7th house is partnership, the 10th is career.',
    why: 'The chart is divided into 12 houses counted from your Lagna (BornClock uses whole-sign houses: one sign = one house). Each house rules a life area: 1 self, 2 money & family, 3 courage & siblings, 4 home & mother, 5 children & creativity, 6 health & rivals, 7 marriage & partners, 8 change & longevity, 9 luck & dharma, 10 career, 11 gains, 12 expenses & letting go.',
    inline: 'a house — one of the 12 life areas of the chart',
    hi: 'कुंडली के 12 भाव जीवन के 12 क्षेत्र हैं (जैसे 7वाँ भाव विवाह, 10वाँ करियर)। ग्रह जिस भाव में बैठा है, उसी क्षेत्र पर उसका असर पड़ता है।',
    aliases: ['house', 'houses'],
  },
  houseFromMoon: {
    term: 'House from your Moon sign', category: 'transit', hiTerm: 'चंद्र से भाव',
    impact: 'How a moving planet affects YOU depends on how many signs it is from your Moon sign — that is why each Moon sign gets a different forecast.',
    why: 'In Rashifal and transits (gochar), your Moon sign is counted as house 1; a planet in the next sign is in your 2nd house, and so on. Each count has a classical meaning.',
    hi: 'राशिफल में आपकी चंद्र राशि को पहला भाव माना जाता है। गोचर का ग्रह उससे जितने घर दूर है, उसी के अनुसार फल पढ़ा जाता है।',
    aliases: ['Chandra Lagna', 'house from the Moon'],
  },
  rahu: {
    term: 'Rahu', category: 'basics', hiTerm: 'राहु',
    impact: 'Your area of hunger and ambition — where you want "more" and can grow fast.',
    why: 'Rahu is not a physical planet but the Moon\'s north node: a point where the Moon\'s path crosses the Sun\'s path (eclipses happen near it). It is always exactly opposite Ketu.',
    hi: 'राहु कोई भौतिक ग्रह नहीं, बल्कि चंद्रमा का उत्तरी पात (छाया ग्रह) है जहाँ ग्रहण होते हैं। यह महत्वाकांक्षा और तेज़ बदलाव का कारक है।',
    aliases: ['north node'],
  },
  ketu: {
    term: 'Ketu', category: 'basics', hiTerm: 'केतु',
    impact: 'Your area of detachment and inner wisdom — things you are naturally good at but care less about.',
    why: 'Ketu is the Moon\'s south node, always exactly opposite Rahu. Like Rahu it is a "shadow planet" (chhaya graha), a calculated point rather than a body.',
    hi: 'केतु चंद्रमा का दक्षिणी पात है, हमेशा राहु के ठीक सामने। यह वैराग्य, आध्यात्म और भीतरी ज्ञान का कारक है।',
    aliases: ['south node'],
  },
  retrograde: {
    term: 'Retrograde (R)', category: 'basics', hiTerm: 'वक्री',
    impact: 'The planet works in a more inward, "revisit and rethink" way for you — not a bad sign.',
    why: 'Seen from Earth, a planet sometimes appears to move backwards for a while — an optical effect of the orbits. The "(R)" mark in the table shows this. The Sun and Moon are never retrograde; Rahu and Ketu almost always move backwards.',
    hi: 'पृथ्वी से देखने पर कभी-कभी कोई ग्रह उल्टा चलता हुआ दिखता है — इसे वक्री (R) कहते हैं। यह अशुभ नहीं है; ऐसा ग्रह भीतर की ओर, दोबारा सोचकर काम करता है।',
    aliases: ['vakri', '(R)', 'retro'],
  },
  planetDegree: {
    term: 'Degrees (position in the sign)', category: 'basics', hiTerm: 'अंश',
    impact: 'Shows exactly how far into its sign a planet is — early, middle or late.',
    why: 'Each sign is 30° wide. "Moon 14°22′" means the Moon is 14 degrees 22 minutes into its sign — about halfway. A planet below 1° or above 29° is near a sign boundary, where a small birth-time error matters most.',
    hi: 'हर राशि 30° की होती है। "चंद्र 14°22′" का अर्थ है चंद्रमा अपनी राशि में 14 अंश 22 कला पर है — लगभग बीच में।',
    aliases: ['degree', 'longitude', 'ansh'],
  },
  northSouthChart: {
    term: 'North and South Indian chart styles', category: 'basics', hiTerm: 'उत्तर व दक्षिण भारतीय कुंडली',
    impact: 'Two ways of drawing the SAME chart — pick whichever your family uses; the results are identical.',
    why: 'In the North Indian (diamond) style the houses stay fixed and the sign numbers move; in the South Indian (square) style the signs stay fixed and the Lagna is marked.',
    hi: 'एक ही कुंडली को बनाने के दो तरीके हैं। उत्तर भारतीय (हीरे जैसी) में भाव स्थिर रहते हैं, दक्षिण भारतीय (चौकोर) में राशियाँ स्थिर रहती हैं — फल एक ही हैं।',
  },
  lagnaLord: {
    term: 'Ascendant lord (Lagna lord)', category: 'basics', hiTerm: 'लग्नेश',
    impact: 'Your chart\'s "captain" — its condition shows your general vitality and direction.',
    why: 'Every sign is ruled by a planet; the planet that rules your rising sign is your Lagna lord. Gemstone advice usually starts from it.',
    hi: 'आपकी लग्न राशि का स्वामी ग्रह लग्नेश कहलाता है। यह कुंडली का "कप्तान" है और रत्न सलाह प्रायः इसी से शुरू होती है।',
    aliases: ['Lagnesh', 'Ascendant ruler', 'chart ruler'],
  },
  kendra: {
    term: 'Kendra (angle house)', category: 'basics', hiTerm: 'केंद्र',
    impact: 'One of the four "power" houses of a chart — planets here act strongly and visibly.',
    why: 'The Kendras are the 1st, 4th, 7th and 10th houses — pillars of strength in the chart.',
    inline: 'an "angle" house (1st/4th/7th/10th) — a power position',
    hi: 'पहला, चौथा, सातवाँ और दसवाँ भाव केंद्र कहलाते हैं। यहाँ बैठे ग्रह मज़बूती से और साफ़ दिखाई देने वाला फल देते हैं।',
  },
  trikona: {
    term: 'Trikona (trine house)', category: 'basics', hiTerm: 'त्रिकोण',
    impact: 'One of the most fortunate, supportive houses of a chart.',
    why: 'The Trikonas are the 1st, 5th and 9th houses — classically the luckiest, most benefic positions.',
    inline: 'a "trine" house (1st/5th/9th) — a fortunate position',
    hi: 'पहला, पाँचवाँ और नवाँ भाव त्रिकोण कहलाते हैं — कुंडली के सबसे शुभ और भाग्यशाली स्थान।',
  },
  yogakaraka: {
    term: 'Yogakaraka', category: 'basics', hiTerm: 'योगकारक',
    impact: 'The single most beneficial planet for your specific rising sign.',
    why: 'A Yogakaraka rules both a Kendra (angle) and a Trikona (trine) house for your Lagna, making it uniquely powerful to strengthen. Not every Lagna has one.',
    inline: 'your single most beneficial planet, ruling both an angle and a trine house',
    hi: 'जो ग्रह आपके लग्न के लिए केंद्र और त्रिकोण दोनों भावों का स्वामी हो, वह योगकारक है — आपकी कुंडली का सबसे शुभ ग्रह।',
  },
  benefic: {
    term: 'Benefic', category: 'basics', hiTerm: 'शुभ ग्रह',
    impact: 'A planet or placement that tends to help and protect.',
    why: 'Jupiter and Venus are the natural benefics; Mercury and a bright (waxing) Moon are usually counted too. "Functional" benefics also depend on your Lagna.',
    hi: 'गुरु और शुक्र स्वाभाविक शुभ ग्रह हैं (बुध और बढ़ता चंद्र भी प्रायः)। ये सहायता और सुरक्षा का संकेत देते हैं।',
  },
  malefic: {
    term: 'Malefic influence', category: 'basics', hiTerm: 'पाप ग्रह',
    impact: 'A planet or period that tends to bring friction — handled consciously, not feared.',
    why: 'In the tradition, Saturn, Mars, Rahu, Ketu (and the Sun to a degree) are classed as "malefic" (challenging) and others "benefic" (supportive) — a description of tendency, not a curse.',
    inline: 'a challenging (vs supportive) planetary tendency',
    hi: 'शनि, मंगल, राहु, केतु को पाप (कठिन) ग्रह कहा जाता है। ये मेहनत और चुनौती दिखाते हैं — श्राप नहीं, केवल प्रवृत्ति।',
  },

  // ─────────────────────────── Dasha ───────────────────────────
  dasha: {
    term: 'Dasha (planetary period)', category: 'dasha', hiTerm: 'दशा',
    impact: 'Which planet is "running the show" in your life right now.',
    why: 'The Vimshottari Dasha system divides your life into planetary periods, each colouring the chapter it rules based on what that planet governs and where it sits in your chart. "Saturn/Mercury" means the Saturn main period with a Mercury sub-period.',
    inline: 'the planetary period currently colouring your life',
    hi: 'दशा बताती है कि अभी आपके जीवन में कौन-सा ग्रह मुख्य भूमिका निभा रहा है। "शनि/बुध" का अर्थ है शनि की महादशा में बुध की अंतर्दशा।',
    aliases: ['planetary period'], link: '/dasha-calculator',
  },
  vimshottari: {
    term: 'Vimshottari Dasha', category: 'dasha', hiTerm: 'विंशोत्तरी दशा',
    impact: 'The standard 120-year timeline used to time events in Vedic astrology.',
    why: 'Nine planetary periods in a fixed order — Ketu 7, Venus 20, Sun 6, Moon 10, Mars 7, Rahu 18, Jupiter 16, Saturn 19, Mercury 17 years. Where you start depends on your birth Nakshatra.',
    hi: '120 वर्ष का दशा चक्र, जिसमें नौ ग्रहों की दशाएँ एक तय क्रम में आती हैं। आपकी पहली दशा जन्म नक्षत्र से तय होती है।',
  },
  mahadasha: {
    term: 'Mahadasha (main period)', category: 'dasha', hiTerm: 'महादशा',
    impact: 'The broad chapter of life you are in, lasting years.',
    why: 'The top-level Dasha period — the biggest brushstroke of the timing system (6 to 20 years depending on the planet).',
    inline: 'the broad, years-long main period',
    hi: 'महादशा जीवन का बड़ा अध्याय है जो ग्रह के अनुसार 6 से 20 वर्ष तक चलता है।',
  },
  antardasha: {
    term: 'Antardasha (sub-period)', category: 'dasha', hiTerm: 'अंतर्दशा',
    impact: 'The shorter sub-chapter inside your main period, running now.',
    why: 'Each Mahadasha is divided into nine Antardashas — a finer layer of timing within the big chapter, lasting months to a few years.',
    inline: 'the sub-period within the main period',
    hi: 'हर महादशा के अंदर नौ छोटी अवधियाँ होती हैं जिन्हें अंतर्दशा कहते हैं — कुछ महीनों से कुछ वर्षों तक।',
    aliases: ['Bhukti'],
  },
  pratyantardasha: {
    term: 'Pratyantardasha (sub-sub-period)', category: 'dasha', hiTerm: 'प्रत्यंतर दशा',
    impact: 'An even finer slice of timing — down to weeks and months.',
    why: 'The third level of the Dasha system: a sub-period within your Antardasha, sharpening the "what is active right now" picture.',
    inline: 'the third, finest Dasha level (weeks–months)',
    hi: 'अंतर्दशा के भीतर का तीसरा स्तर — कुछ सप्ताहों से महीनों तक का समय।',
  },
  sookshma: {
    term: 'Sookshma (subtle period)', category: 'dasha', hiTerm: 'सूक्ष्म दशा',
    impact: 'The fourth Dasha level — a fine window lasting roughly days.',
    why: 'Each Pratyantardasha divides again into nine Sookshma periods. Because these are so short, they are sensitive to the exact birth time.',
    guidance: 'Useful for fine timing, but only as reliable as your recorded birth time — treat it as indicative.',
    inline: 'the fourth Dasha level (about days)',
    hi: 'दशा का चौथा स्तर, लगभग कुछ दिनों का। यह जन्म समय की छोटी गलती से भी बदल सकता है।',
  },
  prana: {
    term: 'Prana (breath period)', category: 'dasha', hiTerm: 'प्राण दशा',
    impact: 'The fifth and finest Dasha level — a window lasting hours.',
    why: 'Each Sookshma divides once more into nine Prana periods, the subtlest layer of Vimshottari timing. At this scale even a few minutes of birth-time error matters.',
    guidance: 'Interesting for the finest timing, but highly birth-time-sensitive — never treat it as a precise prediction.',
    inline: 'the fifth, finest Dasha level (about hours)',
    hi: 'दशा का पाँचवाँ और सबसे सूक्ष्म स्तर, कुछ घंटों का। इसे सटीक भविष्यवाणी न मानें।',
  },

  // ─────────────────────────── Matching (Ashtakoota) ───────────────────────────
  ashtakoota: {
    term: 'Ashtakoota (Guna Milan)', category: 'matching', hiTerm: 'अष्टकूट / गुण मिलान',
    impact: 'The 36-point score behind a Vedic match — 18 or more is the traditional pass mark.',
    why: 'Ashtakoota compares the two Moon signs and birth stars across eight factors ("kootas"), each worth points toward a total of 36. It is read from the boy to the girl, so the order matters.',
    guidance: 'A score is a starting point; doshas, cancellations and the full charts matter too.',
    inline: 'the classical 36-point, 8-factor match score',
    hi: 'आठ कूटों पर आधारित 36 अंकों का मिलान। परंपरा में 18 या अधिक गुण विवाह के लिए स्वीकार्य माने जाते हैं।',
    aliases: ['Guna Milan', 'Gun Milan', 'kundali matching', '36 gunas'], link: '/kundali-match',
  },
  koota: {
    term: 'Koota', category: 'matching', hiTerm: 'कूट',
    impact: 'One of the eight checks in Guna Milan — each looks at a different side of the relationship.',
    why: 'The eight kootas are Varna (1), Vashya (2), Tara (3), Yoni (4), Graha Maitri (5), Gana (6), Bhakoot (7) and Nadi (8) — the numbers are their maximum points.',
    hi: 'गुण मिलान की आठ जाँचों में से एक। वर्ण (1), वश्य (2), तारा (3), योनि (4), ग्रह मैत्री (5), गण (6), भकूट (7), नाड़ी (8)।',
    aliases: ['kuta', 'koot'],
  },
  varna: {
    term: 'Varna (1 point)', category: 'matching', hiTerm: 'वर्ण',
    impact: 'Checks that the two people\'s basic outlook and work-nature sit comfortably together.',
    why: 'The first of the eight kootas. It compares a spiritual/work-nature grouping drawn from each Moon sign; worth 1 of the 36 points.',
    inline: 'the temperament-compatibility koota (1 point)',
    hi: 'पहला कूट (1 अंक) — दोनों की चंद्र राशि से स्वभाव और कार्य-प्रकृति का मेल।',
  },
  vashya: {
    term: 'Vashya (2 points)', category: 'matching', hiTerm: 'वश्य',
    impact: 'How naturally one partner draws and influences the other.',
    why: 'The second koota — mutual attraction and give-and-take, from sign groupings (human, quadruped, water, wild, insect); worth 2 points.',
    inline: 'the mutual-attraction koota (2 points)',
    hi: 'दूसरा कूट (2 अंक) — दोनों के बीच आकर्षण और एक-दूसरे पर प्रभाव।',
  },
  tara: {
    term: 'Tara (3 points)', category: 'matching', hiTerm: 'तारा',
    impact: 'Wellbeing and good fortune for the couple, read from their birth stars.',
    why: 'The third koota counts the distance between the two Nakshatras (birth stars) in both directions; worth 3 points.',
    inline: 'the birth-star fortune koota (3 points)',
    hi: 'तीसरा कूट (3 अंक) — दोनों के जन्म नक्षत्रों की दूरी से भाग्य और कुशलता।',
    aliases: ['Dina'],
  },
  yoni: {
    term: 'Yoni (4 points)', category: 'matching', hiTerm: 'योनि',
    impact: 'Physical and instinctive compatibility.',
    why: 'The fourth koota gives each Nakshatra an animal symbol and scores how well the two animals get along; worth 4 points.',
    inline: 'the physical-compatibility (animal-symbol) koota (4 points)',
    hi: 'चौथा कूट (4 अंक) — हर नक्षत्र का एक पशु प्रतीक होता है; उनके मेल से शारीरिक व सहज अनुकूलता देखी जाती है।',
  },
  grahaMaitri: {
    term: 'Graha Maitri (5 points)', category: 'matching', hiTerm: 'ग्रह मैत्री',
    impact: 'Mental and emotional friendship — how well your minds meet.',
    why: 'The fifth koota compares the friendship between the two Moon-sign lords (ruling planets); worth 5 points.',
    inline: 'the mental-friendship koota, from the sign lords (5 points)',
    hi: 'पाँचवाँ कूट (5 अंक) — दोनों की राशियों के स्वामी ग्रहों की मित्रता, यानी मन का मेल।',
    aliases: ['Rasyadhipati'],
  },
  gana: {
    term: 'Gana (6 points)', category: 'matching', hiTerm: 'गण',
    impact: 'A broad temperament match (gentle / balanced / intense).',
    why: 'The sixth koota sorts each Nakshatra into one of three natures — Deva (gentle), Manushya (human, balanced), Rakshasa (intense, strong-willed) — and scores the pairing; worth 6 points.',
    inline: 'the temperament-nature koota (6 points)',
    hi: 'छठा कूट (6 अंक) — हर नक्षत्र देव, मनुष्य या राक्षस गण का होता है; इनके मेल से स्वभाव की अनुकूलता देखी जाती है।',
  },
  bhakoot: {
    term: 'Bhakoot (7 points)', category: 'matching', hiTerm: 'भकूट',
    impact: 'Overall harmony, prosperity and emotional flow in the relationship.',
    why: 'The seventh koota looks at how many signs apart the two Moon signs are; the 2/12, 5/9 and 6/8 pairings score 0 and are called "Bhakoot dosha". Worth 7 points and weighted heavily.',
    inline: 'the Moon-sign harmony koota (7 points, heavily weighted)',
    hi: 'सातवाँ कूट (7 अंक) — दोनों चंद्र राशियों की दूरी। 2/12, 5/9 या 6/8 की स्थिति में 0 अंक मिलते हैं, इसे भकूट दोष कहते हैं।',
    aliases: ['Rashi koota'],
  },
  nadi: {
    term: 'Nadi (8 points)', category: 'matching', hiTerm: 'नाड़ी',
    impact: 'Traditionally the most important koota — linked with family wellbeing and children.',
    why: 'The eighth koota groups each Nakshatra into one of three Nadis (Aadi / Madhya / Antya); the same Nadi for both scores 0 and is called "Nadi dosha". It carries the most points (8).',
    inline: 'the health/progeny koota — the heaviest at 8 points',
    hi: 'आठवाँ और सबसे भारी कूट (8 अंक)। हर नक्षत्र आदि, मध्य या अंत्य नाड़ी का होता है; दोनों की एक ही नाड़ी हो तो नाड़ी दोष कहलाता है।',
  },
  nadiDosha: {
    term: 'Nadi Dosha', category: 'matching', hiTerm: 'नाड़ी दोष',
    impact: 'Both partners share the same Nadi, so the 8-point Nadi koota scores 0 — the tradition asks you to look closer, not to give up.',
    why: 'Classical texts list exceptions that cancel it (for example the same Moon sign with different birth stars, or the same birth star in different padas). BornClock shows whether any applies.',
    hi: 'जब दोनों की नाड़ी एक हो और नाड़ी कूट में 0 अंक मिलें। शास्त्रों में इसके कई परिहार (रद्द होने की स्थितियाँ) हैं, जो यहाँ दिखाए जाते हैं।',
  },
  bhakootDosha: {
    term: 'Bhakoot Dosha', category: 'matching', hiTerm: 'भकूट दोष',
    impact: 'The two Moon signs sit in a 2/12, 5/9 or 6/8 relationship, so the 7-point Bhakoot koota scores 0.',
    why: 'Traditionally it is softened when the two sign lords are the same planet or friends. It is one factor among many, not a verdict on the relationship.',
    hi: 'जब दोनों चंद्र राशियाँ 2/12, 5/9 या 6/8 की दूरी पर हों। राशि स्वामी एक हों या मित्र हों तो यह दोष कमज़ोर माना जाता है।',
  },
  ganaDosha: {
    term: 'Gana Dosha', category: 'matching', hiTerm: 'गण दोष',
    impact: 'One partner\'s birth star is "Rakshasa" (intense) and the other\'s is not — a difference in pace and temperament to talk about openly.',
    why: 'It lowers the 6-point Gana koota. Many traditions cancel it when Graha Maitri (mind-match) or Bhakoot is strong.',
    hi: 'जब एक का गण राक्षस हो और दूसरे का नहीं। ग्रह मैत्री या भकूट अच्छा हो तो यह दोष कम माना जाता है।',
  },
  doshaCancellation: {
    term: 'Dosha cancellation (Parihara)', category: 'matching', hiTerm: 'दोष परिहार',
    impact: 'A classical rule that switches off or softens a dosha — so "dosha present" does not automatically mean a problem.',
    why: 'Texts on matching and Manglik list specific conditions (sign lords, birth stars, planet placements) under which a dosha is treated as cancelled. BornClock shows each one it checks.',
    hi: 'परिहार वह शास्त्रीय नियम है जिससे कोई दोष रद्द या हल्का हो जाता है। इसलिए "दोष है" का अर्थ हमेशा समस्या नहीं होता।',
    aliases: ['parihara', 'parihar', 'cancelled'],
  },
  matchDirection: {
    term: 'Boy / girl order in matching', category: 'matching', hiTerm: 'वर-कन्या क्रम',
    impact: 'Swapping who is the boy and who is the girl can change the score — so choose them correctly.',
    why: 'Some kootas (Varna, Vashya, Tara, Yoni and Bhakoot in parts) are counted from the boy\'s star or sign to the girl\'s, following AstroSage and classical practice.',
    hi: 'कुछ कूट वर से कन्या की ओर गिने जाते हैं, इसलिए वर और कन्या बदलने से अंक बदल सकते हैं।',
  },

  // ─────────────────────────── 10 Porutham ───────────────────────────
  porutham: {
    term: '10 Porutham', category: 'porutham', hiTerm: 'दस पोरुथम',
    impact: 'The South Indian (Tamil) way of matching — ten yes/no checks instead of a 36-point score.',
    why: 'Each porutham is either met or not met. Rajju and Dina are treated as the essential ones; the rest add support.',
    hi: 'दक्षिण भारत की मिलान पद्धति — 36 अंक के बजाय दस हाँ/ना जाँचें। रज्जु और दिन सबसे ज़रूरी माने जाते हैं।',
    aliases: ['Porutham', 'Poruthams', 'Thirumana Porutham', 'Dasa Porutham'],
  },
  dinaPorutham: {
    term: 'Dina Porutham', category: 'porutham', hiTerm: 'दिन पोरुथम',
    impact: 'Day-to-day wellbeing and harmony of the couple — one of the two essential checks.',
    why: 'Counted from the girl\'s birth star to the boy\'s; certain counts are favourable.',
    hi: 'दंपति के रोज़मर्रा के स्वास्थ्य और सामंजस्य की जाँच — दो सबसे ज़रूरी पोरुथम में से एक।',
  },
  ganaPorutham: {
    term: 'Gana Porutham', category: 'porutham', hiTerm: 'गण पोरुथम',
    impact: 'Whether your temperaments (gentle / balanced / intense) suit each other.',
    why: 'The same Deva / Manushya / Rakshasa grouping as the Gana koota; a Rakshasa–non-Rakshasa pair is the classic gap.',
    hi: 'स्वभाव (देव, मनुष्य, राक्षस गण) का मेल।',
  },
  mahendraPorutham: {
    term: 'Mahendra Porutham', category: 'porutham', hiTerm: 'महेंद्र पोरुथम',
    impact: 'Growth of the family and lasting prosperity.',
    why: 'Met when the boy\'s star is a favourable count (4, 7, 10, 13, 16, 19, 22 or 25) from the girl\'s.',
    hi: 'परिवार की वृद्धि और स्थायी समृद्धि — वर का नक्षत्र कन्या के नक्षत्र से शुभ गिनती पर हो।',
  },
  streeDeerghaPorutham: {
    term: 'Stree Deergha Porutham', category: 'porutham', hiTerm: 'स्त्री दीर्घ पोरुथम',
    impact: 'Wellbeing and prosperity of the bride in the marriage.',
    why: 'Met when the boy\'s star is well beyond the girl\'s (more than 9 stars away in BornClock\'s rule).',
    hi: 'वधू की कुशलता और समृद्धि — वर का नक्षत्र कन्या के नक्षत्र से पर्याप्त दूरी पर हो।',
  },
  yoniPorutham: {
    term: 'Yoni Porutham', category: 'porutham', hiTerm: 'योनि पोरुथम',
    impact: 'Physical and instinctive closeness.',
    why: 'Uses the same Nakshatra animal symbols as the Yoni koota; natural enemy animals do not match.',
    hi: 'शारीरिक व सहज निकटता — नक्षत्रों के पशु प्रतीकों का मेल।',
  },
  rasiPorutham: {
    term: 'Rasi Porutham', category: 'porutham', hiTerm: 'राशि पोरुथम',
    impact: 'Emotional and material harmony from the two Moon signs.',
    why: 'Some Moon-sign distances are treated as adverse, similar to Bhakoot in North Indian matching.',
    hi: 'दोनों चंद्र राशियों से भावनात्मक और भौतिक सामंजस्य।',
  },
  rasyadhipathiPorutham: {
    term: 'Rasyadhipathi Porutham', category: 'porutham', hiTerm: 'राश्यधिपति पोरुथम',
    impact: 'Mental rapport — whether your Moon-sign lords are friends.',
    why: 'Like Graha Maitri: friendly or neutral sign lords meet it; mutual enemies do not.',
    hi: 'मानसिक तालमेल — दोनों राशियों के स्वामी ग्रह मित्र हैं या नहीं।',
  },
  vasyaPorutham: {
    term: 'Vasya Porutham', category: 'porutham', hiTerm: 'वश्य पोरुथम',
    impact: 'Mutual attraction and affection.',
    why: 'Met when one Moon sign is "vasya" (drawn) to the other in the standard table.',
    hi: 'आपसी आकर्षण और स्नेह।',
  },
  rajjuPorutham: {
    term: 'Rajju Porutham', category: 'porutham', hiTerm: 'रज्जु पोरुथम',
    impact: 'The strength and long life of the marriage bond — the most important porutham in South Indian practice.',
    why: 'The 27 stars are grouped into five "rajjus" (foot, waist, navel, neck, head). Both stars in the same rajju is called Rajju dosha, an area the tradition asks you to weigh carefully.',
    hi: 'विवाह बंधन की मज़बूती — दक्षिण भारतीय परंपरा में सबसे महत्वपूर्ण। दोनों नक्षत्र एक ही रज्जु में हों तो रज्जु दोष माना जाता है।',
  },
  vedhaPorutham: {
    term: 'Vedha Porutham', category: 'porutham', hiTerm: 'वेध पोरुथम',
    impact: 'Freedom from mutual "blocking" between the two birth stars.',
    why: 'Certain pairs of stars are classed as obstructing (vedha) each other; the check is met when your pair is not one of them.',
    hi: 'दोनों नक्षत्र आपस में "वेध" (बाधक) जोड़ी न हों।',
  },

  // ─────────────────────────── Panchang ───────────────────────────
  panchang: {
    term: 'Panchang (the five limbs)', category: 'panchang', hiTerm: 'पंचांग',
    impact: 'The traditional Hindu almanac that tells you how favourable a day is.',
    why: 'It combines five daily "limbs" — Tithi (lunar day), Nakshatra (star), Yoga, Karana and Vara (weekday) — and adds daily windows like Rahu Kaal and Abhijit.',
    inline: 'the Hindu almanac of five daily factors that rates a day',
    hi: 'पंचांग पाँच अंगों — तिथि, नक्षत्र, योग, करण और वार — से बना हिंदू कैलेंडर है जो बताता है कि दिन कितना शुभ है।',
    link: '/panchang',
  },
  tithi: {
    term: 'Tithi (lunar day)', category: 'panchang', hiTerm: 'तिथि',
    impact: 'Which day of the Moon\'s cycle it is — festivals, fasts and new starts are planned by it.',
    why: 'A Tithi is each 12° the Moon moves ahead of the Sun, so there are 30 per lunar month and their length varies (about 19–26 hours). The 4th, 9th and 14th ("Rikta") and Amavasya are traditionally avoided for beginnings.',
    inline: 'the lunar day; certain ones favour new starts',
    hi: 'चंद्रमा के सूर्य से हर 12° आगे बढ़ने पर एक तिथि बनती है; एक चंद्र मास में 30 तिथियाँ। व्रत, त्योहार और शुभ कार्य तिथि से तय होते हैं।',
    aliases: ['lunar day', 'Thithi'],
  },
  paksha: {
    term: 'Paksha (lunar fortnight)', category: 'panchang', hiTerm: 'पक्ष',
    impact: 'Whether the Moon is waxing (growing) or waning (shrinking).',
    why: 'Each lunar month has two Pakshas: Shukla (the bright, waxing half, new Moon → full Moon) and Krishna (the dark, waning half, full Moon → new Moon). Many timings favour the waxing Shukla Paksha.',
    inline: 'the waxing (Shukla) or waning (Krishna) half of the lunar month',
    hi: 'शुक्ल पक्ष में चंद्रमा बढ़ता है (अमावस्या से पूर्णिमा), कृष्ण पक्ष में घटता है (पूर्णिमा से अमावस्या)। शुभ कार्यों के लिए प्रायः शुक्ल पक्ष पसंद किया जाता है।',
    aliases: ['Shukla Paksha', 'Krishna Paksha', 'fortnight'],
  },
  purnima: {
    term: 'Purnima (full Moon)', category: 'panchang', hiTerm: 'पूर्णिमा',
    impact: 'The full-Moon day — many festivals and vrats fall on it.',
    why: 'The 15th Tithi of Shukla Paksha, when the Moon is opposite the Sun.',
    hi: 'शुक्ल पक्ष की 15वीं तिथि, जब चंद्रमा पूर्ण होता है। कई व्रत-त्योहार इसी दिन होते हैं।',
    aliases: ['Poornima', 'full moon'],
  },
  amavasya: {
    term: 'Amavasya (new Moon)', category: 'panchang', hiTerm: 'अमावस्या',
    impact: 'The new-Moon day — traditionally kept for prayers to ancestors rather than new beginnings.',
    why: 'The last Tithi of Krishna Paksha, when the Moon is beside the Sun and not visible.',
    hi: 'कृष्ण पक्ष की अंतिम तिथि, जब चंद्रमा दिखाई नहीं देता। इसे पितरों के तर्पण के लिए माना जाता है, नए कार्य की शुरुआत के लिए नहीं।',
    aliases: ['new moon', 'Amavas'],
  },
  ekadashi: {
    term: 'Ekadashi', category: 'panchang', hiTerm: 'एकादशी',
    impact: 'The 11th lunar day — a popular day for fasting and Vishnu worship.',
    why: 'It comes twice a month, once in each Paksha.',
    hi: 'हर पक्ष की 11वीं तिथि — व्रत और विष्णु पूजा का लोकप्रिय दिन।',
  },
  panchangNakshatra: {
    term: 'Nakshatra (of the day)', category: 'panchang', hiTerm: 'दिन का नक्षत्र',
    impact: 'The star the Moon is passing through today — some stars suit new starts, travel or ceremonies better than others.',
    why: 'The Moon moves through one of the 27 Nakshatras roughly every day, so the day\'s Nakshatra changes about once a day.',
    hi: 'आज चंद्रमा जिस नक्षत्र से गुज़र रहा है। कुछ नक्षत्र नए कार्य, यात्रा या संस्कार के लिए ज़्यादा शुभ माने जाते हैं।',
  },
  panchangYoga: {
    term: 'Yoga (Panchang limb)', category: 'panchang', hiTerm: 'योग (पंचांग)',
    impact: 'One of the five daily factors that grades a date — different from a birth-chart Yoga.',
    why: 'In the Panchang, "Yoga" comes from adding the Sun\'s and Moon\'s positions; the total is split into 27 named Yogas (Vishkambha … Vaidhriti). A few, such as Vyatipata and Vaidhriti, are traditionally avoided.',
    inline: 'a daily Sun-plus-Moon combination (one of the almanac\'s five factors)',
    hi: 'सूर्य और चंद्रमा की स्थितियों को जोड़कर 27 योग बनते हैं (विष्कुम्भ से वैधृति तक)। यह जन्म कुंडली के योग से अलग है।',
    aliases: ['Nitya Yoga'],
  },
  karana: {
    term: 'Karana (half lunar day)', category: 'panchang', hiTerm: 'करण',
    impact: 'A half-Tithi that fine-tunes the day\'s quality — mainly so you can avoid Vishti (Bhadra).',
    why: 'Each Tithi has two Karanas (6° of Moon–Sun distance each). There are 11 Karanas: 7 that repeat and 4 fixed ones.',
    hi: 'तिथि का आधा भाग करण कहलाता है; कुल 11 करण होते हैं। मुख्य रूप से विष्टि (भद्रा) करण से बचने के लिए इसे देखा जाता है।',
  },
  bhadra: {
    term: 'Vishti Karana (Bhadra)', category: 'panchang', hiTerm: 'विष्टि करण (भद्रा)',
    impact: 'A Karana traditionally avoided for auspicious starts such as weddings or Raksha Bandhan rituals.',
    why: 'Vishti is one of the seven repeating Karanas; when it runs is shown in the Karana box.',
    hi: 'विष्टि करण को भद्रा कहते हैं; विवाह या रक्षाबंधन जैसे शुभ कार्य इसमें टाले जाते हैं।',
    aliases: ['Bhadra', 'Vishti'],
  },
  vara: {
    term: 'Vara (weekday)', category: 'panchang', hiTerm: 'वार',
    impact: 'The weekday, each ruled by a planet — used to choose days for particular tasks and fasts.',
    why: 'Sunday–Sun, Monday–Moon, Tuesday–Mars, Wednesday–Mercury, Thursday–Jupiter, Friday–Venus, Saturday–Saturn. In the Panchang a day runs from sunrise to sunrise.',
    hi: 'सप्ताह का दिन; हर वार का एक स्वामी ग्रह है (रविवार–सूर्य … शनिवार–शनि)। पंचांग में दिन सूर्योदय से सूर्योदय तक माना जाता है।',
    aliases: ['weekday', 'Var'],
  },
  rahuKalam: {
    term: 'Rahu Kaal', category: 'panchang', hiTerm: 'राहु काल',
    impact: 'A roughly 90-minute window each day traditionally avoided for starting anything important.',
    why: 'Daylight is split into eight equal parts and one of them, fixed by the weekday, is Rahu Kaal — so its timing shifts with your city\'s sunrise and sunset.',
    guidance: 'Simply schedule new starts around it; work already in progress can carry on.',
    inline: 'a daily ~90-minute window traditionally avoided',
    hi: 'हर दिन लगभग 90 मिनट का समय जिसमें नया महत्वपूर्ण कार्य शुरू नहीं किया जाता। यह दिन के आठ भागों में से एक है और शहर के सूर्योदय-सूर्यास्त पर निर्भर करता है।',
    aliases: ['Rahu Kalam', 'Rahukaal', 'Rahu Kalam time'],
  },
  gulikaKaal: {
    term: 'Gulika Kaal', category: 'panchang', hiTerm: 'गुलिक काल',
    impact: 'A daily window ruled by Gulika (Saturn\'s son); tradition says what you start in it tends to repeat — so it is avoided for things you would not want to repeat.',
    why: 'Like Rahu Kaal, it is one of the eight equal parts of daylight, chosen by the weekday.',
    hi: 'शनि पुत्र गुलिक का काल। मान्यता है कि इसमें किया गया कार्य दोहराया जाता है, इसलिए अप्रिय कार्य इसमें टाले जाते हैं।',
    aliases: ['Gulikai', 'Gulika Kalam', 'Gulik Kaal'],
  },
  yamaganda: {
    term: 'Yamaganda', category: 'panchang', hiTerm: 'यमगण्ड',
    impact: 'Another daily window traditionally avoided for starting new work or journeys.',
    why: 'One of the eight equal parts of daylight, chosen by the weekday, associated with Yama.',
    hi: 'दिन का एक और भाग जिसमें नया कार्य या यात्रा शुरू करना टाला जाता है।',
    aliases: ['Yamagandam', 'Yamaghanta'],
  },
  abhijit: {
    term: 'Abhijit Muhurta', category: 'panchang', hiTerm: 'अभिजित मुहूर्त',
    impact: 'About 48 minutes around local midday, traditionally one of the most auspicious times of the day.',
    why: 'Daylight is divided into 15 muhurtas; the 8th, centred on local noon, is Abhijit. Many traditions skip it on Wednesdays.',
    hi: 'स्थानीय दोपहर के आसपास लगभग 48 मिनट का समय, दिन के सबसे शुभ समयों में से एक। कई परंपराओं में बुधवार को इसे नहीं लिया जाता।',
    aliases: ['Abhijit', 'Abhijeet'],
  },
  brahmaMuhurta: {
    term: 'Brahma Muhurta', category: 'panchang', hiTerm: 'ब्रह्म मुहूर्त',
    impact: 'The quiet stretch of roughly 45–55 minutes before dawn, traditionally valued for prayer, meditation and study.',
    why: 'The night (sunset to sunrise) is divided into 15 equal muhurtas; Brahma Muhurta is the 14th — it starts two night-muhurtas before sunrise and ends one night-muhurta before sunrise, so it shifts with your city and season.',
    hi: 'सूर्योदय से पहले लगभग 45–55 मिनट का शांत समय, जिसे पूजा, ध्यान और अध्ययन के लिए श्रेष्ठ माना जाता है। रात के 15 मुहूर्तों में यह 14वाँ मुहूर्त है।',
    aliases: ['Brahma Muhurat', 'Brahm Muhurt'],
  },
  durMuhurtam: {
    term: 'Dur Muhurtam', category: 'panchang', hiTerm: 'दुर्मुहूर्त',
    impact: 'One or two short windows (about 45 minutes each) that tradition avoids for auspicious starts such as ceremonies or signing something important.',
    why: 'Daylight is divided into 15 equal muhurtas, and which of them are "Dur" (unfavourable) is fixed by the weekday — for example the 14th on Sunday, the 9th and 12th on Monday. On Tuesday the second one falls after sunset.',
    guidance: 'Simply plan new starts outside it; ongoing work is fine.',
    hi: 'दिन के एक या दो छोटे समय (लगभग 45 मिनट), जिनमें शुभ कार्य शुरू करना टाला जाता है। दिन के 15 मुहूर्तों में से कौन-सा दुर्मुहूर्त होगा, यह वार से तय होता है।',
    aliases: ['Durmuhurtham', 'Dur Muhurat', 'Durmuhurta'],
  },
  varjyam: {
    term: 'Varjyam', category: 'panchang', hiTerm: 'वर्ज्यम्',
    impact: 'A window of roughly 80–110 minutes, traditionally avoided for new beginnings.',
    why: 'Each Nakshatra (the Moon\'s star) lasts about a day. Inside it, a stretch of 4 ghatis — one-fifteenth of that Nakshatra\'s length — starting at a fixed point that depends on the Nakshatra is called Varjyam (or Tyajyam, "to be left out"). Mula has two such stretches.',
    guidance: 'Plan new starts around it; routine work can carry on.',
    hi: 'लगभग 80–110 मिनट का समय, जिसमें नए कार्य की शुरुआत टाली जाती है। हर नक्षत्र के भीतर एक तय स्थान से 4 घटी (नक्षत्र की अवधि का 1/15 भाग) का समय वर्ज्यम् (त्याज्य) कहलाता है।',
    aliases: ['Tyajyam', 'Thyajyam', 'Varjyam time'],
  },
  amritKalam: {
    term: 'Amrit Kalam', category: 'panchang', hiTerm: 'अमृत काल',
    impact: 'A window of roughly 80–110 minutes considered favourable — a good time to begin something you care about.',
    why: 'Like Varjyam, it is a stretch of 4 ghatis (one-fifteenth of the Nakshatra\'s length) at a fixed point inside each Nakshatra — the "nectar" portion of that star.',
    hi: 'लगभग 80–110 मिनट का शुभ समय। हर नक्षत्र के भीतर एक तय स्थान से 4 घटी का समय अमृत काल कहलाता है।',
    aliases: ['Amrit Kaal', 'Amrita Kalam', 'Amrita Gadiya'],
  },
  choghadiya: {
    term: 'Choghadiya', category: 'panchang', hiTerm: 'चौघड़िया',
    impact: 'An easy, slot-by-slot "good time / avoid" guide for the day and night.',
    why: 'Daytime (sunrise to sunset) and night are each split into eight slots. Amrit, Shubh and Labh are good; Char is fine (especially for travel); Udveg, Kaal and Rog are avoided for new starts.',
    inline: 'a slot-by-slot good/bad-time breakdown of a day',
    hi: 'दिन और रात को आठ-आठ भागों में बाँटा जाता है। अमृत, शुभ, लाभ अच्छे; चर सामान्य (यात्रा के लिए ठीक); उद्वेग, काल, रोग में नया कार्य टाला जाता है।',
    aliases: ['Chogadiya', 'Choghadia'],
  },
  choghAmrit: {
    term: 'Amrit (Choghadiya)', category: 'panchang', hiTerm: 'अमृत',
    impact: 'The best Choghadiya slot — good for any important start.',
    why: 'Ruled by the Moon.', hi: 'सबसे शुभ चौघड़िया — किसी भी शुभ कार्य के लिए। स्वामी: चंद्र।',
  },
  choghShubh: {
    term: 'Shubh (Choghadiya)', category: 'panchang', hiTerm: 'शुभ',
    impact: 'An auspicious slot — good for ceremonies, learning and new starts.',
    why: 'Ruled by Jupiter.', hi: 'शुभ चौघड़िया — संस्कार, विद्या और नए कार्य के लिए अच्छा। स्वामी: गुरु।',
  },
  choghLabh: {
    term: 'Labh (Choghadiya)', category: 'panchang', hiTerm: 'लाभ',
    impact: '"Gain" — a good slot for business, buying and money matters.',
    why: 'Ruled by Mercury.', hi: 'लाभ चौघड़िया — व्यापार, ख़रीदारी और धन संबंधी कार्यों के लिए अच्छा। स्वामी: बुध।',
  },
  choghChar: {
    term: 'Char (Choghadiya)', category: 'panchang', hiTerm: 'चर',
    impact: '"Moving" — a neutral slot, considered fine for travel.',
    why: 'Ruled by Venus.', hi: 'चर चौघड़िया — सामान्य; यात्रा के लिए ठीक। स्वामी: शुक्र।',
  },
  choghUdveg: {
    term: 'Udveg (Choghadiya)', category: 'panchang', hiTerm: 'उद्वेग',
    impact: '"Restlessness" — usually avoided for new starts (government work is the traditional exception).',
    why: 'Ruled by the Sun.', hi: 'उद्वेग चौघड़िया — नए कार्य के लिए प्रायः टाला जाता है। स्वामी: सूर्य।',
  },
  choghKaal: {
    term: 'Kaal (Choghadiya)', category: 'panchang', hiTerm: 'काल',
    impact: 'Avoided for new starts.',
    why: 'Ruled by Saturn.', hi: 'काल चौघड़िया — नए कार्य के लिए टाला जाता है। स्वामी: शनि।',
  },
  choghRog: {
    term: 'Rog (Choghadiya)', category: 'panchang', hiTerm: 'रोग',
    impact: 'Avoided for new starts.',
    why: 'Ruled by Mars.', hi: 'रोग चौघड़िया — नए कार्य के लिए टाला जाता है। स्वामी: मंगल।',
  },
  hora: {
    term: 'Hora', category: 'panchang', hiTerm: 'होरा',
    impact: 'The planetary "hour" — which planet rules a given hour of the day, used to fine-tune timing.',
    why: 'Starting at sunrise with the weekday\'s own planet, each hour is ruled by one of seven planets in a fixed cycle (Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars).',
    inline: 'the planetary ruler of an hour',
    hi: 'सूर्योदय से हर घंटे का एक स्वामी ग्रह होता है; इसे होरा कहते हैं और कार्य के अनुसार सही घंटा चुनने में इसका उपयोग होता है।',
  },
  muhurat: {
    term: 'Muhurat', category: 'panchang', hiTerm: 'मुहूर्त',
    impact: 'A well-chosen time to begin something important, like a wedding, griha pravesh or new business.',
    why: 'A muhurat is picked by checking the Panchang (Tithi, Nakshatra, Yoga, Karana, weekday) and avoiding windows like Rahu Kaal.',
    hi: 'किसी महत्वपूर्ण कार्य (विवाह, गृह प्रवेश, व्यापार) को शुरू करने के लिए चुना गया शुभ समय।',
    aliases: ['Muhurta', 'Muhurtham', 'auspicious time'], link: '/muhurat',
  },
  chandrashtama: {
    term: 'Chandrashtama', category: 'panchang', hiTerm: 'चंद्राष्टम',
    impact: 'About two days a month when the Moon is in a spot that classically feels off for you personally.',
    why: 'Chandrashtama is when the moving Moon is in the 8th sign from your birth Moon — a personal, chart-specific caution (needs your birth details).',
    inline: 'personal days when the Moon sits 8th from your birth Moon',
    hi: 'हर महीने लगभग दो दिन जब गोचर का चंद्रमा आपकी जन्म राशि से 8वीं राशि में होता है — व्यक्तिगत सावधानी के दिन।',
  },

  // ─────────────────────────── Doshas ───────────────────────────
  dosha: {
    term: 'Dosha (area to be mindful of)', category: 'dosha', hiTerm: 'दोष',
    impact: 'A classical pattern worth handling consciously — not a curse or a verdict.',
    why: 'A "dosha" flags a placement the tradition treats as needing awareness; many have classical cancellations that soften them.',
    inline: 'a classical pattern to be mindful of, not a verdict',
    hi: 'दोष कुंडली का वह योग है जिस पर ध्यान देने की सलाह दी जाती है — यह श्राप या अंतिम फ़ैसला नहीं है; कई दोषों के परिहार भी होते हैं।',
  },
  manglik: {
    term: 'Manglik (Mangal / Kuja Dosha)', category: 'dosha', hiTerm: 'मांगलिक (मंगल दोष)',
    impact: 'A Mars placement that mainly matters for marriage matching — and is often cancelled.',
    why: 'Manglik is Mars in the 1st, 4th, 7th, 8th or 12th house from the Lagna or from the Moon (BornClock checks both, as AstroSage does, and shows each). Positive from both checks is "High", from one is "Low".',
    guidance: 'It is one factor among many, not a barrier by itself.',
    inline: 'a Mars placement relevant to marriage matching, often cancelled',
    hi: 'जब मंगल लग्न या चंद्रमा से 1, 4, 7, 8 या 12वें भाव में हो। दोनों से हो तो "उच्च", एक से हो तो "निम्न"। यह विवाह मिलान में देखा जाता है और अक्सर इसका परिहार हो जाता है।',
    aliases: ['Mangal Dosha', 'Kuja Dosha', 'Mangalik', 'Chevvai Dosham'], link: '/manglik',
  },
  manglikParihara: {
    term: 'Manglik cancellation (parihara)', category: 'dosha', hiTerm: 'मंगल दोष परिहार',
    impact: 'Conditions under which Manglik is treated as cancelled or much weaker.',
    why: 'Common classical ones: both partners Manglik, Mars in its own or exalted sign, Jupiter or Venus aspecting Mars, or (by a popular rule) age 28 and above.',
    hi: 'जिन स्थितियों में मंगल दोष रद्द या कमज़ोर माना जाता है — जैसे दोनों मांगलिक हों, मंगल स्वराशि/उच्च का हो, या उस पर गुरु/शुक्र की दृष्टि हो।',
  },
  kaalsarp: {
    term: 'Kaal Sarp Dosha', category: 'dosha', hiTerm: 'कालसर्प दोष',
    impact: 'A chart pattern some feel as extra effort before things click — held calmly, not feared.',
    why: 'It forms when all seven main planets sit on one side of the Rahu–Ketu axis, strictly between them by degree. It is a permanent, structural feature (no start/end dates), traditionally felt most in Rahu/Ketu periods.',
    guidance: 'Treat it as a theme to work with consciously, not a disaster — many successful people have it.',
    inline: 'all planets on one side of the Rahu–Ketu axis — a structural theme, not a verdict',
    hi: 'जब सातों ग्रह राहु और केतु के बीच एक ही ओर हों। यह स्थायी योग है; इसे डर के बजाय धैर्य से समझने का विषय मानें।',
    aliases: ['Kalsarp', 'Kaal Sarp Yoga'], link: '/kaal-sarp-dosha',
  },
  kaalSarpType: {
    term: 'Kaal Sarp type (Anant, Kulik … Sheshnag)', category: 'dosha', hiTerm: 'कालसर्प के प्रकार',
    impact: 'Names WHICH life areas the pattern touches most.',
    why: 'There are 12 named types, set by the house Rahu occupies counted from the Lagna (Rahu in the 1st = Anant, 2nd = Kulik, and so on to Sheshnag in the 12th).',
    hi: 'राहु लग्न से जिस भाव में है, उससे 12 प्रकार बनते हैं (अनंत, कुलिक … शेषनाग)। यह बताता है कि कौन-से जीवन क्षेत्र अधिक प्रभावित हैं।',
  },
  partialKaalSarp: {
    term: 'Partial Kaal Sarp (note only)', category: 'dosha', hiTerm: 'आंशिक कालसर्प',
    impact: 'Your planets come close to the pattern but at least one lies outside — by the standard definition, there is NO Kaal Sarp Dosha.',
    why: 'Some astrologers still mention a "partial" Kaal Sarp; BornClock shows it only as a soft note.',
    hi: 'ग्रह लगभग राहु-केतु के बीच हैं पर कम से कम एक बाहर है — मानक परिभाषा से कालसर्प दोष नहीं है।',
  },
  sadeSati: {
    term: 'Sade Sati', category: 'dosha', hiTerm: 'साढ़े साती',
    impact: 'Saturn\'s roughly 7.5-year passage many look back on as foundation-building.',
    why: 'It runs while Saturn moves through the sign before, the sign of, and the sign after your Moon sign (about 2.5 years each) — themes of discipline, patience and long-term reward.',
    inline: 'Saturn\'s ~7.5-year passage around your Moon sign',
    hi: 'जब शनि आपकी चंद्र राशि से पिछली, उसी और अगली राशि से गुज़रता है — लगभग साढ़े सात वर्ष। यह धैर्य, अनुशासन और मज़बूत नींव बनाने का समय माना जाता है।',
    aliases: ['Sadesati', 'Shani Sade Sati'], link: '/sade-sati',
  },
  sadeSatiPhase: {
    term: 'Sade Sati phase (rising / peak / setting)', category: 'dosha', hiTerm: 'साढ़े साती का चरण',
    impact: 'Tells you which third of Sade Sati you are in, and so which themes are most active.',
    why: 'Rising: Saturn in the 12th sign from your Moon. Peak: in your Moon sign itself. Setting: in the 2nd sign. Each lasts about 2.5 years; Saturn\'s retrograde loops can briefly pause it.',
    hi: 'प्रथम (12वीं राशि), मध्य/शिखर (आपकी अपनी राशि) और अंतिम (दूसरी राशि) चरण — हर एक लगभग ढाई वर्ष।',
  },
  dhaiya: {
    term: 'Dhaiya (small Panoti)', category: 'dosha', hiTerm: 'ढैय्या (लघु पनौती)',
    impact: 'A shorter, lighter cousin of Sade Sati.',
    why: 'A 2.5-year Saturn transit through the 4th or 8th sign from your Moon — a milder version of Sade Sati\'s themes.',
    inline: 'a 2.5-year, lighter Saturn phase (4th/8th from the Moon)',
    hi: 'जब शनि आपकी चंद्र राशि से चौथी या आठवीं राशि में हो — ढाई वर्ष का, साढ़े साती से हल्का समय।',
    aliases: ['Dhaiyya', 'Panoti', 'Kantaka Shani', 'Ashtama Shani'],
  },
  pitraDosha: {
    term: 'Pitra Dosha', category: 'dosha', hiTerm: 'पितृ दोष',
    impact: 'A classical pattern linked with ancestors — traditionally a reminder to honour your family line.',
    why: 'BornClock reads it from the Sun with Rahu, Rahu in the 9th house, or the Sun in the 9th with Saturn or Rahu (9th = father and ancestors).',
    hi: 'पूर्वजों से जुड़ा शास्त्रीय योग — परिवार और पितरों का सम्मान करने की याद दिलाता है। सूर्य-राहु युति या नवम भाव में राहु आदि से देखा जाता है।',
    aliases: ['Pitru Dosha', 'Pitri Dosha'], link: '/pitra-dosha',
  },
  moolDosha: {
    term: 'Mool (Gandmool) Nakshatra', category: 'dosha', hiTerm: 'मूल / गंडमूल नक्षत्र',
    impact: 'Being born in one of six "junction" stars, for which families traditionally do a simple Mool Shanti puja — a custom, not a misfortune.',
    why: 'The six are Ashwini, Ashlesha, Magha, Jyeshtha, Mula and Revati — where a water sign meets a fire sign.',
    hi: 'अश्विनी, आश्लेषा, मघा, ज्येष्ठा, मूल और रेवती में जन्म। परंपरा में मूल शांति पूजा की जाती है — यह रिवाज़ है, दुर्भाग्य नहीं।',
    aliases: ['Gandmool', 'Gand Mool', 'Mula Nakshatra dosha'], link: '/mool-dosha',
  },
  grahanDosha: {
    term: 'Grahan Dosha', category: 'dosha', hiTerm: 'ग्रहण दोष',
    impact: 'The Sun or Moon sits with Rahu or Ketu — an "eclipse" pattern classically read as needing extra steadiness in that planet\'s themes.',
    why: 'Sun with Rahu/Ketu is the Surya Grahan pattern (confidence, father); Moon with Rahu/Ketu is Chandra Grahan (mind, mother).',
    hi: 'जब सूर्य या चंद्र राहु/केतु के साथ हों — ग्रहण योग। उस ग्रह के विषयों में अधिक स्थिरता की ज़रूरत बताई जाती है।',
    link: '/grahan-dosha',
  },
  nadiType: {
    term: 'Your Nadi (Aadi / Madhya / Antya)', category: 'dosha', hiTerm: 'आपकी नाड़ी',
    impact: 'Your Nadi matters only when matching — two people with the same Nadi get 0 of 8 in that koota.',
    why: 'Every birth star belongs to one of three Nadis. On its own, your Nadi is not a dosha.',
    hi: 'हर नक्षत्र आदि, मध्य या अंत्य नाड़ी का होता है। यह केवल मिलान में मायने रखती है; अकेले यह दोष नहीं है।',
    link: '/nadi-dosha',
  },
  doshaGrade: {
    term: 'Strong / moderate / mild (dosha grade)', category: 'dosha', hiTerm: 'दोष की तीव्रता',
    impact: 'How clearly the pattern is formed in your chart — mild means a light influence, not a headline.',
    why: 'BornClock grades by how many classical conditions are met and how close the planets are by degree.',
    hi: 'दोष कितना स्पष्ट बना है — हल्का (mild) का अर्थ है केवल हल्का प्रभाव।',
  },
  upay: {
    term: 'Upay (remedy)', category: 'dosha', hiTerm: 'उपाय',
    impact: 'Optional traditional practices — prayer, charity, fasting or discipline — that people find grounding. Free ones come first; none is guaranteed to change results.',
    why: 'Classical texts (e.g. BPHS) and folk traditions (e.g. Lal Kitab) suggest mantras, daan (charity), fasting, temple visits and, with caution, gemstones.',
    hi: 'उपाय वैकल्पिक पारंपरिक साधन हैं — मंत्र, दान, व्रत, मंदिर दर्शन। पहले निःशुल्क उपाय; कोई भी उपाय परिणाम की गारंटी नहीं देता।',
    aliases: ['remedy', 'remedies', 'Upaya'],
  },

  // ─────────────────────────── Strength ───────────────────────────
  shadbala: {
    term: 'Shadbala (planetary strength)', category: 'strength', hiTerm: 'षड्बल',
    impact: 'How strong or weak each of your planets actually is — so you know which ones can deliver.',
    why: 'Shadbala ("six-fold strength") scores every planet on six classical factors (position, direction, time, motion, natural strength and aspects), in units called virupas. Each planet has its own classical minimum.',
    guidance: 'A strong planet delivers its promise more reliably; a weak one may need support.',
    inline: 'the classical six-fold measure of how strong each planet is',
    hi: 'षड्बल छह शास्त्रीय आधारों पर हर ग्रह की ताक़त मापता है। मज़बूत ग्रह अपना फल बेहतर देता है; कमज़ोर को सहारे की ज़रूरत हो सकती है।',
    aliases: ['six-fold strength', 'planet strength'],
  },
  virupas: {
    term: 'Virupas', category: 'strength', hiTerm: 'विरूप',
    impact: 'Just the unit the planetary-strength score is measured in — a bigger number means a stronger planet.',
    why: 'Shadbala is totalled in virupas; 60 virupas = 1 rupa. The plain word next to it ("strong", "weak") is what actually matters.',
    inline: 'the classical unit planetary strength is scored in',
    hi: 'षड्बल मापने की इकाई; 60 विरूप = 1 रूप। संख्या जितनी बड़ी, ग्रह उतना मज़बूत।',
  },
  rupa: {
    term: 'Rupa', category: 'strength', hiTerm: 'रूप',
    impact: 'A larger unit of planetary strength — "6.5 rupas" is easier to read than "390 virupas".',
    why: '1 rupa = 60 virupas. Classical minimums (BPHS): Sun 5, Moon 6, Mars 5, Mercury 7, Jupiter 6.5, Venus 5.5, Saturn 5 rupas.',
    hi: '1 रूप = 60 विरूप। शास्त्रीय न्यूनतम बल: सूर्य 5, चंद्र 6, मंगल 5, बुध 7, गुरु 6.5, शुक्र 5.5, शनि 5 रूप।',
    aliases: ['rupas'],
  },
  strengthCategory: {
    term: 'Strong / moderate / weak (planet)', category: 'strength', hiTerm: 'बलवान / मध्यम / निर्बल',
    impact: 'The plain-word verdict on each planet\'s Shadbala.',
    why: 'Weak = below its classical minimum; moderate = meets it; strong = at least 25% above it. The same scale is used across every BornClock report.',
    hi: 'निर्बल = शास्त्रीय न्यूनतम से कम; मध्यम = न्यूनतम के बराबर या थोड़ा अधिक; बलवान = 25% या अधिक ऊपर।',
  },

  // ─────────────────────────── Divisional charts ───────────────────────────
  varga: {
    term: 'Varga (divisional chart)', category: 'divisional', hiTerm: 'वर्ग कुंडली',
    impact: 'A "zoom lens" chart for one area of life — marriage, career, children and so on.',
    why: 'Each sign is cut into equal parts and every planet is re-mapped by the part it falls in, giving charts named D2, D3 … D60. They are always read against the main D1 chart, and higher divisions need a more exact birth time.',
    hi: 'वर्ग कुंडली किसी एक जीवन क्षेत्र को "ज़ूम" करके दिखाती है (D9 विवाह, D10 करियर)। इसे हमेशा मुख्य D1 कुंडली के साथ पढ़ा जाता है।',
    aliases: ['divisional chart', 'vargas', 'D-charts'], link: '/divisional-charts',
  },
  d1: {
    term: 'D1 (Rashi chart)', category: 'divisional', hiTerm: 'D1 (राशि / लग्न कुंडली)',
    impact: 'Your main birth chart — everything else is read against it.',
    why: 'The ordinary Kundali, with each planet in its actual sign.',
    hi: 'आपकी मुख्य जन्म कुंडली — बाक़ी सभी वर्ग इसी के साथ पढ़े जाते हैं।',
    link: '/divisional-charts/d1-rashi',
  },
  horaChart: {
    term: 'D2 (Hora chart)', category: 'divisional', hiTerm: 'D2 (होरा)',
    impact: 'Zooms in on wealth and resources.', why: 'Each sign split into two halves.',
    hi: 'धन और संसाधनों का वर्ग।', link: '/divisional-charts/d2-hora',
  },
  drekkana: {
    term: 'D3 (Drekkana)', category: 'divisional', hiTerm: 'D3 (द्रेष्काण)',
    impact: 'Zooms in on siblings, courage and initiative.', why: 'Each sign split into three parts of 10°.',
    hi: 'भाई-बहन, साहस और पहल का वर्ग।', link: '/divisional-charts/d3-drekkana',
  },
  chaturthamsha: {
    term: 'D4 (Chaturthamsha)', category: 'divisional', hiTerm: 'D4 (चतुर्थांश)',
    impact: 'Zooms in on home, property and inner contentment.', why: 'Each sign split into four parts.',
    hi: 'घर, संपत्ति और सुख का वर्ग।', link: '/divisional-charts/d4-chaturthamsha',
  },
  saptamsha: {
    term: 'D7 (Saptamsha)', category: 'divisional', hiTerm: 'D7 (सप्तांश)',
    impact: 'Zooms in on children.', why: 'Each sign split into seven parts.',
    hi: 'संतान का वर्ग।', link: '/divisional-charts/d7-saptamsha',
  },
  navamsa: {
    term: 'Navamsa (D9 chart)', category: 'divisional', hiTerm: 'नवांश (D9)',
    impact: 'A second, "zoomed-in" chart used especially for marriage and the real strength of every planet.',
    why: 'The Navamsa re-divides each sign into nine parts of 3°20′ to reveal the deeper promise behind the main chart.',
    inline: 'the D9 divisional chart, read for marriage & deeper strength',
    hi: 'हर राशि को नौ भागों में बाँटकर बनी कुंडली — विवाह, जीवनसाथी और ग्रहों की असली ताक़त के लिए सबसे महत्वपूर्ण वर्ग।',
    aliases: ['D9', 'Navamsha', 'Navansh'], link: '/divisional-charts/d9-navamsa',
  },
  dasamsa: {
    term: 'Dasamsa (D10 chart)', category: 'divisional', hiTerm: 'दशमांश (D10)',
    impact: 'The dedicated career-and-public-life chart.',
    why: 'The Dasamsa (tenth divisional chart) refines what the main chart shows about profession and status.',
    inline: 'the D10 divisional chart, read for career',
    hi: 'करियर और सामाजिक प्रतिष्ठा का वर्ग।',
    aliases: ['D10', 'Dashamsha'], link: '/divisional-charts/d10-dasamsa',
  },
  dwadashamsha: {
    term: 'D12 (Dwadashamsha)', category: 'divisional', hiTerm: 'D12 (द्वादशांश)',
    impact: 'Zooms in on parents and ancestry.', why: 'Each sign split into twelve parts.',
    hi: 'माता-पिता और वंश का वर्ग।', link: '/divisional-charts/d12-dwadashamsha',
  },
  shodashamsha: {
    term: 'D16 (Shodashamsha)', category: 'divisional', hiTerm: 'D16 (षोडशांश)',
    impact: 'Zooms in on vehicles, comforts and everyday happiness.', why: 'Each sign split into sixteen parts.',
    hi: 'वाहन और सुख-सुविधाओं का वर्ग।', link: '/divisional-charts/d16-shodashamsha',
  },
  vimshamsha: {
    term: 'D20 (Vimshamsha)', category: 'divisional', hiTerm: 'D20 (विंशांश)',
    impact: 'Zooms in on spiritual practice.', why: 'Each sign split into twenty parts.',
    hi: 'साधना और आध्यात्मिक प्रगति का वर्ग।', link: '/divisional-charts/d20-vimshamsha',
  },
  chaturvimshamsha: {
    term: 'D24 (Chaturvimshamsha)', category: 'divisional', hiTerm: 'D24 (चतुर्विंशांश)',
    impact: 'Zooms in on education and learning.', why: 'Each sign split into twenty-four parts.',
    hi: 'शिक्षा और विद्या का वर्ग।', link: '/divisional-charts/d24-chaturvimshamsha',
  },
  bhamsha: {
    term: 'D27 (Bhamsha)', category: 'divisional', hiTerm: 'D27 (भांश)',
    impact: 'Zooms in on strengths, weaknesses and stamina.', why: 'Each sign split into twenty-seven parts.',
    hi: 'बल, कमज़ोरी और सहनशक्ति का वर्ग।', link: '/divisional-charts/d27-bhamsha',
  },
  trimshamsha: {
    term: 'D30 (Trimshamsha)', category: 'divisional', hiTerm: 'D30 (त्रिंशांश)',
    impact: 'Zooms in on difficulties and how you handle tests of character.', why: 'Each sign split into five unequal parts ruled by Mars, Saturn, Jupiter, Mercury and Venus.',
    hi: 'कठिनाइयों और चरित्र की परीक्षा का वर्ग।', link: '/divisional-charts/d30-trimshamsha',
  },
  shashtiamsa: {
    term: 'Shashtiamsa (D60 chart)', category: 'divisional', hiTerm: 'षष्ट्यंश (D60)',
    impact: 'The most detailed divisional chart — treated as a fine-tuning layer, cautiously.',
    why: 'Each sign is split into 60 parts of just 0.5°, so the D60 needs a very exact birth time and is weighed as nuance, not a headline.',
    inline: 'the D60 divisional chart — a cautious fine-tuning layer',
    hi: 'सबसे सूक्ष्म वर्ग (हर राशि के 60 भाग)। इसके लिए बिल्कुल सटीक जन्म समय चाहिए, इसलिए इसे सावधानी से पढ़ा जाता है।',
    aliases: ['D60'], link: '/divisional-charts/d60-shashtiamsha',
  },

  // ─────────────────────────── Yogas ───────────────────────────
  yoga: {
    term: 'Yoga (planetary combination)', category: 'yoga', hiTerm: 'योग',
    impact: 'A special planetary pattern classically linked to a strength or theme in your life.',
    why: 'A "Yoga" is a specific combination of planets/houses the tradition names and reads as one unit — it indicates a tendency, never a guarantee, and it shows most in the matching Dasha.',
    inline: 'a named planetary combination indicating a tendency',
    hi: 'ग्रहों का विशेष संयोग जिसे शास्त्र एक नाम देते हैं — यह प्रवृत्ति दिखाता है, गारंटी नहीं; संबंधित दशा में अधिक फल देता है।',
    link: '/yoga',
  },
  yogaGrade: {
    term: 'Yoga grade (full / strong / moderate / partial)', category: 'yoga', hiTerm: 'योग की श्रेणी',
    impact: 'How completely a yoga is formed in your chart, so you know how much weight to give it.',
    why: 'Full/strong: clearly formed and well supported; moderate: partly formed; partial: only loosely present. Graded from planet strength, dignity and placement.',
    hi: 'योग कितना पूरा बना है — पूर्ण/मज़बूत, मध्यम या आंशिक।',
  },
  rajYoga: {
    term: 'Raja Yoga', category: 'yoga', hiTerm: 'राज योग',
    impact: 'A classical combination for status, leadership and rising in life.',
    why: 'Forms when lords of Kendra (angle) and Trikona (trine) houses connect.',
    hi: 'केंद्र और त्रिकोण के स्वामियों के संबंध से बनने वाला योग — पद, नेतृत्व और उन्नति।',
    aliases: ['Raj Yoga'], link: '/yoga/raja-yoga',
  },
  dhanaYoga: {
    term: 'Dhana Yoga', category: 'yoga', hiTerm: 'धन योग',
    impact: 'A classical combination linked to earning and saving wealth.',
    why: 'Forms when lords of the wealth houses (2nd, 11th) connect with the trines (5th, 9th) or the Lagna.',
    hi: 'धन भावों (2, 11) के स्वामियों का त्रिकोण या लग्न से संबंध — धन अर्जन का योग।',
    link: '/yoga/dhana-yoga',
  },
  gajaKesari: {
    term: 'Gaja Kesari Yoga', category: 'yoga', hiTerm: 'गजकेसरी योग',
    impact: 'Linked to wisdom, good name and the ability to overcome problems.',
    why: 'Forms when Jupiter is in a Kendra (1st, 4th, 7th or 10th) from the Moon.',
    hi: 'जब गुरु चंद्रमा से केंद्र में हो — बुद्धि, प्रतिष्ठा और बाधाओं पर विजय।',
    link: '/yoga/gaja-kesari-yoga',
  },
  budhaAditya: {
    term: 'Budha-Aditya Yoga', category: 'yoga', hiTerm: 'बुधादित्य योग',
    impact: 'Linked to intelligence and clear communication.',
    why: 'Forms when the Sun and Mercury sit together in one sign (common, so its strength matters).',
    hi: 'सूर्य और बुध एक राशि में हों — बुद्धि और वाणी का योग।',
    link: '/yoga/budha-aditya-yoga',
  },
  chandraMangal: {
    term: 'Chandra-Mangal Yoga', category: 'yoga', hiTerm: 'चंद्र-मंगल योग',
    impact: 'Linked to drive and earning through enterprise.',
    why: 'Forms when the Moon and Mars are together or opposite each other.',
    hi: 'चंद्र और मंगल की युति या आमने-सामने स्थिति — उद्यम से धन।',
    link: '/yoga/chandra-mangal-yoga',
  },
  panchaMahapurusha: {
    term: 'Pancha Mahapurusha Yoga', category: 'yoga', hiTerm: 'पंच महापुरुष योग',
    impact: 'Five "great person" yogas that give the qualities of one strong planet.',
    why: 'Forms when Mars (Ruchaka), Mercury (Bhadra), Jupiter (Hamsa), Venus (Malavya) or Saturn (Shasha) is in its own or exaltation sign AND in a Kendra.',
    hi: 'मंगल, बुध, गुरु, शुक्र या शनि अपनी या उच्च राशि में केंद्र में हों — रुचक, भद्र, हंस, मालव्य, शश योग।',
    aliases: ['Ruchaka', 'Bhadra Yoga', 'Hamsa', 'Malavya', 'Shasha'],
  },
  neechaBhanga: {
    term: 'Neecha Bhanga Raja Yoga', category: 'yoga', hiTerm: 'नीचभंग राज योग',
    impact: 'A "weakness turned into strength" pattern — a debilitated planet whose weakness is cancelled.',
    why: 'Forms when a planet in its debilitation sign gets classical support (for example its sign lord in a Kendra).',
    hi: 'नीच ग्रह की कमज़ोरी रद्द होकर शक्ति बन जाए — संघर्ष के बाद उन्नति।',
    link: '/yoga/neecha-bhanga-raja-yoga',
  },
  vipreetRaja: {
    term: 'Vipreet Raja Yoga', category: 'yoga', hiTerm: 'विपरीत राज योग',
    impact: 'Success that comes out of difficult situations.',
    why: 'Forms when lords of the 6th, 8th or 12th houses sit in one another\'s houses.',
    hi: '6, 8, 12 भावों के स्वामी आपस में इन्हीं भावों में हों — कठिनाई से निकली सफलता।',
    link: '/yoga/vipreet-raja-yoga',
  },
  kemadruma: {
    term: 'Kemadruma Yoga', category: 'yoga', hiTerm: 'केमद्रुम योग',
    impact: 'A pattern linked to feeling unsupported at times — often cancelled, and a call to build your own support network.',
    why: 'Forms when no planet (other than the Sun, Rahu, Ketu) is next to the Moon on either side; many classical cancellations apply.',
    hi: 'चंद्रमा के दोनों ओर कोई ग्रह न हो — अकेलेपन का संकेत; इसके कई परिहार हैं।',
    link: '/yoga/kemadruma-yoga',
  },

  // ─────────────────────────── Transits / Rashifal ───────────────────────────
  gochar: {
    term: 'Gochar (transit)', category: 'transit', hiTerm: 'गोचर',
    impact: 'Where the planets are TODAY and how that touches your chart — the basis of every horoscope and forecast.',
    why: 'Transits are read from your Moon sign (and Lagna): a planet\'s current sign, counted from yours, gives its classical effect for you.',
    hi: 'आज ग्रह कहाँ हैं और आपकी कुंडली पर उनका क्या असर है — हर राशिफल का आधार।',
    aliases: ['transit', 'transits'], link: '/transit',
  },
  ingress: {
    term: 'Ingress (sign change)', category: 'transit', hiTerm: 'राशि परिवर्तन',
    impact: 'The date a planet moves into a new sign — when its effect on you changes.',
    why: 'BornClock finds the exact day from the planet\'s real sidereal position.',
    hi: 'जिस दिन कोई ग्रह नई राशि में प्रवेश करता है — तब से उसका फल बदल जाता है।',
    aliases: ['sign change', 'Rashi parivartan'],
  },
  transitGrade: {
    term: 'Strong / moderate / mild (forecast grade)', category: 'transit', hiTerm: 'प्रभाव की तीव्रता',
    impact: 'How pronounced an influence is for you: strong = a headline theme, moderate = a real secondary influence, mild = a light background note.',
    why: 'Graded from the classical house-from-Moon effect and the planet involved.',
    hi: 'प्रभाव कितना स्पष्ट है — प्रबल (मुख्य विषय), मध्यम (सहायक), हल्का (पृष्ठभूमि)।',
  },
  rashifal: {
    term: 'Rashifal (horoscope)', category: 'transit', hiTerm: 'राशिफल',
    impact: 'A daily/weekly/yearly forecast for your Moon sign, from where the planets actually are.',
    why: 'It applies the classical transit (gochar) rules to each of the 12 Moon signs, so it is general for everyone with that sign — your full chart is more personal.',
    hi: 'आपकी चंद्र राशि के लिए दैनिक/साप्ताहिक/वार्षिक फल, ग्रहों की वास्तविक स्थिति से। यह उस राशि के सभी लोगों के लिए सामान्य है।',
    aliases: ['horoscope'], link: '/rashifal',
  },
  chandrabala: {
    term: 'Chandrabala (Moon strength for the day)', category: 'transit', hiTerm: 'चंद्र बल',
    impact: 'Whether today\'s Moon supports you personally — the main reason one rashi\'s day reads better than another\'s.',
    why: 'It is judged from the house the moving Moon occupies counted from your Moon sign: the 1st, 3rd, 6th, 7th, 10th and 11th are classically supportive; the 4th, 8th and 12th call for care.',
    hi: 'आज का चंद्रमा आपका कितना साथ देता है — आपकी चंद्र राशि से चंद्रमा किस भाव में है, इससे देखा जाता है। 1, 3, 6, 7, 10, 11 भाव शुभ माने जाते हैं।',
    aliases: ['Chandra bala', 'Moon strength'],
  },
  tarabala: {
    term: 'Tarabala (star strength for the day)', category: 'transit', hiTerm: 'तारा बल',
    impact: 'How today\'s nakshatra (the Moon\'s star) sits with your birth nakshatra — a quick daily good-day / go-gently check.',
    why: 'Count from your birth nakshatra to today\'s in groups of nine: Janma, Sampat, Vipat, Kshema, Pratyari, Sadhaka, Vadha, Mitra, Parama Mitra. Vipat, Pratyari and Vadha are the classical "go gently" taras.',
    hi: 'आपके जन्म नक्षत्र से आज के नक्षत्र की गिनती नौ-नौ के क्रम में — विपत, प्रत्यरि और वध तारा में सावधानी रखी जाती है, बाक़ी शुभ माने जाते हैं।',
    aliases: ['Tara bala', 'Tara balam'],
  },
  solarHouse: {
    term: 'Solar houses (Western horoscopes)', category: 'transit', hiTerm: 'सूर्य राशि से भाव',
    impact: 'How a Sun-sign horoscope decides which part of your life today\'s planets touch.',
    why: 'Western daily horoscopes count signs from your Sun sign: your own sign is the 1st house, the next sign the 2nd, and so on. The Moon changes sign every 2–3 days, so it sets the day\'s focus.',
    hi: 'पश्चिमी राशिफल में आपकी सूर्य राशि को पहला भाव मानकर आगे की राशियाँ गिनी जाती हैं — इससे पता चलता है कि आज के ग्रह जीवन के किस क्षेत्र को छूते हैं।',
    aliases: ['solar house', 'sun sign houses'],
  },
  westernAspect: {
    term: 'Aspect (Western astrology)', category: 'transit', hiTerm: 'दृष्टि (पश्चिमी)',
    impact: 'The angle between a planet and your sign — easy angles feel smooth, tense ones push you to adjust.',
    why: 'Counted sign to sign: same sign = conjunction, 2 signs apart = sextile (60°), 3 = square (90°), 4 = trine (120°), 6 = opposition (180°). Trines and sextiles are read as easy; squares and oppositions as tension.',
    hi: 'किसी ग्रह और आपकी राशि के बीच का कोण — 60° और 120° के कोण सहज, जबकि 90° और 180° के कोण तनाव वाले माने जाते हैं।',
    aliases: ['aspects', 'trine', 'square', 'sextile', 'opposition'],
  },
  tropicalZodiac: {
    term: 'Tropical zodiac (Western)', category: 'transit', hiTerm: 'सायन राशिचक्र',
    impact: 'The season-based zodiac Western horoscopes use — why your Western sign is often one sign "ahead" of your Vedic one.',
    why: 'It fixes 0° Aries to the March equinox. Vedic astrology uses the star-based (sidereal) zodiac, now about 24° apart, and reads your Moon sign rather than your Sun sign.',
    hi: 'पश्चिमी ज्योतिष का ऋतु-आधारित राशिचक्र; वैदिक (निरयन) राशिचक्र से लगभग 24° का अंतर है, इसलिए दोनों की राशि अक्सर अलग आती है।',
    aliases: ['tropical', 'Western zodiac', 'sayana'],
  },
  luckyColour: {
    term: 'Lucky colour', category: 'transit', hiTerm: 'शुभ रंग',
    impact: 'A traditional colour association for the day — a fun, optional touch, not something to worry about.',
    why: 'Usually taken from the weekday\'s or your sign lord\'s planet (e.g. white for the Moon, red for Mars).',
    hi: 'दिन का पारंपरिक रंग — एक वैकल्पिक, मज़ेदार संकेत; चिंता की बात नहीं।',
  },
  luckyNumber: {
    term: 'Lucky number', category: 'transit', hiTerm: 'शुभ अंक',
    impact: 'Numbers traditionally linked with your sign\'s ruling planet — just for fun.',
    why: 'Each planet has numerology numbers (e.g. 9 for Mars, 3 for Jupiter).',
    hi: 'आपकी राशि के स्वामी ग्रह से जुड़े पारंपरिक अंक — केवल मनोरंजन के लिए।',
  },

  // ─────────────────────────── Gemstones ───────────────────────────
  ratna: {
    term: 'Ratna (gemstone remedy)', category: 'gemstone', hiTerm: 'रत्न',
    impact: 'A gemstone traditionally worn to strengthen a specific planet.',
    why: 'Each planet has an associated Ratna; the aim is to support a weak-but-helpful planet in your chart.',
    guidance: 'Consult a qualified astrologer and wear one only after a full-chart check; not for under-18s.',
    inline: 'a planet-strengthening gemstone',
    hi: 'किसी विशेष ग्रह को बल देने के लिए पहना जाने वाला रत्न। योग्य ज्योतिषी से पूरी कुंडली जँचवाकर ही पहनें; 18 वर्ष से कम आयु के लिए नहीं।',
    aliases: ['gemstone', 'gem'], link: '/gemstones',
  },
  navratna: {
    term: 'Navratna (the nine gems)', category: 'gemstone', hiTerm: 'नवरत्न',
    impact: 'The nine classical gemstones, one for each of the nine planets.',
    why: 'Ruby–Sun, Pearl–Moon, Red Coral–Mars, Emerald–Mercury, Yellow Sapphire–Jupiter, Diamond–Venus, Blue Sapphire–Saturn, Hessonite–Rahu, Cat\'s Eye–Ketu.',
    inline: 'the nine classical planetary gemstones',
    hi: 'नौ ग्रहों के नौ रत्न: माणिक्य–सूर्य, मोती–चंद्र, मूंगा–मंगल, पन्ना–बुध, पुखराज–गुरु, हीरा–शुक्र, नीलम–शनि, गोमेद–राहु, लहसुनिया–केतु।',
  },
  rashiRatna: {
    term: 'Rashi Ratna', category: 'gemstone', hiTerm: 'राशि रत्न',
    impact: 'A quick, one-stone-per-sign starting point — less personal than a full-chart recommendation.',
    why: 'It uses only your sign\'s ruling planet; the full Gemstone tool also checks your Ascendant, Yogakaraka and planet strength.',
    hi: 'राशि के स्वामी ग्रह से एक रत्न — सामान्य सुझाव; पूरी कुंडली वाला सुझाव अधिक व्यक्तिगत है।',
    link: '/rashi-ratna',
  },
  gemTrial: {
    term: 'Trial wear (powerful stones)', category: 'gemstone', hiTerm: 'परीक्षण धारण',
    impact: 'Strong stones such as Blue Sapphire are traditionally tried for a short period first, and removed if they don\'t suit you.',
    why: 'A traditional precaution for the stones of Saturn, Rahu and Ketu in particular.',
    hi: 'नीलम जैसे प्रभावशाली रत्न पहले कुछ दिन परीक्षण के तौर पर पहने जाते हैं, अनुकूल न लगें तो उतार दिए जाते हैं।',
  },

  // ─────────────────────────── Numerology ───────────────────────────
  lifePath: {
    term: 'Life Path Number', category: 'numerology', hiTerm: 'मूलांक पथ / जीवन पथ अंक',
    impact: 'Numerology\'s main number — the broad theme of your life journey.',
    why: 'Reduce the day, month and year of birth to single digits separately (keeping 11, 22, 33), then add and reduce again. This is the method most calculators use.',
    hi: 'अंक ज्योतिष का मुख्य अंक, जन्म तिथि के दिन, महीने और वर्ष को अलग-अलग जोड़कर बनता है (11, 22, 33 वैसे ही रहते हैं)।',
    aliases: ['life path', 'destiny number (date)'], link: '/numerology',
  },
  masterNumber: {
    term: 'Master Number (11, 22, 33)', category: 'numerology', hiTerm: 'मास्टर अंक',
    impact: 'A "double-strength" number that is kept instead of being reduced — big potential, with more pressure.',
    why: 'In Pythagorean numerology 11, 22 and 33 are not reduced to 2, 4 and 6.',
    hi: '11, 22 और 33 को घटाकर एक अंक नहीं बनाया जाता — इन्हें अधिक क्षमता वाला अंक माना जाता है।',
  },
  expressionNumber: {
    term: 'Expression (Destiny) Number', category: 'numerology', hiTerm: 'भाग्यांक (नाम)',
    impact: 'Your natural talents and how you tend to express yourself.',
    why: 'Add the number value of every letter in your full birth name and reduce.',
    hi: 'पूरे नाम के सभी अक्षरों के अंक जोड़कर बनता है — आपकी स्वाभाविक प्रतिभा।',
    aliases: ['Destiny Number', 'Name Number'], link: '/name-numerology',
  },
  soulUrge: {
    term: 'Soul Urge Number', category: 'numerology', hiTerm: 'आत्मा अंक',
    impact: 'What you deeply want and what motivates you inside.',
    why: 'Add only the vowels of your name (Y counts when no other vowel is beside it).',
    hi: 'नाम के केवल स्वरों से बनता है — आपकी भीतरी इच्छा।',
    aliases: ["Heart's Desire"],
  },
  personalityNumber: {
    term: 'Personality Number', category: 'numerology', hiTerm: 'व्यक्तित्व अंक',
    impact: 'How other people tend to see you at first.',
    why: 'Add only the consonants of your name.',
    hi: 'नाम के केवल व्यंजनों से बनता है — दूसरे आपको कैसे देखते हैं।',
  },
  personalYear: {
    term: 'Personal Year Number', category: 'numerology', hiTerm: 'व्यक्तिगत वर्ष अंक',
    impact: 'The theme of the current year for you, in a nine-year cycle (1 = new starts … 9 = completion).',
    why: 'Add your birth day and month to the current year and reduce.',
    hi: 'जन्म दिन और महीने को चालू वर्ष से जोड़कर बनता है — 9 वर्ष के चक्र में इस वर्ष का विषय।',
    link: '/personal-year-number',
  },
  birthdayNumber: {
    term: 'Birthday Number', category: 'numerology', hiTerm: 'जन्मांक (मूलांक)',
    impact: 'One specific gift or talent, taken from the day of the month you were born.',
    why: 'It is simply your birth day (1–31) reduced to one digit; 11 and 22 are kept as master numbers. In Indian numerology this is often called the Moolank.',
    hi: 'जन्म की तारीख़ (1–31) को एक अंक में घटाकर बनता है — इसे मूलांक भी कहते हैं।',
    aliases: ['Moolank', 'Mulank', 'psychic number'],
  },
  attitudeNumber: {
    term: 'Attitude Number', category: 'numerology', hiTerm: 'दृष्टिकोण अंक',
    impact: 'The first impression and day-to-day attitude you give off.',
    why: 'Add your birth day and birth month and reduce.',
    hi: 'जन्म दिन और महीना जोड़कर बनता है — आपका पहला प्रभाव।',
    link: '/attitude-number',
  },
  chaldean: {
    term: 'Chaldean numerology', category: 'numerology', hiTerm: 'कैल्डियन अंक ज्योतिष',
    impact: 'An older system, popular in India for name spellings — it can give a different number from the usual (Pythagorean) one.',
    why: 'Letters get values 1–8 by sound (9 is not assigned to any letter), unlike the 1–9 Pythagorean table.',
    hi: 'पुरानी पद्धति जिसमें अक्षरों को ध्वनि के अनुसार 1–8 अंक मिलते हैं; भारत में नाम सुधार के लिए लोकप्रिय।',
    link: '/chaldean-numerology',
  },
  pythagorean: {
    term: 'Pythagorean numerology', category: 'numerology', hiTerm: 'पाइथागोरियन अंक ज्योतिष',
    impact: 'The most common modern system — the one most online calculators use.',
    why: 'Letters A–Z are numbered 1–9 in order and repeat (A=1 … I=9, J=1 …).',
    hi: 'सबसे आम आधुनिक पद्धति — A से Z तक अक्षरों को क्रम से 1–9 अंक।',
  },

  // ─────────────────────────── Tarot ───────────────────────────
  tarot: {
    term: 'Tarot', category: 'tarot', hiTerm: 'टैरो',
    impact: 'A deck of 78 picture cards used for reflection — a prompt to think, not a prediction.',
    why: 'It has 22 Major Arcana and 56 Minor Arcana cards in four suits (Wands, Cups, Swords, Pentacles).',
    hi: '78 चित्र-कार्डों का डेक, आत्म-चिंतन के लिए — भविष्यवाणी नहीं।',
    link: '/tarot-reading',
  },
  majorArcana: {
    term: 'Major Arcana', category: 'tarot', hiTerm: 'मेजर आर्काना',
    impact: 'The 22 "big theme" cards (The Fool … The World) — they point to major lessons rather than daily matters.',
    why: 'Numbered 0 to 21.',
    hi: 'जीवन के बड़े विषयों वाले 22 कार्ड (0 से 21)।',
  },
  minorArcana: {
    term: 'Minor Arcana', category: 'tarot', hiTerm: 'माइनर आर्काना',
    impact: 'The 56 everyday cards — work, feelings, thoughts and money.',
    why: 'Four suits: Wands (energy, work), Cups (feelings), Swords (thoughts), Pentacles (money, body).',
    hi: 'रोज़मर्रा के विषयों वाले 56 कार्ड, चार सूट में।',
  },
  reversedCard: {
    term: 'Upright / reversed card', category: 'tarot', hiTerm: 'सीधा / उल्टा कार्ड',
    impact: 'A reversed (upside-down) card shows the same theme blocked, delayed or turned inward.',
    why: 'Readers interpret the card\'s orientation as it is drawn.',
    hi: 'उल्टा कार्ड उसी विषय को रुका हुआ या भीतर की ओर मुड़ा दिखाता है।',
  },
  birthCard: {
    term: 'Tarot birth card', category: 'tarot', hiTerm: 'जन्म टैरो कार्ड',
    impact: 'The Major Arcana card linked to your birth date — a lifelong theme to reflect on.',
    why: 'Mary K. Greer\'s method: add your birth month, day and full year, then add the digits of the total until you reach 22 or less; that number is your card (22 = The Fool).',
    hi: 'जन्म तिथि के अंकों को जोड़कर मिलने वाला मेजर आर्काना कार्ड।',
    link: '/tarot-card-by-birthday',
  },
  cardOfDay: {
    term: 'Card of the day', category: 'tarot', hiTerm: 'आज का कार्ड',
    impact: 'One card as a theme to keep in mind today — the same for everyone and changes at midnight.',
    hi: 'आज के लिए एक कार्ड — सबके लिए एक जैसा, आधी रात को बदलता है।',
  },

  // ─────────────────────────── Chinese zodiac ───────────────────────────
  chineseZodiac: {
    term: 'Chinese zodiac animal', category: 'chinese', hiTerm: 'चीनी राशि पशु',
    impact: 'Your birth-year animal — a 12-year cycle used in Chinese tradition to describe personality and compatibility.',
    why: 'The year starts at Chinese (Lunar) New Year in late January or February, so a January birth may belong to the previous animal.',
    hi: 'जन्म वर्ष का पशु — 12 वर्ष का चक्र। चीनी नया वर्ष जनवरी-फ़रवरी में शुरू होता है।',
    link: '/chinese-zodiac',
  },
  chineseElement: {
    term: 'Element (Wood, Fire, Earth, Metal, Water)', category: 'chinese', hiTerm: 'तत्त्व',
    impact: 'Adds flavour to your animal — e.g. a Fire Horse vs a Water Horse.',
    why: 'Each element covers two years in a row, giving a full 60-year cycle with the 12 animals.',
    hi: 'आपके पशु को अतिरिक्त गुण देता है; पाँच तत्त्व और 12 पशु मिलकर 60 वर्ष का चक्र बनाते हैं।',
  },
  yinYang: {
    term: 'Yin / Yang', category: 'chinese', hiTerm: 'यिन / यांग',
    impact: 'Yang years lean active and outgoing; Yin years lean receptive and reflective.',
    why: 'They alternate every year (even-numbered years Yang, odd Yin).',
    hi: 'यांग वर्ष सक्रिय, यिन वर्ष ग्रहणशील; ये हर वर्ष बदलते हैं।',
  },

  // ─────────────────────────── Biorhythm ───────────────────────────
  biorhythm: {
    term: 'Biorhythm', category: 'biorhythm', hiTerm: 'बायोरिदम',
    impact: 'A just-for-fun model of three body/mind cycles from your birth date — scientific studies have not found it predicts anything.',
    why: 'Three sine waves start at birth: physical (23 days), emotional (28 days) and intellectual (33 days).',
    hi: 'जन्म तिथि से तीन चक्रों का मनोरंजक मॉडल — वैज्ञानिक अध्ययनों में इसकी भविष्यवाणी सिद्ध नहीं हुई।',
    link: '/biorhythm',
  },
  physicalCycle: {
    term: 'Physical cycle (23 days)', category: 'biorhythm', hiTerm: 'शारीरिक चक्र',
    impact: 'The cycle linked with energy and stamina in the model.',
    hi: 'मॉडल में ऊर्जा और सहनशक्ति का 23 दिन का चक्र।',
  },
  emotionalCycle: {
    term: 'Emotional cycle (28 days)', category: 'biorhythm', hiTerm: 'भावनात्मक चक्र',
    impact: 'The cycle linked with mood and sensitivity in the model.',
    hi: 'मॉडल में मनोदशा का 28 दिन का चक्र।',
  },
  intellectualCycle: {
    term: 'Intellectual cycle (33 days)', category: 'biorhythm', hiTerm: 'बौद्धिक चक्र',
    impact: 'The cycle linked with focus and clear thinking in the model.',
    hi: 'मॉडल में एकाग्रता और सोच का 33 दिन का चक्र।',
  },
};

/** Look up a term definition by id (case-insensitive), or null. */
export function getTermDef(id: string): TermDef | null {
  if (!id) return null;
  if (VEDIC_TERMS[id]) return VEDIC_TERMS[id];
  const key = Object.keys(VEDIC_TERMS).find(k => k.toLowerCase() === id.toLowerCase());
  return key ? VEDIC_TERMS[key] : null;
}

/** The canonical id for an id given in any case (or null if unknown). */
export function canonicalTermId(id: string): string | null {
  if (!id) return null;
  if (VEDIC_TERMS[id]) return id;
  return Object.keys(VEDIC_TERMS).find(k => k.toLowerCase() === id.toLowerCase()) ?? null;
}

/**
 * SEO-friendly glossary anchor for a term id: camelCase → kebab-case
 * (e.g. "rahuKalam" → "rahu-kalam"). Used for /glossary#<slug>.
 */
export function termSlug(id: string): string {
  return (canonicalTermId(id) ?? id).replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** The /glossary URL (with anchor) for a term. */
export function glossaryHref(id: string): string {
  return `/glossary#${termSlug(id)}`;
}

/**
 * A short parenthetical gloss for use inside prose/string-generated copy that can't embed
 * JSX (e.g. kundaliService, panchang, gemstones, careerReport). Returns "" if unknown, so
 * callers can safely template it. Impact-first: uses the `inline` phrasing.
 */
export function glossInline(id: string): string {
  const d = getTermDef(id);
  if (!d) return '';
  return d.inline || d.impact;
}

/** Map a Kundali-match porutham key (porutham.ts) to its glossary id. */
export const PORUTHAM_TERM: Record<string, string> = {
  dina: 'dinaPorutham', gana: 'ganaPorutham', mahendra: 'mahendraPorutham',
  'stree-deergha': 'streeDeerghaPorutham', yoni: 'yoniPorutham', rasi: 'rasiPorutham',
  rasyadhipathi: 'rasyadhipathiPorutham', vasya: 'vasyaPorutham', rajju: 'rajjuPorutham', vedha: 'vedhaPorutham',
};

/** Map a matching dosha name (matchmaking.ts) to its glossary id. */
export const MATCH_DOSHA_TERM: Record<string, string> = {
  'Nadi Dosha': 'nadiDosha', 'Bhakoot Dosha': 'bhakootDosha', 'Gana Dosha': 'ganaDosha',
};

/** Map a Choghadiya slot name (panchangDay.ts) to its glossary id. */
/** Batch 7 (W7): label → term id for the "What these terms mean" chips on the Panchang pages. */
export const PANCHANG_PAGE_TERM: Record<string, string> = {
  Panchang: 'panchang', Tithi: 'tithi', Paksha: 'paksha', Nakshatra: 'panchangNakshatra', Yoga: 'panchangYoga',
  Karana: 'karana', Vara: 'vara', 'Brahma Muhurta': 'brahmaMuhurta', 'Abhijit Muhurta': 'abhijit', 'Amrit Kalam': 'amritKalam',
  'Rahu Kaal': 'rahuKalam', 'Gulika Kaal': 'gulikaKaal', Yamaganda: 'yamaganda', 'Dur Muhurtam': 'durMuhurtam',
  Varjyam: 'varjyam', Choghadiya: 'choghadiya',
};

export const CHOGHADIYA_TERM: Record<string, string> = {
  Amrit: 'choghAmrit', Shubh: 'choghShubh', Labh: 'choghLabh', Char: 'choghChar',
  Udveg: 'choghUdveg', Kaal: 'choghKaal', Rog: 'choghRog',
};

/** Best-effort map from a detected yoga name (yogas.ts) to its glossary id. */
export function yogaTermId(name: string): string | null {
  const n = name.toLowerCase();
  if (n.startsWith('neecha bhanga')) return 'neechaBhanga';
  if (n.includes('pancha mahapurusha')) return 'panchaMahapurusha';
  if (n.startsWith('raj')) return 'rajYoga';
  if (n.startsWith('dhana')) return 'dhanaYoga';
  if (n.startsWith('gaja kesari')) return 'gajaKesari';
  if (n.startsWith('budha')) return 'budhaAditya';
  if (n.startsWith('chandra-mangal') || n.startsWith('chandra mangal')) return 'chandraMangal';
  if (n.startsWith('vipreet') || n.startsWith('viparita')) return 'vipreetRaja';
  if (n.startsWith('kemadruma')) return 'kemadruma';
  return null;
}

/** A glossary row: the id plus its definition. */
export interface GlossaryEntry { id: string; slug: string; def: TermDef; letter: string }

/** The A–Z letter a term is filed under (first Latin letter of its display name). */
function glossaryLetter(term: string): string {
  const m = term.match(/[A-Za-z]/);
  return m ? m[0].toUpperCase() : '#';
}

/** Every term, sorted A–Z by display name. */
export function glossaryEntries(): GlossaryEntry[] {
  return Object.entries(VEDIC_TERMS)
    .map(([id, def]) => ({ id, slug: termSlug(id), def, letter: glossaryLetter(def.term) }))
    .sort((a, b) => a.def.term.localeCompare(b.def.term, 'en', { sensitivity: 'base' }));
}

/**
 * Glossary search: matches the English term, Hindi name, aliases and the explanation
 * text (case-insensitive; every word of the query must match). Empty query → all.
 */
export function searchGlossary(query: string): GlossaryEntry[] {
  const all = glossaryEntries();
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return all;
  const q = words.join(' ');
  return all
    .filter(({ id, def }) => {
      const hay = [id, def.term, def.hiTerm, def.hi, def.impact, def.why, ...(def.aliases ?? [])]
        .filter(Boolean).join(' ').toLowerCase();
      return words.every(w => hay.includes(w));
    })
    // Name matches first, then matches that are only in the explanation text.
    .map(e => {
      const names = [e.def.term, e.def.hiTerm, ...(e.def.aliases ?? [])].filter(Boolean).join(' ').toLowerCase();
      return { e, rank: names.includes(q) ? 0 : 1 };
    })
    .sort((a, b) => a.rank - b.rank)
    .map(x => x.e);
}

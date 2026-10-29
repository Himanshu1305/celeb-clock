/**
 * Batch 9 — short meanings for 1–9 read as a MULANK (birth-day number) and as a
 * CHALDEAN NAME NUMBER, used by the /numerology calculator, the Hindi calculator on
 * /hi/numerology-by-date-of-birth and the "As Mulank N" / "As name number N" sections
 * on /numerology/1–9. Kept deliberately different from the Western Life Path text on
 * those pages (src/data/numerologyData.ts), which describes the full-date number.
 *
 * Sources (opened 29 Oct 2026, paraphrased — no long quotes):
 *   Ruling planets (Indian scheme, 4 = Rahu, 7 = Ketu) and Mulank keynotes:
 *     ishvaram.com/mulank-calculator — 1 Surya: leadership and authority; 2 Chandra:
 *     sensitivity and intuition; 3 Guru: wisdom and expansion; 4 Rahu: unconventional
 *     drive; 5 Budh: communication and quick thinking; 6 Shukra: beauty and
 *     relationships; 7 Ketu: introspection and detachment; 8 Shani: discipline and slow,
 *     steady success; 9 Mangal: energy, courage and a fighting spirit. Same page lists the
 *     birth days for each Mulank (1 → 1, 10, 19, 28 …).
 *     astrotalk.com/mulank-calculator — 1 "Born Leader" (takes charge; teamwork needs
 *     patience); 2 "Peace Maker" (gentle, intuitive, helps people understand each other);
 *     3 "Creative Soul" (expressive, inspires others); 4 "Builder" (disciplined, steady,
 *     step-by-step); 5 "Explorer" (change, travel, freedom); 6 "Caregiver" (loving, puts
 *     others first); 7 "Thinker" (deep questions, trusts gut feeling); 8 "Power Player"
 *     (business, big goals — advised to care for feelings too); 9 "Giver" (big-hearted,
 *     wants to help).
 *   Chaldean name-number keynotes:
 *     astromedha.in/insights/numerology/name-number-calculator — 1 Sun "the Pioneer"
 *     (leadership, drive, originality); 2 Moon "the Diplomat" (sensitivity, partnership,
 *     intuition); 3 Jupiter "the Communicator" (self-expression, optimism, growth);
 *     4 Rahu "the Builder" (discipline, unconventional structure, grit); 5 Mercury "the
 *     Connector" (versatility, communication, freedom); 6 Venus "the Harmoniser" (beauty,
 *     love, responsibility); 7 Ketu "the Seeker" (depth, analysis, spirituality); 8 Saturn
 *     "the Authority" (power, structure, long-term ambition); 9 Mars "the Warrior"
 *     (courage, energy, humanitarian drive). The page presents these as tendencies, "a
 *     clue to your natural style", not rules.
 * Tone: tendencies for reflection, never predictions.
 */

export interface IndianNumberMeaning {
  planet: string;
  planetHi: string;
  title: string;
  titleHi: string;
  text: string;
  textHi: string;
}

/** Birth days (1–31) that give each Mulank — arithmetic, shown on the pages. */
export const MULANK_DAYS: Record<number, number[]> = {
  1: [1, 10, 19, 28], 2: [2, 11, 20, 29], 3: [3, 12, 21, 30], 4: [4, 13, 22, 31],
  5: [5, 14, 23], 6: [6, 15, 24], 7: [7, 16, 25], 8: [8, 17, 26], 9: [9, 18, 27],
};

export const MULANK_MEANINGS: Record<number, IndianNumberMeaning> = {
  1: { planet: 'Sun (Surya)', planetHi: 'सूर्य', title: 'The born leader', titleHi: 'जन्मजात नेतृत्व',
    text: 'Read as leadership and authority: you like to take charge and do things your own way. The usual advice is patience in teamwork.',
    textHi: 'नेतृत्व और अधिकार का अंक — आप ज़िम्मेदारी लेना और अपने ढंग से काम करना पसंद करते हैं। टीम में धैर्य रखना इसकी सामान्य सलाह है।' },
  2: { planet: 'Moon (Chandra)', planetHi: 'चंद्र', title: 'The peacemaker', titleHi: 'शांतिदूत',
    text: 'Read as sensitivity and intuition: gentle, good with people, and often the one who helps others understand each other.',
    textHi: 'संवेदनशीलता और अंतर्ज्ञान का अंक — सौम्य स्वभाव, लोगों से अच्छा तालमेल, और अक्सर दूसरों के बीच समझ बनाने वाले।' },
  3: { planet: 'Jupiter (Guru)', planetHi: 'गुरु (बृहस्पति)', title: 'The creative, growing mind', titleHi: 'रचनात्मक और ज्ञानवान',
    text: 'Read as wisdom and expansion: expressive, fond of sharing ideas, and able to lift and inspire the people around you.',
    textHi: 'ज्ञान और विस्तार का अंक — अभिव्यक्तिपूर्ण, विचार बाँटना पसंद, और आसपास के लोगों को प्रेरित करने वाले।' },
  4: { planet: 'Rahu', planetHi: 'राहु', title: 'The unconventional builder', titleHi: 'अलग सोच वाले निर्माता',
    text: 'Read as an unconventional drive joined to steady, step-by-step work: practical, disciplined and happy to plan ahead.',
    textHi: 'अलग सोच के साथ लगातार, क़दम-दर-क़दम मेहनत — व्यावहारिक, अनुशासित और पहले से योजना बनाने वाले।' },
  5: { planet: 'Mercury (Budh)', planetHi: 'बुध', title: 'The quick explorer', titleHi: 'फुर्तीले खोजी',
    text: 'Read as communication and quick thinking: you enjoy change, travel and variety more than a fixed routine.',
    textHi: 'संवाद और तेज़ सोच का अंक — आपको एक ही दिनचर्या से ज़्यादा बदलाव, यात्रा और विविधता पसंद है।' },
  6: { planet: 'Venus (Shukra)', planetHi: 'शुक्र', title: 'The caregiver', titleHi: 'स्नेही देखभाल करने वाले',
    text: 'Read as beauty and relationships: loving and calm, often putting others first and bringing warmth to a home.',
    textHi: 'सौंदर्य और संबंधों का अंक — स्नेही और शांत, अक्सर दूसरों को पहले रखने वाले और घर में अपनापन लाने वाले।' },
  7: { planet: 'Ketu', planetHi: 'केतु', title: 'The thinker', titleHi: 'गहरे विचारक',
    text: 'Read as introspection and detachment: you ask big questions, trust your gut feeling and are drawn to study or spiritual work.',
    textHi: 'आत्मचिंतन और वैराग्य का अंक — बड़े प्रश्न पूछने वाले, अपने मन की आवाज़ पर भरोसा करने वाले, अध्ययन या आध्यात्म की ओर झुकाव।' },
  8: { planet: 'Saturn (Shani)', planetHi: 'शनि', title: 'Slow, steady success', titleHi: 'धीमी पर पक्की सफलता',
    text: 'Read as discipline and slow, steady success: focused on big goals and practical about money — with the reminder to care for feelings too.',
    textHi: 'अनुशासन और धीमी पर स्थिर सफलता का अंक — बड़े लक्ष्यों पर ध्यान, धन के मामलों में व्यावहारिक; साथ ही भावनाओं का ध्यान रखना भी ज़रूरी।' },
  9: { planet: 'Mars (Mangal)', planetHi: 'मंगल', title: 'Courage and giving', titleHi: 'साहस और उदारता',
    text: 'Read as energy, courage and a fighting spirit, joined to a big heart that wants to help others.',
    textHi: 'ऊर्जा, साहस और संघर्ष-भावना का अंक, साथ में बड़ा दिल जो दूसरों की मदद करना चाहता है।' },
};

export const NAME_NUMBER_INDIAN_MEANINGS: Record<number, IndianNumberMeaning> = {
  1: { planet: 'Sun', planetHi: 'सूर्य', title: 'The Pioneer', titleHi: 'अग्रणी',
    text: 'As a name number, 1 is read as a name that carries drive and originality — it tends to present you as someone who leads.',
    textHi: 'नामांक के रूप में 1 ऐसा नाम माना जाता है जिसमें ऊर्जा और मौलिकता हो — यह आपको आगे बढ़कर नेतृत्व करने वाले के रूप में दिखाता है।' },
  2: { planet: 'Moon', planetHi: 'चंद्र', title: 'The Diplomat', titleHi: 'कूटनीतिज्ञ',
    text: 'As a name number, 2 is read as a gentle, partnership-minded name — it tends to present you as approachable and intuitive.',
    textHi: 'नामांक के रूप में 2 सौम्य, साझेदारी वाला नाम माना जाता है — यह आपको मिलनसार और अंतर्ज्ञानी रूप में दिखाता है।' },
  3: { planet: 'Jupiter', planetHi: 'गुरु', title: 'The Communicator', titleHi: 'संवादक',
    text: 'As a name number, 3 is read as an expressive, optimistic name linked with growth — it tends to present you as someone worth listening to.',
    textHi: 'नामांक के रूप में 3 अभिव्यक्तिपूर्ण, आशावादी और विकास से जुड़ा नाम माना जाता है।' },
  4: { planet: 'Rahu', planetHi: 'राहु', title: 'The Builder', titleHi: 'निर्माता',
    text: 'As a name number, 4 is read as a name of grit and structure, often with an unconventional streak.',
    textHi: 'नामांक के रूप में 4 मेहनत और व्यवस्था का नाम माना जाता है, जिसमें अक्सर कुछ अलग सोच भी होती है।' },
  5: { planet: 'Mercury', planetHi: 'बुध', title: 'The Connector', titleHi: 'जोड़ने वाले',
    text: 'As a name number, 5 is read as a versatile, communicative name that suits movement and contact with many people.',
    textHi: 'नामांक के रूप में 5 बहुमुखी और संवादप्रिय नाम माना जाता है, जो गतिशीलता और कई लोगों से संपर्क के अनुकूल है।' },
  6: { planet: 'Venus', planetHi: 'शुक्र', title: 'The Harmoniser', titleHi: 'सामंजस्य लाने वाले',
    text: 'As a name number, 6 is read as a warm name linked with beauty, love and responsibility.',
    textHi: 'नामांक के रूप में 6 सौंदर्य, प्रेम और ज़िम्मेदारी से जुड़ा स्नेहपूर्ण नाम माना जाता है।' },
  7: { planet: 'Ketu', planetHi: 'केतु', title: 'The Seeker', titleHi: 'साधक',
    text: 'As a name number, 7 is read as a name of depth — analytical and spiritually inclined rather than showy.',
    textHi: 'नामांक के रूप में 7 गहराई वाला नाम माना जाता है — दिखावे से ज़्यादा विश्लेषण और आध्यात्म की ओर।' },
  8: { planet: 'Saturn', planetHi: 'शनि', title: 'The Authority', titleHi: 'अधिकारी',
    text: 'As a name number, 8 is read as a serious name of structure and long-term ambition; the tradition pairs it with patience.',
    textHi: 'नामांक के रूप में 8 व्यवस्था और दीर्घकालीन महत्वाकांक्षा का गंभीर नाम माना जाता है; परंपरा इसके साथ धैर्य की सलाह देती है।' },
  9: { planet: 'Mars', planetHi: 'मंगल', title: 'The Warrior', titleHi: 'योद्धा',
    text: 'As a name number, 9 is read as an energetic, courageous name with a humanitarian streak.',
    textHi: 'नामांक के रूप में 9 ऊर्जावान, साहसी और मानवता की सेवा वाला नाम माना जाता है।' },
};

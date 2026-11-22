/**
 * B18 — Varshphal display labels (English / Hindi). No engine imports, so the page and the
 * PDF builder can use them without pulling the ephemeris into the browser bundle.
 */
export type Lang = 'en' | 'hi';
export type Tone = 'supportive' | 'mixed' | 'careful';
export const PLANET_HI: Record<string, string> = { Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु' };
export const SIGN_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
export const SIGN_HI = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];
export const pName = (p: string, lang: Lang) => (lang === 'hi' ? PLANET_HI[p] ?? p : p);
export const sName = (i: number, lang: Lang) => (lang === 'hi' ? SIGN_HI[i] : SIGN_EN[i]);
export const ord = (n: number, lang: Lang) => (lang === 'hi' ? `${n}वें` : `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`);

export const HOUSE_THEME: Record<Lang, string[]> = {
  en: ['', 'yourself, energy and confidence', 'savings, family and speech', 'courage, initiative, siblings and short trips',
    'home, property, mother and peace of mind', 'learning, children, creativity and romance', 'daily work, competition, loans and health habits',
    'partnerships, marriage and clients', 'sudden changes, research, joint money and insurance', 'luck, teachers, father, higher study and long journeys',
    'career, status and responsibility', 'income, gains, friends and goals met', 'expenses, rest, foreign links and letting go'],
  hi: ['', 'स्वयं, ऊर्जा और आत्मविश्वास', 'बचत, परिवार और वाणी', 'साहस, पहल, भाई-बहन और छोटी यात्राएँ',
    'घर, संपत्ति, माता और मन की शांति', 'पढ़ाई, संतान, रचनात्मकता और प्रेम', 'रोज़ का काम, प्रतियोगिता, ऋण और सेहत की आदतें',
    'साझेदारी, विवाह और ग्राहक', 'अचानक बदलाव, शोध, साझा धन और बीमा', 'भाग्य, गुरु, पिता, उच्च शिक्षा और लंबी यात्राएँ',
    'करियर, पद और ज़िम्मेदारी', 'आय, लाभ, मित्र और लक्ष्य-पूर्ति', 'खर्च, विश्राम, विदेश संबंध और छोड़ना'],
};

export const T = {
  en: {
    tone: { supportive: 'Supportive', mixed: 'Mixed — steady effort pays', careful: 'Go carefully' },
    strength: { strong: 'strong', moderate: 'moderately strong', weak: 'weak' },
  },
  hi: {
    tone: { supportive: 'अनुकूल', mixed: 'मिला-जुला — लगातार प्रयास फलदायी', careful: 'सावधानी से' },
    strength: { strong: 'बलवान', moderate: 'मध्यम बली', weak: 'कमज़ोर' },
  },
};
export const toneLabel = (t: Tone, lang: Lang) => T[lang].tone[t];

/** Saham names and what each one is read for. */
export const SAHAM_LABEL: Record<string, Record<Lang, { name: string; area: string }>> = {
  punya: { en: { name: 'Punya Saham', area: 'merit, good fortune and blessings' }, hi: { name: 'पुण्य सहम', area: 'पुण्य, सौभाग्य और आशीर्वाद' } },
  vidya: { en: { name: 'Vidya Saham', area: 'learning, exams and knowledge' }, hi: { name: 'विद्या सहम', area: 'पढ़ाई, परीक्षा और ज्ञान' } },
  yasha: { en: { name: 'Yasha Saham', area: 'reputation and recognition' }, hi: { name: 'यश सहम', area: 'प्रतिष्ठा और पहचान' } },
  mitra: { en: { name: 'Mitra Saham', area: 'friends, allies and support' }, hi: { name: 'मित्र सहम', area: 'मित्र, सहयोगी और समर्थन' } },
  mahatmya: { en: { name: 'Mahatmya Saham', area: 'standing, dignity and influence' }, hi: { name: 'माहात्म्य सहम', area: 'प्रतिष्ठा, गरिमा और प्रभाव' } },
  vivaha: { en: { name: 'Vivaha Saham', area: 'marriage and committed partnership' }, hi: { name: 'विवाह सहम', area: 'विवाह और प्रतिबद्ध साझेदारी' } },
  karyasiddhi: { en: { name: 'Karya-siddhi Saham', area: 'success in work and plans completed' }, hi: { name: 'कार्य-सिद्धि सहम', area: 'काम में सफलता और योजनाओं की पूर्ति' } },
};
export const ROLE_LABEL: Record<string, Record<Lang, string>> = {
  muntha: { en: 'Muntha lord', hi: 'मुंथेश' },
  janmaLagna: { en: 'Birth-Lagna lord', hi: 'जन्म लग्नेश' },
  varshaLagna: { en: 'Annual-Lagna lord', hi: 'वर्ष लग्नेश' },
  triRashi: { en: 'Tri-rashi pati', hi: 'त्रिराशि पति' },
  dinRatri: { en: 'Day/Night lord', hi: 'दिन-रात्रि पति' },
};

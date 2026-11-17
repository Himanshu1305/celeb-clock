/**
 * B14 — shared wording for the 2027 yearly forecasts (English + Hindi): life areas of the
 * houses, how each planet colours a house by tone, practical tips, dates.
 *
 * Tone rules (BornClock standing rules): impact first, reason second, what to do third;
 * calm and practical; health and safety only as practical caution (never illness, accidents
 * or death); no fear, no certainty. Astrology is described as computed and traditional,
 * never as scientifically validated.
 */
import type { Tone } from '../vedic/rashifal';
import type { YPlanet } from './sky';

export type Lang = 'en' | 'hi';
export type Domain = 'love' | 'career' | 'money' | 'health';

export const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTHS_SHORT_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
export const ORD_EN = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
export const ORD_HI = ['', 'पहले', 'दूसरे', 'तीसरे', 'चौथे', 'पाँचवें', 'छठे', 'सातवें', 'आठवें', 'नौवें', 'दसवें', 'ग्यारहवें', 'बारहवें'];
export const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WEEKDAYS_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

export const PLANET_HI: Record<YPlanet | 'Moon', string> = {
  Sun: 'सूर्य', Moon: 'चंद्रमा', Mercury: 'बुध', Venus: 'शुक्र', Mars: 'मंगल', Jupiter: 'गुरु (बृहस्पति)', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};
/** Short Hindi planet name for repeated use inside sentences. */
export const PLANET_HI_SHORT: Record<YPlanet | 'Moon', string> = {
  Sun: 'सूर्य', Moon: 'चंद्रमा', Mercury: 'बुध', Venus: 'शुक्र', Mars: 'मंगल', Jupiter: 'गुरु', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};
export const pName = (p: YPlanet, lang: Lang, short = true) => (lang === 'en' ? p : short ? PLANET_HI_SHORT[p] : PLANET_HI[p]);

/** "3 June 2027" / "3 जून 2027". */
export function longDate(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split('-').map(Number);
  return lang === 'en' ? `${d} ${MONTHS_EN[m - 1]} ${y}` : `${d} ${MONTHS_HI[m - 1]} ${y}`;
}
/** "3 Jun" / "3 जून". */
export function shortDate(iso: string, lang: Lang): string {
  const [, m, d] = iso.split('-').map(Number);
  return lang === 'en' ? `${d} ${MONTHS_SHORT_EN[m - 1]}` : `${d} ${MONTHS_HI[m - 1]}`;
}
/** "25 Jan – 26 Jun" (the whole year → "all year"). */
export function range(from: string, to: string, lang: Lang): string {
  if (from.endsWith('-01-01') && to.endsWith('-12-31')) return lang === 'en' ? 'all year' : 'पूरे वर्ष';
  return `${shortDate(from, lang)} – ${shortDate(to, lang)}`;
}
/** A stretch inside the year as prose: "all year", "until 25 Jan", "from 26 Nov", "25 Jan – 26 Jun". */
export function span(from: string, to: string, lang: Lang): string {
  const a = from.endsWith('-01-01'), b = to.endsWith('-12-31');
  if (a && b) return lang === 'en' ? 'all year' : 'पूरे वर्ष';
  if (a) return lang === 'en' ? `until ${shortDate(to, lang)}` : `${shortDate(to, lang)} तक`;
  if (b) return lang === 'en' ? `from ${shortDate(from, lang)}` : `${shortDate(from, lang)} से`;
  return `${shortDate(from, lang)} – ${shortDate(to, lang)}`;
}
export const PLACEMENT: Record<Lang, Record<Tone, string>> = {
  en: { favourable: 'a supportive placement', mixed: 'a mixed placement', challenging: 'a placement to handle with care' },
  hi: { favourable: 'शुभ स्थिति', mixed: 'मिश्रित स्थिति', challenging: 'सावधानी वाली स्थिति' },
};

/** Life areas of the houses (from the Moon sign in Vedic reading). */
export const AREA: Record<Lang, string[]> = {
  en: ['',
    'self, health and personal direction',
    'money, family and speech',
    'courage, effort, siblings and short trips',
    'home, mother, comfort and property',
    'romance, children, creativity and studies',
    'work routine, health habits and competition',
    'marriage, partnership and agreements',
    'sudden change, joint money and research',
    'luck, higher learning, faith and long journeys',
    'career, status and reputation',
    'income, gains, friends and wishes',
    'expenses, rest, foreign lands and letting go',
  ],
  hi: ['',
    'स्वयं, सेहत और व्यक्तित्व',
    'धन, परिवार और वाणी',
    'साहस, प्रयास, भाई-बहन और छोटी यात्राएँ',
    'घर, माता, सुख और संपत्ति',
    'प्रेम, संतान, रचनात्मकता और पढ़ाई',
    'नौकरी की दिनचर्या, सेहत की आदतें और प्रतिस्पर्धा',
    'विवाह, जीवनसाथी और साझेदारी',
    'अचानक बदलाव, साझा धन और शोध',
    'भाग्य, उच्च शिक्षा, धर्म और लंबी यात्राएँ',
    'करियर, पद और प्रतिष्ठा',
    'आय, लाभ, मित्र और इच्छा-पूर्ति',
    'ख़र्च, विश्राम, विदेश और त्याग',
  ],
};

/** How a planet colours the house it transits, by tone. Practical-caution wording only. */
export const LENS: Record<Lang, Record<YPlanet, Record<Tone, string>>> = {
  en: {
    Sun: { favourable: 'confidence, recognition and backing from people in authority', challenging: 'ego clashes, friction with authority and a pull to overwork', mixed: 'a spotlight that rewards honest effort and exposes shortcuts' },
    Mars: { favourable: 'drive, courage and the energy to push a stalled plan forward', challenging: 'short temper and haste — take extra care with sharp tools, machines and the road', mixed: 'high energy that helps when channelled and frays tempers when it is not' },
    Mercury: { favourable: 'clear thinking, good conversations and smooth paperwork or trade', challenging: 'mix-ups, scattered focus and errors in the fine print', mixed: 'a busy, talkative stretch — double-check details before you commit' },
    Jupiter: { favourable: 'growth, good advice, opportunity and a sense of things opening up', challenging: 'over-optimism, over-commitment and loose spending', mixed: 'slow, real growth — doors open, but not overnight' },
    Venus: { favourable: 'warmth in relationships, comfort, beauty and small pleasures', challenging: 'indulgence, relationship friction and overspending on pleasure', mixed: 'pleasant but distracting — enjoy it without losing the thread' },
    Saturn: { favourable: 'discipline paying off, steady progress and well-earned respect', challenging: 'delays, heavier duties and a test of patience and stamina', mixed: 'slow, serious work — results come to those who stay the course' },
    Rahu: { favourable: 'ambition, unconventional openings and useful sudden opportunities', challenging: 'restlessness, over-reach and chasing things that glitter but mislead', mixed: 'unusual turns — exciting, but keep both feet on the ground' },
    Ketu: { favourable: 'clarity through letting go, intuition and quiet inner progress', challenging: 'detachment, loose ends and a feeling of things slipping away', mixed: 'a reflective, low-key influence — good for release, poor for launches' },
  },
  hi: {
    Sun: { favourable: 'आत्मविश्वास, मान-सम्मान और अधिकारियों का सहयोग', challenging: 'अहं का टकराव, अधिकारियों से खिंचाव और ज़रूरत से ज़्यादा काम का दबाव', mixed: 'ऐसी रोशनी जो ईमानदार मेहनत को सराहती है और शॉर्टकट को उजागर करती है' },
    Mars: { favourable: 'जोश, साहस और रुके काम को आगे बढ़ाने की ऊर्जा', challenging: 'जल्दबाज़ी और गुस्सा — धारदार औज़ार, मशीन और सड़क पर अतिरिक्त सावधानी रखें', mixed: 'तेज़ ऊर्जा — सही दिशा मिले तो काम आती है, वरना स्वभाव में तल्ख़ी लाती है' },
    Mercury: { favourable: 'साफ़ सोच, अच्छी बातचीत और काग़ज़ी काम व व्यापार में आसानी', challenging: 'गलतफ़हमियाँ, बिखरा ध्यान और बारीक शर्तों में चूक', mixed: 'व्यस्त और बातचीत भरा समय — कोई भी वादा करने से पहले बातें दोबारा जाँचें' },
    Jupiter: { favourable: 'वृद्धि, अच्छी सलाह, नए अवसर और खुलते रास्ते', challenging: 'ज़रूरत से ज़्यादा उम्मीद, ज़्यादा वादे और ढीला ख़र्च', mixed: 'धीमी पर सच्ची प्रगति — रास्ते खुलते हैं, पर रातों-रात नहीं' },
    Venus: { favourable: 'रिश्तों में मिठास, सुख-सुविधा, सुंदरता और छोटी ख़ुशियाँ', challenging: 'भोग-विलास, रिश्तों में खटपट और शौक़ पर ज़्यादा ख़र्च', mixed: 'सुखद पर ध्यान भटकाने वाला समय — आनंद लें, पर लक्ष्य न भूलें' },
    Saturn: { favourable: 'अनुशासन का फल, स्थिर प्रगति और मेहनत से मिला सम्मान', challenging: 'देरी, बढ़ी ज़िम्मेदारियाँ और धैर्य व सहनशक्ति की परीक्षा', mixed: 'धीमा, गंभीर काम — परिणाम उन्हें मिलता है जो डटे रहते हैं' },
    Rahu: { favourable: 'महत्वाकांक्षा, अलग तरह के अवसर और अचानक मिलने वाले काम के मौक़े', challenging: 'बेचैनी, सीमा से आगे बढ़ना और चमकदार पर भ्रामक चीज़ों के पीछे भागना', mixed: 'अनोखे मोड़ — रोमांचक, पर पैर ज़मीन पर रखें' },
    Ketu: { favourable: 'छोड़ने से आई स्पष्टता, अंतर्ज्ञान और भीतर की शांत प्रगति', challenging: 'उदासीनता, अधूरे काम और चीज़ों के हाथ से फिसलने का भाव', mixed: 'चिंतन वाला शांत प्रभाव — पुरानी चीज़ें छोड़ने के लिए अच्छा, नई शुरुआत के लिए कम' },
  },
};

/** One practical tip per house and tone. */
export const TIP: Record<Lang, Record<number, Record<Tone, string>>> = {
  en: {
    1: { favourable: 'Lead with your own plans — your energy and presence are on your side.', mixed: 'Pace yourself and keep your health routine steady.', challenging: 'Go easy on yourself: rest, eat well and avoid snap reactions.' },
    2: { favourable: 'Build savings and speak up for what you value.', mixed: 'Keep spending purposeful and your words kind.', challenging: 'Watch spending and choose your words with care at home.' },
    3: { favourable: 'Back your own initiative — bold, honest effort is favoured.', mixed: 'Act, but finish what you start before taking on more.', challenging: 'Don’t force things; keep messages and short trips simple.' },
    4: { favourable: 'A good stretch to settle home, family or property matters.', mixed: 'Balance home duties with your own rest.', challenging: 'Tend your home base, check property papers twice and protect your rest.' },
    5: { favourable: 'Make room for love, play and learning.', mixed: 'Enjoy creative time, but keep speculative risks small.', challenging: 'Go gently with romance and children’s matters, and skip speculative bets.' },
    6: { favourable: 'Out-work competition, clear debts and fix your habits.', mixed: 'Keep routines tidy and see to small health niggles early.', challenging: 'Keep work pressure in check, avoid clashes with rivals and don’t skip rest.' },
    7: { favourable: 'Good for partnerships and agreements — meet people halfway.', mixed: 'Handle one-to-one relationships and agreements consciously.', challenging: 'Be patient with your partner and read agreements carefully before you sign.' },
    8: { favourable: 'Use the time for research and quiet, behind-the-scenes work.', mixed: 'Expect shifts — go slow on joint finances and big risks.', challenging: 'Avoid big risks and new joint financial commitments; keep plans flexible.' },
    9: { favourable: 'Say yes to learning, mentors and well-planned journeys.', mixed: 'Learning and travel go better with a clear plan.', challenging: 'Don’t lean on luck — plan journeys carefully and listen to good advice.' },
    10: { favourable: 'Put your best work where it will be seen.', mixed: 'Stay steady at work and let results speak.', challenging: 'Stay professional under pressure and avoid clashes with seniors.' },
    11: { favourable: 'Follow up on income, networks and long-held goals.', mixed: 'Gains come with effort — follow up, but don’t over-promise.', challenging: 'Keep income expectations realistic and be selective with favours.' },
    12: { favourable: 'A good time for rest, retreat, travel abroad and giving.', mixed: 'Budget for outflows and guard your sleep.', challenging: 'Keep a close eye on expenses and protect your sleep.' },
  },
  hi: {
    1: { favourable: 'अपनी योजनाओं के साथ आगे बढ़ें — ऊर्जा और व्यक्तित्व आपके साथ हैं।', mixed: 'अपनी गति संतुलित रखें और सेहत की दिनचर्या नियमित रखें।', challenging: 'ख़ुद पर दबाव कम रखें — आराम करें, अच्छा खाएँ और तुरंत प्रतिक्रिया देने से बचें।' },
    2: { favourable: 'बचत बढ़ाएँ और जो आपके लिए मूल्यवान है, उसके पक्ष में बोलें।', mixed: 'ख़र्च सोच-समझकर करें और वाणी में मिठास रखें।', challenging: 'ख़र्च पर नज़र रखें और घर में शब्दों का चुनाव सावधानी से करें।' },
    3: { favourable: 'अपनी पहल पर भरोसा करें — साहसी और ईमानदार प्रयास सफल होते हैं।', mixed: 'काम शुरू करें, पर नया लेने से पहले पुराना पूरा करें।', challenging: 'ज़बरदस्ती न करें; संदेश और छोटी यात्राएँ सरल रखें।' },
    4: { favourable: 'घर, परिवार या संपत्ति के मामले सुलझाने का अच्छा समय।', mixed: 'घर की ज़िम्मेदारियों और अपने आराम में संतुलन रखें।', challenging: 'घर का ध्यान रखें, संपत्ति के काग़ज़ दो बार जाँचें और अपनी नींद-आराम बचाएँ।' },
    5: { favourable: 'प्रेम, आनंद और पढ़ाई के लिए समय निकालें।', mixed: 'रचनात्मक कामों का आनंद लें, पर सट्टे जैसे जोखिम छोटे रखें।', challenging: 'प्रेम और संतान से जुड़े मामलों में धैर्य रखें, और सट्टे वाले दाँव से बचें।' },
    6: { favourable: 'प्रतिस्पर्धा में आगे निकलें, क़र्ज़ चुकाएँ और आदतें सुधारें।', mixed: 'दिनचर्या व्यवस्थित रखें और छोटी स्वास्थ्य शिकायतों पर समय रहते ध्यान दें।', challenging: 'काम का दबाव सीमित रखें, विरोधियों से टकराव टालें और आराम न छोड़ें।' },
    7: { favourable: 'साझेदारी और समझौतों के लिए अच्छा — दूसरों से आधे रास्ते मिलें।', mixed: 'आमने-सामने के रिश्ते और समझौते सोच-समझकर निभाएँ।', challenging: 'जीवनसाथी के साथ धैर्य रखें और हस्ताक्षर से पहले हर समझौता ध्यान से पढ़ें।' },
    8: { favourable: 'शोध और पर्दे के पीछे के शांत काम के लिए समय का उपयोग करें।', mixed: 'बदलाव की उम्मीद रखें — साझा धन और बड़े जोखिम में धीरे चलें।', challenging: 'बड़े जोखिम और नई साझा आर्थिक ज़िम्मेदारियों से बचें; योजनाएँ लचीली रखें।' },
    9: { favourable: 'पढ़ाई, गुरुजन और सोची-समझी यात्राओं को हाँ कहें।', mixed: 'पढ़ाई और यात्रा स्पष्ट योजना के साथ बेहतर चलती हैं।', challenging: 'सिर्फ़ भाग्य के भरोसे न रहें — यात्रा की योजना ध्यान से बनाएँ और अच्छी सलाह सुनें।' },
    10: { favourable: 'अपना सबसे अच्छा काम वहाँ रखें जहाँ वह दिखे।', mixed: 'काम में स्थिर रहें और परिणामों को बोलने दें।', challenging: 'दबाव में भी पेशेवर रवैया रखें और वरिष्ठों से टकराव टालें।' },
    11: { favourable: 'आय, संपर्कों और पुराने लक्ष्यों पर आगे बढ़ें।', mixed: 'लाभ मेहनत से आता है — फ़ॉलो-अप करें, पर ज़्यादा वादे न करें।', challenging: 'आय की उम्मीदें व्यावहारिक रखें और एहसान करने में चयनशील रहें।' },
    12: { favourable: 'आराम, एकांत, विदेश यात्रा और दान के लिए अच्छा समय।', mixed: 'ख़र्च का बजट बनाएँ और अपनी नींद की रक्षा करें।', challenging: 'ख़र्च पर कड़ी नज़र रखें और नींद पूरी लें।' },
  },
};

export const TONE_WORD: Record<Lang, Record<Tone, string>> = {
  en: { favourable: 'supportive', mixed: 'mixed', challenging: 'needs care' },
  hi: { favourable: 'शुभ', mixed: 'मिश्रित', challenging: 'सावधानी' },
};

export const DOMAIN_TITLE: Record<Lang, Record<Domain, string>> = {
  en: { love: 'Love & relationships', career: 'Career & work', money: 'Money & finance', health: 'Health & energy' },
  hi: { love: 'प्रेम और रिश्ते', career: 'करियर और नौकरी', money: 'धन और आर्थिक स्थिति', health: 'सेहत और ऊर्जा' },
};

/** Impact-first opening line per life area and overall tone. */
export const DOMAIN_IMPACT: Record<Lang, Record<Domain, Record<Tone, string>>> = {
  en: {
    love: { favourable: 'Love and close relationships have real support in 2027.', mixed: 'Relationships in 2027 are a mix of warm stretches and ones that ask for patience.', challenging: 'Relationships ask for patience and honest talk in 2027 — handled with care, they come out stronger.' },
    career: { favourable: 'Work has momentum in 2027 — effort is noticed and rewarded.', mixed: 'Career in 2027 moves in phases: steady gains in some stretches, slower going in others.', challenging: 'Work in 2027 asks for patience: more responsibility, slower recognition, and results that come from staying the course.' },
    money: { favourable: 'Money in 2027 leans positive — income and savings can grow with planning.', mixed: 'Money in 2027 is workable but uneven: plan for both gains and outflows.', challenging: 'Money in 2027 needs a careful budget: outflows and commitments run higher than usual.' },
    health: { favourable: 'Energy is generally good in 2027 — a solid year to build healthy habits.', mixed: 'Energy in 2027 rises and dips; a steady routine keeps you on an even keel.', challenging: 'Energy in 2027 needs looking after: pace yourself, keep routines regular and don’t skip rest or check-ups.' },
  },
  hi: {
    love: { favourable: '2027 में प्रेम और क़रीबी रिश्तों को अच्छा सहयोग मिलता है।', mixed: '2027 में रिश्तों में कुछ समय मधुर रहेगा और कुछ समय धैर्य माँगेगा।', challenging: '2027 में रिश्ते धैर्य और खुली बातचीत माँगते हैं — समझदारी से निभाएँ तो और मज़बूत होंगे।' },
    career: { favourable: '2027 में काम को गति मिलती है — मेहनत दिखती है और उसका फल मिलता है।', mixed: '2027 में करियर चरणों में आगे बढ़ेगा: कुछ समय स्थिर लाभ, कुछ समय धीमी चाल।', challenging: '2027 में काम धैर्य माँगता है: ज़िम्मेदारियाँ बढ़ेंगी, पहचान धीरे आएगी, और परिणाम डटे रहने से मिलेंगे।' },
    money: { favourable: '2027 में धन की स्थिति अनुकूल है — योजना से आय और बचत दोनों बढ़ सकती हैं।', mixed: '2027 में धन की स्थिति ठीक है पर एक-सी नहीं: लाभ और ख़र्च दोनों के लिए तैयार रहें।', challenging: '2027 में धन के लिए सावधान बजट ज़रूरी है: ख़र्च और ज़िम्मेदारियाँ सामान्य से ज़्यादा रहेंगी।' },
    health: { favourable: '2027 में ऊर्जा आम तौर पर अच्छी रहेगी — अच्छी आदतें बनाने का बढ़िया वर्ष।', mixed: '2027 में ऊर्जा ऊपर-नीचे होगी; नियमित दिनचर्या आपको संतुलित रखेगी।', challenging: '2027 में ऊर्जा का ध्यान रखना ज़रूरी है: अपनी गति संतुलित रखें, दिनचर्या नियमित रखें और आराम व नियमित जाँच न छोड़ें।' },
  },
};

/** Practical "what to do" per life area and tone. */
export const DOMAIN_TODO: Record<Lang, Record<Domain, Record<Tone, string>>> = {
  en: {
    love: { favourable: 'Make time for each other, say the important things, and if you are single, let friends introduce you.', mixed: 'Plan time together in the supportive windows below and keep difficult conversations calm and short.', challenging: 'Listen more than you argue, keep promises small and real, and don’t make big relationship decisions in a temper.' },
    career: { favourable: 'Ask for the bigger role, show your work and say yes to well-judged opportunities.', mixed: 'Push new plans in the strong windows, and use the slower ones to finish, train and tidy up.', challenging: 'Keep your head down, document your work, stay on good terms with seniors and avoid quitting in frustration.' },
    money: { favourable: 'Automate savings, clear expensive debt and invest only after research.', mixed: 'Keep an emergency fund, time big purchases for the supportive windows and avoid lending what you can’t lose.', challenging: 'Write a monthly budget, avoid new loans and speculative bets, and read every financial document twice.' },
    health: { favourable: 'Use the good energy to start a routine you can keep: regular sleep, movement and simple food.', mixed: 'Keep sleep, meals and exercise regular, and don’t ignore small niggles.', challenging: 'Book routine check-ups, keep sleep and meals regular, drive and travel with ordinary care, and ask for help when you are stretched.' },
  },
  hi: {
    love: { favourable: 'एक-दूसरे के लिए समय निकालें, ज़रूरी बातें कहें, और अगर आप अविवाहित हैं तो मित्रों के माध्यम से मिलने-जुलने के अवसर खुले रखें।', mixed: 'नीचे दिए शुभ समय में साथ समय बिताने की योजना बनाएँ और कठिन बातचीत शांत व छोटी रखें।', challenging: 'बहस से ज़्यादा सुनें, छोटे और सच्चे वादे करें, और ग़ुस्से में रिश्तों के बड़े फ़ैसले न लें।' },
    career: { favourable: 'बड़ी भूमिका माँगें, अपना काम सामने रखें और सोचे-समझे अवसरों को हाँ कहें।', mixed: 'नई योजनाएँ शुभ समय में आगे बढ़ाएँ, और धीमे समय में अधूरे काम पूरे करें, सीखें और व्यवस्था सुधारें।', challenging: 'चुपचाप मेहनत करें, अपने काम का रिकॉर्ड रखें, वरिष्ठों से अच्छे संबंध रखें और झुंझलाहट में नौकरी छोड़ने से बचें।' },
    money: { favourable: 'बचत अपने आप होने दें, महँगा क़र्ज़ चुकाएँ और पूरी जानकारी के बाद ही निवेश करें।', mixed: 'आपातकालीन कोष रखें, बड़ी ख़रीदारी शुभ समय में करें और उतना ही उधार दें जितना खो सकें।', challenging: 'हर महीने का बजट लिखें, नया क़र्ज़ और सट्टे वाले दाँव टालें, और हर आर्थिक काग़ज़ दो बार पढ़ें।' },
    health: { favourable: 'अच्छी ऊर्जा का उपयोग ऐसी दिनचर्या शुरू करने में करें जो टिक सके: नियमित नींद, व्यायाम और सादा भोजन।', mixed: 'नींद, भोजन और व्यायाम नियमित रखें, और छोटी शिकायतों को नज़रअंदाज़ न करें।', challenging: 'नियमित जाँच करवाएँ, नींद और भोजन का समय तय रखें, वाहन व यात्रा में सामान्य सावधानी रखें, और ज़्यादा दबाव में मदद माँगें।' },
  },
};

/** Traditional colour and Chaldean number of each planet (lucky colour / number). */
export const PLANET_COLOUR: Record<Lang, Record<YPlanet, string>> = {
  en: { Sun: 'copper red', Mercury: 'green', Venus: 'white', Mars: 'red', Jupiter: 'yellow', Saturn: 'dark blue', Rahu: 'smoky grey', Ketu: 'grey' },
  hi: { Sun: 'ताँबई लाल', Mercury: 'हरा', Venus: 'सफ़ेद', Mars: 'लाल', Jupiter: 'पीला', Saturn: 'गहरा नीला', Rahu: 'धुएँ जैसा स्लेटी', Ketu: 'स्लेटी' },
};
export const PLANET_NUMBER: Record<YPlanet, number> = { Sun: 1, Jupiter: 3, Rahu: 4, Mercury: 5, Venus: 6, Ketu: 7, Saturn: 8, Mars: 9 };
/** Weekday ruled by each planet (0 = Sunday). */
export const PLANET_WEEKDAY: Record<string, number> = { Sun: 0, Moon: 1, Mars: 2, Mercury: 3, Jupiter: 4, Venus: 5, Saturn: 6 };

export const MONTH_VERDICT: Record<Lang, { best: string; good: string; mixed: string; care: string; hard: string }> = {
  en: {
    best: 'One of your strongest months of 2027',
    good: 'A supportive month',
    mixed: 'A mixed month — some help, some friction',
    care: 'A month to pace yourself',
    hard: 'One of the months of 2027 to go carefully',
  },
  hi: {
    best: '2027 के आपके सबसे अच्छे महीनों में से एक',
    good: 'सहयोग देने वाला महीना',
    mixed: 'मिला-जुला महीना — कुछ सहयोग, कुछ रुकावट',
    care: 'संभलकर चलने का महीना',
    hard: '2027 के उन महीनों में से एक जिनमें विशेष सावधानी रखें',
  },
};

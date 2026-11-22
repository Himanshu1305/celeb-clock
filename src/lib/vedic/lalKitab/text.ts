/**
 * Lal Kitab wording (B18) — BornClock's own plain-language text, English + Hindi.
 * Tone rules: calm, optional, never fear; no death / disease / certainty wording; remedies are
 * free or near-free everyday acts, never a gemstone or a paid ritual. The remedy themes come
 * from the AstroSage Lal Kitab planet pages (https://astrosage.com/lalkitab/LKSun.asp …
 * LKKetu.asp) and, for the debts, Kamal Kapoor (https://www.kamalkapoor.com/lalkitab/) and
 * InstaAstro (https://instaastro.com/lal-kitab/debts) — rewritten in our words, with anything
 * unsafe, costly or unkind left out.
 */
import type { LkPlanet, RinKey } from './tables';

export type Lang = 'en' | 'hi';
type Bi = [string, string];
const pick = (b: Bi, lang: Lang) => (lang === 'hi' ? b[1] : b[0]);

export const PLANET_HI: Record<LkPlanet, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु (बृहस्पति)',
  Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};
export const planetName = (p: LkPlanet, lang: Lang) => (lang === 'hi' ? PLANET_HI[p] : p);

/** What each house is about in Lal Kitab (short). */
export const HOUSE_THEME: Bi[] = [
  ['self, reputation, standing and authority', 'स्वयं, मान-सम्मान और सरकार से संबंध'],
  ['family, savings, speech and in-laws', 'परिवार, धन-संचय, वाणी और ससुराल'],
  ['siblings, courage and effort', 'भाई-बहन, साहस और परिश्रम'],
  ['mother, home, peace of mind and property', 'माता, घर, मन की शांति और संपत्ति'],
  ['children, learning and creativity', 'संतान, शिक्षा और रचनात्मकता'],
  ['maternal family, service, rivals and routines', 'ननिहाल, सेवा, प्रतिस्पर्धी और दिनचर्या'],
  ['marriage, partners and business dealings', 'विवाह, साझेदारी और व्यापार'],
  ['hidden matters, sudden turns and inheritance', 'गुप्त बातें, अचानक बदलाव और विरासत'],
  ['fortune, faith, father and long journeys', 'भाग्य, धर्म, पिता और लंबी यात्राएँ'],
  ['career, father’s line and public work', 'कर्म-क्षेत्र, पिता का कुल और सार्वजनिक कार्य'],
  ['income, gains and friends', 'आय, लाभ और मित्र'],
  ['expenses, rest, sleep and distant places', 'खर्च, विश्राम, नींद और दूर के स्थान'],
];
export const houseTheme = (h: number, lang: Lang) => pick(HOUSE_THEME[h - 1], lang);

/** Houses AstroSage lists as good / bad for each planet (the remaining houses are mixed). */
const GOOD: Record<LkPlanet, number[]> = {
  Sun: [1, 2, 3, 4, 5, 8, 9, 11, 12], Moon: [1, 2, 3, 4, 5, 7, 9], Mars: [1, 2, 3, 5, 6, 7, 9, 10, 11, 12],
  Mercury: [1, 2, 4, 5, 6, 7], Jupiter: [1, 2, 4, 5, 8, 9, 12], Venus: [2, 3, 4, 7, 12],
  Saturn: [2, 3, 7, 8, 9, 10, 11, 12], Rahu: [3, 4, 6], Ketu: [5, 9, 11, 12],
};
const CARE: Record<LkPlanet, number[]> = {
  Sun: [6, 7, 10], Moon: [6, 8, 10, 11, 12], Mars: [4, 8], Mercury: [3, 8, 9, 10, 11, 12],
  Jupiter: [6, 7, 10], Venus: [1, 6, 9], Saturn: [1, 4, 5, 6], Rahu: [8, 9, 11], Ketu: [6, 8],
};
export type Tone = 'supportive' | 'mixed' | 'care';
export function toneOf(p: LkPlanet, house: number): Tone {
  if (CARE[p].includes(house)) return 'care';
  if (GOOD[p].includes(house)) return 'supportive';
  return 'mixed';
}
export const TONE_LABEL: Record<Tone, Bi> = {
  supportive: ['Supportive', 'सहायक'],
  mixed: ['Mixed', 'मिश्रित'],
  care: ['Asks for care', 'सावधानी चाहिए'],
};

/** One reading per planet per house (index = house - 1). */
const READING: Record<LkPlanet, Bi[]> = {
  Sun: [
    ['Self-respect, leadership and goodwill from people in authority come naturally here. Staying humble keeps it bright.', 'आत्मसम्मान, नेतृत्व और अधिकारियों का सहयोग सहज रूप से मिलता है। विनम्र रहना इसे और उज्ज्वल रखता है।'],
    ['Self-reliant and helpful to the family; steady handling of family money and kind speech bring respect.', 'आत्मनिर्भर और परिवार के सहायक; परिवार के धन को संभलकर रखना और मीठी वाणी सम्मान दिलाती है।'],
    ['Courage and a sharp, analytical mind — good for study, planning and taking the first step.', 'साहस और तेज़, विश्लेषण करने वाला मन — पढ़ाई, योजना और पहल के लिए अच्छा।'],
    ['Steady comforts and a thoughtful nature; generosity at home keeps this placement warm.', 'स्थिर सुख-सुविधाएँ और विचारशील स्वभाव; घर में उदारता इस स्थिति को शुभ रखती है।'],
    ['Pride in children and creative work; the family’s standing tends to grow with time.', 'संतान और रचनात्मक काम पर गर्व; समय के साथ परिवार का मान बढ़ता है।'],
    ['Luck through service and steady work. Keep good ties with the mother’s family and keep your temper in check.', 'सेवा और लगातार मेहनत से भाग्य साथ देता है। ननिहाल से अच्छे संबंध रखें और क्रोध पर संयम रखें।'],
    ['Lal Kitab’s debilitated house for the Sun: pride and partnership pull against each other, so patience at home helps.', 'लाल किताब में सूर्य का नीच घर: अहं और साझेदारी में खिंचाव रहता है, इसलिए घर में धैर्य मदद करता है।'],
    ['Often read as protective in difficult moments; truthfulness and simple living suit it.', 'कठिन समय में रक्षा करने वाली स्थिति मानी जाती है; सच्चाई और सादा जीवन इसके अनुकूल हैं।'],
    ['Respect for traditions and elders; keep ancestral belongings and avoid extremes of temper.', 'परंपरा और बड़ों का आदर; पुश्तैनी वस्तुएँ संभालकर रखें और क्रोध की अति से बचें।'],
    ['Career and the father’s line ask for care; steady, honest effort pays better than shortcuts.', 'कर्म-क्षेत्र और पिता के कुल से जुड़ी बातों में सावधानी चाहिए; ईमानदार, लगातार मेहनत शॉर्टकट से बेहतर है।'],
    ['Income can grow well; clean habits keep the gains steady.', 'आय अच्छी बढ़ सकती है; साफ़-सुथरी आदतें लाभ को स्थिर रखती हैं।'],
    ['Rest and sleep may feel unsettled at times; a forgiving, truthful attitude settles this placement.', 'नींद और विश्राम कभी-कभी अस्थिर लग सकते हैं; क्षमा और सच्चाई का भाव इसे शांत करता है।'],
  ],
  Moon: [
    ['A gentle, caring nature and warmth with people; respect for the mother is central.', 'कोमल, देखभाल करने वाला स्वभाव और लोगों से अपनापन; माता का आदर सबसे अहम।'],
    ['Lal Kitab’s exalted house for the Moon: a settled family life, sweet speech and steady savings.', 'लाल किताब में चंद्र का उच्च घर: स्थिर पारिवारिक जीवन, मीठी वाणी और लगातार बचत।'],
    ['Courage with a soft heart and help from siblings; generosity brings support.', 'कोमल हृदय के साथ साहस और भाई-बहनों से सहयोग; उदारता से सहारा मिलता है।'],
    ['The Moon’s pakka ghar: deep peace at home and a strong bond with the mother. Giving freely keeps it full.', 'चंद्र का पक्का घर: घर में गहरी शांति और माता से मज़बूत रिश्ता। खुले मन से देना इसे भरा रखता है।'],
    ['Learning, children and good judgement are supported; avoid selfishness.', 'शिक्षा, संतान और अच्छे निर्णय को बल; स्वार्थ से बचें।'],
    ['Feelings can swing; caring for the father and keeping regular routines help.', 'भावनाएँ ऊपर-नीचे हो सकती हैं; पिता की सेवा और नियमित दिनचर्या मदद करती है।'],
    ['Warm partnerships and good relations with the public; the mother’s goodwill matters.', 'साझेदारी में अपनापन और लोगों से अच्छे संबंध; माता का आशीर्वाद महत्वपूर्ण।'],
    ['Lal Kitab’s debilitated house for the Moon: the mind can be restless. Honouring elders and ancestors steadies it.', 'लाल किताब में चंद्र का नीच घर: मन बेचैन रह सकता है। बड़ों और पूर्वजों का सम्मान इसे स्थिर करता है।'],
    ['Faith, travel and a kind heart; serving others brings comfort.', 'आस्था, यात्रा और दयालु हृदय; दूसरों की सेवा से सुकून मिलता है।'],
    ['Work can feel emotionally heavy at times; moderation and simple habits help.', 'काम कभी-कभी मन पर भारी लग सकता है; संयम और सादी आदतें मदद करती हैं।'],
    ['Gains come, though the mind may worry over them; generosity eases it.', 'लाभ मिलता है, पर मन उनकी चिंता कर सकता है; उदारता इसे हल्का करती है।'],
    ['Spending and sleep need attention; regular prayer or quiet time steadies the mind.', 'खर्च और नींद पर ध्यान चाहिए; नियमित प्रार्थना या शांत समय मन को स्थिर करता है।'],
  ],
  Mars: [
    ['Bold, truthful and energetic; Lal Kitab advises not accepting things for free.', 'निडर, सच्चे और ऊर्जावान; लाल किताब मुफ़्त में चीज़ें न लेने की सलाह देती है।'],
    ['A protector of the household who supports family and in-laws.', 'घर-परिवार के रक्षक, जो परिवार और ससुराल दोनों का साथ देते हैं।'],
    ['Mars’ pakka ghar: courage, initiative and help from brothers. Humility keeps it strong.', 'मंगल का पक्का घर: साहस, पहल और भाइयों का साथ। विनम्रता इसे मज़बूत रखती है।'],
    ['Lal Kitab’s debilitated house for Mars: home life can feel heated. Patience and gentle words cool it down.', 'लाल किताब में मंगल का नीच घर: घर का माहौल गरम हो सकता है। धैर्य और नरम शब्द इसे शांत करते हैं।'],
    ['Energy for children and creative effort; good conduct is the key.', 'संतान और रचनात्मक काम के लिए ऊर्जा; अच्छा आचरण इसकी कुंजी है।'],
    ['Strong against rivals and obstacles; supports service and competitive work.', 'प्रतिस्पर्धियों और बाधाओं पर भारी; सेवा और प्रतियोगी काम में सहायक।'],
    ['Drive in partnerships and business; kindness to the women of the family helps.', 'साझेदारी और व्यापार में जोश; परिवार की बेटियों-बहनों से स्नेह शुभ रहता है।'],
    ['Also a pakka ghar of Mars, but a demanding one: sudden turns call for calm decisions and service to others.', 'यह भी मंगल का पक्का घर है, पर कठिन: अचानक बदलावों में शांत निर्णय और सेवा मदद करते हैं।'],
    ['Respect for elder brothers and family traditions brings fortune.', 'बड़े भाई और पारिवारिक परंपराओं का सम्मान भाग्य जगाता है।'],
    ['Lal Kitab’s exalted house for Mars: strong drive in career, property and leadership. Protect family assets.', 'लाल किताब में मंगल का उच्च घर: करियर, संपत्ति और नेतृत्व में दम। पारिवारिक संपत्ति को संभालकर रखें।'],
    ['Gains through effort and property; never sell ancestral property in haste.', 'मेहनत और संपत्ति से लाभ; पुश्तैनी संपत्ति जल्दबाज़ी में कभी न बेचें।'],
    ['A generous spirit; sweetness in speech and habits brings comfort.', 'उदार स्वभाव; वाणी और आदतों में मिठास सुख देती है।'],
  ],
  Mercury: [
    ['Quick wit and good communication; steady, honest dealings suit it best.', 'तेज़ बुद्धि और अच्छी बातचीत; ईमानदार, स्थिर व्यवहार इसके लिए सबसे अच्छा।'],
    ['Clever with money and words; clean habits keep it favourable.', 'धन और शब्दों में चतुर; साफ़-सुथरी आदतें इसे शुभ रखती हैं।'],
    ['Words can create friction with siblings; mindful speech helps.', 'शब्दों से भाई-बहनों में खटास आ सकती है; सोच-समझकर बोलना मदद करता है।'],
    ['Good learning and peace of mind; supportive for trade and education.', 'अच्छी शिक्षा और मन की शांति; व्यापार और पढ़ाई के लिए सहायक।'],
    ['A bright intellect and creative thinking — good for study and advising others.', 'तेज़ बुद्धि और रचनात्मक सोच — पढ़ाई और सलाह देने के काम के लिए अच्छी।'],
    ['Lal Kitab’s exalted house for Mercury: sharp analysis, writing and problem-solving.', 'लाल किताब में बुध का उच्च घर: तीखा विश्लेषण, लेखन और समस्या सुलझाने की क्षमता।'],
    ['Mercury’s pakka ghar: a talent for business and partnership; avoid speculation.', 'बुध का पक्का घर: व्यापार और साझेदारी की प्रतिभा; सट्टे से बचें।'],
    ['Worry and scattered thinking can creep in; quiet routines help.', 'चिंता और बिखरी सोच आ सकती है; शांत दिनचर्या मदद करती है।'],
    ['Beliefs may waver; steady faith and good company help.', 'विश्वास डगमगा सकता है; स्थिर आस्था और अच्छी संगत मदद करती है।'],
    ['Work asks for clean habits; avoid shortcuts.', 'काम में साफ़ आदतें ज़रूरी; शॉर्टकट से बचें।'],
    ['Gains through intelligence, but be wary of unreliable advice.', 'बुद्धि से लाभ, पर अविश्वसनीय सलाह से सावधान रहें।'],
    ['Lal Kitab’s debilitated house for Mercury: overthinking and expenses. Take advice before big decisions.', 'लाल किताब में बुध का नीच घर: ज़्यादा सोचना और खर्च। बड़े फ़ैसलों से पहले सलाह लें।'],
  ],
  Jupiter: [
    ['Wisdom and respect; serving others keeps it bright.', 'ज्ञान और सम्मान; दूसरों की सेवा इसे उज्ज्वल रखती है।'],
    ['Jupiter’s pakka ghar: generosity, respect in society and a blessed household.', 'गुरु का पक्का घर: उदारता, समाज में सम्मान और सुखी घर।'],
    ['Knowledge and courage together; keep away from flatterers.', 'ज्ञान और साहस साथ-साथ; चापलूसों से दूर रहें।'],
    ['Lal Kitab’s exalted house for Jupiter: home, peace and good fortune are well supported.', 'लाल किताब में गुरु का उच्च घर: घर, शांति और भाग्य को अच्छा बल।'],
    ['Blessings through children, learning and teachers.', 'संतान, शिक्षा और गुरुजनों से आशीर्वाद।'],
    ['Help comes from others when needed; keep giving without show.', 'ज़रूरत पर दूसरों से मदद मिलती है; बिना दिखावे के देते रहें।'],
    ['Partnerships ask for humility; respect for elders and simple faith help.', 'साझेदारी में विनम्रता चाहिए; बड़ों का आदर और सरल आस्था मदद करती है।'],
    ['Protection in hard times; faith and service bring relief.', 'कठिन समय में रक्षा; आस्था और सेवा से राहत।'],
    ['Fortune, faith and support from elders are strong here.', 'यहाँ भाग्य, आस्था और बड़ों का साथ मज़बूत है।'],
    ['Lal Kitab’s debilitated house for Jupiter: career growth asks for patience and humility; avoid showing off.', 'लाल किताब में गुरु का नीच घर: करियर में धैर्य और विनम्रता चाहिए; दिखावे से बचें।'],
    ['Income and friendships grow with honesty.', 'ईमानदारी से आय और मित्रता बढ़ती है।'],
    ['A spiritual nature and peaceful rest; truthful conduct keeps it good.', 'आध्यात्मिक स्वभाव और शांत विश्राम; सच्चा आचरण इसे शुभ रखता है।'],
  ],
  Venus: [
    ['Charm and comforts, though early decisions in love need care.', 'आकर्षण और सुख-सुविधा, पर प्रेम में जल्दी के फ़ैसलों में सावधानी चाहिए।'],
    ['A house of Venus: comforts, beauty and a happy home.', 'शुक्र का घर: सुख-सुविधा, सौंदर्य और सुखी घर।'],
    ['Artistic courage and a caring partner; respect in marriage is the key.', 'कलात्मक साहस और देखभाल करने वाला जीवनसाथी; विवाह में सम्मान इसकी कुंजी है।'],
    ['Comforts at home; harmony between mother and spouse needs balance.', 'घर में सुख; माता और जीवनसाथी के बीच संतुलन चाहिए।'],
    ['Love and creativity; respect the family’s wishes in relationships.', 'प्रेम और रचनात्मकता; रिश्तों में परिवार की इच्छा का सम्मान करें।'],
    ['Lal Kitab’s debilitated house for Venus: married life and comforts need extra care and respect.', 'लाल किताब में शुक्र का नीच घर: दांपत्य और सुख-सुविधा में अतिरिक्त ध्यान और सम्मान चाहिए।'],
    ['Venus’ pakka ghar: partnership, marriage and comforts are well supported.', 'शुक्र का पक्का घर: साझेदारी, विवाह और सुख-सुविधा को अच्छा बल।'],
    ['Relationships ask for maturity and patience.', 'रिश्तों में परिपक्वता और धैर्य चाहिए।'],
    ['Comforts may come a little later; steady effort and family harmony help.', 'सुख थोड़ा देर से आ सकता है; लगातार मेहनत और पारिवारिक मेल मदद करता है।'],
    ['Comfort through work; moderation in habits helps.', 'काम से सुख; आदतों में संयम मदद करता है।'],
    ['Gains through arts, beauty and partnerships.', 'कला, सौंदर्य और साझेदारी से लाभ।'],
    ['Lal Kitab’s exalted house for Venus: devotion, comfort and a supportive partner.', 'लाल किताब में शुक्र का उच्च घर: भक्ति, सुख और सहयोगी जीवनसाथी।'],
  ],
  Saturn: [
    ['Lal Kitab’s debilitated house for Saturn: things can feel slow at first. Discipline and avoiding alcohol help.', 'लाल किताब में शनि का नीच घर: शुरुआत में काम धीमे लग सकते हैं। अनुशासन और शराब से दूरी मदद करती है।'],
    ['Steady, practical and fair; family wealth builds slowly but surely.', 'स्थिर, व्यावहारिक और न्यायप्रिय; पारिवारिक धन धीरे पर पक्का बनता है।'],
    ['Industrious and protective; good for building long-term assets.', 'मेहनती और रक्षक; लंबी अवधि की संपत्ति बनाने के लिए अच्छा।'],
    ['Home matters ask for care; kindness to others helps.', 'घर से जुड़े मामलों में सावधानी चाहिए; दूसरों के प्रति दया मदद करती है।'],
    ['Children and studies ask for patience; generosity eases it.', 'संतान और पढ़ाई में धैर्य चाहिए; उदारता इसे आसान बनाती है।'],
    ['Service and routines ask for discipline; caring for animals helps.', 'सेवा और दिनचर्या में अनुशासन चाहिए; पशुओं की सेवा मदद करती है।'],
    ['Lal Kitab’s exalted house for Saturn: stable partnerships and gains through steady work.', 'लाल किताब में शनि का उच्च घर: स्थिर साझेदारी और लगातार मेहनत से लाभ।'],
    ['A pakka ghar of Saturn: endurance and protection; simple living suits it.', 'शनि का पक्का घर: सहनशक्ति और रक्षा; सादा जीवन इसके अनुकूल।'],
    ['Good fortune through steady work and long-term planning.', 'लगातार मेहनत और लंबी योजना से अच्छा भाग्य।'],
    ['Saturn’s pakka ghar: career, discipline and authority are strong; keep conduct clean.', 'शनि का पक्का घर: करियर, अनुशासन और अधिकार मज़बूत; आचरण साफ़ रखें।'],
    ['Steady income; good conduct keeps the gains lasting.', 'स्थिर आय; अच्छा आचरण लाभ को टिकाऊ बनाता है।'],
    ['Quiet strength and protection; keep the home simple and clean.', 'शांत शक्ति और रक्षा; घर को सादा और साफ़ रखें।'],
  ],
  Rahu: [
    ['Ambition and sudden rises; a calm mind and clear speech keep it steady.', 'महत्वाकांक्षा और अचानक उन्नति; शांत मन और साफ़ वाणी इसे स्थिर रखते हैं।'],
    ['Money can come and go; staying close to the mother and family helps.', 'धन आता-जाता रह सकता है; माता और परिवार के पास रहना मदद करता है।'],
    ['Lal Kitab’s exalted house for Rahu: fearless, inventive and good with communication.', 'लाल किताब में राहु का उच्च घर: निडर, नए विचारों वाला और संवाद में कुशल।'],
    ['Generally favourable for cleverness and home; keep finances orderly.', 'चतुराई और घर के लिए सामान्यतः शुभ; धन-व्यवस्था ठीक रखें।'],
    ['Children and education need attention; honest conduct helps.', 'संतान और शिक्षा पर ध्यान चाहिए; ईमानदार आचरण मदद करता है।'],
    ['Lal Kitab’s exalted house for Rahu: success over rivals and obstacles.', 'लाल किताब में राहु का उच्च घर: प्रतिस्पर्धियों और बाधाओं पर जीत।'],
    ['Partnerships need patience; avoid rushed commitments.', 'साझेदारी में धैर्य चाहिए; जल्दबाज़ी के वादों से बचें।'],
    ['Lal Kitab lists this as a debilitated house for Rahu: sudden ups and downs, so take care with risky work.', 'लाल किताब में राहु का नीच घर: अचानक उतार-चढ़ाव, इसलिए जोखिम भरे काम में सावधानी रखें।'],
    ['Lal Kitab lists this as a debilitated house for Rahu: faith and fortune need nurturing; respect elders and in-laws.', 'लाल किताब में राहु का नीच घर: आस्था और भाग्य को पोषण चाहिए; बड़ों और ससुराल का सम्मान करें।'],
    ['Career can rise suddenly; stay humble and help those in need.', 'करियर अचानक ऊपर जा सकता है; विनम्र रहें और ज़रूरतमंदों की मदद करें।'],
    ['Lal Kitab lists this as a debilitated house for Rahu: gains can feel unsteady; keep company and habits clean.', 'लाल किताब में राहु का नीच घर: लाभ अस्थिर लग सकता है; संगत और आदतें साफ़ रखें।'],
    ['Rahu’s pakka ghar: imagination and spending; rest well and avoid needless expense.', 'राहु का पक्का घर: कल्पनाशीलता और खर्च; अच्छी नींद लें और फ़िज़ूलख़र्ची से बचें।'],
  ],
  Ketu: [
    ['Travel and change; kindness to children and animals helps.', 'यात्रा और बदलाव; बच्चों और पशुओं से स्नेह मदद करता है।'],
    ['Steady discipline with money and words is needed.', 'धन और वाणी में स्थिर अनुशासन चाहिए।'],
    ['Courage with some restlessness; keep your promises.', 'साहस के साथ कुछ बेचैनी; अपने वादे निभाएँ।'],
    ['Peace at home asks for care; looking after the mother helps.', 'घर की शांति पर ध्यान चाहिए; माता की देखभाल मदद करती है।'],
    ['Lal Kitab’s exalted house for Ketu: good for children, learning and intuition.', 'लाल किताब में केतु का उच्च घर: संतान, शिक्षा और अंतर्ज्ञान के लिए अच्छा।'],
    ['Ketu’s pakka ghar, which Lal Kitab also lists as a debilitated house: protective, yet it asks for patience.', 'केतु का पक्का घर, जिसे लाल किताब नीच घर भी मानती है: रक्षा करता है, पर धैर्य माँगता है।'],
    ['Partnerships need clear words and humility.', 'साझेदारी में साफ़ बात और विनम्रता चाहिए।'],
    ['Lal Kitab’s debilitated house for Ketu: sudden changes; stay calm and seek the guidance of elders.', 'लाल किताब में केतु का नीच घर: अचानक बदलाव; शांत रहें और बड़ों का मार्गदर्शन लें।'],
    ['Lal Kitab’s exalted house for Ketu: fortune, travel and protection for the family.', 'लाल किताब में केतु का उच्च घर: भाग्य, यात्रा और परिवार की रक्षा।'],
    ['Career may change direction; steadiness helps.', 'करियर की दिशा बदल सकती है; स्थिरता मदद करती है।'],
    ['Gains through people and networks; a supportive placement.', 'लोगों और संपर्कों से लाभ; सहायक स्थिति।'],
    ['Lal Kitab’s exalted house for Ketu: inner calm and restful sleep.', 'लाल किताब में केतु का उच्च घर: आंतरिक शांति और सुकून भरी नींद।'],
  ],
};
export const reading = (p: LkPlanet, house: number, lang: Lang) => pick(READING[p][house - 1], lang);

/** A simple, everyday remedy for each planet — used when no house-specific one is listed. */
const GENERAL_REMEDY: Record<LkPlanet, Bi> = {
  Sun: ['Offer a little jaggery in flowing water, and keep honest dealings with people in authority.', 'बहते पानी में थोड़ा गुड़ प्रवाहित करें और अधिकारियों से ईमानदार व्यवहार रखें।'],
  Moon: ['Respect and serve your mother, and keep a small square piece of silver at home.', 'माता का आदर और सेवा करें, और घर में चाँदी का एक छोटा चौकोर टुकड़ा रखें।'],
  Mars: ['Offer sweets to the daughters and sisters of the family, and keep a small piece of silver at home.', 'परिवार की बेटियों-बहनों को मिठाई दें और घर में चाँदी का एक छोटा टुकड़ा रखें।'],
  Mercury: ['Feed birds, and keep habits clean — no liquor, eggs or meat — on the days you follow the remedy.', 'पक्षियों को दाना डालें, और उपाय के दिनों में आदतें साफ़ रखें — शराब, अंडा, मांस नहीं।'],
  Jupiter: ['Water a peepal tree and apply a small saffron (kesar) tilak.', 'पीपल के पेड़ में जल चढ़ाएँ और केसर का छोटा तिलक लगाएँ।'],
  Venus: ['Feed a cow, and treat your spouse with care and respect.', 'गाय को भोजन दें, और जीवनसाथी से स्नेह व सम्मान से पेश आएँ।'],
  Saturn: ['Feed crows and stray dogs, and stay away from alcohol.', 'कौओं और गली के कुत्तों को भोजन दें, और शराब से दूर रहें।'],
  Rahu: ['Offer a coconut or a little barley in flowing water, and keep a small silver item with you.', 'बहते पानी में नारियल या थोड़े जौ प्रवाहित करें, और चाँदी की एक छोटी वस्तु पास रखें।'],
  Ketu: ['Feed a dog, and apply a small saffron (kesar) tilak.', 'कुत्ते को भोजन दें, और केसर का छोटा तिलक लगाएँ।'],
};

/** House-specific remedies (only where the placement asks for care). Key = `${planet}-${house}`. */
const HOUSE_REMEDY: Record<string, Bi> = {
  'Sun-7': ['Before starting work, take something sweet with a sip of water; go easy on salt.', 'काम शुरू करने से पहले थोड़ा मीठा खाकर पानी पिएँ; नमक कम लें।'],
  'Sun-10': ['Drop a copper coin into a river or canal, and avoid alcohol and meat.', 'नदी या नहर में ताँबे का एक सिक्का प्रवाहित करें, और शराब व मांस से दूर रहें।'],
  'Moon-6': ['Serve milk to your father with your own hands, and avoid drinking milk at night.', 'पिता को अपने हाथों से दूध पिलाएँ, और रात में दूध पीने से बचें।'],
  'Moon-8': ['Touch the feet of elders for their blessings, and offer chana dal at a place of worship.', 'बड़ों के पैर छूकर आशीर्वाद लें, और किसी धर्मस्थल पर चने की दाल चढ़ाएँ।'],
  'Moon-10': ['Visit a place of worship regularly, and avoid drinking milk at night.', 'नियमित रूप से धर्मस्थल जाएँ, और रात में दूध पीने से बचें।'],
  'Moon-11': ['Offer milk at a temple (traditionally a Bhairav temple).', 'किसी मंदिर में (परंपरा से भैरव मंदिर में) दूध चढ़ाएँ।'],
  'Moon-12': ['Visit places of worship and keep a few quiet minutes of prayer each day.', 'धर्मस्थलों पर जाएँ और रोज़ कुछ मिनट शांत प्रार्थना करें।'],
  'Mars-4': ['Offer sweetened milk at the roots of a banyan tree, and keep a square piece of silver.', 'बरगद की जड़ में मीठा दूध चढ़ाएँ, और चाँदी का चौकोर टुकड़ा रखें।'],
  'Mars-8': ['Feed tandoor-baked rotis to dogs, and take your meals in the kitchen.', 'कुत्तों को तंदूर की रोटी खिलाएँ, और भोजन रसोई में बैठकर करें।'],
  'Mercury-3': ['Feed birds regularly, and keep your words kind with siblings.', 'नियमित रूप से पक्षियों को दाना डालें, और भाई-बहनों से नरमी से बात करें।'],
  'Mercury-8': ['Keep a little rainwater or milk in a vessel on the roof.', 'छत पर किसी बर्तन में थोड़ा बारिश का पानी या दूध रखें।'],
  'Mercury-9': ['Avoid wearing green, and do not accept amulets from strangers.', 'हरा रंग पहनने से बचें, और अजनबियों से ताबीज़ न लें।'],
  'Mercury-10': ['Offer rice and milk at a place of worship, and avoid liquor, eggs and meat.', 'धर्मस्थल पर चावल और दूध चढ़ाएँ, और शराब, अंडा व मांस से बचें।'],
  'Mercury-11': ['Wear a copper coin on a white thread, and avoid the colour green.', 'सफ़ेद धागे में ताँबे का सिक्का पहनें, और हरे रंग से बचें।'],
  'Mercury-12': ['Float a new, empty earthen pot in a river; apply a saffron tilak; take advice before big decisions.', 'नदी में एक नया, खाली मिट्टी का घड़ा प्रवाहित करें; केसर का तिलक लगाएँ; बड़े फ़ैसलों से पहले सलाह लें।'],
  'Jupiter-6': ['Offer turmeric or chana dal at a temple, and give clothes to a temple priest.', 'मंदिर में हल्दी या चने की दाल चढ़ाएँ, और पुजारी को वस्त्र दान करें।'],
  'Jupiter-7': ['Offer prayers to Lord Shiva, and keep your faith simple.', 'भगवान शिव की आराधना करें, और आस्था सरल रखें।'],
  'Jupiter-10': ['Drop copper coins into running water, and apply a saffron tilak.', 'बहते पानी में ताँबे के सिक्के प्रवाहित करें, और केसर का तिलक लगाएँ।'],
  'Venus-1': ['Feed and care for a cow, and take the advice of elders before big choices.', 'गाय को भोजन दें और उसकी सेवा करें, और बड़े फ़ैसलों में बड़ों की सलाह लें।'],
  'Venus-6': ['Show your spouse respect and care; traditionally the spouse avoids walking barefoot.', 'जीवनसाथी का आदर और ध्यान रखें; परंपरा से जीवनसाथी नंगे पैर चलने से बचते हैं।'],
  'Venus-9': ['Bury a small piece of silver under a neem tree (a one-time act).', 'नीम के पेड़ के नीचे चाँदी का एक छोटा टुकड़ा दबाएँ (एक बार)।'],
  'Saturn-1': ['Offer sweetened milk at the roots of a banyan tree, feed monkeys, and avoid alcohol and non-vegetarian food.', 'बरगद की जड़ में मीठा दूध चढ़ाएँ, बंदरों को खिलाएँ, और शराब व मांसाहार से बचें।'],
  'Saturn-4': ['Feed crows with rice, and stay away from alcohol.', 'कौओं को चावल खिलाएँ, और शराब से दूर रहें।'],
  'Saturn-5': ['Offer almonds at a temple and keep half of them at home.', 'मंदिर में बादाम चढ़ाएँ और उनमें से आधे घर में रखें।'],
  'Saturn-6': ['Feed a black dog, and offer a coconut and almonds in running water.', 'काले कुत्ते को भोजन दें, और बहते पानी में नारियल व बादाम प्रवाहित करें।'],
  'Rahu-8': ['Keep a square piece of silver, and place a little fennel (saunf) under your pillow at night.', 'चाँदी का चौकोर टुकड़ा रखें, और रात को तकिये के नीचे थोड़ी सौंफ रखें।'],
  'Rahu-9': ['Apply a saffron tilak daily, keep good relations with your in-laws, and feed a dog.', 'रोज़ केसर का तिलक लगाएँ, ससुराल से अच्छे संबंध रखें, और कुत्ते को भोजन दें।'],
  'Rahu-11': ['Drink water from a silver glass, and avoid accepting electrical items as gifts.', 'चाँदी के गिलास में पानी पिएँ, और उपहार में बिजली का सामान लेने से बचें।'],
  'Ketu-6': ['Feed a dog, and drink milk with a pinch of saffron.', 'कुत्ते को भोजन दें, और चुटकी भर केसर वाला दूध पिएँ।'],
  'Ketu-8': ['Feed a dog, give a black-and-white blanket at a temple, and offer prayers to Lord Ganesha.', 'कुत्ते को भोजन दें, मंदिर में काला-सफ़ेद कंबल दान करें, और भगवान गणेश की पूजा करें।'],
};
export const remedyFor = (p: LkPlanet, house: number, lang: Lang) =>
  pick(HOUSE_REMEDY[`${p}-${house}`] ?? GENERAL_REMEDY[p], lang);
export const hasHouseRemedy = (p: LkPlanet, house: number) => !!HOUSE_REMEDY[`${p}-${house}`];
/** Exposed for the tests that keep the wording rules. */
export const ALL_TEXT_FOR_TESTS = (): string[] => [
  ...Object.values(READING).flat().flat(), ...Object.values(GENERAL_REMEDY).flat(), ...Object.values(HOUSE_REMEDY).flat(),
];

export const RIN_TEXT: Record<RinKey, { name: Bi; meaning: Bi; remedy: Bi }> = {
  pitri: {
    name: ['Pitri Rin (debt of the ancestors)', 'पितृ ऋण'],
    meaning: ['Read as an unfinished duty towards the father’s line, shown when Venus, Mercury or Rahu sits in a house of Jupiter (2, 5, 9 or 12).', 'पिता के कुल के प्रति अधूरे कर्तव्य का संकेत — जब शुक्र, बुध या राहु गुरु के घर (2, 5, 9 या 12) में हों।'],
    remedy: ['Collect an equal small amount from each family member and give it to a temple on the same day; watering a peepal tree is also traditional.', 'परिवार के हर सदस्य से बराबर छोटी राशि इकट्ठा करके उसी दिन मंदिर में दान करें; पीपल में जल चढ़ाना भी परंपरा है।'],
  },
  atma: {
    name: ['Atma (Swa) Rin (debt of the self)', 'आत्म (स्व) ऋण'],
    meaning: ['Read as one’s own past conduct asking to be set right, shown when Venus, Saturn, Rahu or Ketu sits in the 5th house.', 'अपने ही पिछले आचरण को सुधारने का संकेत — जब शुक्र, शनि, राहु या केतु पाँचवें घर में हों।'],
    remedy: ['With an equal contribution from each family member, arrange a simple havan at a place of worship.', 'परिवार के हर सदस्य के बराबर योगदान से किसी धर्मस्थल पर सादा हवन करवाएँ।'],
  },
  matri: {
    name: ['Matri Rin (debt of the mother)', 'मातृ ऋण'],
    meaning: ['Read as a duty towards the mother, shown when Ketu sits in the 4th house, the Moon’s house.', 'माता के प्रति कर्तव्य का संकेत — जब केतु चौथे घर (चंद्र के घर) में हो।'],
    remedy: ['Collect a small silver coin from each family member and offer them together in flowing water on the same day.', 'परिवार के हर सदस्य से चाँदी का एक छोटा सिक्का लेकर उसी दिन सब बहते पानी में प्रवाहित करें।'],
  },
  stri: {
    name: ['Stri Rin (debt towards women)', 'स्त्री ऋण'],
    meaning: ['Read as a duty of respect towards the women of the family, shown when the Sun, Moon or Rahu sits in the 2nd or 7th house (Venus’ houses).', 'परिवार की स्त्रियों के सम्मान के कर्तव्य का संकेत — जब सूर्य, चंद्र या राहु दूसरे या सातवें घर (शुक्र के घर) में हों।'],
    remedy: ['Pool a contribution from the family towards fodder for a cow shelter, given on one day.', 'परिवार के योगदान से किसी गौशाला में एक ही दिन चारे का दान करें।'],
  },
  bhai: {
    name: ['Bhai / Bandhu Rin (debt of brothers and relatives)', 'भाई / बंधु ऋण'],
    meaning: ['Read as a duty towards brothers and relatives, shown when Mercury or Venus sits in the 1st or 8th house (Mars’ houses).', 'भाइयों और संबंधियों के प्रति कर्तव्य का संकेत — जब बुध या शुक्र पहले या आठवें घर (मंगल के घर) में हों।'],
    remedy: ['Pool money from relatives and donate basic medicines to a charitable dispensary.', 'संबंधियों से राशि इकट्ठा करके किसी धर्मार्थ दवाखाने में ज़रूरी दवाइयाँ दान करें।'],
  },
  behan: {
    name: ['Behan / Putri Rin (debt of sisters and daughters)', 'बहन / पुत्री ऋण'],
    meaning: ['Read as a duty towards sisters and daughters, shown when the Moon sits in the 3rd or 6th house (Mercury’s houses).', 'बहनों और बेटियों के प्रति कर्तव्य का संकेत — जब चंद्र तीसरे या छठे घर (बुध के घर) में हो।'],
    remedy: ['Collect yellow cowries from family members, burn them on one day and offer the ash in flowing water.', 'परिवार के सदस्यों से पीली कौड़ियाँ लेकर एक ही दिन जलाएँ और राख बहते पानी में प्रवाहित करें।'],
  },
  jaalim: {
    name: ['Jaalim Rin (debt of harshness)', 'ज़ालिम (निर्दयी) ऋण'],
    meaning: ['Read as a call to make up for harshness towards those who work for us, shown when the Sun, Moon or Mars sits in the 10th or 11th house (Saturn’s houses).', 'अपने लिए काम करने वालों के प्रति कठोरता की भरपाई का संकेत — जब सूर्य, चंद्र या मंगल दसवें या ग्यारहवें घर (शनि के घर) में हों।'],
    remedy: ['With a family contribution, give a meal to labourers, or food for fish, on one day.', 'परिवार के योगदान से एक ही दिन मज़दूरों को भोजन, या मछलियों को दाना दें।'],
  },
  ajanma: {
    name: ['Ajanma Rin (debt of the unborn)', 'अजन्मा ऋण'],
    meaning: ['Read as an old family obligation, shown when the Sun, Venus or Mars sits in the 12th house (Rahu’s house).', 'परिवार के किसी पुराने दायित्व का संकेत — जब सूर्य, शुक्र या मंगल बारहवें घर (राहु के घर) में हों।'],
    remedy: ['Collect a coconut from each family member and offer them together in flowing water on one day.', 'परिवार के हर सदस्य से एक नारियल लेकर एक ही दिन सब बहते पानी में प्रवाहित करें।'],
  },
  prakritik: {
    name: ['Prakritik (Daivik) Rin (debt to nature)', 'प्राकृतिक (दैविक) ऋण'],
    meaning: ['Read as a duty of kindness towards animals and nature, shown when the Moon or Mars sits in the 6th house (Ketu’s house).', 'पशुओं और प्रकृति के प्रति दया के कर्तव्य का संकेत — जब चंद्र या मंगल छठे घर (केतु के घर) में हों।'],
    remedy: ['With a family contribution, feed street dogs on one day.', 'परिवार के योगदान से एक ही दिन गली के कुत्तों को भोजन कराएँ।'],
  },
};
export const rinText = (k: RinKey, lang: Lang) => ({ name: pick(RIN_TEXT[k].name, lang), meaning: pick(RIN_TEXT[k].meaning, lang), remedy: pick(RIN_TEXT[k].remedy, lang) });

export const TEVA_TEXT: Record<'blind' | 'semiBlind' | 'dharmi' | 'nabaligh', { name: Bi; rule: Bi; meaning: Bi }> = {
  blind: {
    name: ['Andha teva (blind chart)', 'अंधा टेवा'],
    rule: ['Two or more planets that are enemies of each other sit together in the 10th house.', 'दसवें घर में आपस में शत्रु दो या अधिक ग्रह साथ बैठे हों।'],
    meaning: ['Traditionally read as effort that misses its mark until it is steadied. Lal Kitab’s classic remedy is to feed ten visually impaired people, or offer almonds at a place of worship.', 'परंपरा में इसे ऐसी मेहनत माना जाता है जो स्थिर होने तक निशाना चूकती है। लाल किताब का पारंपरिक उपाय दस दृष्टिहीन लोगों को भोजन कराना, या धर्मस्थल पर बादाम चढ़ाना है।'],
  },
  semiBlind: {
    name: ['Ratandha teva (semi-blind chart)', 'रतौंधा (अर्ध-अंधा) टेवा'],
    rule: ['The Sun is in the 4th house and Saturn in the 7th.', 'सूर्य चौथे घर में और शनि सातवें घर में हो।'],
    meaning: ['Read as some areas of life being seen clearly and others less so. Avoiding late-night ventures and alcohol is the usual advice.', 'जीवन के कुछ क्षेत्र साफ़ दिखते हैं, कुछ कम — ऐसा माना जाता है। देर रात के कामों और शराब से बचना सामान्य सलाह है।'],
  },
  dharmi: {
    name: ['Dharmi teva (pious chart)', 'धर्मी टेवा'],
    rule: ['Jupiter and Saturn sit together, Saturn is in the 11th, or Rahu/Ketu is in the 4th or with the Moon.', 'गुरु और शनि साथ हों, शनि ग्यारहवें घर में हो, या राहु/केतु चौथे घर में या चंद्र के साथ हों।'],
    meaning: ['Read as a protected chart, where even the harsher planets tend to do little harm and life leans towards duty and faith.', 'एक सुरक्षित कुंडली मानी जाती है, जहाँ कठोर ग्रह भी कम हानि करते हैं और जीवन धर्म व कर्तव्य की ओर झुकता है।'],
  },
  nabaligh: {
    name: ['Nabaligh teva (minor chart)', 'नाबालिग टेवा'],
    rule: ['The 1st, 4th, 7th and 10th houses are empty or hold only Mercury, Saturn, Rahu or Ketu.', 'पहला, चौथा, सातवाँ और दसवाँ घर खाली हों या उनमें केवल बुध, शनि, राहु या केतु हों।'],
    meaning: ['Read as a chart whose promise matures slowly and settles with age.', 'ऐसी कुंडली मानी जाती है जिसका फल धीरे-धीरे पकता है और उम्र के साथ स्थिर होता है।'],
  },
};

/** Plain-language glossary (shown on the page and in the guide). */
export const GLOSSARY: Array<{ term: Bi; def: Bi }> = [
  { term: ['Lal Kitab', 'लाल किताब'], def: ['A set of Urdu astrology books (1939–1952, attributed to Pt. Roop Chand Joshi) known for reading the chart by houses and for simple, low-cost remedies.', 'उर्दू में लिखी ज्योतिष पुस्तकों का संग्रह (1939–1952, पं. रूपचंद जोशी), जो घरों के आधार पर कुंडली पढ़ने और सरल, सस्ते उपायों के लिए जानी जाती है।'] },
  { term: ['Teva', 'टेवा'], def: ['The Lal Kitab word for a birth chart.', 'लाल किताब में जन्म कुंडली का नाम।'] },
  { term: ['Khana (house)', 'खाना (घर)'], def: ['One of the 12 boxes of the chart. In Lal Kitab the 1st house is always Aries, the 2nd Taurus and so on.', 'कुंडली के 12 घरों में से एक। लाल किताब में पहला घर हमेशा मेष, दूसरा वृषभ, इसी क्रम में।'] },
  { term: ['Pakka ghar', 'पक्का घर'], def: ['A planet’s permanent house — where Lal Kitab considers it most at home (e.g. Sun 1st, Moon 4th).', 'ग्रह का स्थायी घर — जहाँ लाल किताब उसे सबसे सहज मानती है (जैसे सूर्य पहला, चंद्र चौथा)।'] },
  { term: ['Uchcha / Neech', 'उच्च / नीच'], def: ['The house where a planet is strongest (exalted) or weakest (debilitated) in Lal Kitab — by house, not by sign.', 'वह घर जहाँ लाल किताब में ग्रह सबसे बलवान (उच्च) या सबसे कमज़ोर (नीच) माना जाता है — घर से, राशि से नहीं।'] },
  { term: ['Drishti (aspect)', 'दृष्टि'], def: ['A planet “looking at” another house. In Lal Kitab, aspects run forward from the lower houses: 1→7, 2→6, 3→9 and 11, 4→10, 5→9, 6→12, 8→2.', 'ग्रह का किसी दूसरे घर को “देखना”। लाल किताब में दृष्टि निचले घरों से आगे की ओर होती है: 1→7, 2→6, 3→9 व 11, 4→10, 5→9, 6→12, 8→2।'] },
  { term: ['Soya grah (sleeping planet)', 'सोया ग्रह'], def: ['A planet that looks at no other planet, so its results are held back until something wakes it. A planet in its pakka ghar is never sleeping.', 'जो ग्रह किसी दूसरे ग्रह को नहीं देखता, उसका फल रुका रहता है जब तक वह जागे नहीं। पक्के घर का ग्रह कभी सोया नहीं माना जाता।'] },
  { term: ['Soya ghar (sleeping house)', 'सोया घर'], def: ['A house with no planet in it and no planet looking at it; its area of life stays quiet until woken.', 'ऐसा घर जिसमें न कोई ग्रह हो और न कोई ग्रह उसे देखे; उसका जीवन-क्षेत्र जागने तक शांत रहता है।'] },
  { term: ['Kaayam grah', 'कायम ग्रह'], def: ['A “settled” planet: no enemy sits with it or looks at its house, so it gives its results steadily.', '“स्थिर” ग्रह: कोई शत्रु ग्रह न साथ बैठा है न उसके घर को देखता है, इसलिए वह अपना फल लगातार देता है।'] },
  { term: ['Dharmi grah', 'धर्मी ग्रह'], def: ['A planet that turns “pious” and mild: Rahu or Ketu in the 4th or with the Moon; Saturn in the 11th or with Jupiter.', 'ऐसा ग्रह जो “धर्मी” और सौम्य हो जाता है: राहु या केतु चौथे घर में या चंद्र के साथ; शनि ग्यारहवें घर में या गुरु के साथ।'] },
  { term: ['Masnui grah', 'मसनुई (बनावटी) ग्रह'], def: ['An “artificial” planet: two planets in one house behave like a third (e.g. Sun + Venus act like Jupiter).', '“बनावटी” ग्रह: एक घर में दो ग्रह मिलकर तीसरे ग्रह जैसा व्यवहार करते हैं (जैसे सूर्य + शुक्र = गुरु)।'] },
  { term: ['Rin (debt)', 'ऋण'], def: ['A karmic duty shown when a planet’s house holds its enemies; Lal Kitab gives a family remedy for each.', 'एक कर्म-ऋण, जो तब दिखता है जब किसी ग्रह के घर में उसके शत्रु बैठे हों; लाल किताब हर ऋण का पारिवारिक उपाय बताती है।'] },
  { term: ['Varshphal', 'वर्षफल'], def: ['The yearly chart: Lal Kitab moves every house’s planets to a new house each year of life, from a fixed 120-year table.', 'वार्षिक कुंडली: लाल किताब एक निश्चित 120 वर्ष की तालिका से हर साल हर घर के ग्रहों को नए घर में रखती है।'] },
  { term: ['Upay', 'उपाय'], def: ['A remedy — in Lal Kitab, usually a simple everyday act like feeding animals or offering something in flowing water.', 'उपाय — लाल किताब में अक्सर रोज़मर्रा का सरल काम, जैसे पशुओं को खिलाना या बहते पानी में कुछ प्रवाहित करना।'] },
];

export const DIGNITY_LABEL = {
  pakka: ['Pakka ghar', 'पक्का घर'] as Bi,
  exalted: ['Exalted (uchcha)', 'उच्च'] as Bi,
  debilitated: ['Debilitated (neech)', 'नीच'] as Bi,
  sleeping: ['Sleeping (soya)', 'सोया'] as Bi,
  kaayam: ['Kaayam (settled)', 'कायम'] as Bi,
  dharmi: ['Dharmi', 'धर्मी'] as Bi,
};
export const label = (b: Bi, lang: Lang) => pick(b, lang);

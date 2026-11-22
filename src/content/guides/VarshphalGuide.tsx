/**
 * B18 — the guide below the /varshphal and /hi/varshphal tools. The worked sample comes from
 * src/data/guideSamples.json (`varshphal`, engine output for sample chart A, re-checked by
 * src/data/__tests__/guideSamples.test.ts). One FAQPage per page (GuideFAQ).
 */
import { Link } from '@/components/seo/CanonicalLink';
import { Guide, GuideSection, TermList, Bullets, SampleCard, SampleTable, RelatedLinks, GuideFAQ, GuideHowTo, GuideWebApp, fmtDate, fmtDateHi, type FaqItem, type GuideLink } from '@/components/guide/Guide';
import S from '@/data/guideSamples.json';
import { GUIDE_META } from '@/lib/seo/guideMeta.js';
import { related, signEn, signHi, PLANET_HI } from './shared';
import { HOUSE_THEME } from '@/lib/vedic/varshphalLabels';

const V = S.varshphal;
const SAHAM_EN: Record<string, string> = { punya: 'Punya', vidya: 'Vidya', yasha: 'Yasha', mitra: 'Mitra', mahatmya: 'Mahatmya', vivaha: 'Vivaha', karyasiddhi: 'Karya-siddhi' };
const SAHAM_HI: Record<string, string> = { punya: 'पुण्य', vidya: 'विद्या', yasha: 'यश', mitra: 'मित्र', mahatmya: 'माहात्म्य', vivaha: 'विवाह', karyasiddhi: 'कार्य-सिद्धि' };
const ROLE_EN: Record<string, string> = { muntha: 'Muntha lord', janmaLagna: 'Birth-Lagna lord', varshaLagna: 'Annual-Lagna lord', triRashi: 'Tri-rashi pati', dinRatri: 'Day/Night lord' };
const ROLE_HI: Record<string, string> = { muntha: 'मुंथेश', janmaLagna: 'जन्म लग्नेश', varshaLagna: 'वर्ष लग्नेश', triRashi: 'त्रिराशि पति', dinRatri: 'दिन-रात्रि पति' };
const ord = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;

export const VARSHPHAL_FAQ_EN: FaqItem[] = [
  { question: 'What is Varshphal?', answer: 'Varshphal (also written Varshaphal) is the Vedic annual horoscope from the Tajik school. A new chart is cast every year for the exact moment the Sun returns to the sidereal degree it held at your birth, and it is read together with your birth chart to see what that year of life emphasises.' },
  { question: 'Is the Varshphal year the same as the calendar year?', answer: 'No. Your Varshphal year runs from one Varsha Pravesh (Sun return) to the next — usually from your birthday, give or take a day, to your next birthday. A “Varshphal 2027” is the year that begins on your 2027 birthday.' },
  { question: 'How is the lord of the year (Varshesh) chosen?', answer: 'Five planets hold office: the Muntha lord, the birth-Lagna lord, the annual-Lagna lord, the Tri-rashi lord and the Day/Night lord. The strongest of them by Pancha-vargiya bala that also aspects the annual Lagna becomes Varshesh; if none aspects the Lagna, the Muntha lord takes the role.' },
  { question: 'Should the Varshphal be cast for my birth place or where I live now?', answer: 'Classical texts use the birth place, and that is our default. Many astrologers prefer the city where you are on your birthday. The Sun-return moment is the same either way — only the annual Lagna and houses change — so the tool lets you choose.' },
  { question: 'How accurate is this Varshphal calculator?', answer: 'The Sun-return moment agrees with an independent Swiss Ephemeris calculation within about a second for our 14 test charts in 2026 and 2027, and with the published worked examples in Dr. S.P. Gour’s “Varshaphal” (AIFAS) within 10 seconds for four of them. Annual Lagna sign, Muntha and Varshesh matched every published case.' },
  { question: 'Does Varshphal predict marriage or a job change?', answer: 'It shows supportive and demanding stretches of the year, not fixed events. For relationships we show windows that suit important conversations or commitments; for work, the periods that favour applications and big talks. Your choices still decide what happens.' },
  { question: 'Is the Varshphal free?', answer: 'Yes. The full Varshphal — chart, outlook, Mudda dasha, Sahams and the PDF — is free on BornClock.' },
];

export const VARSHPHAL_FAQ_HI: FaqItem[] = [
  { question: 'वर्षफल क्या है?', answer: 'वर्षफल ताजिक पद्धति की वार्षिक कुंडली है। हर वर्ष उस क्षण की कुंडली बनाई जाती है जब सूर्य ठीक उसी सायन-रहित (निरयन) अंश पर लौटता है जहाँ वह जन्म के समय था। इसे जन्म कुंडली के साथ पढ़कर उस वर्ष के मुख्य विषय देखे जाते हैं।' },
  { question: 'क्या वर्षफल का वर्ष कैलेंडर वर्ष जैसा होता है?', answer: 'नहीं। वर्षफल का वर्ष एक वर्ष प्रवेश से अगले वर्ष प्रवेश तक चलता है — लगभग आपके जन्मदिन से अगले जन्मदिन तक। “वर्षफल 2027” वह वर्ष है जो 2027 के जन्मदिन के आसपास शुरू होता है।' },
  { question: 'वर्षेश कैसे चुना जाता है?', answer: 'पाँच अधिकारी ग्रह होते हैं — मुंथेश, जन्म लग्नेश, वर्ष लग्नेश, त्रिराशि पति और दिन-रात्रि पति। इनमें जो पंचवर्गीय बल में सबसे बलवान हो और वर्ष लग्न को देखे, वही वर्षेश बनता है; यदि कोई लग्न को न देखे तो मुंथेश वर्षेश माना जाता है।' },
  { question: 'वर्षफल जन्म स्थान के लिए बने या वर्तमान शहर के लिए?', answer: 'शास्त्रीय ग्रंथ जन्म स्थान लेते हैं और यही हमारा डिफ़ॉल्ट है। कई ज्योतिषी जन्मदिन पर जहाँ आप हों वह स्थान लेते हैं। सूर्य प्रवेश का क्षण दोनों में एक ही रहता है — केवल वर्ष लग्न और भाव बदलते हैं — इसलिए टूल में दोनों विकल्प हैं।' },
  { question: 'यह वर्षफल कितना सटीक है?', answer: 'सूर्य प्रवेश का क्षण हमारे 14 परीक्षण चार्ट (2026 व 2027) में स्वतंत्र Swiss Ephemeris गणना से लगभग एक सेकंड के भीतर मिला, और डॉ. एस.पी. गौड़ की “वर्षफल” (AIFAS) के चार प्रकाशित उदाहरणों से 10 सेकंड के भीतर। हर प्रकाशित उदाहरण में वर्ष लग्न की राशि, मुंथा और वर्षेश मेल खाए।' },
  { question: 'क्या वर्षफल विवाह या नौकरी बदलने की तिथि बताता है?', answer: 'यह वर्ष के अनुकूल और कठिन हिस्से दिखाता है, निश्चित घटनाएँ नहीं। रिश्तों के लिए हम अहम बातचीत या प्रतिबद्धता के अनुकूल समय-खिड़कियाँ दिखाते हैं; काम के लिए आवेदन और बड़ी बातचीत के अनुकूल समय। निर्णय आपके हाथ में रहते हैं।' },
  { question: 'क्या वर्षफल मुफ़्त है?', answer: 'हाँ। पूरा वर्षफल — कुंडली, फल, मुद्दा दशा, सहम और PDF — BornClock पर मुफ़्त है।' },
];

const HI_LINKS: GuideLink[] = [
  { to: '/hi/rashifal-2027/', label: 'राशिफल 2027', note: 'सभी 12 राशियों का वार्षिक राशिफल।' },
  { to: '/hi/kundli-milan/', label: 'कुंडली मिलान', note: '36 गुण मिलान हिंदी में।' },
  { to: '/hi/rashifal/', label: 'आज का राशिफल', note: 'सभी 12 राशियों का दैनिक राशिफल।' },
  { to: '/hi/upay/', label: 'उपाय', note: 'पहले मुफ़्त, शांत और स्रोत-सहित उपाय।' },
  { to: '/kundali/', label: 'कुंडली (Kundali)', note: 'पूरी जन्म कुंडली, ग्रह और दशा।' },
  { to: '/varshphal/', label: 'Varshphal in English', note: 'The same tool in English.' },
];

function SampleEn() {
  return (
    <SampleCard testId="varshphal-sample" title={`Varshphal ${V.year} for an illustrative birth`} note="Computed by the BornClock engine (true Lahiri, Tajik rules) for an illustrative birth, not a real person. Dates are IST.">
      <SampleTable caption="Sample Varshphal summary" head={['Item', 'Value']} rows={[
        ['Birth', `${V.birth.date}, ${V.birth.time}, ${V.birth.place} (Lagna ${signEn(V.natalLagna)}, Moon in ${V.nakshatra})`],
        ['Varsha Pravesh', `${fmtDate(V.pravesh.date)}, ${V.pravesh.time} IST (${V.pravesh.isDay ? 'day' : 'night'})`],
        ['Completed years', String(V.completedYears)],
        ['Annual Lagna', `${signEn(V.lagna.sign)} ${V.lagna.degree} — lord ${V.lagna.lord}`],
        ['Muntha', `${signEn(V.muntha.sign)}, ${ord(V.muntha.house)} house — lord ${V.muntha.lord}`],
        ['Lord of the year', V.varshesh],
      ]} />
    </SampleCard>
  );
}

function SampleHi() {
  return (
    <SampleCard testId="varshphal-sample" title={`नमूना वर्षफल ${V.year}`} note="BornClock इंजन (लाहिड़ी अयनांश, ताजिक नियम) से एक काल्पनिक जन्म के लिए गणना — कोई वास्तविक व्यक्ति नहीं। समय IST में।">
      <SampleTable caption="नमूना वर्षफल" head={['विषय', 'मान']} rows={[
        ['जन्म', `15 अगस्त 1995, ${V.birth.time}, नई दिल्ली (लग्न ${signHi(V.natalLagna)})`],
        ['वर्ष प्रवेश', `${fmtDateHi(V.pravesh.date)}, ${V.pravesh.time} (${V.pravesh.isDay ? 'दिन' : 'रात'})`],
        ['पूर्ण वर्ष', String(V.completedYears)],
        ['वर्ष लग्न', `${signHi(V.lagna.sign)} ${V.lagna.degree} — स्वामी ${PLANET_HI[V.lagna.lord]}`],
        ['मुंथा', `${signHi(V.muntha.sign)}, ${V.muntha.house}वाँ भाव — स्वामी ${PLANET_HI[V.muntha.lord]}`],
        ['वर्षेश', PLANET_HI[V.varshesh]],
      ]} />
    </SampleCard>
  );
}

export function VarshphalGuide({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const hi = lang === 'hi';
  const meta = GUIDE_META[hi ? '/hi/varshphal' : '/varshphal'];
  const winner = V.candidates.find(c => c.planet === V.varshesh);
  if (hi) {
    return (
      <Guide id="varshphal" lang="hi">
        <GuideWebApp name="वर्षफल कैलकुलेटर" description={meta.description} path="/hi/varshphal" lang="hi" />
        <GuideHowTo lang="hi" name="अपना वर्षफल कैसे देखें" description="जन्म विवरण से ताजिक वर्ष कुंडली और वर्ष का फल।" steps={[
          { name: 'जन्म विवरण भरें', text: 'जन्म तिथि, समय और स्थान — समय से मुंथा और मुद्दा दशा तय होती है।' },
          { name: 'वर्ष चुनें', text: 'चालू वर्ष पहले से चुना है; आगे-पीछे के पाँच वर्ष भी देख सकते हैं।' },
          { name: 'स्थान चुनें', text: 'जन्म स्थान (शास्त्रीय) या आपका वर्तमान शहर।' },
          { name: 'फल पढ़ें', text: 'पहले असर, फिर कारण, फिर क्या करें — हर क्षेत्र के लिए।' },
        ]} />
        <GuideSection eyebrow="मूल बातें" title="वर्षफल क्या है और यह कैसे बनता है?">
          <p>वर्षफल (वर्ष का फल) भारतीय ज्योतिष की ताजिक पद्धति है, जो लगभग 13वीं–16वीं शताब्दी में फ़ारसी-अरबी ज्योतिष से भारत आई और नीलकंठ की ताजिक नीलकंठी व बलभद्र के हायनरत्न जैसे ग्रंथों में स्थापित हुई। हर वर्ष, जब सूर्य ठीक उसी निरयन (लाहिड़ी) अंश पर लौटता है जहाँ वह आपके जन्म के समय था, उस क्षण — वर्ष प्रवेश — की एक नई कुंडली बनती है। यही वर्ष कुंडली अगले जन्मदिन तक के बारह महीनों का स्वर बताती है।</p>
          <p>वर्षफल जन्म कुंडली की जगह नहीं लेता। जन्म कुंडली जीवन भर का नक्शा है; वर्षफल बताता है कि इस एक वर्ष में उस नक्शे का कौन-सा हिस्सा अधिक सक्रिय है — करियर, धन, रिश्ते, पढ़ाई या घर।</p>
        </GuideSection>
        <GuideSection eyebrow="गणना" title="BornClock वर्षफल कैसे निकालता है" white>
          <p>पहले आपकी जन्म कुंडली से सूर्य का सटीक निरयन अंश (लाहिड़ी, AstroSage की तरह) निकाला जाता है। फिर चुने गए वर्ष में वह क्षण सेकंड तक खोजा जाता है जब सूर्य फिर उसी अंश पर पहुँचता है। उस क्षण और स्थान के लिए वर्ष लग्न और ग्रह निकलते हैं। हमारे परीक्षण में यह क्षण स्वतंत्र Swiss Ephemeris गणना से लगभग एक सेकंड के भीतर रहा।</p>
          <Bullets items={[
            ['मुंथा', 'जन्म लग्न की राशि से हर पूर्ण वर्ष पर एक राशि आगे। वर्ष कुंडली में इसका भाव वर्ष का केंद्र बताता है — 9, 10, 11 भाव सबसे शुभ; 1, 2, 3, 5 शुभ; 4, 6, 7, 8, 12 में अधिक ध्यान।'],
            ['पंचाधिकारी और वर्षेश', 'मुंथेश, जन्म लग्नेश, वर्ष लग्नेश, त्रिराशि पति और दिन-रात्रि पति में से जो सबसे बलवान हो और वर्ष लग्न को देखे, वह वर्षेश।'],
            ['सहम', 'जैसे पुण्य सहम = चंद्र − सूर्य + लग्न (दिन में), रात में उलटा। तीसरा बिंदु बीच में न हो तो एक राशि जोड़ी जाती है।'],
            ['मुद्दा दशा', 'विंशोत्तरी दशा वर्ष में संक्षिप्त — सूर्य 18, चंद्र 30, मंगल 21, राहु 54, गुरु 48, शनि 57, बुध 51, केतु 21, शुक्र 60 भाग (कुल 360), पूरे वास्तविक वर्ष में फैले।'],
            ['ताजिक योग', 'इत्थशाल (ग्रह पास आ रहे — काम पूरे होते हैं), ईशराफ (दूर जा रहे), नक्त, यमया और कंबूल।'],
          ]} />
        </GuideSection>
        <GuideSection eyebrow="उदाहरण" title="एक नमूना वर्षफल">
          <SampleHi />
          <p>यहाँ पाँच अधिकारी ग्रहों में {PLANET_HI[V.varshesh]} वर्ष लग्न को देखता है और {winner ? `पंचवर्गीय बल ${winner.vimshopaka}/20` : 'सबसे अधिक बल'} के साथ सबसे बलवान है, इसलिए वही वर्षेश बना। मुंथा {V.muntha.house}वें भाव में है — {HOUSE_THEME.hi[V.muntha.house]} के विषय वर्ष भर ध्यान माँगेंगे।</p>
          <p>पाँच अधिकारी: {V.adhikaris.map(a => `${ROLE_HI[a.role]} ${PLANET_HI[a.planet]}`).join(', ')}।</p>
          <SampleTable caption="नमूना सहम" head={['सहम', 'स्थिति', 'भाव']} rows={V.sahams.map(s => [SAHAM_HI[s.key], `${signHi(s.sign)} ${s.degree}`, String(s.house)])} />
          <SampleTable caption="नमूना मुद्दा दशा" head={['दशा', 'से', 'तक']} rows={V.mudda.map(m => [PLANET_HI[m.lord], fmtDateHi(m.start), fmtDateHi(m.end)])} />
        </GuideSection>
        <GuideSection eyebrow="पढ़ने का तरीका" title="अपना वर्षफल कैसे पढ़ें" white>
          <Bullets items={[
            ['पहले वर्षेश', 'वर्षेश बलवान और अच्छे भाव में हो तो वर्ष सहयोग देता है; कमज़ोर हो तो धैर्य और तैयारी से काम लें।'],
            ['फिर मुंथा', 'मुंथा का भाव बताता है कि वर्ष का ध्यान किस क्षेत्र पर रहेगा।'],
            ['फिर क्षेत्रवार', 'करियर के लिए दशम भाव और कार्य-सिद्धि सहम, धन के लिए दूसरा व ग्यारहवाँ भाव और पुण्य सहम, रिश्तों के लिए सप्तम भाव, शुक्र और विवाह सहम।'],
            ['अंत में महीने', 'मुद्दा दशा की अनुकूल अवधियों में बड़े काम शुरू करें; कठिन अवधियों में चल रहे काम संभालें।'],
          ]} />
        </GuideSection>
        <GuideSection eyebrow="शब्दावली" title="वर्षफल के शब्द सरल भाषा में">
          <TermList items={[
            ['वर्ष प्रवेश', 'सूर्य के जन्म-अंश पर लौटने का क्षण — वर्ष की शुरुआत।'],
            ['वर्ष लग्न', 'वर्ष प्रवेश के क्षण उदित राशि।'],
            ['मुंथा / मुंथेश', 'हर वर्ष एक राशि आगे बढ़ने वाला बिंदु और उसका स्वामी।'],
            ['वर्षेश', 'वर्ष का स्वामी ग्रह।'],
            ['हर्ष बल', 'ग्रह का 0–20 का सरल “प्रसन्नता” अंक।'],
            ['पंचवर्गीय बल', 'ग्रह का मुख्य वार्षिक बल (0–20)।'],
            ['दीप्तांश', 'ग्रह का प्रभाव-क्षेत्र (orb): सूर्य 15°, चंद्र 12°, मंगल 8°, बुध-शुक्र 7°, गुरु-शनि 9°।'],
            ['इत्थशाल / ईशराफ', 'ग्रहों का पास आना / दूर जाना।'],
          ]} />
        </GuideSection>
        <GuideSection eyebrow="उपाय" title="कठिन वर्ष में क्या मदद करता है" white>
          <p>जो ग्रह इस वर्ष कमज़ोर हो, उसके स्वभाव के अनुसार सरल, मुफ़्त अभ्यास पहले करें — शनि के लिए अनुशासन और सेवा, गुरु के लिए पढ़ाई और बड़ों का आदर, शुक्र के लिए रिश्तों में कोमलता, मंगल के लिए नियमित व्यायाम और धैर्य। उस ग्रह के वार पर मंत्र भी लाभ देता है। रत्न कोई डिफ़ॉल्ट उपाय नहीं है। विस्तार: <Link to="/hi/upay/" className="underline">उपाय</Link>।</p>
          <p>वर्षफल प्रवृत्तियाँ बताता है, भाग्य नहीं लिखता। बीमारी, दुर्घटना या किसी निश्चित घटना की भविष्यवाणी हम नहीं करते; सेहत के लिए नियमित दिनचर्या और डॉक्टर की सलाह ही सही रास्ता है।</p>
        </GuideSection>
        <GuideFAQ items={VARSHPHAL_FAQ_HI} title="वर्षफल — अक्सर पूछे जाने वाले प्रश्न" />
        <RelatedLinks title="संबंधित" links={HI_LINKS} />
      </Guide>
    );
  }
  return (
    <Guide id="varshphal">
      <GuideWebApp name="Varshphal Calculator" description={meta.description} path="/varshphal" />
      <GuideHowTo name="How to see your Varshphal" description="Calculate your Tajik annual chart and yearly outlook from your birth details." steps={[
        { name: 'Enter your birth details', text: 'Date, time and place of birth — the time sets your Muntha and Mudda dasha.' },
        { name: 'Pick the year', text: 'The current year is selected; you can look five years back or ahead.' },
        { name: 'Choose the place', text: 'Your birth place (classical) or the city you live in now.' },
        { name: 'Read the outlook', text: 'Each area shows the impact first, then the reason, then what to do.' },
      ]} />

      <GuideSection eyebrow="The basics" title="What is Varshphal, and how is it cast?">
        <p>Varshphal — literally “the fruit of the year” — is the annual horoscope of Indian astrology’s Tajik school. Tajik astrology came to India from Persian and Arabic astrology around the 13th–16th centuries and was set down in Sanskrit works such as Nilakantha’s <em>Tajika Nilakanthi</em> and Balabhadra’s <em>Hayanaratna</em>. Its central idea is simple: every year, at the exact moment the Sun returns to the sidereal degree it held when you were born, a new chart is born. That moment is the <strong>Varsha Pravesh</strong>, and the chart drawn for it — the annual chart — colours the twelve months until your next birthday.</p>
        <p>The annual chart does not replace your birth chart. Your Kundali is the map of a whole life; the Varshphal shows which part of that map is lit up this year — career, money, relationships, study, home or rest. Astrologers read the two together: a promise in the birth chart tends to show up in a year whose annual chart supports it.</p>
      </GuideSection>

      <GuideSection eyebrow="Method" title="How BornClock calculates your Varshphal" white>
        <p>We first compute your natal Sun to the arc-second in the sidereal zodiac, using the true Lahiri (Chitrapaksha) ayanamsa that AstroSage uses. Then we search the chosen year for the instant the Sun regains that exact longitude, refined to under a second, and convert it to local time with full daylight-saving handling. The annual ascendant (Lagna), houses and planets are computed for that instant and for the place you choose. In our validation the Sun-return moment agreed with an independent Swiss Ephemeris calculation within about a second for 14 charts in 2026 and 2027, and four published worked examples in Dr. S.P. Gour’s “Varshaphal” (AIFAS) within 10 seconds.</p>
        <Bullets items={[
          ['Muntha', 'Starts in your birth-Lagna sign and moves one sign for every completed year. Its house in the annual chart is where the year keeps pulling your attention — classically best in the 9th, 10th or 11th; good in the 1st, 2nd, 3rd or 5th; asking for care in the 4th, 6th, 7th, 8th or 12th.'],
          ['Five office-bearers and the lord of the year', 'The Muntha lord, the birth-Lagna lord, the annual-Lagna lord, the Tri-rashi lord and the Day/Night lord compete; the strongest by Pancha-vargiya bala that aspects the annual Lagna becomes Varshesh.'],
          ['Sahams', 'Sensitive points such as Punya (Moon − Sun + Lagna by day, reversed at night). One sign is added when the third point does not fall between the other two — the classical rule.'],
          ['Mudda dasha', 'The 120-year Vimshottari Dasha compressed into one year: Sun 18, Moon 30, Mars 21, Rahu 54, Jupiter 48, Saturn 57, Mercury 51, Ketu 21 and Venus 60 parts (360 in all), spread over the real length of your year.'],
          ['Tajik aspects and yogas', 'Aspects count by houses (5/9 and 3/11 friendly, 1/7 and 4/10 tense). Ithasala means two planets are moving towards an exact contact; Ishrafa means they are separating.'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="Worked example" title="A sample Varshphal">
        <SampleEn />
        <p>Of the five office-bearers ({V.adhikaris.map(a => `${ROLE_EN[a.role]} ${a.planet}`).join(', ')}), {V.varshesh} aspects the annual Lagna and is the strongest such candidate{winner ? ` (Pancha-vargiya bala ${winner.vimshopaka}/20)` : ''}, so it is the lord of the year. Muntha in the {ord(V.muntha.house)} house puts {HOUSE_THEME.en[V.muntha.house]} at the centre of this year.</p>
        <SampleTable caption="Sample Sahams" head={['Saham', 'Position', 'House']} rows={V.sahams.map(s => [SAHAM_EN[s.key], `${signEn(s.sign)} ${s.degree}`, String(s.house)])} />
        <SampleTable caption="Sample Mudda dasha" head={['Mudda period', 'From', 'To']} rows={V.mudda.map(m => [m.lord, fmtDate(m.start), fmtDate(m.end)])} />
        <p>The first and last rows share a lord: the year opens with the unelapsed part of that planet’s period (the same balance as at birth) and closes with the part that had already run.</p>
      </GuideSection>

      <GuideSection eyebrow="Reading it" title="How to read your Varshphal in four steps" white>
        <Bullets items={[
          ['Start with the lord of the year', 'A strong Varshesh in a good house means the year backs your efforts; a weak one asks for patience and preparation.'],
          ['Then the Muntha', 'Its house tells you which area of life the year keeps returning to.'],
          ['Then area by area', 'Career: the 10th house, its lord and the Karya-siddhi Saham. Money: the 2nd and 11th houses, Jupiter and the Punya Saham. Relationships: the 7th house, Venus and the Vivaha Saham. Health: the strength of the annual Lagna lord — read only as a reminder to keep a steady routine.'],
          ['Finally, month by month', 'Use the supportive Mudda periods for important starts, applications and conversations; use the demanding ones to consolidate.'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="Glossary" title="Varshphal terms in plain language">
        <TermList items={[
          ['Varsha Pravesh', 'The Sun-return moment that starts your astrological year.'],
          ['Varsha Lagna', 'The sign rising at that moment — the ascendant of the annual chart.'],
          ['Muntha / Munthesh', 'The point that moves one sign a year, and its sign lord.'],
          ['Varshesh', 'The lord of the year.'],
          ['Tri-rashi pati', 'A lord fixed by the annual Lagna sign and whether the year begins by day or night.'],
          ['Harsha bala', 'A simple 0–20 “happiness” score for each planet.'],
          ['Pancha-vargiya bala', 'The main 0–20 strength of a planet in the annual chart.'],
          ['Deeptamsha', 'A planet’s orb: Sun 15°, Moon 12°, Mars 8°, Mercury and Venus 7°, Jupiter and Saturn 9°.'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="What helps" title="Making the most of a demanding year" white>
        <p>When a key planet is weak in the annual chart, the tradition’s first advice is to work with its nature through simple, free practices: discipline and service for Saturn, study and respect for teachers for Jupiter, kindness in relationships for Venus, regular exercise and patience for Mars, clear communication for Mercury. A planet’s mantra on its weekday is a gentle addition. Gemstones are not a default fix and are considered only after a full-chart check. Planet-by-planet practices are on <Link to="/remedies/" className="underline">Remedies</Link>.</p>
        <p>A Varshphal describes tendencies; it does not write your fate. We never predict illness, accidents or fixed events — for health, the right path is a steady routine and a doctor’s advice. For the wider sky of the year, read <Link to="/rashifal-2027/" className="underline">Rashifal 2027</Link> or <Link to="/horoscope-2027/" className="underline">Horoscope 2027</Link>, and see your lifelong timing on the <Link to="/dasha-calculator/" className="underline">Dasha calculator</Link>.</p>
      </GuideSection>

      <GuideFAQ items={VARSHPHAL_FAQ_EN} title="Varshphal FAQ" />
      <RelatedLinks title="Related tools" links={[{ to: '/hi/varshphal/', label: 'वर्षफल (हिंदी)', note: 'यही टूल हिंदी में।' }, ...related(['kundali', 'dasha', 'sadeSati', 'remedies'])]} />
    </Guide>
  );
}


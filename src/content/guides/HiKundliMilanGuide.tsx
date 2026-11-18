/**
 * B14 — /hi/kundli-milan (कुंडली मिलान) के टूल के नीचे की हिंदी मार्गदर्शिका। नमूना मिलान
 * src/data/guideSamples.json (इंजन का परिणाम, टेस्ट से जाँचा गया) से आता है।
 */
import { Link } from '@/components/seo/CanonicalLink';
import { Guide, GuideSection, TermList, Bullets, SampleCard, SampleTable, RelatedLinks, GuideFAQ, GuideHowTo, GuideWebApp, type FaqItem, type GuideLink } from '@/components/guide/Guide';
import S from '@/data/guideSamples.json';
import { NAKSHATRA_HINDI } from '@/data/vedicTermsHindi';
import { COUNTS } from '@/lib/accuracy/evidence';
import { GUIDE_META } from '@/lib/seo/guideMeta.js';
import { RASHI_HI, KOOTA_HI, COMPAT_HI } from './shared';

const M = S.matchHi;
const nakHi = (n: string) => NAKSHATRA_HINDI[n] || n;
const posAB = ((M.bride.rashiIndex - M.groom.rashiIndex + 12) % 12) + 1;
const posBA = ((M.groom.rashiIndex - M.bride.rashiIndex + 12) % 12) + 1;
/** Hindi feminine ordinal (राशि is feminine): पहली, दूसरी … 12वीं. */
const ordHi = (n: number) => ({ 1: 'पहली', 2: 'दूसरी', 3: 'तीसरी', 4: 'चौथी', 6: 'छठी' } as Record<number, string>)[n] ?? `${n}वीं`;
const levelHi = (l: string) => (l === 'High' ? 'उच्च' : l === 'Low' ? 'निम्न' : 'नहीं');

const KOOTA_ROWS: Array<[string, number, string]> = [
  ['वर्ण', 1, 'चंद्र राशि के तत्व से चार वर्ग — सोच और मूल्यों का मेल।'],
  ['वश्य', 2, 'राशि का वर्ग (मानव, चतुष्पद, जलचर, वनचर, कीट) — आपसी आकर्षण और प्रभाव।'],
  ['तारा', 3, 'एक नक्षत्र से दूसरे तक नौ-नौ की गिनती — जोड़ी की सामान्य शुभता।'],
  ['योनि', 4, 'हर नक्षत्र का पशु-प्रतीक — स्वाभाविक और शारीरिक अनुकूलता।'],
  ['ग्रह मैत्री', 5, 'दोनों चंद्र राशियों के स्वामियों की मित्रता — मानसिक तालमेल।'],
  ['गण', 6, 'देव, मनुष्य या राक्षस स्वभाव — रोज़मर्रा का व्यवहार।'],
  ['भकूट', 7, 'दोनों चंद्र राशियों की आपसी दूरी — भावनात्मक और आर्थिक तालमेल।'],
  ['नाड़ी', 8, 'आदि, मध्य या अंत्य नाड़ी — शारीरिक प्रकृति और वंश-परंपरा से जुड़ा कूट।'],
];

export const HI_MILAN_EXTRA_FAQ: FaqItem[] = [
  { question: 'नाड़ी दोष क्या है और क्या यह हमेशा लागू होता है?', answer: 'जब दोनों के जन्म नक्षत्र एक ही नाड़ी में हों तो नाड़ी कूट को 8 में से 0 मिलते हैं। पर कई स्थितियों में यह निरस्त माना जाता है — एक ही नक्षत्र पर अलग चरण, एक ही राशि पर अलग नक्षत्र, या चंद्र-राशि स्वामी मित्र हों। परिणाम बताता है कि परिहार लागू है या नहीं।' },
  { question: 'भकूट दोष किसे कहते हैं?', answer: 'जब दोनों की चंद्र राशियाँ एक-दूसरे से 2/12, 5/9 या 6/8 पर हों, तो भकूट में 0 अंक आते हैं। यह बहुत आम है और इसे दंपति के भावनात्मक-आर्थिक तालमेल पर ध्यान देने की सूचना माना जाता है।' },
  { question: 'क्या 36 में से 36 गुण मिलना ज़रूरी है?', answer: 'नहीं। पूरे 36 गुण बहुत कम मिलते हैं और ज़रूरी भी नहीं। 18 से अधिक गुण, नाड़ी-भकूट की स्थिति और दोनों कुंडलियों का पूरा अध्ययन मिलकर तस्वीर बनाते हैं।' },
  { question: 'क्या यह कुंडली मिलान मुफ़्त है?', answer: 'हाँ, इस पेज पर गुण मिलान, दोष जाँच और मांगलिक जाँच मुफ़्त है।' },
];

const LINKS: GuideLink[] = [
  { to: '/hi/naam-se-kundli-milan/', label: 'नाम से कुंडली मिलान', note: 'जन्म समय न हो तो एक अनुमान।' },
  { to: '/kundali-match/', label: 'Kundli Matching (English)', note: 'Porutham and marriage-timing windows too.' },
  { to: '/hi/rashifal/', label: 'आज का राशिफल', note: 'सभी 12 राशियों का दैनिक राशिफल।' },
  { to: '/hi/upay/', label: 'उपाय', note: 'नाड़ी, भकूट, मांगलिक — सरल उपाय।' },
  { to: '/manglik/', label: 'Manglik Dosh Check', note: 'मंगल की स्थिति लग्न और चंद्र से।' },
  { to: '/kundali/', label: 'मुफ़्त कुंडली (Free Kundli)', note: 'अपनी पूरी जन्म कुंडली।' },
  { to: '/hi/rashifal-2027/', label: 'राशिफल 2027', note: 'सभी 12 राशियों का वार्षिक राशिफल।' },
  { to: '/rashifal-2027/', label: 'Rashifal 2027 (English)', note: 'The year ahead for every Moon sign.' },
  { to: '/horoscope-2027/', label: 'Horoscope 2027', note: 'Your 2027 yearly horoscope.' },
];

export function HiKundliMilanGuide({ baseFaq }: { baseFaq: FaqItem[] }) {
  const meta = GUIDE_META['/hi/kundli-milan'];
  const bhakoot = M.doshas.find(d => d.name === 'Bhakoot Dosha');
  return (
    <Guide id="hi-kundli-milan" lang="hi">
      <GuideWebApp lang="hi" name="कुंडली मिलान (36 गुण) — हिंदी" description={meta.description} path="/hi/kundli-milan" />
      <GuideHowTo lang="hi"
        name="कुंडली मिलान कैसे करें"
        description="लड़के और लड़की के जन्म विवरण से 36 गुणों का अष्टकूट मिलान।"
        steps={[
          { name: 'लड़के का विवरण भरें', text: 'जन्म तिथि, जन्म समय और जन्म स्थान।' },
          { name: 'लड़की का विवरण भरें', text: 'जन्म तिथि, जन्म समय और जन्म स्थान।' },
          { name: 'मिलान देखें', text: 'आठों कूट के अंक और 36 में से कुल गुण।' },
          { name: 'दोष और परिहार पढ़ें', text: 'नाड़ी, भकूट, गण और मांगलिक — परिहार के साथ।' },
        ]}
      />

      <GuideSection eyebrow="परिचय" title="कुंडली मिलान क्या है?">
        <p>विवाह से पहले वर और कन्या की कुंडली मिलाने की परंपरा भारत में बहुत पुरानी है। उत्तर भारत में इसका मुख्य तरीक़ा अष्टकूट मिलान है — आठ कूटों में कुल 36 गुण होते हैं, इसलिए इसे गुण मिलान भी कहते हैं। आठों कूट दोनों के जन्म के समय चंद्रमा की राशि और नक्षत्र से निकलते हैं, क्योंकि ज्योतिष में चंद्रमा मन का कारक है और विवाह में मन का मेल सबसे अहम माना जाता है।</p>
        <p>गुणों की संख्या के साथ-साथ तीन दोष — नाड़ी, भकूट और गण — और दोनों कुंडलियों में मांगलिक दोष भी देखा जाता है। हर दोष के साथ शास्त्रों में उसके परिहार (निरस्त होने की शर्तें) भी दिए गए हैं।</p>
      </GuideSection>

      <GuideSection eyebrow="पद्धति" title="यह मिलान कैसे गणना होता है" white>
        <p>दोनों की जन्म तिथि, समय और स्थान से चंद्रमा की सटीक निरयण स्थिति लाहिड़ी अयनांश से निकाली जाती है — उसी से चंद्र राशि, नक्षत्र और चरण मिलते हैं। फिर आठों कूट शास्त्रीय नियमों से गिने जाते हैं। जहाँ अलग-अलग सॉफ़्टवेयर के नियम अलग हैं — जैसे वर्ण और गण की दिशा, या आधे अंक — वहाँ BornClock AstroSage की पद्धति अपनाता है।</p>
        <p>यह गणना कठोरता से की और जाँची गई है: अक्टूबर 2026 के हमारे परीक्षण में {COUNTS.couples} में से {COUNTS.couples} जोड़ों का कुल गुण AstroSage से मेल खाया, और {COUNTS.manglikCharts} में से {COUNTS.manglikCharts} कुंडलियों का मांगलिक स्तर भी।</p>
      </GuideSection>

      <GuideSection eyebrow="36 गुण" title="आठ कूट और उनके अंक">
        <SampleTable caption="अष्टकूट मिलान के आठ कूट" head={['कूट', 'अधिकतम', 'क्या देखता है']} rows={KOOTA_ROWS.map(([k, m, d]) => [k, m, d])} />
        <p>अंक 1 से 8 तक बढ़ते जाते हैं, इसलिए आख़िरी दो कूट — भकूट और नाड़ी — मिलकर 15 अंकों के हैं और सबसे भारी माने जाते हैं। कुल गुण अच्छे होने पर भी इनमें 0 हो सकता है, इसलिए पूरा विवरण देखना ज़रूरी है।</p>
      </GuideSection>

      <GuideSection eyebrow="उदाहरण" title="नमूना मिलान, कूट-दर-कूट" white>
        <p>यह दो काल्पनिक जन्मों (असली व्यक्ति नहीं) का मिलान है, उसी इंजन से जो ऊपर के टूल में है।</p>
        <SampleCard testId="hkm-sample" title={`वर: ${M.groom.date}, ${M.groom.time}, ${M.groom.place} · कन्या: ${M.bride.date}, ${M.bride.time}, ${M.bride.place}`}
          note="BornClock मिलान इंजन से गणना (लाहिड़ी अयनांश, AstroSage पद्धति)।">
          <SampleTable caption="दोनों की चंद्र स्थिति" head={['', 'चंद्र राशि', 'नक्षत्र (चरण)', 'मांगलिक']} rows={[
            ['वर', RASHI_HI[M.groom.rashiIndex], `${nakHi(M.groom.nakshatra)} (${M.groom.pada})`, levelHi(M.groom.manglik)],
            ['कन्या', RASHI_HI[M.bride.rashiIndex], `${nakHi(M.bride.nakshatra)} (${M.bride.pada})`, levelHi(M.bride.manglik)],
          ]} />
          <div style={{ marginTop: 12 }}>
            <SampleTable caption="कूट के अंक" head={['कूट', 'अंक', 'अधिकतम']} rows={[...M.kootas.map(k => [KOOTA_HI[k.key] ?? k.label, k.score, k.max]), [<strong key="t">कुल</strong>, <strong key="s">{M.total}</strong>, M.max]]} />
          </div>
        </SampleCard>
        <p><strong>इसे कैसे पढ़ें।</strong> कुल {M.total} गुण मिले, जिसे टूल “{COMPAT_HI[M.compatibility] ?? M.compatibility}” बताता है। कन्या की चंद्र राशि वर की राशि से {ordHi(posAB)} और वर की राशि कन्या की राशि से {ordHi(posBA)} है{bhakoot?.present ? ' — इसी कारण भकूट में 0 अंक आए और भकूट दोष दिखाया गया, जिसे आपसी तालमेल पर ध्यान देने की सूचना माना जाता है' : ''}। {M.kootas.find(k => k.key === 'nadi')?.score === 8 ? 'नाड़ी अलग है, इसलिए नाड़ी कूट में पूरे 8 अंक मिले और नाड़ी दोष नहीं है।' : 'नाड़ी एक है, इसलिए परिहार जाँचे जाते हैं।'} दोनों में से किसी की कुंडली में मांगलिक दोष {M.groom.manglik === 'None' && M.bride.manglik === 'None' ? 'नहीं है' : 'है — टूल परिहार की जाँच करता है'}।</p>
      </GuideSection>

      <GuideSection eyebrow="गुणों का अर्थ" title="कितने गुण मिलें तो कैसा मिलान?">
        <Bullets items={[
          ['28 से 36 — उत्तम', 'अधिकांश कूटों में स्वाभाविक मेल।'],
          ['24 से 27.5 — अच्छा', 'अच्छा मिलान; नाड़ी या भकूट में 0 हो तो उसे भी देखें।'],
          ['18 से 23.5 — स्वीकार्य', 'पारंपरिक न्यूनतम पूरा; विवरण बताता है कहाँ अधिक समझदारी चाहिए।'],
          ['18 से कम — चुनौतीपूर्ण', 'परंपरा परिहार और दोनों पूरी कुंडलियाँ देखने को कहती है; यह किसी व्यक्ति पर टिप्पणी नहीं।'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="शब्दावली" title="मिलान के शब्द, आसान भाषा में" white>
        <TermList items={[
          ['गुण', 'एक अंक — आठों कूट मिलाकर 36 गुण।'],
          ['अष्टकूट', 'आठ भागों वाला मिलान — उत्तर भारतीय पद्धति।'],
          ['नाड़ी दोष', 'दोनों नक्षत्र एक ही नाड़ी में (8 में से 0); अक्सर निरस्त।'],
          ['भकूट दोष', 'चंद्र राशियाँ 2/12, 5/9 या 6/8 पर (7 में से 0)।'],
          ['गण दोष', 'राक्षस गण का देव या मनुष्य गण से मिलान, जब तक परिहार न हो।'],
          ['परिहार', 'शास्त्र में दी गई वह शर्त जिससे दोष निरस्त या हल्का होता है।'],
          ['मांगलिक', 'मंगल लग्न या चंद्र से 1, 4, 7, 8 या 12वें भाव में।'],
          ['चरण (पाद)', 'नक्षत्र का एक चौथाई भाग — नाड़ी परिहार में काम आता है।'],
        ]} />
      </GuideSection>

      <GuideSection eyebrow="सरल उपाय" title="दोष हो तो — पहले मुफ़्त उपाय, बिना डर">
        <p>सबसे पहले वे उपाय जिनमें कोई ख़र्च नहीं: नाड़ी या भकूट दोष में परिवार प्रायः महामृत्युंजय मंत्र या “ॐ नमः शिवाय” का जप करते हैं, सोमवार को साथ में शिव मंदिर जाते हैं, या दंपति मिलकर अन्नदान करते हैं। उतना ही उपयोगी है खुलकर बात करना — पैसे, परिवार और जीवनशैली पर — क्योंकि यही वे विषय हैं जिनकी ये कूट बात करते हैं। मांगलिक हो तो मंगलवार को हनुमान चालीसा। औपचारिक पूजा वैकल्पिक है; कोई महँगा अनुष्ठान “तुरंत ज़रूरी” बताए तो सावधान रहें। विस्तार से: <Link to="/hi/upay/nadi-dosha/" className="underline">नाड़ी दोष उपाय</Link> · <Link to="/hi/upay/bhakoot-dosha/" className="underline">भकूट दोष उपाय</Link> · <Link to="/hi/upay/manglik-dosha/" className="underline">मांगलिक उपाय</Link>।</p>
      </GuideSection>

      <GuideSection eyebrow="भ्रम" title="कुंडली मिलान से जुड़े आम भ्रम" white>
        <Bullets items={[
          ['“36 गुण मिलें तो विवाह सुखी होगा ही।”', 'गुण केवल चंद्र स्थिति का मेल बताते हैं; सम्मान, संवाद और साझा मूल्य किसी कूट में नहीं।'],
          ['“18 से कम गुण मतलब विवाह नहीं हो सकता।”', 'परंपरा पहले परिहार और पूरी कुंडलियाँ देखने को कहती है; बहुत से परिवार इसके बाद आगे बढ़ते हैं।'],
          ['“नाड़ी दोष का कोई परिहार नहीं।”', 'शास्त्र में साफ़ परिहार दिए गए हैं, और टूल बताता है कि कौन-सा लागू है।'],
          ['“नाम से मिलान जन्म विवरण जितना सही है।”', 'नाम से मिलान केवल अनुमान है; सटीक मिलान जन्म समय से होता है।'],
        ]} />
        <p>जन्म समय न हो तो <Link to="/hi/naam-se-kundli-milan/" className="underline">नाम से कुंडली मिलान</Link> देखें। साल भर की तस्वीर के लिए <Link to="/hi/rashifal-2027/" className="underline">राशिफल 2027</Link> पढ़ें।</p>
      </GuideSection>

      <GuideFAQ items={[...baseFaq, ...HI_MILAN_EXTRA_FAQ]} title="कुंडली मिलान — सामान्य प्रश्न" />
      <RelatedLinks title="और उपयोगी पेज" links={LINKS} />
    </Guide>
  );
}

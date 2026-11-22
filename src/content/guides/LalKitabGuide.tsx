/**
 * B18 — explanatory guide below the Lal Kitab Kundli tool (/lal-kitab and /hi/lal-kitab):
 * what Lal Kitab is, how its chart is drawn, every term in plain words, the tables the tool
 * uses (generated from src/lib/vedic/lalKitab/tables.ts so the guide and the tool never
 * disagree), where traditions differ and which reading we follow, and the page's one FAQPage.
 */
import { Guide, GuideSection, TermList, Bullets, SampleTable, RelatedLinks, GuideFAQ, GuideHowTo, GuideWebApp, type FaqItem, type GuideLink } from '@/components/guide/Guide';
import { GUIDE_META } from '@/lib/seo/guideMeta.js';
import {
  LK_PLANETS, PAKKA_GHAR, EXALTED, DEBILITATED, RINS, CYCLE_35, REMEDY_DAYS,
  planetName, rinText, TEVA_TEXT, GLOSSARY, label, type Lang,
} from '@/lib/vedic/lalKitab';

export function lalKitabFaq(lang: Lang): FaqItem[] {
  const T = (en: string, hi: string) => (lang === 'hi' ? hi : en);
  return [
    { question: T('What is a Lal Kitab Kundli?', 'लाल किताब कुंडली क्या है?'),
      answer: T('It is your birth chart read by the rules of Lal Kitab. Each planet keeps the house it occupies counted from your Lagna, but the signs are set aside: house 1 is always read as Aries, house 2 as Taurus and so on to house 12 as Pisces. A planet is then judged by its house alone.', 'यह आपकी जन्म कुंडली है जिसे लाल किताब के नियमों से पढ़ा जाता है। हर ग्रह लग्न से गिने गए अपने घर में ही रहता है, पर राशियाँ अलग रख दी जाती हैं: पहला घर हमेशा मेष, दूसरा वृषभ, इसी तरह बारहवाँ मीन। फिर ग्रह को केवल उसके घर से परखा जाता है।') },
    { question: T('Is this Lal Kitab Kundli free?', 'क्या यह लाल किताब कुंडली मुफ़्त है?'),
      answer: T('Yes. The chart, the readings, the Rin check, this year’s Varshphal, the remedies and the PDF on this page are free.', 'हाँ। इस पेज पर कुंडली, फल, ऋण जाँच, इस साल का वर्षफल, उपाय और PDF सब मुफ़्त हैं।') },
    { question: T('Why is my Lal Kitab chart different from my normal Kundli?', 'मेरी लाल किताब कुंडली सामान्य कुंडली से अलग क्यों दिखती है?'),
      answer: T('The planets sit in the same houses; only the numbers change. A normal North Indian chart writes your Lagna sign in house 1, while a Lal Kitab chart always writes 1 (Aries) there. That is why a planet can be in its own sign in the normal chart and still be in its Lal Kitab debilitated house.', 'ग्रह उन्हीं घरों में रहते हैं; बस अंक बदलते हैं। सामान्य उत्तर भारतीय कुंडली पहले घर में आपकी लग्न राशि लिखती है, जबकि लाल किताब कुंडली वहाँ हमेशा 1 (मेष) लिखती है। इसीलिए कोई ग्रह सामान्य कुंडली में स्वराशि का होकर भी लाल किताब में नीच घर में हो सकता है।') },
    { question: T('What is a sleeping planet in Lal Kitab?', 'लाल किताब में सोया ग्रह क्या है?'),
      answer: T('A planet that looks at no other planet is called sleeping (soya). Its results are held back until it is woken — by its own maturity age, a yearly Varshphal turn or a remedy. A planet in its own pakka ghar is never counted as sleeping.', 'जो ग्रह किसी दूसरे ग्रह को नहीं देखता, उसे सोया ग्रह कहते हैं। उसका फल तब तक रुका रहता है जब तक वह जागे नहीं — अपनी परिपक्वता आयु, वर्षफल या उपाय से। अपने पक्के घर में बैठा ग्रह कभी सोया नहीं माना जाता।') },
    { question: T('What is Pitri Rin in Lal Kitab?', 'लाल किताब में पितृ ऋण क्या है?'),
      answer: T('Pitri Rin, the debt of the ancestors, is read when Venus, Mercury or Rahu sits in a house of Jupiter — the 2nd, 5th, 9th or 12th. Lal Kitab treats it as a family duty, and its remedy is done together: each family member gives an equal small amount, given at a temple on the same day.', 'पितृ ऋण तब पढ़ा जाता है जब शुक्र, बुध या राहु गुरु के घर — दूसरे, पाँचवें, नौवें या बारहवें — में हों। लाल किताब इसे पारिवारिक कर्तव्य मानती है और उपाय मिलकर होता है: परिवार का हर सदस्य बराबर छोटी राशि देता है, जो उसी दिन मंदिर में दी जाती है।') },
    { question: T('How long should a Lal Kitab remedy be done?', 'लाल किताब का उपाय कितने दिन करें?'),
      answer: T(`Lal Kitab sources commonly advise one remedy at a time, done daily between sunrise and sunset for ${REMEDY_DAYS.min}–${REMEDY_DAYS.max} days, starting again if a day is missed. Remedies are optional, free or near-free, and no remedy can guarantee a result.`, `लाल किताब के स्रोत आम तौर पर एक समय में एक उपाय, रोज़ सूर्योदय से सूर्यास्त के बीच, ${REMEDY_DAYS.min}–${REMEDY_DAYS.max} दिन तक करने को कहते हैं; कोई दिन छूटे तो फिर से शुरू करें। उपाय वैकल्पिक, मुफ़्त या लगभग मुफ़्त हैं, और कोई उपाय परिणाम की गारंटी नहीं दे सकता।`) },
    { question: T('Do I need my exact birth time?', 'क्या सही जन्म समय ज़रूरी है?'),
      answer: T('Yes. Lal Kitab reads planets by house, and houses are counted from the Lagna, which changes about every two hours. With a wrong time, planets can shift by a house.', 'हाँ। लाल किताब ग्रहों को घर से पढ़ती है, और घर लग्न से गिने जाते हैं, जो लगभग हर दो घंटे में बदलता है। गलत समय से ग्रह एक घर खिसक सकते हैं।') },
  ];
}

export function LalKitabGuide({ lang = 'en' }: { lang?: Lang }) {
  const hi = lang === 'hi';
  const T = (en: string, h: string) => (hi ? h : en);
  const path = hi ? '/hi/lal-kitab' : '/lal-kitab';
  const meta = GUIDE_META[path];
  const n = (p: typeof LK_PLANETS[number]) => planetName(p, lang);
  const links: GuideLink[] = [
    { to: '/kundali/', label: T('Free Kundli (Janam Kundali)', 'मुफ़्त कुंडली'), note: T('Your full Vedic chart, Dasha and reading.', 'पूरी वैदिक कुंडली, दशा और फल।') },
    { to: hi ? '/lal-kitab/' : '/hi/lal-kitab/', label: hi ? 'Lal Kitab Kundli (English)' : 'लाल किताब कुंडली (हिंदी)', note: T('The same tool in Hindi.', 'यही टूल अंग्रेज़ी में।') },
    { to: hi ? '/hi/upay/' : '/remedies/', label: T('Remedies (Upay)', 'उपाय'), note: T('Free-first traditional practices.', 'पहले मुफ़्त, पारंपरिक उपाय।') },
    { to: '/pitra-dosha/', label: T('Pitra Dosha', 'पितृ दोष'), note: T('The Vedic view of ancestral afflictions.', 'पूर्वजों से जुड़े दोष का वैदिक दृष्टिकोण।') },
    { to: '/sade-sati/', label: T('Sade Sati Calculator', 'साढ़ेसाती'), note: T('Is Saturn’s 7.5-year transit active for you?', 'क्या शनि की साढ़ेसाती चल रही है?') },
    { to: '/vedic-astrology/', label: T('Vedic Astrology hub', 'वैदिक ज्योतिष'), note: T('Every Vedic tool in one place.', 'सभी वैदिक टूल एक जगह।') },
    { to: '/glossary/', label: T('Astrology Glossary', 'ज्योतिष शब्दावली'), note: T('Every term in plain language.', 'हर शब्द आसान भाषा में।') },
    { to: '/rashifal-2027/', label: T('Rashifal 2027', 'राशिफल 2027'), note: T('The year ahead for all 12 Moon signs.', 'सभी 12 राशियों का वार्षिक राशिफल।') },
  ];

  return (
    <Guide id={hi ? 'hi-lal-kitab' : 'lal-kitab'} lang={lang}>
      <GuideWebApp lang={lang} name={T('Lal Kitab Kundli — free Lal Kitab chart and remedies', 'लाल किताब कुंडली — मुफ़्त चार्ट और उपाय')} description={meta.description} path={path} />
      <GuideHowTo lang={lang}
        name={T('How to make your Lal Kitab Kundli', 'अपनी लाल किताब कुंडली कैसे बनाएँ')}
        description={T('Your Lal Kitab chart, debts, yearly chart and remedies from your birth details.', 'जन्म विवरण से लाल किताब कुंडली, ऋण, वर्षफल और उपाय।')}
        steps={[
          { name: T('Enter your birth details', 'जन्म विवरण भरें'), text: T('Date, exact time and place of birth.', 'जन्म तिथि, सही समय और स्थान।') },
          { name: T('Read your Lal Kitab chart', 'लाल किताब कुंडली पढ़ें'), text: T('Each planet by house, with pakka ghar, exalted, debilitated and sleeping status.', 'हर ग्रह घर के अनुसार — पक्का घर, उच्च, नीच और सोया।') },
          { name: T('Check Rin and Varshphal', 'ऋण और वर्षफल देखें'), text: T('Which of the nine debts apply, and where the planets sit this year.', 'नौ में से कौन-से ऋण लागू हैं, और इस साल ग्रह कहाँ हैं।') },
          { name: T('Choose one simple remedy', 'एक सरल उपाय चुनें'), text: T(`Optional, free-first, one at a time for ${REMEDY_DAYS.min}–${REMEDY_DAYS.max} days.`, `वैकल्पिक, पहले मुफ़्त, एक समय में एक, ${REMEDY_DAYS.min}–${REMEDY_DAYS.max} दिन।`) },
        ]}
      />

      <GuideSection eyebrow={T('Introduction', 'परिचय')} title={T('What is Lal Kitab?', 'लाल किताब क्या है?')}>
        <p>{T(
          'Lal Kitab (“the red book”) is a set of five Urdu books on astrology and palmistry published in Punjab between 1939 and 1952 and attributed to Pandit Roop Chand Joshi. It became popular across North India for two things: it reads the birth chart by houses rather than by signs, and it offers remedies that are simple, everyday and cheap — feeding animals, offering something in flowing water, keeping a small item at home, or changing a habit — instead of costly rituals.',
          'लाल किताब ज्योतिष और हस्तरेखा पर उर्दू में लिखी पाँच पुस्तकों का संग्रह है, जो 1939 से 1952 के बीच पंजाब में छपीं और पं. रूपचंद जोशी की मानी जाती हैं। उत्तर भारत में यह दो बातों के लिए लोकप्रिय हुई: यह कुंडली को राशियों के बजाय घरों से पढ़ती है, और इसके उपाय सरल, रोज़मर्रा के और सस्ते हैं — पशुओं को खिलाना, बहते पानी में कुछ प्रवाहित करना, घर में कोई छोटी वस्तु रखना या कोई आदत बदलना — महँगे अनुष्ठान नहीं।',
        )}</p>
        <p>{T(
          'Most Lal Kitab searches are in Hindi, and the same ideas — pakka ghar, soya grah, pitri rin, upay — are used by every major Indian astrology site. This page gives you the chart and those ideas in plain words, with the rule behind every result so you can check it yourself.',
          'लाल किताब से जुड़ी ज़्यादातर खोज हिंदी में होती है, और यही विचार — पक्का घर, सोया ग्रह, पितृ ऋण, उपाय — हर बड़ी भारतीय ज्योतिष साइट पर मिलते हैं। यह पेज आपको कुंडली और ये विचार आसान शब्दों में देता है, हर परिणाम के पीछे का नियम भी, ताकि आप ख़ुद जाँच सकें।',
        )}</p>
      </GuideSection>

      <GuideSection white eyebrow={T('Method', 'पद्धति')} title={T('How the Lal Kitab chart is made', 'लाल किताब कुंडली कैसे बनती है')}>
        <p>{T(
          'First your ordinary sidereal birth chart is calculated — the same Lahiri calculation as our free Kundli, rigorously computed and checked against the Swiss Ephemeris. Each planet’s house is counted from the Lagna (rising sign). Lal Kitab then sets the signs aside: whatever your Lagna, house 1 is read as Aries, house 2 as Taurus and so on, so house 12 is Pisces. The planets stay in their houses; only the labels change. That is the convention used by AstroSage, Astromitra and Lal Kitab authors, and it is what this tool draws, in North Indian style.',
          'पहले आपकी सामान्य निरयण जन्म कुंडली बनती है — वही लाहिड़ी गणना जो हमारी मुफ़्त कुंडली में है, सावधानी से गणना की गई और स्विस एफ़ेमेरिस से जाँची गई। हर ग्रह का घर लग्न से गिना जाता है। फिर लाल किताब राशियों को अलग रख देती है: लग्न कोई भी हो, पहला घर मेष, दूसरा वृषभ, और बारहवाँ मीन माना जाता है। ग्रह अपने घरों में रहते हैं; बस नाम बदलते हैं। यही पद्धति AstroSage, Astromitra और लाल किताब के लेखक अपनाते हैं, और यही यह टूल उत्तर भारतीय शैली में बनाता है।',
        )}</p>
        <p>{T(
          'Aspects (drishti) work differently too. In Lal Kitab they run forward from the lower houses: the 1st looks at the 7th, the 2nd at the 6th, the 3rd at the 9th and 11th, the 4th at the 10th, the 5th at the 9th, the 6th at the 12th, and the 8th back at the 2nd. Houses 7, 9, 10, 11 and 12 cast no aspect.',
          'दृष्टि भी अलग तरह से काम करती है। लाल किताब में दृष्टि निचले घरों से आगे की ओर होती है: पहला घर सातवें को, दूसरा छठे को, तीसरा नौवें और ग्यारहवें को, चौथा दसवें को, पाँचवाँ नौवें को, छठा बारहवें को, और आठवाँ वापस दूसरे को देखता है। सातवाँ, नौवाँ, दसवाँ, ग्यारहवाँ और बारहवाँ घर कोई दृष्टि नहीं डालते।',
        )}</p>
      </GuideSection>

      <GuideSection eyebrow={T('Planet strength', 'ग्रहों का बल')} title={T('Pakka ghar, exalted and debilitated houses', 'पक्का घर, उच्च और नीच घर')}>
        <p>{T(
          'Each planet has a pakka ghar — a permanent house where Lal Kitab considers it most at home — and houses where it is exalted (strongest) or debilitated (weakest). Unlike ordinary Vedic astrology, these are counted by house. The tool marks all three on every planet.',
          'हर ग्रह का एक पक्का घर होता है — स्थायी घर जहाँ लाल किताब उसे सबसे सहज मानती है — और ऐसे घर जहाँ वह उच्च (सबसे बलवान) या नीच (सबसे कमज़ोर) होता है। सामान्य वैदिक ज्योतिष के उलट, ये घर से गिने जाते हैं। टूल हर ग्रह पर तीनों दिखाता है।',
        )}</p>
        <SampleTable caption={T('Lal Kitab houses of each planet', 'हर ग्रह के लाल किताब घर')}
          head={[T('Planet', 'ग्रह'), T('Pakka ghar', 'पक्का घर'), T('Exalted', 'उच्च'), T('Debilitated', 'नीच')]}
          rows={LK_PLANETS.map(p => [n(p), PAKKA_GHAR[p].join(', '), EXALTED[p].join(', '), DEBILITATED[p].join(', ')])} />
        <p className="text-sm">{T(
          'Sources: AstroSage’s Lal Kitab planet pages for the exalted and debilitated houses; the house-to-planet pakka ghar list on Sushma Jee’s Lal Kitab pages. Where a site gives more than one house (Rahu, Ketu, Jupiter, Saturn), all are shown. For Mars, AstroSage’s debilitation line is unclear, so we use the traditional 4th house.',
          'स्रोत: उच्च और नीच घरों के लिए AstroSage के लाल किताब ग्रह पेज; पक्के घर के लिए सुषमा जी के लाल किताब पेजों की घर-ग्रह सूची। जहाँ एक से अधिक घर दिए हैं (राहु, केतु, गुरु, शनि), सब दिखाए गए हैं। मंगल के लिए AstroSage की नीच वाली पंक्ति स्पष्ट नहीं है, इसलिए हम पारंपरिक चौथा घर लेते हैं।',
        )}</p>
      </GuideSection>

      <GuideSection white eyebrow={T('Sleeping, settled, artificial', 'सोये, कायम, बनावटी')} title={T('Sleeping planets and houses, kaayam, dharmi and masnui planets', 'सोये ग्रह और घर, कायम, धर्मी और मसनुई ग्रह')}>
        <Bullets items={[
          [T('Sleeping planet (soya grah)', 'सोया ग्रह'), T('a planet that looks at no other planet. Its results wait until it is woken. A planet in its pakka ghar is never sleeping (AstroSage’s rule, which we follow).', 'जो ग्रह किसी दूसरे ग्रह को नहीं देखता। उसका फल जागने तक रुका रहता है। पक्के घर का ग्रह कभी सोया नहीं होता (AstroSage का नियम, जो हम अपनाते हैं)।')],
          [T('Sleeping house (soya ghar)', 'सोया घर'), T('a house with no planet in it and no planet looking at it. Its area of life stays quiet until woken.', 'ऐसा घर जिसमें न कोई ग्रह हो, न कोई ग्रह उसे देखे। उसका जीवन-क्षेत्र जागने तक शांत रहता है।')],
          [T('Kaayam (settled) planet', 'कायम ग्रह'), T('no enemy sits with it and no enemy looks at its house, so it gives its results steadily.', 'न कोई शत्रु साथ बैठा है, न कोई शत्रु उसके घर को देखता है — इसलिए वह लगातार फल देता है।')],
          [T('Dharmi planet', 'धर्मी ग्रह'), T('Rahu or Ketu in the 4th or with the Moon, or Saturn in the 11th or with Jupiter, turns mild and “pious”.', 'चौथे घर में या चंद्र के साथ राहु-केतु, या ग्यारहवें घर में या गुरु के साथ शनि — सौम्य और “धर्मी” हो जाते हैं।')],
          [T('Masnui (artificial) planet', 'मसनुई ग्रह'), T('two planets in one house behave like a third: Mercury + Venus like the Sun, Sun + Jupiter like the Moon, Sun + Mercury like Mars, Jupiter + Rahu like Mercury, Sun + Venus like Jupiter; Mars + Saturn like an exalted Rahu, Sun + Saturn like a debilitated Rahu, Venus + Saturn like an exalted Ketu, Moon + Saturn like a debilitated Ketu.', 'एक घर के दो ग्रह तीसरे जैसे: बुध + शुक्र = सूर्य, सूर्य + गुरु = चंद्र, सूर्य + बुध = मंगल, गुरु + राहु = बुध, सूर्य + शुक्र = गुरु; मंगल + शनि = उच्च राहु, सूर्य + शनि = नीच राहु, शुक्र + शनि = उच्च केतु, चंद्र + शनि = नीच केतु।')],
        ]} />
        <p>{T('Chart types (teva):', 'टेवा के प्रकार:')}</p>
        <Bullets items={(Object.keys(TEVA_TEXT) as Array<keyof typeof TEVA_TEXT>).map(k => [label(TEVA_TEXT[k].name, lang), `${label(TEVA_TEXT[k].rule, lang)} ${label(TEVA_TEXT[k].meaning, lang)}`])} />
      </GuideSection>

      <GuideSection eyebrow={T('Rin', 'ऋण')} title={T('The nine Lal Kitab Rin (karmic debts)', 'लाल किताब के नौ ऋण')}>
        <p>{T(
          'A Rin is read when a planet’s own house is occupied by its enemies. Lal Kitab treats it as a family duty rather than a fault, so its remedy is done together: an equal small share — a coin, a coconut, a little money — from each blood relative, used on one day.',
          'जब किसी ग्रह के अपने घर में उसके शत्रु बैठे हों, तो ऋण पढ़ा जाता है। लाल किताब इसे दोष नहीं, पारिवारिक कर्तव्य मानती है, इसलिए उपाय मिलकर होता है: हर सगे संबंधी से बराबर छोटा हिस्सा — एक सिक्का, एक नारियल, थोड़ी राशि — एक ही दिन में।',
        )}</p>
        <SampleTable caption={T('Rin trigger conditions', 'ऋण की शर्तें')}
          head={[T('Debt', 'ऋण'), T('Planets', 'ग्रह'), T('In houses', 'घरों में')]}
          rows={RINS.map(r => [rinText(r.key, lang).name, r.planets.map(n).join(', '), r.houses.join(', ')])} />
        <p className="text-sm">{T(
          'Where the sources differ we say so. Kamal Kapoor and InstaAstro agree on Pitri, Matri, Stri, Bhai, Ajanma and Prakritik Rin. For Atma Rin we include Venus (InstaAstro); for Behan/Putri Rin we use the Moon in the 3rd or 6th (Kamal Kapoor); for Jaalim Rin we use the 10th or 11th house (Kamal Kapoor) — each choice follows the rule that a debt is a planet’s house holding its enemies.',
          'जहाँ स्रोत अलग हैं, हम बताते हैं। कमल कपूर और InstaAstro पितृ, मातृ, स्त्री, भाई, अजन्मा और प्राकृतिक ऋण पर एकमत हैं। आत्म ऋण में हम शुक्र शामिल करते हैं (InstaAstro); बहन/पुत्री ऋण में तीसरे या छठे घर का चंद्र (कमल कपूर); ज़ालिम ऋण में दसवाँ या ग्यारहवाँ घर (कमल कपूर) — हर चुनाव इस नियम पर है कि ऋण यानी किसी ग्रह के घर में उसके शत्रु।',
        )}</p>
      </GuideSection>

      <GuideSection white eyebrow={T('Varshphal', 'वर्षफल')} title={T('The Lal Kitab yearly chart and the 35-year cycle', 'लाल किताब वर्षफल और 35 वर्ष का चक्र')}>
        <p>{T(
          'Lal Kitab’s Varshphal does not recalculate the sky each year. Instead a fixed table of 120 years tells you, for each year of life, which house the planets of each birth house move to. Year 1 runs from birth to the first birthday, so at 48 you are in your 49th year. We use the table published by R. N. Bhandari; its printed copy repeats a house in four cells, and the table’s own rule — every year and every column inside each 12-year block uses each house once — fixes each of those cells, so we correct them and say so.',
          'लाल किताब का वर्षफल हर साल आकाश की नई गणना नहीं करता। एक निश्चित 120 वर्ष की तालिका बताती है कि जीवन के हर वर्ष में हर जन्म-घर के ग्रह किस घर में जाते हैं। पहला वर्ष जन्म से पहले जन्मदिन तक होता है, इसलिए 48 की उम्र में आपका 49वाँ वर्ष चल रहा है। हम आर. एन. भंडारी द्वारा प्रकाशित तालिका लेते हैं; उसकी छपी प्रति में चार खानों में कोई घर दोहराया गया है, और तालिका का अपना नियम — हर वर्ष और हर 12 वर्ष के खंड के हर कॉलम में हर घर एक बार — उन खानों को तय कर देता है, इसलिए हम उन्हें सुधारते हैं और यह बताते हैं।',
        )}</p>
        <p>{T(
          `Lal Kitab also divides life into a repeating 35-year cycle of planetary periods: ${CYCLE_35.map(c => `${c.planet} ${c.years}`).join(', ')} years. We start it with Saturn at birth, as Astromitra does; some sites list the same sequence from Jupiter.`,
          `लाल किताब जीवन को ग्रहों के 35 वर्ष के दोहराए जाने वाले चक्र में भी बाँटती है: ${CYCLE_35.map(c => `${n(c.planet)} ${c.years}`).join(', ')} वर्ष। हम इसे Astromitra की तरह जन्म से शनि से शुरू करते हैं; कुछ साइटें यही क्रम गुरु से लिखती हैं।`,
        )}</p>
      </GuideSection>

      <GuideSection eyebrow={T('Upay', 'उपाय')} title={T('Lal Kitab remedies — simple, free first, never fear', 'लाल किताब उपाय — सरल, पहले मुफ़्त, बिना डर')}>
        <Bullets items={[
          [T('One at a time', 'एक समय में एक'), T(`Lal Kitab sources advise one remedy at a time, done daily between sunrise and sunset for ${REMEDY_DAYS.min}–${REMEDY_DAYS.max} days; if a day is missed, start the count again.`, `लाल किताब के स्रोत एक समय में एक उपाय, रोज़ सूर्योदय से सूर्यास्त के बीच, ${REMEDY_DAYS.min}–${REMEDY_DAYS.max} दिन तक करने को कहते हैं; कोई दिन छूटे तो गिनती फिर से।`)],
          [T('Free or near-free', 'मुफ़्त या लगभग मुफ़्त'), T('feeding a cow, dog or birds, offering a coin or a little jaggery in flowing water, keeping a small piece of silver, respecting parents and elders.', 'गाय, कुत्ते या पक्षियों को खिलाना, बहते पानी में सिक्का या थोड़ा गुड़, चाँदी का छोटा टुकड़ा रखना, माता-पिता और बड़ों का सम्मान।')],
          [T('Only where needed', 'केवल ज़रूरत पर'), T('the tool suggests a remedy only for placements that ask for care; a planet that is already well placed needs nothing.', 'टूल केवल सावधानी माँगने वाली स्थितियों के लिए उपाय सुझाता है; पहले से अच्छी स्थिति वाले ग्रह को कुछ नहीं चाहिए।')],
          [T('Nothing to buy', 'कुछ ख़रीदना नहीं'), T('no gemstone, paid ritual or product is needed or recommended here, and no remedy can guarantee a result.', 'यहाँ कोई रत्न, शुल्क वाला अनुष्ठान या उत्पाद ज़रूरी या सुझाया नहीं गया, और कोई उपाय परिणाम की गारंटी नहीं दे सकता।')],
        ]} />
      </GuideSection>

      <GuideSection white eyebrow={T('Glossary', 'शब्दावली')} title={T('Lal Kitab terms in plain words', 'लाल किताब के शब्द, आसान भाषा में')}>
        <TermList items={GLOSSARY.map(g => [label(g.term, lang), label(g.def, lang)])} />
      </GuideSection>

      <RelatedLinks title={T('Related tools', 'संबंधित टूल')} links={links} />
      <GuideFAQ items={lalKitabFaq(lang)} title={T('Frequently asked questions', 'अक्सर पूछे जाने वाले प्रश्न')} />
    </Guide>
  );
}

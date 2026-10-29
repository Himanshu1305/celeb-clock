import React from 'react';
import { ArticleLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { mulank, bhagyank } from '@/lib/numerologyExtra';
import { REPORT_PRICE } from '@/lib/pricing';
import { NumerologyCalculator } from '@/components/numerology/NumerologyCalculator';

// Batch 9 (founder decision) — Indian convention, the same shared functions as /numerology:
//   मूलांक (Mulank)   = the birth DAY reduced to 1–9            e.g. 28 → 2+8 = 10 → 1
//   भाग्यांक (Bhagyank) = EVERY digit of the full date, reduced to 1–9
//                        e.g. 28-03-1973 → 2+8+3+1+9+7+3 = 33 → 6
// (Indian calculators reduce to 1–9 and keep no master number — ishvaram.com/bhagyank-calculator,
// panchangbodh.com/mulank-bhagyank-calculator, opened 29 Oct 2026; see numerologyExtra.ts.)
// A Western master number (11/22/33 Life Path) is shown separately by the calculator.
// Planet rulers follow the Indian scheme, where 4 = Rahu and 7 = Ketu (not the
// Western Uranus/Neptune).
const MOOLANK_PLANET: Record<number, string> = {
  1: 'सूर्य (Sun)', 2: 'चंद्र (Moon)', 3: 'बृहस्पति / गुरु (Jupiter)', 4: 'राहु (Rahu)', 5: 'बुध (Mercury)',
  6: 'शुक्र (Venus)', 7: 'केतु (Ketu)', 8: 'शनि (Saturn)', 9: 'मंगल (Mars)',
};

const EX_MUL = mulank(28);
const EX_BH = bhagyank(28, 3, 1973);

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// Hindi descriptions for Life Path numbers 1-9 (meanings paired with LIFE_PATH_EXTENDED titles).
const HINDI_MEANINGS: Record<number, { title: string; desc: string }> = {
  1: { title: 'नेता', desc: 'मूलांक 1 वाले लोग जन्मजात नेता होते हैं। वे स्वतंत्र, महत्वाकांक्षी और आत्मनिर्भर होते हैं तथा अपना रास्ता स्वयं बनाते हैं। इनमें पहल करने की अद्भुत क्षमता होती है।' },
  2: { title: 'राजनयिक', desc: 'मूलांक 2 वाले लोग संवेदनशील, सहयोगी और शांतिप्रिय होते हैं। वे बेहतरीन राजनयिक और मध्यस्थ होते हैं जो अपनी सूझबूझ से रिश्तों में संतुलन बनाए रखते हैं।' },
  3: { title: 'रचनात्मक', desc: 'मूलांक 3 वाले लोग रचनात्मक, अभिव्यक्तिपूर्ण और आशावादी होते हैं। कला, लेखन और संचार में इनकी प्रतिभा असाधारण होती है और ये चारों ओर खुशी फैलाते हैं।' },
  4: { title: 'निर्माता', desc: 'मूलांक 4 वाले लोग व्यावहारिक, अनुशासित और मेहनती होते हैं। ये धैर्य और लगन से स्थायी नींव बनाते हैं और भरोसेमंद माने जाते हैं।' },
  5: { title: 'साहसी', desc: 'मूलांक 5 वाले लोग स्वतंत्र विचारों वाले, बहुमुखी और जिज्ञासु होते हैं। ये बदलाव और नए अनुभवों को अपनाते हैं और स्वतंत्रता को सबसे अधिक महत्व देते हैं।' },
  6: { title: 'पालनकर्ता', desc: 'मूलांक 6 वाले लोग जिम्मेदार, स्नेही और परिवार-प्रेमी होते हैं। ये स्वाभाविक रूप से देखभाल करने वाले होते हैं और समाज व परिवार के कल्याण के प्रति समर्पित रहते हैं।' },
  7: { title: 'साधक', desc: 'मूलांक 7 वाले लोग विश्लेषणात्मक, आत्मचिंतनशील और आध्यात्मिक होते हैं। ये गहरे विचारक होते हैं जो ज्ञान और भीतरी सत्य की खोज में लगे रहते हैं।' },
  8: { title: 'उपलब्धिकर्ता', desc: 'मूलांक 8 वाले लोग शक्तिशाली, अधिकारी और व्यवसाय-कुशल होते हैं। ये स्वाभाविक प्रबंधक होते हैं जो कड़ी मेहनत से सफलता और समृद्धि अर्जित करते हैं।' },
  9: { title: 'मानवतावादी', desc: 'मूलांक 9 वाले लोग करुणामय, उदार और आदर्शवादी होते हैं। ये मानवता की सेवा के लिए समर्पित होते हैं और दूसरों की भलाई में गहरी रुचि रखते हैं।' },
};

const FAQS = [
  {
    q: 'अंकज्योतिष में मूलांक क्या है?',
    a: 'मूलांक आपके जन्म के दिन (तारीख) से निकाला गया अंक है — केवल दिन, महीना या वर्ष नहीं। जैसे 28 तारीख को जन्म: 2+8 = 10 → 1+0 = 1, यानी मूलांक 1। पूरी जन्मतिथि (दिन + महीना + वर्ष) से जो अंक निकलता है उसे भाग्यांक कहते हैं। दोनों जन्म के समय तय हो जाते हैं और कभी नहीं बदलते।',
  },
  {
    q: 'जन्मतिथि से मूलांक और भाग्यांक कैसे निकालें?',
    a: `मूलांक: केवल जन्म की तारीख के अंक जोड़ें — 28 मार्च 1973 के लिए 2+8 = 10 → 1, यानी मूलांक ${EX_MUL.number}। भाग्यांक: पूरी जन्मतिथि के सभी अंक जोड़ें और 1–9 तक घटाएँ — ${EX_BH.working}, यानी भाग्यांक ${EX_BH.number}। भारतीय पद्धति में 11, 22, 33 को भी एक अंक तक घटाया जाता है।`,
  },
  {
    q: 'क्या अंकज्योतिष सटीक है?',
    a: 'अंकज्योतिष आत्म-समझ और आत्म-चिंतन की एक प्रणाली है, न कि भविष्यवाणी का साधन। यह आपकी प्रवृत्तियों, शक्तियों और चुनौतियों का वर्णन करता है। BornClock इसे सांस्कृतिक अंतर्दृष्टि और आत्म-चिंतन के उपकरण के रूप में प्रस्तुत करता है।',
  },
  {
    q: 'कौन सा मूलांक सबसे शुभ माना जाता है?',
    a: 'कोई भी मूलांक दूसरे से बेहतर या बुरा नहीं होता — हर अंक की अपनी विशेष ऊर्जा और शक्ति होती है। मूलांक 1 नेतृत्व से, 8 व्यवसाय से और 9 सेवा से जुड़ा है। सफलता इस पर निर्भर करती है कि आप अपने अंक की ऊर्जा का उपयोग कैसे करते हैं।',
  },
  {
    q: 'BornClock मूलांक की गणना कैसे करता है?',
    a: 'BornClock मूलांक जन्म की तारीख से और भाग्यांक पूरी जन्मतिथि के सभी अंकों से निकालता है — दोनों 1 से 9 तक, जैसे भारतीय कैलकुलेटर करते हैं। अगर Western Life Path में मास्टर अंक (11, 22, 33) आता है तो उसे अलग से "Western मास्टर अंक" लिखकर दिखाया जाता है। भारतीय अंक ज्योतिष में अंक 4 का स्वामी राहु और अंक 7 का स्वामी केतु माना जाता है।',
  },
];

export function HindiNumerologyArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'मूलांक, भाग्यांक और नामांक कैलकुलेटर — अंकज्योतिष जन्मतिथि से',
    description: 'जन्मतिथि से मूलांक और भाग्यांक, और नाम से नामांक मुफ्त निकालें — मूलांक 1 से 9 का अर्थ हिंदी में।',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/hi/numerology-by-date-of-birth/',
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <ArticleLayout
      theme="mystic"
      testId="hindi-numerology-article"
      seo={(
        <SEO
          title="मूलांक, भाग्यांक, नामांक कैलकुलेटर — जन्मतिथि से | BornClock"
          description="जन्मतिथि से अपना मूलांक और भाग्यांक, और नाम से नामांक (कैल्डियन) मुफ्त निकालें — गणना के साथ। मूलांक 1 से 9 का अर्थ, स्वामी ग्रह सहित, हिंदी में।"
          canonicalUrl="/hi/numerology-by-date-of-birth"
          ogType="article"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Articles', to: '/articles' }], current: 'अंकज्योतिष जन्मतिथि से' }}
      footer={{
        tagline: 'जन्मतिथि से मूलांक और भाग्यांक, नाम से नामांक — मुफ्त, गणना के साथ।',
        nav: [
          { label: 'Mystic Corner', to: '/mystic-corner' },
          { label: 'Numerology', to: '/numerology' },
          { label: 'Zodiac', to: '/zodiac' },
          { label: 'Compatibility', to: '/compatibility' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Calculated, not templated.',
      }}
      eyebrow="Numerology (Hindi)"
      h1="मूलांक, भाग्यांक और नामांक कैलकुलेटर — अंकज्योतिष जन्मतिथि से"
      lead={(
        <>
          अंकज्योतिष (Numerology) आत्म-समझ की सबसे प्राचीन प्रणालियों में से एक है, जिसका
          उपयोग हजारों वर्षों से व्यक्तित्व, उद्देश्य और संभावनाओं को समझने के लिए किया जाता
          है। भारत में अंकज्योतिष की गहरी जड़ें हैं — शुभ तिथियों के चयन से लेकर नाम और
          व्यवसाय के निर्णयों तक। BornClock पर आपकी जन्मतिथि से आपका <strong>मूलांक</strong>
          स्वतः निकाला जाता है, जो आपकी अंकज्योतिष कुंडली का सबसे महत्वपूर्ण अंक है।
        </>
      )}
    >
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <section className="section" data-testid="hindi-numerology-article">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <p className="text-gray-700 leading-relaxed mb-6">
            भारतीय अंक ज्योतिष में दो मुख्य अंक होते हैं: <strong>मूलांक</strong>, जो केवल आपके जन्म
            के दिन (तारीख) से निकलता है, और <strong>भाग्यांक</strong>, जो आपकी पूरी जन्मतिथि से निकलता है।
            दोनों जीवनभर नहीं बदलते। व्यक्तित्व परीक्षणों के विपरीत, जो आपके उत्तरों पर निर्भर करते हैं,
            आपका मूलांक जन्म के समय ही तय हो जाता है — एक गणितीय स्थिरांक जो आपके मूल
            स्वभाव, शक्तियों, चुनौतियों और जीवन के सबक को दर्शाता है।
          </p>

          <section className="my-8" data-testid="hi-calculator">
            <h2 className="text-xl font-black text-[#6E5AA6] mb-2">अपना मूलांक, भाग्यांक और नामांक अभी जानें (मुफ्त)</h2>
            <p className="text-gray-700 mb-4">जन्मतिथि डालें — नाम वैकल्पिक है। हर अंक की गणना साथ में दिखेगी।</p>
            <NumerologyCalculator lang="hi" />
          </section>

          <h2 className="text-2xl font-black text-gray-900 mb-3">मूलांक कैसे निकालें?</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            <strong>मूलांक</strong> निकालने के लिए केवल जन्म की तारीख के अंक जोड़ें। उदाहरण के लिए
            <strong> 28 मार्च 1973</strong>: 2+8 = 10 → 1+0 = {EX_MUL.number}, इसलिए मूलांक {EX_MUL.number} होगा।
            <strong> भाग्यांक</strong> के लिए पूरी जन्मतिथि के सभी अंक जोड़ें और 1–9 तक घटाएँ:
            {' '}{EX_BH.working}, यानी भाग्यांक {EX_BH.number}।
            (Western Life Path दिन, महीना और वर्ष को अलग-अलग घटाता है और 11, 22, 33 को रखता है — आख़िरी अंक वही आता है, फ़र्क सिर्फ़ मास्टर अंक का है।)
            मूलांक 1 से 9 तक कोई भी अंक हो सकता है, और हर अंक का अपना विशेष अर्थ और स्वामी ग्रह होता है।
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">सभी मूलांक और उनका अर्थ</h2>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => {
            const hi = HINDI_MEANINGS[n];
            if (!hi) return null;
            return (
              <section key={n} id={`mulank-${n}`} className="mb-8">
                <h3 className="text-xl font-black text-gray-900 mb-1">
                  मूलांक {n} — {hi.title}
                </h3>
                <div className="text-xs text-gray-500 mb-3">
                  स्वामी ग्रह: {MOOLANK_PLANET[n]}
                </div>
                <p className="text-gray-700 leading-relaxed">{hi.desc}</p>
              </section>
            );
          })}

          <h2 className="text-2xl font-black text-gray-900 mb-4">अक्सर पूछे जाने वाले प्रश्न</h2>
          <div className="space-y-4 mb-10">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-2">{f.q}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-[#6E5AA6] to-[#6E5AA6] rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">पूरी जन्मतिथि रिपोर्ट (सशुल्क)</h2>
            <p className="text-[#6E5AA6] mb-6">
              मूलांक तो केवल एक हिस्सा है। BornClock आपकी वैदिक राशि, पश्चिमी राशि, नक्षत्र,
              भाग्यशाली रत्न और बहुत कुछ आपकी जन्मतिथि से बताता है।
            </p>
            <a href="/birthday-report"
               data-testid="hi-paid-report"
               className="inline-block bg-white text-[#6E5AA6] font-black px-8 py-3
                          rounded-full text-lg hover:bg-[#6E5AA6]/10 transition-colors">
              पूरी जन्मतिथि रिपोर्ट (सशुल्क ₹{REPORT_PRICE.INR}) →
            </a>
            <p className="text-sm mt-3">मूलांक, भाग्यांक और नामांक ऊपर के कैलकुलेटर में मुफ्त हैं।</p>
          </div>

        </article>
      </section>
    </ArticleLayout>
  );
}

export default HindiNumerologyArticle;

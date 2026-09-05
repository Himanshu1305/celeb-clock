import React from 'react';
import { SEO } from '@/components/SEO';
import { LIFE_PATH_EXTENDED } from '@/data/astrologicalData';

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
    a: 'मूलांक आपकी जन्मतिथि से निकाला गया सबसे महत्वपूर्ण अंक है। यह आपके स्वभाव, प्राकृतिक शक्तियों, चुनौतियों और जीवन के उद्देश्य को दर्शाता है। यह जन्म के समय तय हो जाता है और कभी नहीं बदलता।',
  },
  {
    q: 'जन्मतिथि से मूलांक कैसे निकालें?',
    a: 'अपनी जन्मतिथि के दिन, महीने और वर्ष के सभी अंकों को जोड़कर एक अंक तक कम करें। उदाहरण के लिए 28 मार्च 1973 के लिए सभी अंक जोड़ने पर परिणाम एकल अंक में बदल जाता है, जो आपका मूलांक होता है।',
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
    a: 'BornClock आपकी जन्मतिथि पर मानक पाइथागोरस पद्धति लागू करके मूलांक की गणना करता है। यह तुरंत आपका मूलांक बताता है और उसके साथ पूरी प्रोफ़ाइल — शासक ग्रह, तत्व, शक्तियां और जीवन उद्देश्य — प्रदान करता है।',
  },
];

export function HindiNumerologyArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'अंकज्योतिष जन्मतिथि से — अपना मूलांक जानें',
    description: 'जन्मतिथि से अपना मूलांक जानें। मूलांक 1 से 9 तक का पूरा अर्थ हिंदी में और मुफ्त गणना।',
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
    <>
      <SEO
        title="अंकज्योतिष जन्मतिथि से — अपना मूलांक जानें | BornClock"
        description="जन्मतिथि से अपना मूलांक निकालें। मूलांक 1 से 9 तक का पूरा अर्थ हिंदी में, शासक ग्रह और जीवन उद्देश्य के साथ। मुफ्त गणना करें।"
        canonicalUrl="/hi/numerology-by-date-of-birth"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="hindi-numerology-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            अंकज्योतिष जन्मतिथि से — अपना मूलांक जानें
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            अंकज्योतिष (Numerology) आत्म-समझ की सबसे प्राचीन प्रणालियों में से एक है, जिसका
            उपयोग हजारों वर्षों से व्यक्तित्व, उद्देश्य और संभावनाओं को समझने के लिए किया जाता
            है। भारत में अंकज्योतिष की गहरी जड़ें हैं — शुभ तिथियों के चयन से लेकर नाम और
            व्यवसाय के निर्णयों तक। BornClock पर आपकी जन्मतिथि से आपका <strong>मूलांक</strong>
            स्वतः निकाला जाता है, जो आपकी अंकज्योतिष कुंडली का सबसे महत्वपूर्ण अंक है।
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            आपका मूलांक आपकी जन्मतिथि के सभी अंकों को जोड़कर निकाला जाता है और यह जीवनभर
            नहीं बदलता। व्यक्तित्व परीक्षणों के विपरीत, जो आपके उत्तरों पर निर्भर करते हैं,
            आपका मूलांक जन्म के समय ही तय हो जाता है — एक गणितीय स्थिरांक जो आपके मूल
            स्वभाव, शक्तियों, चुनौतियों और जीवन के सबक को दर्शाता है।
          </p>

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8 text-center">
            <h2 className="text-xl font-black text-indigo-900 mb-2">
              अपना मूलांक अभी जानें
            </h2>
            <p className="text-indigo-700 mb-5">
              अपनी जन्मतिथि दर्ज करें और अपनी पूरी अंकज्योतिष प्रोफ़ाइल तुरंत प्राप्त करें।
            </p>
            <a href="/birthday-report"
               className="inline-block bg-indigo-600 text-white font-black px-8 py-3
                          rounded-full text-lg hover:bg-indigo-700 transition-colors">
              मुफ्त जन्मतिथि रिपोर्ट बनाएं →
            </a>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">मूलांक कैसे निकालें?</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            अपना मूलांक निकालने के लिए जन्मतिथि के दिन, महीने और वर्ष के सभी अंकों को जोड़ें
            और परिणाम को एकल अंक तक कम करें। उदाहरण के लिए <strong>28 मार्च 1973</strong>:
            2+8+0+3+1+9+7+3 = 33 → 3+3 = 6, इसलिए मूलांक 6 होगा। इस प्रकार 1 से 9 तक
            कोई भी अंक आपका मूलांक हो सकता है, और हर अंक का अपना विशेष अर्थ होता है।
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">सभी मूलांक और उनका अर्थ</h2>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => {
            const p = LIFE_PATH_EXTENDED[n];
            const hi = HINDI_MEANINGS[n];
            if (!p || !hi) return null;
            return (
              <section key={n} id={`mulank-${n}`} className="mb-8">
                <h3 className="text-xl font-black text-gray-900 mb-1">
                  मूलांक {n} — {hi.title}
                </h3>
                <div className="text-xs text-gray-500 mb-3">
                  शासक ग्रह: {p.ruling_planet} · तत्व: {p.element}
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

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">अपनी पूरी जन्मतिथि प्रोफ़ाइल जानें</h2>
            <p className="text-indigo-200 mb-6">
              मूलांक तो केवल एक हिस्सा है। BornClock आपकी वैदिक राशि, पश्चिमी राशि, नक्षत्र,
              भाग्यशाली रत्न और बहुत कुछ आपकी जन्मतिथि से बताता है।
            </p>
            <a href="/birthday-report"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-indigo-50 transition-colors">
              मेरी मुफ्त जन्मतिथि रिपोर्ट बनाएं →
            </a>
          </div>

        </article>
      </main>
    </>
  );
}

export default HindiNumerologyArticle;

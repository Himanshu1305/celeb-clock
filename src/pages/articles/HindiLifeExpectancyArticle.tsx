import React from 'react';
import { SEO } from '@/components/SEO';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const FACTORS = [
  {
    title: 'धूम्रपान',
    body: 'तंबाकू और धूम्रपान जीवन प्रत्याशा को सबसे अधिक घटाने वाले कारकों में से एक है। नियमित धूम्रपान करने वालों की औसत आयु धूम्रपान न करने वालों की तुलना में लगभग 10 वर्ष कम होती है। धूम्रपान छोड़ना किसी भी उम्र में स्वास्थ्य के लिए तुरंत लाभकारी होता है।',
  },
  {
    title: 'व्यायाम',
    body: 'नियमित व्यायाम हृदय को मजबूत बनाता है, रक्तचाप नियंत्रित रखता है और मधुमेह जैसी बीमारियों का जोखिम घटाता है। सप्ताह में कम से कम 150 मिनट की मध्यम शारीरिक गतिविधि जीवन प्रत्याशा को कई वर्षों तक बढ़ा सकती है।',
  },
  {
    title: 'आहार',
    body: 'संतुलित आहार, जिसमें फल, सब्जियां, साबुत अनाज और दालें शामिल हों, दीर्घायु का आधार है। अधिक चीनी, नमक और प्रसंस्कृत भोजन से बचना और घर का ताजा पका भोजन खाना स्वास्थ्य के लिए सर्वोत्तम है।',
  },
  {
    title: 'नींद',
    body: 'हर रात 7 से 8 घंटे की गहरी नींद शरीर और मस्तिष्क की मरम्मत के लिए आवश्यक है। लगातार कम नींद हृदय रोग, मोटापे और तनाव को बढ़ाती है, जिससे जीवन प्रत्याशा घटती है।',
  },
  {
    title: 'तनाव',
    body: 'दीर्घकालिक तनाव शरीर में सूजन बढ़ाता है और हृदय व प्रतिरक्षा तंत्र को कमजोर करता है। ध्यान, योग और सामाजिक संबंध तनाव को कम करके एक लंबा और स्वस्थ जीवन जीने में मदद करते हैं।',
  },
];

const FAQS = [
  {
    q: 'जीवन प्रत्याशा कैलकुलेटर कैसे काम करता है?',
    a: 'जीवन प्रत्याशा कैलकुलेटर आपकी जन्मतिथि, जीवनशैली और स्वास्थ्य संबंधी आदतों के आधार पर एक अनुमानित आयु बताता है। यह WHO और वैज्ञानिक शोध के आंकड़ों का उपयोग करके यह दर्शाता है कि आप औसतन कितने साल जी सकते हैं। यह केवल एक अनुमान है, कोई भविष्यवाणी नहीं।',
  },
  {
    q: 'भारत में औसत जीवन प्रत्याशा कितनी है?',
    a: 'विश्व स्वास्थ्य संगठन (WHO) के आंकड़ों के अनुसार भारत में औसत जीवन प्रत्याशा लगभग 70.2 वर्ष है। महिलाओं की जीवन प्रत्याशा आमतौर पर पुरुषों की तुलना में थोड़ी अधिक होती है। बेहतर स्वास्थ्य सुविधाओं और स्वस्थ जीवनशैली के साथ यह लगातार बढ़ रही है।',
  },
  {
    q: 'क्या जीवनशैली बदलकर मैं अधिक जी सकता हूं?',
    a: 'हां, अनुसंधान स्पष्ट रूप से दिखाते हैं कि स्वस्थ आहार, नियमित व्यायाम, पर्याप्त नींद, धूम्रपान से परहेज और तनाव प्रबंधन जीवन प्रत्याशा को कई वर्षों तक बढ़ा सकते हैं। छोटे-छोटे सकारात्मक बदलाव भी लंबे समय में बड़ा अंतर लाते हैं।',
  },
  {
    q: 'धूम्रपान जीवन प्रत्याशा को कितना प्रभावित करता है?',
    a: 'धूम्रपान जीवन प्रत्याशा को औसतन लगभग 10 वर्ष तक घटा सकता है। यह हृदय रोग, फेफड़ों के कैंसर और श्वसन संबंधी बीमारियों का प्रमुख कारण है। किसी भी उम्र में धूम्रपान छोड़ने से स्वास्थ्य में तुरंत और दीर्घकालिक सुधार होता है।',
  },
  {
    q: 'क्या यह कैलकुलेटर मुफ्त है?',
    a: 'हां, BornClock का जीवन प्रत्याशा कैलकुलेटर पूरी तरह मुफ्त है। आप अपनी जानकारी दर्ज करके तुरंत अपना अनुमानित जीवन प्रत्याशा परिणाम प्राप्त कर सकते हैं। यह उपकरण स्वास्थ्य के प्रति जागरूकता बढ़ाने के लिए बनाया गया है।',
  },
];

export function HindiLifeExpectancyArticle() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'जीवन प्रत्याशा कैलकुलेटर — आप कितने साल जिएंगे?',
    description: 'WHO डेटा पर आधारित जीवन प्रत्याशा कैलकुलेटर। जानें कौन से 5 कारक आपकी आयु तय करते हैं और स्वस्थ, लंबा जीवन कैसे जिएं।',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/hi/life-expectancy-calculator/',
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
        title="जीवन प्रत्याशा कैलकुलेटर — आप कितने साल जिएंगे? | BornClock"
        description="WHO डेटा पर आधारित मुफ्त जीवन प्रत्याशा कैलकुलेटर। धूम्रपान, व्यायाम, आहार, नींद और तनाव जैसे 5 कारक जानें और स्वस्थ लंबा जीवन जिएं।"
        canonicalUrl="/hi/life-expectancy-calculator"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="hindi-life-expectancy-article" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            जीवन प्रत्याशा कैलकुलेटर — आप कितने साल जिएंगे?
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            जीवन प्रत्याशा (Life Expectancy) का अर्थ है वह औसत आयु जितने वर्ष एक व्यक्ति के
            जीने की संभावना होती है। यह केवल एक संख्या नहीं है, बल्कि आपके स्वास्थ्य,
            जीवनशैली और आदतों का दर्पण है। BornClock का जीवन प्रत्याशा कैलकुलेटर विश्व
            स्वास्थ्य संगठन (WHO) के आंकड़ों और वैज्ञानिक शोध पर आधारित है, जो आपको यह
            समझने में मदद करता है कि आप औसतन कितने साल जी सकते हैं।
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            WHO के अनुसार भारत में औसत जीवन प्रत्याशा लगभग <strong>70.2 वर्ष</strong> है।
            यह आंकड़ा पिछले कुछ दशकों में बेहतर स्वास्थ्य सुविधाओं, टीकाकरण और पोषण के
            कारण लगातार बढ़ा है। हालांकि, आपकी व्यक्तिगत जीवन प्रत्याशा इस औसत से काफी
            अलग हो सकती है — और अच्छी बात यह है कि इसमें से बहुत कुछ आपके अपने हाथ में है।
          </p>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 my-8 text-center">
            <h2 className="text-xl font-black text-emerald-900 mb-2">
              अपनी जीवन प्रत्याशा की गणना करें
            </h2>
            <p className="text-emerald-700 mb-5">
              अपनी जन्मतिथि और जीवनशैली दर्ज करें और तुरंत जानें कि आप कितने साल जी सकते हैं।
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-emerald-600 text-white font-black px-8 py-3
                          rounded-full text-lg hover:bg-emerald-700 transition-colors">
              मुफ्त जीवन प्रत्याशा कैलकुलेटर खोलें →
            </a>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">
            WHO डेटा: भारत और विश्व की जीवन प्रत्याशा
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            विश्व स्वास्थ्य संगठन दुनिया भर के देशों की जीवन प्रत्याशा पर आंकड़े एकत्र करता
            है। भारत की औसत जीवन प्रत्याशा 70.2 वर्ष है, जबकि जापान और स्विट्ज़रलैंड जैसे
            देशों में यह 84 वर्ष से भी अधिक है। इस अंतर का मुख्य कारण स्वास्थ्य सेवाओं की
            गुणवत्ता, स्वच्छता, पोषण और जीवनशैली में भिन्नता है। महत्वपूर्ण बात यह है कि
            व्यक्तिगत स्तर पर स्वस्थ आदतें अपनाकर कोई भी व्यक्ति औसत से अधिक जीवन जी सकता है।
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">
            जीवन प्रत्याशा तय करने वाले 5 प्रमुख कारक
          </h2>
          {FACTORS.map((f, i) => (
            <section key={i} className="mb-6">
              <h3 className="text-xl font-black text-gray-900 mb-2">
                {i + 1}. {f.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">{f.body}</p>
            </section>
          ))}

          <p className="text-gray-700 leading-relaxed mb-6 mt-4">
            ये पांचों कारक मिलकर आपके स्वास्थ्य और आयु पर गहरा प्रभाव डालते हैं। अच्छी
            खबर यह है कि इनमें से लगभग हर कारक को आप अपने प्रयासों से सुधार सकते हैं।
            एक स्वस्थ आहार अपनाना, नियमित व्यायाम करना और धूम्रपान छोड़ना जैसे बदलाव
            आपकी जीवन प्रत्याशा में कई वर्ष जोड़ सकते हैं।
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">अक्सर पूछे जाने वाले प्रश्न</h2>
          <div className="space-y-4 mb-10">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-2">{f.q}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">आज ही अपनी जीवन प्रत्याशा जानें</h2>
            <p className="text-emerald-100 mb-6">
              कुछ ही सेकंड में जानें कि आपकी जीवनशैली आपकी आयु को कैसे प्रभावित कर रही है
              और स्वस्थ लंबा जीवन जीने के लिए क्या बदलें।
            </p>
            <a href="/longevity-calculator"
               className="inline-block bg-white text-emerald-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-emerald-50 transition-colors">
              मुफ्त कैलकुलेटर शुरू करें →
            </a>
          </div>

        </article>
      </main>
    </>
  );
}

export default HindiLifeExpectancyArticle;

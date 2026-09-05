import React from 'react';
import { SEO } from '@/components/SEO';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const FACTORS = [
  { title: 'धूम्रपान', body: 'तंबाकू और धूम्रपान जीवन प्रत्याशा को घटाने वाला सबसे बड़ा कारक है। नियमित धूम्रपान औसत आयु लगभग 10 वर्ष कम कर सकता है। इसे छोड़ना किसी भी उम्र में लाभकारी है।' },
  { title: 'व्यायाम', body: 'नियमित शारीरिक गतिविधि हृदय को मजबूत करती है और कई बीमारियों का जोखिम घटाती है। सप्ताह में 150 मिनट का व्यायाम आपकी जीवन प्रत्याशा को कई वर्षों तक बढ़ा सकता है।' },
  { title: 'आहार', body: 'फल, सब्जियां, साबुत अनाज और दालों से भरपूर संतुलित आहार दीर्घायु की नींव है। अधिक चीनी, नमक और प्रसंस्कृत भोजन से बचना स्वास्थ्य के लिए सर्वोत्तम है।' },
  { title: 'नींद', body: 'हर रात 7 से 8 घंटे की गहरी नींद शरीर और मस्तिष्क की मरम्मत के लिए जरूरी है। लगातार कम नींद हृदय रोग और तनाव को बढ़ाकर जीवन प्रत्याशा घटाती है।' },
  { title: 'तनाव', body: 'दीर्घकालिक तनाव शरीर को भीतर से कमजोर करता है। ध्यान, योग और मजबूत सामाजिक संबंध तनाव कम करके एक लंबा और स्वस्थ जीवन जीने में मदद करते हैं।' },
];

const FAQS = [
  {
    q: 'मेरी जीवन प्रत्याशा क्या होती है?',
    a: 'जीवन प्रत्याशा वह औसत आयु है जितने वर्ष आपके जीने की संभावना होती है। यह आपकी जन्मतिथि, स्वास्थ्य और जीवनशैली की आदतों पर निर्भर करती है। BornClock का कैलकुलेटर WHO डेटा से आपको एक अनुमान देता है।',
  },
  {
    q: 'भारत में औसत जीवन प्रत्याशा कितनी है?',
    a: 'WHO के अनुसार भारत में औसत जीवन प्रत्याशा लगभग 70.2 वर्ष है। बेहतर स्वास्थ्य सुविधाओं और स्वस्थ जीवनशैली के कारण यह लगातार बढ़ रही है। महिलाओं की औसत आयु पुरुषों से थोड़ी अधिक होती है।',
  },
  {
    q: 'क्या मैं अपनी जीवन प्रत्याशा बढ़ा सकता हूं?',
    a: 'हां। स्वस्थ आहार, नियमित व्यायाम, पर्याप्त नींद, धूम्रपान से परहेज और तनाव प्रबंधन आपकी जीवन प्रत्याशा को कई वर्षों तक बढ़ा सकते हैं। छोटे सकारात्मक बदलाव भी बड़ा अंतर लाते हैं।',
  },
  {
    q: 'कौन सा कारक जीवन प्रत्याशा को सबसे अधिक प्रभावित करता है?',
    a: 'धूम्रपान और खराब आहार जीवन प्रत्याशा को सबसे अधिक घटाने वाले कारक हैं, जबकि नियमित व्यायाम और अच्छी नींद इसे सबसे अधिक बढ़ाते हैं। इन आदतों में सुधार से बड़ा लाभ मिलता है।',
  },
  {
    q: 'क्या यह कैलकुलेटर मुफ्त है?',
    a: 'हां, BornClock का जीवन प्रत्याशा कैलकुलेटर पूरी तरह मुफ्त है। आप अपनी जानकारी दर्ज करके कुछ ही सेकंड में अपना अनुमानित परिणाम प्राप्त कर सकते हैं।',
  },
];

export function HindiJeevanPratyashaPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'मेरी जीवन प्रत्याशा क्या है?',
    description: 'जानें आपकी जीवन प्रत्याशा क्या है। WHO डेटा और 5 प्रमुख कारकों के साथ अपनी अनुमानित आयु की मुफ्त गणना करें।',
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: 'https://bornclock.com/hi/meri-jeevan-pratyasha/',
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
        title="मेरी जीवन प्रत्याशा क्या है? | BornClock"
        description="जानें आपकी जीवन प्रत्याशा क्या है। WHO डेटा और धूम्रपान, व्यायाम, आहार जैसे 5 कारकों के साथ अपनी अनुमानित आयु की मुफ्त गणना करें।"
        canonicalUrl="/hi/meri-jeevan-pratyasha"
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid="hindi-jeevan-pratyasha-page" className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            मेरी जीवन प्रत्याशा क्या है?
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            यह एक ऐसा प्रश्न है जो हर व्यक्ति के मन में कभी न कभी आता है — मैं कितने साल
            जिऊंगा? जीवन प्रत्याशा वह औसत आयु है जितने वर्ष एक व्यक्ति के जीने की संभावना
            होती है। यह कोई निश्चित भविष्यवाणी नहीं, बल्कि आपकी जन्मतिथि, स्वास्थ्य और
            जीवनशैली पर आधारित एक वैज्ञानिक अनुमान है। BornClock का जीवन प्रत्याशा कैलकुलेटर
            विश्व स्वास्थ्य संगठन (WHO) के आंकड़ों पर आधारित है।
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            WHO के अनुसार भारत में औसत जीवन प्रत्याशा लगभग <strong>70.2 वर्ष</strong> है।
            यह आंकड़ा बेहतर स्वास्थ्य सेवाओं, पोषण और स्वच्छता के कारण लगातार बढ़ रहा है।
            लेकिन आपकी व्यक्तिगत जीवन प्रत्याशा इस औसत से काफी अलग हो सकती है — और इसका
            बड़ा हिस्सा आपकी अपनी आदतों पर निर्भर करता है।
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
              मुफ्त कैलकुलेटर खोलें →
            </a>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">WHO डेटा क्या कहता है?</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            विश्व स्वास्थ्य संगठन दुनिया भर के देशों की जीवन प्रत्याशा पर आंकड़े रखता है।
            भारत की औसत जीवन प्रत्याशा 70.2 वर्ष है, जबकि जापान जैसे देशों में यह 84 वर्ष
            से अधिक है। इस अंतर का कारण स्वास्थ्य सेवाओं की गुणवत्ता, पोषण और जीवनशैली में
            भिन्नता है। महत्वपूर्ण बात यह है कि स्वस्थ आदतें अपनाकर कोई भी व्यक्ति औसत से
            अधिक जीवन जी सकता है।
          </p>

          <h2 className="text-2xl font-black text-gray-900 mb-4">जीवन प्रत्याशा के 5 प्रमुख कारक</h2>
          {FACTORS.map((f, i) => (
            <section key={i} className="mb-6">
              <h3 className="text-xl font-black text-gray-900 mb-2">{i + 1}. {f.title}</h3>
              <p className="text-gray-700 leading-relaxed">{f.body}</p>
            </section>
          ))}

          <p className="text-gray-700 leading-relaxed mb-6 mt-4">
            इन पांचों कारकों में से लगभग हर एक को आप अपने प्रयासों से सुधार सकते हैं।
            आज एक छोटा सकारात्मक बदलाव भी आपकी जीवन प्रत्याशा में वर्ष जोड़ सकता है।
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
              कुछ ही सेकंड में जानें कि आपकी जीवनशैली आपकी आयु को कैसे प्रभावित कर रही है।
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

export default HindiJeevanPratyashaPage;

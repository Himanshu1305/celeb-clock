import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO, WebApplicationSchema } from '@/components/SEO';

const RELATED = [
  { path: '/numerology', label: 'Numerology by Birthday' },
  { path: '/zodiac', label: 'Zodiac Signs' },
  { path: '/moon-sign', label: 'Moon Sign Calculator' },
  { path: '/compatibility', label: 'Compatibility Calculator' },
];

const HindiNumerology = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Numerology in Hindi — अंक ज्योतिष by Date of Birth | BornClock"
        description="अपना life path number जानें। BornClock का मुफ्त numerology calculator हिंदी में — जन्म तिथि से अपना अंक ज्योतिष जानें।"
        keywords="numerology hindi, ank jyotish, life path number hindi, numerology by date of birth hindi"
        canonicalUrl="/numerology-hindi"
        ogImage="https://bornclock.com/og/calculator.png"
      />
      <WebApplicationSchema
        name="Numerology in Hindi — अंक ज्योतिष"
        description="BornClock का मुफ्त हिंदी numerology calculator — जन्म तिथि से अपना Life Path Number जानें।"
        url="/numerology-hindi"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            अंक ज्योतिष — अपना Life Path Number जानें
          </h1>
        </section>

        <section className="max-w-3xl mx-auto mb-10 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              अंक ज्योतिष (Numerology) में माना जाता है कि आपकी जन्म तिथि के अंक आपके स्वभाव और जीवन के उद्देश्य के बारे में बताते हैं। सबसे महत्वपूर्ण है आपका Life Path Number — यह वैसे ही है जैसे astrology में sun sign।
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">अपना Life Path Number अभी जानें</h2>
            <p className="text-sm text-muted-foreground mb-4">जन्म तिथि डालें और तुरंत अपना अंक ज्योतिष number और उसका पूरा अर्थ जानें।</p>
            <Link to="/numerology" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Numerology Calculator खोलें →
            </Link>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Life Path Number क्या होता है?</h2>
            <p className="text-muted-foreground leading-relaxed">Life Path Number आपकी पूरी जन्म तिथि के अंकों को जोड़कर निकाला जाता है। यह 1 से 9 के बीच होता है (कुछ systems में 11, 22, 33 को master numbers माना जाता है)। यह number आपके core personality और जीवन की दिशा बताता है।</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">अपना Life Path Number कैसे निकालें?</h2>
            <p className="text-muted-foreground leading-relaxed">उदाहरण: जन्म तिथि 15 अगस्त 1990। 1+5 = 6, 8 = 8, 1+9+9+0 = 19 → 1+9 = 10 → 1+0 = 1। अब 6+8+1 = 15 → 1+5 = 6। तो Life Path Number = 6। BornClock यह calculation automatically करता है।</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">सभी Life Path Numbers का अर्थ (संक्षेप में)</h2>
            <ul className="text-muted-foreground leading-relaxed space-y-1 list-none">
              <li><strong className="text-foreground">1 — Leader:</strong> नेतृत्व, आत्मनिर्भरता और पहल।</li>
              <li><strong className="text-foreground">2 — Diplomat:</strong> संतुलन, सहयोग और संवेदनशीलता।</li>
              <li><strong className="text-foreground">3 — Creative:</strong> रचनात्मकता, अभिव्यक्ति और आशावाद।</li>
              <li><strong className="text-foreground">4 — Builder:</strong> अनुशासन, मेहनत और स्थिरता।</li>
              <li><strong className="text-foreground">5 — Freedom-seeker:</strong> स्वतंत्रता, बदलाव और रोमांच।</li>
              <li><strong className="text-foreground">6 — Nurturer:</strong> देखभाल, जिम्मेदारी और परिवार।</li>
              <li><strong className="text-foreground">7 — Seeker:</strong> विश्लेषण, आध्यात्म और गहराई।</li>
              <li><strong className="text-foreground">8 — Achiever:</strong> महत्वाकांक्षा, शक्ति और सफलता।</li>
              <li><strong className="text-foreground">9 — Humanitarian:</strong> करुणा, सेवा और उदारता।</li>
            </ul>
          </section>
        </article>

        <section className="max-w-4xl mx-auto mb-16 px-4">
          <h2 className="text-2xl font-bold text-center mb-6 gradient-text-primary">और भी Tools</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {RELATED.map((t) => (
              <Link key={t.path} to={t.path} className="block rounded-xl border border-border p-4 font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors">
                {t.label} →
              </Link>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default HindiNumerology;

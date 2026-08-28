import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO, WebApplicationSchema } from '@/components/SEO';

const RELATED = [
  { path: '/zodiac', label: 'Western Zodiac' },
  { path: '/vedic-zodiac', label: 'Indian Zodiac (Vedic)' },
  { path: '/moon-sign', label: 'Moon Sign Calculator' },
  { path: '/compatibility', label: 'Compatibility Calculator' },
];

const HindiZodiac = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="राशिफल by Date of Birth — Zodiac Sign in Hindi | BornClock"
        description="अपनी राशि जानें जन्म तिथि से। BornClock का मुफ्त zodiac calculator हिंदी में — Western और Vedic दोनों।"
        keywords="rashifal by date of birth, rashi by date of birth, apni rashi jane, zodiac hindi"
        canonicalUrl="/rashifal-by-date-of-birth"
        ogImage="https://bornclock.com/og/calculator.png"
      />
      <WebApplicationSchema
        name="राशिफल by Date of Birth — Zodiac Sign in Hindi"
        description="BornClock का मुफ्त हिंदी zodiac calculator — जन्म तिथि से अपनी राशि (Western और Vedic) जानें।"
        url="/rashifal-by-date-of-birth"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            अपनी राशि जानें — Zodiac by Date of Birth
          </h1>
        </section>

        <section className="max-w-3xl mx-auto mb-10 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              आपकी राशि आपकी जन्म तिथि से तय होती है। Western astrology में 12 राशियाँ हैं जो सूर्य की स्थिति पर आधारित हैं। Vedic astrology में चंद्रमा की स्थिति (moon sign या rashi) को ज्यादा महत्वपूर्ण माना जाता है।
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">अपनी राशि अभी जानें</h2>
            <p className="text-sm text-muted-foreground mb-4">जन्म तिथि डालें और अपनी Western राशि, उसके गुण और compatible signs जानें।</p>
            <Link to="/zodiac" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Zodiac Calculator खोलें →
            </Link>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Western और Vedic राशि में क्या फर्क है?</h2>
            <p className="text-muted-foreground leading-relaxed">Western astrology tropical zodiac use करती है जो seasons पर आधारित है। Vedic (Indian) astrology sidereal zodiac use करती है जो actual star positions पर आधारित है। इसलिए अक्सर आपकी Vedic राशि Western राशि से एक पीछे होती है।</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">12 राशियाँ और उनके गुण</h2>
            <p className="text-muted-foreground leading-relaxed">मेष (Aries) — साहसी, नेतृत्व; वृष (Taurus) — स्थिर, विश्वसनीय; मिथुन (Gemini) — जिज्ञासु, बुद्धिमान; कर्क (Cancer) — भावनात्मक, देखभाल करने वाले; सिंह (Leo) — आत्मविश्वासी, उदार; कन्या (Virgo) — विश्लेषणात्मक, व्यवहारिक; तुला (Libra) — संतुलित, न्यायप्रिय; वृश्चिक (Scorpio) — गहन, रहस्यमय; धनु (Sagittarius) — स्वतंत्र, आशावादी; मकर (Capricorn) — महत्वाकांक्षी, अनुशासित; कुम्भ (Aquarius) — नवाचारी, मानवतावादी; मीन (Pisces) — संवेदनशील, कल्पनाशील।</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Moon Sign क्यों ज्यादा important है?</h2>
            <p className="text-muted-foreground leading-relaxed">Indian astrology में moon sign (rashi) को sun sign से ज्यादा महत्वपूर्ण माना जाता है। Moon sign आपकी भावनाओं, आंतरिक स्वभाव और relationships को दर्शाती है। जब कोई भारतीय "मेरी राशि मेष है" कहता है, तो वे अक्सर अपनी moon sign की बात कर रहे होते हैं।</p>
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

export default HindiZodiac;

import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO, WebApplicationSchema } from '@/components/SEO';

const RELATED = [
  { path: '/biological-age', label: 'Biological Age Test' },
  { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
  { path: '/biological-age-vs-chronological-age', label: 'Biological vs Chronological Age' },
  { path: '/coach', label: 'Longevity Coach' },
];

const HindiBiologicalAge = () => {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Biological Age in Hindi — आपका शरीर कितना पुराना है? | BornClock"
        description="आपकी biological age आपकी असली उम्र से 10 साल कम या ज्यादा हो सकती है। BornClock का मुफ्त test हिंदी में।"
        keywords="biological age hindi, body age calculator hindi, jism ki umar, biological age test hindi"
        canonicalUrl="/biological-age-hindi"
        ogImage="https://bornclock.com/og/calculator.png"
      />
      <WebApplicationSchema
        name="Biological Age in Hindi — आपका शरीर कितना पुराना है?"
        description="BornClock का मुफ्त हिंदी biological age test — जानें आपका शरीर actually कितना पुराना है।"
        url="/biological-age-hindi"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            आपकी Biological Age क्या है?
          </h1>
        </section>

        <section className="max-w-3xl mx-auto mb-10 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              Biological age वह उम्र है जो आपका शरीर actually जी रहा है — आपके जन्म प्रमाण पत्र की उम्र नहीं। दो लोग जो एक ही दिन पैदा हुए हों, उनकी biological age 10 साल तक अलग हो सकती है — उनकी lifestyle के आधार पर।
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mb-12 px-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">अपनी Biological Age अभी जानें</h2>
            <p className="text-sm text-muted-foreground mb-4">12 WHO-validated biomarkers पर आधारित मुफ्त test — कोई blood test नहीं, कोई sign-up नहीं।</p>
            <Link to="/biological-age" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Biological Age Test खोलें →
            </Link>
          </div>
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Biological Age और Chronological Age में क्या फर्क है?</h2>
            <p className="text-muted-foreground leading-relaxed">Chronological age वह है जो आपके birth certificate पर लिखी है। Biological age वह है जो आपके cells, organs और body systems की actual condition बताती है। एक 50 साल का व्यक्ति जो अच्छी lifestyle जीता है, उसकी biological age 40 हो सकती है।</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Biological Age क्या तय करती है?</h2>
            <p className="text-muted-foreground leading-relaxed">नींद की गुणवत्ता, खान-पान, exercise, stress level, smoking, alcohol — ये सब मिलकर आपकी biological age तय करते हैं। Harvard research के अनुसार genetics केवल 20-30% role play करती है। बाकी 70-80% आपके हाथ में है।</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">क्या Biological Age कम हो सकती है?</h2>
            <p className="text-muted-foreground leading-relaxed">हाँ — और इसके वैज्ञानिक प्रमाण हैं। 2023 में Aging Cell journal में published एक study में पाया गया कि 8 हफ्तों के lifestyle intervention से biological age औसतन 2.5 साल कम हुई। सबसे असरदार बदलाव: smoking छोड़ना, नींद सुधारना, regular exercise।</p>
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

export default HindiBiologicalAge;

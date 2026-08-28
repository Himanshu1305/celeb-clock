import { Link } from 'react-router-dom';
import { AgeCalculator } from '@/components/AgeCalculator';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useBirthDate } from '@/context/BirthDateContext';
import { SEO, WebApplicationSchema } from '@/components/SEO';

const RELATED = [
  { path: '/age-calculator', label: 'Age Calculator' },
  { path: '/age-in-days', label: 'Age in Days' },
  { path: '/biological-age', label: 'Biological Age Test' },
  { path: '/life-expectancy', label: 'Life Expectancy Calculator' },
];

const HindiAgeCalculator = () => {
  const { birthDate, setBirthDate } = useBirthDate();

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="मेरी उम्र कितनी है — Age Calculator in Hindi | BornClock"
        description="अपनी सटीक उम्र जानें — साल, महीने, दिन, घंटे और सेकंड में। BornClock का मुफ्त age calculator हिंदी में।"
        keywords="meri umar kitni hai, age calculator hindi, meri age kya hai, umar calculator"
        canonicalUrl="/meri-umar-kitni-hai"
        ogImage="https://bornclock.com/og/calculator.png"
      />
      <WebApplicationSchema
        name="मेरी उम्र कितनी है — Age Calculator in Hindi"
        description="अपनी सटीक उम्र साल, महीने, दिन, घंटे और सेकंड में जानें — BornClock का मुफ्त हिंदी age calculator।"
        url="/meri-umar-kitni-hai"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            मेरी उम्र कितनी है?
          </h1>
        </section>

        <section className="max-w-3xl mx-auto mb-10 px-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              आपकी उम्र सिर्फ साल में नहीं मापी जाती। BornClock आपको बताता है कि आप कितने दिन, कितने घंटे और कितने सेकंड जी चुके हैं। अपनी जन्म तिथि डालें और तुरंत जानें।
            </p>
          </div>
        </section>

        <section id="calculator" className="max-w-4xl mx-auto mb-12">
          <AgeCalculator onBirthDateChange={setBirthDate} initialDate={birthDate} />
        </section>

        <article className="max-w-3xl mx-auto mb-16 px-4 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">उम्र कैसे calculate होती है?</h2>
            <p className="text-muted-foreground leading-relaxed">उम्र calculate करने के लिए आपकी जन्म तिथि से आज की तारीख घटाई जाती है। इसमें leap years को भी गिना जाता है — हर 4 साल में एक extra दिन आता है। BornClock यह सब automatically करता है और हर सेकंड आपकी उम्र update करता है।</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">दिनों में उम्र क्यों जानें?</h2>
            <p className="text-muted-foreground leading-relaxed">30 साल का इंसान लगभग 10,957 दिन जी चुका होता है। यह संख्या देखकर अहसास होता है कि समय कितना कीमती है। कई लोगों को पता नहीं होता कि वे अपने 10,000वें दिन को बिना celebrate किए गुजार देते हैं।</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">BornClock क्या-क्या बताता है?</h2>
            <p className="text-muted-foreground leading-relaxed">उम्र के अलावा BornClock आपको biological age, life expectancy, zodiac sign, numerology, और celebrity birthday twin भी बताता है — सिर्फ आपकी जन्म तिथि से। सब कुछ मुफ्त, कोई sign-up नहीं।</p>
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

export default HindiAgeCalculator;

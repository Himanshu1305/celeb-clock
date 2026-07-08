import { AgeCalculator } from '@/components/AgeCalculator';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ShareableCard } from '@/components/ShareableCard';
import { CelebrityMatch } from '@/components/CelebrityMatch';
import { ZodiacAndFacts } from '@/components/ZodiacAndFacts';
import { LifeExpectancyCTA } from '@/components/LifeExpectancyCTA';
import { GenerationLabel } from '@/components/GenerationLabel';
import { ReviewForm } from '@/components/ReviewForm';
import { useBirthDate } from '@/context/BirthDateContext';
import { SEO, WebApplicationSchema } from '@/components/SEO';
import { EEATBadges } from '@/components/EEATBadges';
import { PageFAQ } from '@/components/PageFAQ';
import { RelatedTools } from '@/components/RelatedTools';
import { AuthorBio } from '@/components/AuthorBio';

const AgeCalculatorPage = () => {
  const { birthDate, setBirthDate } = useBirthDate();

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Best Age Calculator Online — Exact Age in Seconds (Free)"
        description="The best free age calculator online. Get your exact age in years, months, days, hours, minutes & seconds — updated live. Accurate, private, no sign-up."
        keywords="best age calculator, age calculator online, exact age, age in days, age in seconds, free age calculator, birthday calculator"
        canonicalUrl="/age-calculator"
      />
      <WebApplicationSchema
        name="Age Calculator"
        description="Free online age calculator — find your exact age in years, months, days, hours, minutes and seconds. Live countdown, no sign-up required."
        url="/age-calculator"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Best Age Calculator — Your Exact Age, Live to the Second
          </h1>
          <p className="text-lg text-muted-foreground">
            Enter your date of birth and instantly see your precise age in years, months, days, hours, minutes and seconds — calculated live in your browser and never stored.
          </p>
          <EEATBadges sources={['ISO 8601', 'JavaScript Date Spec']} />
        </section>

        <section id="calculator" className="max-w-4xl mx-auto mb-16">
          <AgeCalculator onBirthDateChange={setBirthDate} initialDate={birthDate} />
        </section>

        {birthDate && (
          <section className="max-w-md mx-auto mb-16 animate-fade-in-up">
            <GenerationLabel birthYear={birthDate.getFullYear()} />
          </section>
        )}

        {birthDate && (
          <section className="max-w-6xl mx-auto mb-16 animate-fade-in-up">
            <CelebrityMatch birthDate={birthDate} />
          </section>
        )}

        {birthDate && (
          <section className="max-w-4xl mx-auto mb-16 animate-fade-in-up">
            <ZodiacAndFacts birthDate={birthDate} />
          </section>
        )}

        {birthDate && (
          <section className="max-w-4xl mx-auto mb-16 animate-fade-in-up">
            <ShareableCard birthDate={birthDate} />
          </section>
        )}

        {birthDate && <LifeExpectancyCTA />}

        <section className="max-w-xl mx-auto mb-16">
          <ReviewForm />
        </section>

        <PageFAQ slug="age-calculator" title="Age Calculator FAQs" />
        <RelatedTools currentSlug="age" />
        <AuthorBio />
      </div>
      <Footer />
    </div>
  );
};

export default AgeCalculatorPage;

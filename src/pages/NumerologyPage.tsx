import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { NumerologyLifePath } from '@/components/NumerologyLifePath';
import { useBirthDate } from '@/context/BirthDateContext';
import { SEO } from '@/components/SEO';
import { AgeCalculator } from '@/components/AgeCalculator';
import { EEATBadges } from '@/components/EEATBadges';
import { PageFAQ } from '@/components/PageFAQ';
import { RelatedTools } from '@/components/RelatedTools';
import { AuthorBio } from '@/components/AuthorBio';

const NumerologyPage = () => {
  const { birthDate, setBirthDate } = useBirthDate();

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Best Free Numerology Calculator — Life Path Number"
        description="The best free numerology calculator. Discover your Life Path Number from your date of birth, with traits, strengths, and life-purpose meaning — instant and accurate."
        keywords="best numerology calculator, free numerology calculator, life path number, numerology, birth number"
        canonicalUrl="/numerology"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Best Free Numerology Calculator — Find Your Life Path Number
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover your Life Path Number using the classical Pythagorean method. Enter your date of birth to reveal your core personality, strengths and life purpose.
          </p>
          <EEATBadges sources={['Pythagorean numerology']} />
        </section>

        {!birthDate && (
          <section className="max-w-4xl mx-auto mb-16">
            <AgeCalculator onBirthDateChange={setBirthDate} initialDate={birthDate} />
          </section>
        )}

        {birthDate && (
          <section className="max-w-4xl mx-auto mb-16 animate-fade-in-up">
            <NumerologyLifePath birthDate={birthDate} />
          </section>
        )}

        <PageFAQ slug="numerology" title="Numerology Calculator FAQs" />
        <RelatedTools currentSlug="numerology" />
        <AuthorBio />
      </div>
      <Footer />
    </div>
  );
};

export default NumerologyPage;

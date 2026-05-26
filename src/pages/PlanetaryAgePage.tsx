import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PlanetaryAge } from '@/components/PlanetaryAge';
import { useBirthDate } from '@/context/BirthDateContext';
import { SEO } from '@/components/SEO';
import { AgeCalculator } from '@/components/AgeCalculator';
import { EEATBadges } from '@/components/EEATBadges';
import { PageFAQ } from '@/components/PageFAQ';
import { RelatedTools } from '@/components/RelatedTools';
import { AuthorBio } from '@/components/AuthorBio';

const PlanetaryAgePage = () => {
  const { birthDate, setBirthDate } = useBirthDate();

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Best Planetary Age Calculator — Your Age on Mars, Jupiter & More"
        description="The best free planetary age calculator. Find out how old you'd be on Mercury, Venus, Mars, Jupiter, Saturn, Uranus and Neptune — based on NASA orbital data."
        keywords="best planetary age calculator, age on mars, age on jupiter, age on other planets, solar system age"
        canonicalUrl="/planetary-age"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Best Planetary Age Calculator — Your Age on Mars, Jupiter & More
          </h1>
          <p className="text-lg text-muted-foreground">
            Ever wondered how old you'd be on Mars or Jupiter? Enter your birthday and we'll calculate your age on every planet using NASA orbital data.
          </p>
          <EEATBadges sources={['NASA']} />
        </section>

        {!birthDate && (
          <section className="max-w-4xl mx-auto mb-16">
            <AgeCalculator onBirthDateChange={setBirthDate} initialDate={birthDate} />
          </section>
        )}

        {birthDate && (
          <section className="max-w-4xl mx-auto mb-16 animate-fade-in-up">
            <PlanetaryAge birthDate={birthDate} />
          </section>
        )}

        <PageFAQ slug="planetary-age" title="Planetary Age Calculator FAQs" />
        <RelatedTools currentSlug="planet" />
        <AuthorBio />
      </div>
      <Footer />
    </div>
  );
};

export default PlanetaryAgePage;

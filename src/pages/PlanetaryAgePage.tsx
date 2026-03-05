import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PlanetaryAge } from '@/components/PlanetaryAge';
import { useBirthDate } from '@/context/BirthDateContext';
import { SEO } from '@/components/SEO';
import { AgeCalculator } from '@/components/AgeCalculator';

const PlanetaryAgePage = () => {
  const { birthDate, setBirthDate } = useBirthDate();

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Age on Other Planets – How Old Are You on Mars?"
        description="Discover your age on Mercury, Venus, Mars, Jupiter, Saturn, Uranus, and Neptune. A fun way to see how time passes differently across our solar system."
        keywords="age on other planets, planetary age, age on mars, age on jupiter, solar system age"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-12 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Your Age on Other Planets
          </h1>
          <p className="text-lg text-muted-foreground">
            Ever wondered how old you'd be on Mars or Jupiter? Enter your birthday and find out!
          </p>
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
      </div>
      <Footer />
    </div>
  );
};

export default PlanetaryAgePage;

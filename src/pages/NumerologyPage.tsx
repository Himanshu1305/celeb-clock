import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { NumerologyLifePath } from '@/components/NumerologyLifePath';
import { useBirthDate } from '@/context/BirthDateContext';
import { SEO } from '@/components/SEO';
import { AgeCalculator } from '@/components/AgeCalculator';

const NumerologyPage = () => {
  const { birthDate, setBirthDate } = useBirthDate();

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Life Path Number Calculator – Numerology"
        description="Discover your Life Path Number based on your date of birth. Learn about your personality traits, strengths, and destiny through the ancient art of numerology."
        keywords="life path number, numerology, numerology calculator, life path, birth number"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-12 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Numerology & Life Path Number
          </h1>
          <p className="text-lg text-muted-foreground">
            Your Life Path Number reveals your core personality, strengths, and life purpose. Enter your birthday to discover yours.
          </p>
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
      </div>
      <Footer />
    </div>
  );
};

export default NumerologyPage;

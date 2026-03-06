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
import { SEO } from '@/components/SEO';

const AgeCalculatorPage = () => {
  const { birthDate, setBirthDate } = useBirthDate();

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Age Calculator – Know Your Exact Age Instantly"
        description="Calculate your exact age in years, months, days, hours, minutes, and seconds. Free, fast, and accurate age calculator."
        keywords="age calculator, exact age, calculate age, age in days, birthday calculator"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-12 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Calculate Your Exact Age
          </h1>
          <p className="text-lg text-muted-foreground">
            Enter your date of birth and discover your precise age down to the second — updated live.
          </p>
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
      </div>
      <Footer />
    </div>
  );
};

export default AgeCalculatorPage;

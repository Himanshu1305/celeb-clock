import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { TodaysBirthdays } from '@/components/TodaysBirthdays';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TodaysBirthdaysPage = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title={`Famous Birthdays Today – ${formattedDate}`}
        description={`Discover famous people born on ${formattedDate}. See which celebrities, scientists, athletes, and historical figures share today's birthday.`}
        keywords="today's birthdays, famous birthdays today, celebrity birthdays, born today"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-12 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Famous Birthdays Today
          </h1>
          <p className="text-lg text-muted-foreground">
            Notable people born on {formattedDate} — from celebrities and scientists to world leaders.
          </p>
        </section>

        <section className="max-w-4xl mx-auto mb-16">
          <TodaysBirthdays />
        </section>

        <section className="text-center mb-16">
          <p className="text-muted-foreground mb-4">Want to find celebrities who share YOUR birthday?</p>
          <Button asChild size="lg" className="gap-2">
            <Link to="/celebrity-birthday">
              Search Celebrity Birthdays <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default TodaysBirthdaysPage;

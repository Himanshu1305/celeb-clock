import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { TodaysBirthdays } from '@/components/TodaysBirthdays';
import { SEO } from '@/components/SEO';
import PageTagline from '@/components/PageTagline';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EEATBadges } from '@/components/EEATBadges';
import { PageFAQ } from '@/components/PageFAQ';
import { RelatedTools } from '@/components/RelatedTools';
import { AuthorBio } from '@/components/AuthorBio';

const MONTH_SLUGS = ['', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const TodaysBirthdaysPage = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const todaySlug = `${MONTH_SLUGS[today.getMonth() + 1]}-${today.getDate()}`;

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title={`Famous Birthdays Today — ${formattedDate} | BornClock`}
        description={`Best list of famous people born on ${formattedDate}. See which celebrities, scientists, athletes, and historical figures share today's birthday — sourced live from Wikipedia.`}
        keywords="famous birthdays today, celebrity birthdays today, born today, who was born today"
        canonicalUrl="/todays-birthdays"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <div className="text-sm text-muted-foreground mb-2">
            Viewing all celebrities born on {formattedDate} ·{' '}
            <Link to={`/birthday/${todaySlug}`} className="text-primary hover:underline">
              See dedicated page →
            </Link>
            {' · '}
            <Link to={`/born-on/${todaySlug}`} className="text-primary hover:underline">
              Born-on deep dive →
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Famous Birthdays Today — {formattedDate}
          </h1>
          <PageTagline />
          <p className="text-lg text-muted-foreground">
            The best daily list of notable people born on {formattedDate} — celebrities, scientists, athletes and world leaders, refreshed live from Wikipedia.
          </p>
          <EEATBadges sources={['Wikipedia']} />
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

        <PageFAQ slug="todays-birthdays" title="Today's Birthdays FAQs" />
        <RelatedTools currentSlug="today" />
        <AuthorBio />
      </div>
      <Footer />
    </div>
  );
};

export default TodaysBirthdaysPage;

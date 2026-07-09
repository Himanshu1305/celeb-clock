import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { Calendar } from 'lucide-react';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_DAYS = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export default function BornOnIndex() {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Celebrities Born On — Browse by Birthday | BornClock"
        description="Browse all famous people by birthday. Select any date from January 1 to December 31 to see celebrities born on that day, their zodiac sign, and birthday insights."
        canonicalUrl="/born-on"
        ogType="website"
        ogImage="https://bornclock.com/og/born-on.png"
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>›</span>
          <span className="text-foreground">Born On</span>
        </nav>

        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-7 h-7 text-primary" />
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Celebrities Born On
          </h1>
        </div>
        <p className="text-muted-foreground mb-10">
          Browse famous birthdays by date — from January 1 to December 31, including February 29.
        </p>

        <div className="space-y-8">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
            <div key={month}>
              <h2 className="font-semibold text-xl text-foreground mb-3 border-b border-border pb-2">
                {MONTH_NAMES[month]}
              </h2>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: MONTH_DAYS[month] }, (_, d) => d + 1).map(day => (
                  <Link
                    key={day}
                    to={`/born-on/${MONTH_NAMES[month].toLowerCase()}-${day}`}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border text-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  >
                    {day}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
          <h2 className="font-bold text-xl text-foreground mb-2">Know your birthday?</h2>
          <p className="text-muted-foreground mb-4">
            Get your full birthday report — celebrity matches, zodiac deep-dive, numerology, and more.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
          >
            Generate my birthday report
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

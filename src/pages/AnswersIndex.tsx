import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, ArrowRight } from 'lucide-react';

// Index of every /answers/* page. Question labels mirror the ANSWERS map in
// scripts/prerender-titles.mjs. Grouped by theme for scannability.
const GROUPS: Array<{ theme: string; items: Array<{ slug: string; q: string }> }> = [
  {
    theme: 'Age & birthday',
    items: [
      { slug: 'how-to-calculate-age', q: 'How to calculate your exact age' },
      { slug: 'how-many-days-until-my-birthday', q: 'How many days until my birthday?' },
      { slug: 'who-shares-my-birthday', q: 'Which famous people share my birthday?' },
      { slug: 'how-old-am-i-on-mars', q: 'How old am I on Mars and other planets?' },
      { slug: 'what-generation-am-i', q: 'What generation am I?' },
    ],
  },
  {
    theme: 'Astrology & numerology',
    items: [
      { slug: 'what-is-my-zodiac-sign', q: 'What is my zodiac sign?' },
      { slug: 'what-is-my-life-path-number', q: 'What is my life path number?' },
    ],
  },
  {
    theme: 'Longevity & health',
    items: [
      { slug: 'how-long-will-i-live', q: 'How long will I live?' },
      { slug: 'what-is-life-expectancy', q: 'What is life expectancy?' },
      { slug: 'how-to-live-longer', q: 'How to live longer' },
      { slug: 'what-is-my-biological-age', q: 'What is biological age?' },
      { slug: 'what-is-bmi', q: 'What is BMI?' },
      { slug: 'how-does-stress-affect-life-expectancy', q: 'How does stress affect life expectancy?' },
    ],
  },
];

export default function AnswersIndex() {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Answers — Science-Backed Answers to Birthday, Age & Longevity Questions | BornClock"
        description="Straight, sourced answers to the questions people ask about age, birthdays, zodiac, life path, biological age and life expectancy — each with a tool to try yourself."
        canonicalUrl="/answers"
        ogType="website"
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>›</span>
          <span className="text-foreground">Answers</span>
        </nav>

        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="w-7 h-7 text-primary" />
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Answers</h1>
        </div>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Clear, science-backed answers to the questions people ask us most — each one links straight to
          the free tool that works it out for you.
        </p>

        <div className="space-y-8">
          {GROUPS.map(group => (
            <section key={group.theme}>
              <h2 className="text-lg font-semibold text-foreground mb-3">{group.theme}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.items.map(item => (
                  <Link key={item.slug} to={`/answers/${item.slug}`}>
                    <Card className="glass-card h-full hover:border-primary/50 transition-all group">
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-foreground">{item.q}</span>
                        <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

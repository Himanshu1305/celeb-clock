import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { CollectionLayout } from '@/components/central';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

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
    <CollectionLayout
      theme="neutral"
      testId="answers-index-page"
      seo={(
        <SEO
          title="Answers — Science-Backed Answers to Birthday, Age & Longevity Questions | BornClock"
          description="Straight, sourced answers to the questions people ask about age, birthdays, zodiac, life path, biological age and life expectancy — each with a tool to try yourself."
          canonicalUrl="/answers"
          ogType="website"
        />
      )}
      breadcrumb={{ current: 'Answers' }}
      h1="Answers"
      lead={(
        <>
          Clear, science-backed answers to the questions people ask us most — each one links straight to
          the free tool that works it out for you.
        </>
      )}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
    </CollectionLayout>
  );
}

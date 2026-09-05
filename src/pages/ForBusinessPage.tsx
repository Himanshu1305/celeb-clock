import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PLANS = [
  { name: 'Starter', price: '₹4,999/mo', calls: '10,000 API calls / month', best: false,
    features: ['Birthday, zodiac, rashi & life path endpoints', 'Celebrity twin lookup', 'Email support'] },
  { name: 'Growth', price: '₹14,999/mo', calls: '100,000 API calls / month', best: true,
    features: ['Everything in Starter', 'Compatibility & numerology endpoints', 'Bulk export', 'Priority support'] },
  { name: 'Enterprise', price: 'Custom', calls: 'Unlimited + SLA', best: false,
    features: ['Everything in Growth', 'White-label & on-prem', 'Dedicated success manager', '99.9% uptime SLA'] },
];

export default function ForBusinessPage() {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="BornClock for Business — Birthday & Astrology API | BornClock"
        description="Add birthday intelligence to your product — zodiac, Vedic rashi, numerology, life path and compatibility via a simple REST API. Plans from ₹4,999/mo."
        canonicalUrl="/for-business"
        ogType="website"
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        <div className="text-center mb-12">
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-3">
            Birthday intelligence, as an API
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Power your app, CRM or marketing with zodiac, Vedic rashi, numerology, life path and
            compatibility data — the same engine behind BornClock, available over a simple REST API.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg">
              <a href="mailto:usdvisionai@gmail.com?subject=BornClock%20API%20access" data-testid="b2b-contact-cta">
                Talk to us about API access →
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/birthday-report">See a sample report</Link>
            </Button>
          </div>
        </div>

        {/* Pricing */}
        <section className="mb-14" aria-labelledby="api-pricing">
          <h2 id="api-pricing" className="text-2xl font-bold text-center text-foreground mb-6">API pricing plans</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {PLANS.map(plan => (
              <Card key={plan.name} className={plan.best ? 'border-primary shadow-lg' : ''}>
                <CardContent className="p-6">
                  {plan.best && (
                    <span className="inline-block text-xs font-semibold bg-primary text-primary-foreground rounded-full px-3 py-1 mb-3">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="text-2xl font-black text-primary my-1">{plan.price}</p>
                  <p className="text-sm text-muted-foreground mb-4">{plan.calls}</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {plan.features.map(f => (
                      <li key={f} className="flex gap-2"><span className="text-primary">✓</span>{f}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Use cases */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-center text-foreground mb-6">Who uses the API</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['🎂 Consumer apps', 'Birthday reminders, horoscopes and personalised greetings.'],
              ['💬 Dating & matchmaking', 'Zodiac & Vedic compatibility scores at signup.'],
              ['📣 Marketing & CRM', 'Segment and personalise campaigns by zodiac and life path.'],
              ['🔮 Astrology platforms', 'Accurate rashi, nakshatra and numerology as a data layer.'],
            ].map(([title, body]) => (
              <Card key={title}><CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </CardContent></Card>
            ))}
          </div>
        </section>

        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
          <h2 className="font-bold text-xl text-foreground mb-2">Ready to build?</h2>
          <p className="text-muted-foreground mb-4">Tell us your use case and we'll send API docs and a trial key.</p>
          <Button asChild size="lg">
            <a href="mailto:usdvisionai@gmail.com?subject=BornClock%20API%20access">Get API access →</a>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

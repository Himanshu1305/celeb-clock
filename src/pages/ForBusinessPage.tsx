import { Link } from '@/components/seo/CanonicalLink';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// S16 (Oct 2026): the business API is NOT live yet. No plans, prices or uptime/SLA
// promises are shown — the page is a waitlist. Contact is the site's official address.
const CONTACT_EMAIL = 'hello@bornclock.com';
const WAITLIST_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('BornClock API waitlist')}`;

const PLANNED = [
  'Birthday, Western zodiac, Vedic rashi and life path data',
  'Compatibility and numerology data',
  'Celebrity birthday lookups',
];

export default function ForBusinessPage() {
  return (
    <ToolLayout
      theme="neutral"
      testId="for-business-page"
      seo={(
        <SEO
          title="Birthday & Astrology API — Coming Soon | BornClock"
          description="A BornClock API for birthday, zodiac, Vedic rashi, numerology and compatibility data is coming soon. Join the waitlist to hear when it opens."
          canonicalUrl="/for-business"
          ogType="website"
        />
      )}
      breadcrumb={{ current: 'For Business' }}
      h1="Birthday intelligence, as an API — coming soon"
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <span data-testid="b2b-coming-soon" className="inline-block text-xs font-semibold bg-primary text-primary-foreground rounded-full px-3 py-1 mb-4">
            Coming soon — join the waitlist
          </span>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're working on an API that would let apps, CRMs and marketing tools use the same engine behind
            BornClock. It is not available yet, and there are no plans or prices to buy today. Join the waitlist
            and we'll email you when it opens.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg">
              <a href={WAITLIST_MAILTO} data-testid="b2b-contact-cta">
                Join the waitlist →
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/birthday-report/">See a sample report</Link>
            </Button>
          </div>
        </div>

        {/* What we're planning — no prices, no service-level promises */}
        <section className="mb-14" aria-labelledby="api-planned">
          <h2 id="api-planned" className="text-2xl font-bold text-center text-foreground mb-2">What we're planning</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            The scope may change before launch. Pricing will be announced when the API opens.
          </p>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {PLANNED.map(f => (
                  <li key={f} className="flex gap-2"><span className="text-primary">•</span>{f}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Who it could help */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-center text-foreground mb-6">Who it's for</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['🎂 Consumer apps', 'Birthday reminders, horoscopes and personalised greetings.'],
              ['💬 Dating & matchmaking', 'Zodiac & Vedic compatibility at signup.'],
              ['📣 Marketing & CRM', 'Segment and personalise campaigns by zodiac and life path.'],
              ['🔮 Astrology platforms', 'Rashi, nakshatra and numerology as a data layer.'],
            ].map(([title, body]) => (
              <Card key={title}><CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </CardContent></Card>
            ))}
          </div>
        </section>

        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
          <h2 className="font-bold text-xl text-foreground mb-2">Interested?</h2>
          <p className="text-muted-foreground mb-4">
            Email <a href={WAITLIST_MAILTO} className="underline">{CONTACT_EMAIL}</a> with your use case and we'll let you know when the API opens.
          </p>
          <Button asChild size="lg">
            <a href={WAITLIST_MAILTO}>Join the waitlist →</a>
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}

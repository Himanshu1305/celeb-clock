/**
 * B23 — /todays-birthdays/india: "Aaj kiska birthday hai?" — the Indian celebrities born on today's
 * India date (~14,800 searches a month in India; the leading results are weak sites). The list is
 * injected by the Worker each day (daily kind 'birthdays-today-india', data from
 * src/data/celebrities.json), and every name links to its BornClock profile.
 */
import { CollectionLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { Link } from '@/components/seo/CanonicalLink';
import { DailyBody, DailyDate, DailyH1, DailyJsonLd } from '@/lib/daily/DailyParts';
import { useDailyEntry } from '@/lib/daily/useDailyEntry';
import { BIRTHDAYS_STATIC } from '@/lib/daily/kinds/birthdaysTemplate';

export default function TodaysBirthdaysIndiaPage() {
  const { entry } = useDailyEntry('birthdays-today-india', 'index');
  return (
    <CollectionLayout
      theme="birthday"
      testId="todays-birthdays-india-page"
      seo={<SEO title={entry?.title ?? BIRTHDAYS_STATIC.india.title} description={entry?.description ?? BIRTHDAYS_STATIC.india.description} canonicalUrl="/todays-birthdays/india" />}
      breadcrumb={{ trail: [{ label: "Today's Birthdays", to: '/todays-birthdays/' }], current: 'India' }}
      footer={{
        tagline: 'Indian celebrity birthdays, every day.',
        nav: [
          { label: "Today's Birthdays", to: '/todays-birthdays/' },
          { label: 'Indians by birth date', to: '/born-on/india/' },
          { label: 'Celebrities', to: '/celebrity/' },
          { label: 'Privacy', to: '/privacy/' },
        ],
        note: '© 2026 BornClock · Birthdays.',
      }}
      eyebrow="Aaj ka birthday · India"
      h1={<DailyH1 entry={entry} fallback={BIRTHDAYS_STATIC.india.h1} />}
      lead={<DailyDate entry={entry} />}
    >
      <section className="section">
        <div className="container mx-auto px-4 max-w-4xl">
          <DailyBody entry={entry} testId="todays-birthdays-india-body" />
          <DailyJsonLd entry={entry} path="/todays-birthdays/india" />
          <p className="text-sm text-muted-foreground mt-4">
            Looking for another date? <Link to="/born-on/india/" className="text-primary underline">Browse Indian celebrities by birth date</Link> ·{' '}
            <Link to="/celebrity-birthday/" className="text-primary underline">find who shares your birthday</Link>.
          </p>
        </div>
      </section>
    </CollectionLayout>
  );
}

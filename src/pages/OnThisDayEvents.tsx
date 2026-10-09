/**
 * "What happened on your birthday" — P4-BIRTHDAY-EVENTS + NB-DEATHS.
 * Evergreen page. /on-this-day shows today's date (computed in the browser);
 * /on-this-day/:month/:day shows a specific date. Historical events, births and
 * deaths are fetched at request time from Wikipedia's "On this day" feed with
 * CC BY-SA attribution (see WikimediaOnThisDay / wikimediaOnThisDay.ts).
 */
import { useParams, Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { WikimediaOnThisDay } from '@/components/WikimediaOnThisDay';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_DAYS = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function parseParams(
  monthParam: string | undefined,
  dayParam: string | undefined,
): { month: number; day: number } | null {
  if (!monthParam || !dayParam) return null;
  const monthIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthParam.toLowerCase());
  if (monthIdx < 1) return null;
  const day = parseInt(dayParam, 10);
  if (isNaN(day) || day < 1 || day > MONTH_DAYS[monthIdx]) return null;
  return { month: monthIdx, day };
}

const footer = {
  tagline: 'What happened on any date in history — events, births and deaths from Wikipedia.',
  nav: [
    { label: 'Famous birthdays', to: '/born-on' },
    { label: 'Birthday report', to: '/birthday-report' },
    { label: 'Celebrities', to: '/celebrity' },
    { label: 'Privacy', to: '/privacy' },
  ],
  note: '© 2026 BornClock · Historical highlights, licensed from Wikipedia (CC BY-SA 4.0).',
};

export default function OnThisDayEvents() {
  const { month: monthParam, day: dayParam } = useParams<{ month: string; day: string }>();
  const parsed = parseParams(monthParam, dayParam);

  // /on-this-day with no params → today's date, computed in the browser (never
  // baked at build time), so the hub always shows the real current day.
  const now = new Date();
  const month = parsed ? parsed.month : now.getMonth() + 1;
  const day = parsed ? parsed.day : now.getDate();
  const monthName = MONTH_NAMES[month];
  const dateLabel = `${monthName} ${day}`;
  const isDated = !!parsed;

  const monthSlug = monthName.toLowerCase();

  return (
    <ToolLayout
      theme="birthday"
      testId="on-this-day-page"
      seo={(
        <SEO
          title={isDated
            ? `What Happened on ${dateLabel} — Events, Births & Deaths in History | BornClock`
            : `On This Day in History — Events, Births & Deaths | BornClock`}
          description={isDated
            ? `Notable historical events, famous births and deaths on ${dateLabel}, from Wikipedia. What happened on your birthday — free, with sources.`
            : `What happened on this day in history — notable events, famous births and deaths, from Wikipedia. Look up any birthday.`}
          keywords={`what happened on ${monthSlug} ${day}, on this day ${dateLabel}, famous deaths ${dateLabel}, historical events ${dateLabel}`}
          canonicalUrl={isDated ? `/on-this-day/${monthSlug}/${day}` : '/on-this-day'}
          ogImage="https://bornclock.com/og/birthday.png"
        />
      )}
      breadcrumb={{
        trail: [{ label: 'Famous birthdays', to: '/born-on' }],
        current: isDated ? `On this day: ${dateLabel}` : 'On this day',
      }}
      footer={footer}
      eyebrow="On this day"
      h1={isDated ? `What happened on ${dateLabel}` : 'On this day in history'}
      lead={isDated
        ? `Notable events, famous births and the people remembered on ${dateLabel} — drawn from Wikipedia.`
        : `Today is ${dateLabel}. Here's what happened on this day in history — or look up your own birthday.`}
    >
      <section className="section container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <WikimediaOnThisDay month={month} day={day} />

          <div className="rounded-xl bg-muted/40 p-5 text-sm text-muted-foreground">
            Want the full birthday picture?{' '}
            <Link to={`/born-on/${monthSlug}/${day}`} className="underline text-foreground">
              See the famous people born on {dateLabel} →
            </Link>
            {' '}or{' '}
            <Link to="/birthday-report" className="underline text-foreground">build your free birthday report →</Link>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}

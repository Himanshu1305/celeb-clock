/**
 * /zodiac/:sign/today — daily WESTERN (tropical) horoscope for a Sun sign (Batch 7, W2).
 * Extends the existing /zodiac/:sign profile page (no duplicate intent: that page is the
 * evergreen sign profile, this one is today's reading). Served through the shared
 * daily-page mechanism (src/lib/daily): the Worker injects today's precomputed text.
 * Batch 10: <ZodiacToday when="tomorrow" /> serves /zodiac/:sign/tomorrow — the next
 * India date's reading (daily kind 'horoscope-tomorrow'), own dated title + canonical.
 */
import { useParams } from 'react-router-dom';
import { Link } from '@/components/seo/CanonicalLink';
import { CollectionLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { getZodiacBySlug, ZODIAC_DATA } from '@/data/zodiacData';
import { useDailyEntry } from '@/lib/daily/useDailyEntry';
import { DailyBody, DailyDate, DailyH1, DailyJsonLd } from '@/lib/daily/DailyParts';
import { SUN_SIGN_SLUGS } from '@/lib/daily/registry';
import { DailyTermStrip } from '@/components/daily/DailyTermStrip';

export default function ZodiacToday({ when = 'today' }: { when?: 'today' | 'tomorrow' }) {
  const { sign } = useParams<{ sign: string }>();
  const valid = !!sign && (SUN_SIGN_SLUGS as readonly string[]).includes(sign);
  const data = valid ? getZodiacBySlug(sign!) : undefined;
  const tomorrow = when === 'tomorrow';
  const Day = tomorrow ? 'Tomorrow' : 'Today';
  const day = tomorrow ? 'tomorrow' : 'today';
  const { entry } = useDailyEntry(tomorrow ? 'horoscope-tomorrow' : 'horoscope', valid ? sign : null);

  if (!data) {
    return (
      <CollectionLayout
        theme="mystic"
        testId="zodiac-today-not-found"
        seo={<SEO title="Horoscope — Sign Not Found | BornClock" description="That zodiac sign doesn't exist. Pick one of the 12 signs for today's horoscope." canonicalUrl="/zodiac" />}
        breadcrumb={{ trail: [{ label: 'Zodiac Signs', to: '/zodiac/' }], current: 'Not found' }}
        eyebrow="Western horoscope"
        h1="Choose your sign"
      >
        <section className="section container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex flex-wrap gap-2">
            {ZODIAC_DATA.map(z => <Link key={z.slug} to={`/zodiac/${z.slug}/${when}`} className="px-3 py-1.5 rounded-lg border border-border text-foreground">{z.name}</Link>)}
          </div>
        </section>
      </CollectionLayout>
    );
  }

  const path = `/zodiac/${data.slug}/${when}`;
  const idx = (SUN_SIGN_SLUGS as readonly string[]).indexOf(data.slug);
  const RASHI_OF = ['mesh', 'vrishabh', 'mithun', 'kark', 'simha', 'kanya', 'tula', 'vrishchik', 'dhanu', 'makar', 'kumbh', 'meen'];

  return (
    <CollectionLayout
      theme="mystic"
      testId="zodiac-today-page"
      seo={<SEO
        title={entry?.title ?? `${data.name} Horoscope ${Day} — Western Astrology | BornClock`}
        description={entry?.description ?? `${Day}'s ${data.name} horoscope from the real tropical positions of the Moon, Sun, Mercury, Venus and Mars.`}
        canonicalUrl={path}
        ogImage="https://bornclock.com/og/zodiac.png"
      />}
      breadcrumb={{ trail: [{ label: 'Zodiac Signs', to: '/zodiac/' }, { label: data.name, to: `/zodiac/${data.slug}` }], current: Day }}
      footer={{
        tagline: `${data.name} (${data.dateRange}) — ${day}'s Western horoscope from the real sky.`,
        nav: [{ label: `${data.name} profile`, to: `/zodiac/${data.slug}` }, { label: 'Zodiac', to: '/zodiac/' }, { label: 'Vedic rashifal', to: '/rashifal/' }],
        note: 'Western (tropical) astrology — reflective guidance, not certainty.',
      }}
      eyebrow={tomorrow ? 'Western (tropical) astrology · tomorrow’s horoscope' : 'Western (tropical) astrology · daily horoscope'}
      h1={<DailyH1 entry={entry} fallback={`${data.name} Horoscope ${Day}`} />}
      lead={<>{data.unicode} {data.name} · {data.dateRange} · <DailyDate entry={entry} /></>}
    >
      <section className="section container mx-auto px-4 py-8 max-w-3xl">
        <p className="text-sm rounded-lg border border-border bg-muted/40 px-4 py-3 mb-6" data-testid="western-label">
          This is <strong>Western (tropical) astrology</strong>, read from your Sun sign. Your Vedic rashi (Moon sign) may differ —{' '}
          <Link to="/moon-sign/" className="underline">find your Vedic rashi here</Link>, then read the{' '}
          <Link to={`/rashifal/${RASHI_OF[idx]}/${when}`} className="underline">Vedic rashifal for {day}</Link>.
        </p>

        <div className="flex flex-wrap gap-2 mb-4" data-testid="horoscope-days">
          {(['today', 'tomorrow'] as const).map(w => (
            <Link key={w} to={`/zodiac/${data.slug}/${w}`}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${w === when ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-muted'}`}>
              {w === 'today' ? 'Today' : 'Tomorrow'}
            </Link>
          ))}
        </div>

        <DailyBody entry={entry} testId={tomorrow ? 'horoscope-tomorrow' : 'horoscope-daily'} />
        {tomorrow && (
          <p className="text-xs text-muted-foreground mb-6" data-testid="horoscope-tomorrow-note">
            This is the reading for tomorrow’s India date, from where the planets will be tomorrow. At midnight (India time) it becomes today’s reading —{' '}
            <Link to={`/zodiac/${data.slug}/today`} className="underline">read {data.name} today →</Link>
          </p>
        )}

        <DailyTermStrip
          title="What these words mean"
          terms={[
            { key: 'tropicalZodiac', label: 'Tropical zodiac' },
            { key: 'sunSign', label: 'Sun sign' },
            { key: 'solarHouse', label: 'Solar houses' },
            { key: 'westernAspect', label: 'Aspects' },
            { key: 'retrograde', label: 'Retrograde' },
            { key: 'ingress', label: 'Sign change (ingress)' },
          ]}
        />

        <h2 className="font-semibold text-foreground mb-2">Other signs {day}</h2>
        <div className="flex flex-wrap gap-2 mb-8" data-testid="horoscope-others">
          {ZODIAC_DATA.filter(z => z.slug !== data.slug).map(z => (
            <Link key={z.slug} to={`/zodiac/${z.slug}/${when}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted">
              {z.unicode} {z.name}
            </Link>
          ))}
        </div>

        <div className="bg-muted/50 rounded-xl p-6 text-center">
          <p className="text-muted-foreground text-sm mb-3">More about {data.name}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to={`/zodiac/${data.slug}`} className="text-sm text-primary hover:underline">{data.name} traits &amp; compatibility</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/western-birth-chart/" className="text-sm text-primary hover:underline">Your full Western birth chart</Link>
          </div>
        </div>
      </section>
      <DailyJsonLd entry={entry} path={path} />
    </CollectionLayout>
  );
}

/**
 * /rashifal/:rashi/today — the daily Vedic rashifal (W1), served through the shared
 * daily-page mechanism (src/lib/daily): the Worker injects today's precomputed text;
 * this component renders the same entry (embedded data → month JSON → fallback).
 * Batch 10: `when="tomorrow"` renders /rashifal/:rashi/tomorrow — the next India date's
 * reading (daily kind 'rashifal-tomorrow'), with its own dated title and canonical.
 */
import { Link } from '@/components/seo/CanonicalLink';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { RASHIS, type RashiMeta } from '@/lib/vedic/rashifal';
import { useDailyEntry } from '@/lib/daily/useDailyEntry';
import { DailyBody, DailyDate, DailyH1, DailyJsonLd } from '@/lib/daily/DailyParts';
import { RASHI_SLUGS, RASHI_SLUGS_HI, SUN_SIGN_SLUGS } from '@/lib/daily/registry';
import { DailyTermStrip } from './DailyTermStrip';

/** Period tabs on every rashifal view (Batch 10 adds Tomorrow). */
export const RASHIFAL_TABS: Array<{ key: string; label: string }> = [
  { key: 'today', label: 'Today' }, { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'week', label: 'This week' }, { key: 'month', label: 'This month' }, { key: 'year', label: 'This year' },
];

export function RashifalDailyView({ rashi, when = 'today' }: { rashi: RashiMeta; when?: 'today' | 'tomorrow' }) {
  const idx = RASHIS.findIndex(r => r.slug === rashi.slug);
  const name = rashi.slug.charAt(0).toUpperCase() + rashi.slug.slice(1);
  const tomorrow = when === 'tomorrow';
  const path = `/rashifal/${rashi.slug}/${when}`;
  const Day = tomorrow ? 'Tomorrow' : 'Today';
  const { entry } = useDailyEntry(tomorrow ? 'rashifal-tomorrow' : 'rashifal', rashi.slug);

  return (
    <ToolLayout
      theme="vedic"
      testId="rashifal-sign"
      seo={<SEO
        title={entry?.title ?? (tomorrow ? `${name} Rashifal Tomorrow — ${rashi.english} Horoscope | BornClock` : `${rashi.sanskrit} (${rashi.english}) Daily Horoscope — Rashifal | BornClock`)}
        description={entry?.description ?? (tomorrow ? `Tomorrow's rashifal for ${rashi.sanskrit} (${rashi.english}), computed from tomorrow's real sidereal planetary positions.` : `Daily rashifal for ${rashi.sanskrit} (${rashi.english}), computed from today's real sidereal planetary positions.`)}
        canonicalUrl={path}
        ogImage="https://bornclock.com/og/vedic.png"
      />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology/' }, { label: 'Rashifal', to: '/rashifal/' }], current: `${rashi.sanskrit} · ${Day}` }}
      footer={{ tagline: 'Computed Vedic horoscopes from your real Moon sign.', nav: [{ label: 'All rashis', to: '/rashifal/' }, { label: 'Free Kundli', to: '/kundali/' }], note: 'Readings are computed from sidereal planetary positions and attributed to the Vedic tradition — reflective guidance, not certainty.' }}
      eyebrow={tomorrow ? 'Tomorrow’s rashifal · by Moon sign' : 'Daily rashifal · by Moon sign'}
      h1={<DailyH1 entry={entry} fallback={`${name} Rashifal ${Day}`} />}
      lead={<>{rashi.sanskrit} ({rashi.english}) Moon sign · ruled by {rashi.lord} · <DailyDate entry={entry} /></>}
    >
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="flex flex-wrap gap-2 mb-4" data-testid="rashifal-periods">
            {RASHIFAL_TABS.map(p => (
              <Link key={p.key} to={`/rashifal/${rashi.slug}/${p.key}`}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${p.key === when ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-primary/5'}`}>
                {p.label}
              </Link>
            ))}
            <Link to={`/hi/rashifal/${RASHI_SLUGS_HI[idx]}`} lang="hi" className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">हिंदी में</Link>
          </div>

          <DailyBody entry={entry} testId={tomorrow ? 'rashifal-tomorrow' : 'rashifal-daily'} />
          {tomorrow && (
            <p className="text-xs text-muted-foreground mb-6" data-testid="rashifal-tomorrow-note">
              This is the reading for tomorrow’s India date, from where the planets will be tomorrow. It changes at midnight (India time), when it becomes today’s reading —{' '}
              <Link to={`/rashifal/${rashi.slug}/today`} className="underline">read {name} today →</Link>
            </p>
          )}

          <DailyTermStrip
            title="What these words mean"
            terms={[
              { key: 'chandrabala', label: 'Chandrabala' },
              { key: 'tarabala', label: 'Tarabala' },
              { key: 'nakshatra', label: 'Nakshatra' },
              { key: 'chandrashtama', label: 'Chandrashtama' },
              { key: 'sadeSati', label: 'Sade Sati' },
              { key: 'dhaiya', label: 'Dhaiya' },
              { key: 'choghadiya', label: 'Choghadiya' },
              { key: 'rahuKalam', label: 'Rahu Kaal' },
              { key: 'luckyColour', label: 'Lucky colour' },
            ]}
          />

          <p className="text-xs text-muted-foreground mb-6">
            Computed for the India date from the real sidereal (Lahiri) positions of the planets with the same engine behind your Kundli, and read by classical gochar rules from your Moon sign.{' '}
            <Link to="/how-it-works/#vedic" className="underline">How we calculate this →</Link>
          </p>

          <h2 className="font-semibold text-foreground mb-2">Other rashis {tomorrow ? 'tomorrow' : 'today'}</h2>
          <div className="flex flex-wrap gap-2 mb-6" data-testid="rashifal-others">
            {RASHIS.filter(r => r.slug !== rashi.slug).map(r => (
              <Link key={r.slug} to={`/rashifal/${r.slug}/${when}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">
                {r.slug.charAt(0).toUpperCase() + r.slug.slice(1)} <span className="text-muted-foreground">({r.english})</span>
              </Link>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mb-6" data-testid="rashifal-sadesati-link">
            Saturn periods for {rashi.sanskrit}: <Link to={`/sade-sati/${rashi.slug}`} className="underline">{rashi.sanskrit} Sade Sati &amp; Dhaiya start and end dates →</Link>
          </p>

          <p className="text-sm text-muted-foreground mb-8">
            Looking for the Western (Sun sign) horoscope instead? It uses a different zodiac, so your sign there may differ:{' '}
            <Link to={`/zodiac/${SUN_SIGN_SLUGS[idx]}/${when}`} className="underline">{rashi.english} horoscope {tomorrow ? 'tomorrow' : 'today'} (Western) →</Link>
          </p>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-3">Not sure of your Moon sign? Your free Kundli shows it — and your birth nakshatra for Tarabala.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/kundali/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold">Free Kundli →</Link>
              <Link to={`/vedic-zodiac/${RASHI_SLUGS[idx]}`} className="inline-flex items-center gap-2 border border-border rounded-lg px-6 py-3 font-semibold text-foreground">About {rashi.sanskrit} →</Link>
            </div>
          </div>
        </div>
      </section>
      <DailyJsonLd entry={entry} path={path} />
    </ToolLayout>
  );
}

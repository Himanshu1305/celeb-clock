import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { CelebrityCard, DisplayCelebrity } from '@/components/CelebrityCard';
import { BirthdayReportCTA } from '@/components/BirthdayReportCTA';
import { getNationalityCelebritiesForDate, CelebrityBirthdayResult } from '@/services/BirthdaySearchService';
import { generateBornOnTitle, generateBornOnMeta } from '@/utils/seoHelpers';
import { generateAllSlugs } from '@/utils/celebrityUtils';
import { indianCelebrities } from '@/data/indianCelebrities';
import { ArrowRightCircle } from 'lucide-react';

// Reuse the born-on name → celebrity-profile slug map so names link to /celebrity/[slug]/.
const NAME_TO_SLUG = new Map<string, string>();
generateAllSlugs(indianCelebrities as unknown as Record<string, unknown>[]).forEach((celeb, slug) => {
  const nm = String((celeb as Record<string, unknown>).name || '');
  if (nm && !NAME_TO_SLUG.has(nm)) NAME_TO_SLUG.set(nm, slug);
});

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
// February allows 29 (leap day) so /born-on/february/29 does not crash or 404.
const MONTH_DAYS = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const CURRENT_YEAR = new Date().getFullYear();

function toMmDd(month: number, day: number): string {
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseParams(
  monthParam: string | undefined,
  dayParam: string | undefined
): { month: number; day: number } | null {
  if (!monthParam || !dayParam) return null;
  const monthIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthParam.toLowerCase());
  if (monthIdx < 1) return null;
  const day = parseInt(dayParam, 10);
  if (isNaN(day) || day < 1 || day > MONTH_DAYS[monthIdx]) return null;
  return { month: monthIdx, day };
}

function toDisplay(c: CelebrityBirthdayResult): DisplayCelebrity {
  const birthYear = c.birthDate ? new Date(c.birthDate + 'T12:00:00').getFullYear() : null;
  const deathYear = c.deathDate ? new Date(c.deathDate + 'T12:00:00').getFullYear() : null;
  return {
    name: c.name,
    birthYear,
    deathYear,
    age: birthYear ? (c.isLiving ? CURRENT_YEAR - birthYear : (deathYear ? deathYear - birthYear : null)) : null,
    isLiving: c.isLiving,
    occupation: c.occupation ?? 'Personality',
    knownFor: c.knownFor,
    imageUrl: null,
    wikipediaUrl: c.wikipediaUrl,
    sitelinks: c.sitelinks,
  };
}

// Local JSON-LD helper so the QAPage schema prerenders inside the page body.
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function BornOnDayGlobal() {
  const { month: monthParam, day: dayParam } = useParams<{ month: string; day: string }>();
  const parsed = parseParams(monthParam, dayParam);

  const [celebs, setCelebs] = useState<CelebrityBirthdayResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parsed) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getNationalityCelebritiesForDate(toMmDd(parsed.month, parsed.day), 'IN', 30)
      .then(rows => { setCelebs(rows); setLoading(false); })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthParam, dayParam]);

  // Graceful "date not found" — no hard redirect, no crash.
  if (!parsed) {
    return (
      <div className="min-h-screen bg-gradient-cosmic" data-testid="born-on-global-page">
        <SEO title="Date not found · BornClock" noindex />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="flex justify-between items-center mb-8">
            <Navigation />
            <AuthNav />
          </header>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
            Date not found
          </h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find that date. Try browsing all birthdays instead.
          </p>
          <Link to="/born-on" className="text-primary hover:underline">Browse all born-on dates →</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { month, day } = parsed;
  const monthName = MONTH_NAMES[month];
  const dateLabel = `${monthName} ${day}`;
  const display = celebs.map(toDisplay);
  const topNames = celebs.slice(0, 3).map(c => c.name);

  const answer = topNames.length >= 1
    ? `Famous people born on ${dateLabel} include ${topNames.join(', ')}. ${celebs.length} notable personalities — actors, athletes, leaders, musicians and more — share this birthday, ranked below by global recognition.`
    : `Explore the celebrities born on ${dateLabel}, ranked by global recognition, with ages, professions and birthday facts.`;

  const qaJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: `Which celebrities were born on ${monthName} ${day}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: topNames.length >= 1
          ? `Famous people born on ${dateLabel} include ${topNames.join(', ')}.`
          : `Discover the celebrities born on ${dateLabel}, ranked by global recognition.`,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic" data-testid="born-on-global-page">
      {/* Canonical intentionally points to the India variant to avoid duplicate content. */}
      <SEO
        title={generateBornOnTitle(monthName, day, celebs)}
        description={generateBornOnMeta(monthName, day, celebs)}
        canonicalUrl={`/born-on/${monthName.toLowerCase()}-${day}/india`}
        ogType="website"
        ogImage="https://bornclock.com/og/born-on.png"
      />
      <JsonLd data={qaJsonLd} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>›</span>
          <Link to="/born-on" className="hover:text-foreground">Born On</Link>
          <span>›</span>
          <span className="text-foreground">{dateLabel}</span>
        </nav>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
          Famous People Born on {dateLabel}
        </h1>

        {/* Concise answer block (AEO) */}
        <div className="bg-primary/10 border-l-4 border-primary rounded-r-xl p-5 mb-8">
          <p className="text-base font-medium text-foreground leading-relaxed">{answer}</p>
        </div>

        {/* Celebrity grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : display.length > 0 ? (
          <div data-testid="celebrity-list" className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {display.map((celeb, i) => (
              <CelebrityCard key={celeb.name} celebrity={celeb} index={i} profileSlug={NAME_TO_SLUG.get(celeb.name)} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mb-8">No celebrities found in our database for this date.</p>
        )}
        <p className="text-xs text-muted-foreground mb-10">Biographical details from Wikipedia · ranked by global recognition (sitelinks).</p>

        {/* Birthday Report CTA */}
        <BirthdayReportCTA celebrities={celebs} month={monthName} day={day} />

        {/* Link to the India-specific page */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-lg text-foreground mb-2">Indian celebrities born on {dateLabel}</h2>
          <p className="text-muted-foreground text-sm mb-3">
            See the India-focused list of notable people born on {dateLabel}.
          </p>
          <a href={`/born-on/${monthName}-${day}/india/`} className="text-primary hover:underline text-sm">
            Indian celebrities born on {dateLabel} →
          </a>
        </div>

        {/* CTA */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-10 text-center">
          <h2 className="font-bold text-xl text-foreground mb-2">Is {dateLabel} YOUR birthday?</h2>
          <p className="text-muted-foreground mb-4">
            Get your complete birthday report — celebrity twins, zodiac deep-dive, numerology and life insights.
          </p>
          <Link
            to={`/?day=${day}&month=${month}`}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowRightCircle className="w-4 h-4" />
            Generate my birthday report
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

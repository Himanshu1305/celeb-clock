import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { CelebrityCard, DisplayCelebrity } from '@/components/CelebrityCard';
import { PageFAQ } from '@/components/PageFAQ';
import { getNationalityCelebritiesForDate, CelebrityBirthdayResult } from '@/services/BirthdaySearchService';
import { ArrowLeft, ArrowRight, ArrowRightCircle } from 'lucide-react';
import indiaDates from '@/data/indiaBornOnDates.json';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_DAYS = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const CURRENT_YEAR = new Date().getFullYear();

interface IndiaDate { slug: string; mmdd: string; month: number; day: number; count: number; top3: string[]; }
const DATES = indiaDates as IndiaDate[];
const SLUG_SET = new Set(DATES.map(d => d.slug));

function slugToMonthDay(slug: string): { month: number; day: number } | null {
  const parts = slug.split('-');
  if (parts.length < 2) return null;
  const dayStr = parts[parts.length - 1];
  const monthStr = parts.slice(0, -1).join('-');
  const monthIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthStr.toLowerCase());
  if (monthIdx < 1) return null;
  const day = parseInt(dayStr, 10);
  if (isNaN(day) || day < 1 || day > MONTH_DAYS[monthIdx]) return null;
  return { month: monthIdx, day };
}

function toMmDd(month: number, day: number): string {
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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

export default function BornOnDayIndia() {
  const { slug } = useParams<{ slug: string }>();
  const parsed = slug ? slugToMonthDay(slug) : null;

  const [celebs, setCelebs] = useState<CelebrityBirthdayResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parsed) return;
    setLoading(true);
    // Indian-only, ranked by sitelinks — nationality filtered in the query so the
    // count matches the date index (getCountryExtras would miss low-ranked IN on
    // high-volume dates like 01-01).
    getNationalityCelebritiesForDate(toMmDd(parsed.month, parsed.day), 'IN', 30)
      .then(rows => { setCelebs(rows); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  // Only render India pages for slugs we generate (>=3 IN celebs); otherwise
  // send the visitor to the parent born-on page.
  if (!parsed) return <Navigate to="/born-on" replace />;
  if (slug && !SLUG_SET.has(slug)) return <Navigate to={`/born-on/${slug}`} replace />;

  const { month, day } = parsed;
  const monthName = MONTH_NAMES[month];
  const dateLabel = `${monthName} ${day}`;
  const display = celebs.map(toDisplay);
  const topNames = celebs.slice(0, 3).map(c => c.name);

  // Prev/next among generated India dates (calendar order).
  const idx = DATES.findIndex(d => d.slug === slug);
  const prev = idx > 0 ? DATES[idx - 1] : DATES[DATES.length - 1];
  const next = idx < DATES.length - 1 ? DATES[idx + 1] : DATES[0];

  const answer = topNames.length >= 1
    ? `Famous Indians born on ${dateLabel} include ${topNames.join(', ')}. ${celebs.length} notable Indian personalities — actors, cricketers, leaders, musicians and more — share this birthday, ranked below by global recognition.`
    : `Explore the Indian celebrities born on ${dateLabel}, ranked by global recognition, with ages, professions and birthday facts.`;

  const faqItems = [
    {
      question: `Which Indian celebrities were born on ${dateLabel}?`,
      answer: topNames.length
        ? `Notable Indians born on ${dateLabel} include ${topNames.join(', ')}${celebs.length > 3 ? `, and ${celebs.length - 3} more` : ''}. The full list, ranked by global recognition, is on this page.`
        : `See the ranked list of Indian personalities born on ${dateLabel} on this page.`,
    },
    {
      question: `How many notable Indians share the ${dateLabel} birthday?`,
      answer: `Our database records ${celebs.length} well-known Indian personalities born on ${dateLabel}, spanning film, sport, politics, science and the arts.`,
    },
    {
      question: `Who is the most famous Indian born on ${dateLabel}?`,
      answer: topNames.length
        ? `By global recognition (Wikipedia language coverage), ${topNames[0]} ranks first among Indians born on ${dateLabel}.`
        : `See the top-ranked Indian personality for ${dateLabel} on this page.`,
    },
  ];

  const itemListJsonLd = display.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Indian Celebrities Born on ${dateLabel}`,
    itemListElement: display.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Person',
        name: c.name,
        nationality: 'Indian',
        birthDate: c.birthYear ? `${c.birthYear}-${toMmDd(month, day)}` : undefined,
        url: c.wikipediaUrl ?? undefined,
      },
    })),
  } : null;

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title={`Indian Celebrities Born on ${dateLabel} | BornClock`}
        description={answer}
        canonicalUrl={`/born-on/${slug}/india`}
        ogType="website"
        ogImage="https://bornclock.com/og/born-on.png"
      />
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}

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
          <Link to={`/born-on/${slug}`} className="hover:text-foreground">{dateLabel}</Link>
          <span>›</span>
          <span className="text-foreground">India 🇮🇳</span>
        </nav>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
          Indian Celebrities Born on {dateLabel}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {display.map((celeb, i) => (
              <CelebrityCard key={celeb.name} celebrity={celeb} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mb-8">No Indian celebrities found in our database for this date.</p>
        )}
        <p className="text-xs text-muted-foreground mb-10">Biographical details from Wikipedia · ranked by global recognition (sitelinks).</p>

        {/* Parent link */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-lg text-foreground mb-2">All celebrities born on {dateLabel}</h2>
          <p className="text-muted-foreground text-sm mb-3">
            See the full global list — plus zodiac sign, birthstone, numerology and calendar facts for {dateLabel}.
          </p>
          <Link to={`/born-on/${slug}`} className="text-primary hover:underline text-sm">
            Born on {dateLabel} — full guide →
          </Link>
        </div>

        {/* FAQ (reuses PageFAQ; JSON-LD prerenders via body script) */}
        <PageFAQ slug={'age-calculator'} title={`${dateLabel} — Indian Birthday FAQ`} items={faqItems} />

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

        {/* Prev / Next India date navigation */}
        <div className="flex justify-between items-center mb-8 gap-2">
          <Link
            to={`/born-on/${prev.slug}/india`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {MONTH_NAMES[prev.month]} {prev.day}
          </Link>
          <Link to="/born-on" className="text-sm text-muted-foreground hover:text-foreground">All dates</Link>
          <Link
            to={`/born-on/${next.slug}/india`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {MONTH_NAMES[next.month]} {next.day}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

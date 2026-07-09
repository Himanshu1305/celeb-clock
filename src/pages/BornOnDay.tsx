import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { CelebrityCard, DisplayCelebrity } from '@/components/CelebrityCard';
import { getRankedBirthdayCelebrities } from '@/services/BirthdaySearchService';
import { getZodiacSign } from '@/data/birthdayPersonality';
import { BIRTHSTONE_DATA } from '@/data/birthstoneData';
import { ArrowLeft, ArrowRight, ArrowRightCircle, Star } from 'lucide-react';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_DAYS = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const ZODIAC_SLUG: Record<string, string> = {
  Aries: 'aries', Taurus: 'taurus', Gemini: 'gemini', Cancer: 'cancer',
  Leo: 'leo', Virgo: 'virgo', Libra: 'libra', Scorpio: 'scorpio',
  Sagittarius: 'sagittarius', Capricorn: 'capricorn', Aquarius: 'aquarius', Pisces: 'pisces',
};

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

function prevDay(month: number, day: number): { month: number; day: number } {
  if (day > 1) return { month, day: day - 1 };
  const prevM = month === 1 ? 12 : month - 1;
  return { month: prevM, day: MONTH_DAYS[prevM] };
}

function nextDay(month: number, day: number): { month: number; day: number } {
  if (day < MONTH_DAYS[month]) return { month, day: day + 1 };
  const nextM = month === 12 ? 1 : month + 1;
  return { month: nextM, day: 1 };
}

function daySlug(month: number, day: number): string {
  return `${MONTH_NAMES[month].toLowerCase()}-${day}`;
}

export default function BornOnDay() {
  const { slug } = useParams<{ slug: string }>();
  const parsed = slug ? slugToMonthDay(slug) : null;

  const [celebrities, setCelebrities] = useState<DisplayCelebrity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parsed) return;
    setLoading(true);
    getRankedBirthdayCelebrities(toMmDd(parsed.month, parsed.day), null, 12).then(results => {
      setCelebrities(results.map(c => {
        const yearStr = c.birthDate ? c.birthDate.slice(0, 4) : null;
        const year = yearStr ? parseInt(yearStr, 10) : null;
        const deathYearStr = c.deathDate ? c.deathDate.slice(0, 4) : null;
        const deathYear = deathYearStr ? parseInt(deathYearStr, 10) : null;
        const age = year
          ? (c.deathDate ? (deathYear! - year) : (new Date().getFullYear() - year))
          : null;
        return {
          name: c.name,
          birthYear: year,
          deathYear,
          age,
          isLiving: c.isLiving,
          occupation: c.occupation || 'Personality',
          knownFor: c.knownFor ?? null,
          imageUrl: null,
          wikipediaUrl: c.wikipediaUrl,
          sitelinks: c.sitelinks,
        };
      }));
      setLoading(false);
    });
  }, [slug]);

  if (!parsed) return <Navigate to="/born-on" replace />;

  const { month, day } = parsed;
  const monthName = MONTH_NAMES[month];
  const zodiac = getZodiacSign(month, day);
  const zodiacSlug = ZODIAC_SLUG[zodiac.sign] ?? zodiac.sign.toLowerCase();
  const birthstone = BIRTHSTONE_DATA[month - 1];
  const prev = prevDay(month, day);
  const next = nextDay(month, day);

  const topNames = celebrities.slice(0, 3).map(c => c.name);
  const metaDesc = topNames.length > 0
    ? `Famous people born on ${monthName} ${day} include ${topNames.join(', ')}. Discover their zodiac sign, birthstone, and more.`
    : `Discover celebrities born on ${monthName} ${day} — zodiac sign ${zodiac.sign}, birthstone ${birthstone?.primaryStone ?? ''}, and birthday insights.`;

  const jsonLd = celebrities.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Celebrities Born on ${monthName} ${day}`,
    itemListElement: celebrities.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Person',
        name: c.name,
        birthDate: c.birthYear ? `${c.birthYear}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}` : undefined,
        url: c.wikipediaUrl ?? undefined,
      },
    })),
  } : null;

  const pageTitle = `Celebrities Born on ${monthName} ${day} — Zodiac & Birthday Facts | BornClock`;
  const shortTitle = pageTitle.length > 60
    ? `Born on ${monthName} ${day} — Famous Birthdays | BornClock`
    : pageTitle;

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title={shortTitle}
        description={metaDesc}
        canonicalUrl={`/born-on/${slug}`}
        ogType="website"
        ogImage="https://bornclock.com/og/born-on.png"
      />
      {jsonLd && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>›</span>
          <Link to="/born-on" className="hover:text-foreground">Born On</Link>
          <span>›</span>
          <span className="text-foreground">{monthName} {day}</span>
        </nav>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
          Celebrities Born on {monthName} {day}
        </h1>
        <p className="text-muted-foreground mb-8">
          Famous people born on {monthName} {day} — ranked by global recognition.
        </p>

        {/* Celebrity grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : celebrities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {celebrities.map((celeb, i) => (
              <CelebrityCard key={celeb.name} celebrity={celeb} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mb-10">No celebrities found in our database for this date.</p>
        )}

        {/* Zodiac sign */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Star className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg text-foreground">Western Zodiac Sign</h2>
          </div>
          <p className="text-muted-foreground mb-3">
            People born on {monthName} {day} are <strong className="text-foreground">{zodiac.sign}</strong> ({zodiac.element} sign, ruled by {zodiac.planet}).
          </p>
          <Link to={`/zodiac/${zodiacSlug}`} className="text-primary hover:underline text-sm">
            Full {zodiac.sign} guide →
          </Link>
        </div>

        {/* Chinese zodiac note */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-lg text-foreground mb-2">Chinese Zodiac</h2>
          <p className="text-muted-foreground text-sm">
            Your Chinese zodiac animal depends on your <em>birth year</em>, not just the day.{' '}
            <Link to="/chinese-zodiac" className="text-primary hover:underline">Find your Chinese zodiac →</Link>
          </p>
        </div>

        {/* Birthstone */}
        {birthstone && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-lg text-foreground mb-2">
              {monthName} Birthstone — {birthstone.primaryStone}
            </h2>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-4">
              {birthstone.fullDescription.slice(0, 300)}…
            </p>
            <Link to={`/birthstone/${birthstone.slug}`} className="text-primary hover:underline text-sm">
              Full {birthstone.primaryStone} guide →
            </Link>
          </div>
        )}

        {/* CTA */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-10 text-center">
          <h2 className="font-bold text-xl text-foreground mb-2">Is {monthName} {day} YOUR birthday?</h2>
          <p className="text-muted-foreground mb-4">
            Get your complete birthday report — celebrity twins, zodiac deep-dive, numerology, and life insights.
          </p>
          <Link
            to={`/?day=${day}&month=${month}`}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowRightCircle className="w-4 h-4" />
            Generate my birthday report
          </Link>
        </div>

        {/* Prev / Next navigation */}
        <div className="flex justify-between items-center mb-8">
          <Link
            to={`/born-on/${daySlug(prev.month, prev.day)}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {MONTH_NAMES[prev.month]} {prev.day}
          </Link>
          <Link to="/born-on" className="text-sm text-muted-foreground hover:text-foreground">
            All months
          </Link>
          <Link
            to={`/born-on/${daySlug(next.month, next.day)}`}
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

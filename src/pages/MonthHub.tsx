import { useState, useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SEO, FAQSchema } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { CelebrityCard, DisplayCelebrity } from '@/components/CelebrityCard';
import { getRankedMonthCelebrities, getRankedMonthCelebritiesByCountry } from '@/services/BirthdaySearchService';
import { getMonthHub, MONTH_HUB_DATA } from '@/data/monthHubData';
import { BIRTHSTONE_DATA } from '@/data/birthstoneData';
import { useReportPrice } from '@/hooks/useCurrency';
import { postsForTags } from '@/lib/mesh';
import { SharePageBar } from '@/components/SharePageBar';
import { ArrowLeft, ArrowRight, ArrowRightCircle, Star, Flower2, Gem } from 'lucide-react';

// Days per month (leap Feb → 29 so Feb-29 date page is linked)
const MONTH_DAYS = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Derive the month slug from the pathname (/born-in-january → january). Routes are
// registered explicitly per month, so there's no param — read it from the URL.
function slugFromPath(pathname: string): string {
  return pathname.replace(/^\/born-in-/, '').replace(/\/+$/, '').toLowerCase();
}

export default function MonthHub() {
  const location = useLocation();
  const slug = slugFromPath(location.pathname);
  const data = getMonthHub(slug);

  const [celebrities, setCelebrities] = useState<DisplayCelebrity[]>([]);
  const [indianCelebs, setIndianCelebs] = useState<(DisplayCelebrity & { dateHref: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const reportPrice = useReportPrice();

  useEffect(() => {
    if (!data) return;
    // Skip the network fetch during prerender (puppeteer sets navigator.webdriver):
    // the hub's SEO content is fully static, so this lets networkidle0 settle
    // immediately and the page prerenders reliably. Real users still get the list.
    if (typeof navigator !== 'undefined' && (navigator as { webdriver?: boolean }).webdriver) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getRankedMonthCelebrities(data.monthNumber, 12).then(results => {
      setCelebrities(results.map(c => {
        const year = c.birthDate ? parseInt(c.birthDate.slice(0, 4), 10) : null;
        const deathYear = c.deathDate ? parseInt(c.deathDate.slice(0, 4), 10) : null;
        const age = year ? (c.deathDate ? (deathYear! - year) : (new Date().getFullYear() - year)) : null;
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

    // "Indian celebrities born in {month}" — nationality-filtered so Indians aren't
    // buried under global historical figures (same fix class as the Jan-1 date page).
    getRankedMonthCelebritiesByCountry(data.monthNumber, 'IN', 12).then(results => {
      setIndianCelebs(results.map(c => {
        const year = c.birthDate ? parseInt(c.birthDate.slice(0, 4), 10) : null;
        const deathYear = c.deathDate ? parseInt(c.deathDate.slice(0, 4), 10) : null;
        const age = year ? (c.deathDate ? (deathYear! - year) : (new Date().getFullYear() - year)) : null;
        const day = c.birthDate ? parseInt(c.birthDate.slice(8, 10), 10) : null;
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
          dateHref: day ? `/born-on/${slug}-${day}` : `/born-in-${slug}`,
        };
      }));
    });
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return <Navigate to="/born-on" replace />;

  const { month, monthNumber } = data;
  const birthstone = BIRTHSTONE_DATA[monthNumber - 1];
  const prev = MONTH_HUB_DATA[(monthNumber + 10) % 12]; // previous month (1→Dec)
  const next = MONTH_HUB_DATA[monthNumber % 12];         // next month (12→Jan)
  const days = MONTH_DAYS[monthNumber];
  const topNames = celebrities.slice(0, 3).map(c => c.name);
  // Two tag-matched reads (this month's zodiac signs + birthstone) for the mesh.
  const meshPosts = postsForTags([...data.zodiacSpans.map(z => z.slug), 'birthstone', 'zodiac'], 2);

  const pageTitle = `Born in ${month} — Zodiac, Birthstone, Birth Flower & Famous Birthdays | BornClock`;
  const metaDesc = `Everything about being born in ${month}: ${data.zodiacSpans.map(z => z.sign).join(' & ')} zodiac signs, the ${birthstone?.primaryStone ?? ''} birthstone, ${data.birthFlowers.map(f => f.name).join(' & ')} birth flowers, and famous people born in ${month}.`;

  // FAQPage JSON-LD (visible FAQ below mirrors this)
  const faqItems = data.faqs.map(f => ({ question: f.question, answer: f.answer }));

  const celebJsonLd = celebrities.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Famous People Born in ${month}`,
    itemListElement: celebrities.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: { '@type': 'Person', name: c.name, url: c.wikipediaUrl ?? undefined },
    })),
  } : null;

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title={pageTitle.length > 65 ? `Born in ${month} — Zodiac, Birthstone & Famous Birthdays | BornClock` : pageTitle}
        description={metaDesc}
        canonicalUrl={`/born-in-${slug}`}
        ogType="website"
      />
      <FAQSchema items={faqItems} />
      {celebJsonLd && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(celebJsonLd)}</script>
        </Helmet>
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Breadcrumb (matches the /born-on date pages) */}
        <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>›</span>
          <Link to="/born-on" className="hover:text-foreground">Born On</Link>
          <span>›</span>
          <span className="text-foreground">Born in {month}</span>
        </nav>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
          Born in {month}
        </h1>

        {/* AEO answer block */}
        <h2 className="text-xl font-semibold text-foreground mb-2 mt-4">What does being born in {month} mean?</h2>
        <div className="bg-primary/10 border-l-4 border-primary rounded-r-xl p-5 mb-6">
          <p className="text-base font-medium text-foreground leading-relaxed">{data.answerParagraph}</p>
        </div>

        <SharePageBar
          path={`/born-in-${slug}`}
          title={`Born in ${month}`}
          text={`Born in ${month}? Discover the zodiac signs, birthstone and famous ${month} birthdays`}
          className="mb-8"
        />

        {/* Famous people born this month */}
        <h2 className="text-xl font-semibold text-foreground mb-4">Famous people born in {month}</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : celebrities.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              The most globally recognised people born in {month} include {topNames.join(', ')}.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {celebrities.map((celeb, i) => <CelebrityCard key={celeb.name} celebrity={celeb} index={i} />)}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground mb-10">Explore the day-by-day pages below for people born on each date in {month}.</p>
        )}

        {/* Indian celebrities born this month (only when ≥3 exist — no thin shells).
            Nationality-filtered so recognisable Indians surface above global figures. */}
        {indianCelebs.length >= 3 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-1">🇮🇳 Indian celebrities born in {month}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              The most recognised Indians born in {month}, ranked by global prominence. Tap a card for their birthday page.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {indianCelebs.map((celeb, i) => (
                <CelebrityCard key={`in-${celeb.name}`} celebrity={celeb} index={i} dateHref={celeb.dateHref} />
              ))}
            </div>
          </div>
        )}

        {/* Zodiac spans */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Star className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg text-foreground">{month} Zodiac Signs</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {data.zodiacSpans.map(z => (
              <Link key={z.slug} to={`/zodiac/${z.slug}`}
                className="block rounded-lg border border-border p-4 hover:border-primary transition-colors">
                <div className="font-semibold text-foreground">{z.sign}</div>
                <div className="text-sm text-muted-foreground">{z.dates}</div>
                <div className="text-xs text-primary mt-1">Full {z.sign} guide →</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Birthstone */}
        {birthstone && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Gem className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg text-foreground">{month} Birthstone — {birthstone.primaryStone}</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-3">{birthstone.fullDescription.slice(0, 260)}…</p>
            <Link to={`/birthstone/${birthstone.slug}`} className="text-primary hover:underline text-sm">
              Full {birthstone.primaryStone} guide →
            </Link>
          </div>
        )}

        {/* Birth flowers */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Flower2 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg text-foreground">{month} Birth Flowers</h2>
          </div>
          <ul className="mb-3 space-y-1">
            {data.birthFlowers.map(f => (
              <li key={f.name} className="text-sm text-foreground">
                <strong>{f.name}</strong> <span className="text-muted-foreground">— {f.meaning}</span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-sm">{data.flowerLore}</p>
        </div>

        {/* Season */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-lg text-foreground mb-2">{month} in the Year</h2>
          <p className="text-muted-foreground text-sm">{data.seasonalNote}</p>
        </div>

        {/* Linked grid of the month's date pages */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-lg text-foreground mb-4">Every day in {month}</h2>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
            {Array.from({ length: days }, (_, i) => i + 1).map(d => (
              <Link key={d} to={`/born-on/${slug}-${d}`}
                className="text-center rounded-md border border-border py-2 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors">
                {d}
              </Link>
            ))}
          </div>
        </div>

        {/* From the blog (SEO-MAGNET-2 Phase B mesh) — tag-matched reads */}
        {meshPosts.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-lg text-foreground mb-4">Related reading</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {meshPosts.map(p => (
                <Link key={p.slug} to={`/blog/${p.slug}`}
                  className="block rounded-lg border border-border p-4 hover:border-primary transition-colors">
                  <div className="font-semibold text-foreground text-sm leading-snug">{p.title}</div>
                  <div className="text-xs text-primary mt-1">Read the guide →</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Currency-aware Birthday Report CTA */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-10 text-center">
          <h2 className="font-bold text-xl text-foreground mb-2">Were you born in {month}?</h2>
          <p className="text-muted-foreground mb-4">
            Create a personalised Birthday Blueprint — celebrity twins, zodiac deep-dive, numerology, and more, from {reportPrice}.
          </p>
          <Link to="/birthday-report"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold hover:opacity-90 transition-opacity">
            <ArrowRightCircle className="w-4 h-4" />
            Create a Birthday Report
          </Link>
        </div>

        {/* Visible FAQ (mirrors the FAQPage JSON-LD) */}
        <div className="mb-10">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-4">{month} birthday FAQ</h2>
          <div className="space-y-3">
            {data.faqs.map(f => (
              <details key={f.question} className="bg-card border border-border rounded-xl p-4">
                <summary className="font-semibold text-foreground cursor-pointer">{f.question}</summary>
                <p className="text-muted-foreground text-sm mt-2">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Prev / next month */}
        <div className="flex justify-between items-center mb-8">
          <Link to={`/born-in-${prev.slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Born in {prev.month}
          </Link>
          <Link to="/born-on" className="text-sm text-muted-foreground hover:text-foreground">All dates</Link>
          <Link to={`/born-in-${next.slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Born in {next.month} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

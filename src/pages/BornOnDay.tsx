import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SEO } from '@/components/SEO';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { CelebrityCard, DisplayCelebrity } from '@/components/CelebrityCard';
import { getRankedBirthdayCelebrities } from '@/services/BirthdaySearchService';
import { CountryExtrasSection } from '@/components/CountryExtrasSection';
import { getZodiacSign, getBirthdayPersonality } from '@/data/birthdayPersonality';
import { BIRTHSTONE_DATA } from '@/data/birthstoneData';
import { getNumerologyByNumber } from '@/data/numerologyData';
import { getNationalDays } from '@/data/nationalDays';
import { ArrowLeft, ArrowRight, ArrowRightCircle, Star, Sparkles } from 'lucide-react';
import indiaDates from '@/data/indiaBornOnDates.json';
import { postsForTags } from '@/lib/mesh';
import { SharePageBar } from '@/components/SharePageBar';

// Slugs that have a dedicated /born-on/[slug]/india page (>=3 Indian celebrities).
const INDIA_SLUGS = new Set((indiaDates as { slug: string }[]).map(d => d.slug));

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

// Day-of-year (non-leap; Feb 29 treated as day 60)
const MONTH_CUMULATIVE = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
function dayOfYear(month: number, day: number): number {
  return MONTH_CUMULATIVE[month] + day;
}

// Reduce day to birthday number 1–9 (no master numbers for day reduction)
function birthdayNumber(day: number): number {
  let n = day;
  while (n > 9) n = String(n).split('').reduce((a, d) => a + parseInt(d), 0);
  return n;
}

// Northern-hemisphere season for a date
function seasonNote(month: number, day: number): string {
  const d = month * 100 + day;
  if (d >= 321 && d <= 620) return 'Spring (Northern Hemisphere) — a season of beginnings and renewal.';
  if (d >= 621 && d <= 922) return 'Summer (Northern Hemisphere) — long days, full energy, peak sun.';
  if (d >= 923 && d <= 1220) return 'Autumn (Northern Hemisphere) — harvest season, a time of reflection.';
  return 'Winter (Northern Hemisphere) — the quietest season, turning inward.';
}

// Days until next occurrence of this date (from today, non-leap)
function daysUntilNext(month: number, day: number): number {
  const today = new Date();
  const thisYear = today.getFullYear();
  let next = new Date(thisYear, month - 1, day);
  if (next <= today) next = new Date(thisYear + 1, month - 1, day);
  return Math.ceil((next.getTime() - today.getTime()) / 86_400_000);
}

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

  const doy = dayOfYear(month, day);
  const bNum = birthdayNumber(day);
  const bNumData = getNumerologyByNumber(bNum);
  const season = seasonNote(month, day);
  const daysUntil = daysUntilNext(month, day);
  const nationalDays = getNationalDays(month, day);
  const primaryNationalDay = nationalDays[0] ?? null;

  const topNames = celebrities.slice(0, 3).map(c => c.name);
  const nationalDaySuffix = primaryNationalDay ? ` Also ${primaryNationalDay.country}'s ${primaryNationalDay.dayName}.` : '';

  // ── Birthday personality (SEO-MAGNET-3 Phase 2) ────────────────────────────
  // Structured traits from the sign × birth-day-number matrix; A2: the day-derived
  // number is the "Birth Day Number", never Life Path (the full Life Path uses the
  // complete date and lives in the paid Blueprint). A3 thin-content guard: this
  // date's UNIQUE data (top celebrity, national day, birthstone) is interleaved
  // into the prose so no two same-sign/same-number dates read identically.
  const persona = getBirthdayPersonality(month, day);
  const topCeleb = topNames[0] ?? null;
  const uniqueThread = [
    topCeleb ? `${topCeleb} shares this birthday` : null,
    primaryNationalDay ? `${monthName} ${day} is ${primaryNationalDay.country}'s ${primaryNationalDay.dayName}` : null,
    birthstone ? `the birthstone is ${birthstone.primaryStone}` : null,
  ].filter(Boolean).join(', ');
  const personaAnswer =
    `People born on ${monthName} ${day} are ${persona.coreTraits.slice(0, 3).join(', ')} — ${zodiac.sign} ` +
    `(${zodiac.element}) energy carried through Birth Day Number ${bNum}.` +
    (uniqueThread ? ` For ${monthName} ${day} specifically, ${uniqueThread}.` : '');
  // Compatible signs → zodiac hub + the canonical (alphabetical) compatibility pair.
  const compatLinks = persona.compatibleSigns.slice(0, 4).map(s => {
    const otherSlug = ZODIAC_SLUG[s] ?? s.toLowerCase();
    const pair = [zodiacSlug, otherSlug].sort();
    return { sign: s, zodiac: `/zodiac/${otherSlug}`, compat: `/compatibility/${pair[0]}/${pair[1]}` };
  });
  const personaFaqs = [
    { question: `What is the personality of someone born on ${monthName} ${day}?`, answer: personaAnswer },
    { question: `What is the Birth Day Number for ${monthName} ${day}?`, answer: `${monthName} ${day} reduces to Birth Day Number ${bNum}${bNumData ? ` (${bNumData.name})` : ''}. This reflects the day of the month only — your full Life Path number, calculated from your complete birth date, is in the Birthday Blueprint.` },
    { question: `Which zodiac signs are most compatible with ${monthName} ${day} (${zodiac.sign})?`, answer: `As a ${zodiac.sign}, people born on ${monthName} ${day} are most compatible with ${persona.compatibleSigns.join(', ')}.` },
    { question: `What are the lucky day and colour for ${monthName} ${day}?`, answer: `Lucky day: ${persona.luckyDay}. Lucky colour: ${persona.luckyColor}.` },
  ];
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: personaFaqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
  const metaDesc = (topNames.length > 0
    ? `Famous people born on ${monthName} ${day} (${zodiac.sign}) include ${topNames.join(', ')}. Day ${doy} of the year — discover zodiac, birthstone, and birthday insights.`
    : `Discover celebrities born on ${monthName} ${day} — ${zodiac.sign} (${zodiac.element}), birthstone ${birthstone?.primaryStone ?? ''}, day ${doy} of the year.`) + nationalDaySuffix;

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

        {/* Concise answer block (AEO) — question-shaped H2 + direct answer */}
        <h2 className="text-xl font-semibold text-foreground mb-2 mt-4">Who was born on {monthName} {day}?</h2>
        <div className="bg-primary/10 border-l-4 border-primary rounded-r-xl p-5 mb-8">
          <p className="text-base font-medium text-foreground leading-relaxed">
            {topNames.length > 0
              ? `Famous people born on ${monthName} ${day} include ${topNames.join(', ')}. It is day ${doy} of the year, and everyone born on this date is a ${zodiac.sign} (${zodiac.element} sign).`
              : `${monthName} ${day} is day ${doy} of the year. Everyone born on this date is a ${zodiac.sign} (${zodiac.element} sign). See the notable people born on ${monthName} ${day} below.`}
            {primaryNationalDay && ` ${monthName} ${day} is also ${primaryNationalDay.country}'s ${primaryNationalDay.dayName}.`}
          </p>
        </div>

        <SharePageBar
          path={`/born-on/${slug}`}
          title={`Born on ${monthName} ${day}`}
          text={`People born on ${monthName} ${day} are ${zodiac.sign} — see who shares this birthday and their personality`}
          className="mb-8"
        />

        {/* Celebrity grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : celebrities.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {celebrities.map((celeb, i) => (
                <CelebrityCard key={celeb.name} celebrity={celeb} index={i} />
              ))}
            </div>
            <CountryExtrasSection
              monthDay={`${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
              mainListNames={celebrities.map(c => c.name)}
            />
            {slug && INDIA_SLUGS.has(slug) && (
              <div className="mt-4 mb-2">
                <Link
                  to={`/born-on/${slug}/india`}
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  🇮🇳 Indian celebrities born on {monthName} {day} →
                </Link>
              </div>
            )}
            <div className="mb-6" />
          </>
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

        {/* Day-of-year + days until next */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-lg text-foreground mb-3">Calendar Facts</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Day of the year</p>
              <p className="text-2xl font-bold text-foreground">#{doy}</p>
              <p className="text-xs text-muted-foreground mt-1">of 365 (non-leap)</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Days until next</p>
              <p className="text-2xl font-bold text-foreground">{daysUntil}</p>
              <p className="text-xs text-muted-foreground mt-1">days from today</p>
            </div>
          </div>
        </div>

        {/* Birthday Number */}
        {bNumData && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-lg text-foreground mb-1">Birthday Number {bNum} — {bNumData.name}</h2>
            <p className="text-xs text-muted-foreground mb-3">
              The birthday number is the numerology reduction of the day (day {day} → {bNum}). It adds a personal note to the Life Path number.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {bNumData.keywords.slice(0, 4).join(' · ')} — {bNumData.masteryLesson.slice(0, 120)}…
            </p>
            <Link to={`/numerology/${bNum}`} className="text-primary hover:underline text-sm mt-3 inline-block">
              Full numerology {bNum} guide →
            </Link>
          </div>
        )}

        {/* Birthday personality (SEO-MAGNET-3 Phase 2) */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg text-foreground">Born on {monthName} {day}: Personality</h2>
          </div>
          {/* Answer-first sentence — snippet target, interleaves this date's unique data */}
          <div className="bg-primary/10 border-l-4 border-primary rounded-r-xl p-4 mb-4">
            <p className="text-base font-medium text-foreground leading-relaxed">{personaAnswer}</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {persona.coreTraits.map(t => (
              <span key={t} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">{t}</span>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Strengths</p>
              <ul className="space-y-1">
                {persona.strengths.map(s => (
                  <li key={s} className="text-sm text-foreground flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>{s}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Growth areas</p>
              <ul className="space-y-1">
                {persona.challenges.map(c => (
                  <li key={c} className="text-sm text-muted-foreground flex items-start gap-2"><span className="mt-0.5">△</span>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Lucky day</p>
              <p className="text-sm font-bold text-foreground">{persona.luckyDay}</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Lucky colour</p>
              <p className="text-sm font-bold text-foreground">{persona.luckyColor}</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Birth Day No.</p>
              <p className="text-sm font-bold text-foreground">{bNum}</p>
            </div>
          </div>

          <p className="text-sm font-semibold text-foreground mb-2">Most compatible signs</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {compatLinks.map(c => (
              <span key={c.sign} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-sm">
                <Link to={c.zodiac} className="text-primary hover:underline">{c.sign}</Link>
                <Link to={c.compat} className="text-muted-foreground hover:text-foreground text-xs" aria-label={`${zodiac.sign} and ${c.sign} compatibility`}>· match</Link>
              </span>
            ))}
          </div>

          {/* A2 clarifying line — the day-derived number is NOT the full Life Path */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            Birth Day Number {bNum} comes from the day of the month alone. Your full <strong className="text-foreground">Life Path number</strong>, calculated from your complete birth date, is in the{' '}
            <Link to="/birthday-report" className="text-primary hover:underline">Birthday Blueprint</Link>.
          </p>
        </div>

        {/* Personality FAQ — in-body FAQPage JSON-LD (Helmet-injected LD does not
            survive the prerender capture, so it is rendered here in the body). */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
          <h2 className="font-semibold text-lg text-foreground mb-4">{monthName} {day} birthday personality FAQ</h2>
          <div className="space-y-3">
            {personaFaqs.map(f => (
              <details key={f.question} className="border border-border rounded-xl p-4">
                <summary className="font-semibold text-foreground cursor-pointer text-sm">{f.question}</summary>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>

        {/* National days on this date (only when the date has entries) */}
        {nationalDays.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-lg text-foreground mb-3">National days on {monthName} {day}</h2>
            <ul className="space-y-2">
              {nationalDays.map(nd => (
                <li key={`${nd.country}-${nd.dayName}`} className="flex items-start gap-2 text-sm">
                  <span className="text-lg leading-none">{nd.flag}</span>
                  <span>
                    <strong className="text-foreground">{nd.country}</strong>
                    <span className="text-muted-foreground"> — {nd.dayName}. {nd.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Season */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-lg text-foreground mb-2">Season</h2>
          <p className="text-muted-foreground text-sm">{season}</p>
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

        {/* Internal mesh (SEO-MAGNET-2 Phase B) — month hub, rhythm tool + a
            tag-matched read, keeping every date page inside the topical graph. */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Explore more</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link to={`/born-in-${monthName.toLowerCase()}`} className="p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground transition-colors">→ Everyone born in {monthName}</Link>
            <Link to={`/zodiac/${zodiacSlug}`} className="p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground transition-colors">→ {zodiac.sign} zodiac guide</Link>
            <Link to="/energy-forecast" className="p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground transition-colors">→ Your 7-day energy forecast</Link>
            {postsForTags([zodiacSlug, 'birthday', 'birthstone'], 1).map(p => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground transition-colors">→ {p.title}</Link>
            ))}
          </div>
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

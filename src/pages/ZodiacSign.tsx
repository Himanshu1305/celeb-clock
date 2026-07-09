import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { ZODIAC_DATA, getZodiacBySlug } from '@/data/zodiacData';

const ELEMENT_BG: Record<string, string> = {
  Fire: 'from-red-500/20 to-orange-500/20',
  Earth: 'from-green-600/20 to-emerald-500/20',
  Air: 'from-sky-400/20 to-blue-400/20',
  Water: 'from-blue-600/20 to-indigo-500/20',
};

const ELEMENT_BADGE: Record<string, string> = {
  Fire: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  Earth: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Air: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  Water: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

export default function ZodiacSign() {
  const { sign } = useParams<{ sign: string }>();
  const data = sign ? getZodiacBySlug(sign) : undefined;

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="flex justify-between items-center mb-12">
            <Navigation />
            <AuthNav />
          </header>
          <div className="text-center py-24">
            <p className="text-5xl mb-6">🔍</p>
            <h1 className="text-3xl font-bold text-foreground mb-4">Sign Not Found</h1>
            <p className="text-muted-foreground mb-8">That zodiac sign doesn't exist in our database.</p>
            <Link to="/zodiac" className="inline-block bg-primary text-primary-foreground rounded-lg px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity">
              Back to All Signs
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: `What are the dates for ${data.name}?`, acceptedAnswer: { '@type': 'Answer', text: `${data.name} covers ${data.dateRange}.` } },
      { '@type': 'Question', name: `What element is ${data.name}?`, acceptedAnswer: { '@type': 'Answer', text: `${data.name} is a ${data.element} sign, ruled by ${data.rulingPlanet}.` } },
      { '@type': 'Question', name: `What are ${data.name}'s best compatibility matches?`, acceptedAnswer: { '@type': 'Answer', text: `${data.name} is most compatible with ${data.compatibleSigns.join(', ')}.` } },
      { '@type': 'Question', name: `What are ${data.name}'s key traits?`, acceptedAnswer: { '@type': 'Answer', text: `Core traits include: ${data.coreTraits.join(', ')}.` } },
      { '@type': 'Question', name: `What is ${data.name}'s modality?`, acceptedAnswer: { '@type': 'Answer', text: `${data.name} is a ${data.modality} sign, meaning ${data.modality === 'Cardinal' ? 'it initiates new seasons and themes' : data.modality === 'Fixed' ? 'it represents stability and persistence in the middle of each season' : 'it bridges seasons and adapts to change'}.` } },
      { '@type': 'Question', name: `Which body part is associated with ${data.name}?`, acceptedAnswer: { '@type': 'Answer', text: `In traditional astrology, ${data.name} rules the ${data.bodyPart.toLowerCase()}.` } },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bornclock.com' },
      { '@type': 'ListItem', position: 2, name: 'Zodiac Signs', item: 'https://bornclock.com/zodiac' },
      { '@type': 'ListItem', position: 3, name: data.name, item: `https://bornclock.com/zodiac/${data.slug}` },
    ],
  };

  const otherSigns = ZODIAC_DATA.filter(z => z.slug !== data.slug);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={data.seoTitle}
        description={data.seoDescription}
        keywords={data.seoKeywords}
        canonicalUrl={`/zodiac/${data.slug}`}
        ogImage="https://bornclock.com/og/zodiac.png"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-8 flex items-center gap-2">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>›</span>
          <Link to="/zodiac" className="hover:text-foreground transition-colors">Zodiac Signs</Link>
          <span>›</span>
          <span className="text-foreground">{data.name}</span>
        </nav>

        {/* Hero */}
        <div className={`rounded-2xl bg-gradient-to-br ${ELEMENT_BG[data.element]} border border-border p-8 mb-10`}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="text-center md:text-left">
              <div className="text-8xl mb-4 leading-none">{data.unicode}</div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{data.name}</h1>
              <p className="text-lg text-muted-foreground mb-4">{data.dateRange} · The {data.symbol}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${ELEMENT_BADGE[data.element]}`}>{data.element}</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">Ruled by {data.rulingPlanet}</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">{data.modality}</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">{data.bodyPart}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Traits */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Core Traits</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {data.coreTraits.map(t => (
              <span key={t} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">{t}</span>
            ))}
          </div>
          <p className="text-muted-foreground leading-relaxed">{data.fullDescription}</p>
        </section>

        {/* Strengths & Challenges */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Strengths & Challenges</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-5">
              <h3 className="font-bold text-green-800 dark:text-green-300 mb-3">Strengths</h3>
              <ul className="space-y-2">
                {data.strengths.map(s => (
                  <li key={s} className="flex items-start gap-2 text-sm text-green-700 dark:text-green-400">
                    <span className="mt-1 shrink-0">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
              <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-3">Challenges</h3>
              <ul className="space-y-2">
                {data.challenges.map(c => (
                  <li key={c} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
                    <span className="mt-1 shrink-0">△</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Famous People */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Famous {data.name} Celebrities</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.famousPeople.map(p => (
              <div key={p.name} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: `${data.elementColor}22` }}>
                    {data.unicode}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground mb-1">Born {p.born}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.why}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* In Love */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">{data.name} in Love</h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-muted-foreground leading-relaxed">{data.inLove}</p>
            <div className="mt-4">
              <p className="text-sm font-semibold text-foreground mb-2">Most Compatible With:</p>
              <div className="flex flex-wrap gap-2">
                {data.compatibleSigns.map(cs => {
                  const match = ZODIAC_DATA.find(z => z.name === cs);
                  return (
                    <Link key={cs} to={`/zodiac/${match?.slug || cs.toLowerCase()}`}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors">
                      <span>{match?.unicode}</span>
                      <span>{cs}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* At Work */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">{data.name} at Work</h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-muted-foreground leading-relaxed">{data.atWork}</p>
          </div>
        </section>

        {/* Lucky */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Lucky Numbers, Colors & Stones</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-sm font-semibold text-foreground mb-2">Lucky Numbers</p>
              <p className="text-2xl font-bold text-primary">{data.luckyNumbers.join(' · ')}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-sm font-semibold text-foreground mb-2">Lucky Colors</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {data.luckyColors.map(c => (
                  <span key={c} className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">{c}</span>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-sm font-semibold text-foreground mb-2">Lucky Stones</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {data.luckyStones.map(s => (
                  <span key={s} className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mythology */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Mythology</h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-muted-foreground leading-relaxed">{data.mythology}</p>
          </div>
        </section>

        {/* History */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Historical Origins</h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-muted-foreground leading-relaxed">{data.history}</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: `What are the dates for ${data.name}?`, a: `${data.name} covers ${data.dateRange}.` },
              { q: `What element is ${data.name}?`, a: `${data.name} is a ${data.element} sign, ruled by ${data.rulingPlanet}.` },
              { q: `What are ${data.name}'s key personality traits?`, a: `Core traits include: ${data.coreTraits.join(', ')}.` },
              { q: `What signs are most compatible with ${data.name}?`, a: `${data.name} is most compatible with ${data.compatibleSigns.join(', ')}.` },
              { q: `What is ${data.name}'s modality?`, a: `${data.name} is a ${data.modality} sign.` },
              { q: `Which body part does ${data.name} rule?`, a: `In traditional astrology, ${data.name} rules the ${data.bodyPart.toLowerCase()}.` },
            ].map(({ q, a }) => (
              <div key={q} className="bg-card border border-border rounded-xl p-5">
                <p className="font-semibold text-foreground text-sm mb-2">{q}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Other Signs */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Explore Other Signs</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {otherSigns.map(z => (
              <Link key={z.slug} to={`/zodiac/${z.slug}`}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-center">
                <span className="text-2xl">{z.unicode}</span>
                <span className="text-xs font-medium text-foreground">{z.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom Links */}
        <div className="bg-muted/50 rounded-xl p-6 text-center">
          <p className="text-muted-foreground text-sm mb-4">Explore more BornClock tools</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/zodiac" className="text-sm text-primary hover:underline">All Zodiac Signs</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/birthstone" className="text-sm text-primary hover:underline">Birthstone Finder</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/numerology" className="text-sm text-primary hover:underline">Numerology</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/" className="text-sm text-primary hover:underline">Age Calculator</Link>
          </div>
        </div>

        {/* About This Content */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300">
          <strong>About This Content:</strong> Zodiac sign content on BornClock draws on historical and cultural sources including Campion (2009) and Sachs (1952). Zodiac signs are a cultural and entertainment system with no scientific basis for predicting personality or future events. Celebrity birth dates are sourced from Wikipedia and IMDb.
        </div>
      </div>

      <Footer />
    </div>
  );
}

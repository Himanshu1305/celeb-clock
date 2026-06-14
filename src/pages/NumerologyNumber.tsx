import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { NUMEROLOGY_DATA, getNumerologyByNumber, ALL_LIFE_PATH_NUMBERS } from '@/data/numerologyData';

export default function NumerologyNumber() {
  const { number } = useParams<{ number: string }>();
  const num = number ? parseInt(number, 10) : NaN;
  const data = isNaN(num) ? undefined : getNumerologyByNumber(num);

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="flex justify-between items-center mb-12">
            <Navigation />
            <AuthNav />
          </header>
          <div className="text-center py-24">
            <p className="text-5xl mb-6">🔢</p>
            <h1 className="text-3xl font-bold text-foreground mb-4">Number Not Found</h1>
            <p className="text-muted-foreground mb-8">Valid Life Path numbers are 1–9, 11, 22, and 33.</p>
            <Link to="/numerology" className="inline-block bg-primary text-primary-foreground rounded-lg px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity">
              Back to Numerology
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
      { '@type': 'Question', name: `What does Life Path ${data.number} mean?`, acceptedAnswer: { '@type': 'Answer', text: `Life Path ${data.number} — ${data.name} — is associated with ${data.keywords.join(', ')}.` } },
      { '@type': 'Question', name: `What are the strengths of Life Path ${data.number}?`, acceptedAnswer: { '@type': 'Answer', text: data.strengths.join('. ') } },
      { '@type': 'Question', name: `What are the challenges of Life Path ${data.number}?`, acceptedAnswer: { '@type': 'Answer', text: data.challenges.join('. ') } },
      { '@type': 'Question', name: `Which planet rules Life Path ${data.number}?`, acceptedAnswer: { '@type': 'Answer', text: `Life Path ${data.number} is associated with ${data.planet}.` } },
      { '@type': 'Question', name: `Is ${data.number} a master number?`, acceptedAnswer: { '@type': 'Answer', text: data.isMasterNumber ? `Yes, ${data.number} is a Master Number in Pythagorean numerology, and is not reduced further.` : `No, ${data.number} is a standard Life Path number.` } },
      { '@type': 'Question', name: `What careers suit Life Path ${data.number}?`, acceptedAnswer: { '@type': 'Answer', text: data.career } },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bornclock.com' },
      { '@type': 'ListItem', position: 2, name: 'Numerology', item: 'https://bornclock.com/numerology' },
      { '@type': 'ListItem', position: 3, name: `Life Path ${data.number}`, item: `https://bornclock.com/numerology/${data.number}` },
    ],
  };

  const otherNumbers = ALL_LIFE_PATH_NUMBERS.filter(n => n !== data.number);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={data.seoTitle}
        description={data.seoDescription}
        keywords={data.seoKeywords}
        canonicalUrl={`/numerology/${data.number}`}
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
          <Link to="/numerology" className="hover:text-foreground transition-colors">Numerology</Link>
          <span>›</span>
          <span className="text-foreground">Life Path {data.number}</span>
        </nav>

        {/* Hero */}
        <div className="rounded-2xl border border-border overflow-hidden mb-10">
          <div className="h-2 w-full" style={{ backgroundColor: data.hexColor }} />
          <div className="p-8 bg-gradient-to-br from-card to-muted/20">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-28 h-28 rounded-2xl flex items-center justify-center text-5xl font-black shrink-0 text-white"
                style={{ backgroundColor: data.hexColor }}>
                {data.number}
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-sm font-medium text-muted-foreground mb-1">Life Path Number</p>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{data.name}</h1>
                {data.isMasterNumber && (
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 mb-3">
                    ✦ Master Number
                  </span>
                )}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">{data.planet}</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">{data.element}</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">{data.color}</span>
                  {data.keywords.map(k => (
                    <span key={k} className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Master Number Box */}
        {data.isMasterNumber && data.masterNumberMeaning && (
          <div className="mb-10 p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
            <p className="font-semibold text-amber-800 dark:text-amber-300 mb-2">✦ Master Number {data.number}</p>
            <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">{data.masterNumberMeaning}</p>
          </div>
        )}

        {/* Personality */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Personality & Life Purpose</h2>
          <p className="text-muted-foreground leading-relaxed">{data.personality}</p>
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
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Famous Life Path {data.number}s</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.famousPeople.map(p => (
              <div key={p.name} className="bg-card border border-border rounded-xl p-4">
                <p className="font-semibold text-foreground text-sm mb-1">{p.name}</p>
                <p className="text-xs text-muted-foreground mb-2">Born {p.born}</p>
                <div className="bg-muted rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground">
                  {p.calculation} = <strong className="text-foreground">{p.result}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* In Love */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Life Path {data.number} in Love</h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-muted-foreground leading-relaxed">{data.inLove}</p>
          </div>
        </section>

        {/* Career */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Career & Life Purpose</h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-muted-foreground leading-relaxed">{data.career}</p>
          </div>
        </section>

        {/* Mastery Lesson */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">The Mastery Lesson</h2>
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <p className="text-blue-800 dark:text-blue-300 leading-relaxed">{data.masteryLesson}</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: `What does Life Path ${data.number} mean?`, a: `Life Path ${data.number} — ${data.name} — is associated with ${data.keywords.join(', ')}.` },
              { q: `What are the strengths of Life Path ${data.number}?`, a: data.strengths.join('. ') + '.' },
              { q: `What careers suit Life Path ${data.number}?`, a: data.career },
              { q: `Which planet rules Life Path ${data.number}?`, a: `Life Path ${data.number} is associated with ${data.planet} and the ${data.element} element.` },
              { q: `Is ${data.number} a master number?`, a: data.isMasterNumber ? `Yes, ${data.number} is a Master Number in Pythagorean numerology — it is preserved rather than reduced to a single digit.` : `No, ${data.number} is a standard Life Path number obtained by reducing your birth date digits to a single number.` },
              { q: `How is Life Path ${data.number} calculated?`, a: `Add all digits of your full birth date (day + month + year). If the result is ${data.isMasterNumber ? `${data.number}, it is preserved as a master number.` : `${data.number}, that is your life path. If you get a two-digit number, add those digits again until you reach a single digit.`}` },
            ].map(({ q, a }) => (
              <div key={q} className="bg-card border border-border rounded-xl p-5">
                <p className="font-semibold text-foreground text-sm mb-2">{q}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Other Numbers */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">All Life Path Numbers</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {otherNumbers.map(n => {
              const nd = NUMEROLOGY_DATA.find(d => d.number === n);
              return (
                <Link key={n} to={`/numerology/${n}`}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-center">
                  <span className="text-lg font-bold" style={{ color: nd?.hexColor }}>{n}</span>
                  {nd?.isMasterNumber && <span className="text-[10px] text-amber-500">Master</span>}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Bottom Links */}
        <div className="bg-muted/50 rounded-xl p-6 text-center">
          <p className="text-muted-foreground text-sm mb-4">Find your Life Path Number</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/numerology" className="inline-block bg-primary text-primary-foreground rounded-lg px-5 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
              Calculate My Life Path
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 justify-center text-sm">
            <Link to="/zodiac" className="text-primary hover:underline">Zodiac Signs</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/birthstone" className="text-primary hover:underline">Birthstone Finder</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/" className="text-primary hover:underline">Age Calculator</Link>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300">
          <strong>About This Content:</strong> Numerology life path content uses the classical Pythagorean digit-sum method. Life path numbers are a cultural and symbolic system. The famous person calculations shown are independently verified using each person's documented birth date. Numerology is not a scientifically validated system for predicting personality or outcomes.
        </div>
      </div>

      <Footer />
    </div>
  );
}

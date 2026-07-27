import { useParams, Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
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

  // FAQ items — PageFAQ renders the visible accordion AND the in-body FAQPage
  // JSON-LD (prerender-captured). BreadcrumbList is injected per-route by the
  // prerender pipeline.
  const faqItems = [
    { question: `What does Life Path ${data.number} mean?`, answer: `Life Path ${data.number} — ${data.name} — is associated with ${data.keywords.join(', ')}.` },
    { question: `What are the strengths of Life Path ${data.number}?`, answer: data.strengths.join('. ') },
    { question: `What are the challenges of Life Path ${data.number}?`, answer: data.challenges.join('. ') },
    { question: `Which planet rules Life Path ${data.number}?`, answer: `Life Path ${data.number} is associated with ${data.planet}.` },
    { question: `Is ${data.number} a master number?`, answer: data.isMasterNumber ? `Yes, ${data.number} is a Master Number in Pythagorean numerology, and is not reduced further.` : `No, ${data.number} is a standard Life Path number.` },
    { question: `What careers suit Life Path ${data.number}?`, answer: data.career },
    { question: `How is Life Path ${data.number} calculated?`, answer: `Add all digits of your full birth date (day + month + year). ${data.isMasterNumber ? `If the reduction lands on ${data.number}, it is preserved as a master number rather than reduced further.` : `Keep adding the resulting digits until you reach a single digit — if that digit is ${data.number}, that is your Life Path.`}` },
  ];

  const otherNumbers = ALL_LIFE_PATH_NUMBERS.filter(n => n !== data.number);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={data.seoTitle}
        description={data.seoDescription}
        keywords={data.seoKeywords}
        canonicalUrl={`/numerology/${data.number}`}
      />

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

        {/* Concise answer block (AEO) */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-3">What does Life Path {data.number} mean?</h2>
          <div className="bg-primary/10 border-l-4 border-primary rounded-r-xl p-5">
            <p className="text-base font-medium text-foreground leading-relaxed">
              Life Path {data.number} is “{data.name}” — associated with {data.keywords.slice(0, 4).join(', ').toLowerCase()}. {data.isMasterNumber ? `A master number, ${data.number} is preserved rather than reduced.` : `You calculate it by summing all digits of your birth date down to a single digit.`} It is linked to {data.planet} and the {data.element} element.
            </p>
          </div>
        </section>

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

        {/* FAQ — canonical PageFAQ (visible accordion + in-body FAQPage JSON-LD) */}
        <PageFAQ title={`Life Path ${data.number} — Frequently Asked Questions`} items={faqItems} />

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

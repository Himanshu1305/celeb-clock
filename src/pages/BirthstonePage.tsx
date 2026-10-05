import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CollectionLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { BIRTHSTONE_DATA, getBirthstoneBySlug } from '@/data/birthstoneData';
import { GemIllustration } from '@/components/GemIllustration';

export default function BirthstonePage() {
  const { month } = useParams<{ month: string }>();
  const data = month ? getBirthstoneBySlug(month) : undefined;

  if (!data) {
    return (
      <CollectionLayout
        theme="birthday"
        testId="birthstone-month-page"
        seo={<SEO title="Month Not Found — Birthstone | BornClock" description="That birthstone month doesn't exist in our database." canonicalUrl="/birthstone" />}
        breadcrumb={{ trail: [{ label: 'Birthday Report', to: '/birthday-report' }, { label: 'Birthstone', to: '/birthstone' }], current: 'Not Found' }}
        footer={{
          tagline: 'Birthstones by month — history, meaning and geology.',
          nav: [
            { label: 'Birthday Report', to: '/birthday-report' },
            { label: 'Results', to: '/results' },
            { label: 'Celebrities', to: '/celebrity' },
            { label: 'Privacy', to: '/privacy' },
          ],
          note: '© 2026 BornClock.',
        }}
        eyebrow="Birthstone"
        h1="Month Not Found"
        lead={<>That birthstone month doesn't exist in our database.</>}
      >
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-24">
            <p className="text-5xl mb-6">💎</p>
            <Link to="/birthstone" className="inline-block bg-primary text-primary-foreground rounded-lg px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity">
              Back to All Birthstones
            </Link>
          </div>
        </div>
      </CollectionLayout>
    );
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: `What is the birthstone for ${data.month}?`, acceptedAnswer: { '@type': 'Answer', text: `The primary birthstone for ${data.month} is ${data.primaryStone}${data.alternateStones.length ? `, with alternates including ${data.alternateStones.join(' and ')}` : ''}.` } },
      { '@type': 'Question', name: `What color is ${data.primaryStone}?`, acceptedAnswer: { '@type': 'Answer', text: `${data.primaryStone} is ${data.color}. Its chemical formula is ${data.chemicalFormula}.` } },
      { '@type': 'Question', name: `What does ${data.primaryStone} mean?`, acceptedAnswer: { '@type': 'Answer', text: `${data.primaryStone} symbolizes ${data.meaning}.` } },
      { '@type': 'Question', name: `How hard is ${data.primaryStone}?`, acceptedAnswer: { '@type': 'Answer', text: `${data.primaryStone} rates ${data.hardness}.` } },
      { '@type': 'Question', name: `Where is ${data.primaryStone} found?`, acceptedAnswer: { '@type': 'Answer', text: `${data.primaryStone} is primarily found in ${data.origin.join(', ')}.` } },
      { '@type': 'Question', name: `How do I care for ${data.primaryStone}?`, acceptedAnswer: { '@type': 'Answer', text: data.careInstructions } },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bornclock.com' },
      { '@type': 'ListItem', position: 2, name: 'Birthstone Finder', item: 'https://bornclock.com/birthstone' },
      { '@type': 'ListItem', position: 3, name: `${data.month} — ${data.primaryStone}`, item: `https://bornclock.com/birthstone/${data.slug}` },
    ],
  };

  const otherMonths = BIRTHSTONE_DATA.filter(b => b.slug !== data.slug);

  return (
    <CollectionLayout
      theme="birthday"
      testId="birthstone-month-page"
      seo={(
        <>
          <SEO
            title={data.seoTitle}
            description={data.seoDescription}
            keywords={data.seoKeywords}
            canonicalUrl={`/birthstone/${data.slug}`}
          />
          <Helmet>
            <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
          </Helmet>
        </>
      )}
      breadcrumb={{ trail: [{ label: 'Birthday Report', to: '/birthday-report' }, { label: 'Birthstone', to: '/birthstone' }], current: data.month }}
      footer={{
        tagline: `${data.month} birthstone — ${data.primaryStone}, its history, meaning and geology.`,
        nav: [
          { label: 'Birthday Report', to: '/birthday-report' },
          { label: 'Results', to: '/results' },
          { label: 'Celebrities', to: '/celebrity' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock.',
      }}
      eyebrow={`${data.month} Birthstone`}
      h1={data.primaryStone}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero */}
        <div className="rounded-2xl border border-border overflow-hidden mb-10">
          <div className="h-3 w-full" style={{ backgroundColor: data.hexColor }} />
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="shrink-0">
                <GemIllustration month={data.monthNumber} size={96} />
              </div>
              <div className="flex-1">
                {data.alternateStones.length > 0 && (
                  <p className="text-muted-foreground text-sm mb-3">Also: {data.alternateStones.join(' · ')}</p>
                )}
                <p className="text-muted-foreground mb-4 italic">"{data.meaning}"</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">Mohs {data.hardness}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">{data.crystalSystem}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">{data.color}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Geology Box */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">About {data.primaryStone}</h2>
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-border rounded-xl p-5 mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold text-foreground mb-1">Chemical Formula</p>
                <p className="text-muted-foreground font-mono text-xs">{data.chemicalFormula}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Crystal System</p>
                <p className="text-muted-foreground">{data.crystalSystem}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Hardness</p>
                <p className="text-muted-foreground">{data.hardness}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Color</p>
                <p className="text-muted-foreground">{data.color}</p>
              </div>
              <div className="col-span-2">
                <p className="font-semibold text-foreground mb-1">Primary Origins</p>
                <p className="text-muted-foreground">{data.origin.join(', ')}</p>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">{data.fullDescription}</p>
        </section>

        {/* History */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">History</h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-muted-foreground leading-relaxed">{data.history}</p>
          </div>
        </section>

        {/* Mythology */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Mythology & Cultural Traditions</h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-muted-foreground leading-relaxed">{data.mythology}</p>
          </div>
        </section>

        {/* Geology */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Geology & Formation</h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-muted-foreground leading-relaxed">{data.geology}</p>
          </div>
        </section>

        {/* Famous Gems */}
        {data.famousGems.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Famous {data.primaryStone}s</h2>
            <div className="space-y-4">
              {data.famousGems.map(gem => (
                <div key={gem.name} className="bg-card border border-border rounded-xl p-5">
                  <p className="font-semibold text-foreground mb-2">{gem.name}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{gem.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Fun Facts */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Did You Know?</h2>
          <div className="space-y-3">
            {data.funFacts.map((fact, i) => (
              <div key={i} className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
                <span className="text-lg shrink-0">💡</span>
                <p className="text-muted-foreground text-sm leading-relaxed">{fact}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Care Instructions */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Care Instructions</h2>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
            <p className="text-amber-800 dark:text-amber-300 text-sm leading-relaxed">{data.careInstructions}</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: `What is the birthstone for ${data.month}?`, a: `The primary birthstone for ${data.month} is ${data.primaryStone}${data.alternateStones.length ? `, with alternates including ${data.alternateStones.join(' and ')}` : ''}.` },
              { q: `What color is ${data.primaryStone}?`, a: `${data.primaryStone} is ${data.color}. Its chemical formula is ${data.chemicalFormula}.` },
              { q: `What does ${data.primaryStone} symbolize?`, a: `${data.primaryStone} symbolizes ${data.meaning}.` },
              { q: `How hard is ${data.primaryStone}?`, a: `${data.primaryStone} rates ${data.hardness} on the Mohs scale.` },
              { q: `Where is ${data.primaryStone} found?`, a: `${data.primaryStone} is primarily found in ${data.origin.join(', ')}.` },
              { q: `How should I care for ${data.primaryStone} jewelry?`, a: data.careInstructions },
            ].map(({ q, a }) => (
              <div key={q} className="bg-card border border-border rounded-xl p-5">
                <p className="font-semibold text-foreground text-sm mb-2">{q}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Other Months */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">All Birthstones by Month</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {otherMonths.map(b => (
              <Link key={b.slug} to={`/birthstone/${b.slug}`}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-center">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: b.hexColor }} />
                <span className="text-xs font-medium text-foreground">{b.month}</span>
                <span className="text-xs text-muted-foreground">{b.primaryStone}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom Links */}
        <div className="bg-muted/50 rounded-xl p-6 text-center">
          <p className="text-muted-foreground text-sm mb-4">Explore more BornClock tools</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/birthstone" className="text-sm text-primary hover:underline">All Birthstones</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/zodiac" className="text-sm text-primary hover:underline">Zodiac Signs</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/numerology" className="text-sm text-primary hover:underline">Numerology</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/" className="text-sm text-primary hover:underline">Age Calculator</Link>
          </div>
        </div>

        {/* About This Content */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300">
          <strong>About This Content:</strong> Gemological data sourced from GIA (gia.edu) and Mindat.org. Historical and cultural content draws on Kunz, G.F. (1913), <em>The Curious Lore of Precious Stones</em>. Birthstone properties described here are traditional and cultural — they are not medical claims.
        </div>
      </div>
    </CollectionLayout>
  );
}

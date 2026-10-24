/**
 * /glossary — every astrology term BornClock shows, explained in plain language
 * (Batch 5, goal b). Searchable, A–Z, with Hindi names, one SEO-friendly anchor per
 * term (/glossary#rahu-kalam) — the (i) popovers on result pages link here.
 * All content comes from the single dictionary in src/lib/vedic/termDefinitions.ts.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import { CATEGORY_LABELS, glossaryEntries, searchGlossary, type GlossaryEntry } from '@/lib/vedic/termDefinitions';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function Entry({ e }: { e: GlossaryEntry }) {
  const { def } = e;
  return (
    <article id={e.slug} data-testid={`glossary-term-${e.id}`} className="scroll-mt-24 rounded-xl border border-border p-4 target:border-[#6E5AA6] target:bg-[#6E5AA6]/5">
      <h3 className="font-semibold text-foreground">
        <a href={`#${e.slug}`} className="hover:underline">{def.term}</a>
        {def.hiTerm && <span lang="hi" className="ml-2 font-normal text-muted-foreground">{def.hiTerm}</span>}
      </h3>
      {def.category && <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">{CATEGORY_LABELS[def.category].en}</div>}
      <p className="mt-2 text-sm font-medium text-foreground">{def.impact}</p>
      {def.why && <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{def.why}</p>}
      {def.guidance && <p className="mt-1 text-sm text-[#6E5AA6]">{def.guidance}</p>}
      {def.learnMore && <p className="mt-1 text-sm text-muted-foreground">{def.learnMore}</p>}
      {def.hi && <p lang="hi" className="mt-2 text-sm text-muted-foreground border-l-2 border-border pl-2">{def.hi}</p>}
      {def.aliases && def.aliases.length > 0 && (
        <p className="mt-1 text-xs text-muted-foreground">Also called: {def.aliases.join(', ')}</p>
      )}
      {def.link && <Link to={def.link} className="mt-2 inline-block text-sm text-primary hover:underline">Go deeper →</Link>}
    </article>
  );
}

export default function GlossaryPage() {
  const [q, setQ] = useState('');
  const location = useLocation();
  const all = useMemo(() => glossaryEntries(), []);
  const results = useMemo(() => searchGlossary(q), [q]);
  const searching = q.trim().length > 0;

  // SPA navigation to /glossary#term — scroll to the anchor once rendered.
  useEffect(() => {
    const id = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    if (!id) return;
    const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'start' });
  }, [location.hash]);

  const byLetter = useMemo(() => {
    const m = new Map<string, GlossaryEntry[]>();
    for (const e of all) { if (!m.has(e.letter)) m.set(e.letter, []); m.get(e.letter)!.push(e); }
    return m;
  }, [all]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': 'https://bornclock.com/glossary',
    name: 'BornClock astrology glossary',
    hasDefinedTerm: all.map(e => ({
      '@type': 'DefinedTerm',
      '@id': `https://bornclock.com/glossary#${e.slug}`,
      name: e.def.term,
      ...(e.def.hiTerm ? { alternateName: e.def.hiTerm } : {}),
      description: [e.def.impact, e.def.why].filter(Boolean).join(' '),
      url: `https://bornclock.com/glossary#${e.slug}`,
    })),
  };

  return (
    <ToolLayout
      theme="vedic"
      testId="glossary-page"
      seo={<SEO
        title="Astrology Glossary — Every Vedic Term Explained Simply | BornClock"
        description={`Plain-language meanings of ${all.length} astrology terms — Lagna, Nakshatra, Dasha, Guna Milan kootas, Porutham, Tithi, Rahu Kaal, Choghadiya, Shadbala, Navamsa, doshas, numerology and more — with Hindi names.`}
        canonicalUrl="/glossary"
        ogImage="https://bornclock.com/og/vedic.png"
      />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Glossary' }}
      footer={{ tagline: 'Every astrology term, explained in plain language.', nav: [{ label: 'Free Kundli', to: '/kundali' }, { label: 'Kundali Matching', to: '/kundali-match' }, { label: 'Panchang', to: '/panchang' }] }}
      eyebrow="Glossary · शब्दकोश"
      h1="Astrology terms, explained simply."
      lead={`${all.length} terms you’ll see on BornClock — what each one is, and why it matters to you. Hindi names included.`}
    >
      <JsonLd data={jsonLd} id="glossary-jsonld" />
      <section className="section">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <label className="block text-sm font-medium text-foreground mb-1" htmlFor="glossary-search">Search a term (English or Hindi)</label>
          <input
            id="glossary-search"
            data-testid="glossary-search"
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="e.g. Rahu Kaal, nadi, लग्न"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            autoComplete="off"
          />

          {!searching && (
            <nav aria-label="Jump to letter" data-testid="glossary-az" className="mt-4 flex flex-wrap gap-1">
              {LETTERS.map(L => byLetter.has(L)
                ? <a key={L} href={`#letter-${L}`} className="w-8 h-8 inline-flex items-center justify-center rounded border border-border text-sm text-foreground hover:bg-primary/5">{L}</a>
                : <span key={L} aria-hidden="true" className="w-8 h-8 inline-flex items-center justify-center text-sm text-muted-foreground/40">{L}</span>)}
            </nav>
          )}

          <p className="mt-3 text-xs text-muted-foreground" aria-live="polite" data-testid="glossary-count">
            {searching ? `${results.length} matching term${results.length === 1 ? '' : 's'}` : `${all.length} terms`}
          </p>

          {searching ? (
            <div className="mt-3 space-y-3" data-testid="glossary-results">
              {results.map(e => <Entry key={e.id} e={e} />)}
              {results.length === 0 && <p className="text-sm text-muted-foreground">No term matches “{q}”. Try a shorter word.</p>}
            </div>
          ) : (
            <div className="mt-3 space-y-6" data-testid="glossary-results">
              {[...byLetter.entries()].map(([L, list]) => (
                <section key={L} aria-labelledby={`letter-${L}`}>
                  <h2 id={`letter-${L}`} className="scroll-mt-24 text-lg font-bold text-foreground mb-2">{L}</h2>
                  <div className="space-y-3">{list.map(e => <Entry key={e.id} e={e} />)}</div>
                </section>
              ))}
            </div>
          )}

          <p className="mt-8 text-xs text-muted-foreground">
            Explanations follow the classical texts (Brihat Parashara Hora Shastra and standard Panchang and matching practice) and describe tendencies, never certainties.{' '}
            <Link to="/how-it-works#vedic" className="underline">How we calculate →</Link>
          </p>
        </div>
      </section>
    </ToolLayout>
  );
}

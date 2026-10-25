/**
 * Batch 7 (W8): /baby-names/nakshatra/:slug — one page per Nakshatra (27).
 *
 * Extends the /baby-names tool (same syllable table, same name list, same matching rule)
 * rather than duplicating it: the tool asks for birth details; these pages answer
 * "baby names for <Nakshatra>" directly. Distinct per page: its four pada syllables
 * (Drik Panchang 108-pada table, nakshatraAksharas.ts), the Moon sign of each pada
 * (computed: 108 padas of 3°20′, 9 per sign), the deity and literal meaning of the
 * Nakshatra's name (Wikipedia "Nakshatra", nakshatraNameFacts.ts), and only the names
 * from our list whose first Devanagari syllable matches each pada.
 */
import { useParams, Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { TermTip } from '@/components/vedic/TermTip';
import { NAKSHATRA_PADA_AKSHARAS } from '@/data/nakshatraAksharas';
import { namesForPada, type Gender } from '@/data/babyNamesByAkshara';
import { NAKSHATRA_EXTRA, NAKSHATRA_ORDER, nakshatraBySlug, nakshatraIndexBySlug } from '@/data/nakshatraPages';
import { NAKSHATRA_NAME_FACTS, NAKSHATRA_FACTS_SOURCE } from '@/data/nakshatraNameFacts';
import { NAKSHATRA_HINDI } from '@/data/vedicTermsHindi';
import { RASHIS } from '@/lib/vedic/rashifal';

const GENDER_STYLE: Record<Gender, string> = {
  boy: 'bg-sky-100 text-sky-700',
  girl: 'bg-rose-100 text-rose-700',
  unisex: 'bg-violet-100 text-violet-700',
};

/** Moon sign of pada p (1–4) of Nakshatra index i (0–26): 108 padas, 9 per sign. */
export function padaRashi(index: number, pada: number) {
  return RASHIS[Math.floor((index * 4 + (pada - 1)) / 9)];
}

export function babyNamesTitle(name: string): string {
  const syl = NAKSHATRA_PADA_AKSHARAS[name].map(a => a.en).join(', ');
  return `${name} Nakshatra Baby Names — Letters ${syl} | BornClock`;
}

export function babyNamesDescription(name: string): string {
  const syl = NAKSHATRA_PADA_AKSHARAS[name].map(a => a.en).join(', ');
  return `Baby names for ${name} Nakshatra: the four pada starting letters ${syl}, the Moon sign of each pada, the presiding deity and names with meanings.`;
}

export default function BabyNamesNakshatraPage() {
  const { slug } = useParams<{ slug: string }>();
  const extra = slug ? nakshatraBySlug(slug) : undefined;
  const index = slug ? nakshatraIndexBySlug(slug) : -1;
  const facts = extra ? NAKSHATRA_NAME_FACTS[extra.name] : undefined;
  const row = extra ? NAKSHATRA_PADA_AKSHARAS[extra.name] : undefined;

  if (!extra || !facts || !row || index < 0) {
    return (
      <ToolLayout
        theme="neutral"
        testId="baby-names-nakshatra-page"
        seo={<SEO title="Baby Names by Nakshatra | BornClock" description="Baby-name starting letters for all 27 Nakshatras." canonicalUrl="/baby-names" />}
        breadcrumb={{ trail: [{ label: 'Baby Names', to: '/baby-names' }], current: 'Nakshatra' }}
        h1="Nakshatra not found"
      >
        <div className="container mx-auto px-4 py-8 max-w-2xl flex flex-wrap gap-2">
          {NAKSHATRA_ORDER.map(n => (
            <Link key={n} to={`/baby-names/nakshatra/${NAKSHATRA_EXTRA[n].slug}`} className="px-3 py-1.5 rounded-lg border border-border text-foreground">{n}</Link>
          ))}
        </div>
      </ToolLayout>
    );
  }

  const name = extra.name;
  const hiName = NAKSHATRA_HINDI[name] || '';
  const padas = [1, 2, 3, 4].map(p => ({ p, a: row[p - 1], rashi: padaRashi(index, p), names: namesForPada(name, p) }));
  const total = padas.reduce((s, x) => s + x.names.length, 0);
  const sylList = row.map(a => `${a.en} (${a.hi})`).join(', ');
  const signs = Array.from(new Set(padas.map(x => x.rashi.sanskrit)));
  const phalguniNote = name === 'Purva Phalguni' || name === 'Uttara Phalguni';

  const faq = [
    {
      question: `What are the baby-name letters for ${name} Nakshatra?`,
      answer: `The four padas (quarters) of ${name} begin with ${sylList}. Only one applies to your baby — the one for the pada the Moon was in at birth.`,
    },
    {
      question: `How do I know which pada of ${name} my baby was born in?`,
      answer: `The pada depends on the Moon's exact position, so it needs the birth date, exact time and place. Our free Kundali or the baby-names tool works it out from those details.`,
    },
    {
      question: `Who is the deity of ${name} Nakshatra?`,
      answer: `${name} is presided over by ${facts.deity}. The name ${name} is usually translated as "${facts.nameMeaning}".`,
    },
    {
      question: 'Must the name start with this letter?',
      answer: 'No. It is a tradition many families follow for the naming-ceremony (Namakaran) name, not a rule. Many choose a different everyday name.',
    },
  ];

  return (
    <ToolLayout
      theme="neutral"
      testId="baby-names-nakshatra-page"
      seo={(
        <SEO
          title={babyNamesTitle(name)}
          description={babyNamesDescription(name)}
          canonicalUrl={`/baby-names/nakshatra/${extra.slug}`}
        />
      )}
      breadcrumb={{ trail: [{ label: 'Baby Names', to: '/baby-names' }], current: name }}
      eyebrow={`Nakshatra ${index + 1} of 27`}
      h1={`${name} Nakshatra Baby Names`}
      lead={<>A baby born with the Moon in {name} {hiName && <span lang="hi">({hiName})</span>} is traditionally given a name starting with one of four sounds: <strong>{row.map(a => a.en).join(', ')}</strong> — one for each pada.</>}
    >
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="rounded-xl border border-border p-5 mb-6" data-testid="bnn-facts">
          <h2 className="font-semibold text-foreground mb-2">About {name}</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><strong className="text-foreground">Name means:</strong> “{facts.nameMeaning}”.</li>
            <li><strong className="text-foreground">Deity:</strong> {facts.deity}.{phalguniNote && ' (Some older texts swap the deities of the two Phalguni Nakshatras.)'}</li>
            <li><strong className="text-foreground">Stars:</strong> {facts.stars}.</li>
            <li><strong className="text-foreground">Moon sign (<TermTip id="rashi">Rashi</TermTip>):</strong> {signs.join(' / ')}{signs.length > 1 ? ' — this Nakshatra crosses two signs, so the pada decides which.' : '.'}</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            Source for name meaning, deity and stars: <a href={NAKSHATRA_FACTS_SOURCE.url} className="underline" rel="noopener" target="_blank">{NAKSHATRA_FACTS_SOURCE.label}</a>.{' '}
            <Link to={`/nakshatra/${extra.slug}`} className="underline">Full {name} profile →</Link>
          </p>
        </div>

        <h2 className="font-semibold text-foreground mb-1">Name letters by <TermTip id="pada">pada</TermTip></h2>
        <p className="text-sm text-muted-foreground mb-4">Each pada is one quarter of the Nakshatra (3°20′ of the sky). Only one of these four sounds is your baby’s — the pada needs the exact birth time.</p>
        <div className="space-y-4 mb-6">
          {padas.map(({ p, a, rashi, names }) => (
            <section key={p} data-testid="bnn-pada" className="rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Pada {p}: “{a.en}” <span lang="hi">({a.hi})</span>
                <span className="font-normal text-muted-foreground"> · Moon in {rashi.sanskrit} ({rashi.english})</span>
              </h3>
              {names.length === 0 ? (
                <p className="text-xs text-muted-foreground mt-1">Our short, checked list has no names for this sound yet. Any name that begins with the Devanagari syllable “{a.hi}” fits the tradition.</p>
              ) : (
                <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1 mt-2">
                  {names.map(n => (
                    <li key={n.name} className="text-sm flex items-baseline gap-2">
                      <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full ${GENDER_STYLE[n.gender]}`}>{n.gender}</span>
                      <span><strong className="text-foreground">{n.name}</strong> <span lang="hi" className="text-muted-foreground">{n.hi}</span> <span className="text-muted-foreground">— {n.meaning}</span></span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-6" data-testid="bnn-count">
          {total} name{total === 1 ? '' : 's'} listed for {name}. The list is deliberately short: names are matched by their first Devanagari syllable (consonant and vowel), so “Dev” (देव) counts as “De”, not “Da”.
        </p>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">Not sure of the Nakshatra or pada? Enter the birth details and we’ll work it out.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/baby-names" className="inline-flex bg-primary text-primary-foreground rounded-lg px-5 py-2.5 font-semibold">Find from birth details →</Link>
            <Link to="/kundali" className="inline-flex border border-border rounded-lg px-5 py-2.5 font-semibold text-foreground">Free Kundali</Link>
          </div>
        </div>

        <PageFAQ items={faq} />

        <h2 className="font-semibold text-foreground mb-2">Baby names for other Nakshatras</h2>
        <div className="flex flex-wrap gap-2">
          {NAKSHATRA_ORDER.filter(n => n !== name).map(n => (
            <Link key={n} to={`/baby-names/nakshatra/${NAKSHATRA_EXTRA[n].slug}`} className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-primary/5">{n}</Link>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}

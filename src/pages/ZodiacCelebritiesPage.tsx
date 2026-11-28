/**
 * B23 — /zodiac/:sign/celebrities: famous people with the Sun in this sign, Indian and global, each
 * linking to their BornClock profile ("leo celebrities", "indian celebrities with zodiac sign leo").
 * Data: src/data/celebsBySign.json (scripts/gen-celebs-by-day.mts — full birth dates only; the
 * global list is ranked by Wikipedia language editions, the Indian list is A–Z).
 */
import { useParams, Navigate } from 'react-router-dom';
import { Link } from '@/components/seo/CanonicalLink';
import { CollectionLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { getZodiacBySlug } from '@/data/zodiacData';
import celebsBySign from '@/data/celebsBySign.json';

type C = { s: string; n: string; y: number };
const DATA = celebsBySign as Record<string, { india: C[]; world: C[] }>;
const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/** Shared with scripts/prerender-titles.mjs (keep in sync). */
export function zodiacCelebritiesTitle(sign: string): string {
  const t = `${sign} Celebrities: Famous Indian & Global ${sign} Birthdays | BornClock`;
  return t.length <= 70 ? t : `${sign} Celebrities — Indian & Global | BornClock`;
}

export default function ZodiacCelebritiesPage() {
  const { sign = '' } = useParams<{ sign: string }>();
  const z = getZodiacBySlug(sign);
  const d = DATA[sign];
  if (!z || !d) return <Navigate to="/zodiac/" replace />;
  const world3 = d.world.slice(0, 3).map(c => c.n);
  const india3 = d.india.slice(0, 3).map(c => c.n);
  const title = zodiacCelebritiesTitle(z.name);
  const description = `Famous ${z.name} celebrities (${z.dateRange}): ${list([...world3.slice(0, 2), ...india3.slice(0, 2)])} and more. Indian and global ${z.name}s, each with a birthday profile.`.slice(0, 158);
  const faqs = [
    { question: `Which celebrities are ${z.name}?`, answer: `Famous ${z.name}s (born ${z.dateRange}) include ${list(d.world.slice(0, 5).map(c => c.n))}.` },
    { question: `Which Indian celebrities are ${z.name}?`, answer: d.india.length ? `Indian celebrities with the Sun in ${z.name} include ${list(d.india.slice(0, 6).map(c => c.n))}.` : `See the list on this page.` },
    { question: `How do we know their zodiac sign?`, answer: `The Western (tropical) zodiac sign comes from the date of birth alone — ${z.name} covers ${z.dateRange}. We list only people whose full birth date is on record. People born on the first or last day of a sign can be on the cusp: the exact switch time changes slightly from year to year.` },
    { question: `Is the Vedic (Rashi) sign the same?`, answer: `Usually not. The Vedic zodiac is sidereal, so most people’s Vedic Sun sign is the previous sign, and the Rashi Indians usually mean is the Moon sign. Each profile shows the Moon sign (Rashi) separately.` },
  ];
  const itemList = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: `Famous ${z.name} celebrities`,
    itemListElement: [...d.world, ...d.india].slice(0, 60).map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: `https://bornclock.com/celebrity/${c.s}/`, name: c.n })),
  };
  const Grid = ({ items }: { items: C[] }) => (
    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
      {items.map(c => (
        <li key={c.s}><Link to={`/celebrity/${c.s}/`} className="underline decoration-dotted">{c.n}</Link> <span className="text-xs text-muted-foreground">({c.y})</span></li>
      ))}
    </ul>
  );
  return (
    <CollectionLayout
      theme="birthday"
      testId="zodiac-celebrities-page"
      seo={(
        <>
          <SEO title={title} description={description} canonicalUrl={`/zodiac/${sign}/celebrities`} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
        </>
      )}
      breadcrumb={{ trail: [{ label: 'Zodiac', to: '/zodiac/' }, { label: z.name, to: `/zodiac/${sign}/` }], current: 'Celebrities' }}
      footer={{ tagline: `Famous ${z.name} birthdays.`, nav: [{ label: z.name, to: `/zodiac/${sign}/` }, { label: 'Celebrities', to: '/celebrity/' }, { label: 'Born on', to: '/born-on/' }, { label: 'Privacy', to: '/privacy/' }], note: '© 2026 BornClock · Zodiac.' }}
      eyebrow={`${z.unicode} ${z.name} · ${z.dateRange}`}
      h1={<>Famous {z.name} Celebrities — Indian &amp; Global</>}
      lead={<>Famous {z.name}s include {list(world3)}{india3.length ? <> — and in India, {list(india3)}</> : null}. Everyone here was born between {z.dateRange}.</>}
    >
      <section className="section">
        <div className="container mx-auto px-4 max-w-4xl">
          <section className="mb-10" data-testid="zodiac-celebs-world">
            <h2 className="text-2xl font-bold text-foreground mb-3">Famous {z.name} people worldwide</h2>
            <p className="text-sm text-muted-foreground mb-3">Ranked by global recognition (the number of Wikipedia language editions with an article about the person).</p>
            <Grid items={d.world} />
          </section>
          <section className="mb-10" data-testid="zodiac-celebs-india">
            <h2 className="text-2xl font-bold text-foreground mb-3">Indian celebrities with the zodiac sign {z.name}</h2>
            <p className="text-sm text-muted-foreground mb-3">Actors, cricketers, singers and leaders, A–Z.</p>
            <Grid items={d.india} />
          </section>
          <p className="text-sm mb-10">
            <Link to={`/zodiac/${sign}/`} className="text-primary underline">{z.name} traits, dates and compatibility →</Link>{' · '}
            <Link to="/celebrity-birthday/" className="text-primary underline">find your celebrity birthday twin →</Link>
          </p>
          <PageFAQ title={`${z.name} celebrities — FAQ`} items={faqs} />
        </div>
      </section>
    </CollectionLayout>
  );
}

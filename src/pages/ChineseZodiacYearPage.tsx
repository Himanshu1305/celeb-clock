/**
 * B23 — /chinese-zodiac/:year (1924–2031): "1990 chinese zodiac" and the like. Search Console showed
 * dozens of "<year> chinese zodiac" queries landing on the animal pages at positions 70–100; each
 * year now has its own answer-first page: animal, element, yin/yang, the exact start and end dates
 * (sourced table in src/lib/chineseCalendar.js), the early-year caveat, and famous people born in
 * that Chinese year (src/data/celebsByChineseYear.json).
 */
import { Navigate } from 'react-router-dom';
import { Link } from '@/components/seo/CanonicalLink';
import { CollectionLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { PageFAQ } from '@/components/PageFAQ';
import { CHINESE_ZODIAC_PROFILES } from '@/data/astrologicalData';
import celebsByYear from '@/data/celebsByChineseYear.json';
import {
  chineseYearInfo, formatIsoDateShort, CHINESE_YEAR_TABLE_FIRST, CHINESE_YEAR_TABLE_LAST, chineseYearTitle, chineseYearDescription,
} from '@/lib/chineseCalendar.js';

const ELEMENT_NOTE: Record<string, string> = {
  Wood: 'Wood years are traditionally linked with growth, generosity and new beginnings.',
  Fire: 'Fire years are traditionally linked with energy, passion and visibility.',
  Earth: 'Earth years are traditionally linked with stability, patience and practicality.',
  Metal: 'Metal years are traditionally linked with determination, discipline and strength.',
  Water: 'Water years are traditionally linked with intuition, flexibility and communication.',
};
const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

export function isChineseYearSlug(s: string | undefined): boolean {
  if (!s || !/^\d{4}$/.test(s)) return false;
  const y = Number(s);
  return y >= CHINESE_YEAR_TABLE_FIRST && y <= CHINESE_YEAR_TABLE_LAST;
}

export default function ChineseZodiacYearPage({ year }: { year: number }) {
  if (year < CHINESE_YEAR_TABLE_FIRST || year > CHINESE_YEAR_TABLE_LAST) return <Navigate to="/articles/chinese-zodiac-by-year/" replace />;
  const y = chineseYearInfo(year);
  const prev = chineseYearInfo(year - 1);
  const p = CHINESE_ZODIAC_PROFILES[y.animal];
  const people = ((celebsByYear as Record<string, Array<{ s: string; n: string }>>)[String(year)] ?? []);
  const animalSlug = y.animal.toLowerCase();
  const sameAnimal = [-24, -12, 12, 24].map(k => year + k).filter(v => v >= CHINESE_YEAR_TABLE_FIRST && v <= CHINESE_YEAR_TABLE_LAST);
  const answer = `${year} is the Year of the ${y.element} ${y.animal} (${y.yinYang}). It began on ${formatIsoDateShort(y.start!)} and ended on ${formatIsoDateShort(y.end!)}. Born between 1 January ${year} and ${formatIsoDateShort(prev.end!)}? Then your sign is the previous year’s ${prev.element} ${prev.animal}.`;
  const faqs = [
    { question: `What Chinese zodiac is ${year}?`, answer },
    { question: `What does the ${y.element} ${y.animal} mean?`, answer: `${p?.personality_summary ?? ''} ${ELEMENT_NOTE[y.element] ?? ''}`.trim() },
    { question: `Which signs are compatible with the ${y.animal}?`, answer: p ? `Traditionally the best matches for the ${y.animal} are the ${list(p.best_match)}; the hardest are the ${list(p.worst_match)}.` : `See the ${y.animal} page.` },
    ...(people.length ? [{ question: `Which famous people were born in the Year of the ${y.element} ${y.animal} (${year})?`, answer: `${list(people.slice(0, 5).map(c => c.n))} were born between ${formatIsoDateShort(y.start!)} and ${formatIsoDateShort(y.end!)}.` }] : []),
  ];
  return (
    <CollectionLayout
      theme="birthday"
      testId="chinese-zodiac-year-page"
      seo={<SEO title={chineseYearTitle(year)} description={chineseYearDescription(year)} canonicalUrl={`/chinese-zodiac/${year}`} />}
      breadcrumb={{ trail: [{ label: 'Chinese Zodiac', to: '/chinese-zodiac/' }, { label: 'By year', to: '/articles/chinese-zodiac-by-year/' }], current: String(year) }}
      footer={{ tagline: 'Chinese zodiac by year.', nav: [{ label: 'Chinese zodiac', to: '/chinese-zodiac/' }, { label: 'Year table', to: '/articles/chinese-zodiac-by-year/' }, { label: 'Privacy', to: '/privacy/' }], note: '© 2026 BornClock · Chinese zodiac.' }}
      eyebrow={`${p?.emoji ?? ''} Chinese zodiac · ${year}`}
      h1={<>{year} Chinese Zodiac: Year of the {y.element} {y.animal}</>}
      lead={<span data-testid="cz-year-answer">{answer}</span>}
    >
      <section className="section">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm border border-border rounded-xl" data-testid="cz-year-facts">
              <tbody>
                {([
                  ['Animal', y.animal], ['Element', y.element], ['Yin or Yang', y.yinYang],
                  ['Starts (Chinese New Year)', formatIsoDateShort(y.start!)], ['Ends', formatIsoDateShort(y.end!)],
                  ['Lucky numbers', p?.lucky_numbers.join(', ') ?? '—'], ['Lucky colours', p?.lucky_colors.join(', ') ?? '—'],
                  ['Best matches', p ? p.best_match.join(', ') : '—'],
                ] as const).map(([k, v]) => (
                  <tr key={k} className="border-b border-border"><th scope="row" className="text-left px-3 py-2 bg-muted/40 font-semibold w-2/5">{k}</th><td className="px-3 py-2">{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          {people.length > 0 && (
            <section className="mb-8" data-testid="cz-year-people">
              <h2 className="text-xl font-bold mb-3">Famous people born in the Year of the {y.element} {y.animal}</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {people.map(c => <li key={c.s}><Link to={`/celebrity/${c.s}/`} className="underline decoration-dotted">{c.n}</Link></li>)}
              </ul>
            </section>
          )}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-2">The {y.animal} personality</h2>
            <p className="text-muted-foreground">{p?.personality_summary} {ELEMENT_NOTE[y.element]}</p>
            <p className="mt-2 text-sm"><Link to={`/chinese-zodiac/${animalSlug}/`} className="text-primary underline">Full Year of the {y.animal} guide →</Link></p>
          </section>
          <nav className="mb-8 text-sm flex flex-wrap gap-2" aria-label="Other years">
            {year > CHINESE_YEAR_TABLE_FIRST && <Link to={`/chinese-zodiac/${year - 1}/`} className="px-3 py-1.5 rounded-lg border border-border">← {year - 1}: {prev.element} {prev.animal}</Link>}
            {year < CHINESE_YEAR_TABLE_LAST && (() => { const n = chineseYearInfo(year + 1); return <Link to={`/chinese-zodiac/${year + 1}/`} className="px-3 py-1.5 rounded-lg border border-border">{year + 1}: {n.element} {n.animal} →</Link>; })()}
            {sameAnimal.map(v => <Link key={v} to={`/chinese-zodiac/${v}/`} className="px-3 py-1.5 rounded-lg border border-border">{v} ({chineseYearInfo(v).element} {y.animal})</Link>)}
            <Link to="/articles/chinese-zodiac-by-year/" className="px-3 py-1.5 rounded-lg border border-border">All years 1924–2031</Link>
          </nav>
          <PageFAQ title={`${year} Chinese zodiac — FAQ`} items={faqs} />
          <p className="text-xs text-muted-foreground mt-4">Chinese New Year dates: the sourced table behind our <Link to="/articles/chinese-zodiac-by-year/" className="underline">Chinese zodiac by year</Link> page. The animal changes at Chinese New Year, not on 1 January.</p>
        </div>
      </section>
    </CollectionLayout>
  );
}

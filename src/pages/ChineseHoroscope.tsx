/**
 * Chinese zodiac yearly horoscope — P4-CZ-YEARLY.
 * Evergreen URL (/chinese-horoscope/:animal). The forecast YEARS are computed
 * from the current date at render time, so the page always shows "this year and
 * next" without a prerendered page per date. Grounded in the animal's real
 * relationship to each year's ruling animal (see chineseYearlyForecast.ts).
 */
import { useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { CollectionLayout } from '@/components/central';
import { SEO, FAQSchema } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import {
  getYearForecast,
  currentAndNextYear,
  type YearForecast,
  type Grade,
} from '@/services/chineseYearlyForecast';

const ANIMALS_ORDER = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'];
const ANIMAL_EMOJI: Record<string, string> = {
  rat: '🐭', ox: '🐂', tiger: '🐯', rabbit: '🐰', dragon: '🐉', snake: '🐍',
  horse: '🐴', goat: '🐐', monkey: '🐒', rooster: '🐓', dog: '🐕', pig: '🐷',
};

const GRADE_STYLE: Record<Grade, string> = {
  strong: 'bg-green-100 text-green-800',
  moderate: 'bg-blue-100 text-blue-800',
  mild: 'bg-amber-100 text-amber-800',
};

function GradeBadge({ grade }: { grade: Grade }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${GRADE_STYLE[grade]}`}>{grade}</span>;
}

function YearBlock({ cap, f }: { cap: string; f: YearForecast }) {
  const areas: [string, string, typeof f.career][] = [
    ['💼', 'Career', f.career],
    ['💰', 'Finance', f.finance],
    ['❤️', 'Love', f.love],
    ['🏃', 'Health', f.health],
  ];
  return (
    <Card className="glass-card" data-testid={`cz-forecast-${f.year}`}>
      <CardContent className="p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-3 text-foreground">{cap} in {f.year} — Year of the {f.yearElement} {f.yearAnimal}</h2>
        <p className="text-muted-foreground leading-relaxed mb-5">{f.overall}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {areas.map(([emoji, label, area]) => (
            <div key={label} className="border border-border/40 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-foreground">{emoji} {label}</h3>
                <GradeBadge grade={area.grade} />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{area.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">What to do:</strong> {f.advice}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ChineseHoroscope() {
  const { animal } = useParams<{ animal: string }>();
  const [thisYear, nextYear] = useMemo(() => currentAndNextYear(), []);

  // Index page (no animal param)
  if (!animal) {
    return (
      <CollectionLayout
        theme="mystic"
        testId="chinese-horoscope-index"
        seo={(
          <SEO
            title={`Chinese Zodiac Yearly Horoscope ${thisYear} & ${nextYear} — All 12 Animals | BornClock`}
            description={`Free Chinese zodiac yearly forecast for all 12 animals — career, finance, love and health for ${thisYear} and ${nextYear}, based on each sign's relationship to the year's ruling animal.`}
            keywords="chinese horoscope, chinese zodiac forecast, year of the horse, chinese new year predictions, chinese astrology yearly"
            canonicalUrl="/chinese-horoscope"
            ogImage="https://bornclock.com/og/zodiac.png"
          />
        )}
        breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner' }, { label: 'Chinese Zodiac', to: '/chinese-zodiac' }], current: 'Yearly Horoscope' }}
        footer={{
          tagline: `Chinese zodiac yearly forecast for ${thisYear} and ${nextYear} — career, finance, love and health for every animal.`,
          nav: [
            { label: 'Chinese Zodiac', to: '/chinese-zodiac' },
            { label: 'Mystic Corner', to: '/mystic-corner' },
            { label: 'Western Birth Chart', to: '/western-birth-chart' },
            { label: 'Privacy', to: '/privacy' },
          ],
          note: '© 2026 BornClock · Calculated, not templated.',
        }}
        eyebrow="Chinese Astrology"
        h1={`Chinese Zodiac Yearly Horoscope`}
        lead={`Career, finance, love and health for ${thisYear} and ${nextYear} — pick your animal.`}
      >
        <section className="section container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
            {ANIMALS_ORDER.map((a) => (
              <Link
                key={a}
                to={`/chinese-horoscope/${a}`}
                className="flex flex-col items-center p-5 rounded-xl border border-border hover:bg-muted transition-colors"
              >
                <span className="text-4xl mb-2">{ANIMAL_EMOJI[a]}</span>
                <span className="font-semibold capitalize text-foreground">{a}</span>
                <span className="text-xs text-muted-foreground">{thisYear} &amp; {nextYear} forecast →</span>
              </Link>
            ))}
          </div>
        </section>
      </CollectionLayout>
    );
  }

  const slug = animal.toLowerCase();
  if (!ANIMALS_ORDER.includes(slug)) return <Navigate to="/chinese-horoscope" replace />;
  const cap = slug.charAt(0).toUpperCase() + slug.slice(1);
  const fThis = getYearForecast(cap, thisYear);
  const fNext = getYearForecast(cap, nextYear);

  const faqItems = [
    { question: `What is the ${cap}'s forecast for ${thisYear}?`, answer: fThis.overall },
    { question: `What is the ${cap}'s outlook for ${nextYear}?`, answer: fNext.overall },
    { question: 'How is this forecast calculated?', answer: `Chinese astrology reads each year through the relationship between your animal and the year's ruling animal — allies (the San He trine), secret friends (Liu He), the clash (the opposite sign), and your own zodiac year. This forecast is built from that relationship, not a generic template.` },
  ];

  return (
    <CollectionLayout
      theme="mystic"
      testId="chinese-horoscope-animal"
      seo={(
        <SEO
          title={`${cap} Horoscope ${thisYear} & ${nextYear} — Career, Love, Money, Health | BornClock`}
          description={`${cap} Chinese zodiac yearly forecast: career, finance, love and health for ${thisYear} and ${nextYear}, based on the ${cap}'s relationship to each year's ruling animal. Graded, honest, free.`}
          keywords={`${slug} horoscope ${thisYear}, ${slug} chinese zodiac forecast, ${slug} ${nextYear}, year of the ${slug}`}
          canonicalUrl={`/chinese-horoscope/${slug}`}
          ogImage="https://bornclock.com/og/zodiac.png"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Chinese Zodiac', to: '/chinese-zodiac' }, { label: 'Yearly Horoscope', to: '/chinese-horoscope' }], current: `${cap} Horoscope` }}
      footer={{
        tagline: `${cap} Chinese zodiac yearly forecast for ${thisYear} and ${nextYear}.`,
        nav: [
          { label: 'All Animals', to: '/chinese-horoscope' },
          { label: `${cap} Sign Guide`, to: `/chinese-zodiac/${slug}` },
          { label: 'Chinese Zodiac', to: '/chinese-zodiac' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · A reflective tradition, not a prediction.',
      }}
      eyebrow="Chinese Zodiac Horoscope"
      h1={`${ANIMAL_EMOJI[slug]} ${cap} Yearly Horoscope`}
      lead={`${cap}: your ${thisYear} and ${nextYear} forecast — career, finance, love and health.`}
    >
      <FAQSchema items={faqItems} />
      <section className="section container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <YearBlock cap={cap} f={fThis} />
          <YearBlock cap={cap} f={fNext} />

          <div className="rounded-lg bg-muted/40 p-5 text-sm text-muted-foreground">
            Want the full {cap} personality, compatibility and lucky elements?{' '}
            <Link to={`/chinese-zodiac/${slug}`} className="underline text-foreground">See the {cap} sign guide →</Link>
          </div>

          <Card className="glass-card">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4 text-foreground">Browse another animal</h2>
              <div className="flex flex-wrap gap-2">
                {ANIMALS_ORDER.filter((a) => a !== slug).map((a) => (
                  <Link key={a} to={`/chinese-horoscope/${a}`} className="px-3 py-1 rounded-full border border-border text-sm hover:bg-muted capitalize">
                    {ANIMAL_EMOJI[a]} {a}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </CollectionLayout>
  );
}

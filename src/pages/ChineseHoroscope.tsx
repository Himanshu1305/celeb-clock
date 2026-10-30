/**
 * Chinese zodiac yearly horoscope — P4-CZ-YEARLY.
 * Evergreen URL (/chinese-horoscope/:animal). The forecast YEARS are computed
 * from the current date at render time, so the page always shows "this year and
 * next" without a prerendered page per date. Grounded in the animal's real
 * relationship to each year's ruling animal (see chineseYearlyForecast.ts).
 */
import { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Link } from '@/components/seo/CanonicalLink';
import { CollectionLayout } from '@/components/central';
import { SEO, FAQSchema } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import {
  getYearForecast,
  currentAndNextYear,
  type YearForecast,
  type Grade,
} from '@/services/chineseYearlyForecast';
import {
  chineseYearInfo,
  chineseHoroscopeAnimalTitle,
  chineseHoroscopeIndexTitle,
  chineseHoroscopeIndexDescription,
} from '@/lib/chineseCalendar.js';
import { TermTip } from '@/components/vedic/TermTip';

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
        <h2 className="text-2xl font-bold mb-1 text-foreground">{cap} in {f.year} — Year of the {f.yearElement} {f.yearAnimal}</h2>
        <p className="text-xs text-muted-foreground mb-3">{chineseYearInfo(f.year).rangeLabel}</p>
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

/**
 * Batch 9b: the FAQ answers that go into FAQPage JSON-LD are also SHOWN on the page
 * (Google only allows FAQ markup for questions visible to the reader).
 */
function VisibleFaq({ items, testId }: { items: { question: string; answer: string }[]; testId: string }) {
  return (
    <Card className="glass-card" data-testid={testId}>
      <CardContent className="p-6 md:p-8">
        <h2 className="text-xl font-bold mb-4 text-foreground">Frequently asked questions</h2>
        <div className="space-y-5">
          {items.map((f) => (
            <div key={f.question}>
              <h3 className="font-semibold text-foreground mb-1">{f.question}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ChineseHoroscope() {
  const { animal } = useParams<{ animal: string }>();
  // Chinese years (change at Chinese New Year, not 1 January).
  const [thisYear, nextYear] = useMemo(() => currentAndNextYear(), []);
  const cur = chineseYearInfo(thisYear);
  const nxt = chineseYearInfo(nextYear);

  // Index page (no animal param) — THE yearly page for the current Chinese year.
  if (!animal) {
    const indexFaq = [
      { question: `What Chinese zodiac year is ${thisYear}?`, answer: `${thisYear} is the Year of the ${cur.element} ${cur.animal} (${cur.yinYang}). It runs ${cur.rangeLabel}, from Chinese New Year to the day before the next Chinese New Year.` },
      { question: `When does the Year of the ${cur.element} ${cur.animal} end?`, answer: `It ends on ${cur.rangeLabel.split(' – ')[1]}. The Year of the ${nxt.element} ${nxt.animal} begins the next day and runs ${nxt.rangeLabel}.` },
      { question: `What is the Chinese zodiac animal for ${nextYear}?`, answer: `${nextYear} is the Year of the ${nxt.element} ${nxt.animal} (${nxt.rangeLabel}). Someone born in January or early February ${nextYear}, before Chinese New Year, still belongs to the ${cur.animal}.` },
    ];
    return (
      <CollectionLayout
        theme="mystic"
        testId="chinese-horoscope-index"
        seo={(
          <SEO
            title={chineseHoroscopeIndexTitle(thisYear)}
            description={chineseHoroscopeIndexDescription(thisYear)}
            keywords={`${thisYear} chinese zodiac, year of the ${cur.element.toLowerCase()} ${cur.animal.toLowerCase()}, chinese horoscope ${thisYear}, chinese new year ${nextYear}, chinese zodiac forecast`}
            canonicalUrl="/chinese-horoscope"
            ogImage="https://bornclock.com/og/zodiac.png"
          />
        )}
        breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner/' }, { label: 'Chinese Zodiac', to: '/chinese-zodiac/' }], current: 'Yearly Horoscope' }}
        footer={{
          tagline: `Chinese zodiac yearly forecast for ${thisYear} and ${nextYear} — career, finance, love and health for every animal.`,
          nav: [
            { label: 'Chinese Zodiac', to: '/chinese-zodiac/' },
            { label: 'Mystic Corner', to: '/mystic-corner/' },
            { label: 'Western Birth Chart', to: '/western-birth-chart/' },
            { label: 'Privacy', to: '/privacy/' },
          ],
          note: '© 2026 BornClock · Calculated, not templated.',
        }}
        eyebrow="Chinese Astrology"
        h1={`${thisYear} Chinese Zodiac: Year of the ${cur.element} ${cur.animal}`}
        lead={`The Year of the ${cur.element} ${cur.animal} runs ${cur.rangeLabel}. Pick your animal for its ${thisYear} and ${nextYear} forecast — career, money, love and health.`}
      >
        <FAQSchema items={indexFaq} />
        <section className="section container mx-auto px-4 pt-8">
          <Card className="glass-card max-w-3xl mx-auto" data-testid="cz-current-year">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-3 text-foreground">The {thisYear} Chinese year at a glance</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div><dt className="inline text-muted-foreground">Animal: </dt><dd className="inline font-semibold text-foreground">{cur.animal}</dd></div>
                <div><dt className="inline text-muted-foreground"><TermTip id="chineseElement">Element</TermTip>: </dt><dd className="inline font-semibold text-foreground">{cur.element}</dd></div>
                <div><dt className="inline text-muted-foreground"><TermTip id="yinYang">Yin / Yang</TermTip>: </dt><dd className="inline font-semibold text-foreground">{cur.yinYang}</dd></div>
                <div><dt className="inline text-muted-foreground">Dates: </dt><dd className="inline font-semibold text-foreground">{cur.rangeLabel}</dd></div>
              </dl>
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                The animal year begins at Chinese New Year, not on 1 January. The next year, the {nxt.element} {nxt.animal}, runs {nxt.rangeLabel}.
                {' '}Find any year's animal in the <Link to="/articles/chinese-zodiac-by-year/" className="underline text-foreground">Chinese zodiac by year table</Link>.
              </p>
            </CardContent>
          </Card>
        </section>
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
        <section className="section container mx-auto px-4 pb-8">
          <div className="max-w-3xl mx-auto">
            <VisibleFaq items={indexFaq} testId="cz-index-faq" />
          </div>
        </section>
      </CollectionLayout>
    );
  }

  const slug = animal.toLowerCase();
  if (!ANIMALS_ORDER.includes(slug)) return <Navigate to="/chinese-horoscope/" replace />;
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
          title={chineseHoroscopeAnimalTitle(cap, thisYear)}
          description={`${cap} Chinese zodiac yearly forecast: career, finance, love and health for ${thisYear} and ${nextYear}, based on the ${cap}'s relationship to each year's ruling animal. Graded, honest, free.`}
          keywords={`${slug} horoscope ${thisYear}, ${slug} chinese zodiac forecast, ${slug} ${nextYear}, year of the ${slug}`}
          canonicalUrl={`/chinese-horoscope/${slug}`}
          ogImage="https://bornclock.com/og/zodiac.png"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Chinese Zodiac', to: '/chinese-zodiac/' }, { label: 'Yearly Horoscope', to: '/chinese-horoscope/' }], current: `${cap} Horoscope` }}
      footer={{
        tagline: `${cap} Chinese zodiac yearly forecast for ${thisYear} and ${nextYear}.`,
        nav: [
          { label: 'All Animals', to: '/chinese-horoscope/' },
          { label: `${cap} Sign Guide`, to: `/chinese-zodiac/${slug}` },
          { label: 'Chinese Zodiac', to: '/chinese-zodiac/' },
          { label: 'Privacy', to: '/privacy/' },
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

          <VisibleFaq items={faqItems} testId="cz-animal-faq" />

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

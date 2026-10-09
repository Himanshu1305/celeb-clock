/**
 * Full Western (tropical) natal chart — P4-WESTERN-CHART.
 * Sun / Moon / Rising + all planets in signs & houses + major aspects, each with
 * a plain-language interpretation. Computed client-side from the shared
 * astronomy engine (no network, no rate limit). Real-use: enter birth details,
 * submit, the real chart renders.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO, FAQSchema } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import {
  generateWesternChart,
  localToUTC,
  formatSignPosition,
  SIGN_GLYPHS,
  type WesternChart,
} from '@/lib/western/westernChart';
import {
  PLANET_META,
  HOUSE_MEANINGS,
  planetInSign,
  planetInHouse,
  aspectLine,
  bigThreeReading,
} from '@/data/westernChartData';

const FAQ_ITEMS = [
  {
    question: 'What is a Western birth chart?',
    answer:
      'A Western (tropical) natal chart maps where the Sun, Moon, Rising sign and planets were at your exact moment of birth, using the tropical zodiac tied to the seasons. It is the system used across Europe and the Americas, and differs from the Vedic (sidereal) chart by the ayanamsa.',
  },
  {
    question: 'What are the "big three" — Sun, Moon and Rising?',
    answer:
      'Your Sun sign is your core identity, your Moon sign is your emotional inner world, and your Rising sign (Ascendant) is how you meet the world and sets the layout of your houses. Together they give a fuller picture than the Sun sign alone.',
  },
  {
    question: 'Why do I need my birth time and place?',
    answer:
      'The Rising sign and the house positions change every few minutes and depend on where you were born. Without an accurate birth time we can still show your planets in signs, but the Ascendant and houses need the time and place.',
  },
  {
    question: 'Is this the same as my daily horoscope?',
    answer:
      'No. A daily horoscope is based only on your Sun sign. Your birth chart is unique to your exact date, time and place of birth — it is calculated, not a generic table.',
  },
];

function PositionBadge({ longitude, retrograde }: { longitude: number; retrograde?: boolean }) {
  return (
    <span className="whitespace-nowrap font-medium text-foreground">
      {formatSignPosition(longitude)}
      {retrograde ? <span className="ml-1 text-xs text-amber-600" title="Retrograde">℞</span> : null}
    </span>
  );
}

function ChartResult({ chart, name }: { chart: WesternChart; name: string }) {
  const who = name ? `${name}'s` : 'Your';
  return (
    <div data-testid="western-chart-result" className="max-w-4xl mx-auto space-y-8">
      {chart.warnings.map((w) => (
        <div key={w.code} className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          {w.message}
        </div>
      ))}

      {/* The Big Three */}
      <Card className="glass-card">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 text-foreground">{who} Big Three</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                {SIGN_GLYPHS[chart.sun.sign]} Sun in {chart.sun.sign} · {formatSignPosition(chart.sun.longitude)}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{bigThreeReading('Sun', chart.sun.signIndex)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                {SIGN_GLYPHS[chart.moon.sign]} Moon in {chart.moon.sign} · {formatSignPosition(chart.moon.longitude)}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{bigThreeReading('Moon', chart.moon.signIndex)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                {SIGN_GLYPHS[chart.ascendant.sign]} {chart.ascendant.sign} Rising · {formatSignPosition(chart.ascendant.longitude)}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{bigThreeReading('Rising', chart.ascendant.signIndex)}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Western astrology reads your chart as a whole — the sections below show each planet, house and aspect.
          </p>
        </CardContent>
      </Card>

      {/* Planets in signs & houses */}
      <Card className="glass-card">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Planets in Signs &amp; Houses</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="western-placements-table">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border/60">
                  <th className="py-2 pr-4">Planet</th>
                  <th className="py-2 pr-4">Position</th>
                  <th className="py-2">House</th>
                </tr>
              </thead>
              <tbody>
                {chart.placements.map((p) => (
                  <tr key={p.name} className="border-b border-border/30 last:border-0">
                    <td className="py-2 pr-4 font-medium text-foreground">
                      {PLANET_META[p.name]?.glyph} {p.name}
                    </td>
                    <td className="py-2 pr-4"><PositionBadge longitude={p.longitude} retrograde={p.retrograde} /></td>
                    <td className="py-2">{p.house}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-5">
            {chart.placements.map((p) => {
              const sign = planetInSign(p.name, p.signIndex);
              return (
                <div key={p.name} className="border-b border-border/30 pb-4 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    {PLANET_META[p.name]?.glyph} {sign.headline} · {HOUSE_MEANINGS[p.house - 1].title.split(' — ')[0]}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{sign.body}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed mt-1">{planetInHouse(p.name, p.house)}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Houses */}
      <Card className="glass-card">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Your Houses</h2>
          <p className="text-xs text-muted-foreground mb-4">
            House system: {chart.houseSystem === 'placidus' ? 'Placidus (time-sensitive)' : 'Whole-sign (polar fallback)'}.
            The Ascendant begins the 1st house; the Midheaven ({formatSignPosition(chart.midheaven.longitude)}) tops the 10th.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {chart.houses.map((h) => (
              <div key={h.house} className="flex items-start gap-3 text-sm">
                <span className="font-semibold text-foreground w-28 shrink-0">{HOUSE_MEANINGS[h.house - 1].title.split(' — ')[1]}</span>
                <span className="text-muted-foreground">
                  {SIGN_GLYPHS[h.sign]} {formatSignPosition(h.cuspLongitude)} — {HOUSE_MEANINGS[h.house - 1].affects}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aspects */}
      <Card className="glass-card">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Major Aspects</h2>
          {chart.aspects.length === 0 ? (
            <p className="text-muted-foreground text-sm">No major aspects within orb — an unusually spacious chart.</p>
          ) : (
            <div className="space-y-3" data-testid="western-aspects">
              {chart.aspects.map((a, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium text-foreground">{a.a} {a.type} {a.b}</span>
                  <span className="text-xs text-muted-foreground ml-2">(orb {a.orb}°)</span>
                  <p className="text-muted-foreground leading-relaxed">{aspectLine(a.a, a.b, a.type)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg bg-muted/40 p-5 text-sm text-muted-foreground">
        Want the Indian (Vedic) view of the same birth?{' '}
        <Link to="/kundali" className="underline text-foreground">Generate your Kundli →</Link>
      </div>
    </div>
  );
}

export default function WesternBirthChart() {
  const [chart, setChart] = useState<WesternChart | null>(null);
  const [name, setName] = useState('');
  const [failed, setFailed] = useState(false);

  const generate = (details: BirthDetails) => {
    setFailed(false);
    try {
      const utc = localToUTC(details.dob, details.time, details.city.tz);
      const result = generateWesternChart(utc, details.city.lat, details.city.lon);
      setChart(result);
      setName(details.name ?? '');
    } catch {
      setChart(null);
      setFailed(true);
    }
  };

  return (
    <ToolLayout
      theme="mystic"
      testId="western-birth-chart-page"
      seo={(
        <SEO
          title="Free Western Birth Chart — Sun, Moon, Rising & Houses | BornClock"
          description="Calculate your full Western (tropical) natal chart free: Sun, Moon and Rising signs, every planet in its sign and house, and your major aspects — each with a plain-language reading."
          keywords="western birth chart, natal chart, free birth chart, sun moon rising, ascendant calculator, astrology houses, aspects"
          canonicalUrl="/western-birth-chart"
          ogImage="https://bornclock.com/og/zodiac.png"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner' }, { label: 'Zodiac', to: '/zodiac' }], current: 'Western Birth Chart' }}
      footer={{
        tagline: 'Your full Western natal chart — Sun, Moon, Rising, planets, houses and aspects, calculated from your exact birth details.',
        nav: [
          { label: 'Mystic Corner', to: '/mystic-corner' },
          { label: 'Zodiac Signs', to: '/zodiac' },
          { label: 'Chinese Zodiac', to: '/chinese-zodiac' },
          { label: 'Kundli (Vedic)', to: '/kundali' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Calculated, not templated.',
      }}
      eyebrow="Western Astrology"
      h1="Free Western Birth Chart"
      lead="Sun, Moon, Rising and every planet in its sign and house — with a plain-language reading."
      trust="Calculated from your exact birth date, time and place — not a generic Sun-sign table."
      trustHref="/how-it-works"
    >
      <FAQSchema items={FAQ_ITEMS} />
      <section className="section container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto mb-10">
          <BirthDetailsForm submitLabel="Calculate my birth chart" onSubmit={generate} testIdPrefix="western" />
          {failed && (
            <p data-testid="western-error" className="mt-3 text-sm text-red-600 text-center">
              Sorry — we couldn’t calculate that chart. Please check the birth time and place and try again.
            </p>
          )}
        </div>

        {chart && <ChartResult chart={chart} name={name} />}

        {!chart && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="glass-card">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold mb-3 text-foreground">What your birth chart reveals</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  Where a daily horoscope only knows your Sun sign, a full natal chart maps every planet to the exact
                  sky at your birth. You’ll see your <strong>Sun</strong> (core identity), <strong>Moon</strong>
                  {' '}(emotional nature) and <strong>Rising</strong> sign (how you meet the world), then every planet in
                  its sign and house, and the major aspects between them — each explained in plain language.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Enter your birth date, time and city above to calculate it instantly and privately in your browser.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold mb-4 text-foreground">Frequently Asked Questions</h2>
                <div className="space-y-5">
                  {FAQ_ITEMS.map((f, i) => (
                    <div key={i} className="border-b border-border/40 pb-4 last:border-0 last:pb-0">
                      <h3 className="font-semibold text-foreground mb-1">{f.question}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{f.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </ToolLayout>
  );
}

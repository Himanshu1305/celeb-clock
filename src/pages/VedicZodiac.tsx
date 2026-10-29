import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CollectionLayout } from '@/components/central';
import { SEO, FAQSchema } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { DobInput, toISODate } from '@/components/DobInput';
import { SavedDateOffer } from '@/components/SavedDateOffer';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { VEDIC_SIGNS, compareZodiacs, currentAyanamsaDeg } from '@/services/VedicZodiacService';
import { describeAlternatives } from '@/lib/vedic/dateOnlyMoonSign';

// N12: the ayanamsa shown is the engine's live Lahiri value, not a fixed 23.85°.
const AYANAMSA_NOW = currentAyanamsaDeg().toFixed(2);
import { RASHI_NAME_TO_SLUG } from '@/services/VedicZodiacExtended';

const FAQ_ITEMS = [
  {
    question: 'What is the Vedic Zodiac?',
    answer: 'The Vedic Zodiac (Jyotish) uses the sidereal coordinate system, which is based on the actual positions of stars. It uses the same 12 signs as Western astrology but shifted backward by about 24 degrees (called the ayanamsa). This means your Vedic (sidereal) Sun sign is often one sign earlier than your Western sun sign. Your Rashi in Indian astrology is something else: the sign of the Moon at birth.',
  },
  {
    question: 'What is a Rashi?',
    answer: 'Rashi (राशि) is the Sanskrit word for zodiac sign. In Vedic astrology, your Rashi is the sign that the Moon was in at the time of your birth, measured in the sidereal (star-based) zodiac. It is not your Western sun sign with a Sanskrit name: the Moon changes sign every two to three days, so your Rashi can be any of the 12 signs. BornClock shows the Moon sign for your birth date; if the Moon changed sign that day, both are shown and your birth time decides.',
  },
  {
    question: 'Why is my Vedic sign different from my Western sign?',
    answer: 'Due to a phenomenon called "precession of the equinoxes," the tropical zodiac (used in Western astrology) and the sidereal zodiac (used in Vedic astrology) have drifted apart by about 24 degrees over two thousand years. This offset is called the ayanamsa. Most people with birthdays near the end of a Western sign will find their Vedic Sun sign is the previous sign. (Your Rashi, the Moon sign, is separate.)',
  },
  {
    question: 'What is the ayanamsa?',
    answer: `Ayanamsa is the angular difference between the tropical (Western) zodiac and the sidereal (Vedic) zodiac at any given point in time. Currently about ${AYANAMSA_NOW}° (Lahiri), it increases by about 50 arc-seconds per year as Earth's axis precesses.`,
  },
  {
    question: 'What are Nakshatras?',
    answer: 'Nakshatras are 27 lunar mansions used in Vedic astrology. Each nakshatra spans 13°20\' of the zodiac and has its own deity, symbol, and qualities. A complete Vedic chart also considers the nakshatra of the Moon at birth. BornClock shows your Moon sign (Rashi) for your birth date; the exact nakshatra and pada need your birth time and place (use the free Kundali).',
  },
  {
    question: 'Which system is more accurate — Western or Vedic?',
    answer: 'Neither is objectively "more accurate" — they are different philosophical frameworks. Western astrology (tropical) aligns signs with seasons, which has cultural and psychological depth. Vedic astrology (sidereal) aligns signs with the fixed stars. Both are calculated precisely — they simply measure from different reference points (the equinox versus the stars). Many people find value in both systems.',
  },
];

export default function VedicZodiac() {
  const [dob, setDob] = useState('');
  const result = dob ? compareZodiacs(new Date(dob + 'T12:00:00')) : null;

  return (
    <CollectionLayout
      theme="vedic"
      testId="vedic-zodiac-page"
      seo={(
        <SEO
          title="Indian Zodiac (Vedic Rashi) Calculator — Find Your Jyotish Sign | BornClock"
          description="Calculate your Vedic Rashi (Indian zodiac sign) using the sidereal Jyotish system. Compare your Western and Vedic signs and explore all 12 rashis with their ruling planets and Ayurveda connections."
          canonicalUrl="/vedic-zodiac"
          keywords="vedic zodiac, rashi calculator, vedic astrology, jyotish, sidereal zodiac, indian astrology, ayanamsa, indian zodiac sign"
          ogImage="https://bornclock.com/og/zodiac.png"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Indian Zodiac (Vedic)' }}
      footer={{
        tagline: 'Calculate your Indian zodiac sign (Rashi) using the ancient Jyotish sidereal system.',
        nav: [
          { label: 'Vedic Astrology', to: '/vedic-astrology' },
          { label: 'Kundali', to: '/kundali' },
          { label: 'Moon Sign', to: '/moon-sign' },
          { label: 'Gemstones (chart-based)', to: '/gemstones' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Vedic astrology, computed with care.',
      }}
      eyebrow="Vedic Rashi — Jyotish Astrology"
      h1="Indian Zodiac Calculator"
      lead={(
        <>
          Calculate your Indian zodiac sign (Rashi) using the ancient Jyotish sidereal system.
          Compare it with your Western sign — many people discover they are different.
        </>
      )}
    >
      <FAQSchema items={FAQ_ITEMS} />

      <section className="section container mx-auto px-4 py-8 max-w-5xl">

        {/* Jyotish Authority Box */}
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border border-orange-200 rounded-xl p-5 mb-8 max-w-3xl mx-auto">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📿</span>
            <div>
              <p className="text-sm font-bold text-orange-900 mb-1">About Jyotish — Ancient Indian Astrology</p>
              <p className="text-xs text-orange-800 leading-relaxed">
                Jyotish (ज्योतिष) is one of the Vedangas — the six auxiliary disciplines of the Vedas.
                It uses the <strong>sidereal zodiac</strong> corrected for the precession of equinoxes
                (Lahiri ayanamsa ≈ {AYANAMSA_NOW}° today). The Western tropical zodiac is just as precise — it measures from the spring equinox instead of the stars, so the two use different reference points.
                Your Vedic (sidereal) Sun sign is typically one sign earlier than your Western sun sign;
                your Rashi is the Moon's sign, shown separately below.
              </p>
            </div>
          </div>
        </div>

        {/* Calculator */}
        <Card className="glass-card max-w-md mx-auto mb-10">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dob-day">Enter Your Date of Birth</Label>
              <SavedDateOffer dobIso={dob} onUseSaved={setDob} prefix="vedic-zodiac" />
              <DobInput label="" value={dob ? { day: dob.slice(8, 10), month: dob.slice(5, 7), year: dob.slice(0, 4) } : undefined} onValidChange={d => setDob(d ? toISODate(d) : '')} />
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <div className="max-w-3xl mx-auto mb-12 animate-fade-in-up">
            {/* Side-by-side comparison */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Western */}
              <Card className="glass-card">
                <CardContent className="p-6 text-center">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Sun sign (Western, tropical)</div>
                  <div className="text-4xl mb-2">
                    {VEDIC_SIGNS.find(s => s.english === result.westernSign)?.symbol || '⭐'}
                  </div>
                  <div className="text-2xl font-bold text-foreground">{result.westernSign}</div>
                  <div className="text-sm text-muted-foreground mt-1">Season-based</div>
                </CardContent>
              </Card>

              {/* Vedic */}
              <Card className="glass-card border-primary/30">
                <CardContent className="p-6 text-center">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Sun sign (Vedic, sidereal)</div>
                  <div className="text-4xl mb-2">{result.vedicRashi.emoji}</div>
                  <div className="text-2xl font-bold text-foreground">{result.vedicRashi.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.vedicRashi.english} · {result.vedicRashi.ruling_planet}</div>
                </CardContent>
              </Card>
            </div>

            {/* Comparison note */}
            <Card className={`glass-card mb-6 ${result.isSame ? 'border-green-500/30' : 'border-amber-500/30'}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{result.isSame ? '✅' : '🔄'}</span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.note}</p>
                </div>
              </CardContent>
            </Card>

            {/* Moon sign (Rashi) — Batch 6: the real Rashi is the Moon's sidereal sign */}
            {result.moonRashis.length > 0 && (
              <Card className="glass-card mb-6 border-primary/30" data-testid="vedic-zodiac-moon-rashi">
                <CardContent className="p-5 text-center">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Your Rashi (Moon sign)</div>
                  <div className="text-2xl font-bold text-foreground">
                    {describeAlternatives(result.moonRashis.map(r => r.name))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {result.moonRashis.length > 1
                      ? 'The Moon changed sign during your birth date (00:00–23:59 IST), so your birth time decides which one is yours. '
                      : 'The Moon stayed in this sign for the whole of your birth date (00:00–23:59 IST), so it does not depend on your birth time. '}
                    For the exact chart with birth time and place, use the <Link to="/kundali" className="underline">free Kundali</Link>.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Rashi (Moon sign) detail */}
            {result.moonRashis.map(sign => (
            <Card key={sign.name} className="glass-card card-party-border mb-4">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-3">{sign.emoji}</div>
                  <h2 className="text-2xl font-bold text-foreground">{sign.name} ({sign.english}) Moon</h2>
                  <p className="text-muted-foreground mt-1">{sign.element} · {sign.quality} · Ruled by {sign.ruling_planet}</p>
                </div>

                <p className="text-foreground mb-6 leading-relaxed text-center">{sign.description}</p>

                <div className="flex justify-center gap-3 flex-wrap mb-4">
                  <Badge variant="secondary">🌿 {sign.element}</Badge>
                  <Badge variant="secondary">🪐 {sign.ruling_planet}</Badge>
                  <Badge variant="secondary">{sign.symbol} {sign.quality}</Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3 text-center">Key Traits</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {sign.traits.map(trait => (
                      <span key={trait} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}

            {/* Nakshatra honest note */}
            <Card className="glass-card mt-4 border-blue-500/20">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground text-center">
                  <strong className="text-foreground">Note on Nakshatras:</strong> This calculator works from your birth date only.
                  A complete Vedic chart (including Nakshatra, Lagna/Ascendant, and planetary positions)
                  requires your exact birth time and location. Consult a Jyotishi for a full reading.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* All 12 Rashis Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center text-foreground mb-6">
            All 12 Vedic Rashis
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {VEDIC_SIGNS.map(sign => {
              const isUserSign = !!result?.moonRashis.some(r => r.name === sign.name);
              const slug = RASHI_NAME_TO_SLUG[sign.name] ?? sign.name.toLowerCase();
              return (
                <Link key={sign.name} to={`/vedic-zodiac/${slug}`}>
                  <Card
                    className={`glass-card text-center p-4 transition-all hover:border-primary/50 cursor-pointer ${
                      isUserSign ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''
                    }`}
                  >
                    <div className="text-3xl mb-1">{sign.emoji}</div>
                    <div className="font-bold text-foreground text-sm">{sign.name}</div>
                    <div className="text-xs text-muted-foreground">{sign.english}</div>
                    <div className="text-xs text-muted-foreground mt-1">{sign.ruling_planet}</div>
                    {isUserSign && (
                      <Badge className="mt-2 text-xs">{result && result.moonRashis.length > 1 ? 'Possible Rashi' : 'Your Rashi'}</Badge>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map(item => (
              <Card key={item.question} className="glass-card">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground mb-2">{item.question}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center pb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Explore More</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/chinese-zodiac" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity">
              🐉 Chinese Zodiac
            </Link>
            <Link to="/zodiac" className="px-5 py-2.5 bg-accent/10 text-accent rounded-xl font-medium hover:bg-accent/20 transition-colors border border-accent/30">
              ♈ Western Zodiac
            </Link>
            <Link to="/" className="px-5 py-2.5 bg-muted text-muted-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors">
              🎂 Birthday Calculator
            </Link>
          </div>
        </section>
      </section>
    </CollectionLayout>
  );
}

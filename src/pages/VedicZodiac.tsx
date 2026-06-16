import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO, FAQSchema } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { VEDIC_SIGNS, getVedicRashi, compareZodiacs } from '@/services/VedicZodiacService';
import { RASHI_NAME_TO_SLUG } from '@/services/VedicZodiacExtended';

const FAQ_ITEMS = [
  {
    question: 'What is the Vedic Zodiac?',
    answer: 'The Vedic Zodiac (Jyotish) uses the sidereal coordinate system, which is based on the actual positions of stars. It uses the same 12 signs as Western astrology but shifted backward by approximately 23–24 degrees (called the ayanamsa). This means your Vedic Rashi is often one sign earlier than your Western sun sign.',
  },
  {
    question: 'What is a Rashi?',
    answer: 'Rashi (राशि) is the Sanskrit word for zodiac sign. In Vedic astrology, your Rashi is the sign that the Sun was in at the time of your birth, calculated using the sidereal (star-based) zodiac rather than the tropical (season-based) Western zodiac.',
  },
  {
    question: 'Why is my Vedic sign different from my Western sign?',
    answer: 'Due to a phenomenon called "precession of the equinoxes," the tropical zodiac (used in Western astrology) and the sidereal zodiac (used in Vedic astrology) have drifted apart by about 23–24 degrees over two thousand years. This offset is called the ayanamsa. Most people with birthdays near the end of a Western sign will find their Vedic Rashi is the previous sign.',
  },
  {
    question: 'What is the ayanamsa?',
    answer: 'Ayanamsa is the angular difference between the tropical (Western) zodiac and the sidereal (Vedic) zodiac at any given point in time. Currently around 23.85 degrees, it increases by about 50 arc-seconds per year as Earth\'s axis precesses.',
  },
  {
    question: 'What are Nakshatras?',
    answer: 'Nakshatras are 27 lunar mansions used in Vedic astrology. Each nakshatra spans 13°20\' of the zodiac and has its own deity, symbol, and qualities. A complete Vedic chart also considers the nakshatra of the Moon at birth. Note: BornClock calculates your solar Rashi only — full nakshatra calculation requires your exact birth time and location.',
  },
  {
    question: 'Which system is more accurate — Western or Vedic?',
    answer: 'Neither is objectively "more accurate" — they are different philosophical frameworks. Western astrology (tropical) aligns signs with seasons, which has cultural and psychological depth. Vedic astrology (sidereal) aligns signs with fixed stars, which is more astronomically precise. Many people find value in both systems.',
  },
];

export default function VedicZodiac() {
  const [dob, setDob] = useState('');
  const result = dob ? compareZodiacs(new Date(dob + 'T12:00:00')) : null;

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Indian Zodiac (Vedic Rashi) Calculator — Find Your Jyotish Sign | BornClock"
        description="Calculate your Vedic Rashi (Indian zodiac sign) using the sidereal Jyotish system. Compare your Western and Vedic signs and explore all 12 rashis with their ruling planets, gemstones, and Ayurveda connections."
        canonicalUrl="/vedic-zodiac"
        keywords="vedic zodiac, rashi calculator, vedic astrology, jyotish, sidereal zodiac, indian astrology, ayanamsa, indian zodiac sign"
      />
      <FAQSchema items={FAQ_ITEMS} />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Hero */}
        <section className="text-center mb-8 animate-fade-in-up">
          <div className="text-5xl mb-4">🕉️</div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">
            Indian Zodiac Calculator
          </h1>
          <p className="text-lg text-orange-700 font-semibold mb-3">Vedic Rashi — Jyotish Astrology</p>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            Calculate your Indian zodiac sign (Rashi) using the ancient Jyotish sidereal system.
            Compare it with your Western sign — many people discover they are different.
          </p>
        </section>

        {/* Jyotish Authority Box */}
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border border-orange-200 rounded-xl p-5 mb-8 max-w-3xl mx-auto">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📿</span>
            <div>
              <p className="text-sm font-bold text-orange-900 mb-1">About Jyotish — Ancient Indian Astrology</p>
              <p className="text-xs text-orange-800 leading-relaxed">
                Jyotish (ज्योतिष) is one of the Vedangas — the six auxiliary disciplines of the Vedas.
                It uses the <strong>sidereal zodiac</strong> corrected for the precession of equinoxes
                (ayanamsa ≈ 23.85°), making it more astronomically precise than the Western tropical zodiac.
                Your Vedic rashi is typically one sign earlier than your Western sun sign.
              </p>
            </div>
          </div>
        </div>

        {/* Calculator */}
        <Card className="glass-card max-w-md mx-auto mb-10">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dob">Enter Your Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
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
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Western Zodiac (Tropical)</div>
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
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Vedic Rashi (Sidereal)</div>
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

            {/* Vedic sign detail */}
            <Card className="glass-card card-party-border">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-3">{result.vedicRashi.emoji}</div>
                  <h2 className="text-2xl font-bold text-foreground">{result.vedicRashi.name} ({result.vedicRashi.english})</h2>
                  <p className="text-muted-foreground mt-1">{result.vedicRashi.element} · {result.vedicRashi.quality} · Ruled by {result.vedicRashi.ruling_planet}</p>
                </div>

                <p className="text-foreground mb-6 leading-relaxed text-center">{result.vedicRashi.description}</p>

                <div className="flex justify-center gap-3 flex-wrap mb-4">
                  <Badge variant="secondary">🌿 {result.vedicRashi.element}</Badge>
                  <Badge variant="secondary">🪐 {result.vedicRashi.ruling_planet}</Badge>
                  <Badge variant="secondary">{result.vedicRashi.symbol} {result.vedicRashi.quality}</Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3 text-center">Key Traits</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {result.vedicRashi.traits.map(trait => (
                      <span key={trait} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nakshatra honest note */}
            <Card className="glass-card mt-4 border-blue-500/20">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground text-center">
                  <strong className="text-foreground">Note on Nakshatras:</strong> This calculator computes your solar Rashi only.
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
              const isUserSign = result?.vedicRashi.name === sign.name;
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
                      <Badge className="mt-2 text-xs">Your Rashi</Badge>
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
      </div>
      <Footer />
    </div>
  );
}

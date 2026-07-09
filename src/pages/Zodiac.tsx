import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { ZODIAC_DATA } from '@/data/zodiacData';

const ELEMENT_BORDER: Record<string, string> = {
  Fire: 'border-red-300 dark:border-red-700',
  Earth: 'border-green-300 dark:border-green-700',
  Air: 'border-sky-300 dark:border-sky-700',
  Water: 'border-blue-300 dark:border-blue-700',
};

const ELEMENT_BADGE: Record<string, string> = {
  Fire: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  Earth: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Air: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  Water: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

const COMPATIBILITY: Record<string, string[]> = {
  Fire: ['Aries', 'Leo', 'Sagittarius'],
  Earth: ['Taurus', 'Virgo', 'Capricorn'],
  Air: ['Gemini', 'Libra', 'Aquarius'],
  Water: ['Cancer', 'Scorpio', 'Pisces'],
};

const ELEMENT_DESCRIPTIONS: Record<string, string> = {
  Fire: 'Aries, Leo, and Sagittarius share the fire element — they are driven, enthusiastic, and oriented toward action and self-expression. Fire signs tend to lead and inspire. Their energy is contagious but can burn hot when unchecked.',
  Earth: 'Taurus, Virgo, and Capricorn share the earth element — grounded, practical, and oriented toward building lasting things. Earth signs create stability and excel at the work of steady progress over time.',
  Air: 'Gemini, Libra, and Aquarius share the air element — intellectual, communicative, and socially oriented. Air signs are the connectors and thinkers of the zodiac, at their best when ideas and conversation are in free circulation.',
  Water: 'Cancer, Scorpio, and Pisces share the water element — deeply emotional, intuitive, and oriented toward the invisible realm of feeling and connection. Water signs carry extraordinary depth and are among the most perceptive of all signs.',
};

const FAQ_ITEMS = [
  { q: 'What is the Western zodiac?', a: 'The Western zodiac is a system of twelve equal 30° divisions of the ecliptic, fixed to the vernal equinox. It originated with Babylonian astronomers and was refined by Greek astronomers including Hipparchus and Ptolemy. The twelve signs — Aries through Pisces — correspond to different periods of the calendar year, not to the constellations they share names with [Campion, N., 2009. A History of Western Astrology].' },
  { q: 'What is the difference between tropical and sidereal zodiac?', a: 'The tropical zodiac (used on BornClock) is fixed to the vernal equinox — the point where the Sun crosses the celestial equator northward each spring. The sidereal zodiac used in Vedic/Jyotish astrology is fixed to the background stars. Due to axial precession, these two systems are currently about 23° apart — meaning your sidereal sign may be different from your tropical sign.' },
  { q: 'Is astrology scientific?', a: 'The scientific consensus is that astrology lacks predictive validity beyond chance. The Barnum/Forer effect (the tendency to accept generic personality descriptions as accurate) explains much of astrology\'s perceived accuracy [Forer, B.R., 1949. Journal of Abnormal and Social Psychology]. BornClock presents zodiac content for cultural enrichment and tradition — not as predictive science.' },
  { q: 'What are the four elements in astrology?', a: 'The four classical elements — Fire, Earth, Air, and Water — each contain three zodiac signs. Fire signs (Aries, Leo, Sagittarius) are energetic and action-oriented. Earth signs (Taurus, Virgo, Capricorn) are grounded and practical. Air signs (Gemini, Libra, Aquarius) are intellectual and communicative. Water signs (Cancer, Scorpio, Pisces) are emotional and intuitive.' },
  { q: 'What are the three modalities?', a: 'Cardinal signs (Aries, Cancer, Libra, Capricorn) initiate each season and are associated with leadership and action. Fixed signs (Taurus, Leo, Scorpio, Aquarius) fall in the middle of each season and are associated with persistence. Mutable signs (Gemini, Virgo, Sagittarius, Pisces) close each season and are associated with adaptability.' },
  { q: 'What is a cusp sign?', a: 'A "cusp" sign refers to birthdays near the transition between two zodiac signs. In the tropical zodiac, each sign has a precise boundary date. Since the Sun moves about 1° per day, birthdays within 1–2 days of the boundary may be genuinely on the cusp. BornClock uses fixed date boundaries — if you were born close to a boundary and know your birth time, an astrology program using your precise Sun position will give a more specific answer.' },
  { q: 'Which zodiac signs are most compatible?', a: 'Traditional compatibility analysis considers element harmony (fire and air go well together; earth and water go well together), modality, and ruling planet relationships. However, compatibility in astrology is a complex system that considers entire birth charts, not just Sun signs. Sun sign compatibility is an oversimplification — meaningful only as a starting point.' },
  { q: 'How many people share my zodiac sign?', a: 'Roughly one-twelfth of the world\'s population shares your Sun sign — approximately 640 million people as of 2024. Within a given country, the distribution can vary based on birth rate seasonality patterns.' },
];

export default function Zodiac() {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'The 12 Zodiac Signs',
    itemListElement: ZODIAC_DATA.map((z, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: z.name,
      url: `https://bornclock.com/zodiac/${z.slug}`,
      description: `${z.name}: ${z.dateRange} — ${z.element} sign, ruled by ${z.rulingPlanet}`,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Zodiac Signs — Dates, Traits, Science & History | BornClock"
        description="Complete guide to all 12 zodiac signs — dates, personality traits, elements, mythology, and what science says about astrology. Sourced from Campion (2009) and Sachs (1952)."
        keywords="zodiac signs, all 12 zodiac signs, zodiac dates, zodiac traits, western astrology, zodiac compatibility, zodiac elements"
        canonicalUrl="/zodiac"
        ogImage="https://bornclock.com/og/zodiac.png"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            The 12 Zodiac Signs — Dates, Traits, History and Science
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
            The Western zodiac has been used to interpret human personality and fate for over 2,500 years. This is the complete reference — what each sign means, where it came from, and what the research actually says about the system itself.
          </p>
        </div>

        {/* What Is the Zodiac */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">What Is the Zodiac?</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The word "zodiac" comes from the Greek zodiakos kyklos — "circle of animals." It refers to the band of sky through which the Sun appears to travel over the course of a year, as seen from Earth. Babylonian astronomers identified this band in the second millennium BCE and divided it into twelve roughly equal segments, each associated with the constellation it contained at that time. The Babylonians used this system for tracking astronomical events and eventually for interpreting terrestrial events — the beginning of astrology as we know it. [Sachs, A., 1952. Babylonian Horoscopes. Journal of Cuneiform Studies.]
            </p>
            <p>
              Greek astronomers inherited the Babylonian system and formalized the twelve-sign structure. Hipparchus (c. 190–120 BCE) discovered axial precession — the slow wobble of Earth's rotational axis that causes the vernal equinox to shift westward through the zodiac over a ~25,776-year cycle. This discovery created the distinction between the <strong className="text-foreground">tropical zodiac</strong> (fixed to the equinox, used in Western astrology) and the <strong className="text-foreground">sidereal zodiac</strong> (fixed to the background stars, used in Vedic/Jyotish astrology). The two systems are now about 23° apart. [Campion, N., 2009. A History of Western Astrology. Continuum.]
            </p>
            <p>
              The zodiac signs we use today — with their specific personality associations — were largely codified by the astronomer-astrologer Claudius Ptolemy in his Tetrabiblos (c. 150 CE), which remained the foundational text of Western astrology for over a thousand years. BornClock uses the tropical zodiac, which is the standard for Western astrology and popular culture worldwide.
            </p>
          </div>
        </section>

        {/* Science Perspective */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">The Science Perspective</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The scientific consensus is clear: no peer-reviewed study has demonstrated that zodiac sign reliably predicts personality traits, relationship outcomes, or life events at a level better than chance. The most relevant line of research here involves the <strong className="text-foreground">Barnum/Forer effect</strong> — the well-documented psychological tendency to accept generic, flattering personality descriptions as accurate self-descriptions. In Bertram Forer's original 1949 experiment, subjects gave an average accuracy rating of 4.26 out of 5 to a personality description that was identical for all of them — drawn from a newspaper astrology column [Forer, B.R., 1949. The Fallacy of Personal Validation. Journal of Abnormal and Social Psychology].
            </p>
            <p>
              Carl Jung approached astrology differently — not as a predictive system but as a psychological one, finding that the symbolism of astrological signs resonated with patterns he observed in his patients [Jung, C.G., 1952. Synchronicity: An Acausal Connecting Principle]. This psychological interpretation remains influential in some therapeutic contexts, even as the predictive claims remain scientifically unsupported.
            </p>
            <p>
              There is one scientifically validated phenomenon that touches on astrology: <strong className="text-foreground">relative age effects and seasonal birth effects</strong>. Research suggests that birth month can predict school performance (older children in an academic year consistently outperform younger ones) and correlate modestly with certain health outcomes, likely through mechanisms involving vitamin D exposure, viral exposure in utero, and early childhood social dynamics [Chotai, J. et al., 2003. Birth month variations in the temperament and character inventory of personality in a general population]. These effects have nothing to do with the planets — but they are real.
            </p>
          </div>
        </section>

        {/* Sign Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">All 12 Zodiac Signs at a Glance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ZODIAC_DATA.map(sign => (
              <Link key={sign.slug} to={`/zodiac/${sign.slug}`}
                className={`block rounded-xl border-2 ${ELEMENT_BORDER[sign.element]} bg-card hover:shadow-md transition-all p-5 hover:scale-[1.01]`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{sign.unicode}</span>
                  <div>
                    <p className="font-bold text-foreground text-lg">{sign.name}</p>
                    <p className="text-xs text-muted-foreground">{sign.dateRange}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ELEMENT_BADGE[sign.element]}`}>{sign.element}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">{sign.rulingPlanet}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">{sign.modality}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {sign.coreTraits.slice(0, 3).map(t => (
                    <span key={t} className="text-xs text-muted-foreground">{t}</span>
                  ))}
                  {sign.coreTraits.length > 3 && <span className="text-xs text-muted-foreground">…</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Four Elements */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">The Four Elements</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {(['Fire', 'Earth', 'Air', 'Water'] as const).map(element => (
              <div key={element} className={`rounded-xl border-2 ${ELEMENT_BORDER[element]} bg-card p-5`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{element === 'Fire' ? '🔥' : element === 'Earth' ? '🌍' : element === 'Air' ? '💨' : '💧'}</span>
                  <h3 className="font-bold text-foreground">{element}</h3>
                </div>
                <div className="flex gap-2 mb-3">
                  {COMPATIBILITY[element].map(sign => {
                    const z = ZODIAC_DATA.find(d => d.name === sign);
                    return (
                      <Link key={sign} to={`/zodiac/${z?.slug || sign.toLowerCase()}`}
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${ELEMENT_BADGE[element]} hover:opacity-80 transition-opacity`}>
                        {z?.unicode} {sign}
                      </Link>
                    );
                  })}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{ELEMENT_DESCRIPTIONS[element]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Compatibility Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Compatibility Overview</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Zodiac compatibility in its simplest form is based on element harmony: fire and air signs tend to be compatible because both are energetic and outward-oriented; earth and water signs tend to be compatible because both are more inward-focused and oriented toward depth. Signs with the same element are often comfortable together but can also amplify each other's weaknesses.
            </p>
            <p>
              Traditional astrology considers twelve signs in six pairs of opposites, placed 180° apart on the zodiac wheel: Aries–Libra, Taurus–Scorpio, Gemini–Sagittarius, Cancer–Capricorn, Leo–Aquarius, Virgo–Pisces. Opposite signs are said to be attracted and fascinated by each other — they represent complementary rather than similar energies. Some of the most enduring compatibility stories in traditional astrology involve these opposite pairs.
            </p>
            <p>
              The most important caveat: sun-sign compatibility is a simplification. A complete astrological compatibility analysis (synastry) compares every element of both birth charts. For entertainment purposes, element compatibility is a reasonable starting point; for genuine relationship insight, the sun sign alone is too limited a picture.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="bg-card border border-border rounded-xl p-5">
                <p className="font-semibold text-foreground text-sm mb-2">{q}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Links */}
        <div className="bg-muted/50 rounded-xl p-6 text-center mb-8">
          <p className="text-muted-foreground text-sm mb-4">Explore more BornClock tools</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/" className="inline-block bg-primary text-primary-foreground rounded-lg px-5 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
              Find My Zodiac Sign
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 justify-center text-sm">
            <Link to="/birthstone" className="text-primary hover:underline">Birthstone Finder</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/numerology" className="text-primary hover:underline">Numerology</Link>
            <span className="text-muted-foreground">·</span>
            <Link to="/generation" className="text-primary hover:underline">Which Generation Are You?</Link>
          </div>
        </div>

        {/* About This Content */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300">
          <strong>About This Content:</strong> Zodiac history draws on Campion, N. (2009), <em>A History of Western Astrology</em>, Continuum; and Sachs, A. (1952), Babylonian Horoscopes, <em>Journal of Cuneiform Studies</em>. Mythology sources: Grimal, P. (1951), <em>The Dictionary of Classical Mythology</em>. Science section sources: Forer (1949), Jung (1952), Chotai et al. (2003). Zodiac signs are a cultural and entertainment system — BornClock does not endorse predictive claims.
        </div>
      </div>

      <Footer />
    </div>
  );
}

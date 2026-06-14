import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PlanetaryAge } from '@/components/PlanetaryAge';
import { useBirthDate } from '@/context/BirthDateContext';
import { SEO } from '@/components/SEO';
import { AgeCalculator } from '@/components/AgeCalculator';
import { EEATBadges } from '@/components/EEATBadges';
import { PageFAQ } from '@/components/PageFAQ';
import { RelatedTools } from '@/components/RelatedTools';
import { AuthorBio } from '@/components/AuthorBio';

// ── Structured data ───────────────────────────────────────────────────────────
const WEB_APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Planetary Age Calculator — BornClock',
  description:
    'Calculate your age on all 8 planets using verified NASA JPL orbital data',
  url: 'https://bornclock.com/planetary-age',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0' },
  citation: {
    '@type': 'CreativeWork',
    name: 'NASA JPL Planetary Fact Sheet',
    author: {
      '@type': 'Person',
      name: 'Dr. David R. Williams',
    },
    publisher: {
      '@type': 'Organization',
      name: 'NASA Goddard Space Flight Center',
    },
    datePublished: '2024',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/',
  },
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does the planetary age calculator work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We divide the total Earth days since your birth by each planet\'s mean sidereal orbital period from NASA JPL (Williams, D.R., 2024). The result is your "age" in that planet\'s years — the number of complete orbits around the Sun since your birth.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why is my Mercury age so much higher than my Earth age?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Mercury orbits the Sun every 87.969 Earth days — about 4.15 times faster than Earth. So for every Earth year that passes, you age more than 4 Mercury years. A 30-year-old has lived through roughly 124 Mercury years.",
      },
    },
    {
      '@type': 'Question',
      name: 'What is a sidereal orbital period?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "A sidereal orbital period is the time a planet takes to complete one full orbit around the Sun, measured relative to the background stars. This differs slightly from a synodic period (measured relative to Earth). All periods used in this calculator are mean sidereal values from NASA JPL.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I actually celebrate a birthday on another planet?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Your \"planetary birthday\" is a mathematical event — the moment that planet completes another full orbit since your birth. We calculate the next occurrence and convert it to an Earth calendar date so you can mark it. It's a fun way to connect with cosmic timescales!",
      },
    },
    {
      '@type': 'Question',
      name: 'Which planet has the longest year?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Neptune has the longest year of any planet: 60,182.0 Earth days, or approximately 165 Earth years. Neptune was discovered in 1846, and as of 2011 had completed only its first orbit since discovery.',
      },
    },
    {
      '@type': 'Question',
      name: 'What NASA data do you use for orbital periods?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We use mean sidereal orbital periods from the NASA JPL Planetary Fact Sheet (Williams, D.R., NASA Goddard Space Flight Center, 2024) at nssdc.gsfc.nasa.gov/planetary/factsheet/ and NASA JPL Solar System Dynamics at ssd.jpl.nasa.gov.',
      },
    },
    {
      '@type': 'Question',
      name: "Does India's ISRO have missions to other planets?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. ISRO's Mars Orbiter Mission (Mangalyaan, 2014) made India the first Asian nation to reach Mars orbit, succeeding on its first attempt. ISRO's Chandrayaan-3 (2023) landed near the Moon's south pole. Future missions include the Venus Orbiter Mission (Shukrayaan-1).",
      },
    },
    {
      '@type': 'Question',
      name: "What is Kepler's Third Law and how does it relate to planetary ages?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Kepler's Third Law (1619) states that the square of a planet's orbital period is proportional to the cube of its semi-major axis. This means planets farther from the Sun take disproportionately longer to orbit — which is why a year on Neptune is 165 times longer than an Earth year even though Neptune is only about 30 times farther away.",
      },
    },
  ],
};

// ── Page component ────────────────────────────────────────────────────────────
const PlanetaryAgePage = () => {
  const { birthDate, setBirthDate } = useBirthDate();

  // Pre-populate from ?dob= URL parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dob = params.get('dob');
    if (dob) {
      const parsed = new Date(dob);
      if (!isNaN(parsed.getTime())) {
        setBirthDate(parsed);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Your Age on Other Planets Calculator — Mercury, Mars, Jupiter & Beyond | BornClock"
        description="Discover how old you'd be on every planet in the solar system. Free planetary age calculator using NASA JPL orbital data and Kepler's Third Law. See your age on Mercury, Venus, Mars, Jupiter, Saturn, Uranus and Neptune. Includes ISRO's Mars mission facts."
        keywords="age on other planets, planetary age calculator, how old am I on Mars, my age on other planets, how old would I be on Jupiter, space age calculator, age on Mercury calculator, how long is a year on Mars, ISRO Mangalyaan, planetary birthday calculator"
        canonicalUrl="/planetary-age"
      />

      {/* Additional structured data — WebApplication + FAQPage */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(WEB_APP_SCHEMA)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(FAQ_SCHEMA)}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        {/* ── Hero section ── */}
        <section className="text-center space-y-4 mb-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Your Age on Other Planets Calculator
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover how old you'd be on every planet in our solar system.
            Powered by NASA JPL orbital data and Kepler's Third Law — all
            calculations happen instantly in your browser.
          </p>
          <EEATBadges sources={['NASA JPL', 'ISRO', 'Kepler (1619)']} />
        </section>

        {/* ── Date input ── */}
        {!birthDate && (
          <section className="max-w-4xl mx-auto mb-16">
            <AgeCalculator
              onBirthDateChange={setBirthDate}
              initialDate={birthDate}
            />
          </section>
        )}

        {/* ── Planetary age results ── */}
        {birthDate && (
          <section className="max-w-4xl mx-auto mb-16 animate-fade-in-up">
            <PlanetaryAge birthDate={birthDate} />
          </section>
        )}

        {/* ── Supporting sections ── */}
        <PageFAQ slug="planetary-age" title="Planetary Age Calculator FAQs" />
        <RelatedTools currentSlug="planet" />
        <AuthorBio />

        {/* ── Sources & methodology footer ── */}
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-xs text-slate-500 leading-relaxed">
            Sources &amp; Methodology: NASA JPL Planetary Fact Sheet (Williams,
            D.R., NASA Goddard Space Flight Center, 2024) —
            nssdc.gsfc.nasa.gov/planetary/factsheet/ | NASA JPL Solar System
            Dynamics — ssd.jpl.nasa.gov | ISRO Mars Orbiter Mission
            (Mangalyaan), 2014 — isro.gov.in | ISRO Chandrayaan-3 Mission, 2023
            — isro.gov.in | Kepler, J. (1619). Harmonices Mundi | IAU Planet
            Definition (2006) | Newton, I. (1687). Principia Mathematica | All
            calculations use mean sidereal orbital periods. Planetary age is a
            mathematical conversion for educational purposes only — biological
            ageing is unaffected by orbital periods. Last verified: 2024.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PlanetaryAgePage;

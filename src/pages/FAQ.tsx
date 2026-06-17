import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import PageTagline from '@/components/PageTagline';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

// ── Data ─────────────────────────────────────────────────────────────────────

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  title: string;
  id: string;
  items: FAQItem[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    title: 'About BornClock',
    id: 'about',
    items: [
      {
        q: 'What is BornClock?',
        a: 'BornClock is a suite of free birthday and longevity tools. Enter your date of birth and instantly see your exact age, your planetary ages, celebrity birthday matches, zodiac sign, birthstone, life path number, and a science-based life expectancy estimate.',
      },
      {
        q: 'Is BornClock free to use?',
        a: 'The core tools — age calculator, planetary age, zodiac, birthstone, numerology, and celebrity birthday matching — are completely free. The Life Expectancy Calculator is a premium feature that unlocks with an account.',
      },
      {
        q: 'Who built BornClock?',
        a: 'BornClock was built by an independent team in India, with a focus on data accuracy, privacy-first design, and clean user experience. See our About page for more.',
      },
      {
        q: 'Does BornClock store my date of birth?',
        a: 'Only if you create an account and save your profile. Anonymous use stores nothing. Even when you do save a profile, your health inputs for the Life Expectancy Calculator are never stored — they are processed entirely in your browser.',
      },
      {
        q: 'What makes BornClock different from other age calculators?',
        a: 'Most age calculators just show years, months, and days. BornClock goes further: it converts your age into planetary years using NASA orbital data, estimates your longevity using WHO/UN actuarial tables and 12 lifestyle factors, and connects you to celebrities born on the same day.',
      },
    ],
  },
  {
    title: 'Life Expectancy Calculator',
    id: 'life-expectancy',
    items: [
      {
        q: 'How is my life expectancy calculated?',
        a: 'BornClock starts with an age-conditional baseline from the UN World Population Prospects 2024 (specific to your country, age, and sex), then applies adjustments for 12 lifestyle factors drawn from peer-reviewed sources including GBD 2019 and the Lancet. Genetic and community bonuses are then added.',
      },
      {
        q: 'Is the life expectancy estimate medical advice?',
        a: 'No. The estimate is a statistical projection at a population level for motivation and reflection. It does not account for your complete medical history, specific genetic variants, or future medical advances. Always consult a doctor for personal health guidance.',
      },
      {
        q: 'How accurate is the life expectancy calculator?',
        a: 'Population-level actuarial models like ours have an individual uncertainty of ±5–8 years. They are useful for understanding which lifestyle factors matter most, not for predicting a specific date. Our methodology page lists every source and formula.',
      },
      {
        q: 'Which country baselines does BornClock use?',
        a: 'We use UN WPP 2024 period life tables for 54 countries, plus WHO regional averages for countries not individually covered. The GLOBAL_DEFAULT (WHO global average) is used if no match is found.',
      },
      {
        q: 'What lifestyle factors does the calculator consider?',
        a: 'Twelve factors: smoking, alcohol, exercise, sleep quality, BMI, diet (fruit & vegetables), chronic stress, social connections, Type 2 diabetes, heart disease history, air quality/pollution exposure, and mental health. Each draws from a specific peer-reviewed epidemiological study.',
      },
      {
        q: 'What is the "What-If Simulator"?',
        a: 'The What-If Simulator lets you adjust individual lifestyle sliders after your initial calculation and instantly see how the estimate changes. It helps you understand the relative impact of quitting smoking vs. starting exercise, for example.',
      },
      {
        q: 'Can I export my life expectancy report?',
        a: 'Yes. Premium users can export a personalised PDF report including the waterfall chart, factor breakdown, and comparison benchmarks.',
      },
    ],
  },
  {
    title: 'Celebrity Birthday Matching',
    id: 'celebrities',
    items: [
      {
        q: 'How does the celebrity birthday match work?',
        a: 'BornClock matches your day and month (not year) against a curated database of 1,000+ notable individuals. Results are ranked by global recognition score — a composite of Wikipedia page views, cross-domain presence, and historical significance.',
      },
      {
        q: 'Where does the celebrity data come from?',
        a: 'Birth dates are sourced from Wikipedia, IMDb, and official biographies, cross-referenced for accuracy. The database covers film, music, sport, science, politics, and literature.',
      },
      {
        q: 'Why am I only seeing a few celebrities?',
        a: 'Not all birth dates are equally populated in the database. If you see fewer results, it means fewer well-documented celebrities share your exact birthday. We update the database regularly.',
      },
      {
        q: 'Can I see historical figures, not just living celebrities?',
        a: 'Yes. The database includes historical figures — scientists, artists, philosophers, and political leaders — alongside contemporary celebrities.',
      },
    ],
  },
  {
    title: 'Zodiac, Birthstone & Numerology',
    id: 'zodiac-birthstone-numerology',
    items: [
      {
        q: 'Which zodiac system does BornClock use?',
        a: 'BornClock uses the Western tropical zodiac — twelve equal 30° divisions of the ecliptic fixed to the vernal equinox. This is the most widely used system in Western astrology and popular culture.',
      },
      {
        q: 'What if I was born on the cusp between two signs?',
        a: 'BornClock uses fixed calendar date boundaries, which is the standard approach since most people do not know their exact birth time. If you know your birth time and location, an astrological chart software using your precise Sun position will give a more specific answer.',
      },
      {
        q: 'Which birthstone list does BornClock use?',
        a: 'The American Gem Society / Jewelers of America official modern birthstone list, updated 2002 and 2016. Traditional and Ayurvedic alternatives are shown as supplementary information.',
      },
      {
        q: 'How is the Life Path Number calculated?',
        a: 'BornClock uses Pythagorean digit reduction: sum all digits of your birth date (day + month + year) and reduce to a single digit by repeated summing. Master numbers 11, 22, and 33 are preserved. For example, 15 June 1990 → 6+6+1 = 13 → 4.',
      },
      {
        q: 'Are zodiac, birthstone, and numerology scientifically validated?',
        a: 'No. These features are provided for cultural enrichment, tradition, and entertainment. BornClock clearly labels them as such and does not endorse predictive claims based on these systems.',
      },
    ],
  },
  {
    title: 'Planetary Age Calculator',
    id: 'planetary-age',
    items: [
      {
        q: 'What does "your age on Mars" mean?',
        a: 'It means the number of complete Martian orbits around the Sun since your birth. A Martian year is approximately 686.971 Earth days, so a 30-year-old Earth person is about 15.9 Mars years old.',
      },
      {
        q: 'What orbital data does BornClock use?',
        a: 'Mean sidereal orbital periods from the NASA JPL Planetary Fact Sheet (Williams, D.R., NASA Goddard Space Flight Center, 2024) at nssdc.gsfc.nasa.gov/planetary/factsheet/.',
      },
      {
        q: 'What is a "planetary birthday"?',
        a: 'A planetary birthday is the moment that planet completes another full orbit since your birth. BornClock calculates the next occurrence of each and converts it to an Earth calendar date.',
      },
      {
        q: 'Why does Mercury give such a high age?',
        a: 'Mercury orbits the Sun every 87.969 Earth days — about 4.15 times faster than Earth. A 30-year-old has lived through roughly 124 Mercury years.',
      },
      {
        q: 'Does BornClock include Earth in the planetary age calculator?',
        a: 'Earth is not listed separately because your Earth age is already shown on the main age calculator. The planetary age tool covers the six other planets: Mercury, Venus, Mars, Jupiter, Saturn, Uranus, and Neptune.',
      },
    ],
  },
  {
    title: 'Account and Premium',
    id: 'account',
    items: [
      {
        q: 'Do I need an account to use BornClock?',
        a: 'No. The age calculator, planetary age, zodiac, birthstone, numerology, and celebrity birthday match are all free and require no account. An account unlocks the Life Expectancy Calculator and PDF export.',
      },
      {
        q: 'How do I create an account?',
        a: 'Click "Sign Up" in the navigation. You need only a name, email address, and password. No credit card is required to create a free account.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to your Profile page and choose "Delete Account". All your personal data is permanently deleted within 30 days. No need to contact support.',
      },
      {
        q: 'How does BornClock handle payments?',
        a: 'Payments are processed via Razorpay. BornClock only receives a transaction confirmation — your card details never touch our servers.',
      },
      {
        q: 'Can I export my data?',
        a: 'Yes. Email privacy@bornclock.com to request a copy of your data in a portable format. We fulfil requests within 30 days.',
      },
    ],
  },
  {
    title: 'Technical Questions',
    id: 'technical',
    items: [
      {
        q: 'Do calculations happen on my device or your servers?',
        a: 'All calculations — age, planetary age, zodiac, numerology, birthstone, and life expectancy — run entirely in your browser. No personal data is transmitted to our servers during calculation.',
      },
      {
        q: 'Does BornClock work offline?',
        a: 'The core calculations work without an internet connection once the page has loaded. Celebrity birthday matching requires a connection to query our database.',
      },
      {
        q: 'Which browsers are supported?',
        a: 'BornClock is tested on the latest versions of Chrome, Firefox, Safari, and Edge. Internet Explorer is not supported.',
      },
      {
        q: 'Is BornClock mobile-friendly?',
        a: 'Yes. BornClock is fully responsive and works on all modern smartphones and tablets.',
      },
      {
        q: 'I found an error in the data. How do I report it?',
        a: 'Email hello@bornclock.com with the page, the error you found, and the correct data (with a source link if possible). We review and update within 7 days.',
      },
    ],
  },
];

// FAQ structured data
const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_CATEGORIES.flatMap(cat =>
    cat.items.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    }))
  ),
};

// ── Accordion item ────────────────────────────────────────────────────────────

function AccordionItem({ item, defaultOpen = false }: { item: FAQItem; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-start justify-between w-full text-left py-4 gap-4"
      >
        <span className="font-medium text-foreground leading-snug">{item.q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        }
      </button>
      {open && (
        <div className="pb-4 text-muted-foreground text-sm leading-relaxed">
          {item.a}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function FAQ() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return FAQ_CATEGORIES;
    return FAQ_CATEGORIES
      .map(cat => ({
        ...cat,
        items: cat.items.filter(
          item =>
            item.q.toLowerCase().includes(q) ||
            item.a.toLowerCase().includes(q)
        ),
      }))
      .filter(cat => cat.items.length > 0);
  }, [search]);

  const totalResults = filtered.reduce((n, cat) => n + cat.items.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Frequently Asked Questions | BornClock"
        description="Answers to common questions about BornClock's age calculator, life expectancy calculator, planetary age, celebrity birthday matching, zodiac, numerology, and account features."
        keywords="BornClock FAQ, age calculator questions, life expectancy FAQ, planetary age FAQ"
        canonicalUrl="/faq"
      />

      {/* FAQPage structured data */}
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <PageTagline />
          <p className="text-muted-foreground text-lg">
            Everything you need to know about BornClock. Can't find an answer?{' '}
            <a href="mailto:hello@bornclock.com" className="text-blue-500 hover:underline">
              Email us
            </a>.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search questions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {search && (
          <p className="text-sm text-muted-foreground mb-6">
            {totalResults} result{totalResults !== 1 ? 's' : ''} for "<strong>{search}</strong>"
          </p>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-2">No questions match your search.</p>
            <p className="text-sm">
              Try different keywords, or{' '}
              <a href="mailto:hello@bornclock.com" className="text-blue-500 hover:underline">
                email us your question
              </a>.
            </p>
          </div>
        )}

        {/* Categories */}
        <div className="space-y-10">
          {filtered.map(cat => (
            <section key={cat.id} id={cat.id} className="scroll-mt-8">
              <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">
                {cat.title}
              </h2>
              <div className="bg-card border border-border rounded-xl px-6">
                {cat.items.map((item, i) => (
                  <AccordionItem
                    key={i}
                    item={item}
                    defaultOpen={search.length > 0}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border border-primary/20 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Still have a question?</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            We respond to all enquiries within 48 hours.
          </p>
          <a
            href="mailto:hello@bornclock.com"
            className="inline-block bg-primary text-primary-foreground rounded-lg px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Email hello@bornclock.com
          </a>
          <div className="mt-4 text-sm text-muted-foreground">
            or see our{' '}
            <Link to="/methodology" className="text-blue-500 hover:underline">Methodology</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

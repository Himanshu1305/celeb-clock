import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO, FAQSchema } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getChineseZodiac, getChineseZodiacAnimal } from '@/services/ChineseZodiacService';

const ALL_ANIMALS = [
  { name: 'Rat', emoji: '🐀', years: '1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020' },
  { name: 'Ox', emoji: '🐂', years: '1925, 1937, 1949, 1961, 1973, 1985, 1997, 2009, 2021' },
  { name: 'Tiger', emoji: '🐅', years: '1926, 1938, 1950, 1962, 1974, 1986, 1998, 2010, 2022' },
  { name: 'Rabbit', emoji: '🐇', years: '1927, 1939, 1951, 1963, 1975, 1987, 1999, 2011, 2023' },
  { name: 'Dragon', emoji: '🐉', years: '1928, 1940, 1952, 1964, 1976, 1988, 2000, 2012, 2024' },
  { name: 'Snake', emoji: '🐍', years: '1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, 2025' },
  { name: 'Horse', emoji: '🐎', years: '1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026' },
  { name: 'Goat', emoji: '🐐', years: '1931, 1943, 1955, 1967, 1979, 1991, 2003, 2015, 2027' },
  { name: 'Monkey', emoji: '🐒', years: '1932, 1944, 1956, 1968, 1980, 1992, 2004, 2016, 2028' },
  { name: 'Rooster', emoji: '🐓', years: '1933, 1945, 1957, 1969, 1981, 1993, 2005, 2017, 2029' },
  { name: 'Dog', emoji: '🐕', years: '1934, 1946, 1958, 1970, 1982, 1994, 2006, 2018, 2030' },
  { name: 'Pig', emoji: '🐷', years: '1935, 1947, 1959, 1971, 1983, 1995, 2007, 2019, 2031' },
];

const FAQ_ITEMS = [
  {
    question: 'What is the Chinese Zodiac?',
    answer: 'The Chinese Zodiac (生肖, Shēngxiào) is a 12-year repeating cycle where each year is represented by an animal. The 12 animals are: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, and Pig.',
  },
  {
    question: 'How is my Chinese Zodiac sign determined?',
    answer: 'Your Chinese Zodiac sign is determined by the year of your birth according to the Chinese lunisolar calendar. The Chinese New Year falls between January 21 and February 20 — if your birthday is in January or early February, you may belong to the previous year\'s zodiac animal.',
  },
  {
    question: 'What are the five elements in Chinese Zodiac?',
    answer: 'Each zodiac year is also associated with one of five elements: Wood, Fire, Earth, Metal, and Water. Each element governs two consecutive years, creating a 60-year cycle. Your element adds further nuance to your zodiac personality.',
  },
  {
    question: 'What is yin and yang in the Chinese Zodiac?',
    answer: 'Each zodiac year alternates between Yang (positive, active energy) and Yin (negative, passive energy). Odd-numbered years in the cycle are Yang; even-numbered years are Yin. This duality shapes how an animal\'s energy is expressed.',
  },
  {
    question: 'Which Chinese Zodiac animals are most compatible?',
    answer: 'Traditional compatibility is grouped in triangles: Rat-Dragon-Monkey, Ox-Snake-Rooster, Tiger-Horse-Dog, Rabbit-Goat-Pig. Animals four positions apart (e.g., Rat and Horse) are considered least compatible.',
  },
  {
    question: 'Is the Chinese Zodiac the same as the Western Zodiac?',
    answer: 'No. The Western Zodiac is based on the month of your birth (tied to the sun\'s position) and repeats every year. The Chinese Zodiac is based on the year of your birth and repeats every 12 years. They measure entirely different things.',
  },
];

export default function ChineseZodiac() {
  const [dob, setDob] = useState('');
  const result = dob ? getChineseZodiac(new Date(dob + 'T12:00:00')) : null;

  const today = new Date();
  const currentAnimal = getChineseZodiacAnimal(today.getFullYear());

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Chinese Zodiac Calculator — Find Your Chinese Zodiac Sign"
        description="Discover your Chinese Zodiac animal, element, and yin/yang energy. Enter your date of birth for instant results with traits and famous people born under your sign."
        canonicalUrl="/chinese-zodiac"
        keywords="chinese zodiac calculator, chinese zodiac sign, year of the rat, chinese astrology, zodiac animal, five elements"
      />
      <FAQSchema items={FAQ_ITEMS} />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Hero */}
        <section className="text-center mb-10 animate-fade-in-up">
          <div className="text-5xl mb-4">🐉</div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
            Chinese Zodiac Calculator
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover your Chinese Zodiac animal, element, and yin/yang energy from your date of birth.
            {' '}2026 is the Year of the <strong>{currentAnimal}</strong>.
          </p>
        </section>

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
          <Card className="glass-card card-party-border max-w-2xl mx-auto mb-12 animate-fade-in-up">
            <CardContent className="p-8 text-center">
              <div className="text-8xl mb-4">{result.emoji}</div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Year of the {result.animal}
              </h2>
              <p className="text-muted-foreground mb-6">
                Chinese Year {result.year} · {result.element} {result.animal} · {result.yin_yang}
              </p>

              <div className="flex justify-center gap-3 mb-6 flex-wrap">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  🌿 {result.element} Element
                </Badge>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {result.yin_yang === 'Yang' ? '☀️' : '🌙'} {result.yin_yang}
                </Badge>
              </div>

              <p className="text-foreground mb-6 leading-relaxed">{result.description}</p>

              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3">Key Traits</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {result.traits.map(trait => (
                    <span key={trait} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Famous {result.animal}s</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {result.famous.map(name => (
                    <span key={name} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All 12 Animals Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center text-foreground mb-6">
            All 12 Chinese Zodiac Animals
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {ALL_ANIMALS.map(animal => {
              const isUserAnimal = result?.animal === animal.name;
              return (
                <Card
                  key={animal.name}
                  className={`glass-card text-center p-4 transition-all ${
                    isUserAnimal ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''
                  }`}
                >
                  <div className="text-4xl mb-2">{animal.emoji}</div>
                  <div className="font-bold text-foreground">{animal.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{animal.years}</div>
                  {isUserAnimal && (
                    <Badge className="mt-2 text-xs">Your Sign</Badge>
                  )}
                </Card>
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

        {/* CTA links */}
        <section className="text-center pb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Explore More</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/vedic-zodiac" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity">
              🕉️ Vedic Zodiac (Rashi)
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

import { useState } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { CollectionLayout } from '@/components/central';
import { SEO, FAQSchema } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DobInput, toISODate } from '@/components/DobInput';
import { SavedDateOffer } from '@/components/SavedDateOffer';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getChineseZodiac } from '@/services/ChineseZodiacService';
import {
  CHINESE_ANIMALS, CHINESE_YEAR_TABLE_FIRST, CHINESE_YEAR_TABLE_LAST,
  currentChineseYear, chineseYearInfo, formatChineseYearRange,
} from '@/lib/chineseCalendar.js';
import { TermTip } from '@/components/vedic/TermTip';

const ANIMAL_EMOJI: Record<string, string> = {
  Rat: '🐀', Ox: '🐂', Tiger: '🐅', Rabbit: '🐇', Dragon: '🐉', Snake: '🐍',
  Horse: '🐎', Goat: '🐐', Monkey: '🐒', Rooster: '🐓', Dog: '🐕', Pig: '🐷',
};

// Each animal's years with their exact Chinese New Year start/end dates (1924–2031, the
// sourced table — see src/lib/chineseCalendar.js).
const ALL_ANIMALS = CHINESE_ANIMALS.map((name, i) => {
  const years: number[] = [];
  for (let y = CHINESE_YEAR_TABLE_FIRST + i; y <= CHINESE_YEAR_TABLE_LAST; y += 12) years.push(y);
  return { name, emoji: ANIMAL_EMOJI[name], years };
});

const FAQ_ITEMS = [
  {
    question: 'What is the Chinese Zodiac?',
    answer: 'The Chinese Zodiac (生肖, Shēngxiào) is a 12-year repeating cycle where each year is represented by an animal. The 12 animals are: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat (also called Sheep), Monkey, Rooster, Dog, and Pig.',
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
    answer: 'Yang and Yin alternate year by year. Yang years are the Rat, Tiger, Dragon, Horse, Monkey and Dog years — Chinese years that begin in an even-numbered Gregorian year (2026, the Fire Horse year, is Yang). Yin years are the Ox, Rabbit, Snake, Goat, Rooster and Pig years, which begin in odd-numbered years (2027, the Fire Goat year, is Yin). Yang is traditionally described as active and outgoing, Yin as receptive and reflective.',
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

  // Current Chinese year — changes at Chinese New Year, not on 1 January.
  const cur = chineseYearInfo(currentChineseYear());

  return (
    <CollectionLayout
      theme="mystic"
      testId="chinese-zodiac-page"
      seo={(
        <SEO
          title="Chinese Zodiac Calculator — Find Your Chinese Zodiac Sign"
          description="Discover your Chinese Zodiac animal, element, and yin/yang energy. Enter your date of birth for instant results with traits and famous people born under your sign."
          canonicalUrl="/chinese-zodiac"
          keywords="chinese zodiac calculator, chinese zodiac sign, year of the rat, chinese astrology, zodiac animal, five elements"
          ogImage="https://bornclock.com/og/zodiac.png"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Mystic Corner', to: '/mystic-corner/' }], current: 'Chinese Zodiac' }}
      footer={{
        tagline: 'Discover your Chinese Zodiac animal, element, and yin/yang energy from your date of birth.',
        nav: [
          { label: 'Mystic Corner', to: '/mystic-corner/' },
          { label: 'Numerology', to: '/numerology/' },
          { label: 'Zodiac', to: '/zodiac/' },
          { label: 'Compatibility', to: '/compatibility/' },
          { label: 'Privacy', to: '/privacy/' },
        ],
        note: '© 2026 BornClock · Calculated, not templated.',
      }}
      eyebrow="Chinese Zodiac"
      h1="Chinese Zodiac Calculator"
      lead={(
        <>
          Discover your Chinese Zodiac animal, element, and yin/yang energy from your date of birth.
          {' '}The current Chinese year is the Year of the <strong>{cur.element} {cur.animal}</strong> ({cur.rangeLabel}).
        </>
      )}
    >
      <FAQSchema items={FAQ_ITEMS} />

      <section className="section container mx-auto px-4 py-8 max-w-5xl">

        {/* Calculator */}
        <Card className="glass-card max-w-md mx-auto mb-10">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dob-day">Enter Your Date of Birth</Label>
              <SavedDateOffer dobIso={dob} onUseSaved={setDob} prefix="chinese-zodiac" />
              <DobInput label="" value={dob ? { day: dob.slice(8, 10), month: dob.slice(5, 7), year: dob.slice(0, 4) } : undefined} onValidChange={d => setDob(d ? toISODate(d) : '')} />
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
              <p className="text-xs text-muted-foreground mb-1"><TermTip id="chineseZodiac">What is a Chinese zodiac animal?</TermTip></p>
              <p className="text-muted-foreground mb-6">
                Chinese Year {result.year} · {result.element} {result.animal} · {result.yin_yang}
              </p>

              <div className="flex justify-center gap-3 mb-6 flex-wrap">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  🌿 <TermTip id="chineseElement">{result.element} Element</TermTip>
                </Badge>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {result.yin_yang === 'Yang' ? '☀️' : '🌙'} <TermTip id="yinYang">{result.yin_yang}</TermTip>
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

              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3">Famous {result.animal}s</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {result.famous.map(name => (
                    <span key={name} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                to={`/chinese-zodiac/${result.animal.toLowerCase()}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity text-sm"
              >
                Full {result.animal} Guide →
              </Link>
            </CardContent>
          </Card>
        )}

        {/* All 12 Animals Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center text-foreground mb-6">
            All 12 Chinese Zodiac Animals
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-6">
            Each year runs from Chinese New Year to the day before the next one — so a birthday in January or early February
            often belongs to the previous animal. Full list: <Link to="/articles/chinese-zodiac-by-year/" className="underline">Chinese zodiac by year (1924–2031)</Link>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ALL_ANIMALS.map(animal => {
              const isUserAnimal = result?.animal === animal.name;
              return (
                <Link key={animal.name} to={`/chinese-zodiac/${animal.name.toLowerCase()}`}>
                  <Card
                    className={`glass-card text-center p-4 transition-all hover:border-primary/50 cursor-pointer ${
                      isUserAnimal ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''
                    }`}
                  >
                    <div className="text-4xl mb-2">{animal.emoji}</div>
                    <div className="font-bold text-foreground">{animal.name}</div>
                    <ul className="text-[11px] text-muted-foreground mt-2 leading-snug space-y-0.5" data-testid={`cz-years-${animal.name.toLowerCase()}`}>
                      {animal.years.map(y => (
                        <li key={y}>
                          <span className="font-semibold text-foreground">{y}</span>{' '}
                          <span className="whitespace-nowrap">{formatChineseYearRange(y)}</span>
                        </li>
                      ))}
                    </ul>
                    {isUserAnimal && (
                      <Badge className="mt-2 text-xs">Your Sign</Badge>
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

        {/* CTA links */}
        <section className="text-center pb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Explore More</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/vedic-zodiac/" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity">
              🕉️ Vedic Zodiac (Rashi)
            </Link>
            <Link to="/zodiac/" className="px-5 py-2.5 bg-accent/10 text-accent rounded-xl font-medium hover:bg-accent/20 transition-colors border border-accent/30">
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

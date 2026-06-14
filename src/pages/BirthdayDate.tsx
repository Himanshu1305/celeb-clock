import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { CelebrityCard, DisplayCelebrity } from '@/components/CelebrityCard';
import { getRankedBirthdayCelebrities, CelebrityBirthdayResult } from '@/services/BirthdaySearchService';
import { BIRTHSTONE_DATA } from '@/data/birthstoneData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Calendar, Star, Gem, Hash, ArrowRight } from 'lucide-react';

// ── Month map ────────────────────────────────────────────────────────────────
const MONTH_MAP: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};
const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ── Zodiac helper ────────────────────────────────────────────────────────────
function getZodiac(month: number, day: number) {
  const Z = [
    { sign: 'Capricorn', symbol: '♑', slug: 'capricorn', start: [12, 22], end: [1, 19] },
    { sign: 'Aquarius',  symbol: '♒', slug: 'aquarius',  start: [1, 20],  end: [2, 18] },
    { sign: 'Pisces',    symbol: '♓', slug: 'pisces',    start: [2, 19],  end: [3, 20] },
    { sign: 'Aries',     symbol: '♈', slug: 'aries',     start: [3, 21],  end: [4, 19] },
    { sign: 'Taurus',    symbol: '♉', slug: 'taurus',    start: [4, 20],  end: [5, 20] },
    { sign: 'Gemini',    symbol: '♊', slug: 'gemini',    start: [5, 21],  end: [6, 20] },
    { sign: 'Cancer',    symbol: '♋', slug: 'cancer',    start: [6, 21],  end: [7, 22] },
    { sign: 'Leo',       symbol: '♌', slug: 'leo',       start: [7, 23],  end: [8, 22] },
    { sign: 'Virgo',     symbol: '♍', slug: 'virgo',     start: [8, 23],  end: [9, 22] },
    { sign: 'Libra',     symbol: '♎', slug: 'libra',     start: [9, 23],  end: [10, 22] },
    { sign: 'Scorpio',   symbol: '♏', slug: 'scorpio',   start: [10, 23], end: [11, 21] },
    { sign: 'Sagittarius', symbol: '♐', slug: 'sagittarius', start: [11, 22], end: [12, 21] },
  ];
  for (const z of Z) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if ((month === sm && day >= sd) || (month === em && day <= ed)) return z;
  }
  return Z[0];
}

// ── Historical events ────────────────────────────────────────────────────────
const EVENTS: Record<string, { year: number; event: string }[]> = {
  '01-01': [
    { year: 45,   event: 'Julius Caesar introduces the Julian calendar' },
    { year: 1863, event: 'President Lincoln\'s Emancipation Proclamation takes effect' },
    { year: 1901, event: 'Australia becomes a federation' },
    { year: 1999, event: 'Euro currency introduced in 11 European nations' },
    { year: 2002, event: 'Euro banknotes and coins enter circulation' },
  ],
  '02-14': [
    { year: 269,  event: 'Saint Valentine is martyred in Rome' },
    { year: 1929, event: 'Valentine\'s Day Massacre in Chicago' },
    { year: 1876, event: 'Alexander Graham Bell applies for telephone patent' },
    { year: 1990, event: 'Voyager 1 takes the "Pale Blue Dot" photograph of Earth' },
    { year: 2005, event: 'YouTube is founded' },
  ],
  '03-17': [
    { year: 461,  event: 'Death of Saint Patrick, patron saint of Ireland' },
    { year: 1845, event: 'Stephen Perry patents the rubber band' },
    { year: 1958, event: 'Vanguard 1 satellite launched — oldest still in orbit' },
    { year: 1969, event: 'Golda Meir becomes Israel\'s first female Prime Minister' },
    { year: 2020, event: 'First nationwide lockdown orders issued across Europe' },
  ],
  '04-01': [
    { year: 1700, event: 'April Fools\' Day celebrated across Europe for the first time en masse' },
    { year: 1865, event: 'Union troops capture Five Forks, effectively ending the Civil War' },
    { year: 1976, event: 'Apple Computer Company founded by Steve Jobs and Steve Wozniak' },
    { year: 2001, event: 'The Netherlands becomes the first country to legalise same-sex marriage' },
    { year: 2004, event: 'Google introduces Gmail' },
  ],
  '06-13': [
    { year: 1944, event: 'First German V-1 flying bomb attack on London' },
    { year: 1966, event: 'Miranda v. Arizona Supreme Court ruling establishes Miranda rights (USA)' },
    { year: 1971, event: 'Pentagon Papers published by the New York Times' },
    { year: 1983, event: 'Pioneer 10 becomes the first spacecraft to leave the solar system' },
    { year: 2000, event: 'South Korean President Kim Dae-jung meets North Korean leader Kim Jong-il in historic summit' },
  ],
  '07-04': [
    { year: 1776, event: 'United States Declaration of Independence adopted by Continental Congress' },
    { year: 1826, event: 'John Adams and Thomas Jefferson both die on the 50th anniversary of Independence' },
    { year: 1863, event: 'Battle of Gettysburg ends — turning point of the American Civil War' },
    { year: 1934, event: 'Marie Curie dies from aplastic anaemia caused by radiation exposure' },
    { year: 2012, event: 'CERN announces discovery of the Higgs boson particle' },
  ],
  '08-15': [
    { year: 1945, event: 'Japan announces surrender, ending World War II (V-J Day)' },
    { year: 1947, event: 'India gains independence from British rule' },
    { year: 1969, event: 'Woodstock Music Festival begins in New York' },
    { year: 1971, event: 'US abandons the gold standard (Nixon Shock)' },
    { year: 2021, event: 'Taliban seize Kabul as US-backed Afghan government collapses' },
  ],
  '09-11': [
    { year: 1789, event: 'Alexander Hamilton appointed first US Secretary of the Treasury' },
    { year: 1973, event: 'Military coup overthrows Chilean President Salvador Allende' },
    { year: 2001, event: 'Terrorist attacks on the World Trade Center and Pentagon — 2,977 killed' },
    { year: 2012, event: 'US consulate attack in Benghazi, Libya' },
    { year: 2018, event: 'Hurricane Florence makes landfall in North Carolina' },
  ],
  '10-31': [
    { year: 1517, event: 'Martin Luther posts his 95 Theses, sparking the Protestant Reformation' },
    { year: 1517, event: 'Halloween traditions trace to Celtic Samhain festival' },
    { year: 1941, event: 'Mount Rushmore construction is completed' },
    { year: 1984, event: 'Indian Prime Minister Indira Gandhi is assassinated' },
    { year: 2011, event: 'World population reaches 7 billion' },
  ],
  '11-11': [
    { year: 1918, event: 'Armistice Day — World War I ends at the 11th hour of the 11th day of the 11th month' },
    { year: 1620, event: 'Mayflower Compact signed by Pilgrim colonists' },
    { year: 1926, event: 'US Route 66 is established' },
    { year: 1965, event: 'Rhodesia (Zimbabwe) declares independence from Britain' },
    { year: 2011, event: 'Iconic 11/11/11 — once-in-a-century date' },
  ],
  '12-25': [
    { year: 800,  event: 'Charlemagne crowned Holy Roman Emperor on Christmas Day' },
    { year: 1066, event: 'William the Conqueror crowned King of England at Westminster' },
    { year: 1776, event: 'George Washington crosses the Delaware River — Battle of Trenton' },
    { year: 1914, event: 'Christmas Day Truce — British and German troops meet in No Man\'s Land' },
    { year: 1991, event: 'Mikhail Gorbachev resigns, formally dissolving the Soviet Union' },
  ],
  '12-31': [
    { year: 1759, event: 'Arthur Guinness signs a 9,000-year lease for the Dublin brewery' },
    { year: 1879, event: 'Thomas Edison gives the first public demonstration of his electric light' },
    { year: 1999, event: 'World prepares for the Y2K millennium bug — largely without incident' },
    { year: 1999, event: 'Vladimir Putin becomes Acting President of Russia' },
    { year: 2019, event: 'Wuhan Municipal Health Commission reports first cluster of pneumonia cases (COVID-19)' },
  ],
};

// ── Map Supabase result ───────────────────────────────────────────────────────
const CY = new Date().getFullYear();
function mapResult(r: CelebrityBirthdayResult): DisplayCelebrity {
  const birthYear = r.birthDate ? parseInt(r.birthDate.substring(0, 4)) : null;
  const deathYear = r.deathDate ? parseInt(r.deathDate.substring(0, 4)) : null;
  const age = r.isLiving
    ? (birthYear ? CY - birthYear : null)
    : (birthYear && deathYear ? deathYear - birthYear : null);
  return {
    name: r.name, birthYear, deathYear, age,
    isLiving: r.isLiving,
    occupation: r.occupation || 'Celebrity',
    imageUrl: null,
    wikipediaUrl: r.wikipediaUrl,
    sitelinks: r.sitelinks,
  };
}

// ── Zodiac descriptions ──────────────────────────────────────────────────────
const ZODIAC_BLURBS: Record<string, string> = {
  Aries: 'Aries (March 21 – April 19) is the first sign of the zodiac, ruled by Mars. People born under Aries are known for their courage, determination, and pioneering spirit. They tend to be energetic and passionate, often leaping into new ventures with infectious enthusiasm.',
  Taurus: 'Taurus (April 20 – May 20) is ruled by Venus. Those born under this sign are known for their reliability, patience, and appreciation of beauty and comfort. Taurus individuals bring stability and determination to everything they pursue.',
  Gemini: 'Gemini (May 21 – June 20) is ruled by Mercury. Geminis are celebrated for their adaptability, curiosity, and quick wit. They are excellent communicators who thrive on variety and intellectual stimulation.',
  Cancer: 'Cancer (June 21 – July 22) is ruled by the Moon. Cancer individuals are deeply intuitive, emotionally intelligent, and fiercely loyal. They are natural caregivers who create warmth and security around them.',
  Leo: 'Leo (July 23 – August 22) is ruled by the Sun. Leos are known for their charisma, creativity, and natural leadership. They bring warmth, generosity, and theatrical flair to everything they do.',
  Virgo: 'Virgo (August 23 – September 22) is ruled by Mercury. Virgos are known for their analytical minds, attention to detail, and practical approach to life. They bring precision and helpfulness to every endeavour.',
  Libra: 'Libra (September 23 – October 22) is ruled by Venus. Librans are known for their sense of balance, justice, and love of beauty. They are natural diplomats who seek harmony in all relationships.',
  Scorpio: 'Scorpio (October 23 – November 21) is ruled by Pluto. Scorpios are known for their intensity, passion, and perceptiveness. They are deeply transformative personalities who pursue truth with relentless determination.',
  Sagittarius: 'Sagittarius (November 22 – December 21) is ruled by Jupiter. Sagittarians are known for their optimism, love of freedom, and philosophical outlook. They are natural adventurers and truth-seekers.',
  Capricorn: 'Capricorn (December 22 – January 19) is ruled by Saturn. Capricorns are known for their ambition, discipline, and practical wisdom. They build towards long-term goals with patience and determination.',
  Aquarius: 'Aquarius (January 20 – February 18) is ruled by Uranus. Aquarians are known for their originality, humanitarian outlook, and progressive thinking. They are visionary individuals who challenge conventions.',
  Pisces: 'Pisces (February 19 – March 20) is ruled by Neptune. Pisceans are known for their empathy, creativity, and spiritual depth. They are highly intuitive individuals with a rich inner world.',
};

// ── Component ────────────────────────────────────────────────────────────────
export default function BirthdayDate() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [celebrities, setCelebrities] = useState<DisplayCelebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Parse "june-13" → month=6, day=13
  const parts = (date || '').toLowerCase().split('-');
  const monthName = parts[0] || '';
  const dayStr = parts.slice(1).join('-'); // handles hyphenated day edge cases
  const month = MONTH_MAP[monthName] ?? 0;
  const day = parseInt(dayStr) || 0;

  const valid = month > 0 && day >= 1 && day <= 31;

  useEffect(() => {
    if (!valid) { navigate('/todays-birthdays', { replace: true }); return; }
    const monthDay = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setLoading(true);
    getRankedBirthdayCelebrities(monthDay, null, 20)
      .then(res => setCelebrities(res.map(mapResult)))
      .catch(() => setCelebrities([]))
      .finally(() => setLoading(false));
  }, [date, valid, month, day, navigate]);

  if (!valid) return null;

  const monthName2 = MONTH_NAMES[month];
  const label = `${monthName2} ${day}`;
  const slug = `${monthName}-${day}`;
  const zodiac = getZodiac(month, day);
  const birthstone = BIRTHSTONE_DATA.find(b => b.monthNumber === month);
  const currentYear = new Date().getFullYear();
  const dayOfWeek = new Date(currentYear, month - 1, day).toLocaleDateString('en-US', { weekday: 'long' });
  const monthDayKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const events = EVENTS[monthDayKey] || [];
  const topCeleb = celebrities[0]?.name;
  const shown = showAll ? celebrities : celebrities.slice(0, 6);
  const wikiOnThisDay = `https://en.wikipedia.org/wiki/${monthName2}_${day}`;

  // FAQ schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Who are the most famous celebrities born on ${label}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: topCeleb
            ? `Some of the most famous people born on ${label} include ${topCeleb}${celebrities[1] ? `, ${celebrities[1].name}` : ''}${celebrities[2] ? `, and ${celebrities[2].name}` : ''}.`
            : `Explore our database of celebrities born on ${label}.`,
        },
      },
      {
        '@type': 'Question',
        name: `What zodiac sign is ${label}?`,
        acceptedAnswer: { '@type': 'Answer', text: `People born on ${label} are ${zodiac.sign} (${zodiac.symbol}).` },
      },
      {
        '@type': 'Question',
        name: `What is the birthstone for ${monthName2}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: birthstone
            ? `The birthstone for ${monthName2} is ${birthstone.primaryStone}. ${birthstone.meaning}.`
            : `See our birthstone guide for ${monthName2}.`,
        },
      },
      {
        '@type': 'Question',
        name: `What day of the week does ${label} fall on in ${currentYear}?`,
        acceptedAnswer: { '@type': 'Answer', text: `${label} ${currentYear} falls on a ${dayOfWeek}.` },
      },
      {
        '@type': 'Question',
        name: `How many celebrities are born on ${label}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Our database currently lists ${celebrities.length} notable people born on ${label}. The count grows as we add more records.`,
        },
      },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bornclock.com/' },
      { '@type': 'ListItem', position: 2, name: 'Birthday', item: 'https://bornclock.com/birthday' },
      { '@type': 'ListItem', position: 3, name: label, item: `https://bornclock.com/birthday/${slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title={`Celebrities Born on ${label} — Famous Birthdays | BornClock`}
        description={`Discover famous people born on ${label}.${topCeleb ? ` See ${topCeleb}` : ''} and ${celebrities.length} more celebrities who share this birthday, with their zodiac sign, age, and more.`}
        keywords={`celebrities born on ${label}, famous birthdays ${monthName2} ${day}, who was born on ${label}${topCeleb ? `, ${topCeleb} birthday` : ''}`}
        canonicalUrl={`/birthday/${slug}`}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link to="/birthday" className="hover:text-foreground transition-colors">Birthday</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{label}</span>
        </nav>

        {/* H1 */}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          Famous Celebrities Born on {label}
        </h1>

        {/* Quick facts bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { icon: Star, label: 'Zodiac', value: `${zodiac.symbol} ${zodiac.sign}` },
            { icon: Gem, label: 'Birthstone', value: birthstone?.primaryStone || '—' },
            { icon: Calendar, label: `Day in ${currentYear}`, value: dayOfWeek },
            { icon: Hash, label: 'In Database', value: `${celebrities.length} celebrities` },
          ].map(({ icon: Icon, label: l, value: v }) => (
            <div key={l} className="bg-card border border-border rounded-xl p-3 text-center">
              <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{l}</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{v}</p>
            </div>
          ))}
        </div>

        {/* Celebrity grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-5">
            Famous People Born on {label}
          </h2>
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading celebrities…</p>
            </div>
          ) : celebrities.length === 0 ? (
            <Card className="glass-card p-8 text-center">
              <p className="text-muted-foreground">No celebrities found for this date in our database.</p>
              <p className="text-sm text-muted-foreground mt-2">
                <a href={wikiOnThisDay} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Browse Wikipedia's "On This Day" for {label} →
                </a>
              </p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {shown.map((celeb, i) => (
                  <CelebrityCard key={celeb.name} celebrity={celeb} index={i} />
                ))}
              </div>
              {celebrities.length > 6 && (
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setShowAll(v => !v)}
                  >
                    {showAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {showAll
                      ? 'Show fewer'
                      : `Show all ${celebrities.length} celebrities born on this date`}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Historical events */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Historical Events on {label}</h2>
          {events.length > 0 ? (
            <div className="space-y-3">
              {events.map(ev => (
                <div key={ev.year} className="flex gap-4 bg-card border border-border rounded-xl p-4">
                  <div className="shrink-0 w-14 text-center">
                    <span className="text-lg font-black text-primary">{ev.year}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{ev.event}</p>
                </div>
              ))}
            </div>
          ) : (
            <Card className="glass-card p-6 text-center">
              <p className="text-muted-foreground text-sm mb-3">
                Explore what happened on {label} throughout history.
              </p>
              <a
                href={wikiOnThisDay}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
              >
                Browse Wikipedia's "On This Day" for {label} →
              </a>
            </Card>
          )}
        </section>

        {/* Zodiac section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Zodiac Sign for {label}</h2>
          <Card className="glass-card p-6">
            <div className="flex items-start gap-4">
              <span className="text-5xl">{zodiac.symbol}</span>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">{zodiac.sign}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {ZODIAC_BLURBS[zodiac.sign] || ''}
                </p>
                <Link
                  to={`/zodiac/${zodiac.slug}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline text-sm mt-3"
                >
                  Full {zodiac.sign} guide →
                </Link>
              </div>
            </div>
          </Card>
        </section>

        {/* Fun birthday facts */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Fun Birthday Facts for {label}</h2>
          <div className="space-y-3">
            {[
              topCeleb && `The most famous person born on ${label} in our database is ${topCeleb}.`,
              celebrities.length > 0 && `People born on ${label} share their birthday with ${celebrities.length} notable people in our database.`,
              birthstone && `The birthstone for people born in ${monthName2} is ${birthstone.primaryStone} — associated with ${birthstone.meaning.toLowerCase()}.`,
              `Your next ${label} birthday falls on a ${new Date(currentYear + 1, month - 1, day).toLocaleDateString('en-US', { weekday: 'long' })}.`,
            ].filter(Boolean).map((fact, i) => (
              <div key={i} className="flex gap-3 bg-card border border-border rounded-xl p-4">
                <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                <p className="text-muted-foreground text-sm leading-relaxed">{fact}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-5">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqSchema.mainEntity.map((item) => (
              <div key={item.name} className="bg-card border border-border rounded-xl p-5">
                <p className="font-semibold text-foreground text-sm mb-2">{item.name}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-8">
          <Card className="glass-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">Find Your Own Celebrity Birthday Twin</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Enter your birthday to discover which famous person shares your exact birth date — plus your zodiac sign,
              numerology, planetary ages, and longevity forecast.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link to="/">
                Find My Birthday Twin <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </section>
      </div>

      <Footer />
    </div>
  );
}

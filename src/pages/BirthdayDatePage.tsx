import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SEO, FAQSchema } from '@/components/SEO';
import PageTagline from '@/components/PageTagline';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowRight, Check, TrendingUp, Calendar } from 'lucide-react';
import {
  getBirthdayPersonality, MONTH_NAMES, MONTH_DAYS,
  getPersonalityParagraph, getSecondPersonalityParagraph,
  getNumerologyDescription, getNumerologyDetailParagraph,
  getZodiacContextParagraph, getLifePathParagraph, getLifePathChallengeParagraph,
  getVedicContext,
} from '@/data/birthdayPersonality';

const ELEMENT_COLORS: Record<string, string> = {
  Fire:  'bg-red-50 border-red-200 text-red-800',
  Earth: 'bg-green-50 border-green-200 text-green-800',
  Air:   'bg-blue-50 border-blue-200 text-blue-800',
  Water: 'bg-cyan-50 border-cyan-200 text-cyan-800',
};

export default function BirthdayDatePage() {
  const { month: monthParam, day: dayParam } = useParams<{ month: string; day: string }>();
  const month = parseInt(monthParam || '1', 10);
  const day   = parseInt(dayParam   || '1', 10);

  const validMonth = month >= 1 && month <= 12;
  const maxDay     = MONTH_DAYS[month] ?? 31;
  const validDay   = day >= 1 && day <= maxDay;

  if (!validMonth || !validDay) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Date not found</h1>
          <p className="text-gray-500 mb-4">That date doesn't exist in the calendar.</p>
          <Button asChild><Link to="/birthday">Browse all birthdays</Link></Button>
        </div>
      </div>
    );
  }

  const p = getBirthdayPersonality(month, day);
  const monthName = MONTH_NAMES[month];
  const vedic = getVedicContext(month, day, p.zodiacSign);

  // Adjacent date navigation
  let prevMonth = month, prevDay = day - 1;
  if (prevDay < 1) { prevMonth = month === 1 ? 12 : month - 1; prevDay = MONTH_DAYS[prevMonth]; }
  let nextMonth = month, nextDay = day + 1;
  if (nextDay > maxDay) { nextMonth = month === 12 ? 1 : month + 1; nextDay = 1; }

  const title = `${monthName} ${day} Birthday — Personality, Zodiac & Famous People`;
  const description = `People born on ${monthName} ${day} are ${p.zodiacSign}s with Life Path ${p.lifePathNumber}. Discover your core traits, lucky day, compatible signs, and more.`;

  const faqs = [
    {
      question: `What zodiac sign is ${monthName} ${day}?`,
      answer: `People born on ${monthName} ${day} are ${p.zodiacSign} (${p.zodiacSymbol}), ruled by ${p.rulingPlanet}. ${p.zodiacSign} is a${p.element === 'Air' || p.element === 'Earth' ? 'n' : ''} ${p.element} sign.`,
    },
    {
      question: `What is the Life Path number for ${monthName} ${day}?`,
      answer: `The Life Path number for day ${day} is ${p.lifePathNumber}. This is calculated by reducing ${day} to a single digit (${day} → ${p.lifePathNumber}), representing ${['', 'leadership and independence', 'harmony and cooperation', 'creativity and expression', 'structure and dependability', 'freedom and adventure', 'nurturing and responsibility', 'analysis and wisdom', 'ambition and authority', 'compassion and service'][p.lifePathNumber]}.`,
    },
    {
      question: `What are the personality traits for ${monthName} ${day} birthdays?`,
      answer: `${monthName} ${day} birthdays are characterised by: ${p.coreTraits.join(', ')}. They are ${p.zodiacSign}s with a ${p.element} elemental nature, enhanced by the Life Path ${p.lifePathNumber} energy.`,
    },
    {
      question: `Who is compatible with ${monthName} ${day} birthdays?`,
      answer: `${monthName} ${day} (${p.zodiacSign}) is most compatible with ${p.compatibleSigns.join(', ')}. These signs share complementary elements and values that create strong, lasting connections.`,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={title}
        description={description}
        keywords={`${monthName} ${day} birthday, ${p.zodiacSign} personality, life path ${p.lifePathNumber}, ${monthName} ${day} zodiac sign, ${p.zodiacSign} traits`}
        canonicalUrl={`/birthday/${month}/${day}`}
        ogType="article"
        publishedTime="2026-06-18"
      />
      <FAQSchema items={faqs} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bornclock.com' },
            { '@type': 'ListItem', position: 2, name: 'Birthday Personality', item: 'https://bornclock.com/birthday' },
            { '@type': 'ListItem', position: 3, name: monthName, item: `https://bornclock.com/birthday/${month}` },
            { '@type': 'ListItem', position: 4, name: `${monthName} ${day}`, item: `https://bornclock.com/birthday/${month}/${day}` },
          ],
        })}</script>
      </Helmet>

      {/* Nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Navigation />
          <AuthNav />
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-3xl">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/birthday" className="hover:text-indigo-600 transition-colors">Birthday</Link>
          <span>/</span>
          <Link to={`/birthday/${month}`} className="hover:text-indigo-600 transition-colors">{monthName}</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium">{monthName} {day}</span>
        </nav>

        {/* H1 */}
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 leading-tight">
          {monthName} {day} Birthday — Personality, Zodiac &amp; Famous People
        </h1>
        <PageTagline />

        {/* Direct answer box */}
        <div className={`rounded-xl border-2 p-5 mb-8 ${ELEMENT_COLORS[p.element] ?? 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
          <p className="text-sm font-semibold leading-relaxed">
            People born on <strong>{monthName} {day}</strong> are{' '}
            <strong>{p.zodiacSign} {p.zodiacSymbol}</strong> — a {p.element} sign ruled by{' '}
            {p.rulingPlanet}, with a Life Path number of <strong>{p.lifePathNumber}</strong>.{' '}
            {p.personalityBlurb}
          </p>
        </div>

        {/* Core traits */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Core Personality Traits</h2>
          <div className="flex flex-wrap gap-2">
            {p.coreTraits.map(trait => (
              <span key={trait} className="bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full text-sm font-medium capitalize">
                {trait}
              </span>
            ))}
          </div>
        </section>

        {/* Strengths & Challenges */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                <Check className="w-4 h-4" /> Strengths
              </h3>
              <ul className="space-y-2">
                {p.strengths.map(s => (
                  <li key={s} className="text-sm text-green-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
                    <span className="capitalize">{s}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Growth Areas
              </h3>
              <ul className="space-y-2">
                {p.challenges.map(c => (
                  <li key={c} className="text-sm text-amber-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                    <span className="capitalize">{c}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Lucky day & color */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Lucky Attributes</h2>
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center border-indigo-100">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Lucky Day</p>
                <p className="text-base font-black text-indigo-700">{p.luckyDay}</p>
              </CardContent>
            </Card>
            <Card className="text-center border-indigo-100">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Lucky Color</p>
                <p className="text-base font-black text-indigo-700">{p.luckyColor}</p>
              </CardContent>
            </Card>
            <Card className="text-center border-indigo-100">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Lucky Number</p>
                <p className="text-base font-black text-indigo-700">{p.luckyNumber}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Compatible signs */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Compatible Zodiac Signs</h2>
          <div className="flex flex-wrap gap-2">
            {p.compatibleSigns.map(sign => (
              <Badge key={sign} variant="outline" className="text-sm px-3 py-1.5 border-indigo-300 text-indigo-700">
                {sign}
              </Badge>
            ))}
          </div>
        </section>

        {/* Date fact */}
        <section className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            <Calendar className="w-4 h-4 inline mr-1.5 text-indigo-500" />
            About {monthName} {day}
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{p.dateFact}</p>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white text-center">
          <h2 className="text-lg font-bold mb-2">Find who shares your {monthName} {day} birthday</h2>
          <p className="text-sm text-indigo-100 mb-4">
            Discover famous people born on your exact date — athletes, artists, scientists, and leaders.
          </p>
          <Button asChild className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold">
            <Link to={`/?birthDate=${month}/${day}`}>
              Explore Your Birthday <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
        </div>

        {/* Personality Deep Dive */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {monthName} {day} Personality Deep Dive
          </h2>
          <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
            <p className="leading-relaxed">{getPersonalityParagraph(p.zodiacSign, p.lifePathNumber)}</p>
            <p className="leading-relaxed">{getSecondPersonalityParagraph(p.element)}</p>
          </div>
        </section>

        {/* Numerology Context */}
        <section className="mb-8 bg-indigo-50 border border-indigo-100 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {getNumerologyDescription(p.lifePathNumber)}
          </h2>
          <p className="text-xs text-indigo-600 font-semibold mb-3 uppercase tracking-wide">
            Your numerological foundation
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {getNumerologyDetailParagraph(p.lifePathNumber)}
          </p>
        </section>

        {/* Zodiac Sign Context */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {p.zodiacSign} {p.zodiacSymbol} — Your Zodiac Sign
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {getZodiacContextParagraph(p.zodiacSign)}
          </p>
        </section>

        {/* Indian Astrology — Rashi & Nakshatra */}
        <section className="mb-8 bg-orange-50 border border-orange-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            🕉️ Indian Astrology — Rashi &amp; Nakshatra
          </h2>
          <p className="text-xs text-orange-700 font-semibold uppercase tracking-wide mb-4">
            Vedic perspective for {monthName} {day} birthdays
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-white rounded-lg p-4 border border-orange-100">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">Rashi (Vedic Sun Sign)</p>
              <p className="text-lg font-black text-gray-900">{vedic.rashiSanskrit}</p>
              <p className="text-sm text-gray-500 mb-2">{vedic.rashi} · {vedic.rashiMeaning}</p>
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Ruling Planet:</span> {vedic.rashiLord}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-orange-100">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">Nakshatra (Lunar Mansion)</p>
              <p className="text-lg font-black text-gray-900">{vedic.nakshatra}</p>
              <p className="text-sm text-gray-500 mb-2">{vedic.nakshatraMeaning}</p>
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Deity:</span> {vedic.nakshatraDeity}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mt-4">
            Those born under <strong>{vedic.nakshatra}</strong> nakshatra embody{' '}
            <strong>{vedic.nakshatraQuality}</strong>. In Vedic tradition, the nakshatra
            at birth shapes the inner emotional landscape, while the Rashi ({vedic.rashiSanskrit})
            reflects the outer personality and life approach. Together, they offer a deeper
            layer of self-understanding beyond the Western zodiac.
          </p>
        </section>

        {/* Life Path Purpose */}
        <section className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Your Life Path {p.lifePathNumber} Purpose &amp; Growth Edge
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">Core Purpose</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{getLifePathParagraph(p.lifePathNumber)}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">Growth Edge</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{getLifePathChallengeParagraph(p.lifePathNumber)}</p>
            </div>
          </div>
        </section>

        {/* Adjacent date navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <Link
            to={`/birthday/${prevMonth}/${prevDay}`}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {MONTH_NAMES[prevMonth]} {prevDay}
          </Link>
          <Link
            to={`/birthday/${month}`}
            className="text-xs text-gray-400 hover:text-indigo-600 transition-colors"
          >
            All {monthName} Birthdays
          </Link>
          <Link
            to={`/birthday/${nextMonth}/${nextDay}`}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
          >
            {MONTH_NAMES[nextMonth]} {nextDay}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* FAQ — kept last for SEO structured data */}
        <section className="mt-10 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">{faq.question}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

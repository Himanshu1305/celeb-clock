import { useParams, Navigate, Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO, FAQSchema } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { CHINESE_SIGN_EXTENDED } from '@/services/ChineseZodiacService';

const ANIMALS_ORDER = ['rat','ox','tiger','rabbit','dragon','snake','horse','goat','monkey','rooster','dog','pig'];

const ANIMAL_EMOJI: Record<string, string> = {
  rat: '🐭', ox: '🐂', tiger: '🐯', rabbit: '🐰', dragon: '🐉', snake: '🐍',
  horse: '🐴', goat: '🐐', monkey: '🐒', rooster: '🐓', dog: '🐕', pig: '🐷',
};

const ANIMAL_ELEMENT: Record<string, string> = {
  rat: 'Water', ox: 'Earth', tiger: 'Wood', rabbit: 'Wood', dragon: 'Earth', snake: 'Fire',
  horse: 'Fire', goat: 'Earth', monkey: 'Metal', rooster: 'Metal', dog: 'Earth', pig: 'Water',
};

export default function ChineseZodiacSign() {
  const { animal } = useParams<{ animal: string }>();
  const slug = (animal || '').toLowerCase();
  const capitalised = slug.charAt(0).toUpperCase() + slug.slice(1);
  const data = CHINESE_SIGN_EXTENDED[capitalised];

  if (!data) return <Navigate to="/chinese-zodiac" replace />;

  const idx = ANIMALS_ORDER.indexOf(slug);
  const prevAnimal = ANIMALS_ORDER[(idx - 1 + 12) % 12];
  const nextAnimal = ANIMALS_ORDER[(idx + 1) % 12];

  const emoji = ANIMAL_EMOJI[slug] ?? '🐾';
  const element = ANIMAL_ELEMENT[slug] ?? '';

  const faqItems = [
    {
      question: `What years are ${capitalised} years in the Chinese Zodiac?`,
      answer: `${capitalised} years include: ${data.years.join(', ')}. The next ${capitalised} year repeats every 12 years.`,
    },
    {
      question: `What is the ${capitalised}'s personality in Chinese astrology?`,
      answer: data.personality_deep.split('\n\n')[0],
    },
    {
      question: `Who is the ${capitalised} most compatible with?`,
      answer: `The ${capitalised} is most compatible with ${data.compatibility_best.join(', ')} and least compatible with ${data.compatibility_worst.join(', ')}.`,
    },
    {
      question: `What are the ${capitalised}'s lucky colors and numbers?`,
      answer: `Lucky colors: ${data.lucky_colors.join(', ')}. Lucky numbers: ${data.lucky_numbers.join(', ')}. Lucky directions: ${data.lucky_directions.join(', ')}.`,
    },
    {
      question: `What is the ${capitalised}'s outlook for 2026?`,
      answer: data.outlook_2026,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <FAQSchema items={faqItems} />
      <SEO
        title={`Year of the ${capitalised} — Chinese Zodiac Sign Guide | BornClock`}
        description={`${capitalised} Chinese Zodiac: personality, compatibility, lucky elements, famous ${capitalised}s, and 2026 outlook. Years: ${data.years.slice(0,5).join(', ')}…`}
        keywords={`year of the ${slug}, ${slug} chinese zodiac, ${slug} personality, ${slug} compatibility, chinese zodiac ${slug}`}
        canonicalUrl={`/chinese-zodiac/${slug}`}
        ogImage="https://bornclock.com/og/zodiac.png"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/chinese-zodiac" className="hover:text-foreground">Chinese Zodiac</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{capitalised}</span>
        </nav>

        {/* Hero */}
        <section className="text-center py-10 max-w-3xl mx-auto mb-10">
          <div className="text-8xl mb-4">{emoji}</div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Year of the {capitalised}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            {element} element · Chinese Zodiac Sign {idx + 1} of 12
          </p>
          {/* Years row */}
          <div className="flex flex-wrap justify-center gap-2">
            {data.years.map((y) => (
              <span key={y} className="px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-full text-sm font-medium">
                {y}
              </span>
            ))}
          </div>
        </section>

        <div className="max-w-4xl mx-auto space-y-8">

          {/* Personality */}
          <Card className="glass-card">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Personality Deep Dive</h2>
              {data.personality_deep.split('\n\n').map((para, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed mb-4 last:mb-0">{para}</p>
              ))}
            </CardContent>
          </Card>

          {/* Strengths / Challenges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card border-green-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-3 text-green-700">✅ Strengths</h2>
                <p className="text-muted-foreground leading-relaxed">{data.strengths_detail}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-amber-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-3 text-amber-700">⚠️ Challenges</h2>
                <p className="text-muted-foreground leading-relaxed">{data.challenges_detail}</p>
              </CardContent>
            </Card>
          </div>

          {/* Love / Career / Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-3">❤️ In Love</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{data.in_love}</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-3">💼 In Career</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{data.in_career}</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-3">🏃 In Health</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{data.in_health}</p>
              </CardContent>
            </Card>
          </div>

          {/* Lucky Elements */}
          <Card className="glass-card">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Lucky Elements</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">Lucky Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.lucky_colors.map((c) => (
                      <span key={c} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">{c}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">Lucky Numbers</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.lucky_numbers.map((n) => (
                      <span key={n} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">{n}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">Lucky Directions</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.lucky_directions.map((d) => (
                      <span key={d} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compatibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-3 text-green-700">Best Compatibility</h2>
                <div className="flex flex-wrap gap-2">
                  {data.compatibility_best.map((a) => (
                    <Link key={a} to={`/chinese-zodiac/${a.toLowerCase()}`}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors">
                      {a}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-3 text-red-600">Challenging Matches</h2>
                <div className="flex flex-wrap gap-2">
                  {data.compatibility_worst.map((a) => (
                    <Link key={a} to={`/chinese-zodiac/${a.toLowerCase()}`}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200 transition-colors">
                      {a}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Famous People */}
          <Card className="glass-card">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Famous {capitalised}s</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {data.famous_people.map((p) => (
                  <div key={p.name} className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl mb-1">{emoji}</div>
                    <p className="text-xs font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">b. {p.born}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 2026 Outlook */}
          <Card className="border-amber-300 bg-amber-50/50">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4 text-amber-800">🔮 2026 Outlook for the {capitalised}</h2>
              <p className="text-amber-900 leading-relaxed">{data.outlook_2026}</p>
            </CardContent>
          </Card>

          {/* Cultural Significance */}
          <Card className="glass-card">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Cultural Significance</h2>
              <p className="text-muted-foreground leading-relaxed">{data.cultural_significance}</p>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="glass-card">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {faqItems.map((faq, i) => (
                  <div key={i} className="border-b border-border/40 pb-5 last:border-0 last:pb-0">
                    <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prev / Next navigation */}
          <div className="flex justify-between items-center pt-4 pb-8">
            <Link
              to={`/chinese-zodiac/${prevAnimal}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
            >
              ← {ANIMAL_EMOJI[prevAnimal]} {prevAnimal.charAt(0).toUpperCase() + prevAnimal.slice(1)}
            </Link>
            <Link to="/chinese-zodiac" className="text-sm text-muted-foreground hover:text-foreground">
              All Chinese Zodiac Signs
            </Link>
            <Link
              to={`/chinese-zodiac/${nextAnimal}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
            >
              {ANIMAL_EMOJI[nextAnimal]} {nextAnimal.charAt(0).toUpperCase() + nextAnimal.slice(1)} →
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

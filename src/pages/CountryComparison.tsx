import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SEO, FAQSchema } from '@/components/SEO';
import { Globe, Search, ArrowUpDown, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import {
  BIRTH_BASELINES,
  COUNTRY_FLAG_EMOJI,
  getForecastForCountry,
} from '@/services/LongevityCalculationService';

export { getForecastForCountry } from '@/services/LongevityCalculationService';

// ── FAQ items ────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    question: 'Which country has the highest life expectancy in 2024?',
    answer: 'Monaco leads globally at 89.8 years, followed by Singapore (86.7), Macau (85.3), and Japan (85.2). [CIA World Factbook, 2024] Among major nations, Japan consistently ranks first, driven by diet, universal healthcare, and obesity rates below 4%.',
  },
  {
    question: 'Why does Japan have such high life expectancy?',
    answer: "Japan's longevity advantage comes from a combination of factors: a traditional diet rich in fish, fermented foods, and vegetables with minimal red meat; universal healthcare; very low obesity rates (3.6% vs 36% in the USA); and the practice of 'hara hachi bu' — stopping eating when 80% full. Remarkably, Japan had G7's SHORTEST life expectancy as recently as 1960. The dramatic reversal was driven by post-war nutritional improvements and healthcare investment. [European Journal of Clinical Nutrition, Nature, 2021]",
  },
  {
    question: 'Why does the USA have lower life expectancy than other wealthy countries?',
    answer: 'Despite spending more per person on healthcare than any nation on Earth, Americans born in 2024 are expected to live to 79 — 3.7 years below the comparable country average of 82.7. The gap is driven by diet quality (ultra-processed food consumption), gun violence, drug overdose deaths, and healthcare access inequality rather than lack of medical technology. [Scientific American, 2026; Peterson-KFF Health System Tracker, 2026]',
  },
  {
    question: 'How much does your country affect your life expectancy?',
    answer: 'Country of residence accounts for approximately 10-15 years of the 30-year gap between the world\'s highest and lowest life expectancy nations. However, individual lifestyle choices — diet, exercise, sleep, smoking, social connections — can add or subtract up to 14 additional years regardless of country. [Khaw et al., PLOS Medicine, 2008]',
  },
  {
    question: "What is the difference between India's best and worst states for life expectancy?",
    answer: 'India has significant internal variation. Kerala consistently records life expectancy comparable to many European nations (around 77+ years), while some northeastern and rural states record figures in the low 60s. The gap reflects differences in healthcare infrastructure, education, diet, and economic development. India\'s national average of ~72 years masks this important variation. [India NFHS-5, 2021; UN WPP 2024]',
  },
  {
    question: "Can lifestyle choices overcome a country's low life expectancy?",
    answer: "Yes — significantly. Research shows that four key behaviors (not smoking, moderate exercise, healthy diet, moderate alcohol) add approximately 14 years of life expectancy, regardless of country. A health-conscious person in India can statistically outlive a sedentary person in Japan. BornClock's personalized calculator shows exactly how your habits interact with your country's baseline. [Khaw et al., PLOS Medicine, 2008]",
  },
  {
    question: 'Where does the life expectancy data come from?',
    answer: 'All baseline figures are from the UN World Population Prospects 2024 edition, the gold standard for global demographic data. Birth baselines represent period life expectancy at birth, disaggregated by sex. Conditional (age-adjusted) baselines are applied for users aged 40 and above.',
  },
  {
    question: 'How accurate are these forecasts?',
    answer: 'These are statistical estimates, not individual predictions. Life expectancy data captures population averages; individual outcomes depend on genetics, access to healthcare, socioeconomic factors, and lifestyle choices not fully captured here. The tool is educational — it helps illustrate how geography intersects with longevity.',
  },
];

// ── Country insights for table hover ─────────────────────────────────────────

const COUNTRY_INSIGHTS: Record<string, string> = {
  'Japan': "Fish-heavy diet, universal healthcare, obesity rate <4%. Dramatic reversal from G7's shortest lifespan in 1960.",
  'Switzerland': 'Universal healthcare, clean air, high income equality, and Alpine lifestyle combine for Europe\'s top longevity.',
  'Spain': 'Mediterranean diet, afternoon rest culture, strong family bonds, and universal healthcare. A Blue Zone country at scale.',
  'France': 'The French paradox — high-fat diet yet low cardiovascular disease — driven by small portions, red wine polyphenols, and relaxed mealtime culture.',
  'Australia': 'Outdoor lifestyle, diverse Mediterranean-influenced diet, low smoking rates, and excellent preventive healthcare.',
  'Italy': 'Home to Sardinia — a Blue Zone. Mediterranean diet, daily physical activity, and multigenerational family structures.',
  'Singapore': "Asia's health miracle: universal healthcare, mandatory savings for medical expenses, and a multi-ethnic diet rich in fish and vegetables.",
  'South Korea': 'Rapid economic development combined with traditional diet (kimchi, vegetables, minimal processed food) and world-class healthcare.',
  'Israel': 'Strong Mediterranean diet adherence, universal healthcare, high social cohesion, and active lifestyle culture.',
  'United States': 'Despite highest healthcare spending globally, diet quality, gun violence, overdose deaths, and inequality create a longevity gap vs peers.',
  'India': 'Improving rapidly — vegetarian diet tradition is protective, but air quality, healthcare access gaps, and sedentary urban lifestyles create challenges.',
  'Nigeria': 'Healthcare infrastructure challenges and infectious disease burden drive low averages — urban populations significantly outperform national figures.',
  'Canada': 'Universal healthcare, high immigration of health-conscious populations, diverse diet, and strong preventive care culture.',
  'United Kingdom': 'NHS universal healthcare, declining smoking rates, and Mediterranean diet adoption have steadily improved outcomes.',
};

// ── Tier badge ────────────────────────────────────────────────────────────────

function getTier(forecast: number): { label: string; cls: string } {
  if (forecast > 88) return { label: '🌟 Elite', cls: 'bg-purple-100 text-purple-800' };
  if (forecast >= 85) return { label: '🟢 Excellent', cls: 'bg-green-100 text-green-800' };
  if (forecast >= 80) return { label: '🔵 Strong', cls: 'bg-blue-100 text-blue-800' };
  if (forecast >= 75) return { label: '🟡 Average', cls: 'bg-yellow-100 text-yellow-800' };
  return { label: '🔴 Below Avg', cls: 'bg-red-100 text-red-800' };
}

// ── FAQ accordion ─────────────────────────────────────────────────────────────

function CountryFAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="glass-card">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="font-medium text-sm text-foreground">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{a}</div>
      )}
    </Card>
  );
}

// ── Saved result shape ────────────────────────────────────────────────────────

interface SavedResult {
  healthAdjustment: number;
  geneticAdjustment: number;
  epigeneticAdjustment: number;
  communityBonus: number;
  currentAge: number;
  gender: 'male' | 'female' | '';
  country: string;
  totalForecast: number;
}

type SortKey = 'country' | 'forecast' | 'difference';

// ── Blog cross-links ──────────────────────────────────────────────────────────

const BLOG_LINKS = [
  {
    slug: 'best-foods-to-eat-to-live-longer-longevity-diet',
    title: 'The Longevity Diet: 15 Best Foods to Eat to Live Longer',
    teaser: 'Discover what people in Japan, Sardinia, and other Blue Zones actually eat — and the science behind why it works.',
    readTime: 11,
  },
  {
    slug: 'how-exercise-affects-life-expectancy-workout-guide',
    title: 'How Exercise Affects Life Expectancy: The Complete Guide',
    teaser: 'The landmark study of 650,000 adults found just 75 minutes of vigorous exercise per week adds 3.4 years. Here\'s how.',
    readTime: 9,
  },
  {
    slug: 'loneliness-deadly-as-smoking-social-connection-longevity',
    title: 'Loneliness Is as Deadly as Smoking: Social Connection & Longevity',
    teaser: 'Social isolation reduces life expectancy by 26% — comparable to smoking 15 cigarettes per day. What Japan and Sardinia got right.',
    readTime: 8,
  },
  {
    slug: 'secrets-of-people-who-live-to-100-centenarian-habits',
    title: 'Secrets of People Who Live to 100: Centenarian Habits',
    teaser: 'What do the world\'s oldest people have in common? Research across 5 Blue Zones reveals surprising patterns.',
    readTime: 10,
  },
];

// ── Share text options ────────────────────────────────────────────────────────

const SHARE_OPTIONS = [
  {
    id: 'A',
    text: 'Did you know the gap between the longest and shortest-lived countries is 30+ years? I just compared my longevity forecast across 57 countries at bornclock.com/country-comparison 🌍',
  },
  {
    id: 'B',
    text: 'The USA spends more on healthcare than any country on Earth but Americans live shorter lives than 50+ other nations. Mind-blowing comparison at bornclock.com/country-comparison',
  },
  {
    id: 'C',
    text: "In 1960, Japan had G7's SHORTEST life expectancy. Today it has the LONGEST. See how your country affects your lifespan: bornclock.com/country-comparison #Longevity",
  },
];

// ── Main page component ───────────────────────────────────────────────────────

const CountryComparison = () => {
  const [savedResult, setSavedResult] = useState<SavedResult | null>(null);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState(35);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('forecast');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedShareIdx, setSelectedShareIdx] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('bornclock_result_snapshot');
      if (raw) {
        const parsed: SavedResult = JSON.parse(raw);
        setSavedResult(parsed);
        setGender(parsed.gender === 'female' ? 'female' : 'male');
        setAge(parsed.currentAge || 35);
      }
    } catch { /* ignore */ }
  }, []);

  const countries = Object.keys(BIRTH_BASELINES);

  const getHealthAdj = () => savedResult?.healthAdjustment ?? 0;
  const getGeneticAdj = () => savedResult?.geneticAdjustment ?? 0;
  const getEpigenAdj = () => savedResult?.epigeneticAdjustment ?? 0;
  const getCommunityAdj = () => savedResult?.communityBonus ?? 0;

  const rows = countries
    .filter(c => c.toLowerCase().includes(search.toLowerCase()))
    .map(c => {
      const forecast = getForecastForCountry(
        c, gender, age,
        getHealthAdj(), getGeneticAdj(), getEpigenAdj(), getCommunityAdj(),
      );
      const difference = savedResult ? Math.round((forecast - savedResult.totalForecast) * 10) / 10 : 0;
      return {
        country: c,
        flag: COUNTRY_FLAG_EMOJI[c] ?? '🌐',
        baseline: BIRTH_BASELINES[c][gender],
        forecast,
        difference,
      };
    })
    .sort((a, b) => {
      let valA: number | string;
      let valB: number | string;
      if (sortKey === 'forecast') { valA = a.forecast; valB = b.forecast; }
      else if (sortKey === 'difference') { valA = a.difference; valB = b.difference; }
      else { valA = a.country; valB = b.country; }
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  const allRowsSorted = [...rows].sort((a, b) => b.forecast - a.forecast);
  const topFive = allRowsSorted.slice(0, 5);
  const userCountryRow = savedResult ? rows.find(r => r.country === savedResult.country) : null;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(false); }
  };

  const selectedRow = selectedCountry ? rows.find(r => r.country === selectedCountry) : null;
  const selectedBaseline = selectedRow ? BIRTH_BASELINES[selectedRow.country] : null;

  // What-if scenario rows
  const japanRow = rows.find(r => r.country === 'Japan');
  const usaRow = rows.find(r => r.country === 'United States');
  const bestRow = allRowsSorted[0];

  const handleCopyShare = async () => {
    await navigator.clipboard.writeText(SHARE_OPTIONS[selectedShareIdx].text);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const shareUrl = 'https://bornclock.com/country-comparison';
  const shareText = SHARE_OPTIONS[selectedShareIdx].text;

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <FAQSchema items={FAQ_ITEMS.map(f => ({ question: f.question, answer: f.answer }))} />
      <SEO
        title="Country Life Expectancy Comparison — How Your Country Affects How Long You Live"
        description="Shocking interactive comparison: How does your country affect your lifespan? Japan reversed from G7's shortest to longest life expectancy in 60 years. The USA spends more on healthcare than any nation yet ranks 50th. See your personalized forecast across 57 countries. Free."
        keywords="life expectancy by country, country longevity comparison, why does japan have highest life expectancy, USA life expectancy vs other countries, how does country affect lifespan, longevity by country, country life expectancy calculator"
        canonicalUrl="/country-comparison"
      />

      {/* ── SHOCKING HERO (dark section) ──────────────────────────────────── */}
      <div className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <header className="flex justify-between items-center mb-12">
            <Navigation />
            <AuthNav />
          </header>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-2xl md:text-4xl font-black leading-tight">
              In 1800, no country on Earth had a life expectancy above 40 years.
            </p>
            <p className="text-indigo-400 text-xl mt-4 font-semibold">
              Today, 50+ countries exceed 75 years.
            </p>
            <p className="text-slate-300 text-lg mt-2">
              What changed? Everything. And it's still changing.
            </p>
            <p className="text-slate-500 text-xs mt-6">
              [Our World in Data — Life Expectancy, 2024]
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* ── YOUR PERSONAL FORECAST ──────────────────────────────────────── */}
        <section className="text-center space-y-4 pt-6 pb-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-muted-foreground">
            <Globe className="w-4 h-4 text-primary" />
            <span>57 countries · UN WPP 2024 data</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black gradient-text-primary leading-tight">
            Your Personal Forecast Across 57 Countries
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {savedResult
              ? `Personalised to your health profile — see exactly how where you live changes your numbers.`
              : `Compare baseline life expectancy across 57 countries. Complete the Life Expectancy Calculator for your personalised comparison.`}
          </p>
        </section>

        {/* Controls */}
        <div className="max-w-5xl mx-auto mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button size="sm" variant={gender === 'male' ? 'default' : 'outline'} onClick={() => setGender('male')}>Male</Button>
            <Button size="sm" variant={gender === 'female' ? 'default' : 'outline'} onClick={() => setGender('female')}>Female</Button>
          </div>
          {!savedResult && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Current age:</span>
              <input
                type="number" min={1} max={100} value={age}
                onChange={e => setAge(parseInt(e.target.value) || 35)}
                className="w-20 px-3 py-1.5 rounded-lg border border-border bg-background text-center text-sm"
              />
            </div>
          )}
          {savedResult && (
            <div className="text-sm text-muted-foreground bg-primary/5 px-4 py-2 rounded-lg border border-primary/20">
              🎯 Personalised to your health profile · Age {savedResult.currentAge} · {savedResult.country}
            </div>
          )}
        </div>

        {/* Hero stats */}
        {userCountryRow && savedResult && (
          <div className="max-w-5xl mx-auto mb-8 grid grid-cols-3 gap-4">
            <Card className="glass-card text-center">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Your Country</p>
                <p className="text-2xl font-black text-primary">{savedResult.totalForecast}</p>
                <p className="text-xs text-muted-foreground mt-1">{userCountryRow.flag} {savedResult.country}</p>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Best Country for You</p>
                <p className="text-2xl font-black text-green-600">{topFive[0]?.forecast}</p>
                <p className="text-xs text-muted-foreground mt-1">{topFive[0]?.flag} {topFive[0]?.country}</p>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Potential Gain</p>
                <p className="text-2xl font-black text-accent">
                  +{Math.max(0, (topFive[0]?.forecast ?? 0) - savedResult.totalForecast).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">years vs. {savedResult.country}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top 5 */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-xl font-bold mb-4">🏆 Top 5 Longevity Countries</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {topFive.map((row, i) => (
              <button
                key={row.country}
                onClick={() => setSelectedCountry(row.country)}
                className="glass-card rounded-xl p-4 text-center space-y-1 border border-border hover:border-primary transition-all"
              >
                <div className="text-2xl">{row.flag}</div>
                <div className="text-xs font-semibold text-foreground leading-tight">{row.country}</div>
                <div className="text-lg font-black text-primary">{row.forecast}</div>
                <div className="text-[10px] text-muted-foreground">#{i + 1}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected country detail */}
        {selectedRow && selectedBaseline && (
          <div className="max-w-5xl mx-auto mb-8">
            <Card className="glass-card border-primary/30">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{selectedRow.flag}</span>
                    <div>
                      <h3 className="text-xl font-bold">{selectedRow.country}</h3>
                      <p className="text-sm text-muted-foreground">UN WPP 2024 baseline data</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCountry(null)} className="text-muted-foreground hover:text-foreground text-sm">✕ Close</button>
                </div>
                {COUNTRY_INSIGHTS[selectedRow.country] && (
                  <p className="text-sm text-muted-foreground bg-muted/30 px-4 py-3 rounded-lg italic">
                    💡 {COUNTRY_INSIGHTS[selectedRow.country]}
                  </p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Male birth baseline</p>
                    <p className="text-xl font-bold text-foreground">{selectedBaseline.male}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Female birth baseline</p>
                    <p className="text-xl font-bold text-foreground">{selectedBaseline.female}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Your forecast here</p>
                    <p className="text-xl font-bold text-primary">{selectedRow.forecast}</p>
                  </div>
                  {savedResult && (
                    <div>
                      <p className="text-xs text-muted-foreground">vs. {savedResult.country}</p>
                      <p className={`text-xl font-bold ${selectedRow.forecast >= savedResult.totalForecast ? 'text-green-600' : 'text-red-500'}`}>
                        {selectedRow.forecast >= savedResult.totalForecast ? '+' : ''}{(selectedRow.forecast - savedResult.totalForecast).toFixed(1)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── THE BIG STORY — 5 story cards ───────────────────────────────── */}
        <section className="max-w-5xl mx-auto mb-14">
          <h2 className="text-2xl font-bold mb-2 text-foreground">📖 The Big Story</h2>
          <p className="text-muted-foreground mb-6 text-sm">The data is extraordinary. Here's what it actually means.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Card 1 — Japan Paradox */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">🇯🇵</div>
              <h3 className="text-lg font-black mb-2 text-indigo-900">The Japan Paradox</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                In 1960, Japan had the <strong>SHORTEST</strong> life expectancy among G7 nations. Today it has the <strong>LONGEST</strong> — a complete reversal in 60 years.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                After World War II, Japan dramatically improved nutrition, built universal healthcare, and maintained their traditional diet of fish, fermented foods, and vegetables. Their obesity rate today: just 3.6% — vs 36% in the USA.
              </p>
              <p className="text-xs text-gray-400 italic mb-2">
                [European Journal of Clinical Nutrition, Nature, 2021] [WHO Global Health Data, 2024]
              </p>
              <Link to="/blog/best-foods-to-eat-to-live-longer-longevity-diet" className="text-indigo-600 text-xs underline hover:text-indigo-800">
                → Read: How Diet Affects Your Longevity
              </Link>
            </div>

            {/* Card 2 — American Paradox */}
            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">🇺🇸</div>
              <h3 className="text-lg font-black mb-2 text-amber-900">The American Paradox</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                The USA spends more on healthcare per person than any other nation on Earth. Yet Americans live <strong>3.7 years less</strong> than the average of comparable developed countries.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Americans born in 2024 are expected to live to 79 — while people in comparable countries average 82.7 years. The gap is driven by diet, gun violence, overdose deaths, and healthcare inequality rather than access to medical technology.
              </p>
              <p className="text-xs text-gray-400 italic">
                [Scientific American, Feb 2026] [Peterson-KFF Health System Tracker, 2026]
              </p>
            </div>

            {/* Card 3 — Okinawa Secret */}
            <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">🏝️</div>
              <h3 className="text-lg font-black mb-2 text-green-900">The Okinawa Secret</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                Okinawa, Japan has one of the highest concentrations of centenarians on Earth. Their secret? <em>"Hara hachi bu"</em> — stopping eating when 80% full.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Okinawan elders eat an average of 1,800 calories per day vs the US average of 2,500. They have dramatically lower rates of heart disease, diabetes, and cancer. Not because of any superfood — but because of how they eat, and how much.
              </p>
              <p className="text-xs text-gray-400 italic mb-2">
                [Blue Zones Research, Buettner, 2023] [ScienceInsights, 2026]
              </p>
              <Link to="/blog/secrets-of-people-who-live-to-100-centenarian-habits" className="text-green-700 text-xs underline hover:text-green-900">
                → Read: The Longevity Diet Guide
              </Link>
            </div>

            {/* Card 4 — India Opportunity */}
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">🇮🇳</div>
              <h3 className="text-lg font-black mb-2 text-orange-900">India's Longevity Opportunity</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                India's life expectancy has increased by over <strong>30 years</strong> since independence in 1947 — one of the fastest improvements in human history. From 32 years in 1947 to 72 years today.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                The challenge: a 15-year gap between India's top and bottom states. Kerala performs comparably to many European nations. The opportunity: India's improvement trajectory is accelerating.
              </p>
              <p className="text-xs text-gray-400 italic">
                [UN World Population Prospects, 2024] [India National Health Survey, 2021]
              </p>
            </div>

            {/* Card 5 — Lifestyle Multiplier */}
            <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-lg font-black mb-2 text-purple-900">The Lifestyle Multiplier</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                The gap between the highest and lowest life expectancy countries is about 30 years. But research shows lifestyle choices within <em>any</em> country can add or subtract up to <strong>14 years</strong> from your personal forecast.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                This means a health-conscious person in India can outlive a sedentary person in Japan. <strong>Your habits matter more than your passport.</strong>
              </p>
              <p className="text-xs text-gray-400 italic mb-2">
                [Khaw et al., PLOS Medicine, 2008 — 4 health behaviors and 14 years longevity]
              </p>
              <Link to="/life-expectancy" className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors">
                Calculate your personal forecast →
              </Link>
            </div>
          </div>
        </section>

        {/* ── FASCINATING FACTS TICKER ──────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto mb-14">
          <h2 className="text-xl font-bold mb-4 text-foreground">🧠 Fascinating Longevity Facts</h2>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4" style={{ minWidth: 'max-content' }}>

              <div className="min-w-64 max-w-64 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-4 text-white flex-shrink-0">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-bold text-sm mb-2">The Monaco Effect</h3>
                <p className="text-xs leading-relaxed opacity-90 mb-2">Monaco has the world's highest life expectancy at 89.8 years. Tiny, wealthy, universal healthcare, Mediterranean climate. But wealth alone doesn't explain it — neighboring France still reaches 83+ years with far more people.</p>
                <p className="text-[10px] opacity-60">[CIA World Factbook, 2024]</p>
              </div>

              <div className="min-w-64 max-w-64 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl p-4 text-white flex-shrink-0">
                <div className="text-2xl mb-2">🍵</div>
                <h3 className="font-bold text-sm mb-2">The Green Tea Effect</h3>
                <p className="text-xs leading-relaxed opacity-90 mb-2">Japan's per-capita green tea consumption: ~700g per person per year. Green tea contains EGCG — a polyphenol that reduces inflammation. Japanese adults who drink 5+ cups per day show 26% lower risk of heart disease mortality.</p>
                <p className="text-[10px] opacity-60">[Japan Public Health Center Study, 2006]</p>
              </div>

              <div className="min-w-64 max-w-64 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-white flex-shrink-0">
                <div className="text-2xl mb-2">🏥</div>
                <h3 className="font-bold text-sm mb-2">The Healthcare Gap</h3>
                <p className="text-xs leading-relaxed opacity-90 mb-2">The US spends $12,000+ per person on healthcare annually — nearly double comparable countries. Yet Americans live shorter lives than citizens in 50+ countries who spend far less. Healthcare spending and life expectancy are surprisingly weakly correlated.</p>
                <p className="text-[10px] opacity-60">[OECD Health Statistics, 2024]</p>
              </div>

              <div className="min-w-64 max-w-64 bg-gradient-to-br from-violet-600 to-violet-800 rounded-xl p-4 text-white flex-shrink-0">
                <div className="text-2xl mb-2">🌍</div>
                <h3 className="font-bold text-sm mb-2">The 200-Year Miracle</h3>
                <p className="text-xs leading-relaxed opacity-90 mb-2">In 1800, the global average life expectancy was around 30 years. By 2024 it exceeded 73 years. Humanity effectively gained 43 years of average lifespan in 200 years — primarily through sanitation, vaccines, and antibiotics.</p>
                <p className="text-[10px] opacity-60">[Our World in Data, 2024]</p>
              </div>

              <div className="min-w-64 max-w-64 bg-gradient-to-br from-rose-600 to-rose-800 rounded-xl p-4 text-white flex-shrink-0">
                <div className="text-2xl mb-2">💃</div>
                <h3 className="font-bold text-sm mb-2">The Dancing Sardinians</h3>
                <p className="text-xs leading-relaxed opacity-90 mb-2">Sardinia, Italy is a Blue Zone with the world's highest concentration of centenarians. Sardinian men specifically outlive men from all other Blue Zones — daily walking, red wine, pecorino cheese (high omega-3s), and tight-knit multigenerational families.</p>
                <p className="text-[10px] opacity-60">[Buettner, D. — Blue Zones, 2023]</p>
              </div>

              <div className="min-w-64 max-w-64 bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl p-4 text-white flex-shrink-0">
                <div className="text-2xl mb-2">🏃</div>
                <h3 className="font-bold text-sm mb-2">The Exercise Equation</h3>
                <p className="text-xs leading-relaxed opacity-90 mb-2">A landmark study of 650,000 adults found that 75 minutes of vigorous exercise per week added 3.4 years to life expectancy — regardless of country of birth. 150 minutes/week added 3.5 years. Marginal return decreases quickly after 150 minutes.</p>
                <p className="text-[10px] opacity-60">[Moore et al., PLOS Medicine, 2012]</p>
              </div>

              <div className="min-w-64 max-w-64 bg-gradient-to-br from-teal-600 to-teal-800 rounded-xl p-4 text-white flex-shrink-0">
                <div className="text-2xl mb-2">👥</div>
                <h3 className="font-bold text-sm mb-2">The Loneliness Penalty</h3>
                <p className="text-xs leading-relaxed opacity-90 mb-2">Social isolation reduces life expectancy by 26% — comparable to smoking 15 cigarettes per day. Countries with stronger social bonds consistently rank higher in longevity. Japan's "moai" (lifelong friend groups) and Sardinia's village culture are key factors.</p>
                <p className="text-[10px] opacity-60">[Holt-Lunstad et al., PLOS Medicine, 2010]</p>
              </div>

              <div className="min-w-64 max-w-64 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl p-4 text-white flex-shrink-0">
                <div className="text-2xl mb-2">🇮🇳</div>
                <h3 className="font-bold text-sm mb-2">India's 30-Year Miracle</h3>
                <p className="text-xs leading-relaxed opacity-90 mb-2">India's life expectancy rose from 32 years at independence (1947) to 72 years today — an increase of 40 years in less than 80 years. One of the fastest sustained improvements in human history, driven by vaccination, sanitation, maternal care, and economic development.</p>
                <p className="text-[10px] opacity-60">[UN WPP 2024; India NHFS 2021]</p>
              </div>

            </div>
          </div>
        </section>

        {/* ── WHAT-IF SCENARIOS ─────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto mb-14">
          <h2 className="text-xl font-bold text-foreground mb-1">🌐 What If You Changed Countries?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            See how the same health habits play out differently depending on where you live — and why.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Japan Switch */}
            <Card className="glass-card border-indigo-200 bg-gradient-to-br from-indigo-50/40 to-white">
              <CardContent className="p-6">
                <div className="text-3xl mb-2">🇯🇵</div>
                <h3 className="font-bold text-indigo-900 mb-1">The Japan Switch</h3>
                <p className="text-xs text-muted-foreground mb-4">If you maintained your exact current lifestyle in Japan:</p>
                {japanRow ? (
                  <>
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Japan forecast</p>
                        <p className="text-2xl font-black text-indigo-700">{japanRow.forecast}</p>
                      </div>
                      {savedResult && (
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">vs. you now</p>
                          <p className={`text-xl font-bold ${japanRow.forecast >= savedResult.totalForecast ? 'text-green-600' : 'text-red-500'}`}>
                            {japanRow.forecast >= savedResult.totalForecast ? '+' : ''}{(japanRow.forecast - savedResult.totalForecast).toFixed(1)} yrs
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Mini bar */}
                    <div className="space-y-1 mb-3">
                      {savedResult && (
                        <div>
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                            <span>You now</span><span>{savedResult.totalForecast}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div className="h-2 bg-gray-400 rounded-full" style={{ width: `${Math.min(100, (savedResult.totalForecast / 100) * 100)}%` }} />
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                          <span>In Japan</span><span>{japanRow.forecast}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (japanRow.forecast / 100) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Set your age and gender above to see this forecast.</p>
                )}
                <p className="text-xs text-gray-500 leading-relaxed">Japan's diet, healthcare, and low obesity rates provide a significantly stronger baseline than most countries.</p>
              </CardContent>
            </Card>

            {/* USA Switch */}
            <Card className="glass-card border-red-200 bg-gradient-to-br from-red-50/40 to-white">
              <CardContent className="p-6">
                <div className="text-3xl mb-2">🇺🇸</div>
                <h3 className="font-bold text-red-900 mb-1">The USA Switch</h3>
                <p className="text-xs text-muted-foreground mb-4">If you maintained your exact current lifestyle in the USA:</p>
                {usaRow ? (
                  <>
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground">USA forecast</p>
                        <p className="text-2xl font-black text-red-700">{usaRow.forecast}</p>
                      </div>
                      {savedResult && (
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">vs. you now</p>
                          <p className={`text-xl font-bold ${usaRow.forecast >= savedResult.totalForecast ? 'text-green-600' : 'text-red-500'}`}>
                            {usaRow.forecast >= savedResult.totalForecast ? '+' : ''}{(usaRow.forecast - savedResult.totalForecast).toFixed(1)} yrs
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 mb-3">
                      {savedResult && (
                        <div>
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                            <span>You now</span><span>{savedResult.totalForecast}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div className="h-2 bg-gray-400 rounded-full" style={{ width: `${Math.min(100, (savedResult.totalForecast / 100) * 100)}%` }} />
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                          <span>In USA</span><span>{usaRow.forecast}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-red-400 rounded-full" style={{ width: `${Math.min(100, (usaRow.forecast / 100) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Set your age and gender above to see this forecast.</p>
                )}
                <p className="text-xs text-gray-500 leading-relaxed">Despite the world's highest healthcare spending, diet quality and socioeconomic inequality create a longevity gap vs. comparable nations.</p>
              </CardContent>
            </Card>

            {/* Best Case */}
            <Card className="glass-card border-green-200 bg-gradient-to-br from-green-50/40 to-white">
              <CardContent className="p-6">
                <div className="text-3xl mb-2">{bestRow?.flag ?? '🌍'}</div>
                <h3 className="font-bold text-green-900 mb-1">Best Case Scenario</h3>
                <p className="text-xs text-muted-foreground mb-4">In the highest-forecast country for you:</p>
                {bestRow ? (
                  <>
                    <div className="flex justify-between items-end mb-1">
                      <div>
                        <p className="text-[10px] text-muted-foreground">{bestRow.country}</p>
                        <p className="text-2xl font-black text-green-700">{bestRow.forecast}</p>
                      </div>
                      {savedResult && (
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">vs. you now</p>
                          <p className="text-xl font-bold text-green-600">
                            +{Math.max(0, bestRow.forecast - savedResult.totalForecast).toFixed(1)} yrs
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 mb-3">
                      {savedResult && (
                        <div>
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                            <span>You now</span><span>{savedResult.totalForecast}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div className="h-2 bg-gray-400 rounded-full" style={{ width: `${Math.min(100, (savedResult.totalForecast / 100) * 100)}%` }} />
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                          <span>Best country</span><span>{bestRow.forecast}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-green-500 rounded-full" style={{ width: `${Math.min(100, (bestRow.forecast / 100) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
                <p className="text-xs text-gray-500 leading-relaxed">This represents the maximum longevity advantage that country selection alone could provide — with your same habits.</p>
                {!savedResult && (
                  <Link to="/life-expectancy" className="mt-3 inline-flex items-center gap-1 text-xs text-green-700 underline hover:text-green-900">
                    Take the quiz for personalized numbers →
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── REDESIGNED TABLE ──────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-xl font-bold mb-1 text-foreground">
            {savedResult
              ? 'Your Personalized Forecast — How Your Health Profile Plays Out in 57 Countries'
              : 'Baseline Forecasts — 57 Countries'}
          </h2>
          {!savedResult && (
            <p className="text-sm text-muted-foreground mb-4">
              Complete the longevity quiz for your personalized numbers.{' '}
              <Link to="/life-expectancy" className="text-primary underline">Take the quiz →</Link>
            </p>
          )}

          <div className="flex items-center gap-3 mb-4 mt-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search country..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <span className="text-sm text-muted-foreground">{rows.length} countries</span>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-8">#</th>
                  <th className="text-left px-4 py-3">
                    <button className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground" onClick={() => toggleSort('country')}>
                      Country <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Tier</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Baseline</th>
                  <th className="text-right px-4 py-3">
                    <button className="flex items-center gap-1 ml-auto font-semibold text-muted-foreground hover:text-foreground" onClick={() => toggleSort('forecast')}>
                      Forecast <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  {savedResult && (
                    <th className="text-right px-4 py-3">
                      <button className="flex items-center gap-1 ml-auto font-semibold text-muted-foreground hover:text-foreground" onClick={() => toggleSort('difference')}>
                        vs. You <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const isUser = savedResult?.country === row.country;
                  const isSelected = selectedCountry === row.country;
                  const isTop3 = allRowsSorted.findIndex(r => r.country === row.country) < 3;
                  const isBottom5 = allRowsSorted.findIndex(r => r.country === row.country) >= allRowsSorted.length - 5;
                  const tier = getTier(row.forecast);

                  let rowClass = 'border-t border-border cursor-pointer transition-colors hover:bg-muted/20';
                  let borderLeft = '';
                  if (isUser) { rowClass = 'border-t border-border cursor-pointer bg-blue-50 dark:bg-blue-900/20 font-semibold border-l-4 border-l-blue-500'; }
                  else if (isSelected) { rowClass = 'border-t border-border cursor-pointer bg-accent/10'; }
                  else if (isTop3) { borderLeft = 'border-l-4 border-l-amber-400'; }
                  else if (isBottom5) { borderLeft = 'border-l-4 border-l-red-300'; }

                  let diffDisplay = <td />;
                  if (savedResult) {
                    let diffClass = 'text-muted-foreground';
                    let diffText = '—';
                    if (row.difference !== 0) {
                      const d = row.difference;
                      if (d >= 5) { diffClass = 'text-emerald-700 font-bold'; diffText = `🚀 +${d.toFixed(1)} yrs`; }
                      else if (d >= 2) { diffClass = 'text-green-600'; diffText = `+${d.toFixed(1)} yrs`; }
                      else if (d >= 0) { diffClass = 'text-blue-600'; diffText = `+${d.toFixed(1)} yrs`; }
                      else if (d >= -2) { diffClass = 'text-gray-500'; diffText = `${d.toFixed(1)} yrs`; }
                      else { diffClass = 'text-red-600'; diffText = `${d.toFixed(1)} yrs`; }
                    }
                    diffDisplay = <td className={`px-4 py-3 text-right text-sm ${diffClass}`}>{diffText}</td>;
                  }

                  return (
                    <tr
                      key={row.country}
                      onClick={() => setSelectedCountry(isSelected ? null : row.country)}
                      className={`${rowClass} ${borderLeft}`}
                    >
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">
                        <span className="mr-2">{row.flag}</span>
                        {row.country}
                        {isUser && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">📍 Your Country</span>}
                        {COUNTRY_INSIGHTS[row.country] && <span className="ml-1 text-[10px] text-muted-foreground hidden lg:inline">ℹ️</span>}
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${tier.cls}`}>{tier.label}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{row.baseline}</td>
                      <td className="px-4 py-3 text-right font-bold text-primary">{row.forecast}</td>
                      {savedResult ? diffDisplay : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Source: UN World Population Prospects 2024. Conditional (age-adjusted) baseline applied for ages 40+. Click any row for details. Tier based on forecast value. ℹ️ = country insight available.
          </p>
        </div>

        {/* ── BLOG CROSS-LINKS ──────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto mb-14">
          <h2 className="text-xl font-bold mb-2 text-foreground">📚 Deepen Your Understanding</h2>
          <p className="text-sm text-muted-foreground mb-6">The science behind these country differences is explained in our research-backed articles:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BLOG_LINKS.map(post => (
              <Link key={post.slug} to={`/blog/${post.slug}`}>
                <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow h-full flex flex-col">
                  <h3 className="font-semibold text-sm text-gray-900 mb-1 leading-tight">{post.title}</h3>
                  <p className="text-xs text-gray-600 mt-1 flex-1 leading-relaxed">{post.teaser}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">{post.readTime} min read</span>
                    <span className="text-indigo-600 text-xs font-medium">Read →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── FAQ SECTION ───────────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto mb-14">
          <h2 className="text-xl font-bold mb-5 text-foreground">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <CountryFAQItem key={i} q={item.question} a={item.answer} />
            ))}
          </div>
        </div>

        {/* ── SHARE SECTION ─────────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto mb-16">
          <div className="bg-indigo-50 rounded-2xl p-6 text-center">
            <div className="flex justify-center mb-3">
              <Share2 className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-indigo-900 mb-2">🌍 Share This Discovery</h2>
            <p className="text-sm text-indigo-700 mb-6 max-w-2xl mx-auto">
              Most people have never seen how dramatically their country affects their lifespan — or how much their habits can override it.
            </p>

            {/* Share text chips */}
            <div className="flex flex-wrap justify-center gap-2 mb-5">
              {SHARE_OPTIONS.map((opt, idx) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedShareIdx(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedShareIdx === idx ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-700 border-indigo-200 hover:border-indigo-400'}`}
                >
                  Option {opt.id}
                </button>
              ))}
            </div>

            {/* Selected text preview */}
            <div className="bg-white rounded-xl border border-indigo-200 p-4 mb-5 max-w-2xl mx-auto text-left">
              <p className="text-sm text-gray-700 leading-relaxed">{SHARE_OPTIONS[selectedShareIdx].text}</p>
            </div>

            {/* Share buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleCopyShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
              >
                {shareCopied ? '✓ Copied!' : '📋 Copy Text'}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#25D366' }}
              >
                📱 WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                𝕏 Twitter/X
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                📘 Facebook
              </a>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
};

export default CountryComparison;

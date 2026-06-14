import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SEO } from '@/components/SEO';
import { Globe, Search, ArrowUpDown } from 'lucide-react';
import {
  BIRTH_BASELINES,
  COUNTRY_FLAG_EMOJI,
  getForecastForCountry,
} from '@/services/LongevityCalculationService';

export { getForecastForCountry } from '@/services/LongevityCalculationService';

// ── Saved result shape from LifeExpectancy page ───────────────────────────────

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

// ── Page component ────────────────────────────────────────────────────────────

type SortKey = 'country' | 'forecast';

const CountryComparison = () => {
  const [savedResult, setSavedResult] = useState<SavedResult | null>(null);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState(35);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('forecast');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

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
    .map(c => ({
      country: c,
      flag: COUNTRY_FLAG_EMOJI[c] ?? '🌐',
      baseline: BIRTH_BASELINES[c][gender],
      forecast: getForecastForCountry(
        c, gender, age,
        getHealthAdj(), getGeneticAdj(), getEpigenAdj(), getCommunityAdj(),
      ),
    }))
    .sort((a, b) => {
      const valA = sortKey === 'forecast' ? a.forecast : a.country;
      const valB = sortKey === 'forecast' ? b.forecast : b.country;
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  const topFive = [...rows].sort((a, b) => b.forecast - a.forecast).slice(0, 5);
  const userCountryRow = savedResult ? rows.find(r => r.country === savedResult.country) : null;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(false); }
  };

  const selectedRow = selectedCountry ? rows.find(r => r.country === selectedCountry) : null;
  const selectedBaseline = selectedRow ? BIRTH_BASELINES[selectedRow.country] : null;

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Country Longevity Comparison — Life Expectancy by Country"
        description="Compare life expectancy across 57 countries. See how where you live affects your longevity forecast, personalised to your health profile."
        keywords="life expectancy by country, longevity comparison, country life expectancy, WHO life expectancy"
        canonicalUrl="/country-comparison"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 pt-6 pb-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-muted-foreground">
            <Globe className="w-4 h-4 text-primary" />
            <span>57 countries · UN WPP 2024 data</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black gradient-text-primary leading-tight">
            Country Longevity Comparison
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {savedResult
              ? `Showing your personalised forecast across 57 countries, based on your Life Expectancy results.`
              : `Compare baseline life expectancy across 57 countries. Complete the Life Expectancy Calculator for a personalised comparison.`}
          </p>
        </section>

        {/* Controls */}
        <div className="max-w-5xl mx-auto mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={gender === 'male' ? 'default' : 'outline'}
              onClick={() => setGender('male')}
            >
              Male
            </Button>
            <Button
              size="sm"
              variant={gender === 'female' ? 'default' : 'outline'}
              onClick={() => setGender('female')}
            >
              Female
            </Button>
          </div>
          {!savedResult && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Current age:</span>
              <input
                type="number"
                min={1}
                max={100}
                value={age}
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

        {/* Top 5 Cards */}
        <div className="max-w-5xl mx-auto mb-10">
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

        {/* Searchable table */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search country..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
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
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Birth Baseline</th>
                  <th className="text-right px-4 py-3">
                    <button className="flex items-center gap-1 ml-auto font-semibold text-muted-foreground hover:text-foreground" onClick={() => toggleSort('forecast')}>
                      Forecast <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const isUser = savedResult?.country === row.country;
                  const isSelected = selectedCountry === row.country;
                  return (
                    <tr
                      key={row.country}
                      onClick={() => setSelectedCountry(isSelected ? null : row.country)}
                      className={`border-t border-border cursor-pointer transition-colors ${isUser ? 'bg-primary/10' : isSelected ? 'bg-accent/10' : 'hover:bg-muted/20'}`}
                    >
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">
                        <span className="mr-2">{row.flag}</span>
                        {row.country}
                        {isUser && <span className="ml-2 text-xs text-primary font-bold">YOU</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{row.baseline}</td>
                      <td className="px-4 py-3 text-right font-bold text-primary">{row.forecast}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            Source: UN World Population Prospects 2024. Conditional (age-adjusted) baseline applied for ages 40+. Forecast includes personal health adjustments where available.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CountryComparison;

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, Share2, Copy, ExternalLink, Loader2, Crown, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LongevityResult, EPIGENETIC_HABITS } from '@/services/LongevityCalculationService';
import { CelebrityLongevityProfile } from '@/services/CelebrityLongevityService';
import { fetchWikipediaImage } from '@/services/WikipediaImageService';

interface Props {
  result: LongevityResult;
  userName: string;
  birthDate: Date | null | undefined;
  isPremium: boolean;
  onUpgradeClick?: () => void;
  optimizedForecast?: number;
  simulatedForecast?: number;
  celebrityMatches: CelebrityLongevityProfile[];
  isLoadingCelebrities: boolean;
  potentialCelebrityMatches?: CelebrityLongevityProfile[];
  isLoadingPotentialCelebrities?: boolean;
}

const BlurredNumber = ({ value, isPremium, suffix = '' }: { value: number | string; isPremium: boolean; suffix?: string }) => (
  <span style={!isPremium ? { filter: 'blur(8px)', userSelect: 'none', cursor: 'default' } : {}}>
    {value}{suffix}
  </span>
);

const VITALITY_COLORS: Record<string, string> = {
  Exceptional:     'bg-emerald-100 text-emerald-800 border-emerald-300',
  Strong:          'bg-green-100 text-green-800 border-green-300',
  Average:         'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Below Average': 'bg-orange-100 text-orange-800 border-orange-300',
};

function ageColor(age: number): string {
  if (age > 80)  return 'bg-emerald-100 border-emerald-300 text-emerald-800';
  if (age >= 70) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
  if (age >= 60) return 'bg-orange-100 border-orange-300 text-orange-800';
  return 'bg-red-100 border-red-300 text-red-800';
}

const CATEGORY_EMOJI: Record<string, string> = {
  actor: '🎭', musician: '🎵', athlete: '⚽', scientist: '🔬',
  business: '💼', politician: '🏛️', director: '🎬',
};
function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJI[category?.toLowerCase()] ?? '⭐';
}

function categoryGradient(category: string): string {
  const map: Record<string, string> = {
    actor:     'from-purple-300 to-pink-400',
    musician:  'from-blue-300 to-cyan-400',
    athlete:   'from-green-300 to-emerald-400',
    scientist: 'from-teal-300 to-blue-400',
    business:  'from-amber-300 to-orange-400',
    politician:'from-red-300 to-rose-400',
    director:  'from-violet-300 to-purple-400',
  };
  return map[category?.toLowerCase()] ?? 'from-primary/30 to-accent/30';
}

function CelebRow({
  celebs, celebImages, imgErrors, setImgErrors, isPremium, blurNum,
}: {
  celebs: CelebrityLongevityProfile[];
  celebImages: Record<string, string | null>;
  imgErrors: Set<string>;
  setImgErrors: React.Dispatch<React.SetStateAction<Set<string>>>;
  isPremium: boolean;
  blurNum: (n: number | string, suffix?: string) => React.ReactNode;
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {celebs.map((celeb) => {
        const initials = celeb.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const hasImg = !imgErrors.has(celeb.name) && !!celebImages[celeb.name];
        const grad = categoryGradient(celeb.category);
        return (
          <Card key={celeb.name} className="overflow-hidden border-muted">
            {/* Photo — fixed 200px, face area framing */}
            <div className="overflow-hidden bg-muted" style={{ height: 200 }}>
              {hasImg ? (
                <img
                  src={celebImages[celeb.name]!}
                  alt={celeb.name}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 20%' }}
                  onError={() => setImgErrors(prev => new Set([...prev, celeb.name]))}
                />
              ) : (
                <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${grad} gap-2`}>
                  <span className="font-black text-white" style={{ fontSize: 40, lineHeight: 1 }}>{initials}</span>
                  <span className="text-xs text-white/80 font-semibold">{getCategoryEmoji(celeb.category)}</span>
                </div>
              )}
            </div>
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-1">
                <div>
                  <h5 className="text-sm font-bold text-foreground">{celeb.name}</h5>
                  <p className="text-[11px] text-muted-foreground">{celeb.profession}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-primary">{blurNum(celeb.longevityAge, ' yrs')}</div>
                  <Badge className="text-[9px] px-1 py-0 mt-0.5 bg-muted text-muted-foreground">
                    {getCategoryEmoji(celeb.category)} {celeb.category || 'Celebrity'}
                  </Badge>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug bg-muted/40 p-2 rounded">{celeb.achievement}</p>
              {celeb.wikiUrl && (
                <a href={celeb.wikiUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                  <ExternalLink className="w-2.5 h-2.5" /> Wikipedia
                </a>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

const PremiumBlur = ({ children, tab }: { children: React.ReactNode; tab: string }) => (
  <div className="relative">
    <div className="blur-sm select-none pointer-events-none">{children}</div>
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm rounded-xl z-10 p-4 text-center space-y-3">
      <Crown className="w-6 h-6 text-accent" />
      <p className="font-bold text-sm text-foreground">Unlock full {tab} analysis</p>
      <Link to="/upgrade"><Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Upgrade to Premium</Button></Link>
    </div>
  </div>
);

// ── Life Milestones ─────────────────────────────────────────────────────────
function LifeMilestones({
  currentForecast,
  simulatedForecast,
  currentAge,
}: {
  currentForecast: number;
  simulatedForecast: number;
  currentAge: number;
}) {
  const currentYear = new Date().getFullYear();
  const currentForecastYear    = currentYear + Math.floor(currentForecast   - currentAge);
  const optimizedForecastYear  = currentYear + Math.floor(simulatedForecast - currentAge);

  type M = { year: number; event: string; emoji: string; category: string };

  const milestones: M[] = [
    // Sports
    { year: 2026, event: "FIFA World Cup 2026 (USA / Canada / Mexico)", emoji: "⚽", category: "Sports" },
    { year: 2027, event: "Cricket World Cup 2027", emoji: "🏏", category: "Sports" },
    { year: 2028, event: "Los Angeles Olympics 2028", emoji: "🏅", category: "Sports" },
    { year: 2030, event: "FIFA World Cup 2030 (Centenary Edition)", emoji: "⚽", category: "Sports" },
    { year: 2032, event: "Brisbane Olympics 2032", emoji: "🏅", category: "Sports" },
    { year: 2034, event: "FIFA World Cup 2034", emoji: "⚽", category: "Sports" },
    { year: 2036, event: "Olympics 2036", emoji: "🏅", category: "Sports" },
    // Technology
    { year: 2028, event: "Quantum computing reaches commercial viability (IBM / Google projections)", emoji: "💻", category: "Technology" },
    { year: 2030, event: "First commercial lunar landing — NASA Artemis program", emoji: "🌙", category: "Technology" },
    { year: 2035, event: "AI systems projected to match human-level reasoning across most domains", emoji: "🤖", category: "Technology" },
    { year: 2040, event: "Mars human mission — NASA / SpaceX target", emoji: "🚀", category: "Technology" },
    // Health
    { year: 2030, event: "WHO Global Health targets — universal health coverage milestone", emoji: "🏥", category: "Health" },
    { year: 2032, event: "Alzheimer's cure or major treatment breakthrough projected", emoji: "🧠", category: "Health" },
    { year: 2040, event: "Cancer mortality projected to halve from 2020 levels (WHO)", emoji: "🎗️", category: "Health" },
    { year: 2045, event: "Longevity treatments potentially extending healthy life by 20+ years", emoji: "💊", category: "Health" },
    // Cultural
    { year: 2026, event: "USA 250th Anniversary — Semiquincentennial celebrations", emoji: "🇺🇸", category: "Cultural" },
    { year: 2027, event: "India 80th Independence Day", emoji: "🇮🇳", category: "Cultural" },
    { year: 2030, event: "United Nations Sustainable Development Goals deadline", emoji: "🌍", category: "Cultural" },
    { year: 2047, event: "India's 100th Independence Day — Centenary", emoji: "🇮🇳", category: "Cultural" },
    { year: 2076, event: "USA 300th Anniversary", emoji: "🇺🇸", category: "Cultural" },
    // Personal
    { year: currentYear + 5, event: "5-year health check — celebrate your progress", emoji: "✅", category: "Personal" },
    ...(currentAge >= 35 && currentAge <= 45 ? [{ year: currentYear + 15, event: "Watch your children graduate university", emoji: "🎓", category: "Personal" }] : []),
    ...(currentAge >= 35 && currentAge <= 50 ? [{ year: currentYear + 20, event: "Become a grandparent", emoji: "👶", category: "Personal" }] : []),
    ...(currentAge >= 40 && currentAge <= 55 ? [{ year: currentYear + 10, event: "Celebrate a major career milestone", emoji: "🏆", category: "Personal" }] : []),
  ];

  const sorted = [...milestones].sort((a, b) => a.year - b.year);

  const status = (year: number): 'green' | 'blue' | 'grey' => {
    if (year <= currentForecastYear)   return 'green';
    if (year <= optimizedForecastYear) return 'blue';
    return 'grey';
  };

  const gainYears = Math.round((simulatedForecast - currentForecast) * 10) / 10;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-bold text-foreground">🗓️ Milestones You're on Track to Witness</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Based on your current trajectory ({currentForecast} yrs) vs your optimized potential ({simulatedForecast} yrs)
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Will witness</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Possible with optimization</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-muted-foreground/30 inline-block" /> Beyond projections</span>
      </div>

      {/* Timeline */}
      <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
        {sorted.map((m, i) => {
          const s = status(m.year);
          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs transition-colors ${
                s === 'green' ? 'bg-green-50/60 border-green-200 dark:bg-green-950/20 dark:border-green-900' :
                s === 'blue'  ? 'bg-blue-50/60 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900' :
                'bg-muted/20 border-muted/60 opacity-55'
              }`}
            >
              <span className={`font-black tabular-nums shrink-0 w-10 text-right leading-tight mt-0.5 ${
                s === 'green' ? 'text-green-700' : s === 'blue' ? 'text-blue-700' : 'text-muted-foreground'
              }`}>{m.year}</span>
              <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                s === 'green' ? 'bg-green-500' : s === 'blue' ? 'bg-blue-500' : 'bg-muted-foreground/30'
              }`} />
              <div className="flex-1 min-w-0">
                <span className={`font-medium ${s === 'grey' ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {m.emoji} {m.event}
                </span>
                <Badge
                  variant="outline"
                  className={`ml-1.5 text-[9px] px-1 py-0 ${
                    s === 'green' ? 'text-green-600 border-green-400' :
                    s === 'blue'  ? 'text-blue-600 border-blue-400' :
                    'text-muted-foreground border-muted'
                  }`}
                >{m.category}</Badge>
                {s === 'blue' && gainYears > 0 && (
                  <p className="text-[10px] text-blue-600 mt-0.5">
                    Unlock {gainYears} more {gainYears === 1 ? 'year' : 'years'} to witness this →
                  </p>
                )}
                {s === 'grey' && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">Beyond current projections</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Report ──────────────────────────────────────────────────────────────
export const EnhancedLifeExpectancyReport = ({
  result, userName, birthDate, isPremium, onUpgradeClick,
  optimizedForecast, simulatedForecast,
  celebrityMatches, isLoadingCelebrities,
  potentialCelebrityMatches = [], isLoadingPotentialCelebrities = false,
}: Props) => {
  const [celebImages, setCelebImages] = useState<Record<string, string | null>>({});
  const [imgErrors,   setImgErrors]   = useState<Set<string>>(new Set());
  const [copied,      setCopied]      = useState(false);

  useEffect(() => {
    const allCelebs = [...celebrityMatches, ...potentialCelebrityMatches];
    if (!allCelebs.length) return;
    const loadImages = async () => {
      const entries = await Promise.all(
        allCelebs.map(async (c) => {
          const url = await fetchWikipediaImage(c.name);
          return [c.name, url] as [string, string | null];
        })
      );
      setCelebImages(prev => ({ ...prev, ...Object.fromEntries(entries) }));
    };
    loadImages();
  }, [celebrityMatches, potentialCelebrityMatches]);

  const p1 = result.pillar1Snapshot;
  const p2 = result.pillar2Snapshot;

  const FAMILY_MEMBERS = [
    { key: 'paternalGrandfather' as const, label: 'Paternal Grandfather', side: 'paternal' },
    { key: 'paternalGrandmother' as const, label: 'Paternal Grandmother', side: 'paternal' },
    { key: 'father'              as const, label: 'Father',               side: 'paternal' },
    { key: 'paternalUncles'      as const, label: 'Paternal Uncles (avg)',side: 'paternal' },
    { key: 'paternalAunts'       as const, label: 'Paternal Aunts (avg)', side: 'paternal' },
    { key: 'maternalGrandfather' as const, label: 'Maternal Grandfather', side: 'maternal' },
    { key: 'maternalGrandmother' as const, label: 'Maternal Grandmother', side: 'maternal' },
    { key: 'mother'              as const, label: 'Mother',               side: 'maternal' },
    { key: 'maternalUncles'      as const, label: 'Maternal Uncles (avg)',side: 'maternal' },
    { key: 'maternalAunts'       as const, label: 'Maternal Aunts (avg)', side: 'maternal' },
  ];

  const knownMembers = FAMILY_MEMBERS.filter(fm => !p1[fm.key].dontKnow && p1[fm.key].age > 0);

  // Community anchor habits (mentor's attributed habits from Step 8 Section B)
  const mentorHabitData   = EPIGENETIC_HABITS.filter(h => p2.mentorHabits.includes(h.id));
  const unmentorHabitData = EPIGENETIC_HABITS.filter(h => !p2.mentorHabits.includes(h.id));

  const BLUE_ZONE_HABITS = new Set(['walking', 'community', 'wholefood', 'purpose', 'spiritual', 'gardening', 'fasting', 'laughter', 'meditation']);
  const blueZoneCount = p2.mentorHabits.filter(id => BLUE_ZONE_HABITS.has(id)).length;

  const currentAge = birthDate instanceof Date
    ? new Date().getFullYear() - birthDate.getFullYear()
    : result.currentAge;

  const shareText = celebrityMatches[0]
    ? `I just discovered my longevity trajectory matches ${celebrityMatches[0].name}! Calculate yours at ${window.location.origin}/life-expectancy #LongevityBlueprint`
    : `My longevity forecast is ${result.totalForecast} years! Calculate yours at ${window.location.origin}/life-expectancy #LongevityBlueprint`;

  const copyShare = () => {
    navigator.clipboard.writeText(shareText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const blurNum = (n: number | string, suffix = '') => (
    <BlurredNumber value={n} isPremium={isPremium} suffix={suffix} />
  );

  // For milestones: use optimizedForecast (sim value at report generation) if available
  const displayedOptimized = optimizedForecast ?? simulatedForecast ?? result.totalForecast;

  return (
    <div className="space-y-6">
      {/* ── Report Header ── */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-6 text-center space-y-2">
        <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Full Longevity Blueprint</p>
        {userName && <p className="text-lg font-semibold text-foreground">Prepared for {userName}</p>}
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Current Lifestyle</span>
            <strong className="text-4xl font-black text-muted-foreground">{result.totalForecast} yrs</strong>
          </div>
          {displayedOptimized !== result.totalForecast && (
            <>
              <div className="text-2xl font-black text-primary">→</div>
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-primary block">With Optimized Lifestyle</span>
                <strong className="text-4xl font-black text-primary">{displayedOptimized} yrs</strong>
                {displayedOptimized > result.totalForecast && (
                  <span className="text-xs font-bold text-green-600 block mt-0.5">
                    +{Math.round((displayedOptimized - result.totalForecast) * 10) / 10} years gained
                  </span>
                )}
              </div>
            </>
          )}
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Maximum Potential</span>
            <strong className="text-2xl font-bold text-accent">{result.maximumPotential} yrs</strong>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Current Age</span>
            <strong className="text-2xl font-bold text-foreground">{currentAge} yrs</strong>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
          <Badge className={`border ${VITALITY_COLORS[result.geneticVitalityScore]}`}>
            🧬 Genetic Score: {result.geneticVitalityScore}
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-400">
            🌱 +{result.epigeneticAdjustment}yr epigenetic bonus
          </Badge>
          {result.communityBonus > 0 && (
            <Badge variant="outline" className="text-blue-600 border-blue-400">
              🏘️ +{result.communityBonus}yr community bonus
            </Badge>
          )}
        </div>
        {isPremium && (
          <div className="flex items-center justify-center gap-2 pt-3">
            <Button size="sm" variant="outline" className="gap-2" onClick={() => window.print()}>
              <Download className="w-3.5 h-3.5" /> Export PDF
            </Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={copyShare}>
              {copied ? '✅ Copied!' : <><Copy className="w-3.5 h-3.5" /> Copy share text</>}
            </Button>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="genetics" className="w-full">
        <TabsList className="grid grid-cols-3 w-full border-b rounded-none bg-transparent h-auto p-0">
          <TabsTrigger value="genetics"  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-semibold text-xs sm:text-sm">🧬 Biological Blueprint</TabsTrigger>
          <TabsTrigger value="community" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-semibold text-xs sm:text-sm">🏘️ Community Anchor</TabsTrigger>
          <TabsTrigger value="cultural"  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-semibold text-xs sm:text-sm">🌟 Cultural Horizon</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Biological Blueprint ── */}
        <TabsContent value="genetics" className="pt-5 space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className={`border text-sm px-3 py-1 cursor-help ${VITALITY_COLORS[result.geneticVitalityScore]}`}>
                    🧬 Genetic Vitality Score: {result.geneticVitalityScore}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs p-3">
                  Research shows genetics account for 25–30% of longevity. Your family average of ~{result.familyBaselineAge} years{' '}
                  {result.geneticVitalityScore === 'Exceptional' ? 'shows exceptional hereditary longevity.' :
                   result.geneticVitalityScore === 'Strong'      ? 'indicates solid genetic inheritance.' :
                   result.geneticVitalityScore === 'Average'     ? 'is close to global population norms.' :
                   'suggests focusing on lifestyle habits is especially important.'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-sm text-muted-foreground">
              Family weighted average: ~{result.familyBaselineAge} yrs → Genetic adjustment: {result.geneticAdjustment >= 0 ? '+' : ''}{result.geneticAdjustment} yrs
            </span>
          </div>

          {knownMembers.length === 0 ? (
            <div className="bg-muted/30 rounded-xl border p-6 text-center text-muted-foreground text-sm">
              No family data entered. Complete Step 7 in the calculator to see your genetic family tree.
            </div>
          ) : isPremium ? (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-foreground">Your Genetic Family Tree</h4>
              <div className="grid sm:grid-cols-2 gap-2">
                {knownMembers.map(({ key, label }) => {
                  const m = p1[key];
                  return (
                    <div key={key} className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${ageColor(m.age)}`}>
                      <span className="font-medium">{label}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] font-bold ${ageColor(m.age)}`}>{m.age} yrs</Badge>
                        {m.isLiving && <span className="text-[9px] bg-green-100 text-green-700 px-1.5 rounded-full">Living</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3 flex-wrap text-[10px] text-muted-foreground pt-1">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300 inline-block" /> &gt;80 yrs</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-100 border border-yellow-300 inline-block" /> 70–80 yrs</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-orange-100 border border-orange-300 inline-block" /> 60–70 yrs</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-300 inline-block" /> &lt;60 yrs</span>
              </div>
            </div>
          ) : (
            <PremiumBlur tab="Biological">
              <div className="grid sm:grid-cols-2 gap-2">
                {knownMembers.slice(0, 4).map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between px-3 py-2 rounded-lg border text-xs bg-muted/50">
                    <span className="font-medium">{label}</span>
                    <Badge variant="outline" className="text-[10px]">?? yrs</Badge>
                  </div>
                ))}
              </div>
            </PremiumBlur>
          )}

          <div className="bg-muted/30 rounded-xl border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">Your Genetic Ceiling</h4>
              <strong className="text-lg font-black text-primary">~{Math.round(result.familyBaselineAge + 5)} yrs</strong>
            </div>
            <p className="text-xs text-muted-foreground">Estimated from your family average with a +5yr optimistic modifier based on modern medicine and lifestyle potential.</p>
          </div>

          <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 space-y-2">
            <p className="text-xs font-bold text-primary">📖 Scientific Context</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Research published in <strong className="text-foreground">Science (Karolinska Institute, 2017)</strong> studied 2.87 million Swedish twins and found that genetics account for approximately 25–30% of the variation in human lifespan. This means your habits, environment, and choices control the remaining <strong className="text-foreground">70–75%</strong> of your longevity outcome.
            </p>
          </div>
        </TabsContent>

        {/* ── TAB 2: Community Anchor ── */}
        <TabsContent value="community" className="pt-5 space-y-5">
          {mentorHabitData.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Your Community Anchor's Longevity Habits</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Habits attributed to {p2.mentorName ? `"${p2.mentorName}"` : 'your mentor'} — your environmental blueprint
                  </p>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  +{Math.min(6, mentorHabitData.reduce((s, h) => s + h.gain, 0)).toFixed(1)} community years
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {mentorHabitData.map(h => (
                  <div key={h.id} className="flex items-center gap-2 bg-green-50/50 border border-green-200 dark:bg-green-950/20 dark:border-green-900 rounded-lg px-3 py-2">
                    <span className="text-base">{h.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{h.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{h.source.split(':')[0]}</p>
                    </div>
                    {isPremium ? (
                      <Badge variant="outline" className="text-green-600 border-green-400 text-[10px] shrink-0">+{h.gain}yr</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] shrink-0"><Lock className="w-2.5 h-2.5 inline mr-0.5" />?yr</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No community anchor habits recorded in Step 8. Add a mentor's habits to see their influence on your blueprint.
            </p>
          )}

          {p2.hasMentor && p2.mentorAge > 0 && (
            <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900 p-4 space-y-2">
              <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300">🏘️ Your Community Longevity Anchor</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {p2.mentorName ? `"${p2.mentorName}"` : 'Your longevity mentor'} ({p2.mentorRelationship}, {p2.mentorAge} yrs) represents living proof that your environment supports longevity. People in similar environments share air quality, food culture, noise levels, and social norms.
              </p>
              {p2.mentorAge > 85 && <p className="text-xs font-bold text-green-700">✅ Community bonus: +0.5 years added to your forecast</p>}
            </div>
          )}

          <div className="bg-muted/30 rounded-xl border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">Blue Zones Alignment</h4>
              <Badge variant="outline">{blueZoneCount}/9 principles</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Your mentor's habit profile aligns with <strong className="text-foreground">{blueZoneCount}</strong> of the 9 Blue Zone longevity principles identified by researcher Dan Buettner across the world's longest-lived communities.
            </p>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all" style={{ width: `${Math.round((blueZoneCount / 9) * 100)}%` }} />
            </div>
          </div>

          {unmentorHabitData.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-foreground">Untapped Longevity Opportunities</h4>
              <p className="text-xs text-muted-foreground">Habits not yet attributed to your mentor — or consider adopting them yourself via the simulator:</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {unmentorHabitData.map(h => (
                  <div key={h.id} className="flex items-center gap-2 bg-muted/40 border border-muted rounded-lg px-3 py-2">
                    <span>{h.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground truncate">{h.label}</p>
                    </div>
                    {isPremium ? (
                      <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-400 shrink-0">+{h.gain}yr available</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] shrink-0"><Lock className="w-2.5 h-2.5 inline mr-0.5" /> locked</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── TAB 3: Cultural Horizon ── */}
        <TabsContent value="cultural" className="pt-5 space-y-6">

          {/* Row 1: Current trajectory */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-bold text-foreground">🌟 Your Current Trajectory — {result.totalForecast} Years</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Personalities who walked a similar longevity path to your current forecast.</p>
            </div>
            {isLoadingCelebrities ? (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Finding your matches...</span>
              </div>
            ) : celebrityMatches.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No close matches found for your forecast age.</p>
            ) : (
              <CelebRow celebs={celebrityMatches} celebImages={celebImages} imgErrors={imgErrors} setImgErrors={setImgErrors} isPremium={isPremium} blurNum={blurNum} />
            )}
          </div>

          {/* Row 2: Optimized potential */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-bold text-foreground">✨ Your Optimized Potential — {displayedOptimized} Years</h4>
              <p className="text-xs text-muted-foreground mt-0.5">These icons show what becomes possible when you optimise every pillar.</p>
            </div>
            {isLoadingPotentialCelebrities ? (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Finding potential matches...</span>
              </div>
            ) : potentialCelebrityMatches.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No close matches found for your optimized potential.</p>
            ) : (
              <CelebRow celebs={potentialCelebrityMatches} celebImages={celebImages} imgErrors={imgErrors} setImgErrors={setImgErrors} isPremium={isPremium} blurNum={blurNum} />
            )}
          </div>

          {/* Life Milestones */}
          <LifeMilestones
            currentForecast={result.totalForecast}
            simulatedForecast={displayedOptimized}
            currentAge={currentAge}
          />

          {/* Social share */}
          {isPremium && (
            <Card className="border-primary/20 bg-primary/5 p-4">
              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Share2 className="w-4 h-4" /> Share Your Result</h4>
              <p className="text-xs text-muted-foreground bg-background rounded-lg border p-3 mb-3 leading-relaxed">{shareText}</p>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={copyShare}>
                  {copied ? '✅ Copied' : <><Copy className="w-3 h-3" /> Copy</>}
                </Button>
                <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}>
                  𝕏 Twitter
                </Button>
                <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank')}>
                  📱 WhatsApp
                </Button>
              </div>
            </Card>
          )}

          {!isPremium && (
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="p-4 text-center space-y-2">
                <Crown className="w-5 h-5 text-accent mx-auto" />
                <p className="text-xs text-muted-foreground">Upgrade to see exact longevity age comparisons and share your result</p>
                <Link to="/upgrade"><Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Unlock Cultural Horizon — ₹499 · $6.99</Button></Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

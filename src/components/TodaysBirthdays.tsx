import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Cake, ChevronDown, Rocket } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { FEATURES } from '@/config/features';
import { getTodayTopBoosted, BoostLeaderEntry } from '@/services/CelebrityBoostService';
import {
  getRankedBirthdayCelebrities,
  CelebrityBirthdayResult,
  searchLocalDatabase,
} from '@/services/BirthdaySearchService';
import { WikiPerson } from '@/services/WikimediaService';
import { CelebrityCard, DisplayCelebrity, OccupationCategory } from '@/components/CelebrityCard';
import { classifyDisplayTier, TIER_LABELS, DisplayTier } from '@/data/celebrityCategories';
const CURRENT_YEAR = new Date().getFullYear();
const PAGE_SIZE = 20;

function mapSupabase(r: CelebrityBirthdayResult): DisplayCelebrity {
  const birthYear = r.birthDate ? parseInt(r.birthDate.substring(0, 4)) : null;
  const deathYear = r.deathDate ? parseInt(r.deathDate.substring(0, 4)) : null;
  const age = r.isLiving
    ? (birthYear ? CURRENT_YEAR - birthYear : null)
    : (birthYear && deathYear ? deathYear - birthYear : null);
  return {
    name: r.name,
    birthYear,
    deathYear,
    age,
    isLiving: r.isLiving,
    occupation: r.occupation || 'Celebrity',
    knownFor: r.knownFor ?? null,
    imageUrl: null,
    wikipediaUrl: r.wikipediaUrl,
    sitelinks: r.sitelinks,
  };
}

function mapLocal(p: WikiPerson): DisplayCelebrity {
  const birthYear = p.birthDate ? new Date(p.birthDate).getFullYear() : null;
  const deathYear = p.deathDate ? new Date(p.deathDate).getFullYear() : null;
  const isLiving = !p.deathDate;
  const age = isLiving
    ? (birthYear ? CURRENT_YEAR - birthYear : null)
    : (birthYear && deathYear ? deathYear - birthYear : null);
  return {
    name: p.name,
    birthYear,
    deathYear,
    age,
    isLiving,
    occupation: p.profession || 'Celebrity',
    imageUrl: p.image || null,
    wikipediaUrl: p.wikipediaUrl || null,
    sitelinks: 0,
  };
}

const FILTERS: OccupationCategory[] = ['All', 'Actors', 'Musicians', 'Athletes', 'Politicians', 'Other'];

function getTier(celeb: DisplayCelebrity): DisplayTier {
  return classifyDisplayTier({
    category: celeb.occupation,
    profession: celeb.occupation,
    birth_year: celeb.birthYear ?? undefined,
    death_year: celeb.deathYear,
  });
}

const getCategory = (celeb: unknown): string => {
  const c = celeb as Record<string, unknown>;
  return [c.category, c.type, c.profession, c.occupation, c.known_for, c.field, c.role]
    .filter(Boolean)
    .map(v => (Array.isArray(v) ? v.join(' ') : String(v)))
    .join(' ')
    .toLowerCase();
};

const matchesTab = (celeb: unknown, tab: string): boolean => {
  if (tab === 'All') return true;
  const cat = getCategory(celeb);
  switch (tab) {
    case 'Actors':
      return /actor|actress|film|cinema|television|tv|model|performer|bollywood|tollywood|kollywood/.test(cat);
    case 'Musicians':
      return /music|singer|song|rapper|composer|band|record|vocalist|playback/.test(cat);
    case 'Athletes':
      return /sport|athlete|player|cricket|football|soccer|tennis|badminton|swimmer|boxer|runner|olympic|hockey/.test(cat);
    case 'Politicians':
      return /politi|president|prime minister|minister|mp |parliament|government|congress|senator|governor/.test(cat);
    case 'Other':
      return !/actor|actress|film|cinema|music|singer|song|sport|athlete|player|cricket|football|politi|president|minister/.test(cat);
    default:
      return true;
  }
};

export const TodaysBirthdays = () => {
  const { profile } = useAuth();
  const [allCelebrities, setAllCelebrities] = useState<DisplayCelebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeFilter, setActiveFilter] = useState<OccupationCategory>('All');
  const [topBoosted, setTopBoosted] = useState<BoostLeaderEntry[]>([]);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  useEffect(() => {
    const month = String(todayMonth).padStart(2, '0');
    const day = String(todayDay).padStart(2, '0');
    const monthDay = `${month}-${day}`;
    const userCountry = profile?.country ?? null;

    const load = async () => {
      setLoading(true);
      try {
        const supabaseResults = await getRankedBirthdayCelebrities(monthDay, userCountry, 50);
        let celebs = supabaseResults.map(mapSupabase);

        if (celebs.length < 20) {
          const localResults = await searchLocalDatabase(today);
          const seenNames = new Set(celebs.map(c => c.name.toLowerCase()));
          const localExtras = localResults.people
            .filter(p => !seenNames.has(p.name.toLowerCase()))
            .map(mapLocal);
          celebs = [...celebs, ...localExtras];
        }

        setAllCelebrities(celebs);
      } catch (err) {
        console.error("Failed to load today's birthdays:", err);
      } finally {
        setLoading(false);
      }
    };

    load();

    if (FEATURES.CELEBRITY_BOOST) {
      getTodayTopBoosted(3).then(setTopBoosted);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.country, todayMonth, todayDay]);

  // Split by tier
  const entertainmentCelebs = useMemo(() =>
    allCelebrities.filter(c => getTier(c) === 'entertainment'),
    [allCelebrities]
  );
  const publicFigures = useMemo(() =>
    allCelebrities.filter(c => getTier(c) === 'public_figure'),
    [allCelebrities]
  );
  const historicalFigures = useMemo(() =>
    allCelebrities.filter(c => getTier(c) === 'historical'),
    [allCelebrities]
  );

  // Non-historical for tab counts
  const nonHistorical = useMemo(
    () => [...entertainmentCelebs, ...publicFigures],
    [entertainmentCelebs, publicFigures]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<OccupationCategory, number> = { All: nonHistorical.length, Actors: 0, Musicians: 0, Athletes: 0, Politicians: 0, Other: 0 };
    for (const c of nonHistorical) {
      for (const f of FILTERS.slice(1) as Exclude<OccupationCategory, 'All'>[]) {
        if (matchesTab(c, f)) { counts[f]++; break; }
      }
    }
    return counts;
  }, [nonHistorical]);

  const filteredEntertainment = useMemo(
    () => entertainmentCelebs.filter(c => matchesTab(c, activeFilter)),
    [entertainmentCelebs, activeFilter]
  );
  const filteredPublic = useMemo(
    () => publicFigures.filter(c => matchesTab(c, activeFilter)),
    [publicFigures, activeFilter]
  );

  const allFiltered = useMemo(
    () => [...filteredEntertainment, ...filteredPublic],
    [filteredEntertainment, filteredPublic]
  );

  const visible = allFiltered.slice(0, visibleCount);
  const remaining = allFiltered.length - visibleCount;

  const handleFilterChange = (f: OccupationCategory) => {
    setActiveFilter(f);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="space-y-6">
      {/* Most Boosted Today */}
      {FEATURES.CELEBRITY_BOOST && topBoosted.length > 0 && (
        <div className="bg-muted/40 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground shrink-0">
            <Rocket className="w-4 h-4 text-primary" />
            Most Boosted Today:
          </div>
          {topBoosted.map((entry, i) => (
            <div key={entry.celebrity_name} className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">#{i + 1}</span>
              <span className="font-medium">{entry.celebrity_name}</span>
              <Badge variant="secondary" className="text-xs px-1.5">{entry.boost_count}</Badge>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Cake className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Famous Birthdays — {formattedDate}</h2>
        </div>
        {!loading && allCelebrities.length > 0 && (
          <Badge variant="secondary" className="gap-1.5">
            <Users className="w-3 h-3" />
            {allCelebrities.length} celebrities born today
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <Button
            key={f}
            variant={activeFilter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange(f)}
            className="gap-1.5"
          >
            {f}
            {!loading && categoryCounts[f] > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                activeFilter === f ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {categoryCounts[f]}
              </span>
            )}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading today's birthdays...</p>
        </div>
      ) : (
        <>
          {/* Entertainment + Public Figures */}
          {allFiltered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No results for this category.
            </div>
          ) : (
            <>
              {filteredEntertainment.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-muted-foreground mb-3">{TIER_LABELS.entertainment.heading}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visible
                      .filter(c => getTier(c) === 'entertainment')
                      .map((celeb, index) => (
                        <CelebrityCard key={celeb.name} celebrity={celeb} index={index} />
                      ))}
                  </div>
                </section>
              )}

              {filteredPublic.length > 0 && (
                <section className="mt-6">
                  <h3 className="text-sm font-bold text-muted-foreground mb-3">{TIER_LABELS.public_figure.heading}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visible
                      .filter(c => getTier(c) === 'public_figure')
                      .map((celeb, index) => (
                        <CelebrityCard key={celeb.name} celebrity={celeb} index={index} />
                      ))}
                  </div>
                </section>
              )}

              {remaining > 0 && (
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                  >
                    <ChevronDown className="w-4 h-4" />
                    Load more ({remaining} remaining)
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Historical Figures — always shown, not filtered by tabs */}
          {historicalFigures.length > 0 && (
            <section className="mt-8">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-sm font-bold text-gray-600">{TIER_LABELS.historical.heading}</h3>
              </div>
              <p className="text-xs text-gray-400 italic mb-3">{TIER_LABELS.historical.subtext}</p>
              <div className="space-y-2">
                {historicalFigures.map(celeb => (
                  <div key={celeb.name} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0">
                        {(celeb.name || '?').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-semibold text-gray-800 text-sm">{celeb.name}</p>
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Historical Figure</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {celeb.birthYear}{celeb.deathYear ? ` – ${celeb.deathYear}` : ''}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                          {celeb.occupation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

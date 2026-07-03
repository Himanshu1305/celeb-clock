import { useState, useEffect } from 'react';
import { CakeIcon } from 'lucide-react';
import { classifyDisplayTier, DisplayTier } from '@/data/celebrityCategories';
import { CelebrityCard, DisplayCelebrity } from '@/components/CelebrityCard';
import { getRankedBirthdayCelebrities, CelebrityBirthdayResult } from '@/services/BirthdaySearchService';
import { Skeleton } from '@/components/ui/skeleton';

const CURRENT_YEAR = new Date().getFullYear();

interface CelebrityMatchProps {
  birthDate: Date | null;
}

function supabaseToDisplay(c: CelebrityBirthdayResult): DisplayCelebrity {
  const birthYear = c.birthDate ? new Date(c.birthDate + 'T12:00:00').getFullYear() : null;
  const deathYear = c.deathDate ? new Date(c.deathDate + 'T12:00:00').getFullYear() : null;
  return {
    name: c.name,
    birthYear,
    deathYear,
    age: birthYear && c.isLiving ? CURRENT_YEAR - birthYear : null,
    isLiving: c.isLiving,
    occupation: c.occupation ?? 'Celebrity',
    knownFor: c.knownFor,
    imageUrl: null,
    wikipediaUrl: c.wikipediaUrl,
    sitelinks: c.sitelinks,
  };
}

export const CelebrityMatch = ({ birthDate }: CelebrityMatchProps) => {
  const [matchingCelebrities, setMatchingCelebrities] = useState<CelebrityBirthdayResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!birthDate) return;
    setIsLoading(true);
    const mm = String(birthDate.getMonth() + 1).padStart(2, '0');
    const dd = String(birthDate.getDate()).padStart(2, '0');
    getRankedBirthdayCelebrities(`${mm}-${dd}`, 'IN', 12)
      .then(results => {
        setMatchingCelebrities(results);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [birthDate]);

  if (!birthDate) return null;

  const getTierForCeleb = (c: CelebrityBirthdayResult): DisplayTier => {
    const birthYear = c.birthDate ? new Date(c.birthDate + 'T12:00:00').getFullYear() : undefined;
    return classifyDisplayTier({ profession: c.occupation ?? '', birth_year: birthYear });
  };

  const TIER_ORDER: DisplayTier[] = ['entertainment', 'public_figure', 'historical'];
  const sorted = [...matchingCelebrities].sort((a, b) =>
    TIER_ORDER.indexOf(getTierForCeleb(a)) - TIER_ORDER.indexOf(getTierForCeleb(b))
  );
  const mainCelebs = sorted.filter(c => getTierForCeleb(c) !== 'historical');
  const historicalCelebs = sorted.filter(c => getTierForCeleb(c) === 'historical');

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CakeIcon className="h-8 w-8 text-secondary animate-pulse-glow" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold gradient-text-secondary">
          Celebrity Birthday Matches
        </h2>
        <p className="text-lg text-muted-foreground">
          Famous people who share your special day
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : matchingCelebrities.length > 0 ? (
        <>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-secondary text-secondary-foreground px-6 py-3 rounded-full text-lg font-semibold glow-secondary">
              🎉 {matchingCelebrities.length} Celebrity Match{matchingCelebrities.length > 1 ? 'es' : ''}!
            </div>
          </div>

          {mainCelebs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mainCelebs.map((celebrity, index) => (
                <CelebrityCard key={index} celebrity={supabaseToDisplay(celebrity)} index={index} />
              ))}
            </div>
          )}

          {historicalCelebs.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📚 Historical figures who share your birthday</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {historicalCelebs.map((celebrity, index) => (
                  <CelebrityCard key={index} celebrity={supabaseToDisplay(celebrity)} index={mainCelebs.length + index} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card p-8 text-center rounded-xl border">
          <div className="space-y-4">
            <div className="text-6xl mb-4">🎂</div>
            <h3 className="text-xl font-semibold">No Celebrity Matches Found</h3>
            <p className="text-muted-foreground">
              Your birthday is unique! No celebrities in our database share your special day,
              making you one of a kind.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

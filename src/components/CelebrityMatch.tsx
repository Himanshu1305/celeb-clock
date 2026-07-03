import { useState, useEffect } from 'react';
import { Celebrity } from '@/data/celebrities';
import { classifyDisplayTier, DisplayTier } from '@/data/celebrityCategories';
import { CelebrityCard, DisplayCelebrity } from '@/components/CelebrityCard';

const CURRENT_YEAR = new Date().getFullYear();

interface CelebrityMatchProps {
  birthDate: Date | null;
  onCelebritiesChange?: (celebrities: Celebrity[]) => void;
}

function celebToDisplay(c: Celebrity): DisplayCelebrity {
  const birthYear = c.birthDate ? new Date(c.birthDate).getFullYear() : null;
  return {
    name: c.name,
    birthYear,
    deathYear: null,
    age: birthYear ? CURRENT_YEAR - birthYear : null,
    isLiving: true,
    occupation: c.profession,
    knownFor: c.funFact ?? null,
    imageUrl: null,
    wikipediaUrl: null,
    sitelinks: 0,
  };
}

export const CelebrityMatch = ({ birthDate, onCelebritiesChange }: CelebrityMatchProps) => {
  const [matchingCelebrities, setMatchingCelebrities] = useState<Celebrity[]>([]);

  useEffect(() => {
    if (!birthDate) return;

    import('@/data/celebrities').then(({ findCelebrityByBirthday }) =>
      findCelebrityByBirthday(birthDate).then(matches => {
        setMatchingCelebrities(matches);
        onCelebritiesChange?.(matches);
      })
    );
  }, [birthDate, onCelebritiesChange]);

  if (!birthDate) return null;

  const getTierForCeleb = (c: Celebrity): DisplayTier => {
    const birthYear = c.birthDate ? new Date(c.birthDate).getFullYear() : undefined;
    return classifyDisplayTier({ profession: c.profession, birth_year: birthYear });
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

      {matchingCelebrities.length > 0 ? (
        <>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-secondary text-secondary-foreground px-6 py-3 rounded-full text-lg font-semibold glow-secondary">
              🎉 {matchingCelebrities.length} Celebrity Match{matchingCelebrities.length > 1 ? 'es' : ''}!
            </div>
          </div>

          {mainCelebs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mainCelebs.map((celebrity, index) => (
                <CelebrityCard key={index} celebrity={celebToDisplay(celebrity)} index={index} />
              ))}
            </div>
          )}

          {historicalCelebs.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📚 Historical figures who share your birthday</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {historicalCelebs.map((celebrity, index) => (
                  <CelebrityCard key={index} celebrity={celebToDisplay(celebrity)} index={mainCelebs.length + index} />
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
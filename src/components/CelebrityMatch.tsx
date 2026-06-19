import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Celebrity } from '@/data/celebrities';
import { StarIcon, CakeIcon } from 'lucide-react';
import { classifyDisplayTier, DisplayTier } from '@/data/celebrityCategories';

interface CelebrityMatchProps {
  birthDate: Date | null;
  onCelebritiesChange?: (celebrities: Celebrity[]) => void;
}

const CelebrityCard = ({ celebrity }: { celebrity: Celebrity }) => (
  <Card className="glass-card p-6 animate-fade-in-up hover:glow-primary transition-all duration-300 hover-scale">
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12 border-2 border-primary/30">
          <AvatarImage 
            src={celebrity.image} 
            alt={celebrity.name}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/20 text-primary font-semibold">
            {celebrity.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground">{celebrity.name}</h3>
          <Badge variant="secondary" className="mt-1">
            {celebrity.profession}
          </Badge>
        </div>
        <StarIcon className="h-6 w-6 text-primary animate-pulse-glow" />
      </div>
      
      {celebrity.funFact && (
        <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
          💡 {celebrity.funFact}
        </p>
      )}
      
      <div className="text-xs text-muted-foreground">
        Born: {new Date(celebrity.birthDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
    </div>
  </Card>
);

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
                <CelebrityCard key={index} celebrity={celebrity} />
              ))}
            </div>
          )}

          {historicalCelebs.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📚 Historical figures who share your birthday</p>
              <div className="space-y-2">
                {historicalCelebs.map((celebrity, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0">
                      {celebrity.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{celebrity.name}</p>
                      <p className="text-xs text-gray-500">{celebrity.profession}</p>
                      {celebrity.funFact && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{celebrity.funFact}</p>}
                    </div>
                    <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">Historical</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <Card className="glass-card p-8 text-center">
          <div className="space-y-4">
            <div className="text-6xl mb-4">🎂</div>
            <h3 className="text-xl font-semibold">No Celebrity Matches Found</h3>
            <p className="text-muted-foreground">
              Your birthday is unique! No celebrities in our database share your special day,
              making you one of a kind.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchCelebrityImage } from '@/services/WikipediaImageService';
import { ExternalLink, Rocket } from 'lucide-react';
import { FEATURES } from '@/config/features';
import { boostCelebrity } from '@/services/CelebrityBoostService';
import { useAuth } from '@/hooks/useAuth';

export interface DisplayCelebrity {
  name: string;
  birthYear: number | null;
  deathYear: number | null;
  age: number | null;
  isLiving: boolean;
  occupation: string;
  knownFor?: string | null;
  imageUrl?: string | null;
  wikipediaUrl?: string | null;
  sitelinks?: number;
}

export type OccupationCategory = 'All' | 'Actors' | 'Musicians' | 'Athletes' | 'Politicians' | 'Other';

export function classifyOccupation(occ: string | null | undefined): Exclude<OccupationCategory, 'All'> {
  if (!occ) return 'Other';
  const s = occ.toLowerCase();
  if (s.includes('actor') || s.includes('actress') || s.includes('film director')) return 'Actors';
  if (s.includes('singer') || s.includes('musician') || s.includes('rapper') ||
      s.includes('composer') || s.includes('vocalist') || s.includes('music')) return 'Musicians';
  if (s.includes('athlete') || s.includes('footballer') || s.includes('basketball') ||
      s.includes('tennis') || s.includes('boxer') || s.includes('swimmer') ||
      s.includes('cricket') || s.includes('baseball') || s.includes('golfer') ||
      s.includes('soccer') || s.includes('rugby')) return 'Athletes';
  if (s.includes('politic') || s.includes('president') || s.includes('senator') ||
      s.includes('minister') || s.includes('governor') || s.includes('chancellor')) return 'Politicians';
  return 'Other';
}

interface CelebrityCardProps {
  celebrity: DisplayCelebrity;
  index: number;
}

export const CelebrityCard = ({ celebrity, index }: CelebrityCardProps) => {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState<string | null>(celebrity.imageUrl ?? null);
  const [imageLoading, setImageLoading] = useState(!celebrity.imageUrl);
  const [boosted, setBoosted] = useState(false);
  const [boostCount, setBoostCount] = useState(0);
  const [boosting, setBoosting] = useState(false);

  useEffect(() => {
    if (celebrity.imageUrl) {
      setImageUrl(celebrity.imageUrl);
      setImageLoading(false);
      return;
    }
    let cancelled = false;
    setImageLoading(true);
    fetchCelebrityImage(celebrity.name).then(url => {
      if (!cancelled) {
        setImageUrl(url);
        setImageLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [celebrity.name, celebrity.imageUrl]);

  // Check if already boosted today (local check only — avoids a Supabase read per card)
  useEffect(() => {
    if (!FEATURES.CELEBRITY_BOOST) return;
    const today = new Date().toISOString().split('T')[0];
    const key = `boost_${celebrity.name}_${today}`;
    if (localStorage.getItem(key)) setBoosted(true);
  }, [celebrity.name]);

  const handleBoost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (boosted || boosting) return;
    setBoosting(true);
    const res = await boostCelebrity(celebrity.name, user?.id ?? null);
    setBoostCount(res.totalBoosts);
    if (res.success) setBoosted(true);
    setBoosting(false);
  };

  const initials = celebrity.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const wikiUrl = celebrity.wikipediaUrl ?? `https://en.wikipedia.org/wiki/${celebrity.name.replace(/ /g, '_')}`;

  const lifespan = celebrity.isLiving
    ? [
        celebrity.birthYear ? `Born ${celebrity.birthYear}` : null,
        celebrity.age ? `Age ${celebrity.age}` : null,
      ].filter(Boolean).join(' · ')
    : [
        celebrity.birthYear && celebrity.deathYear
          ? `${celebrity.birthYear} – ${celebrity.deathYear}`
          : celebrity.birthYear ? `b. ${celebrity.birthYear}` : null,
        celebrity.age ? `Age ${celebrity.age}` : null,
      ].filter(Boolean).join(' · ');

  return (
    <Card
      className="glass-card overflow-hidden hover:scale-[1.02] hover:shadow-md transition-all duration-300 group animate-fade-in-up cursor-pointer"
      style={{ animationDelay: `${Math.min(index, 5) * 80}ms` }}
      onClick={() => window.open(wikiUrl, '_blank', 'noopener,noreferrer')}
    >
      <CardContent className="p-4">
        <div className="flex gap-3 items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="w-[68px] h-[68px] border-2 border-border/50 shadow-sm">
              {imageLoading ? (
                <AvatarFallback>
                  <div className="w-full h-full animate-pulse bg-gradient-to-br from-muted to-muted/60 rounded-full" />
                </AvatarFallback>
              ) : (
                <>
                  <AvatarImage src={imageUrl ?? undefined} alt={celebrity.name} className="object-cover" style={{ objectPosition: 'top center' }} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-bold text-lg">
                    {initials}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
            <h3 className="font-semibold text-[15px] leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {celebrity.name}
            </h3>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide truncate">
              {celebrity.occupation}
            </p>
            {celebrity.knownFor && (
              <p className="text-[11px] text-muted-foreground/70 truncate" title={celebrity.knownFor}>
                {celebrity.knownFor}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-muted-foreground">{lifespan}</span>
              {!celebrity.isLiving && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4 border-muted-foreground/30 text-muted-foreground"
                >
                  Historical
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Footer row: Wikipedia link + Boost button */}
        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between">
          <a
            href={wikiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary/80 hover:text-primary hover:underline transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
            ↗ Wikipedia
          </a>

          {FEATURES.CELEBRITY_BOOST && (
            <button
              onClick={handleBoost}
              disabled={boosted || boosting}
              className={`inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 border transition-all ${
                boosted
                  ? 'border-green-400/40 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30'
                  : 'border-muted-foreground/20 text-muted-foreground hover:border-primary/40 hover:text-primary'
              }`}
              aria-label={boosted ? 'Boosted' : `Boost ${celebrity.name}`}
            >
              <Rocket className="w-3 h-3" />
              {boosted ? '✓ Boosted' : 'Boost'}
              {boostCount > 0 && <span className="opacity-70">{boostCount}</span>}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

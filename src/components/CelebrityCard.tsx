import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchCelebrityImage } from '@/services/WikipediaImageService';
import { ExternalLink, Crown } from 'lucide-react';

export interface DisplayCelebrity {
  name: string;
  birthYear: number | null;
  deathYear: number | null;
  age: number | null;
  isLiving: boolean;
  occupation: string;
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

const RANK_STYLES = [
  { bar: 'from-amber-400 to-yellow-500',    badge: 'bg-amber-500' },
  { bar: 'from-slate-300 to-slate-400',     badge: 'bg-slate-400' },
  { bar: 'from-amber-600 to-amber-700',     badge: 'bg-amber-700' },
  { bar: 'from-blue-400 to-indigo-500',     badge: 'bg-blue-500' },
  { bar: 'from-violet-400 to-purple-500',   badge: 'bg-violet-500' },
  { bar: 'from-rose-400 to-pink-500',       badge: 'bg-rose-500' },
];

interface CelebrityCardProps {
  celebrity: DisplayCelebrity;
  index: number;
}

export const CelebrityCard = ({ celebrity, index }: CelebrityCardProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(celebrity.imageUrl ?? null);
  const [imageLoading, setImageLoading] = useState(!celebrity.imageUrl);

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

  const style = RANK_STYLES[index % RANK_STYLES.length];
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
      {/* Rank-coloured accent bar */}
      <div className={`h-[3px] bg-gradient-to-r ${style.bar}`} />

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

            {index === 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-sm">
                <Crown className="w-3 h-3 text-white" />
              </div>
            )}
            {index > 0 && index < 3 && (
              <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${style.badge}`}>
                {index + 1}
              </div>
            )}
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0 flex flex-col h-[68px] justify-between">
            <div className="min-w-0">
              <h3 className="font-semibold text-[15px] leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {celebrity.name}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wide truncate">
                {celebrity.occupation}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
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

        {/* Wikipedia link */}
        <div className="mt-3 pt-2.5 border-t border-border/40">
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
        </div>
      </CardContent>
    </Card>
  );
};

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink, FileText, TrendingUp } from 'lucide-react';
import { longevityIcons, LongevityIcon } from '@/data/longevityIcons';
import { fetchCelebrityImage } from '@/services/WikipediaImageService';

interface Props {
  currentForecast: number;
  optimizedForecast: number;
  currentAge: number;
  userCountry?: string | null;
  onGenerateReport: () => void;
}

function pickMatches(forecast: number, exclude: Set<string>, userCountry?: string | null): LongevityIcon[] {
  for (const window of [5, 8, 12]) {
    const candidates = longevityIcons.filter(
      i => !exclude.has(i.name) && Math.abs(i.longevityAge - forecast) <= window
    );
    if (candidates.length >= 3) {
      const countryFirst = [
        ...candidates.filter(c => c.countryCode === userCountry),
        ...candidates.filter(c => c.countryCode !== userCountry),
      ];
      return countryFirst.slice(0, 3);
    }
  }
  return [...longevityIcons]
    .filter(i => !exclude.has(i.name))
    .sort((a, b) => Math.abs(a.longevityAge - forecast) - Math.abs(b.longevityAge - forecast))
    .slice(0, 3);
}

const BAR_GRADIENTS = [
  'from-amber-400 to-yellow-500',
  'from-blue-400 to-indigo-500',
  'from-violet-400 to-purple-500',
];

function IconCard({ icon, index }: { icon: LongevityIcon; index: number }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCelebrityImage(icon.name).then(url => {
      if (!cancelled) { setImageUrl(url); setImageLoading(false); }
    });
    return () => { cancelled = true; };
  }, [icon.name]);

  const initials = icon.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const wikiUrl = `https://en.wikipedia.org/wiki/${icon.wikiSlug}`;

  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-all duration-300 group animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={`h-[3px] bg-gradient-to-r ${BAR_GRADIENTS[index % BAR_GRADIENTS.length]}`} />
      <CardContent className="p-4">
        <div className="flex gap-3 items-start">
          <Avatar className="w-[64px] h-[64px] shrink-0 border-2 border-border/50 shadow-sm">
            {imageLoading ? (
              <AvatarFallback>
                <div className="w-full h-full animate-pulse bg-gradient-to-br from-muted to-muted/60 rounded-full" />
              </AvatarFallback>
            ) : (
              <>
                <AvatarImage src={imageUrl ?? undefined} alt={icon.name} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-bold text-lg">
                  {initials}
                </AvatarFallback>
              </>
            )}
          </Avatar>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[15px] leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {icon.name}
            </h4>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">
              {icon.category} · {icon.longevityAge} yrs
            </p>
            <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug line-clamp-2">
              {icon.achievement}
            </p>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between">
          <Badge
            variant={icon.isLiving ? 'default' : 'secondary'}
            className="text-[9px] px-1.5 py-0 h-4"
          >
            {icon.isLiving ? 'Living' : 'Legacy'}
          </Badge>
          <a
            href={wikiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-primary/80 hover:text-primary hover:underline"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink className="w-2.5 h-2.5" />
            Wikipedia
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export const CulturalHorizonTeaser = ({
  currentForecast,
  optimizedForecast,
  userCountry,
  onGenerateReport,
}: Props) => {
  const showOptimized = optimizedForecast > currentForecast;
  const gainYears = Math.round((optimizedForecast - currentForecast) * 10) / 10;

  const currentMatches = useMemo(
    () => pickMatches(currentForecast, new Set(), userCountry),
    [currentForecast, userCountry]
  );

  const optimizedMatches = useMemo(() => {
    if (!showOptimized) return [];
    const exclude = new Set(currentMatches.map(i => i.name));
    return pickMatches(optimizedForecast, exclude, userCountry);
  }, [optimizedForecast, currentMatches, showOptimized, userCountry]);

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="text-center space-y-2">
        <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">🌟 Cultural Horizon</p>
        <h3 className="text-2xl font-bold text-foreground">Icons Who Lived Like You</h3>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Real personalities whose longevity matches your trajectory — showing what {currentForecast} years looks like in the real world.
        </p>
      </div>

      {/* Current trajectory */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide shrink-0">
            Your current trajectory — {currentForecast} years
          </p>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {currentMatches.map((icon, i) => (
            <IconCard key={icon.name} icon={icon} index={i} />
          ))}
        </div>
      </div>

      {/* Optimized potential */}
      {showOptimized && optimizedMatches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-primary/30" />
            <p className="text-xs font-bold text-primary uppercase tracking-wide shrink-0">
              ✨ Your optimized potential — {optimizedForecast} years (+{gainYears} yrs)
            </p>
            <div className="h-px flex-1 bg-primary/30" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {optimizedMatches.map((icon, i) => (
              <IconCard key={icon.name} icon={icon} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left space-y-1">
              <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Your Longevity Summary</p>
              <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
                <div>
                  <span className="text-xs text-muted-foreground block">Current lifestyle</span>
                  <strong className="text-2xl font-black text-muted-foreground">{currentForecast} yrs</strong>
                </div>
                {showOptimized && (
                  <>
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <div>
                      <span className="text-xs text-primary font-semibold block">With optimized lifestyle</span>
                      <strong className="text-3xl font-black text-primary">{optimizedForecast} yrs</strong>
                    </div>
                  </>
                )}
              </div>
              {showOptimized && gainYears > 0 && (
                <p className="text-sm font-medium text-green-600">
                  ⚡ You could gain <span className="font-black">{gainYears} years</span> with these changes
                </p>
              )}
            </div>
            <Button
              size="lg"
              className="px-8 py-5 text-base font-bold gap-2 shrink-0 animate-glow"
              onClick={onGenerateReport}
            >
              <FileText className="w-5 h-5" />
              Generate My Full Longevity Blueprint ✨
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

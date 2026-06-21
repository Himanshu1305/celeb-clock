import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Copy, ArrowRight } from 'lucide-react';
import { LongevityResult } from '@/services/LongevityCalculationService';

interface LongevityHeroCardProps {
  result: LongevityResult;
  optimizedForecast: number | null;
  userName: string;
  onDownloadBlueprint?: () => void;
}

export function LongevityHeroCard({ result, optimizedForecast, userName, onDownloadBlueprint }: LongevityHeroCardProps) {
  const [copied, setCopied] = useState(false);

  const displayedOptimized = optimizedForecast ?? result.totalForecast;
  const currentRemaining = Math.max(0, Math.round((result.totalForecast - result.currentAge) * 10) / 10);
  const optimizedRemaining = Math.max(0, Math.round((result.controllablePotential - result.currentAge) * 10) / 10);
  const gain = Math.round((displayedOptimized - result.totalForecast) * 10) / 10;
  const displayName = userName?.trim() || 'You';
  const country = result.quizSnapshot.country ?? 'Global';

  const handleCopySummary = () => {
    const lines: string[] = [
      'My Longevity Forecast (via BornClock):',
      `- Current Lifestyle: ${result.totalForecast} years (${currentRemaining} yrs remaining)`,
      `- With Optimized Habits: ${displayedOptimized} years (${optimizedRemaining} yrs remaining)`,
      ...(gain > 0 ? [`- Potential Gain: +${gain} years`] : []),
      `- Current Age: ${result.currentAge} | Country: ${country}`,
      '- Powered by UN WHO life tables',
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-50/70 to-teal-50/70 border border-blue-100 dark:border-blue-900/40 dark:from-blue-950/20 dark:to-teal-950/20 rounded-2xl p-6 space-y-5 mb-6">
      {/* Title */}
      <div className="text-center">
        <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Your Longevity Blueprint</p>
        <p className="text-sm text-muted-foreground mt-0.5">Prepared for {displayName}</p>
      </div>

      {/* Two-column forecast */}
      <div className="flex items-center justify-center gap-6 flex-wrap">
        <div className="text-center">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Current Lifestyle</span>
          <strong className="text-5xl font-black text-muted-foreground/70">{result.totalForecast}</strong>
          <span className="text-sm text-muted-foreground block mt-0.5">yrs</span>
          <span className="text-xs text-muted-foreground">({currentRemaining} yrs remaining)</span>
        </div>

        <ArrowRight className="w-8 h-8 text-primary/60 shrink-0" />

        <div className="text-center">
          <span className="text-[10px] uppercase font-bold text-primary block mb-1">Optimized Lifestyle</span>
          <strong className="text-5xl font-black text-primary">{displayedOptimized}</strong>
          <span className="text-sm text-primary block mt-0.5">yrs</span>
          <span className="text-xs text-primary">({optimizedRemaining} yrs remaining)</span>
          {gain > 0 && (
            <span className="text-xs font-bold text-green-600 block mt-0.5">+{gain} years potential</span>
          )}
        </div>
      </div>

      {/* Age + baseline */}
      <div className="text-center space-y-0.5">
        <p className="text-xs text-muted-foreground">
          Current Age: <strong className="text-foreground">{result.currentAge}</strong>
          {' · '}Country: <strong className="text-foreground">{country}</strong>
        </p>
        <p className="text-[10px] text-muted-foreground/60">{result.baselineSource}</p>
      </div>

      {/* Badges */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Badge className="bg-white/80 border text-foreground dark:bg-background/80">
          🧬 Genetic: {result.geneticVitalityScore}
        </Badge>
        <Badge variant="outline" className="text-green-600 border-green-400 bg-white/80 dark:bg-background/80">
          🌱 +{result.epigeneticAdjustment}yr epigenetic
        </Badge>
        {result.communityBonus > 0 && (
          <Badge variant="outline" className="text-blue-600 border-blue-400 bg-white/80 dark:bg-background/80">
            🏘️ +{result.communityBonus}yr community
          </Badge>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          className="gap-2 bg-white/80 dark:bg-background/80"
          onClick={() => onDownloadBlueprint?.()}
        >
          <Download className="w-3.5 h-3.5" />
          Export PDF
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 bg-white/80 dark:bg-background/80"
          onClick={handleCopySummary}
        >
          {copied ? '✅ Copied!' : <><Copy className="w-3.5 h-3.5" /> Copy Summary</>}
        </Button>
      </div>
    </div>
  );
}

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { getGenerationBasic } from '@/services/GenerationService';

interface GenerationInfo {
  name: string;
  range: string;
  emoji: string;
  traits: string[];
  color: string;
}

const GENERATION_EXTRAS: Record<string, { traits: string[]; color: string }> = {
  'Gen Alpha':        { traits: ['Digital natives', 'Tech-fluent', 'Socially aware', 'AI-era kids'],            color: 'from-violet-500/20 to-fuchsia-500/20' },
  'Gen Z':            { traits: ['Entrepreneurial', 'Diverse', 'Digitally savvy', 'Socially conscious'],         color: 'from-blue-500/20 to-cyan-500/20' },
  'Millennial':       { traits: ['Adaptable', 'Purpose-driven', 'Tech-comfortable', 'Experience-seeking'],       color: 'from-emerald-500/20 to-teal-500/20' },
  'Gen X':            { traits: ['Independent', 'Resourceful', 'Work-life balanced', 'Self-reliant'],            color: 'from-amber-500/20 to-orange-500/20' },
  'Baby Boomer':      { traits: ['Optimistic', 'Competitive', 'Team-oriented', 'Goal-driven'],                   color: 'from-red-500/20 to-rose-500/20' },
  'Silent Generation':{ traits: ['Disciplined', 'Loyal', 'Traditional', 'Hardworking'],                          color: 'from-slate-500/20 to-gray-500/20' },
};

function getGeneration(year: number): GenerationInfo | null {
  const basic = getGenerationBasic(year);
  if (!basic) return null;
  const extras = GENERATION_EXTRAS[basic.name];
  if (!extras) return null;
  return { ...basic, ...extras };
}

interface GenerationLabelProps {
  birthYear: number;
}

export const GenerationLabel = ({ birthYear }: GenerationLabelProps) => {
  const gen = getGeneration(birthYear);
  if (!gen) return null;

  const handleShare = async () => {
    const text = `I'm a ${gen.emoji} ${gen.name} (${gen.range})! My traits: ${gen.traits.join(', ')}. Find yours at`;
    const url = window.location.origin + '/age-calculator';

    if (navigator.share) {
      try {
        await navigator.share({ title: `I'm a ${gen.name}!`, text, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast.success('Copied to clipboard!');
    }
  };

  return (
    <Card className={`glass-card overflow-hidden`}>
      <div className={`h-1.5 bg-gradient-to-r ${gen.color}`} />
      <CardContent className="p-6 text-center space-y-4">
        <div className="text-4xl">{gen.emoji}</div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">{gen.name}</h3>
          <p className="text-sm text-muted-foreground">{gen.range}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {gen.traits.map(trait => (
            <Badge key={trait} variant="secondary" className="text-xs">
              {trait}
            </Badge>
          ))}
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
          <Share2 className="w-4 h-4" />
          Share Your Generation
        </Button>
      </CardContent>
    </Card>
  );
};

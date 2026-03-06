import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface GenerationInfo {
  name: string;
  range: string;
  emoji: string;
  traits: string[];
  color: string;
}

const generations: { min: number; max: number; info: GenerationInfo }[] = [
  { min: 2013, max: 2099, info: { name: 'Gen Alpha', range: '2013–present', emoji: '🤖', traits: ['Digital natives', 'Tech-fluent', 'Socially aware', 'AI-era kids'], color: 'from-violet-500/20 to-fuchsia-500/20' } },
  { min: 1997, max: 2012, info: { name: 'Gen Z', range: '1997–2012', emoji: '⚡', traits: ['Entrepreneurial', 'Diverse', 'Digitally savvy', 'Socially conscious'], color: 'from-blue-500/20 to-cyan-500/20' } },
  { min: 1981, max: 1996, info: { name: 'Millennial', range: '1981–1996', emoji: '🌐', traits: ['Adaptable', 'Purpose-driven', 'Tech-comfortable', 'Experience-seeking'], color: 'from-emerald-500/20 to-teal-500/20' } },
  { min: 1965, max: 1980, info: { name: 'Gen X', range: '1965–1980', emoji: '🎸', traits: ['Independent', 'Resourceful', 'Work-life balanced', 'Self-reliant'], color: 'from-amber-500/20 to-orange-500/20' } },
  { min: 1946, max: 1964, info: { name: 'Baby Boomer', range: '1946–1964', emoji: '✌️', traits: ['Optimistic', 'Competitive', 'Team-oriented', 'Goal-driven'], color: 'from-red-500/20 to-rose-500/20' } },
  { min: 1928, max: 1945, info: { name: 'Silent Generation', range: '1928–1945', emoji: '📻', traits: ['Disciplined', 'Loyal', 'Traditional', 'Hardworking'], color: 'from-slate-500/20 to-gray-500/20' } },
];

function getGeneration(year: number): GenerationInfo | null {
  const match = generations.find(g => year >= g.min && year <= g.max);
  return match?.info ?? null;
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

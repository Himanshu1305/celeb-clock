import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { lifePathFromDate } from '@/lib/lifePath';
import { famousForLifePath } from '@/data/famousLifePaths';
import { TermTip } from '@/components/vedic/TermTip';

const lifePathData: Record<number, { meaning: string; traits: string[] }> = {
  1: { meaning: 'The Leader — Independent, ambitious, and pioneering.', traits: ['Innovative', 'Determined', 'Self-reliant'] },
  2: { meaning: 'The Diplomat — Sensitive, cooperative, and harmonious.', traits: ['Peacemaker', 'Intuitive', 'Supportive'] },
  3: { meaning: 'The Communicator — Creative, expressive, and social.', traits: ['Artistic', 'Optimistic', 'Charismatic'] },
  4: { meaning: 'The Builder — Practical, disciplined, and hardworking.', traits: ['Reliable', 'Organized', 'Patient'] },
  5: { meaning: 'The Adventurer — Freedom-loving, dynamic, and versatile.', traits: ['Curious', 'Adaptable', 'Energetic'] },
  6: { meaning: 'The Nurturer — Responsible, caring, and family-oriented.', traits: ['Compassionate', 'Protective', 'Devoted'] },
  7: { meaning: 'The Seeker — Analytical, introspective, and spiritual.', traits: ['Thoughtful', 'Wise', 'Mysterious'] },
  8: { meaning: 'The Powerhouse — Ambitious, authoritative, and goal-driven.', traits: ['Visionary', 'Confident', 'Strategic'] },
  9: { meaning: 'The Humanitarian — Compassionate, generous, and idealistic.', traits: ['Selfless', 'Inspiring', 'Global thinker'] },
  11: { meaning: 'Master Number — The Visionary. Highly intuitive and inspired.', traits: ['Enlightened', 'Inspiring', 'Spiritual'] },
  22: { meaning: 'Master Number — The Master Builder. Turns dreams into reality.', traits: ['Practical visionary', 'Powerful', 'Disciplined'] },
  33: { meaning: 'Master Number — The Master Teacher. Selfless devotion to others.', traits: ['Healer', 'Altruistic', 'Uplifting'] },
};

/** Life Path — the ONE shared sitewide function (src/lib/lifePath.ts, audit N1). */
function calculateLifePath(date: Date): number {
  return lifePathFromDate(date);
}

interface NumerologyLifePathProps {
  birthDate: Date;
}

export const NumerologyLifePath = ({ birthDate }: NumerologyLifePathProps) => {
  const lifePathNumber = calculateLifePath(birthDate);
  const data = lifePathData[lifePathNumber] || lifePathData[1];
  // Audit N3: generated from the same function, never a hand-filed list.
  const famous = famousForLifePath(lifePathNumber, { limit: 3 }).map(e => e.name);

  return (
    <Card className="glass-card">
      <CardContent className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold gradient-text-primary">
            <Sparkles className="inline w-7 h-7 mr-2" />
            Your <TermTip id="lifePath">Western Life Path Number</TermTip>
          </h2>
          <p className="text-muted-foreground">Discover what numerology reveals about you</p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
            <span className="text-4xl font-bold text-primary">{lifePathNumber}</span>
          </div>
          <p className="text-lg text-center font-medium text-foreground max-w-lg">{data.meaning}</p>
          {[11, 22, 33].includes(lifePathNumber) && <p className="text-xs text-muted-foreground"><TermTip id="masterNumber">What is a Master Number?</TermTip></p>}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {data.traits.map((trait) => (
            <Badge key={trait} variant="secondary" className="text-sm px-3 py-1">
              {trait}
            </Badge>
          ))}
        </div>

        {famous.length > 0 && (
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Famous people with Life Path {lifePathNumber}:</p>
            <p className="text-sm text-foreground">{famous.join(' • ')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { calculateLifePath };

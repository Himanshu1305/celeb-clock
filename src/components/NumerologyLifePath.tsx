import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

const lifePathData: Record<number, { meaning: string; traits: string[]; famous: string[] }> = {
  1: { meaning: 'The Leader — Independent, ambitious, and pioneering.', traits: ['Innovative', 'Determined', 'Self-reliant'], famous: ['Martin Luther King Jr.', 'Steve Jobs', 'Lady Gaga'] },
  2: { meaning: 'The Diplomat — Sensitive, cooperative, and harmonious.', traits: ['Peacemaker', 'Intuitive', 'Supportive'], famous: ['Barack Obama', 'Jennifer Aniston', 'Kanye West'] },
  3: { meaning: 'The Communicator — Creative, expressive, and social.', traits: ['Artistic', 'Optimistic', 'Charismatic'], famous: ['John Travolta', 'Snoop Dogg', 'Celine Dion'] },
  4: { meaning: 'The Builder — Practical, disciplined, and hardworking.', traits: ['Reliable', 'Organized', 'Patient'], famous: ['Oprah Winfrey', 'Arnold Schwarzenegger', 'Elton John'] },
  5: { meaning: 'The Adventurer — Freedom-loving, dynamic, and versatile.', traits: ['Curious', 'Adaptable', 'Energetic'], famous: ['Abraham Lincoln', 'Angelina Jolie', 'Mick Jagger'] },
  6: { meaning: 'The Nurturer — Responsible, caring, and family-oriented.', traits: ['Compassionate', 'Protective', 'Devoted'], famous: ['Albert Einstein', 'John Lennon', 'Victoria Beckham'] },
  7: { meaning: 'The Seeker — Analytical, introspective, and spiritual.', traits: ['Thoughtful', 'Wise', 'Mysterious'], famous: ['Princess Diana', 'Leonardo DiCaprio', 'Julia Roberts'] },
  8: { meaning: 'The Powerhouse — Ambitious, authoritative, and goal-driven.', traits: ['Visionary', 'Confident', 'Strategic'], famous: ['Nelson Mandela', 'Sandra Bullock', 'Pablo Picasso'] },
  9: { meaning: 'The Humanitarian — Compassionate, generous, and idealistic.', traits: ['Selfless', 'Inspiring', 'Global thinker'], famous: ['Mahatma Gandhi', 'Elvis Presley', 'Bob Marley'] },
  11: { meaning: 'Master Number — The Visionary. Highly intuitive and inspired.', traits: ['Enlightened', 'Inspiring', 'Spiritual'], famous: ['Michelle Obama', 'Mozart', 'David Beckham'] },
  22: { meaning: 'Master Number — The Master Builder. Turns dreams into reality.', traits: ['Practical visionary', 'Powerful', 'Disciplined'], famous: ['Paul McCartney', 'Bill Gates', 'Tina Fey'] },
  33: { meaning: 'Master Number — The Master Teacher. Selfless devotion to others.', traits: ['Healer', 'Altruistic', 'Uplifting'], famous: ['Meryl Streep', 'Francis Ford Coppola', 'Stephen King'] },
};

function calculateLifePath(date: Date): number {
  const digits = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  
  const reduce = (n: number): number => {
    if (n === 11 || n === 22 || n === 33) return n;
    if (n < 10) return n;
    return reduce(String(n).split('').reduce((s, d) => s + parseInt(d), 0));
  };

  const sum = digits.split('').reduce((s, d) => s + parseInt(d), 0);
  return reduce(sum);
}

interface NumerologyLifePathProps {
  birthDate: Date;
}

export const NumerologyLifePath = ({ birthDate }: NumerologyLifePathProps) => {
  const lifePathNumber = calculateLifePath(birthDate);
  const data = lifePathData[lifePathNumber] || lifePathData[1];

  return (
    <Card className="glass-card">
      <CardContent className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold gradient-text-primary">
            <Sparkles className="inline w-7 h-7 mr-2" />
            Your Life Path Number
          </h2>
          <p className="text-muted-foreground">Discover what numerology reveals about you</p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
            <span className="text-4xl font-bold text-primary">{lifePathNumber}</span>
          </div>
          <p className="text-lg text-center font-medium text-foreground max-w-lg">{data.meaning}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {data.traits.map((trait) => (
            <Badge key={trait} variant="secondary" className="text-sm px-3 py-1">
              {trait}
            </Badge>
          ))}
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">Famous people with Life Path {lifePathNumber}:</p>
          <p className="text-sm text-foreground">{data.famous.join(' • ')}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export { calculateLifePath };

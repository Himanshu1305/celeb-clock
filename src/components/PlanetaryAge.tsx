import { Card, CardContent } from '@/components/ui/card';
import { differenceInDays } from 'date-fns';

interface Planet {
  name: string;
  emoji: string;
  orbitalPeriod: number; // in Earth days
  tagline: (age: number) => string;
}

const planets: Planet[] = [
  { name: 'Mercury', emoji: '☿️', orbitalPeriod: 87.97, tagline: (a) => a > 100 ? "You're ancient here!" : "Speedy aging!" },
  { name: 'Venus', emoji: '♀️', orbitalPeriod: 224.7, tagline: (a) => a > 50 ? "Quite the elder!" : "Still young-ish" },
  { name: 'Mars', emoji: '♂️', orbitalPeriod: 687.0, tagline: (a) => `A Martian ${a < 18 ? 'youngster' : 'adult'}` },
  { name: 'Jupiter', emoji: '♃', orbitalPeriod: 4332.59, tagline: () => "Basically a toddler!" },
  { name: 'Saturn', emoji: '♄', orbitalPeriod: 10759.22, tagline: () => "Just a newborn!" },
  { name: 'Uranus', emoji: '⛢', orbitalPeriod: 30688.5, tagline: () => "Not even born yet?" },
  { name: 'Neptune', emoji: '♆', orbitalPeriod: 60182.0, tagline: () => "A mere blink!" },
];

interface PlanetaryAgeProps {
  birthDate: Date;
}

export const PlanetaryAge = ({ birthDate }: PlanetaryAgeProps) => {
  const earthDays = differenceInDays(new Date(), birthDate);

  return (
    <Card className="glass-card">
      <CardContent className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold gradient-text-primary">🪐 Your Age on Other Planets</h2>
          <p className="text-muted-foreground">See how old you'd be across the solar system</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {planets.map((planet) => {
            const age = parseFloat((earthDays / planet.orbitalPeriod).toFixed(2));
            return (
              <div
                key={planet.name}
                className="rounded-xl border border-border bg-card p-4 text-center space-y-2 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl">{planet.emoji}</div>
                <div className="font-semibold text-foreground">{planet.name}</div>
                <div className="text-2xl font-bold text-primary">{age}</div>
                <div className="text-xs text-muted-foreground">{planet.name} years</div>
                <div className="text-xs text-accent italic">{planet.tagline(age)}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

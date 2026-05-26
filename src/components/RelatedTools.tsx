import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface Tool {
  label: string;
  path: string;
  emoji: string;
}

const ALL: Record<string, Tool> = {
  age: { label: 'Best Age Calculator', path: '/age-calculator', emoji: '⏱️' },
  life: { label: 'Best Life Expectancy Calculator', path: '/life-expectancy', emoji: '❤️‍🩹' },
  celeb: { label: 'Best Celebrity Birthday Match', path: '/celebrity-birthday', emoji: '🌟' },
  today: { label: 'Famous Birthdays Today', path: '/todays-birthdays', emoji: '🎂' },
  zodiac: { label: 'Best Zodiac Sign Calculator', path: '/zodiac', emoji: '♈' },
  birthstone: { label: 'Best Birthstone Finder', path: '/birthstone', emoji: '💎' },
  numerology: { label: 'Best Free Numerology Calculator', path: '/numerology', emoji: '🔢' },
  planet: { label: 'Best Planetary Age Calculator', path: '/planetary-age', emoji: '🪐' },
};

interface Props {
  currentSlug: keyof typeof ALL;
}

export const RelatedTools = ({ currentSlug }: Props) => {
  const tools = Object.entries(ALL)
    .filter(([k]) => k !== currentSlug)
    .slice(0, 4)
    .map(([, t]) => t);

  return (
    <section className="max-w-4xl mx-auto mb-16">
      <h2 className="text-2xl font-bold text-center mb-6 gradient-text-primary">Related Tools</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {tools.map((t) => (
          <Link key={t.path} to={t.path}>
            <Card className="glass-card hover:scale-[1.02] transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl">{t.emoji}</span>
                <span className="flex-1 font-medium text-foreground">{t.label}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, ArrowRight, Clock, Gift, Sparkles, Gem, Globe, Hash, Cake } from 'lucide-react';

const features = [
  {
    title: 'Calculate Your Age',
    description: 'Know your exact age in years, months, days, hours, minutes, and seconds — updated live.',
    icon: Clock,
    path: '/age-calculator',
    badge: 'Free',
    badgeClass: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/10',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    hoverBtn: 'group-hover:bg-primary group-hover:text-primary-foreground',
  },
  {
    title: "Today's Birthdays",
    description: 'See which famous people were born today — celebrities, scientists, athletes, and more.',
    icon: Cake,
    path: '/todays-birthdays',
    badge: 'Free',
    badgeClass: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/10',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    hoverBtn: 'group-hover:bg-primary group-hover:text-primary-foreground',
  },
  {
    title: 'Celebrity Match',
    description: 'Discover which famous personalities share your birthday — from actors to world leaders.',
    icon: Gift,
    path: '/celebrity-birthday',
    badge: 'Free',
    badgeClass: 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/10',
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
    hoverBtn: 'group-hover:bg-accent group-hover:text-accent-foreground',
  },
  {
    title: 'Numerology',
    description: 'Calculate your Life Path Number and discover your personality traits and destiny.',
    icon: Hash,
    path: '/numerology',
    badge: 'Free',
    badgeClass: 'bg-secondary/10 text-secondary-foreground border-secondary/20 hover:bg-secondary/10',
    iconBg: 'bg-secondary/10',
    iconColor: 'text-secondary-foreground',
    hoverBtn: 'group-hover:bg-secondary group-hover:text-secondary-foreground',
  },
  {
    title: 'Planetary Age',
    description: "Find out how old you are on Mars, Jupiter, and every planet in our solar system.",
    icon: Globe,
    path: '/planetary-age',
    badge: 'Free',
    badgeClass: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/10',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    hoverBtn: 'group-hover:bg-primary group-hover:text-primary-foreground',
  },
  {
    title: 'Life Expectancy',
    description: 'Get a personalized life expectancy report based on 15+ health and lifestyle factors.',
    icon: Crown,
    path: '/life-expectancy',
    badge: 'Premium',
    isPremium: true,
  },
];

export const FeaturePillars = () => {
  const navigate = useNavigate();

  return (
    <section className="max-w-6xl mx-auto mb-16">
      <h2 className="text-3xl font-bold text-center mb-3 gradient-text-primary">
        Explore Our Tools
      </h2>
      <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
        Everything you need to understand your age, your time, and your future.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature) => {
          if (feature.isPremium) {
            return (
              <Card
                key={feature.path}
                className="relative overflow-hidden cursor-pointer group hover:scale-[1.03] transition-all border-amber-500/30 shadow-lg shadow-amber-500/5"
                onClick={() => navigate(feature.path)}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600" />
                <CardContent className="p-8 text-center space-y-4">
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15">
                    <Crown className="w-3 h-3 mr-1" />
                    {feature.badge}
                  </Badge>
                  <div className="p-4 rounded-2xl bg-amber-500/10 w-fit mx-auto">
                    <feature.icon className="w-10 h-10 text-amber-500" />
                  </div>
                  <h3 className="font-bold text-xl text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  <Button size="sm" className="gap-1.5 mt-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white">
                    <Crown className="w-3.5 h-3.5" />
                    Unlock Report <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card
              key={feature.path}
              className="glass-card hover:scale-[1.03] transition-all cursor-pointer group relative overflow-hidden"
              onClick={() => navigate(feature.path)}
            >
              <CardContent className="p-8 text-center space-y-4">
                <Badge variant="secondary" className={feature.badgeClass}>{feature.badge}</Badge>
                <div className={`p-4 rounded-2xl ${feature.iconBg} w-fit mx-auto`}>
                  <feature.icon className={`w-10 h-10 ${feature.iconColor}`} />
                </div>
                <h3 className="font-bold text-xl text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                <Button variant="outline" size="sm" className={`gap-1.5 mt-2 transition-colors ${feature.hoverBtn}`}>
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Also Explore */}
      <div>
        <h3 className="text-lg font-semibold text-center mb-4 text-muted-foreground">Also Explore</h3>
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Card className="glass-card hover:scale-[1.02] transition-all cursor-pointer" onClick={() => navigate('/zodiac')}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-primary/5">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Zodiac Sign</h4>
                <p className="text-xs text-muted-foreground">Find your astrological sign & traits</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
          <Card className="glass-card hover:scale-[1.02] transition-all cursor-pointer" onClick={() => navigate('/birthstone')}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-primary/5">
                <Gem className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Birthstone</h4>
                <p className="text-xs text-muted-foreground">Discover your birth month gem</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

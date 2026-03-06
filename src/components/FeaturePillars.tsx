import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, ArrowRight, Clock, Users, Sparkles, Search, HeartPulse, RefreshCw, Hash, Globe, Cake } from 'lucide-react';

const mainFeatures = [
  {
    emoji: '⏱️',
    title: 'Age Calculator',
    description: 'Calculate your exact age in days, hours, minutes, and seconds — updated live in real-time. Find out your generation (Boomer, Millennial, Gen Z…) and share your results with friends.',
    icon: Clock,
    path: '/age-calculator',
    cta: 'Calculate My Age',
    color: 'from-primary/20 to-primary/5',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    emoji: '🌟',
    title: 'Celebrity Birthday Match',
    description: 'Enter your date of birth and discover which celebrities, scientists, athletes, and world leaders share your birthday. We match your DOB against thousands of verified famous birthdays.',
    icon: Users,
    path: '/celebrity-birthday',
    cta: 'Find My Celebrity Twins',
    color: 'from-accent/20 to-accent/5',
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  {
    emoji: '♈',
    title: 'Zodiac & Birthstone',
    description: "Discover your zodiac sign with detailed personality traits, compatibility insights, and your birth month's gemstone with its meaning and history.",
    icon: Sparkles,
    path: '/zodiac',
    cta: 'Explore My Zodiac',
    color: 'from-secondary/20 to-secondary/5',
    iconBg: 'bg-secondary/10',
    iconColor: 'text-secondary',
  },
  {
    emoji: '🔍',
    title: 'Celebrity Birthday Search',
    description: "Search for any celebrity's birthday. Find out when your favorite stars were born — results powered by our comprehensive celebrity database.",
    icon: Search,
    path: '/celebrity-birthday',
    cta: 'Search Celebrity Birthdays',
    color: 'from-primary/20 to-accent/5',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    emoji: '❤️‍🩹',
    title: 'Life Expectancy Report',
    description: 'Get a personalized life expectancy estimate based on 15+ factors including smoking, drinking, diabetes, cardiac health, exercise habits, and stress levels. See how many years you could gain by changing habits.',
    icon: HeartPulse,
    path: '/life-expectancy',
    cta: 'Get My Report',
    isPremium: true,
    color: 'from-amber-500/15 to-amber-500/5',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
  },
  {
    emoji: '🔄',
    title: 'What-If Scenarios',
    description: 'Already have your report? See the real-time impact of lifestyle changes — quit smoking, exercise more, reduce stress — and watch your projected lifespan increase instantly.',
    icon: RefreshCw,
    path: '/life-expectancy',
    cta: 'Try What-If Scenarios',
    isPremium: true,
    color: 'from-amber-500/15 to-amber-500/5',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
  },
];

const secondaryTools = [
  { title: 'Numerology', emoji: '🔢', description: 'Discover your Life Path Number', icon: Hash, path: '/numerology' },
  { title: 'Planetary Age', emoji: '🪐', description: 'Your age on Mars, Jupiter & more', icon: Globe, path: '/planetary-age' },
  { title: "Today's Birthdays", emoji: '🎂', description: 'Famous people born today', icon: Cake, path: '/todays-birthdays' },
];

export const FeaturePillars = () => {
  return (
    <section className="max-w-5xl mx-auto mb-16 space-y-16">
      {/* Main Features */}
      <div>
        <div className="text-center mb-10 space-y-3">
          <span className="text-4xl inline-block animate-wiggle">🎊</span>
          <h2 className="text-3xl font-bold gradient-text-primary">
            What Can You Do Here?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore every angle of your birthday — from precise age tracking to celebrity matches and personalized health insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {mainFeatures.map((feature, index) => (
            <Card
              key={feature.title}
              className="glass-card card-party-border hover:scale-[1.03] transition-all duration-300 overflow-hidden group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {feature.isPremium && (
                <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600" />
              )}
              <CardContent className={`p-6 bg-gradient-to-br ${feature.color}`}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl group-hover:animate-wiggle transition-transform shrink-0">
                    {feature.emoji}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg text-foreground">{feature.title}</h3>
                      {feature.isPremium && (
                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    <Button
                      asChild
                      size="sm"
                      className={`gap-1.5 mt-1 ${feature.isPremium ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white' : ''}`}
                      variant={feature.isPremium ? 'default' : 'default'}
                    >
                      <Link to={feature.path}>
                        {feature.cta}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Secondary Tools */}
      <div>
        <h3 className="text-lg font-semibold text-center mb-5 text-muted-foreground">
          ✨ Also Explore
        </h3>
        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {secondaryTools.map((tool, index) => (
            <Link key={tool.path} to={tool.path}>
              <Card className="glass-card card-party-border hover:scale-[1.05] transition-all duration-300 cursor-pointer group">
                <CardContent className="p-5 flex items-center gap-4">
                  <span className="text-3xl group-hover:animate-wiggle">{tool.emoji}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{tool.title}</h4>
                    <p className="text-xs text-muted-foreground">{tool.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

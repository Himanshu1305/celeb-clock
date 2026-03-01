import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, ArrowRight, Clock, Gift, Sparkles, Gem } from 'lucide-react';

export const FeaturePillars = () => {
  const navigate = useNavigate();

  return (
    <section className="max-w-6xl mx-auto mb-16">
      <h2 className="text-3xl font-bold text-center mb-3 gradient-text-primary">
        Our 3 Core Features
      </h2>
      <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
        Everything you need to understand your age, your time, and your future.
      </p>

      {/* 3 Feature Pillars */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {/* Age Calculator */}
        <Card className="glass-card hover:scale-[1.03] transition-all cursor-pointer group relative overflow-hidden" onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}>
          <CardContent className="p-8 text-center space-y-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">Free</Badge>
            <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto">
              <Clock className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-bold text-xl text-foreground">Age Calculator</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Know your exact age in years, months, days, hours, minutes, and seconds — updated live.
            </p>
            <Button variant="outline" size="sm" className="gap-1.5 mt-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              Calculate Now <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardContent>
        </Card>

        {/* Celebrity Match */}
        <Card className="glass-card hover:scale-[1.03] transition-all cursor-pointer group relative overflow-hidden" onClick={() => navigate('/celebrity-birthday')}>
          <CardContent className="p-8 text-center space-y-4">
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/10">Free</Badge>
            <div className="p-4 rounded-2xl bg-accent/10 w-fit mx-auto">
              <Gift className="w-10 h-10 text-accent" />
            </div>
            <h3 className="font-bold text-xl text-foreground">Celebrity Match</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover which famous personalities share your birthday — from actors to world leaders.
            </p>
            <Button variant="outline" size="sm" className="gap-1.5 mt-2 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
              Find Matches <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardContent>
        </Card>

        {/* Life Expectancy - Premium */}
        <Card className="relative overflow-hidden cursor-pointer group hover:scale-[1.03] transition-all border-amber-500/30 shadow-lg shadow-amber-500/5" onClick={() => navigate('/life-expectancy')}>
          {/* Subtle gold shimmer top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600" />
          <CardContent className="p-8 text-center space-y-4">
            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
            <div className="p-4 rounded-2xl bg-amber-500/10 w-fit mx-auto">
              <Crown className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="font-bold text-xl text-foreground">Life Expectancy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get a personalized life expectancy report based on 15+ health, lifestyle, and demographic factors.
            </p>
            <Button size="sm" className="gap-1.5 mt-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white">
              <Crown className="w-3.5 h-3.5" />
              Unlock Report <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Also Explore - Secondary Features */}
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

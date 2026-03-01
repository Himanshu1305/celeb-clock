import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, ArrowRight, Heart, BarChart3, Lightbulb } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const LifeExpectancyCTA = () => {
  const navigate = useNavigate();
  const { isPremium } = useAuth();

  return (
    <section className="max-w-4xl mx-auto mb-16 animate-fade-in-up">
      <div className="relative rounded-2xl overflow-hidden">
        {/* Gold gradient border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 p-[2px]" />
        <div className="relative bg-card rounded-2xl m-[2px] p-8 md:p-10">
          {/* Subtle gold glow */}
          <div className="absolute inset-0 rounded-2xl opacity-[0.04] bg-gradient-to-br from-amber-400 to-yellow-600" />
          
          <div className="relative space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <Crown className="w-6 h-6 text-amber-500" />
              </div>
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15">
                Premium Feature
              </Badge>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                How Long Will You Live?
              </h3>
              <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                Based on your habits, health, and lifestyle — discover your projected lifespan with our science-backed Life Expectancy Calculator.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Heart className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-sm font-medium text-foreground">15+ Health Factors</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <BarChart3 className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-sm font-medium text-foreground">What-If Scenarios</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-sm font-medium text-foreground">Actionable Tips</span>
              </div>
            </div>

            {/* CTA */}
            <Button
              size="lg"
              onClick={() => navigate(isPremium ? '/life-expectancy' : '/upgrade')}
              className="gap-2 text-base px-8 py-6 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg shadow-amber-500/20"
            >
              <Crown className="w-5 h-5" />
              {isPremium ? 'View My Life Report' : 'Unlock Your Life Report'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

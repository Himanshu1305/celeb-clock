import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, ArrowRight, Clock, Users, Sparkles, HeartPulse, Hash, Globe, Cake, Star, BookOpen } from 'lucide-react';

// Live Age Ticker Component
const LiveAgeTicker = () => {
  const [age, setAge] = useState({ years: 28, days: 156, hours: 12, minutes: 34 });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAge(prev => ({
        ...prev,
        minutes: (prev.minutes + 1) % 60,
        hours: prev.minutes === 59 ? (prev.hours + 1) % 24 : prev.hours,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-2 mt-4">
      {[
        { value: age.years, label: 'Years' },
        { value: age.days, label: 'Days' },
        { value: age.hours, label: 'Hours' },
        { value: age.minutes, label: 'Min' },
      ].map((item) => (
        <div key={item.label} className="text-center">
          <div className="text-2xl font-bold text-primary tabular-nums">{item.value}</div>
          <div className="text-xs text-muted-foreground">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

// Sample Celebrity Avatars
const CelebrityAvatars = () => {
  const celebrities = [
    { name: 'Albert Einstein', initials: 'AE' },
    { name: 'Eva Longoria', initials: 'EL' },
    { name: 'will.i.am', initials: 'WI' },
  ];
  
  return (
    <div className="flex items-center gap-2 mt-4">
      <div className="flex -space-x-2">
        {celebrities.map((celeb, i) => (
          <div
            key={celeb.name}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold border-2 border-background"
            title={celeb.name}
          >
            {celeb.initials}
          </div>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">+ 47 more</span>
    </div>
  );
};

// Life Expectancy Gauge
const LifeGauge = () => {
  const percentage = 78;
  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Estimated</span>
        <span className="font-bold text-primary">82.4 years</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-green-500 rounded-full transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex gap-2 text-xs text-muted-foreground">
        <span className="text-green-600">+2.3 exercise</span>
        <span className="text-rose-500">-1.5 stress</span>
      </div>
    </div>
  );
};

// Zodiac Preview
const ZodiacPreview = () => {
  return (
    <div className="mt-4 flex items-center gap-4">
      <div className="text-5xl">♓</div>
      <div>
        <div className="font-bold text-foreground">Pisces</div>
        <div className="text-xs text-muted-foreground">Feb 19 - Mar 20</div>
        <div className="flex gap-1 mt-1">
          {['Creative', 'Intuitive', 'Gentle'].map(trait => (
            <span key={trait} className="text-xs px-2 py-0.5 bg-secondary/10 rounded-full text-secondary">
              {trait}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Planet Ages
const PlanetAges = () => {
  const planets = [
    { name: 'Mars', age: '14.9', emoji: '🔴' },
    { name: 'Jupiter', age: '2.4', emoji: '🟠' },
    { name: 'Saturn', age: '0.95', emoji: '🟡' },
  ];
  
  return (
    <div className="mt-4 space-y-2">
      {planets.map(planet => (
        <div key={planet.name} className="flex items-center justify-between">
          <span className="text-sm flex items-center gap-2">
            <span>{planet.emoji}</span>
            <span className="text-muted-foreground">{planet.name}</span>
          </span>
          <span className="font-bold text-foreground">{planet.age} yrs</span>
        </div>
      ))}
    </div>
  );
};

// Today's Birthday List
const TodaysList = () => {
  const celebs = [
    { name: 'Oscar Isaac', age: 45 },
    { name: 'Bow Wow', age: 37 },
    { name: 'Common', age: 52 },
  ];
  
  return (
    <div className="mt-4 space-y-2">
      {celebs.map(celeb => (
        <div key={celeb.name} className="flex items-center justify-between text-sm">
          <span className="text-foreground">{celeb.name}</span>
          <Badge variant="secondary" className="text-xs">{celeb.age} today</Badge>
        </div>
      ))}
    </div>
  );
};

// Bento Card Component
interface BentoCardProps {
  tag: string;
  tagColor: string;
  title: string;
  description: string;
  cta: string;
  path: string;
  children?: React.ReactNode;
  isPremium?: boolean;
  className?: string;
}

const BentoCard = ({ tag, tagColor, title, description, cta, path, children, isPremium, className = '' }: BentoCardProps) => {
  return (
    <Link to={path} className={`block group ${className}`}>
      <Card className="h-full glass-card card-party-border hover:scale-[1.02] transition-all duration-300 overflow-hidden">
        {isPremium && (
          <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600" />
        )}
        <div className="p-5 h-full flex flex-col">
          {/* Tag */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${tagColor}`}>
              {tag}
            </span>
            {isPremium && (
              <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/20 text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Pro
              </Badge>
            )}
          </div>
          
          {/* Title */}
          <h3 className="font-bold text-lg text-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
            {description}
          </p>
          
          {/* Interactive Content */}
          {children && <div className="mt-auto">{children}</div>}
          
          {/* CTA */}
          <div className={`mt-4 flex items-center gap-1 text-sm font-medium ${isPremium ? 'text-amber-600' : 'text-primary'} group-hover:gap-2 transition-all`}>
            {cta}
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Card>
    </Link>
  );
};

export const BentoGrid = () => {
  return (
    <section className="max-w-6xl mx-auto mb-16 px-4" data-testid="bento-grid">
      {/* Section Header */}
      <div className="text-center mb-10 space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Everything your birthday reveals
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          9 features · free forever · click any card to explore
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 auto-rows-auto">
        
        {/* Age Calculator - Large Card */}
        <BentoCard
          className="lg:col-span-5 lg:row-span-2"
          tag="⏱️ Age Calculator"
          tagColor="bg-primary/10 text-primary"
          title="You're Not Just 28 Years Old"
          description="You're 897 million seconds old. See your exact age update live — in years, months, days, hours, and even heartbeats."
          cta="Calculate my exact age"
          path="/age-calculator"
        >
          <LiveAgeTicker />
        </BentoCard>

        {/* Celebrity Match - Medium Card */}
        <BentoCard
          className="lg:col-span-4 lg:row-span-2"
          tag="🌟 Celebrity Match"
          tagColor="bg-accent/10 text-accent"
          title="Find Your Famous Birthday Twin"
          description="50,000+ celebrities in our database. Discover actors, athletes, scientists, and legends who share your special day."
          cta="Find my celebrity twins"
          path="/celebrity-birthday"
        >
          <CelebrityAvatars />
        </BentoCard>

        {/* Life Expectancy - Medium Card */}
        <BentoCard
          className="lg:col-span-3 lg:row-span-2"
          tag="❤️ Life Expectancy"
          tagColor="bg-rose-500/10 text-rose-600"
          title="How Long Will You Live?"
          description="Personalized estimate based on 15+ health factors. See what adds years to your life."
          cta="Calculate my lifespan"
          path="/life-expectancy"
          isPremium
        >
          <LifeGauge />
        </BentoCard>

        {/* Zodiac - Small Card */}
        <BentoCard
          className="lg:col-span-4"
          tag="♈ Zodiac"
          tagColor="bg-violet-500/10 text-violet-600"
          title="Your Cosmic Identity"
          description="Western & Chinese zodiac, personality traits, and compatibility insights."
          cta="Explore my zodiac"
          path="/zodiac"
        >
          <ZodiacPreview />
        </BentoCard>

        {/* Numerology - Small Card */}
        <BentoCard
          className="lg:col-span-2"
          tag="🔢 Numerology"
          tagColor="bg-violet-500/10 text-violet-600"
          title="Life Path 7"
          description="Your birthday numbers reveal your destiny and personality."
          cta="Find my number"
          path="/numerology"
        >
          <div className="mt-4 text-center">
            <span className="text-6xl font-bold text-violet-500">7</span>
            <div className="text-xs text-muted-foreground mt-1">The Seeker</div>
          </div>
        </BentoCard>

        {/* Birthstone - Small Card */}
        <BentoCard
          className="lg:col-span-2"
          tag="💎 Birthstone"
          tagColor="bg-sky-500/10 text-sky-600"
          title="Aquamarine"
          description="Your birth month's gem and its meaning."
          cta="Discover mine"
          path="/birthstone"
        >
          <div className="mt-4 flex justify-center gap-3 text-4xl">
            <span>💎</span>
            <span>🌸</span>
          </div>
        </BentoCard>

        {/* Planetary Age - Small Card */}
        <BentoCard
          className="lg:col-span-4"
          tag="🪐 Planetary Age"
          tagColor="bg-sky-500/10 text-sky-600"
          title="How Old on Mars?"
          description="Your age on every planet in the solar system. Time moves differently out there."
          cta="See my planet ages"
          path="/planetary-age"
        >
          <PlanetAges />
        </BentoCard>

        {/* Today's Birthdays - Medium Card */}
        <BentoCard
          className="lg:col-span-4"
          tag="🎂 Today's Birthdays"
          tagColor="bg-accent/10 text-accent"
          title="Who's Celebrating Right Now?"
          description="Daily list of famous birthdays. See who shares today's date."
          cta="See all today's birthdays"
          path="/todays-birthdays"
        >
          <TodaysList />
        </BentoCard>

        {/* Blog/Articles - Medium Card */}
        <BentoCard
          className="lg:col-span-4"
          tag="📚 Articles"
          tagColor="bg-rose-500/10 text-rose-600"
          title="Birthday Science & Fun Facts"
          description="Expert articles on astrology, health, and the science behind your birthday."
          cta="Browse all articles"
          path="/blog"
        >
          <div className="mt-4 space-y-2">
            <div className="text-sm text-foreground truncate">→ Why March Babies Live Longer</div>
            <div className="text-sm text-foreground truncate">→ The Psychology of Birthday Months</div>
            <div className="text-sm text-foreground truncate">→ Zodiac Compatibility Guide</div>
          </div>
        </BentoCard>
      </div>
    </section>
  );
};

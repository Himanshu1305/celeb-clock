import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, ArrowRight } from 'lucide-react';

// Live Age Ticker Component with animations
const LiveAgeTicker = () => {
  const [age, setAge] = useState({ years: 28, days: 156, hours: 12, minutes: 34, seconds: 0 });
  const [flash, setFlash] = useState<string | null>(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAge(prev => {
        const newSeconds = (prev.seconds + 1) % 60;
        const newMinutes = newSeconds === 0 ? (prev.minutes + 1) % 60 : prev.minutes;
        const newHours = newMinutes === 0 && newSeconds === 0 ? (prev.hours + 1) % 24 : prev.hours;
        
        // Trigger flash animation on changes
        if (newSeconds === 0) setFlash('minutes');
        else setFlash('seconds');
        
        return {
          ...prev,
          seconds: newSeconds,
          minutes: newMinutes,
          hours: newHours,
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (flash) {
      const timeout = setTimeout(() => setFlash(null), 300);
      return () => clearTimeout(timeout);
    }
  }, [flash]);

  return (
    <div className="grid grid-cols-4 gap-2 mt-4">
      {[
        { value: age.years, label: 'Years', key: 'years' },
        { value: age.days, label: 'Days', key: 'days' },
        { value: age.hours, label: 'Hours', key: 'hours' },
        { value: age.seconds, label: 'Sec', key: 'seconds' },
      ].map((item) => (
        <div key={item.key} className="text-center relative overflow-hidden">
          <div 
            className={`text-2xl font-bold tabular-nums transition-all duration-300 ${
              flash === item.key 
                ? 'text-accent scale-110' 
                : 'text-primary scale-100'
            }`}
          >
            {item.value.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-muted-foreground">{item.label}</div>
          {flash === item.key && (
            <div className="absolute inset-0 bg-accent/20 animate-ping rounded" />
          )}
        </div>
      ))}
    </div>
  );
};

// Sample Celebrity Avatars with stagger animation
const CelebrityAvatars = () => {
  const [isHovered, setIsHovered] = useState(false);
  const celebrities = [
    { name: 'Albert Einstein', initials: 'AE', color: 'from-blue-500 to-purple-500' },
    { name: 'Eva Longoria', initials: 'EL', color: 'from-pink-500 to-rose-500' },
    { name: 'will.i.am', initials: 'WI', color: 'from-amber-500 to-orange-500' },
    { name: 'More', initials: '+47', color: 'from-gray-400 to-gray-500' },
  ];
  
  return (
    <div 
      className="flex items-center gap-2 mt-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex -space-x-2">
        {celebrities.map((celeb, i) => (
          <div
            key={celeb.name}
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${celeb.color} flex items-center justify-center text-white text-xs font-bold border-2 border-background transition-all duration-300 cursor-pointer`}
            style={{ 
              transform: isHovered ? `translateX(${i * 8}px) scale(1.1)` : 'translateX(0) scale(1)',
              transitionDelay: `${i * 50}ms`,
              zIndex: celebrities.length - i,
            }}
            title={celeb.name}
          >
            {celeb.initials}
          </div>
        ))}
      </div>
    </div>
  );
};

// Life Expectancy Gauge with animation
const LifeGauge = () => {
  const [percentage, setPercentage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setPercentage(78);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Estimated</span>
        <span className={`font-bold text-primary transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          82.4 years
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex gap-2 text-xs text-muted-foreground">
        <span className="text-green-600 animate-pulse">+2.3 exercise</span>
        <span className="text-rose-500">-1.5 stress</span>
      </div>
    </div>
  );
};

// Zodiac Preview with rotation animation
const ZodiacPreview = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="mt-4 flex items-center gap-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`text-5xl transition-transform duration-500 ${isHovered ? 'rotate-12 scale-110' : 'rotate-0 scale-100'}`}
      >
        ♓
      </div>
      <div>
        <div className="font-bold text-foreground">Pisces</div>
        <div className="text-xs text-muted-foreground">Feb 19 - Mar 20</div>
        <div className="flex gap-1 mt-1 flex-wrap">
          {['Creative', 'Intuitive', 'Gentle'].map((trait, i) => (
            <span 
              key={trait} 
              className={`text-xs px-2 py-0.5 bg-secondary/10 rounded-full text-secondary transition-all duration-300`}
              style={{ 
                transitionDelay: `${i * 100}ms`,
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              {trait}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Planet Ages with orbit animation
const PlanetAges = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const planets = [
    { name: 'Mars', age: '14.9', emoji: '🔴' },
    { name: 'Jupiter', age: '2.4', emoji: '🟠' },
    { name: 'Saturn', age: '0.95', emoji: '🟡' },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % planets.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="mt-4 space-y-2">
      {planets.map((planet, i) => (
        <div 
          key={planet.name} 
          className={`flex items-center justify-between p-2 rounded-lg transition-all duration-300 ${
            i === activeIndex ? 'bg-primary/10 scale-105' : 'bg-transparent scale-100'
          }`}
        >
          <span className="text-sm flex items-center gap-2">
            <span className={`transition-transform duration-300 ${i === activeIndex ? 'animate-bounce' : ''}`}>
              {planet.emoji}
            </span>
            <span className="text-muted-foreground">{planet.name}</span>
          </span>
          <span className={`font-bold transition-colors duration-300 ${
            i === activeIndex ? 'text-primary' : 'text-foreground'
          }`}>
            {planet.age} yrs
          </span>
        </div>
      ))}
    </div>
  );
};

// Today's Birthday List with slide animation
const TodaysList = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const celebs = [
    { name: 'Oscar Isaac', age: 45 },
    { name: 'Bow Wow', age: 37 },
    { name: 'Common', age: 52 },
    { name: 'Eva Longoria', age: 49 },
    { name: 'will.i.am', age: 49 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % (celebs.length - 2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  const visibleCelebs = celebs.slice(currentIndex, currentIndex + 3);
  
  return (
    <div className="mt-4 space-y-2 overflow-hidden">
      {visibleCelebs.map((celeb, i) => (
        <div 
          key={`${celeb.name}-${currentIndex}`}
          className="flex items-center justify-between text-sm animate-fade-in-up"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <span className="text-foreground">{celeb.name}</span>
          <Badge variant="secondary" className="text-xs">{celeb.age} today</Badge>
        </div>
      ))}
    </div>
  );
};

// Numerology with pulse animation
const NumerologyDisplay = () => {
  const [isPulsing, setIsPulsing] = useState(true);
  
  return (
    <div className="mt-4 text-center">
      <span 
        className={`text-6xl font-bold text-violet-500 inline-block transition-transform duration-500 ${
          isPulsing ? 'animate-pulse scale-110' : 'scale-100'
        }`}
        onMouseEnter={() => setIsPulsing(false)}
        onMouseLeave={() => setIsPulsing(true)}
      >
        7
      </span>
      <div className="text-xs text-muted-foreground mt-1">The Seeker</div>
    </div>
  );
};

// Birthstone with sparkle animation
const BirthstoneDisplay = () => {
  const [sparkle, setSparkle] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSparkle(prev => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(interval);
  }, []);
  
  const gems = ['💎', '🌸', '✨'];
  
  return (
    <div className="mt-4 flex justify-center gap-3 text-4xl">
      {gems.map((gem, i) => (
        <span 
          key={gem}
          className={`transition-all duration-300 ${
            i === sparkle ? 'scale-125 rotate-12' : 'scale-100 rotate-0'
          }`}
        >
          {gem}
        </span>
      ))}
    </div>
  );
};

// Blog Preview with typewriter effect
const BlogPreview = () => {
  const articles = [
    '→ Why March Babies Live Longer',
    '→ The Psychology of Birthday Months',
    '→ Zodiac Compatibility Guide',
  ];
  
  return (
    <div className="mt-4 space-y-2">
      {articles.map((article, i) => (
        <div 
          key={article}
          className="text-sm text-foreground truncate hover:text-primary transition-colors cursor-pointer"
          style={{ animationDelay: `${i * 200}ms` }}
        >
          {article}
        </div>
      ))}
    </div>
  );
};

// Bento Card Component with enhanced hover effects
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
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link 
      to={path} 
      className={`block group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={`h-full glass-card card-party-border overflow-hidden transition-all duration-300 ${
        isHovered ? 'scale-[1.02] shadow-xl shadow-primary/10' : 'scale-100 shadow-none'
      }`}>
        {isPremium && (
          <div className={`h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 transition-all duration-300 ${
            isHovered ? 'h-1.5' : 'h-1'
          }`} />
        )}
        <div className="p-5 h-full flex flex-col relative overflow-hidden">
          {/* Hover gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />
          
          <div className="relative z-10">
            {/* Tag */}
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all duration-300 ${tagColor} ${
                isHovered ? 'scale-105' : 'scale-100'
              }`}>
                {tag}
              </span>
              {isPremium && (
                <Badge className={`bg-amber-500/15 text-amber-700 border-amber-500/20 text-xs transition-all duration-300 ${
                  isHovered ? 'bg-amber-500/25' : ''
                }`}>
                  <Crown className="w-3 h-3 mr-1" />
                  Pro
                </Badge>
              )}
            </div>
            
            {/* Title */}
            <h3 className={`font-bold text-lg mb-2 leading-tight transition-colors duration-300 ${
              isHovered ? 'text-primary' : 'text-foreground'
            }`}>
              {title}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
              {description}
            </p>
          </div>
          
          {/* Interactive Content */}
          {children && <div className="relative z-10 mt-auto">{children}</div>}
          
          {/* CTA */}
          <div className={`relative z-10 mt-4 flex items-center text-sm font-medium transition-all duration-300 ${
            isPremium ? 'text-amber-600' : 'text-primary'
          } ${isHovered ? 'gap-2' : 'gap-1'}`}>
            {cta}
            <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${
              isHovered ? 'translate-x-1' : 'translate-x-0'
            }`} />
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
          <NumerologyDisplay />
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
          <BirthstoneDisplay />
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
          <BlogPreview />
        </BentoCard>
      </div>
    </section>
  );
};

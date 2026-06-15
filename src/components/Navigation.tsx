import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Gem, Home, Clock, Gift, BookOpen, Crown, Hash, Globe, Cake, Menu, Trophy, Users, Activity, Map, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { path: '/age-calculator', label: 'Age Calculator', icon: Clock },
  { path: '/todays-birthdays', label: "Today's Birthdays", icon: Cake },
  { path: '/celebrity-birthday', label: 'Celebrity Match', icon: Gift },
  { path: '/numerology', label: 'Numerology', icon: Hash },
  { path: '/planetary-age', label: 'Planetary Age', icon: Globe },
  { path: '/life-expectancy', label: 'Life Expectancy', icon: Crown, premium: true },
  { path: '/zodiac', label: 'Zodiac', icon: Sparkles },
  { path: '/birthstone', label: 'Birthstone', icon: Gem },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/birthday-report', label: 'Gift Report', icon: Gift },
  { path: '/family', label: 'Family', icon: Users },
  { path: '/blog', label: 'Blog', icon: BookOpen },
  { path: '/biological-age', label: 'Biological Age', icon: Activity },
  { path: '/country-comparison', label: 'Country Comparison', icon: Map },
  { path: '/birthday-report', label: 'Birthday Report', icon: FileText },
];

export const Navigation = () => {
  const location = useLocation();
  const { isInTrial, trialDaysRemaining, profile } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  const isHomePage = location.pathname === '/';

  // Show first 4 items on desktop, rest in dropdown
  const visibleItems = navItems.slice(0, 4);
  const moreItems = navItems.slice(4);

  const showTrialBanner = isInTrial && !profile?.premium_status;

  return (
    <div>
    <nav className="flex items-center gap-1 flex-wrap">

      {!isHomePage && (
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 transition-all">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </Link>
      )}

      {/* Visible nav items */}
      {visibleItems.map((item) => (
        <Link key={item.path} to={item.path}>
          <Button variant={isActive(item.path) ? 'default' : 'ghost'} size="sm" className="gap-1.5 transition-all">
            <item.icon className="w-4 h-4" />
            <span className="hidden md:inline">{item.label}</span>
            {item.premium && (
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15 text-[10px] px-1.5 py-0 h-4 hidden md:inline-flex">
                <Crown className="w-2.5 h-2.5 mr-0.5" />
                PRO
              </Badge>
            )}
          </Button>
        </Link>
      ))}

      {/* More dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {moreItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <DropdownMenuItem className={`gap-2 cursor-pointer ${isActive(item.path) ? 'bg-accent' : ''}`}>
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.premium && (
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15 text-[10px] px-1.5 py-0 h-4 ml-auto">
                    <Crown className="w-2.5 h-2.5 mr-0.5" />
                    PRO
                  </Badge>
                )}
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
    <span className="text-xs text-gray-400 hidden lg:block italic">
      Know your time. Live it well.
    </span>
    {showTrialBanner && (
      <div className="bg-amber-50 border-b border-amber-200 py-1.5 px-4 text-center text-sm text-amber-800 rounded-lg mt-1">
        🎁 Free trial — {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining ·{' '}
        <Link to="/upgrade" className="font-medium underline ml-1">
          Upgrade to keep access →
        </Link>
      </div>
    )}
    </div>
  );
};

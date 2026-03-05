import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Gem, Home, Clock, Gift, BookOpen, Crown, Hash, Globe, Cake, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { path: '/age-calculator', label: 'Age Calculator', icon: Clock },
  { path: '/todays-birthdays', label: "Today's Birthdays", icon: Cake },
  { path: '/celebrity-birthday', label: 'Celebrity Match', icon: Gift },
  { path: '/numerology', label: 'Numerology', icon: Hash },
  { path: '/planetary-age', label: 'Planetary Age', icon: Globe },
  { path: '/life-expectancy', label: 'Life Expectancy', icon: Crown, premium: true },
  { path: '/zodiac', label: 'Zodiac', icon: Sparkles },
  { path: '/birthstone', label: 'Birthstone', icon: Gem },
  { path: '/blog', label: 'Blog', icon: BookOpen },
];

export const Navigation = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const isHomePage = location.pathname === '/';

  // Show first 4 items on desktop, rest in dropdown
  const visibleItems = navItems.slice(0, 4);
  const moreItems = navItems.slice(4);

  return (
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
  );
};

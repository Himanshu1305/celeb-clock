import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Gem, Home, Clock, Gift, BookOpen, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  const isHomePage = location.pathname === '/';

  return (
    <nav className="flex items-center gap-2 flex-wrap">
      {!isHomePage && (
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 transition-all">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </Link>
      )}

      <Link to="/life-expectancy">
        <Button variant={isActive('/life-expectancy') ? 'default' : 'ghost'} size="sm" className="gap-2 transition-all">
          <Clock className="w-4 h-4" />
          <span className="hidden sm:inline">Life Expectancy</span>
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15 text-[10px] px-1.5 py-0 h-4 hidden sm:inline-flex">
            <Crown className="w-2.5 h-2.5 mr-0.5" />
            PRO
          </Badge>
        </Button>
      </Link>

      <Link to="/celebrity-birthday">
        <Button variant={isActive('/celebrity-birthday') ? 'default' : 'ghost'} size="sm" className="gap-2 transition-all">
          <Gift className="w-4 h-4" />
          <span className="hidden sm:inline">Celebrity Match</span>
        </Button>
      </Link>

      <Link to="/zodiac">
        <Button variant={isActive('/zodiac') ? 'default' : 'ghost'} size="sm" className="gap-2 transition-all">
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">Zodiac</span>
        </Button>
      </Link>

      <Link to="/birthstone">
        <Button variant={isActive('/birthstone') ? 'default' : 'ghost'} size="sm" className="gap-2 transition-all">
          <Gem className="w-4 h-4" />
          <span className="hidden sm:inline">Birthstone</span>
        </Button>
      </Link>

      <Link to="/blog">
        <Button variant={isActive('/blog') ? 'default' : 'ghost'} size="sm" className="gap-2 transition-all">
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Blog</span>
        </Button>
      </Link>
    </nav>
  );
};

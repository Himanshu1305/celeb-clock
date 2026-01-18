import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Gem, Home, Clock, Gift } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  const isHomePage = location.pathname === '/';

  return (
    <nav className="flex items-center gap-2">
      {!isHomePage && (
        <Link to="/">
          <Button 
            variant="ghost"
            size="sm" 
            className="gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </Link>
      )}
      
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="h-9 px-3">
              <span className="hidden sm:inline">Calculators</span>
              <span className="sm:hidden">Tools</span>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[200px] p-2">
                <Link to="/life-expectancy">
                  <Button 
                    variant={isActive('/life-expectancy') ? 'default' : 'ghost'} 
                    size="sm" 
                    className="w-full justify-start gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Life Expectancy
                  </Button>
                </Link>
                <Link to="/celebrity-birthday">
                  <Button 
                    variant={isActive('/celebrity-birthday') ? 'default' : 'ghost'} 
                    size="sm" 
                    className="w-full justify-start gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    Celebrity Match
                  </Button>
                </Link>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <Link to="/zodiac">
        <Button 
          variant={isActive('/zodiac') ? 'default' : 'ghost'} 
          size="sm" 
          className="gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">Zodiac</span>
        </Button>
      </Link>
      <Link to="/birthstone">
        <Button 
          variant={isActive('/birthstone') ? 'default' : 'ghost'} 
          size="sm" 
          className="gap-2 transition-all"
        >
          <Gem className="w-4 h-4" />
          <span className="hidden sm:inline">Birthstone</span>
        </Button>
      </Link>
    </nav>
  );
};

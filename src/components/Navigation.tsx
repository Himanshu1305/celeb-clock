import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Gem, Home, Clock, Gift, BookOpen, Crown, Hash, Globe, Cake, Menu, Trophy, Activity, Map, X, Tag, Compass } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { isAdminEmail } from '@/components/AdminRoute';

// BATCH-8 P5: first 5 = the main visible bar (visibleItems = slice(0,5)) —
// Age Calculator · Today's Birthdays · Celebrity Match · Birthday Report · Life Expectancy.
// The rest fall into "More". Birthday Report stays the single money item on the bar;
// Numerology and Gift moved into Explore (see below); Planetary Age lives under More.
const navItems = [
  { path: '/age-calculator', label: 'Age Calculator', icon: Clock },
  { path: '/todays-birthdays', label: "Today's Birthdays", icon: Cake },
  { path: '/celebrity-birthday', label: 'Celebrity Match', icon: Gift },
  { path: '/birthday-report', label: 'Birthday Report', icon: Gift },
  { path: '/life-expectancy', label: 'Life Expectancy', icon: Crown, premium: true },
  // ↑ first 5 = main bar · ↓ More menu
  { path: '/planetary-age', label: 'Planetary Age', icon: Globe },
  { path: '/birthstone', label: 'Birthstone', icon: Gem },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/blog', label: 'Blog', icon: BookOpen },
  { path: '/biological-age', label: 'Biological Age', icon: Activity },
  { path: '/country-comparison', label: 'Country Comparison', icon: Map },
  { path: '/biorhythm', label: 'Biorhythm Calculator', icon: Activity },
  { path: '/coach', label: 'Longevity Coach', icon: Activity },
  { path: '/pricing', label: 'Pricing', icon: Tag },
];

// High-click DISCOVERY hubs. BATCH-8 P5 moved Numerology (both) and Gift a Report in here.
const exploreItems = [
  { path: '/born-in', label: 'Born in Each Month', emoji: '📅' },
  { path: '/born-on/india', label: 'Indian Celebrities by Date', emoji: '🇮🇳' },
  { path: '/numerology', label: 'Numerology by Birthday', emoji: '🔢' },
  { path: '/name-numerology', label: 'Name Numerology', emoji: '✍️' },
  { path: '/biorhythm-workout-calculator', label: 'Biorhythm Workout', emoji: '🏃' },
  { path: '/energy-forecast', label: 'Energy Forecast', emoji: '⚡' },
  { path: '/answers', label: 'Answers', emoji: '❓' },
  { path: '/compatibility', label: 'Compatibility', emoji: '💕' },
  { path: '/weight-on-planets', label: 'Weight on Planets', emoji: '🪐' },
  { path: '/gift', label: 'Gift a Report', emoji: '🎁' },
  { path: '/age-in-days', label: 'Age in Days', emoji: '📅' },
  { path: '/age-in-seconds', label: 'Age in Seconds', emoji: '⏱️' },
  { path: '/birthday-countdown', label: 'Birthday Countdown', emoji: '🎂' },
  { path: '/biological-age-vs-chronological-age', label: 'Biological vs Chronological Age', emoji: '🧬' },
  { path: '/life-expectancy-india-vs-usa', label: 'India vs USA Life Expectancy', emoji: '🌍' },
  { path: '/life-expectancy-india', label: 'Life Expectancy in India', emoji: '🇮🇳' },
  { path: '/life-expectancy-usa', label: 'Life Expectancy in USA', emoji: '🇺🇸' },
  { path: '/life-expectancy-japan', label: 'Life Expectancy in Japan', emoji: '🇯🇵' },
  { path: '/life-expectancy-uk', label: 'Life Expectancy in UK', emoji: '🇬🇧' },
  { path: '/life-expectancy-australia', label: 'Life Expectancy in Australia', emoji: '🇦🇺' },
  { path: '/life-expectancy-canada', label: 'Life Expectancy in Canada', emoji: '🇨🇦' },
  { path: '/life-expectancy-germany', label: 'Life Expectancy in Germany', emoji: '🇩🇪' },
  { path: '/life-expectancy-china', label: 'Life Expectancy in China', emoji: '🇨🇳' },
  { path: '/life-expectancy-singapore', label: 'Life Expectancy in Singapore', emoji: '🇸🇬' },
  { path: '/life-expectancy-brazil', label: 'Life Expectancy in Brazil', emoji: '🇧🇷' },
];

const astrologyItems = [
  { path: '/zodiac', label: 'Western Zodiac', emoji: '♈' },
  { path: '/chinese-zodiac', label: 'Chinese Zodiac', emoji: '🐉' },
  { path: '/vedic-zodiac', label: 'Indian Zodiac (Vedic)', emoji: '🕉️' },
  { path: '/moon-sign', label: 'Moon Sign Calculator', emoji: '🌙' },
  { path: '/tarot-card-by-birthday', label: 'Tarot by Birthday', emoji: '🃏' },
  { path: '/compatibility', label: 'Compatibility Calculator', emoji: '💕' },
  { path: '/birthday', label: 'Birthday Personalities', emoji: '🎂' },
  { path: '/rashi-ratna', label: 'Rashi Ratna', emoji: '💎' },
  { path: '/sun-vs-moon-sign', label: 'Sun Sign vs Moon Sign', emoji: '☀️' },
];

export const Navigation = () => {
  const location = useLocation();
  const { user, isPremium, isInTrial, trialDaysRemaining, isPaidSubscriber, profile, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = (path: string) => location.pathname === path;
  const isHomePage = location.pathname === '/';

  const visibleItems = navItems.slice(0, 5);
  const moreItems = navItems.slice(5);

  // Trial UI is account-age driven; a paid subscriber must never see it. Gate
  // every trial surface on !isPaidSubscriber (premium_status also excludes them,
  // but this is explicit and survives any premium_status timing gap).
  const showTrialPill = isInTrial && !isPaidSubscriber;
  const showTrialBanner = isInTrial && !profile?.premium_status && !isPaidSubscriber;

  const closeMobile = () => setMobileOpen(false);

  const mobileLinkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3.5 min-h-[44px] rounded-xl text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-700 hover:bg-gray-50'
    }`;

  const mobileSectionLabel = (label: string) => (
    <p className="px-4 pt-4 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
      {label}
    </p>
  );

  return (
    <div>
      {/* ── Header row ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 relative z-50">
        <Link to="/" className="flex items-center flex-shrink-0">
          <img
            src="/bornclock-logo.png"
            alt="BornClock"
            className="h-10 md:h-12 w-auto"
            style={{ maxHeight: '48px' }}
          />
        </Link>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-1 p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1 flex-wrap">
          {!isHomePage && (
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2 transition-all">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
          )}

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

          {/* Astrology dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={astrologyItems.some(i => isActive(i.path)) ? 'default' : 'ghost'} size="sm" className="gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span className="hidden md:inline">Astrology</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {astrologyItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <DropdownMenuItem className={`gap-2 cursor-pointer ${isActive(item.path) ? 'bg-accent' : ''}`}>
                    <span className="text-base leading-none">{item.emoji}</span>
                    {item.label}
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Explore dropdown — high-click discovery hubs */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={exploreItems.some(i => isActive(i.path)) ? 'default' : 'ghost'} size="sm" className="gap-1.5">
                <Compass className="w-4 h-4" />
                <span className="hidden md:inline">Explore</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {exploreItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <DropdownMenuItem className={`gap-2 cursor-pointer ${isActive(item.path) ? 'bg-accent' : ''}`}>
                    <span className="text-base leading-none">{item.emoji}</span>
                    {item.label}
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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

          {isAdminEmail(user?.email) && (
            <Link to="/admin" className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded transition-colors">
              Admin
            </Link>
          )}

          {!loading && isPremium && !showTrialPill && (
            <Link
              to="/upgrade"
              className="text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
            >
              ⭐ Premium
            </Link>
          )}

          {!loading && !isPremium && !showTrialPill && (
            <Link
              to="/upgrade"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Upgrade
            </Link>
          )}

          {!loading && showTrialPill && (
            <Link
              to="/upgrade"
              className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              Trial: {trialDaysRemaining}d left
            </Link>
          )}
        </nav>
      </div>

      {/* ── Mobile menu panel (fixed overlay) ──────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop — click to close */}
          <div
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            style={{ top: '56px' }}
            onClick={closeMobile}
          />

          {/* Menu panel */}
          <div
            className="fixed inset-x-0 z-50 md:hidden bg-white shadow-xl border-t border-gray-100 overflow-y-auto"
            style={{ top: '56px', maxHeight: 'calc(100vh - 56px)' }}
          >
            <div className="py-2 px-2 pb-8">
              {!isHomePage && (
                <Link to="/" onClick={closeMobile} className={mobileLinkClass('/')}>
                  <Home className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  Home
                </Link>
              )}

              {mobileSectionLabel('Popular')}
              {visibleItems.map(item => (
                <Link key={item.path} to={item.path} onClick={closeMobile} className={mobileLinkClass(item.path)}>
                  <item.icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.premium && (
                    <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/20 text-[10px] px-1.5 py-0 h-4">
                      <Crown className="w-2.5 h-2.5 mr-0.5" />PRO
                    </Badge>
                  )}
                </Link>
              ))}

              {mobileSectionLabel('Explore')}
              {exploreItems.map(item => (
                <Link key={item.path} to={item.path} onClick={closeMobile} className={mobileLinkClass(item.path)}>
                  <span className="w-4 text-center text-base leading-none flex-shrink-0">{item.emoji}</span>
                  {item.label}
                </Link>
              ))}

              {mobileSectionLabel('Astrology')}
              {astrologyItems.map(item => (
                <Link key={item.path} to={item.path} onClick={closeMobile} className={mobileLinkClass(item.path)}>
                  <span className="w-4 text-center text-base leading-none flex-shrink-0">{item.emoji}</span>
                  {item.label}
                </Link>
              ))}

              {mobileSectionLabel('More Tools')}
              {moreItems.map(item => (
                <Link key={item.path} to={item.path} onClick={closeMobile} className={mobileLinkClass(item.path)}>
                  <item.icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.premium && (
                    <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/20 text-[10px] px-1.5 py-0 h-4">
                      <Crown className="w-2.5 h-2.5 mr-0.5" />PRO
                    </Badge>
                  )}
                </Link>
              ))}

              {isAdminEmail(user?.email) && (
                <Link to="/admin" onClick={closeMobile} className={mobileLinkClass('/admin')}>
                  <span className="w-4 text-center flex-shrink-0">🛡️</span>
                  Admin Dashboard
                </Link>
              )}

              {/* Upgrade CTA for mobile — only for logged-in non-premium users */}
              {!loading && user && !isPremium && !showTrialPill && (
                <div className="mx-2 mt-4">
                  <Link
                    to="/upgrade"
                    onClick={closeMobile}
                    className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    <Crown className="w-4 h-4" /> Upgrade to Premium
                  </Link>
                </div>
              )}
              {!loading && showTrialPill && (
                <div className="mx-2 mt-4">
                  <Link
                    to="/upgrade"
                    onClick={closeMobile}
                    className="flex items-center justify-center gap-2 w-full bg-amber-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
                  >
                    Trial: {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} left — Upgrade
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Trial banner ─────────────────────────────────────────────── */}
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

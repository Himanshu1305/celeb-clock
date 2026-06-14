import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, TrendingUp, Globe } from 'lucide-react';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import {
  getLeaderboard, joinLeaderboard, removeFromLeaderboard,
  getMyRank, getLeaderboardStats, LeaderboardEntry,
} from '@/services/LeaderboardService';

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Brazil', 'Germany', 'France', 'Japan', 'China'];
const AGE_GROUPS = ['20s', '30s', '40s', '50s', '60s', '70s+'];

function getRankStyle(rank: number) {
  if (rank === 1) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 font-bold';
  if (rank === 2) return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold';
  if (rank === 3) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-bold';
  return 'text-muted-foreground';
}

function getRankEmoji(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

export default function Leaderboard() {
  const { user, isPremium } = useAuth();

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState({ total: 0, highest: null as any, average: 0, topAgeGroup: '30s' });
  const [countryFilter, setCountryFilter] = useState('all');
  const [ageGroupFilter, setAgeGroupFilter] = useState('all');
  const [viewFilter, setViewFilter] = useState<'forecast' | 'newest'>('forecast');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [displayName, setDisplayName] = useState('Anonymous');
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);

  const PAGE_SIZE = 20;

  useEffect(() => {
    loadData();
  }, [countryFilter, ageGroupFilter, viewFilter]);

  async function loadData(reset = true) {
    setLoading(true);
    const offset = reset ? 0 : page * PAGE_SIZE;
    if (reset) setPage(0);

    const [data, s] = await Promise.all([
      getLeaderboard({
        country: countryFilter !== 'all' ? countryFilter : undefined,
        ageGroup: ageGroupFilter !== 'all' ? ageGroupFilter : undefined,
        view: viewFilter,
        limit: PAGE_SIZE,
        offset,
      }),
      getLeaderboardStats(),
    ]);

    if (reset) {
      setEntries(data);
    } else {
      setEntries(prev => [...prev, ...data]);
    }
    setStats(s);
    setHasMore(data.length === PAGE_SIZE);

    if (user) {
      const me = data.find(e => e.user_id === user.id);
      if (me) {
        setMyEntry(me);
        const rank = await getMyRank(me.forecast);
        setMyRank(rank);
      }
    }
    setLoading(false);
  }

  async function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    const data = await getLeaderboard({
      country: countryFilter !== 'all' ? countryFilter : undefined,
      ageGroup: ageGroupFilter !== 'all' ? ageGroupFilter : undefined,
      view: viewFilter,
      limit: PAGE_SIZE,
      offset: nextPage * PAGE_SIZE,
    });
    setEntries(prev => [...prev, ...data]);
    setHasMore(data.length === PAGE_SIZE);
  }

  async function handleJoin() {
    if (!user || !isPremium) return;
    setJoining(true);
    await joinLeaderboard(user.id, displayName, 80, null, '30s', 70);
    setShowJoinModal(false);
    setJoining(false);
    loadData();
  }

  async function handleLeave() {
    if (!user) return;
    await removeFromLeaderboard(user.id);
    setMyEntry(null);
    setMyRank(null);
    loadData();
  }

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Longevity Leaderboard — Top Forecasts Worldwide | BornClock"
        description="See the highest longevity forecasts from BornClock users around the world. Filter by country and age group. Join the leaderboard to see how you compare."
        canonicalUrl="/leaderboard"
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center justify-center gap-3">
            <Trophy className="w-9 h-9 text-yellow-500" />
            BornClock Longevity Leaderboard
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Anonymous rankings of the highest longevity forecasts from our community. Join to see how you compare.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Participants', value: stats.total.toLocaleString() },
            { icon: TrendingUp, label: 'Highest Forecast', value: stats.highest ? `${stats.highest.forecast} yrs` : '—' },
            { icon: Globe, label: 'Average Forecast', value: stats.average ? `${stats.average} yrs` : '—' },
            { icon: Trophy, label: 'Top Age Group', value: stats.topAgeGroup || '—' },
          ].map(s => (
            <Card key={s.label} className="glass-card">
              <CardContent className="p-4 text-center">
                <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="text-xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Select value={countryFilter} onValueChange={v => { setCountryFilter(v); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={ageGroupFilter} onValueChange={v => { setAgeGroupFilter(v); }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Ages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ages</SelectItem>
              {AGE_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={viewFilter} onValueChange={v => setViewFilter(v as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="forecast">Top Forecasts</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1" />

          {user && !myEntry && (
            <Button onClick={() => setShowJoinModal(true)} className="gap-2">
              <Trophy className="w-4 h-4" /> Join Leaderboard
            </Button>
          )}
          {user && myEntry && (
            <Button variant="outline" onClick={handleLeave} size="sm">
              Leave Leaderboard
            </Button>
          )}
        </div>

        {/* My rank banner */}
        {myEntry && myRank && (
          <div className="mb-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 px-4 py-3 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
              You are ranked <strong>#{myRank}</strong> globally with a forecast of <strong>{myEntry.forecast} years</strong>
            </span>
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border overflow-hidden bg-white dark:bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Rank</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Country</th>
                <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Age Group</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Forecast</th>
                <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Score</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    Loading leaderboard…
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No entries yet. Be the first to join!
                  </td>
                </tr>
              ) : (
                entries.map((entry, i) => {
                  const rank = page * PAGE_SIZE + i + 1;
                  const isMe = user?.id === entry.user_id;
                  return (
                    <tr
                      key={entry.id}
                      className={`border-b last:border-0 transition-colors ${
                        isMe
                          ? 'bg-indigo-50 dark:bg-indigo-950/20'
                          : 'hover:bg-muted/20'
                      }`}
                    >
                      <td className={`px-4 py-3 ${getRankStyle(rank)}`}>
                        {getRankEmoji(rank)}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {entry.display_name}
                        {isMe && <span className="ml-2 text-xs text-indigo-600">(you)</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {entry.country || '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {entry.age_group}
                      </td>
                      <td className="px-4 py-3 font-bold text-green-600">
                        {entry.forecast} yrs
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                        {entry.score}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={loadMore}>Load More</Button>
          </div>
        )}

        {/* Non-member CTA */}
        {user && !myEntry && (
          <div className="mt-6 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700 p-5 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Take the quiz at{' '}
              <Link to="/life-expectancy" className="text-indigo-600 hover:underline">
                /life-expectancy
              </Link>{' '}
              to get your forecast, then join the leaderboard.
            </p>
            <Button onClick={() => setShowJoinModal(true)} variant="outline" className="gap-2">
              <Trophy className="w-4 h-4" /> Join Leaderboard
            </Button>
          </div>
        )}

        {!user && (
          <div className="mt-6 rounded-xl border border-dashed p-5 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Sign in to join the leaderboard and see your rank.
            </p>
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Join Modal */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join the Leaderboard</DialogTitle>
          </DialogHeader>
          {isPremium ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Display name</label>
                <Input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Anonymous"
                  className="mt-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your forecast, country, and age group will be visible. No other personal information is shared.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleJoin} disabled={joining} className="flex-1">
                  {joining ? 'Joining…' : 'Join Leaderboard'}
                </Button>
                <Button variant="outline" onClick={() => setShowJoinModal(false)} className="flex-1">
                  Keep It Private
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                The leaderboard is free to view. Join as a premium member to add your score.
              </p>
              <Button asChild className="w-full">
                <Link to="/upgrade">Upgrade to Premium →</Link>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

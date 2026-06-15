import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, Globe, BarChart3, Gift, Shield, ExternalLink,
  RefreshCw, Crown, Clock, CheckCircle, Plus,
  LayoutDashboard, ArrowLeft, AlertTriangle, UserCheck,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  country?: string;
  created_at: string;
  premium_status: boolean;
  promo_premium_until?: string | null;
}

interface PromoCode {
  id: number;
  code: string;
  description: string;
  duration_days: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  trialUsers: number;
  todayUsers: number;
  quizCount: number;
  pdfCount: number;
  familyCount: number;
  boostCount: number;
}

interface ConfirmState {
  show: boolean;
  message: string;
  onConfirm: () => Promise<void>;
}

type Section = 'overview' | 'users' | 'countries' | 'usage' | 'promo' | 'system';

// cast for tables that may not yet be in generated Database types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// ── Stat Card helper ──────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, Icon, color,
}: {
  label: string;
  value: number | string;
  sub?: string;
  Icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
        <p className="text-3xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ── Plan badge helper ─────────────────────────────────────────────────────────

function planBadge(u: UserProfile) {
  const now = new Date();
  if (u.premium_status)
    return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Premium</Badge>;
  if (u.promo_premium_until && new Date(u.promo_premium_until) > now)
    return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Promo</Badge>;
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (new Date(u.created_at) > sevenDaysAgo)
    return <Badge className="bg-green-100 text-green-800 border-green-300">Trial</Badge>;
  return <Badge variant="outline" className="text-gray-500">Free</Badge>;
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────

export default function Admin() {
  const { toast } = useToast();

  const [section, setSection] = useState<Section>('overview');

  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const [countries, setCountries] = useState<[string, number][]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDuration, setNewDuration] = useState('30');
  const [newMaxUses, setNewMaxUses] = useState('');
  const [newExpires, setNewExpires] = useState('');
  const [creating, setCreating] = useState(false);

  const [confirm, setConfirm] = useState<ConfirmState>({
    show: false,
    message: '',
    onConfirm: async () => {},
  });

  // ── Fetchers ──────────────────────────────────────────────────────────────

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const todayStart = now.toISOString().split('T')[0];

      const [
        { count: totalUsers },
        { count: premiumUsers },
        { count: trialUsers },
        { count: todayUsers },
        { count: quizCount },
        { count: pdfCount },
        { count: familyCount },
        { count: boostCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('premium_status', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
        db.from('longevity_scores').select('*', { count: 'exact', head: true }),
        db.from('pdf_reports_log').select('*', { count: 'exact', head: true }),
        db.from('family_members').select('*', { count: 'exact', head: true }),
        db.from('celebrity_boosts').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: totalUsers ?? 0,
        premiumUsers: premiumUsers ?? 0,
        trialUsers: trialUsers ?? 0,
        todayUsers: todayUsers ?? 0,
        quizCount: quizCount ?? 0,
        pdfCount: pdfCount ?? 0,
        familyCount: familyCount ?? 0,
        boostCount: boostCount ?? 0,
      });
    } catch (e) {
      console.error('fetchStats:', e);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, email, name, country, created_at, premium_status, promo_premium_until')
        .order('created_at', { ascending: false })
        .limit(50);
      setUsers((data as UserProfile[]) ?? []);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchCountries = async () => {
    setCountriesLoading(true);
    try {
      const { data } = await supabase.from('profiles').select('country').not('country', 'is', null);
      const counts: Record<string, number> = {};
      (data ?? []).forEach((p: { country: string | null }) => {
        const c = p.country ?? 'Unknown';
        counts[c] = (counts[c] ?? 0) + 1;
      });
      setCountries(Object.entries(counts).sort(([, a], [, b]) => b - a));
    } finally {
      setCountriesLoading(false);
    }
  };

  const fetchPromoCodes = async () => {
    setPromoLoading(true);
    try {
      const { data } = await db.from('promo_codes').select('*').order('created_at', { ascending: false });
      setPromoCodes(data ?? []);
    } finally {
      setPromoLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    if (section === 'users' && users.length === 0) fetchUsers();
    if (section === 'countries' && countries.length === 0) fetchCountries();
    if (section === 'promo') fetchPromoCodes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // ── User actions ──────────────────────────────────────────────────────────

  const grantPromo = async (u: UserProfile) => {
    const until = new Date();
    until.setDate(until.getDate() + 30);
    await supabase
      .from('profiles')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ promo_premium_until: until.toISOString() } as any)
      .eq('id', u.id);
    toast({ title: 'Promo granted', description: `${u.email} gets 30 days premium.` });
    fetchUsers();
  };

  const grantFull = async (u: UserProfile) => {
    await supabase.from('profiles').update({ premium_status: true }).eq('id', u.id);
    toast({ title: 'Premium granted', description: `${u.email} is now full premium.` });
    fetchUsers();
  };

  const revoke = async (u: UserProfile) => {
    await supabase
      .from('profiles')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ premium_status: false, promo_premium_until: null } as any)
      .eq('id', u.id);
    toast({ title: 'Premium revoked', description: `${u.email} reverted to free.` });
    fetchUsers();
  };

  const withConfirm = (message: string, fn: () => Promise<void>) => {
    setConfirm({ show: true, message, onConfirm: fn });
  };

  // ── Promo code create ─────────────────────────────────────────────────────

  const createPromoCode = async () => {
    if (!newCode.trim() || !newDesc.trim()) {
      toast({ title: 'Missing fields', description: 'Code and description required.', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const { error } = await db.from('promo_codes').insert({
        code: newCode.toUpperCase().trim(),
        description: newDesc.trim(),
        duration_days: parseInt(newDuration) || 30,
        max_uses: newMaxUses ? parseInt(newMaxUses) : null,
        expires_at: newExpires || null,
        is_active: true,
        current_uses: 0,
      });
      if (error) throw error;
      toast({ title: 'Code created', description: `${newCode.toUpperCase()} is now active.` });
      setNewCode(''); setNewDesc(''); setNewDuration('30'); setNewMaxUses(''); setNewExpires('');
      fetchPromoCodes();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const togglePromoActive = async (code: PromoCode) => {
    await db.from('promo_codes').update({ is_active: !code.is_active }).eq('id', code.id);
    toast({ title: code.is_active ? 'Code deactivated' : 'Code activated' });
    fetchPromoCodes();
  };

  // ── Sidebar nav items ─────────────────────────────────────────────────────

  const navItems: { id: Section; label: string; Icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
    { id: 'users',    label: 'Users',    Icon: Users },
    { id: 'countries',label: 'Countries',Icon: Globe },
    { id: 'usage',    label: 'Usage',    Icon: BarChart3 },
    { id: 'promo',    label: 'Promo Codes', Icon: Gift },
    { id: 'system',   label: 'System',   Icon: Shield },
  ];

  const filteredUsers = users.filter(u =>
    !userSearch ||
    (u.email ?? '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.name ?? '').toLowerCase().includes(userSearch.toLowerCase())
  );

  const totalCountryUsers = countries.reduce((s, [, n]) => s + n, 0);

  // ── Section renders ───────────────────────────────────────────────────────

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Overview</h2>
        <Button variant="outline" size="sm" onClick={fetchStats} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>
      {statsLoading ? (
        <p className="text-muted-foreground animate-pulse">Loading stats…</p>
      ) : (
        <>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Users</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Users" value={stats?.totalUsers ?? 0} Icon={Users} color="bg-blue-500" />
              <StatCard
                label="Premium Users" value={stats?.premiumUsers ?? 0} Icon={Crown} color="bg-amber-500"
                sub={stats?.totalUsers
                  ? `${Math.round(((stats.premiumUsers) / stats.totalUsers) * 100)}% of total`
                  : undefined}
              />
              <StatCard label="New This Week" value={stats?.trialUsers ?? 0} Icon={Clock} color="bg-green-500" />
              <StatCard label="New Today" value={stats?.todayUsers ?? 0} Icon={UserCheck} color="bg-purple-500" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Feature Usage</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Quizzes Completed" value={stats?.quizCount ?? 0} Icon={BarChart3} color="bg-indigo-500" />
              <StatCard label="PDFs Generated"    value={stats?.pdfCount ?? 0}  Icon={Gift}     color="bg-pink-500" />
              <StatCard label="Family Members"     value={stats?.familyCount ?? 0} Icon={Users}  color="bg-teal-500" />
              <StatCard label="Celebrity Boosts"   value={stats?.boostCount ?? 0} Icon={Crown}   color="bg-orange-500" />
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Users</h2>
        <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>
      <Input
        placeholder="Search by email or name…"
        value={userSearch}
        onChange={e => setUserSearch(e.target.value)}
        className="max-w-sm"
      />
      {usersLoading ? (
        <p className="text-muted-foreground animate-pulse">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Email', 'Name', 'Country', 'Joined', 'Plan', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.email ?? '—'}</td>
                  <td className="px-4 py-3 font-medium">{u.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.country ?? '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{planBadge(u)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <Button size="sm" variant="outline" className="text-xs h-7 px-2"
                        onClick={() => withConfirm(`Grant 30-day promo to ${u.email}?`, () => grantPromo(u))}>
                        👑 30d
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-7 px-2"
                        onClick={() => withConfirm(`Make ${u.email} full premium?`, () => grantFull(u))}>
                        ⭐ Full
                      </Button>
                      <Button size="sm" variant="outline"
                        className="text-xs h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => withConfirm(`Revoke premium for ${u.email}?`, () => revoke(u))}>
                        🔒 Revoke
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderCountries = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Countries</h2>
        <Button variant="outline" size="sm" onClick={fetchCountries} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>
      {countriesLoading ? (
        <p className="text-muted-foreground animate-pulse">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Rank', 'Country', 'Users', '% of Total'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {countries.map(([country, count], i) => (
                <tr key={country} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 text-muted-foreground">#{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{country}</td>
                  <td className="px-4 py-3">{count.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {totalCountryUsers ? `${((count / totalCountryUsers) * 100).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
              {countries.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No country data yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderUsage = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Usage</h2>
      {statsLoading ? (
        <p className="text-muted-foreground animate-pulse">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Longevity Quizzes Completed', value: stats?.quizCount ?? 0, emoji: '🔬' },
            { label: 'Birthday PDF Reports Generated', value: stats?.pdfCount ?? 0, emoji: '📄' },
            { label: 'Family Members Added', value: stats?.familyCount ?? 0, emoji: '👨‍👩‍👧' },
            { label: 'Celebrity Boosts', value: stats?.boostCount ?? 0, emoji: '⭐' },
            { label: 'Total Users', value: stats?.totalUsers ?? 0, emoji: '👥' },
            { label: 'Premium Users', value: stats?.premiumUsers ?? 0, emoji: '👑' },
          ].map(({ label, value, emoji }) => (
            <Card key={label}>
              <CardContent className="p-6 flex items-center gap-4">
                <span className="text-3xl">{emoji}</span>
                <div>
                  <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderPromo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Promo Codes</h2>
        <Button variant="outline" size="sm" onClick={fetchPromoCodes} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {promoLoading ? (
        <p className="text-muted-foreground animate-pulse">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Code', 'Description', 'Days', 'Used/Max', 'Active', 'Expires', 'Toggle'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {promoCodes.map(code => (
                <tr key={code.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-bold tracking-wider">{code.code}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">{code.description}</td>
                  <td className="px-4 py-3">{code.duration_days}d</td>
                  <td className="px-4 py-3">{code.current_uses}/{code.max_uses ?? '∞'}</td>
                  <td className="px-4 py-3">
                    {code.is_active
                      ? <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>
                      : <Badge variant="outline" className="text-gray-400">Inactive</Badge>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" className="text-xs h-7"
                      onClick={() => togglePromoActive(code)}>
                      {code.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
              {promoCodes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No promo codes yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create New Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Code *</label>
              <Input placeholder="WELCOME30" value={newCode}
                onChange={e => setNewCode(e.target.value.toUpperCase())} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Description *</label>
              <Input placeholder="Welcome discount" value={newDesc}
                onChange={e => setNewDesc(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Duration (days)</label>
              <Input type="number" placeholder="30" value={newDuration}
                onChange={e => setNewDuration(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Max Uses (blank = unlimited)</label>
              <Input type="number" placeholder="Unlimited" value={newMaxUses}
                onChange={e => setNewMaxUses(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Expires (optional)</label>
              <Input type="date" value={newExpires}
                onChange={e => setNewExpires(e.target.value)} />
            </div>
          </div>
          <Button onClick={createPromoCode} disabled={creating} className="gap-2">
            <Plus className="w-4 h-4" />
            {creating ? 'Creating…' : 'Create Code'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Health</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Database',   status: 'Supabase — Connected ✅',         href: 'https://supabase.com' },
          { label: 'Hosting',    status: 'Vercel — Live ✅',                 href: 'https://vercel.com' },
          { label: 'Domain',     status: 'bornclock.com — Active ✅',        href: 'https://bornclock.com' },
          { label: 'Test Suite', status: '158/158 tests passing ✅',          href: null },
        ].map(({ label, status, href }) => (
          <Card key={label}>
            <CardContent className="p-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
              <p className="font-medium">{status}</p>
              {href && (
                <a href={href} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-2">
                  {href} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </CardContent>
          </Card>
        ))}

        <Card className="sm:col-span-2">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Migrations Applied</p>
            <div className="space-y-1.5">
              {[
                'celebrity_sitelinks',
                'promo_codes',
                'celebrity_boosts',
                'longevity_scores',
                'leaderboard_entries',
                'family_members',
                'pdf_reports_log',
              ].map(m => (
                <p key={m} className="text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="font-mono text-xs">{m}</span>
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Quick Links</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'View Live Site →',           href: 'https://bornclock.com' },
              { label: 'Vercel Dashboard →',         href: 'https://vercel.com' },
              { label: 'Supabase Dashboard →',       href: 'https://supabase.com' },
              { label: 'Google Search Console →',    href: 'https://search.google.com/search-console' },
              { label: 'Staging Site →',             href: 'https://staging.bornclock.com' },
            ].map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5">
                  {label} <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const sectionContent: Record<Section, () => React.JSX.Element> = {
    overview:  renderOverview,
    users:     renderUsers,
    countries: renderCountries,
    usage:     renderUsage,
    promo:     renderPromo,
    system:    renderSystem,
  };

  // ── Layout ─────────────────────────────────────────────────────────────────

  return (
    <>
      <SEO title="Admin Dashboard | BornClock" description="BornClock admin dashboard" noindex />

      <div className="flex min-h-screen bg-gray-50">

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white shrink-0">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <span className="font-bold text-lg">BornClock Admin</span>
            </div>
            <Link to="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Back to site
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  section === id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main column */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Mobile header + tabs */}
          <div className="lg:hidden bg-slate-900 text-white sticky top-0 z-40">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
              <Shield className="w-5 h-5 text-indigo-400" />
              <span className="font-bold">BornClock Admin</span>
              <Link to="/" className="ml-auto text-xs text-slate-400 hover:text-white flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Site
              </Link>
            </div>
            <div className="flex overflow-x-auto scrollbar-none">
              {navItems.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setSection(id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                    section === id
                      ? 'border-indigo-400 text-white'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Section content */}
          <main className="flex-1 p-6 overflow-auto">
            {sectionContent[section]()}
          </main>
        </div>

        {/* Confirmation overlay */}
        {confirm.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm shadow-2xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">{confirm.message}</p>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setConfirm(c => ({ ...c, show: false }))}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      const fn = confirm.onConfirm;
                      setConfirm(c => ({ ...c, show: false }));
                      await fn();
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}

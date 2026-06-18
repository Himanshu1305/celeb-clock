import { useState, useEffect, Component, type ReactNode, type ErrorInfo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Trash2, Lock, ArrowRight } from 'lucide-react';

// ── Error Boundary ────────────────────────────────────────────────────────────

class FamilyErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('FamilyDashboard error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">Unable to load the Family Dashboard. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import {
  getFamilyMembers, addFamilyMember, deleteFamilyMember,
  FamilyMember,
} from '@/services/FamilyService';
import { QUIZ_COUNTRIES } from '@/services/LongevityCalculationService';

const MAX_MEMBERS = 10;

function calcAge(dob: string) {
  return Math.floor(
    (new Date().getTime() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
}

function forecastColor(f: number) {
  if (f > 80) return 'text-green-600';
  if (f >= 70) return 'text-blue-600';
  return 'text-amber-600';
}

function barColor(f: number) {
  if (f > 80) return '#22c55e';
  if (f >= 70) return '#3b82f6';
  return '#f59e0b';
}

function FamilyDashboardInner() {
  const { user, isPremium, isInTrial, profile, loading: authLoading } = useAuth();

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [form, setForm] = useState({
    name: '',
    date_of_birth: '',
    gender: 'male' as string,
    country: '',
  });

  useEffect(() => {
    if (!user?.id) return;
    getFamilyMembers(user.id)
      .then(data => {
        setMembers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('getFamilyMembers error:', err);
        setLoading(false);
      });
  }, [user?.id]);

  async function handleAdd() {
    if (!user || !form.name || !form.date_of_birth) return;
    const member = await addFamilyMember(user.id, form);
    if (member) {
      setMembers(prev => [...prev, member]);
      setForm({ name: '', date_of_birth: '', gender: 'male', country: '' });
      setShowAdd(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteFamilyMember(id);
    setMembers(prev => prev.filter(m => m.id !== id));
  }

  const avgForecast = members.length
    ? Math.round((members.reduce((s, m) => s + (m.forecast_cache || 0), 0) / members.length) * 10) / 10
    : 0;

  const myForecast = null; // Would come from saved result

  const chartData = members.map(m => ({
    name: m.name,
    forecast: m.forecast_cache ?? 0,
    fill: barColor(m.forecast_cache ?? 0),
  }));

  const insights = members.length > 0 ? [
    `The highest forecast in your family is ${members.sort((a, b) => (b.forecast_cache ?? 0) - (a.forecast_cache ?? 0))[0].name} at ${Math.max(...members.map(m => m.forecast_cache ?? 0))} years`,
    `The average forecast in your family is ${avgForecast} years`,
    members.length > 1
      ? `Your family spans ${Math.round(Math.max(...members.map(m => m.forecast_cache ?? 0)) - Math.min(...members.map(m => m.forecast_cache ?? 0)) * 10) / 10} years between the highest and lowest forecasts`
      : null,
  ].filter(Boolean) as string[] : [];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Family Longevity Dashboard | BornClock Premium" description="Compare longevity forecasts for your family." noindex={true} />
        <div className="container mx-auto px-4 py-8">
          <header className="flex justify-between items-center mb-8">
            <Navigation />
            <AuthNav />
          </header>
          <div className="max-w-md mx-auto text-center py-20">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-3">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">Please sign in to access the Family Longevity Dashboard.</p>
            <Button asChild><Link to="/auth">Sign In</Link></Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isPremium && !isInTrial) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <SEO title="Family Longevity Dashboard | BornClock Premium" description="Compare longevity forecasts for your family." noindex={true} />
        <div className="max-w-md text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="text-4xl mb-4">👨‍👩‍👧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Family Dashboard</h1>
          <p className="text-gray-500 mb-6">Track longevity forecasts for up to 10 family members. Compare results side by side. Start important conversations about health.</p>
          <Link to="/upgrade" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            Unlock Family Dashboard →
          </Link>
          <p className="text-xs text-gray-400 mt-3">Included in all premium plans from ₹299/month</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Family Longevity Dashboard | BornClock Premium"
        description="Compare longevity forecasts for your entire family. Add family members and see who is on the healthiest path."
        noindex={true}
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" />
              Your Family's Longevity Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Baseline forecasts based on age, country, and gender. Encourage family members to take the full quiz.
            </p>
          </div>
          <Button
            onClick={() => setShowAdd(true)}
            disabled={members.length >= MAX_MEMBERS}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {members.length >= MAX_MEMBERS ? 'Maximum reached (10)' : 'Add Family Member'}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading…</div>
        ) : members.length === 0 ? (
          <Card className="glass-card text-center py-16">
            <CardContent>
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No family members yet</h2>
              <p className="text-muted-foreground mb-4">
                Add your first family member to start comparing longevity forecasts.
              </p>
              <Button onClick={() => setShowAdd(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Add First Member
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Member cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {members.map(m => {
                const age = calcAge(m.date_of_birth);
                const fc = m.forecast_cache ?? 0;
                const remaining = Math.max(0, Math.round((fc - age) * 10) / 10);
                return (
                  <Card key={m.id} className="glass-card relative">
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="absolute top-3 right-3 text-muted-foreground hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <CardContent className="p-5">
                      <div className="text-lg font-bold text-foreground mb-1">{m.name}</div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Age {age} · {m.gender || 'Not specified'} · {m.country || 'Unknown'}
                      </div>
                      <div className={`text-4xl font-black mb-1 ${forecastColor(fc)}`}>
                        {fc}
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        years forecast · {remaining} years remaining
                      </div>
                      <Link
                        to="/life-expectancy"
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        Full quiz for personalized forecast <ArrowRight className="w-3 h-3" />
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Comparison chart */}
            <Card className="glass-card mb-8">
              <CardHeader>
                <CardTitle>Family Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} width={32} />
                    <Tooltip
                      formatter={(v: number) => [`${v} yrs`, 'Forecast']}
                      contentStyle={{ fontSize: 12 }}
                    />
                    <ReferenceLine y={75} stroke="#94a3b8" strokeDasharray="4 2" label={{ value: 'Global avg', position: 'right', fontSize: 10 }} />
                    <Bar dataKey="forecast" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <rect key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Insights */}
            {insights.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Family Health Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">•</span>
                      <span className="text-foreground">{insight}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Add member modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Family Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Mom"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={form.date_of_birth}
                onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Gender</Label>
              <Select
                value={form.gender}
                onValueChange={v => setForm(f => ({ ...f, gender: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Country</Label>
              <Select
                value={form.country}
                onValueChange={v => setForm(f => ({ ...f, country: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select country…" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {QUIZ_COUNTRIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleAdd} disabled={!form.name || !form.date_of_birth} className="flex-1">
                Add Member
              </Button>
              <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

export default function FamilyDashboard() {
  return (
    <FamilyErrorBoundary>
      <FamilyDashboardInner />
    </FamilyErrorBoundary>
  );
}

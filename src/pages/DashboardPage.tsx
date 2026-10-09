import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { UtilityLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, CalendarHeart, Activity, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationOptIn } from '@/components/NotificationOptIn';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { fetchKundali, type KundaliData } from '@/services/kundaliService';
import { computeRashifal } from '@/lib/vedic/rashifal';

// Biorhythm (same engine as the fitness widgets / weekly digest) — a reflection cue,
// explicitly NOT a plan or a performance/medical claim.
function biorhythm(dob: Date, today: Date) {
  const days = Math.floor((today.getTime() - dob.getTime()) / 86400000);
  const pct = (period: number) => Math.round(Math.sin((2 * Math.PI * days) / period) * 100);
  return { physical: pct(23), emotional: pct(28), intellectual: pct(33) };
}

function daysUntilBirthday(dob: Date, today: Date): number {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const next = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  if (next < t) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next.getTime() - t.getTime()) / 86400000);
}

const gradeTone: Record<string, string> = { strong: 'bg-accent/15 text-accent', moderate: 'bg-primary/10 text-primary', mild: 'bg-muted text-muted-foreground' };

export default function DashboardPage() {
  const { user, profile: account } = useAuth();
  const { profile, loaded, isFull } = useSavedProfile();
  const [kundali, setKundali] = useState<KundaliData | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'ready'>('idle');

  useEffect(() => {
    if (!loaded) return;
    if (!isFull || !profile?.city || !profile.time) { setStatus('idle'); return; }
    let cancelled = false;
    setStatus('loading');
    fetchKundali(profile.dob, profile.time, { lat: profile.city.lat, lon: profile.city.lon, tz: profile.city.tz })
      .then((k) => { if (!cancelled) { setKundali(k); setStatus('ready'); } })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [loaded, isFull, profile]);

  const moonIndex = useMemo(() => {
    const moon = kundali?.planets?.find((p) => p.name === 'Moon');
    // /api/kundali returns planet signIndex 1-based (Mesha=1 … Meena=12); computeRashifal
    // and /api/subscribe expect 0-based (Mesha=0 … Meena=11). Convert + clamp.
    if (typeof moon?.signIndex !== 'number') return null;
    const idx = moon.signIndex - 1;
    return idx >= 0 && idx <= 11 ? idx : null;
  }, [kundali]);

  const today = new Date();
  const dob = profile?.dob ? new Date(profile.dob + 'T12:00:00') : null;
  const rashifal = useMemo(() => (moonIndex !== null ? computeRashifal(moonIndex, 'today', new Date()) : null), [moonIndex]);
  const bio = dob ? biorhythm(dob, today) : null;
  const dtb = dob ? daysUntilBirthday(dob, today) : null;

  const name = (account?.first_name || profile?.name || user?.email?.split('@')[0] || '').toString();
  const dateLabel = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <UtilityLayout
      theme="vedic"
      testId="dashboard-page"
      breadcrumb={{ current: 'Your day' }}
      eyebrow="Personal"
      h1={name ? `Your day, ${name}` : 'Your day'}
      lead={dateLabel}
    >
      <SEO title="Your day — BornClock" description="Your personal day: today's reading for your Moon sign, your rhythm, and your birthday countdown." noindex />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {status === 'idle' && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" /> Set up your day</CardTitle>
              <CardDescription>
                Your personal day is built from your own birth chart. Create your free Kundli (date, time and place) and we'll show today's reading for your Moon sign here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/kundli"><Button className="gap-2">Create your Kundli <ArrowRight className="h-4 w-4" /></Button></Link>
            </CardContent>
          </Card>
        )}

        {status === 'loading' && (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        )}

        {status === 'error' && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>We couldn't load your reading just now</CardTitle>
              <CardDescription>The chart service didn't respond. Please try again in a moment — your saved details are safe.</CardDescription>
            </CardHeader>
            <CardContent><Button variant="outline" onClick={() => window.location.reload()}>Retry</Button></CardContent>
          </Card>
        )}

        {status === 'ready' && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Today's reading */}
            {rashifal && (
              <Card className="border-primary/20 md:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" /> Today for {rashifal.rashi.sanskrit} <span className="text-muted-foreground font-normal">({rashifal.rashi.english})</span></CardTitle>
                    <Badge className={gradeTone[rashifal.overallGrade] || ''}>{rashifal.overallGrade} · {rashifal.overallTone}</Badge>
                  </div>
                  <CardDescription>Vedic astrology reads your day from where the planets sit relative to your Moon sign.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {rashifal.sections.slice(0, 3).map((s) => (
                    <div key={s.key}>
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">{s.title}
                        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{s.grade}</span>
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                  <Link to={`/rashifal/${rashifal.rashi.slug}/today`} className="text-sm font-semibold text-primary inline-flex items-center gap-1">
                    Full daily, weekly &amp; monthly reading <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Rhythm */}
            {bio && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-accent" /> Your rhythm today</CardTitle>
                  <CardDescription>A gentle check-in from your biorhythm cycles — a reflection tool, not a plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {([['Physical', bio.physical], ['Emotional', bio.emotional], ['Intellectual', bio.intellectual]] as const).map(([label, v]) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">{label}</span><span className="font-medium">{v > 0 ? '+' : ''}{v}</span></div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full ${v >= 0 ? 'bg-accent' : 'bg-primary/50'}`} style={{ width: `${Math.abs(v)}%` }} /></div>
                    </div>
                  ))}
                  <Link to="/biorhythm" className="text-sm font-semibold text-primary inline-flex items-center gap-1">See your full rhythm chart <ArrowRight className="h-4 w-4" /></Link>
                </CardContent>
              </Card>
            )}

            {/* Birthday + quick links */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarHeart className="h-5 w-5 text-accent" /> Your birthday</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {dtb === 0 ? "It's your birthday today! 🎉" : `${dtb} day${dtb === 1 ? '' : 's'} until your next birthday.`}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link to="/kundli"><Button variant="outline" size="sm">Your Kundli</Button></Link>
                  <Link to="/whats-ahead"><Button variant="outline" size="sm">What's Ahead</Button></Link>
                  <Link to="/family"><Button variant="outline" size="sm" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Family</Button></Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-6">
          <NotificationOptIn defaultEmail={user?.email || ''} rashiIndex={moonIndex} />
        </div>
      </div>
    </UtilityLayout>
  );
}

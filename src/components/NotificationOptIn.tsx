import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Bell, Loader2, Check, MessageCircle } from 'lucide-react';

/**
 * Opt-in email notifications (P3). Honest, explicit consent only: nothing is enabled
 * by default and the user must tick what they want. Posts to /api/subscribe, which
 * stores the preferences (no email is sent from here). `rashiIndex` (the user's Moon
 * sign 0..11) is passed through so the daily job can render a real reading; when it's
 * unknown the daily-horoscope/transit channels are disabled with an honest note.
 *
 * WhatsApp is shown but disabled — it stays off until the person opens a WhatsApp
 * Business account (Rule 11: no WhatsApp messaging without a Business account + consent).
 */
export function NotificationOptIn({ defaultEmail = '', rashiIndex = null }: { defaultEmail?: string; rashiIndex?: number | null }) {
  const [email, setEmail] = useState(defaultEmail);
  const [daily, setDaily] = useState(false);
  const [transit, setTransit] = useState(false);
  const [weekly, setWeekly] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSign = typeof rashiIndex === 'number' && rashiIndex >= 0 && rashiIndex <= 11;

  const save = async () => {
    setError(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setError('Please enter a valid email address.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          consent: true,
          source: 'dashboard-notifications',
          weeklyDigest: weekly,
          dailyHoroscope: hasSign && daily,
          transitAlerts: hasSign && transit,
          ...(hasSign ? { rashiIndex } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.ok) { setDone(true); }
      else setError('We couldn\'t save that just now — please try again shortly.');
    } catch {
      setError('Network error — please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-accent" /> Notifications</CardTitle>
        <CardDescription>Choose what you'd like by email. Nothing is on until you pick it, and every email has a one-click unsubscribe.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="notify-email">Email</Label>
          <Input id="notify-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={done} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 pr-4">
            <Label>Daily horoscope</Label>
            <p className="text-xs text-muted-foreground">
              {hasSign ? 'A short graded reading for your Moon sign each morning.' : 'Create your Kundli first so we know your Moon sign.'}
            </p>
          </div>
          <Switch checked={daily} onCheckedChange={setDaily} disabled={!hasSign || done} aria-label="Daily horoscope" />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 pr-4">
            <Label>Transit alerts</Label>
            <p className="text-xs text-muted-foreground">
              {hasSign ? 'Only when a slow planet (Saturn, Jupiter, Rahu, Ketu) actually changes sign — no noise.' : 'Needs your Moon sign from a saved Kundli.'}
            </p>
          </div>
          <Switch checked={transit} onCheckedChange={setTransit} disabled={!hasSign || done} aria-label="Transit alerts" />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 pr-4">
            <Label>Weekly reading</Label>
            <p className="text-xs text-muted-foreground">Your birthday countdown, 7-day rhythm and who shares your birthday that week.</p>
          </div>
          <Switch checked={weekly} onCheckedChange={setWeekly} disabled={done} aria-label="Weekly reading" />
        </div>

        {/* WhatsApp — prepared, OFF until a WhatsApp Business account exists (Rule 11).
            No opacity dimming (it drops text below the AA contrast ratio); the disabled
            switch + "Coming soon" badge convey the unavailable state accessibly. */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 pr-4">
            <Label className="flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" /> WhatsApp reminders
              <span className="text-[10px] font-semibold uppercase tracking-wide text-accent bg-accent/10 rounded px-1.5 py-0.5">Soon</span>
            </Label>
            <p className="text-xs text-muted-foreground">We'll add this once WhatsApp messaging is set up.</p>
          </div>
          <Switch checked={false} disabled aria-label="WhatsApp reminders (coming soon)" />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {done ? (
          <p className="text-sm text-green-600 flex items-center gap-2"><Check className="h-4 w-4" /> Saved. You can change these anytime.</p>
        ) : (
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />} Save preferences
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

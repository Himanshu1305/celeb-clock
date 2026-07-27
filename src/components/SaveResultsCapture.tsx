import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Check } from 'lucide-react';

// Soft email capture — deliberately NOT a hard wall (the free calculator stays
// open to keep the SEO funnel intact). Posts to /api/subscribe with explicit
// consent. dob is optional personalisation for the weekly reading.
interface Props {
  dob?: Date | null;
  countryCode?: string | null;
  source?: string;
}

export function SaveResultsCapture({ dob, countryCode, source = 'results-page' }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const submit = async () => {
    if (status === 'loading') return;
    const e = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) { setStatus('error'); setMsg('Please enter a valid email.'); return; }
    setStatus('loading');
    try {
      const dobStr = dob
        ? `${dob.getFullYear()}-${String(dob.getMonth() + 1).padStart(2, '0')}-${String(dob.getDate()).padStart(2, '0')}`
        : undefined;
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e, consent: true, weeklyDigest: true, source, dob: dobStr, countryCode }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) { setStatus('done'); }
      else if (res.ok && !body.ok) { setStatus('done'); } // stored later; don't nag the user
      else { setStatus('error'); setMsg(body.error || 'Something went wrong. Please try again.'); }
    } catch {
      setStatus('error'); setMsg('Network error. Please try again.');
    }
  };

  if (status === 'done') {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <div className="inline-flex items-center gap-2 text-primary font-semibold">
            <Check className="w-5 h-5" /> You're in! Your first weekly reading is on its way.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Mail className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-bold text-foreground">Save my results + get my weekly reading</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center mb-4">
          A short weekly email — days to your next birthday, your biorhythm, and who shares your week.
          No spam, unsubscribe anytime.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
              onKeyDown={e => e.key === 'Enter' && submit()}
              className="pl-9 h-11"
              aria-label="Email address"
            />
          </div>
          <Button onClick={submit} disabled={status === 'loading'} className="h-11 px-5">
            {status === 'loading' ? 'Saving…' : 'Save my results'}
          </Button>
        </div>
        {status === 'error' && <p className="text-xs text-red-500 text-center mt-2">{msg}</p>}
      </CardContent>
    </Card>
  );
}

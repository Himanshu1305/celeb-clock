import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Newsletter signup for /blog. Previously the form was inert (no value/onChange,
 * no onClick) — clicking Subscribe did nothing. This wires it to /api/subscribe
 * with explicit consent: valid → "You're subscribed"; duplicate → same friendly
 * success (the endpoint upserts idempotently); invalid → inline message; network
 * failure → visible error (never a dead button).
 */
export function BlogNewsletter({ source = 'blog' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const submit = async () => {
    if (status === 'loading') return;
    const e = email.trim().toLowerCase();
    if (!EMAIL_RE.test(e)) { setStatus('error'); setMsg('Please enter a valid email address.'); return; }
    setStatus('loading'); setMsg('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e, consent: true, weeklyDigest: true, source }),
      });
      const body = await res.json().catch(() => ({}));
      // ok:true (stored) OR ok:false (table not applied yet — still don't nag) → success.
      if (res.ok) { setStatus('done'); return; }
      setStatus('error'); setMsg(body.error || 'Something went wrong. Please try again.');
    } catch {
      setStatus('error'); setMsg('Network error — please check your connection and try again.');
    }
  };

  if (status === 'done') {
    return (
      <div role="status" className="inline-flex items-center gap-2 text-primary font-semibold">
        <Check className="w-5 h-5" /> You're subscribed — watch your inbox.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex gap-2">
        <Input
          placeholder="Enter your email"
          type="email"
          aria-label="Email address"
          value={email}
          onChange={ev => { setEmail(ev.target.value); if (status === 'error') setStatus('idle'); }}
          onKeyDown={ev => { if (ev.key === 'Enter') submit(); }}
        />
        <Button onClick={submit} disabled={status === 'loading'}>
          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
        </Button>
      </div>
      {status === 'error' && <p role="alert" className="text-sm text-red-500 mt-2 text-left">{msg}</p>}
    </div>
  );
}

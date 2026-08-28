import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { INDIA_STATES, isValidIndiaStateCode } from '@/data/indiaStates';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { shouldShowMissingStateModal } from '@/components/missingStateGate';

export { shouldShowMissingStateModal };

// Non-dismissible, one-time capture of the Indian state (GST place-of-supply) for
// a premium user whose subscription renewals would otherwise be un-invoiceable
// (see api/invoice-sweep.ts, which skips renewals with no persisted region).
export function MissingStateModal() {
  const { profile, session, isPremium } = useAuth();
  const { toast } = useToast();
  const [stateCode, setStateCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const show = !done && shouldShowMissingStateModal({
    isPremium,
    buyerStateCode: profile?.buyer_state_code,
  });
  if (!show) return null;

  const canSave = isValidIndiaStateCode(stateCode) && !saving;

  const save = async () => {
    if (!isValidIndiaStateCode(stateCode)) return;
    const token = session?.access_token;
    if (!token) {
      toast({ title: 'Please sign in again', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/update-buyer-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ state_code: stateCode }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast({ title: 'Could not save', description: err.error || 'Please try again.', variant: 'destructive' });
        return;
      }
      // Persisted server-side → never show again (this session via `done`, future
      // sessions because profiles.buyer_state_code is now set).
      setDone(true);
      toast({ title: 'Thank you', description: 'Your state has been saved for GST invoicing.' });
    } catch {
      toast({ title: 'Network error', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => { /* non-dismissible — user must complete it */ }}>
      <DialogContent
        // Block every close affordance: no X (hide the built-in close button),
        // no Esc, no outside click.
        className="sm:max-w-md [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>One quick thing before you continue</DialogTitle>
          <DialogDescription>
            We need your state to issue your GST invoice. This takes 10 seconds.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="missing-state">Your state / UT</Label>
          <Select value={stateCode} onValueChange={setStateCode}>
            <SelectTrigger id="missing-state"><SelectValue placeholder="Select your state" /></SelectTrigger>
            <SelectContent className="max-h-64">
              {INDIA_STATES.map((s) => (
                <SelectItem key={s.code} value={s.code}>{s.name} ({s.code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={save} disabled={!canSave} className="w-full">
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

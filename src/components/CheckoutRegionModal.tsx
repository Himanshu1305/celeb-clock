import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { INDIA_STATES, taxModeFor } from '@/data/indiaStates';
import { countries } from '@/data/countries';
import { detectCountry } from '@/services/CountryDetectionService';

export interface RegionSelection {
  buyerCountry: string;      // 'India' or a country name
  buyerState: string | null;
  buyerStateCode: string | null;
  taxMode: 'CGST_SGST' | 'IGST' | 'EXPORT';
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (sel: RegionSelection) => void;
  priceLabel?: string;       // e.g. "₹199"
}

// Pre-checkout region + state capture. The selection is a LEGAL declaration used
// to determine the GST place-of-supply, so nothing is silently inferred — the
// user must actively confirm/change even when we pre-fill from IP geolocation.
export function CheckoutRegionModal({ open, onOpenChange, onConfirm, priceLabel }: Props) {
  const [base, setBase] = useState<'' | 'India' | 'Outside'>('');
  const [stateCode, setStateCode] = useState<string>('');
  const [country, setCountry] = useState<string>('');

  // Pre-fill (not auto-confirm) from IP: India → suggest India; else → Outside.
  useEffect(() => {
    if (!open) return;
    detectCountry().then(info => {
      setBase(prev => prev || (info.isIndia ? 'India' : 'Outside'));
      if (!info.isIndia && info.countryName && countries.includes(info.countryName)) {
        setCountry(prev => prev || info.countryName);
      }
    }).catch(() => {});
  }, [open]);

  const canConfirm = base === 'India' ? !!stateCode : base === 'Outside' ? !!country : false;

  const confirm = () => {
    if (base === 'India') {
      const st = INDIA_STATES.find(s => s.code === stateCode);
      if (!st) return;
      onConfirm({
        buyerCountry: 'India',
        buyerState: st.name,
        buyerStateCode: st.code,
        taxMode: taxModeFor('India', st.code),
      });
    } else if (base === 'Outside') {
      if (!country) return;
      onConfirm({
        buyerCountry: country,
        buyerState: null,
        buyerStateCode: null,
        taxMode: 'EXPORT',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Where are you based?</DialogTitle>
          <DialogDescription>
            We need this for your GST tax invoice. Please confirm — it's a legal declaration of your
            place of supply.
          </DialogDescription>
        </DialogHeader>

        {/* Step 1 — region */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setBase('India')}
            className={`rounded-xl border-2 p-4 text-sm font-semibold transition-colors ${base === 'India' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40'}`}
          >
            🇮🇳 India
          </button>
          <button
            type="button"
            onClick={() => setBase('Outside')}
            className={`rounded-xl border-2 p-4 text-sm font-semibold transition-colors ${base === 'Outside' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40'}`}
          >
            🌍 Outside India
          </button>
        </div>

        {/* Step 2 — detail */}
        {base === 'India' && (
          <div className="space-y-2">
            <Label htmlFor="gst-state">Your state / UT</Label>
            <Select value={stateCode} onValueChange={setStateCode}>
              <SelectTrigger id="gst-state"><SelectValue placeholder="Select your state" /></SelectTrigger>
              <SelectContent className="max-h-64">
                {INDIA_STATES.map(s => (
                  <SelectItem key={s.code} value={s.code}>{s.name} ({s.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {base === 'Outside' && (
          <div className="space-y-2">
            <Label htmlFor="gst-country">Your country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="gst-country"><SelectValue placeholder="Select your country" /></SelectTrigger>
              <SelectContent className="max-h-64">
                {countries.filter(c => c !== 'India').map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Export supply — zero-rated under LUT, no GST charged.</p>
          </div>
        )}

        <Button onClick={confirm} disabled={!canConfirm} className="w-full">
          Continue to payment{priceLabel ? ` · ${priceLabel}` : ''}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

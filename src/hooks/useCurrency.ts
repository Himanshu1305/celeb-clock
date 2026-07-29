import { useState, useEffect } from 'react';
import { detectCountry } from '@/services/CountryDetectionService';
import { resolveCurrency, reportPrice, type Currency } from '@/lib/pricing';

// Region-aware currency for display. IP detection, overridable via ?currency=
// (see src/lib/pricing.ts). Starts at INR and updates after detection resolves —
// a US visitor sees the USD price once detection completes, so no one is shown
// ₹199 on a CTA and then charged $6.99. Checkout currency is still fixed by the
// confirmed region in CheckoutRegionModal.
export function useResolvedCurrency(): Currency {
  const [currency, setCurrency] = useState<Currency>('INR');
  useEffect(() => {
    detectCountry().then(info => setCurrency(resolveCurrency(info.currency))).catch(() => {});
  }, []);
  return currency;
}

// Convenience: the one-time report price string in the resolved currency.
export function useReportPrice(): string {
  return reportPrice(useResolvedCurrency());
}

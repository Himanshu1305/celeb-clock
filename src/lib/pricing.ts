// SINGLE SOURCE OF TRUTH for every price, plan, and credit mechanic surfaced to
// users. No priced surface may hard-code a number — import from here.
//
// Server note: api/create-order.ts holds the *authoritative* charge amounts
// (paise/cents, never trusted from the client) and MUST agree with REPORT_PRICE
// below. This module is the client-display source; the two are kept in sync by
// hand (report: INR 199 / USD 6.99 == create-order 19900 / 699).

export type Currency = 'INR' | 'USD';
export type BillingPeriod = 'monthly' | 'annual';

// ── Amounts (major units) ────────────────────────────────────────────────────
export const SUBSCRIPTION: Record<BillingPeriod, Record<Currency, number>> = {
  monthly: { INR: 299, USD: 4.99 },
  annual:  { INR: 2499, USD: 39.99 },
};

export const REPORT_PRICE: Record<Currency, number> = { INR: 199, USD: 6.99 };

// Report credits included with an active subscription.
export const CREDITS = { perMonth: 3, cap: 9, carryForward: true } as const;

// ── Razorpay plan IDs — prefer env (VITE_RAZORPAY_PLAN_*), fall back to the live
// dashboard IDs so checkout still works if env is unset. ─────────────────────
export const RAZORPAY_PLANS: Record<BillingPeriod, Record<Currency, string>> = {
  monthly: {
    INR: import.meta.env.VITE_RAZORPAY_PLAN_INDIA_MONTHLY || 'plan_T7ppISx7AUnHVE',
    USD: import.meta.env.VITE_RAZORPAY_PLAN_GLOBAL_MONTHLY || 'plan_T9K6U90fwpqrIg',
  },
  annual: {
    INR: import.meta.env.VITE_RAZORPAY_PLAN_INDIA_ANNUAL || 'plan_T7pqpODIo107Bp',
    USD: import.meta.env.VITE_RAZORPAY_PLAN_GLOBAL_ANNUAL || 'plan_T9K7XDk2tx8Q0h',
  },
};

// ── Formatting ───────────────────────────────────────────────────────────────
export function formatMoney(amount: number, currency: Currency): string {
  if (currency === 'INR') {
    // INR shown with thousands separators, no decimals for whole rupees.
    return '₹' + (Number.isInteger(amount) ? amount.toLocaleString('en-IN') : amount.toFixed(2));
  }
  return '$' + amount.toFixed(2);
}

export function reportPrice(currency: Currency): string {
  return formatMoney(REPORT_PRICE[currency], currency);
}

export function subscriptionPrice(period: BillingPeriod, currency: Currency): string {
  return formatMoney(SUBSCRIPTION[period][currency], currency);
}

// Total saved by paying annually instead of 12× monthly.
export function annualSaving(currency: Currency): number {
  return SUBSCRIPTION.monthly[currency] * 12 - SUBSCRIPTION.annual[currency];
}

export function annualSavingLabel(currency: Currency): string {
  return `Save ${formatMoney(annualSaving(currency), currency)} vs monthly`;
}

// Per-month equivalent of the annual plan (rounded).
export function annualPerMonth(currency: Currency): string {
  const raw = SUBSCRIPTION.annual[currency] / 12;
  return formatMoney(currency === 'INR' ? Math.round(raw) : Math.round(raw * 100) / 100, currency);
}

// ── Currency override (C2c) ──────────────────────────────────────────────────
// A ?currency=USD|INR query param forces BOTH display and checkout currency for
// the session (persisted in sessionStorage). Admins also get a manual toggle.
const OVERRIDE_KEY = 'bc_currency_override';

export function getCurrencyOverride(): Currency | null {
  try {
    const v = sessionStorage.getItem(OVERRIDE_KEY);
    return v === 'INR' || v === 'USD' ? v : null;
  } catch { return null; }
}

export function setCurrencyOverride(currency: Currency | null): void {
  try {
    if (currency) sessionStorage.setItem(OVERRIDE_KEY, currency);
    else sessionStorage.removeItem(OVERRIDE_KEY);
  } catch { /* sessionStorage unavailable */ }
}

// Reads ?currency= from the current URL and persists it. Call once on app load.
export function applyCurrencyOverrideFromUrl(): void {
  try {
    const p = new URLSearchParams(window.location.search).get('currency');
    if (p) {
      const up = p.toUpperCase();
      if (up === 'INR' || up === 'USD') setCurrencyOverride(up);
    }
  } catch { /* no window */ }
}

// The resolved currency for the session: override wins, else detected.
export function resolveCurrency(detected: Currency | undefined): Currency {
  return getCurrencyOverride() ?? detected ?? 'INR';
}

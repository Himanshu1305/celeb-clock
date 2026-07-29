import { subscriptionPrice, annualSavingLabel, resolveCurrency } from '@/lib/pricing';

export interface CountryInfo {
  countryCode: string;
  countryName: string;
  isIndia: boolean;
  currency: 'INR' | 'USD';
}

let cachedCountry: CountryInfo | null = null;

export async function detectCountry(): Promise<CountryInfo> {
  if (cachedCountry) return cachedCountry;

  const cached = localStorage.getItem('bornclock_country');
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        cachedCountry = data;
        return data;
      }
    } catch {}
  }

  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) throw new Error('Failed');
    const data = await response.json();
    const countryCode = data.country_code || 'US';

    const result: CountryInfo = {
      countryCode,
      countryName: data.country_name || 'Unknown',
      isIndia: countryCode === 'IN',
      currency: countryCode === 'IN' ? 'INR' : 'USD',
    };

    localStorage.setItem(
      'bornclock_country',
      JSON.stringify({ country: countryCode, data: result, timestamp: Date.now(), detectedAt: Date.now() }),
    );
    cachedCountry = result;
    return result;
  } catch {
    const fallback: CountryInfo = {
      countryCode: 'IN',
      countryName: 'India',
      isIndia: true,
      currency: 'INR',
    };
    cachedCountry = fallback;
    return fallback;
  }
}

export function getPlanId(
  countryInfo: CountryInfo,
  billing: 'monthly' | 'annual',
): string {
  if (countryInfo.isIndia) {
    return billing === 'monthly'
      ? import.meta.env.VITE_RAZORPAY_PLAN_INDIA_MONTHLY || ''
      : import.meta.env.VITE_RAZORPAY_PLAN_INDIA_ANNUAL || '';
  }
  return billing === 'monthly'
    ? import.meta.env.VITE_RAZORPAY_PLAN_GLOBAL_MONTHLY || ''
    : import.meta.env.VITE_RAZORPAY_PLAN_GLOBAL_ANNUAL || '';
}

export function formatPrice(
  countryInfo: CountryInfo,
  billing: 'monthly' | 'annual',
): { amount: string; period: string; saving?: string } {
  // Delegates to the single source (src/lib/pricing.ts). Respects a ?currency
  // override so admins/testers can review both currencies without a VPN.
  const currency = resolveCurrency(countryInfo.currency);
  return {
    amount: subscriptionPrice(billing, currency),
    period: billing === 'monthly' ? '/month' : '/year',
    saving: billing === 'annual' ? annualSavingLabel(currency) : undefined,
  };
}

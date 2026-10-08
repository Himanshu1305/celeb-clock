/**
 * New paid-product feature flags — Growth P2 (P2-11, Rule 10).
 *
 * Every NEW paid product built in the Growth programme is gated here and ships
 * switched OFF. While a flag is false the product is DORMANT: its free summary
 * stays visible (the generous-free model), but no paid upsell, checkout, price
 * or entitlement is shown or charged. Enabling any of these — and setting its
 * price — is a business decision for the owner ("Needs the person"). No price
 * is invented here. Existing products, prices, paywall gating and entitlement
 * logic are untouched (Rule 10); this file only governs the new P2 products.
 */

export interface PaidProductFlag {
  /** Whether the paid tier is live. OFF by default (Rule 10). */
  enabled: boolean;
  /** Human label for internal clarity; never a price. */
  label: string;
}

export const PAID_PRODUCTS = {
  yearlyReport: { enabled: false, label: 'Detailed Yearly Report (Varshphal + transits)' },
  childKundliReport: { enabled: false, label: 'Child (Bal) Kundli Report' },
  careerReportPro: { enabled: false, label: 'Detailed Career Report' },
  marriageCompatibilityReport: { enabled: false, label: 'Marriage Compatibility Report' },
  nameCorrectionPro: { enabled: false, label: 'Name Correction (detailed)' },
  premiumAiAstrologer: { enabled: false, label: 'Premium AI Astrologer tier' },
} as const satisfies Record<string, PaidProductFlag>;

export type PaidProductKey = keyof typeof PAID_PRODUCTS;

/** True only when the owner has switched this product ON (never by default). */
export function isPaidProductEnabled(key: PaidProductKey): boolean {
  return PAID_PRODUCTS[key].enabled === true;
}

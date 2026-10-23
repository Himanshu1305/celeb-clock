import { supabase } from '@/integrations/supabase/client';

export interface PromoCodeResult {
  success: boolean;
  message: string;
  isPremium?: boolean;
}

// Promo codes are validated and applied ON THE SERVER (/api/redeem-promo) for
// the signed-in user. The browser no longer reads promo_codes or writes any
// entitlement itself, and only shows "premium" when the server granted it.
export async function redeemPromoCode(code: string, _userId?: string): Promise<PromoCodeResult> {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) {
    return { success: false, message: 'Please enter a promo code.' };
  }

  let token: string | null = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token ?? null;
  } catch { /* server answers 401 */ }

  try {
    const res = await fetch('/api/redeem-promo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ code: normalizedCode }),
    });
    const data = await res.json().catch(() => ({}));
    return {
      success: !!data.success,
      message: typeof data.message === 'string' ? data.message : 'Failed to redeem code. Please try again.',
      isPremium: data.success ? !!data.isPremium : undefined,
    };
  } catch {
    return { success: false, message: 'Could not reach the server. Please try again.' };
  }
}

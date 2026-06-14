import { supabase } from '@/integrations/supabase/client';

export interface PromoCodeResult {
  success: boolean;
  message: string;
  isPremium?: boolean;
}

export async function redeemPromoCode(code: string, userId: string): Promise<PromoCodeResult> {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    return { success: false, message: 'Please enter a promo code.' };
  }

  // Check code exists and is valid
  const { data: promoData, error: promoError } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', normalizedCode)
    .single();

  if (promoError || !promoData) {
    return { success: false, message: 'Invalid promo code. Please check and try again.' };
  }

  if (!promoData.is_active) {
    return { success: false, message: 'This promo code is no longer active.' };
  }

  // Check expiry
  if (promoData.expires_at && new Date(promoData.expires_at) < new Date()) {
    return { success: false, message: 'This promo code has expired.' };
  }

  // Check max uses
  if (promoData.max_uses != null && promoData.current_uses >= promoData.max_uses) {
    return { success: false, message: 'This promo code has reached its usage limit.' };
  }

  // Check if already redeemed
  const { data: existing } = await supabase
    .from('promo_code_redemptions')
    .select('id')
    .eq('code', normalizedCode)
    .eq('user_id', userId)
    .single();

  if (existing) {
    return { success: false, message: 'You have already used this promo code.' };
  }

  // Record redemption
  const { error: redemptionError } = await supabase
    .from('promo_code_redemptions')
    .insert({ code: normalizedCode, user_id: userId });

  if (redemptionError) {
    return { success: false, message: 'Failed to redeem code. Please try again.' };
  }

  // Increment usage count
  await supabase
    .from('promo_codes')
    .update({ current_uses: promoData.current_uses + 1 })
    .eq('code', normalizedCode);

  // Grant premium access
  if (promoData.grants_premium) {
    await supabase
      .from('profiles')
      .update({ premium_status: true })
      .eq('user_id', userId);

    return {
      success: true,
      message: '🎉 Promo code applied! You now have premium access.',
      isPremium: true,
    };
  }

  return { success: true, message: 'Promo code applied successfully!' };
}

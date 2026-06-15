import { CountryInfo, getPlanId } from './CountryDetectionService';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface SubscriptionOptions {
  billing: 'monthly' | 'annual';
  countryInfo: CountryInfo;
  userEmail: string;
  userName?: string;
  userId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  onDismiss: () => void;
}

export async function initiateSubscription(options: SubscriptionOptions): Promise<void> {
  const {
    billing,
    countryInfo,
    userEmail,
    userName,
    userId,
    onSuccess,
    onError,
    onDismiss,
  } = options;

  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onError('Failed to load payment gateway. Please refresh and try again.');
    return;
  }

  const planId = getPlanId(countryInfo, billing);
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!planId || !keyId) {
    onError('Payment configuration error. Please contact hello@bornclock.com');
    return;
  }

  const rzpOptions = {
    key: keyId,
    plan_id: planId,
    quantity: 1,
    name: 'BornClock',
    description: `BornClock Premium — ${billing === 'monthly' ? 'Monthly' : 'Annual'} Plan`,
    image: 'https://bornclock.com/favicon.svg',
    prefill: {
      email: userEmail,
      name: userName || '',
    },
    notes: {
      email: userEmail,
      userId: userId,
      billing: billing,
    },
    theme: { color: '#4F46E5' },
    modal: {
      ondismiss: onDismiss,
      confirm_close: true,
      escape: false,
    },
    handler: async (response: any) => {
      try {
        await supabase
          .from('profiles')
          .update({
            premium_status: true,
            subscription_id: response.razorpay_subscription_id,
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      } catch {}
      onSuccess();
    },
    subscription_card_change: true,
  };

  const rzp = new window.Razorpay(rzpOptions);

  rzp.on('payment.failed', (response: any) => {
    const errorDesc =
      response.error?.description || 'Payment failed. Please try again.';
    onError(errorDesc);
  });

  rzp.open();
}

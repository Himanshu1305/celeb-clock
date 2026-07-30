import { CountryInfo } from './CountryDetectionService';
import { RAZORPAY_PLANS } from '@/lib/pricing';

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
  // GST place-of-supply declaration captured by CheckoutRegionModal BEFORE
  // checkout opens. Forwarded to the subscription notes AND to verify-payment's
  // request body (subscription checkout does not reliably forward notes onto the
  // payment, so the body is the reliable channel). `currency` is the confirmed
  // region's currency, not IP geo.
  currency?: 'INR' | 'USD';
  buyerCountry?: string;
  buyerState?: string | null;
  buyerStateCode?: string | null;
  taxMode?: 'CGST_SGST' | 'IGST' | 'EXPORT';
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
    currency,
    buyerCountry,
    buyerState,
    buyerStateCode,
    taxMode,
    onSuccess,
    onError,
    onDismiss,
  } = options;

  // Confirmed region currency wins over IP geo (a USD-detected user who declares
  // India is charged INR with a matching CGST/SGST invoice).
  const checkoutCurrency = currency ?? countryInfo.currency;

  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onError('Failed to load payment gateway. Please refresh and try again.');
    return;
  }

  // Plan follows the CONFIRMED region's currency (single source: pricing.ts), so
  // a USD-detected user who declares India gets the INR plan and CGST/SGST invoice.
  const planId = RAZORPAY_PLANS[billing][checkoutCurrency];
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!planId || !keyId) {
    onError('Payment configuration error. Please contact hello@bornclock.com');
    return;
  }

  // Create the subscription server-side; checkout SDK receives subscription_id, not plan_id.
  let subscriptionId: string;
  try {
    const subRes = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId, userId, billing,
        buyer_country: buyerCountry, buyer_state: buyerState,
        buyer_state_code: buyerStateCode, tax_mode: taxMode,
      }),
    });
    if (!subRes.ok) {
      const err = await subRes.json().catch(() => ({}));
      onError(err.error || 'Could not initialise checkout. Please try again.');
      return;
    }
    const subData = await subRes.json();
    subscriptionId = subData.subscription_id;
  } catch {
    onError('Could not reach payment server. Please check your connection and try again.');
    return;
  }

  const rzpOptions = {
    key: keyId,
    subscription_id: subscriptionId,
    name: 'BornClock',
    description: `BornClock Premium — ${billing === 'monthly' ? 'Monthly' : 'Annual'} Plan`,
    image: 'https://bornclock.com/favicon.png',
    prefill: {
      email: userEmail,
      name: userName || '',
    },
    notes: {
      email: userEmail,
      userId: userId,
      billing: billing,
      // Best-effort: also stamp the region on the checkout notes. verify-payment
      // reads the request body as the authoritative source for subscriptions.
      buyer_country: buyerCountry ?? '',
      buyer_state: buyerState ?? '',
      buyer_state_code: buyerStateCode ?? '',
      tax_mode: taxMode ?? '',
    },
    theme: { color: '#4F46E5' },
    modal: {
      ondismiss: onDismiss,
      confirm_close: true,
      escape: false,
    },
    handler: async (response: any) => {
      try {
        const res = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
            user_id: userId,
            product: 'subscription',
            amount: 0,
            currency: checkoutCurrency,
            // Confirmed region → verify-payment's non-fatal invoice block reads
            // these from the body (subscription notes are not reliably forwarded).
            billing,
            buyer_country: buyerCountry,
            buyer_state: buyerState,
            buyer_state_code: buyerStateCode,
            tax_mode: taxMode,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          onError(err.error || 'Payment verification failed. Please contact support.');
          return;
        }
      } catch {
        onError('Payment verification failed. Please try again or contact support.');
        return;
      }
      onSuccess();
    },
  };

  const rzp = new window.Razorpay(rzpOptions);

  rzp.on('payment.failed', (response: any) => {
    const errorDesc =
      response.error?.description || 'Payment failed. Please try again.';
    onError(errorDesc);
  });

  rzp.open();
}

export interface OrderPaymentOptions {
  product: 'birthday_report';
  reportSlug: string;
  currency: 'INR' | 'USD';
  userId: string;
  userEmail: string;
  userName?: string;
  // GST place-of-supply declaration captured at checkout (forwarded to Razorpay
  // order notes so verify-payment can issue a correct tax invoice).
  buyerCountry?: string;
  buyerState?: string | null;
  buyerStateCode?: string | null;
  taxMode?: 'CGST_SGST' | 'IGST' | 'EXPORT';
  onSuccess: () => void;
  onError: (error: string) => void;
  onDismiss: () => void;
}

export async function initiateOrderPayment(options: OrderPaymentOptions): Promise<void> {
  const { product, reportSlug, currency, userId, userEmail, userName,
          buyerCountry, buyerState, buyerStateCode, taxMode,
          onSuccess, onError, onDismiss } = options;

  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onError('Failed to load payment gateway. Please refresh and try again.');
    return;
  }

  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!keyId) {
    onError('Payment configuration error. Please contact hello@bornclock.com');
    return;
  }

  let orderId: string;
  let orderAmount: number;
  let orderCurrency: string;
  try {
    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product, report_slug: reportSlug, userId, currency,
        buyer_country: buyerCountry, buyer_state: buyerState,
        buyer_state_code: buyerStateCode, tax_mode: taxMode,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 409) {
        onError('This report has already been purchased.');
        return;
      }
      onError(err.error || 'Could not initialise checkout. Please try again.');
      return;
    }
    const data = await res.json();
    orderId = data.order_id;
    orderAmount = data.amount;
    orderCurrency = data.currency;
  } catch {
    onError('Could not reach payment server. Please check your connection and try again.');
    return;
  }

  const rzpOptions = {
    key: keyId,
    order_id: orderId,
    amount: orderAmount,
    currency: orderCurrency,
    name: 'BornClock',
    description: 'Birthday Report',
    image: 'https://bornclock.com/favicon.png',
    prefill: { email: userEmail, name: userName || '' },
    notes: { email: userEmail, userId, product },
    theme: { color: '#4F46E5' },
    modal: { ondismiss: onDismiss, confirm_close: true, escape: false },
    handler: async (response: any) => {
      try {
        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            user_id: userId,
            product,
            report_slug: reportSlug,
            amount: orderAmount,
            currency: orderCurrency,
          }),
        });
        if (!verifyRes.ok) {
          const err = await verifyRes.json().catch(() => ({}));
          onError(err.error || 'Payment verification failed. Please contact support.');
          return;
        }
      } catch {
        onError('Payment verification failed. Please try again or contact support.');
        return;
      }
      onSuccess();
    },
  };

  const rzp = new window.Razorpay(rzpOptions);
  rzp.on('payment.failed', (response: any) => {
    onError(response.error?.description || 'Payment failed. Please try again.');
  });
  rzp.open();
}

// Real-visitor Core Web Vitals (RUM) — Fix 5.
// Reports LCP / CLS / INP to the site's EXISTING Supabase analytics (`analytics_events`,
// the same table useAnalytics writes to) — no new third-party service is added.
//
// Doubly gated, matching the FINAL/RC2 brief:
//   1. Production hostname only (bornclock.com / www.bornclock.com) — never fires on the
//      staging worker, *.workers.dev previews, or localhost.
//   2. Only after the visitor has ACCEPTED ANALYTICS in the cookie banner. If they declined
//      (or haven't chosen yet) nothing is sent — identical consent gate to useAnalytics.
import { onCLS, onINP, onLCP, type Metric } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';
import { hasAnalyticsConsent } from '@/components/CookieConsent';

function isProductionHost(): boolean {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname.toLowerCase();
  return h === 'bornclock.com' || h === 'www.bornclock.com';
}

// Reuse the same anonymous session id the analytics hook uses, so a visitor's vitals
// and events share a session without introducing a second identifier.
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

async function sendVital(metric: Metric): Promise<void> {
  // Re-check both gates at send time (consent can change; a metric can flush late).
  if (!isProductionHost()) return;
  if (!hasAnalyticsConsent()) return;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('analytics_events').insert({
      user_id: user?.id || null,
      session_id: getSessionId(),
      event_type: 'web_vital',
      event_name: metric.name, // 'LCP' | 'CLS' | 'INP'
      metadata: {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
        page: window.location.pathname,
        navigation_type: metric.navigationType,
      },
    });
  } catch (error) {
    // Fire-and-forget: RUM must never break the page.
    console.debug('Web Vitals RUM failed:', error);
  }
}

let started = false;

/** Register the LCP / CLS / INP observers exactly once. Safe to call on every mount. */
export function initWebVitalsRum(): void {
  if (started || typeof window === 'undefined') return;
  // Cheap pre-gate: on any non-production host, never even attach the observers.
  if (!isProductionHost()) return;
  started = true;
  onLCP(sendVital);
  onCLS(sendVital);
  onINP(sendVital);
}

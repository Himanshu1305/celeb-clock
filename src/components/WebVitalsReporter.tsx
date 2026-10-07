import { useEffect } from 'react';
import { initWebVitalsRum } from '@/lib/web-vitals-rum';

// Mount-once initializer for Core Web Vitals RUM (Fix 5). Renders nothing; it only
// registers the web-vitals observers (which self-gate on production host + analytics
// consent). Kept as a component so App.tsx stays declarative and prerender is unaffected
// (the effect never runs during SSR/prerender).
export const WebVitalsReporter = () => {
  useEffect(() => {
    initWebVitalsRum();
  }, []);
  return null;
};

export default WebVitalsReporter;

import { useEffect, useRef } from 'react';

/**
 * AdUnit — a self-contained AdSense slot (Task 17).
 *
 * Inert by default: renders NOTHING unless `VITE_ADSENSE_CLIENT` is configured,
 * so it never injects scripts or hurts Core Web Vitals on the live subscription
 * product. When a publisher id is present it renders a single responsive unit
 * and pushes it to adsbygoogle exactly once.
 *
 * Placement guidance: use below the fold / between content sections only — never
 * above the primary CTA or inside the hero.
 */
export function AdUnit({ slot, className = '' }: { slot: string; className?: string }) {
  const client = (import.meta as any).env?.VITE_ADSENSE_CLIENT as string | undefined;
  const pushed = useRef(false);

  useEffect(() => {
    if (!client || pushed.current) return;
    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* AdSense script not loaded — no-op */
    }
  }, [client]);

  if (!client) return null;

  return (
    <div className={`ad-unit my-6 text-center ${className}`} aria-hidden="true">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

export default AdUnit;

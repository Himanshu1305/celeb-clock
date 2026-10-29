/**
 * Batch 10 — Bhava Chalit, KP and Jaimini sections for /kundali (one lazy chunk).
 * Computed in the browser from the birth instant (UTC, as resolved by the server for this
 * chart — data.birthTimezone.utcISO) and the birthplace coordinates, with the same engine.
 */
import { useMemo } from 'react';
import { computeAdvancedSystems } from '@/lib/vedic/advanced';
import { BhavaChalitSection } from './BhavaChalitSection';
import { KpSection } from './KpSection';
import { JaiminiSection } from './JaiminiSection';

export default function AdvancedSystems({ birthUtcISO, lat, lon, chartStyle, mahadasha }: {
  birthUtcISO: string; lat: number; lon: number; chartStyle: 'north' | 'south'; mahadasha?: string | null;
}) {
  const sys = useMemo(() => {
    const t = new Date(birthUtcISO);
    if (!Number.isFinite(t.getTime()) || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    try { return computeAdvancedSystems(t, lat, lon); } catch { return null; }
  }, [birthUtcISO, lat, lon]);
  if (!sys) return null;
  const lagnaSign = sys.chalit?.lagnaSignIndex;
  return (
    <div data-testid="kundali-advanced-systems" style={{ marginTop: 8 }}>
      {sys.chalit && <BhavaChalitSection chalit={sys.chalit} chartStyle={chartStyle} />}
      {sys.kp && <KpSection kp={sys.kp} mahadasha={mahadasha} />}
      {lagnaSign !== undefined && <JaiminiSection jaimini={sys.jaimini} lagnaSignIndex={lagnaSign} />}
      {!sys.chalit && (
        <p className="text-sm text-muted-foreground" data-testid="advanced-polar-note" style={{ marginTop: 16 }}>
          Bhava Chalit, KP and Jaimini tables are not shown for this birthplace: above the polar circles the house cusps they depend on cannot be calculated reliably.
        </p>
      )}
    </div>
  );
}

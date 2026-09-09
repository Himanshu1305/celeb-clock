/**
 * Vedic reading UX (Part D). Renders the 5 reading sections from the
 * /api/vedic-reading payload in plain language, with layered depth (an
 * "advanced view" toggle reveals the underlying chart data), softened language
 * for lower-confidence pieces (D60), a polar-latitude warning banner, and a
 * graceful degraded state (deterministic chart facts when the AI is offline —
 * never a blank section or a raw error).
 */
import { useState } from 'react';
import type { ReadingPayload, ReadingFactsClient } from '@/services/readingService';

const LIFE_AREAS: Array<{ key: 'career' | 'relationships' | 'health' | 'money' | 'family'; label: string }> = [
  { key: 'career', label: 'Career' },
  { key: 'relationships', label: 'Relationships' },
  { key: 'health', label: 'Health' },
  { key: 'money', label: 'Money' },
  { key: 'family', label: 'Family' },
];

function ChartFactsDetails({ facts }: { facts: ReadingFactsClient }) {
  return (
    <div data-testid="reading-advanced" className="rounded-lg border border-border bg-muted/20 p-4 text-sm space-y-3">
      <div>
        <span className="text-muted-foreground">Moon sign (Rashi): </span>
        <span className="font-semibold text-foreground">{facts.rashi}</span>
        <span className="text-muted-foreground"> · Birth star: </span>
        <span className="font-semibold text-foreground">{facts.nakshatra.name} (pada {facts.nakshatra.pada})</span>
        <span className="text-muted-foreground"> · Rising sign (Lagna): </span>
        <span className="font-semibold text-foreground">{facts.lagna}</span>
      </div>
      {facts.dasha && (
        <div>
          <span className="text-muted-foreground">Current period: </span>
          <span className="font-semibold text-foreground">{facts.dasha.maha} / {facts.dasha.antar}</span>
        </div>
      )}
      <table className="w-full text-left">
        <thead className="text-muted-foreground">
          <tr><th className="py-1 pr-3 font-medium">Planet</th><th className="py-1 pr-3 font-medium">Sign</th><th className="py-1 font-medium">House</th></tr>
        </thead>
        <tbody>
          {facts.placements.map(p => (
            <tr key={p.planet} className="border-t border-border/60">
              <td className="py-1 pr-3 text-foreground">{p.planet}{p.retrograde ? ' (R)' : ''}</td>
              <td className="py-1 pr-3 text-foreground">{p.sign}</td>
              <td className="py-1 text-foreground">{p.house}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-muted-foreground">
        Divisional highlights — Navamsa (D9) Moon: <span className="text-foreground">{facts.divisional.d9Moon}</span>;
        {' '}Dasamsa (D10) Sun: <span className="text-foreground">{facts.divisional.d10Sun}</span>;
        {' '}Shashtiamsa (D60) Moon: <span className="text-foreground">{facts.divisional.d60Moon}</span>.
      </div>
    </div>
  );
}

function Section({ testid, title, children }: { testid: string; title: string; children: React.ReactNode }) {
  return (
    <div data-testid={testid} className="rounded-xl border border-border bg-card/60 p-5">
      <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{title}</h3>
      <div className="text-sm text-foreground leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export function VedicReading({ payload }: { payload: ReadingPayload }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { facts, reading, degraded } = payload;
  const isPolar = (payload.warnings || []).some(w => w.code === 'POLAR_LATITUDE');

  // Deterministic fallback sentences (used when the AI reading is unavailable),
  // so no section is ever blank.
  const fb = {
    snapshot: `Your Moon sign is ${facts.rashi}, your birth star is ${facts.nakshatra.name} (pada ${facts.nakshatra.pada}), and your rising sign is ${facts.lagna}.`,
    rightNow: facts.dasha
      ? `You are currently in your ${facts.dasha.maha} main period with a ${facts.dasha.antar} sub-period.`
      : 'Your current planetary period needs a birth time to calculate.',
    doshas: facts.doshas.mangal.present || facts.doshas.kaalSarp.present || facts.doshas.sadeSati.active
      ? 'Some traditional patterns are noted in your chart — see the details below, framed calmly as areas to be mindful of.'
      : 'Your chart is free of the major traditional patterns (Mangal Dosha, Kaal Sarp, Sade Sati) — a calm foundation.',
    divisional: `In-depth divisional charts add nuance: Navamsa (D9) points to ${facts.divisional.d9Moon}, Dasamsa (D10) to ${facts.divisional.d10Sun}.`,
  };

  return (
    <div data-testid="vedic-reading" className="space-y-5">
      {isPolar && (
        <div data-testid="reading-polar-warning" className="rounded-xl border-2 border-amber-500/60 bg-amber-50 text-amber-900 p-4 text-sm">
          <strong>A note about this birth location:</strong> it is at an extreme (polar) latitude where the
          rising sign and house positions are astronomically unreliable. The Moon sign, birth star and planetary
          period below remain accurate, but treat the rising-sign and house-based parts as approximate.
        </div>
      )}

      {degraded && (
        <div data-testid="reading-degraded-notice" className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          Our written reading is taking a short break, so here is your full chart data in the meantime. Please
          check back shortly for the narrated version.
        </div>
      )}

      <Section testid="reading-snapshot" title="Your snapshot">
        <p>{reading ? reading.snapshot : fb.snapshot}</p>
      </Section>

      <div data-testid="reading-life-areas" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LIFE_AREAS.map(area => (
          <Section key={area.key} testid={`reading-area-${area.key}`} title={area.label}>
            {reading ? (
              <p>{reading[area.key]}</p>
            ) : (
              <p className="text-muted-foreground">
                {area.label} guidance returns with the narrated reading. Your relevant placements are in the
                chart details below.
              </p>
            )}
          </Section>
        ))}
      </div>

      <Section testid="reading-right-now" title="Right now for you">
        <p>{reading ? reading.rightNow : fb.rightNow}</p>
      </Section>

      <Section testid="reading-doshas" title="Doshas — areas to be mindful of">
        <p>{reading ? reading.doshas : fb.doshas}</p>
      </Section>

      <Section testid="reading-divisional" title="Deeper chart layers">
        <p>{reading ? reading.divisional : fb.divisional}</p>
        <p data-testid="reading-d60-disclaimer" className="text-xs text-muted-foreground italic">
          {facts.divisional.d60Disclaimer}
        </p>
      </Section>

      <div>
        <button
          type="button"
          data-testid="reading-advanced-toggle"
          onClick={() => setShowAdvanced(v => !v)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 underline"
        >
          {showAdvanced ? 'Hide chart details' : 'Show chart details (advanced)'}
        </button>
        {(showAdvanced || degraded) && <div className="mt-3"><ChartFactsDetails facts={facts} /></div>}
      </div>
    </div>
  );
}

export default VedicReading;

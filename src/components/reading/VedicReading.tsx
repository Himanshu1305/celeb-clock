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
import { TermTip } from '@/components/vedic/TermTip';
import { activeDoshaDetails } from '@/lib/vedic/doshaRemedies';

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
      {/* Pratyantardasha (Part X) — 3rd Dasha level, ADVANCED-VIEW ONLY (not in the
          plain-language reading narrative). */}
      {facts.pratyantardasha && (
        <div data-testid="reading-pratyantardasha">
          <span className="text-muted-foreground">Current sub-sub-period (Pratyantardasha): </span>
          <span className="font-semibold text-foreground">
            {facts.pratyantardasha.lord}
            {facts.pratyantardasha.start && facts.pratyantardasha.end
              ? ` (${new Date(facts.pratyantardasha.start).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} – ${new Date(facts.pratyantardasha.end).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })})`
              : ''}
          </span>
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
        Divisional highlights — <TermTip id="navamsa">Navamsa (D9)</TermTip> Moon: <span className="text-foreground">{facts.divisional.d9Moon}</span>;
        {' '}<TermTip id="dasamsa">Dasamsa (D10)</TermTip> Sun: <span className="text-foreground">{facts.divisional.d10Sun}</span>;
        {' '}<TermTip id="shashtiamsa">Shashtiamsa (D60)</TermTip> Moon: <span className="text-foreground">{facts.divisional.d60Moon}</span>.
      </div>

      {/* Raw Shadbala strengths — the narrative uses plain words ("strong"), so the
          exact computed virupa numbers live here for power users. */}
      {facts.planets && facts.planets.some(p => p.shadbala) && (
        <div data-testid="reading-shadbala">
          <div className="text-muted-foreground mb-1">Planetary strength (<TermTip id="shadbala">Shadbala</TermTip>, in virupas — indicative):</div>
          <table className="w-full text-left">
            <thead className="text-muted-foreground">
              <tr><th className="py-1 pr-3 font-medium">Planet</th><th className="py-1 pr-3 font-medium">Strength</th><th className="py-1 font-medium">Virupas</th></tr>
            </thead>
            <tbody>
              {facts.planets.filter(p => p.shadbala).map(p => (
                <tr key={p.planet} className="border-t border-border/60">
                  <td className="py-1 pr-3 text-foreground">{p.planet}</td>
                  <td className="py-1 pr-3 text-foreground capitalize">{p.shadbala!.category}</td>
                  <td className="py-1 text-foreground">{p.shadbala!.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detected classical Yogas — name, grade, and the conditions that were checked
          (mirrors how Shadbala numbers live here, not in the narrative). */}
      {facts.yogas && facts.yogas.length > 0 && (
        <div data-testid="reading-yogas">
          <div className="text-muted-foreground mb-1">Classical Yogas detected (graded — formation does not guarantee full delivery):</div>
          <ul className="space-y-2">
            {facts.yogas.map((y, i) => (
              <li key={i} className="rounded border border-border/60 p-2">
                <div className="font-semibold text-foreground">
                  {y.name} <span className="ml-1 text-xs uppercase tracking-wide text-[#6E5AA6]">[{y.grade}]</span>
                </div>
                <div className="text-muted-foreground">{y.summary}</div>
                {y.conditions && y.conditions.length > 0 && (
                  <ul className="mt-1 list-disc pl-4 text-muted-foreground">
                    {y.conditions.map((c, j) => <li key={j}>{c}</li>)}
                  </ul>
                )}
                {y.note && <div className="mt-1 text-xs italic text-muted-foreground">{y.note}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Part AI — deterministic, impact-first dosha detail with FREE, calm remedies.
 * Gives Kaal Sarp the same first-class labelled treatment as Manglik and adds a
 * remedies list for every detected pattern. If no major dosha is present, shows
 * a short reassurance instead of nothing.
 */
function DoshaDetails({ facts }: { facts: ReadingFactsClient }) {
  const details = activeDoshaDetails(facts.doshas);
  if (details.length === 0) {
    return (
      <p data-testid="reading-doshas-none" className="mt-3 text-sm text-muted-foreground">
        Your chart is free of the three major traditional patterns (Mangal Dosha, Kaal Sarp and Sade Sati) — a calm foundation, with nothing here needing a remedy.
      </p>
    );
  }
  return (
    <div data-testid="reading-doshas-detail" className="mt-3 space-y-3">
      {details.map(d => (
        <div key={d.termId} data-testid={`dosha-${d.termId}`} className="rounded-lg border border-border p-4">
          <div className="font-semibold text-foreground">
            <TermTip id={d.termId}>{d.label}</TermTip>
          </div>
          {/* Impact FIRST, then reasoning. */}
          <p className="mt-1 text-sm text-foreground">{d.impact}</p>
          <p className="mt-1 text-sm text-muted-foreground">{d.why}</p>
          <div className="mt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Free remedies (traditional customs — optional)</div>
            <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground space-y-1">
              {d.remedies.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </div>
      ))}
      <p className="text-xs text-amber-700">All remedies above are free, traditional customs offered for interest — never something you must pay for or do out of fear.</p>
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

/**
 * Progressive disclosure (Part I.18): shows a 2-line preview by default with a
 * "Read more" toggle. The FULL text is always present in the DOM (only visually
 * clamped via CSS), so no content is lost and every accuracy/safety guarantee is
 * unchanged — this is a presentation change only.
 */
function CollapsibleText({ text, section }: { text: string; section: string }) {
  const [open, setOpen] = useState(false);
  const clampStyle = open ? undefined : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' };
  const long = text.length > 140;
  return (
    <div data-testid={`reading-collapsible-${section}`}>
      <p data-collapsed={!open && long} style={long ? clampStyle : undefined}>{text}</p>
      {long && (
        <button type="button" data-testid={`reading-more-${section}`} onClick={() => setOpen(o => !o)}
                className="mt-1 text-xs font-medium text-[#6E5AA6] hover:text-[#6E5AA6] hover:underline">
          {open ? 'Show less' : 'Read more'}
        </button>
      )}
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
              <CollapsibleText text={reading[area.key]} section={area.key} />
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
        {reading ? <CollapsibleText text={reading.rightNow} section="rightNow" /> : <p>{fb.rightNow}</p>}
      </Section>

      <Section testid="reading-doshas" title="Doshas — areas to be mindful of">
        {reading ? <CollapsibleText text={reading.doshas} section="doshas" /> : <p>{fb.doshas}</p>}
        <DoshaDetails facts={facts} />
      </Section>

      <Section testid="reading-divisional" title="Deeper chart layers">
        {reading ? <CollapsibleText text={reading.divisional} section="divisional" /> : <p>{fb.divisional}</p>}
        <p data-testid="reading-d60-disclaimer" className="text-xs text-muted-foreground italic">
          {facts.divisional.d60Disclaimer}
        </p>
      </Section>

      <div>
        <button
          type="button"
          data-testid="reading-advanced-toggle"
          onClick={() => setShowAdvanced(v => !v)}
          className="text-sm font-medium text-[#6E5AA6] hover:text-[#6E5AA6] underline"
        >
          {showAdvanced ? 'Hide chart details' : 'Show chart details (advanced)'}
        </button>
        {(showAdvanced || degraded) && <div className="mt-3"><ChartFactsDetails facts={facts} /></div>}
      </div>
    </div>
  );
}

export default VedicReading;

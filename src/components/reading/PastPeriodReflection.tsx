/**
 * Past-Period Reflection (Part R) — an OPTIONAL, low-key, skippable section shown on
 * the Kundali page after the main reading. It asks — never asserts — whether a
 * classically-associated life theme matched the user's real experience during a real,
 * already-completed Dasha/Antardasha period of their own chart.
 *
 * Consent + "once ever": only rendered for a saved profile (Part E opt-in), and each
 * theme is shown at most once, ever, tracked device-locally by birth date. An answered
 * theme never reappears (persisted); a not-yet-answered qualifying theme still can.
 * Styling is deliberately quiet — not urgent, not attention-grabbing.
 */
import { useState } from 'react';
import type { ReflectionQuestionClient } from '@/services/readingService';
import { REFLECTION_OPTIONS, REFLECTION_ACK, type ReflectionResponse } from '@/lib/vedic/reflection';
import { getAnsweredThemes, recordReflectionResponse } from '@/services/reflectionResponses';

const OPTION_SLUG: Record<ReflectionResponse, string> = {
  'Yes, that fits': 'yes',
  'Not really': 'not-really',
  "I don't remember": 'dont-remember',
};

export function PastPeriodReflection({
  reflections, dob, hasSavedProfile,
}: {
  reflections?: ReflectionQuestionClient[];
  dob: string;
  hasSavedProfile: boolean;
}) {
  // Themes already answered on a PRIOR visit (persisted) — snapshot once on mount so a
  // just-answered question stays visible with its acknowledgment for this render.
  const [priorAnswered] = useState<Set<string>>(() =>
    hasSavedProfile && dob ? getAnsweredThemes(dob) : new Set());
  const [justAnswered, setJustAnswered] = useState<Record<string, ReflectionResponse>>({});

  // Consent gate: no persistent per-user identity without a saved profile → do not
  // show (nothing to track "once ever" against, and no opt-in to store an answer).
  if (!hasSavedProfile || !dob) return null;

  const questions = (reflections || []).filter(q => !priorAnswered.has(q.theme));
  if (!questions.length) return null;  // nothing to ask (or all already answered) — render nothing

  const answer = (theme: ReflectionQuestionClient['theme'], opt: ReflectionResponse) => {
    recordReflectionResponse(dob, theme, opt, hasSavedProfile);
    setJustAnswered(a => (a[theme] ? a : { ...a, [theme]: opt })); // first answer stands
  };

  return (
    <section
      data-testid="past-period-reflection"
      className="rounded-xl border border-border bg-muted/20 p-4 text-sm"
    >
      <h3 className="font-heading text-base font-semibold text-foreground mb-1">
        A moment of reflection{' '}
        <span className="text-xs font-normal text-muted-foreground">(optional)</span>
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        These come from classical Vedic tradition — not a prediction, and there is no right or
        wrong answer. Your reply is kept on this device only, asked at most once per theme, for
        your own reference. Skip any you like.
      </p>

      <div className="space-y-4">
        {questions.map(q => {
          const resp = justAnswered[q.theme];
          return (
            <div key={q.theme} data-testid={`reflection-${q.theme}`} className="rounded-lg bg-background/60 p-3">
              <p className="text-foreground mb-2">{q.questionText}</p>
              {resp ? (
                <p data-testid={`reflection-ack-${q.theme}`} className="text-muted-foreground italic">
                  {REFLECTION_ACK[resp]}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2" data-testid={`reflection-options-${q.theme}`}>
                  {REFLECTION_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      data-testid={`reflection-${q.theme}-${OPTION_SLUG[opt]}`}
                      onClick={() => answer(q.theme, opt)}
                      className="px-3 py-1.5 rounded-full border border-border text-foreground hover:bg-accent/10 transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default PastPeriodReflection;

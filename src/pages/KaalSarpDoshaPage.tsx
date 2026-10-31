/**
 * Kaal Sarp Dosha standalone tool. Reads doshas.kaalSarp from the shared
 * /api/kundali endpoint (same Lahiri-ayanamsa engine as all Vedic tools).
 * Calm, non-fear tone — Kaal Sarp is a pattern of intensity and delayed
 * breakthroughs, not catastrophe.
 */
import { useState } from 'react';
import { PageFAQ } from '@/components/PageFAQ';
import { faqItemsFromSchema } from '@/lib/seo/faqFromSchema';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { TermTip } from '@/components/vedic/TermTip';
import { TrustStrip } from '@/components/paj/TrustStrip';
import { birthQuery } from '@/lib/timezone/clientBirth';
import { Remedies } from '@/components/vedic/Remedies';

interface KaalSarp {
  present: boolean;
  isPartial: boolean;
  type: string | null;
  direction: 'Ascending' | 'Descending' | null;
}

interface KundaliResult {
  doshas: {
    kaalSarp: KaalSarp;
  };
}

export default function KaalSarpDoshaPage() {
  const { profile, save } = useSavedProfile();
  const [result, setResult] = useState<KundaliResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [saveChecked, setSaveChecked] = useState(false);

  const run = async (d: BirthDetails) => {
    setLoading(true); setFailed(false); setResult(null);
    if (saveChecked) save({ dob: d.dob, time: d.time, city: d.city });
    try {
      // fix-timezone-accuracy: shared birth params (zone from the birthplace, DST-correct).
      const p = new URLSearchParams(birthQuery(d.dob, d.time, d.city));
      const res = await fetch(`/api/kundali?${p.toString()}`);
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      if (!data?.doshas?.kaalSarp) throw new Error('unavailable');
      setResult(data as KundaliResult);
    } catch { setFailed(true); } finally { setLoading(false); }
  };

  const initial = profile ? { dob: profile.dob, time: profile.time, city: profile.city } : undefined;

  const ks = result?.doshas?.kaalSarp;


  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Kaal Sarp Dosha?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Kaal Sarp Dosha is a Vedic astrology pattern where all seven classical planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) fall between the nodal axis of Rahu and Ketu in the birth chart. Traditionally it is associated with intensity, periodic delays, and eventual significant breakthroughs — not with catastrophe or permanent misfortune. Many accomplished individuals in history have had this pattern in their charts.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Kaal Sarp Dosha really harmful?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Kaal Sarp Dosha is a chart pattern to understand, not a verdict on your life. The classical tradition associates it with periods of karmic intensity and concentrated focus — which many people experience as challenges followed by meaningful breakthroughs. It is not a predictor of disaster, and no remedy is required to "protect" you from harm.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the types of Kaal Sarp Dosha?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'There are 12 types of Kaal Sarp Dosha, named after serpents: Anant, Kulik, Vasuki, Shankhpal, Padma, Mahapadma, Takshak, Karkotak, Shankhachud, Ghatak, Vishdhar and Sheshnag. Each is named by the house Rahu occupies counted from the Lagna (Rahu in the 1st = Anant … Rahu in the 12th = Sheshnag), and each is traditionally associated with slightly different themes in life — career, relationships, spiritual growth, and so on.',
        },
      },
    ],
  };

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="kaalsarp-page"
      seo={(
        <SEO
          title="Kaal Sarp Dosha Calculator — Check Your Chart Free | BornClock"
          description="Free Kaal Sarp Dosha calculator — check if all planets fall between Rahu and Ketu, the type and direction, with calm, honest guidance for your chart."
          canonicalUrl="/kaal-sarp-dosha"
          ogType="website"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology/' }], current: 'Kaal Sarp Dosha', edition: 'Rahu–Ketu · Nodal axis' }}
      footer={{
        tagline: 'Kaal Sarp Dosha from your real planetary positions — the same Lahiri-ayanamsa engine as the rest of BornClock.',
        nav: [
          { label: 'Vedic Astrology', to: '/vedic-astrology/' },
          { label: 'Kundali', to: '/kundali/' },
          { label: 'Sade Sati', to: '/sade-sati/' },
          { label: 'How It Works', to: '/how-it-works/' },
          { label: 'Privacy', to: '/privacy/' },
        ],
        note: '© 2026 BornClock · Vedic astrology, computed with care.',
      }}
    >

      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">Rahu–Ketu · Nodal axis</span><h1>Kaal Sarp Dosha Calculator.</h1></div>
          <p>Check whether all seven classical planets fall between Rahu and Ketu in your birth chart, which of the 12 named types applies, and what it actually means — calmly, honestly, without fear.</p>
        </div>
        <TrustStrip claim="Every planet's position is worked out from your real birth chart. Kaal Sarp is reported only when all seven planets sit between Rahu and Ketu by exact degree — a near-miss is shown as a note, never as a dosha." href="/how-it-works/#vedic" />
        <div className="form-band" style={{ marginTop: 16 }}>
          <div><h3>Your birth details</h3><p className="small muted">We need the exact positions of all planets, including Rahu and Ketu.</p></div>
          <BirthDetailsForm
            initial={initial}
            submitLabel="Check Kaal Sarp Dosha"
            loadingLabel="Calculating…"
            loading={loading}
            onSubmit={run}
            showSaveOption
            saveChecked={saveChecked}
            onSaveCheckedChange={setSaveChecked}
            testIdPrefix="kaalsarp"
          />
        </div>
        {failed && <p className="subtle" style={{ marginTop: 12 }}>The service is temporarily unavailable. Please try again shortly.</p>}

        {ks && (
          <div data-testid="kaalsarp-result" className="mt-6 space-y-4">
            {/* Verdict block */}
            <div className={`rounded-xl border p-5 text-center ${ks.present ? 'border-amber-300 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <div className={`text-2xl font-black ${ks.present ? 'text-amber-700' : 'text-emerald-700'}`}>
                {ks.present
                  ? 'Your chart shows Kaal Sarp Dosha'
                  : 'Your chart does not show Kaal Sarp Dosha'}
              </div>
              {ks.present && (
                <div className="mt-2 space-y-1">
                  {ks.type && (
                    <div className="font-semibold text-foreground"><TermTip id="kaalSarpType">Type</TermTip>: {ks.type} Kaal Sarp</div>
                  )}
                  {ks.direction && (
                    <div className="text-sm text-muted-foreground">
                      Direction: {ks.direction === 'Ascending' ? 'Ascending (Rahu leads)' : 'Descending (Ketu leads)'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Calm narrative */}
            <div data-testid="kaalsarp-narrative" className="rounded-xl border border-border p-5">
              {ks.present ? (
                <>
                  <p className="font-bold text-foreground mb-2">
                    Kaal Sarp Dosha is present — a pattern of intensity and eventual breakthrough.
                  </p>
                  <p className="text-sm text-foreground leading-relaxed mb-2">
                    <TermTip id="kaalsarp">Kaal Sarp Dosha</TermTip> forms when all seven classical planets are hemmed between Rahu and Ketu on one side of the nodal axis.
                    {' '}In your chart all seven planets fall within the arc by exact degree, making it a full formation.
                  </p>
                  <p className="text-sm text-foreground leading-relaxed mb-2">
                    Traditionally, this pattern is associated with concentrated karmic focus — periods of delay or obstruction followed by meaningful, sometimes dramatic breakthroughs. Many people with this configuration describe a sense of directed intensity in their lives: obstacles that, once cleared, opened significant doors.
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    What it is <em>not</em>: a sign of doom, permanent misfortune, or a bar to success. Many highly accomplished individuals across history have had Kaal Sarp patterns in their charts. It is a feature to understand and work with — not something to fear.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-foreground mb-2">Your chart does not show Kaal Sarp Dosha.</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    All seven classical planets are not confined between <TermTip id="rahu">Rahu</TermTip> and <TermTip id="ketu">Ketu</TermTip> by degree in your chart, so the Kaal Sarp pattern does not apply. No special consideration or action is needed on this front.
                  </p>
                  {ks.isPartial && (
                    <p data-testid="kaalsarp-partial-note" className="mt-2 rounded-lg border border-border bg-muted/40 p-2 text-xs text-muted-foreground">
                      <TermTip id="partialKaalSarp">Note only, not a dosha</TermTip>: your planets come close to this pattern (some astrologers call it a “partial” Kaal Sarp), but at least one planet lies outside the Rahu–Ketu arc by degree. By the standard definition used here, Kaal Sarp is not present.
                    </p>
                  )}
                </>
              )}
            </div>

            {/* The 12 types — always informative */}
            {ks.present && ks.type && (
              <div data-testid="kaalsarp-type-detail" className="rounded-xl border border-border p-5">
                <div className="font-semibold text-foreground mb-2">About the {ks.type} type</div>
                <p className="text-sm text-muted-foreground mb-3">
                  There are 12 named types of Kaal Sarp Dosha, each defined by which house axis Rahu and Ketu occupy. The {ks.type} type is one of these, with its own traditional associations. The direction — {ks.direction === 'Ascending' ? 'Ascending (Rahu leads the arc)' : 'Descending (Ketu leads the arc)'} — is also a classical modifier:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                  <li><strong className="text-foreground">Ascending (Rahu leads)</strong> — traditionally associated with worldly ambition, external growth, and material focus; the chart's energy drives toward achievement and recognition.</li>
                  <li><strong className="text-foreground">Descending (Ketu leads)</strong> — traditionally associated with inner growth, spiritual focus, and liberation from external attachments; the chart's energy turns inward.</li>
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">
                  For a full picture of how Rahu and Ketu operate across your chart, see your <a href="/kundali/" className="text-primary hover:underline">full Kundali</a>.
                </p>
              </div>
            )}

            {/* Methodology */}
            <div data-testid="kaalsarp-methodology" className="rounded-xl border border-brand-purple/30 bg-brand-purple/40 p-4">
              <div className="font-semibold text-foreground mb-1">How this was worked out</div>
              <p className="text-sm text-foreground">
                All seven classical planet positions are computed from your birth data using the <TermTip id="ayanamsa">Lahiri ayanamsa (the traditional Indian sidereal calculation)</TermTip>. Kaal Sarp is reported only when all seven planets (Sun to Saturn) lie strictly between Rahu and Ketu on one side, by exact degree; near-misses are shown only as a note. The type is named from Rahu's house counted from the Lagna (whole-sign houses).
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Learn more at <a href="/how-it-works/" className="text-primary hover:underline">How It Works</a> · <a href="/vedic-astrology/" className="text-primary hover:underline">Vedic Astrology</a>.
              </p>
            </div>

            {/* Batch 5: remedies only for a FULL Kaal Sarp (partial = note only, never "present"). */}
            {ks.present && !ks.isPartial && (
              <div data-testid="kaalsarp-upay">
                <Remedies remedyKey="kaalSarp" label={{ en: 'Kaal Sarp — what it means and what you can do', hi: 'कालसर्प — अर्थ और उपाय' }} />
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Computed from all planetary positions using the same <TermTip id="ayanamsa">Lahiri-ayanamsa engine</TermTip> as the rest of BornClock.
              See also: <a href="/kundali/" className="text-primary hover:underline">Full Kundali</a> · <a href="/sade-sati/" className="text-primary hover:underline">Sade Sati</a> · <a href="/vedic-astrology/" className="text-primary hover:underline">Vedic Astrology</a> · <a href="/how-it-works/" className="text-primary hover:underline">How It Works</a>.
            </p>
          </div>
        )}
      </section>
      {/* Batch 10: FAQPage Q&As shown on the page (PageFAQ also emits the JSON-LD). */}
      <PageFAQ variant="plain" items={faqItemsFromSchema(faqJsonLd)} />
    </PajPage>
  );
}

/**
 * Kaal Sarp Dosha standalone tool. Reads doshas.kaalSarp from the shared
 * /api/kundali endpoint (same Lahiri-ayanamsa engine as all Vedic tools).
 * Calm, non-fear tone — Kaal Sarp is a pattern of intensity and delayed
 * breakthroughs, not catastrophe.
 */
import { useState } from 'react';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { TermTip } from '@/components/vedic/TermTip';
import { TrustStrip } from '@/components/paj/TrustStrip';
import { JsonLd } from '@/components/JsonLd';

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
      const [y, m, day] = d.dob.split('-'); const [h, min] = (d.time || '12:00').split(':');
      const p = new URLSearchParams({ y, m, d: day, h, min, lat: String(d.city.lat), lon: String(d.city.lon), tz: String(d.city.tz) });
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
          text: 'There are 12 types of Kaal Sarp Dosha, named after serpents: Anant, Kulik, Vasuki, Shankhpal, Padam, Mahapadam, Takshak, Karkotak, Shankhchur, Ghatak, Vishdhar, and Sheshnag. Each is defined by which house axis Rahu and Ketu occupy, and each is traditionally associated with slightly different themes in life — career, relationships, spiritual growth, and so on.',
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
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Kaal Sarp Dosha', edition: 'Rahu–Ketu · Nodal axis' }}
      footer={{
        tagline: 'Kaal Sarp Dosha from your real planetary positions — the same Lahiri-ayanamsa engine as the rest of BornClock.',
        nav: [
          { label: 'Vedic Astrology', to: '/vedic-astrology' },
          { label: 'Kundali', to: '/kundali' },
          { label: 'Sade Sati', to: '/sade-sati' },
          { label: 'How It Works', to: '/how-it-works' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Vedic astrology, computed with care.',
      }}
    >
      <JsonLd data={faqJsonLd} id="kaalsarp-faq" />

      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">Rahu–Ketu · Nodal axis</span><h1>Kaal Sarp Dosha Calculator.</h1></div>
          <p>Check whether all seven classical planets fall between Rahu and Ketu in your birth chart, which of the 12 named types applies, and what it actually means — calmly, honestly, without fear.</p>
        </div>
        <TrustStrip claim="Every planet's position is worked out from your real birth chart. In our tests, our Kaal Sarp result matched a leading Vedic astrology service in 96–100% of charts (a few borderline charts can differ)." href="/how-it-works#vedic" />
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
                  ? `Your chart shows ${ks.isPartial ? 'Partial ' : ''}Kaal Sarp Dosha`
                  : 'Your chart does not show Kaal Sarp Dosha'}
              </div>
              {ks.present && (
                <div className="mt-2 space-y-1">
                  {ks.type && (
                    <div className="font-semibold text-foreground">Type: {ks.type} Kaal Sarp</div>
                  )}
                  {ks.direction && (
                    <div className="text-sm text-muted-foreground">
                      Direction: {ks.direction === 'Ascending' ? 'Ascending (Rahu leads)' : 'Descending (Ketu leads)'}
                    </div>
                  )}
                  {ks.isPartial && (
                    <div className="text-sm text-muted-foreground">Partial — one or more planets fall outside the Rahu–Ketu arc</div>
                  )}
                </div>
              )}
            </div>

            {/* Calm narrative */}
            <div data-testid="kaalsarp-narrative" className="rounded-xl border border-border p-5">
              {ks.present ? (
                <>
                  <p className="font-bold text-foreground mb-2">
                    {ks.isPartial ? 'A partial Kaal Sarp pattern is present — understand it, don\'t fear it.' : 'Kaal Sarp Dosha is present — a pattern of intensity and eventual breakthrough.'}
                  </p>
                  <p className="text-sm text-foreground leading-relaxed mb-2">
                    <TermTip id="kaalsarp">Kaal Sarp Dosha</TermTip> forms when all seven classical planets are hemmed between Rahu and Ketu on one side of the nodal axis.
                    {ks.isPartial
                      ? ' In your case it is partial — at least one planet falls outside the arc, which significantly reduces the pattern\'s intensity compared to a full formation.'
                      : ' In your chart all seven planets fall within the arc, making it a full formation.'}
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
                    All seven classical planets are not confined within the Rahu–Ketu arc in your chart, so the Kaal Sarp pattern does not apply. No special consideration or action is needed on this front.
                  </p>
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
                  For a full picture of how Rahu and Ketu operate across your chart, see your <a href="/kundali" className="text-primary hover:underline">full Kundali</a>.
                </p>
              </div>
            )}

            {/* Methodology */}
            <div data-testid="kaalsarp-methodology" className="rounded-xl border border-[#6E5AA6]/30 bg-[#6E5AA6]/40 p-4">
              <div className="font-semibold text-foreground mb-1">How this was worked out</div>
              <p className="text-sm text-foreground">
                All seven classical planet positions are computed from your birth data using the <TermTip id="ayanamsa">Lahiri ayanamsa (the traditional Indian sidereal calculation)</TermTip>. The whole-sign method is used to determine house placement. Kaal Sarp is detected by checking whether all planets fall within the Rahu–Ketu arc (or outside it for partial). Cross-checked against ProKerala at 96–100% agreement, with a documented ~4% tolerance on edge cases near the arc boundary.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Learn more at <a href="/how-it-works" className="text-primary hover:underline">How It Works</a> · <a href="/vedic-astrology" className="text-primary hover:underline">Vedic Astrology</a>.
              </p>
            </div>

            {/* Upay / remedies — optional, non-fear */}
            <div data-testid="kaalsarp-upay" className="rounded-xl border border-border p-5">
              <div className="font-semibold text-foreground mb-1">Traditional upay (remedies) — optional, not required</div>
              <p className="text-sm text-muted-foreground mb-2">
                First, the honest part: <strong className="text-foreground">nothing here is necessary to "avoid harm"</strong> — Kaal Sarp is a pattern to understand and work with, not a threat to defend against. These are simply the customs people have found meaningful when reflecting on the Rahu–Ketu axis.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                <li><strong className="text-foreground">Patience and persistence</strong> — working with the Rahu–Ketu themes of karmic focus means committing to long-term effort and not abandoning goals at the first delay. This is the most classical "answer" to a strong nodal pattern.</li>
                <li><strong className="text-foreground">Shiva devotion</strong> — reciting the Maha Mrityunjaya mantra or visiting a Shiva temple, particularly on Nag Panchami, is a traditional Rahu–Ketu practice; take it as suits your beliefs.</li>
                <li><strong className="text-foreground">Charity and service</strong> — giving to those in need on a Saturday or during Rahu Kaal is a classical nodal practice, offered here as optional custom.</li>
                <li><strong className="text-foreground">Ketu and ancestral reflection</strong> — Ketu traditionally represents past-life karmas and lineage; some people find reflection on ancestral stories or genealogy grounding when this axis is prominent.</li>
              </ul>
              <p className="mt-2 text-xs text-amber-700">Offered as tradition and reflection, not medical or legal advice — and never as something you must do out of fear.</p>
            </div>

            <p className="text-xs text-muted-foreground">
              Computed from all planetary positions using the same <TermTip id="ayanamsa">Lahiri-ayanamsa engine</TermTip> as the rest of BornClock.
              See also: <a href="/kundali" className="text-primary hover:underline">Full Kundali</a> · <a href="/sade-sati" className="text-primary hover:underline">Sade Sati</a> · <a href="/vedic-astrology" className="text-primary hover:underline">Vedic Astrology</a> · <a href="/how-it-works" className="text-primary hover:underline">How It Works</a>.
            </p>
          </div>
        )}
      </section>
    </PajPage>
  );
}

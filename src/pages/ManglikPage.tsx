/**
 * Manglik (Mangal Dosha) standalone tool. Reads doshas.mangalDosha from the
 * shared /api/kundali endpoint (same Lahiri-ayanamsa engine as all Vedic tools).
 * Calm, non-fear tone — Manglik is an area for mindful matching, NOT a curse.
 */
import { useState } from 'react';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { TermTip } from '@/components/vedic/TermTip';
import { TrustStrip } from '@/components/paj/TrustStrip';
import { JsonLd } from '@/components/JsonLd';

interface MangalDosha {
  hasDosha: boolean;
  severityLabel: string;
  severityPercentage: number;
  fromLagna: boolean;
  fromMoon: boolean;
  fromVenus: boolean;
}

interface KundaliResult {
  doshas: {
    mangalDosha: MangalDosha;
  };
}

export default function ManglikPage() {
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
      if (!data?.doshas?.mangalDosha) throw new Error('unavailable');
      setResult(data as KundaliResult);
    } catch { setFailed(true); } finally { setLoading(false); }
  };

  const initial = profile ? { dob: profile.dob, time: profile.time, city: profile.city } : undefined;

  const dosha = result?.doshas?.mangalDosha;

  const refPoints: string[] = [];
  if (dosha?.fromLagna) refPoints.push('Lagna (Ascendant)');
  if (dosha?.fromMoon) refPoints.push('Moon');
  if (dosha?.fromVenus) refPoints.push('Venus');


  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Manglik (Mangal Dosha)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mangal Dosha (also called Manglik) is a classical Vedic astrology concept that arises when Mars (Mangal) occupies certain houses in the birth chart — specifically the 1st, 2nd, 4th, 7th, 8th, or 12th — counted from the Lagna (Ascendant), Moon, or Venus. It is traditionally considered in marriage matching as an area for mindfulness, not a bar to marriage or a sign of misfortune.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can a Manglik marry a non-Manglik?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Many happy, long-lasting marriages involve one Manglik and one non-Manglik partner. Classical texts describe several cancellation conditions (parihara) — including both partners being Manglik, Mars in its own or exalted sign, or benefic aspects on Mars — that are widely considered to neutralise the dosha. The majority of traditional astrologers today treat Manglik as one factor among many in compatibility, not a decisive barrier.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Manglik dosha reduce with age?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, this is a well-known classical position: Manglik dosha is widely considered to reduce significantly after the age of 28, and many astrologers regard it as largely neutralised after 28–30. This is one reason many families and astrologers place far less weight on it for later marriages.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Manglik dosha bad or dangerous?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Manglik is not a curse, a verdict, or a predictor of harm. It is a classical pattern in the birth chart that is noted in the context of compatibility assessment. Countless people with Manglik charts have excellent marriages and fulfilling lives. Modern astrologers consistently advise that it is one consideration among many — approached calmly, not feared.',
        },
      },
    ],
  };

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="manglik-page"
      seo={(
        <SEO
          title="Manglik Dosha Calculator — Check Mangal Dosha Free | BornClock"
          description="Free Manglik (Mangal Dosha) calculator — check if your birth chart is Manglik, how strong, the classical cancellations, and calm, honest guidance for matching."
          canonicalUrl="/manglik"
          ogType="website"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Manglik', edition: 'Mangal · Mars placement' }}
      footer={{
        tagline: 'Mangal Dosha from Mars\'s real house position — the same Lahiri-ayanamsa engine as the rest of BornClock.',
        nav: [
          { label: 'Vedic Astrology', to: '/vedic-astrology' },
          { label: 'Kundali', to: '/kundali' },
          { label: 'Kundali Match', to: '/kundali-match' },
          { label: 'How It Works', to: '/how-it-works' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Vedic astrology, computed with care.',
      }}
    >
      <JsonLd data={faqJsonLd} id="manglik-faq" />

      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">Mangal · Mars placement</span><h1>Manglik Dosha Calculator.</h1></div>
          <p>Find out whether your birth chart carries Mangal Dosha (Manglik), how strong it is, which reference points flag it, and — crucially — what the classical cancellations are. Calm, honest, non-fear-based.</p>
        </div>
        <TrustStrip claim="Your Mars placement is worked out from your real birth chart, not guessed from your star sign. In our tests, our Manglik result matched a leading Vedic astrology service in 99–100% of charts." href="/how-it-works#vedic" />
        <div className="form-band" style={{ marginTop: 16 }}>
          <div><h3>Your birth details</h3><p className="small muted">We use Mars's house placement in your chart.</p></div>
          <BirthDetailsForm
            initial={initial}
            submitLabel="Check Manglik Dosha"
            loadingLabel="Calculating…"
            loading={loading}
            onSubmit={run}
            showSaveOption
            saveChecked={saveChecked}
            onSaveCheckedChange={setSaveChecked}
            testIdPrefix="manglik"
          />
        </div>
        {failed && <p className="subtle" style={{ marginTop: 12 }}>The service is temporarily unavailable. Please try again shortly.</p>}

        {dosha && (
          <div data-testid="manglik-result" className="mt-6 space-y-4">
            {/* Verdict block */}
            <div className={`rounded-xl border p-5 text-center ${dosha.hasDosha ? 'border-amber-300 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <div className={`text-2xl font-black ${dosha.hasDosha ? 'text-amber-700' : 'text-emerald-700'}`}>
                {dosha.hasDosha
                  ? 'Your chart shows Mangal Dosha (Manglik)'
                  : 'Your chart does not show Mangal Dosha'}
              </div>
              {dosha.hasDosha && (
                <div className="mt-2 space-y-1">
                  <div className="font-semibold text-foreground">
                    Severity: {dosha.severityLabel}
                    {dosha.severityPercentage > 0 && ` (${dosha.severityPercentage}%)`}
                  </div>
                  {refPoints.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Flagged from: {refPoints.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Calm narrative */}
            <div data-testid="manglik-narrative" className="rounded-xl border border-border p-5">
              {dosha.hasDosha ? (
                <>
                  <p className="font-bold text-foreground mb-2">Being Manglik is an area for mindful matching — not a curse, not a barrier.</p>
                  <p className="text-sm text-foreground leading-relaxed mb-2">
                    Mangal Dosha arises when <TermTip id="manglik">Mars (Mangal)</TermTip> falls in certain houses of the birth chart — in your case, it's present from {refPoints.length > 0 ? refPoints.join(' and ') : 'one or more reference points'}.
                    Mars is the planet of energy, drive, and assertion; when strongly placed in the chart's relationship-relevant houses, classical Vedic astrology notes it as something to consider in compatibility — nothing more.
                  </p>
                  <p className="text-sm text-foreground leading-relaxed mb-2">
                    What it is <em>not</em>: a sign of harm, a predictor of divorce, or a reason to avoid marriage. Countless Manglik individuals have long, fulfilling partnerships. The classical literature itself lists clear <strong>cancellation conditions (parihara)</strong> — and most modern astrologers treat Manglik as one factor among many, not a deciding verdict.
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    The dosha is also widely considered to reduce significantly after age 28, and many families place far less weight on it for later marriages.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-foreground mb-2">Your chart does not carry Mangal Dosha.</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    Mars is not placed in the houses (from Lagna, Moon, or Venus) that classical Vedic texts associate with Mangal Dosha. This is simply a neutral feature of your chart — no special action or consideration is needed on this front.
                  </p>
                </>
              )}
            </div>

            {/* Classical cancellations — always shown */}
            <div data-testid="manglik-cancellations" className="rounded-xl border border-border p-5">
              <div className="font-semibold text-foreground mb-2">Classical cancellations (Manglik parihara)</div>
              <p className="text-sm text-muted-foreground mb-3">
                Classical texts recognise several conditions that cancel or significantly reduce Mangal Dosha. These are part of the same tradition that defines the dosha — they're not workarounds, they're the tradition's own built-in balance:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                <li><strong className="text-foreground">Both partners Manglik</strong> — the most widely cited cancellation; when both charts carry the dosha, the effects are considered to balance out.</li>
                <li><strong className="text-foreground">Mars in its own or exalted sign</strong> — Mars in Aries, Scorpio, or Capricorn is treated as strong and well-placed; the dosha is significantly reduced or cancelled.</li>
                <li><strong className="text-foreground">Benefic aspects on Mars</strong> — Jupiter or Venus aspecting Mars in the chart is a classical modifier that reduces the dosha's weight.</li>
                <li><strong className="text-foreground">Age 28+</strong> — the dosha is widely considered to reduce after 28 and many astrologers regard it as largely neutralised by the early 30s.</li>
                <li><strong className="text-foreground">Mars in the 1st house in certain signs</strong> — e.g. Mars in Aries or Scorpio in the Lagna is often treated as cancelled by several schools.</li>
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                A full assessment of cancellations requires reading the complete chart — see <a href="/kundali" className="text-primary hover:underline">your full Kundali</a> or explore <a href="/kundali-match" className="text-primary hover:underline">Kundali matching</a> for a comprehensive compatibility view.
              </p>
            </div>

            {/* Methodology */}
            <div data-testid="manglik-methodology" className="rounded-xl border border-[#6E5AA6]/30 bg-[#6E5AA6]/40 p-4">
              <div className="font-semibold text-foreground mb-1">How this was worked out</div>
              <p className="text-sm text-foreground">
                Mars's house is computed from your birth data using the <TermTip id="ayanamsa">Lahiri ayanamsa (the traditional Indian sidereal calculation)</TermTip> and the classical six-house definition of Mangal Dosha, checked from Lagna, Moon, and Venus. This approach is cross-checked against ProKerala at 99–100% agreement. Treat it as a reliable classical indicator, not a fixed prediction.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Learn more at <a href="/how-it-works" className="text-primary hover:underline">How It Works</a> · <a href="/vedic-astrology" className="text-primary hover:underline">Vedic Astrology</a>.
              </p>
            </div>

            {/* Upay / remedies — optional, non-fear */}
            <div data-testid="manglik-upay" className="rounded-xl border border-border p-5">
              <div className="font-semibold text-foreground mb-1">Traditional upay (remedies) — optional, not required</div>
              <p className="text-sm text-muted-foreground mb-2">
                First, the honest part: <strong className="text-foreground">nothing here is necessary to "avoid harm"</strong> — Manglik is a chart pattern to be aware of in matching, not a threat to defend against. These are simply the customs some people find grounding as a reflection on Mars's themes of patience and directed energy.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                <li><strong className="text-foreground">Hanuman devotion on Tuesdays</strong> — Tuesdays belong to Mars (Mangalwar), and reciting the Hanuman Chalisa is a traditional Mars-balancing practice; take it or leave it as suits your beliefs.</li>
                <li><strong className="text-foreground">Patience and directed energy</strong> — working with Mars's own themes (discipline, courage, consistent effort) is the most-cited traditional "answer" to a strong Mars placement.</li>
                <li><strong className="text-foreground">Charity on Tuesdays</strong> — donating red lentils (masoor dal) or red cloth on a Tuesday is a classical Mars-related generosity practice, offered as optional custom.</li>
              </ul>
              <p className="mt-2 text-xs text-amber-700">Offered as tradition and reflection, not medical or legal advice — and never as something you must do out of fear.</p>
            </div>

            <p className="text-xs text-muted-foreground">
              Computed from Mars's real house position using the same <TermTip id="ayanamsa">Lahiri-ayanamsa engine</TermTip> as the rest of BornClock.
              See also: <a href="/kundali" className="text-primary hover:underline">Full Kundali</a> · <a href="/kundali-match" className="text-primary hover:underline">Kundali Match</a> · <a href="/vedic-astrology" className="text-primary hover:underline">Vedic Astrology</a> · <a href="/how-it-works" className="text-primary hover:underline">How It Works</a>.
            </p>
          </div>
        )}
      </section>
    </PajPage>
  );
}

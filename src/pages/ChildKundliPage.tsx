/**
 * Child (Bal) Kundli — Growth P2 (P2-2, GP2-CHILD-KUNDLI). A calm, parent-facing
 * reading composed from the shared /api/kundali response (childKundli.ts). Rule 7:
 * gentle tendencies not labels; the health section is wellbeing-only and points to
 * the paediatrician; name letters link to the baby-names tool.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { TrustStrip } from '@/components/paj/TrustStrip';
import { ClassicalRefs } from '@/components/vedic/ClassicalRefs';
import { buildChildKundli, type ChildKundli } from '@/lib/vedic/childKundli';

export default function ChildKundliPage() {
  const { profile, save } = useSavedProfile();
  const [result, setResult] = useState<ChildKundli | null>(null);
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
      const child = buildChildKundli(data);
      if (!child) throw new Error('unavailable');
      setResult(child);
    } catch { setFailed(true); } finally { setLoading(false); }
  };

  const initial = profile ? { dob: profile.dob, time: profile.time, city: profile.city } : undefined;
  const sections = result ? [result.temperament, result.learning, result.talents, result.favourablePeriods, result.doshas, result.health, result.support] : [];

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="child-kundli-page"
      seo={<SEO
        title="Child (Bal) Kundli — Temperament, Talents & Care | BornClock"
        description="A free, gentle Child (Bal) Kundli from your child's birth chart: temperament, learning strengths, natural talents, favourable periods, name sounds and calm wellbeing guidance."
        canonicalUrl="/child-kundli" ogType="website" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Child Kundli', edition: 'Temperament · Talents · Care' }}
      footer={{
        tagline: "A parent's gentle guide from your child's birth chart — computed, calm, never a verdict.",
        nav: [
          { label: 'Vedic Astrology', to: '/vedic-astrology' },
          { label: 'Kundali', to: '/kundali' },
          { label: 'Baby Names by Nakshatra', to: '/baby-names' },
          { label: 'How It Works', to: '/how-it-works' },
        ],
        note: '© 2026 BornClock · Vedic astrology, computed with care.',
      }}
    >
      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">Bal Kundli · for parents</span><h1>Your child's Kundli.</h1></div>
          <p>A gentle, parent-facing reading from your child's birth chart — their temperament, how they may learn, natural talents, favourable periods, the traditional name-starting sounds, and calm wellbeing guidance. Hints to understand your child, never a script for who they must become.</p>
        </div>
        <TrustStrip claim="Read from your child's real birth chart — their Moon, birth star and planetary placements. A gentle guide, never a verdict on your child's future or health." href="/how-it-works#vedic" />

        <div className="form-band" style={{ marginTop: 16 }}>
          <div><h3>Your child's birth details</h3><p className="small muted">Birth time and place give the most accurate reading.</p></div>
          <BirthDetailsForm
            initial={initial}
            submitLabel="Read my child's Kundli"
            loadingLabel="Calculating…"
            loading={loading}
            onSubmit={run}
            showSaveOption
            saveChecked={saveChecked}
            onSaveCheckedChange={setSaveChecked}
            testIdPrefix="child-kundli"
          />
        </div>
        {failed && <p className="subtle" style={{ marginTop: 12 }}>The service is temporarily unavailable. Please try again shortly.</p>}

        {result && (
          <div data-testid="child-kundli-result" className="mt-6 space-y-4">
            {sections.map(s => (
              <div key={s.title} className="rounded-xl border border-border p-5">
                <div className="font-semibold text-foreground mb-1">{s.title}</div>
                <p className="text-sm text-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}

            <div className="rounded-xl border border-[#6E5AA6]/30 p-5">
              <div className="font-semibold text-foreground mb-1">{result.nameLetters.title}</div>
              <p className="text-sm text-muted-foreground mb-2">{result.nameLetters.note}</p>
              {result.nameLetters.aksharas.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {result.nameLetters.aksharas.map(a => (
                    <span key={a} className="rounded-lg border border-border px-3 py-1 text-sm font-medium text-foreground">{a}</span>
                  ))}
                </div>
              )}
              <Link to="/baby-names" className="text-primary hover:underline text-sm">Find baby names for these sounds →</Link>
            </div>

            <p className="text-xs text-muted-foreground">{result.disclaimer}</p>
            <ClassicalRefs />
          </div>
        )}
      </section>
    </PajPage>
  );
}

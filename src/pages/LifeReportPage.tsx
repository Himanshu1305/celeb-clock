/**
 * Life-areas report — Growth P2 (P2-4/P2-5, GP2-LIFE-SECTIONS). Wealth,
 * education, foreign travel/settlement and health&wellbeing, each a graded
 * (strong/moderate/mild) reading built from the real chart. Rule 7 throughout;
 * health is strictly wellbeing framing and points to a doctor.
 */
import { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PajPage } from '@/components/central';
import { SEO } from '@/components/SEO';
import { BirthDetailsForm, type BirthDetails } from '@/components/BirthDetailsForm';
import { GradeLegend } from '@/components/vedic/TermTip';
import { ClassicalRefs } from '@/components/vedic/ClassicalRefs';
import { TrustStrip } from '@/components/paj/TrustStrip';
import { useSavedProfile } from '@/hooks/useSavedProfile';

interface AreaReading { key: string; label: string; grade: 'strong' | 'moderate' | 'mild'; lead: string; reason: string; meaning: string }

const gradeColor = (g: string) => g === 'strong' ? 'text-emerald-700' : g === 'moderate' ? 'text-[#6E5AA6]' : 'text-amber-600';

export default function LifeReportPage() {
  const { profile, save } = useSavedProfile();
  const location = useLocation();
  const autoRan = useRef(false);
  const [areas, setAreas] = useState<AreaReading[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [saveChecked, setSaveChecked] = useState(false);

  const run = async (d: BirthDetails) => {
    setLoading(true); setFailed(false); setAreas(null);
    if (saveChecked) save({ dob: d.dob, time: d.time, city: d.city });
    try {
      const [y, m, day] = d.dob.split('-'); const [h, min] = (d.time || '12:00').split(':');
      const p = new URLSearchParams({ y, m, d: day, h, min, lat: String(d.city.lat), lon: String(d.city.lon), tz: String(d.city.tz) });
      const res = await fetch(`/api/life-report?${p.toString()}`);
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      if (!data?.areas) throw new Error('unavailable');
      setAreas(data.areas as AreaReading[]);
    } catch { setFailed(true); } finally { setLoading(false); }
  };

  const carried = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const dob = sp.get('dob') || '', time = sp.get('time') || '', lat = sp.get('lat'), lon = sp.get('lon'), tz = sp.get('tz'), place = sp.get('place') || '';
    if (dob && time && lat != null && lon != null && tz != null) return { dob, time, city: { name: place, lat: +lat, lon: +lon, tz: +tz } } as BirthDetails;
    return null;
  }, [location.search]);
  useEffect(() => {
    if (autoRan.current || !carried) return;
    autoRan.current = true;
    void run(carried);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carried]);

  const initial = carried
    ? { dob: carried.dob, time: carried.time, city: carried.city }
    : profile ? { dob: profile.dob, time: profile.time, city: profile.city } : undefined;

  return (
    <PajPage
      theme="vedic"
      variant="editorial"
      testId="life-report-page"
      seo={<SEO
        title="Life Report (Vedic) — Wealth, Education, Foreign & Health | BornClock"
        description="A graded Vedic life report: wealth & finances, education & learning, foreign travel & settlement, and health & wellbeing — each read from your real chart, honestly."
        canonicalUrl="/life-report" ogType="website" />}
      breadcrumb={{ trail: [{ label: 'Vedic Astrology', to: '/vedic-astrology' }], current: 'Life Report', edition: 'Wealth · Education · Foreign · Health' }}
      footer={{
        tagline: 'Wealth, education, foreign and wellbeing readings from your real chart — graded, honest, computed.',
        nav: [
          { label: 'Vedic Astrology', to: '/vedic-astrology' },
          { label: 'Kundali', to: '/kundali' },
          { label: 'Career Report', to: '/career-report' },
          { label: "What's Ahead", to: '/kundali' },
          { label: 'How It Works', to: '/how-it-works' },
        ],
        note: '© 2026 BornClock · Vedic astrology, computed with care.',
      }}
    >
      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">Life areas · graded</span><h1>Your Vedic life report.</h1></div>
          <p>Four life areas read from your real birth chart — wealth & finances, education & learning, foreign travel & settlement, and health & wellbeing — each with a clear answer, the reason from your chart, and what it means. Every indication is graded strong, moderate or mild.</p>
        </div>
        <TrustStrip claim="Each area is read from the relevant house lords in your real chart and their classical strength — a graded indication, never a verdict." href="/how-it-works#vedic" />

        <div className="form-band" style={{ marginTop: 16 }}>
          <div><h3>Your birth details</h3><p className="small muted">We need the house lords and their strengths from your chart.</p></div>
          <BirthDetailsForm
            initial={initial}
            submitLabel="Read my life areas"
            loadingLabel="Calculating…"
            loading={loading}
            onSubmit={run}
            showSaveOption
            saveChecked={saveChecked}
            onSaveCheckedChange={setSaveChecked}
            testIdPrefix="life-report"
          />
        </div>
        {failed && <p className="subtle" style={{ marginTop: 12 }}>The service is temporarily unavailable. Please try again shortly.</p>}

        {areas && (
          <div data-testid="life-report-result" className="mt-6 space-y-4">
            {areas.map(a => (
              <div key={a.key} data-testid={`life-area-${a.key}`} className="rounded-xl border border-border p-5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-foreground">{a.label}</div>
                  <div className={`text-xs uppercase font-bold ${gradeColor(a.grade)}`}>{a.grade}</div>
                </div>
                <p className="text-sm text-foreground mt-1 font-medium">{a.lead}</p>
                <p className="text-sm text-muted-foreground mt-1">{a.reason}</p>
                <p className="text-sm text-foreground mt-2">{a.meaning}</p>
              </div>
            ))}
            <GradeLegend />
            <p className="text-xs text-muted-foreground">
              These are classical, graded indications attributed to Vedic astrology — decision-support, never guarantees. The health reading is wellbeing-only and never a diagnosis: for anything health-related, please see a qualified doctor.
            </p>
            <ClassicalRefs />
          </div>
        )}
      </section>
    </PajPage>
  );
}

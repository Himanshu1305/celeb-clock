import { useEffect, useState } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { ReportLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
// Audit S4: every value on this page comes from the SAME functions the paid report
// uses (BirthdayReportService / ReportView), so the sample can never contradict a
// real report for the same birth details.
import { getZodiacByDate } from '@/data/zodiacData';
import { getChineseZodiac } from '@/services/ChineseZodiacService';
import { VEDIC_SIGNS } from '@/services/VedicZodiacService';
import { RASHI_RATNA_DATA } from '@/data/rashiRatnaData';
import { getNakshatra } from '@/data/nakshatraData';
import { getLifePath } from '@/data/numerologyLifePathData';
import { lifePathWorking } from '@/lib/lifePath';
import { liveReportFigures, PERSONAL_YEAR_MEANINGS } from '@/services/BirthdayReportService';
import { getRankedBirthdayCelebrities } from '@/services/BirthdaySearchService';
import { SAMPLE_BIRTH, SAMPLE_VEDIC } from '@/data/sampleReport';

const DEMO_LABEL = 'January 15, 1990 · 6:30 am · New Delhi';

export function SampleReportPage() {
  const [y, m, d] = SAMPLE_BIRTH.dob.split('-').map(Number);
  const western = getZodiacByDate(m, d);
  const chinese = getChineseZodiac(new Date(SAMPLE_BIRTH.dob + 'T12:00:00'));
  const lp = lifePathWorking(d, m, y);
  const lpData = getLifePath(lp.number);
  const live = liveReportFigures(SAMPLE_BIRTH.dob);
  const pyMeaning = PERSONAL_YEAR_MEANINGS[live.personalYear];
  const rashi = VEDIC_SIGNS[SAMPLE_VEDIC.moonSignIndex];
  const lagna = VEDIC_SIGNS[SAMPLE_VEDIC.lagnaSignIndex];
  const nakshatra = getNakshatra(SAMPLE_VEDIC.nakshatraNumber);
  const rashiRatna = RASHI_RATNA_DATA.find(r => r.rashiEnglish === rashi.english) ?? null;

  // Same live celebrity query the report uses; the section hides if it returns nothing.
  const [celebs, setCelebs] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    getRankedBirthdayCelebrities(SAMPLE_BIRTH.dob.slice(5), null, 6)
      .then(r => { if (!cancelled && r?.length) setCelebs(r.map(c => c.name)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <ReportLayout
      theme="birthday"
      testId="sample-report-page"
      seo={(
        <SEO
          title="Sample Birthday Intelligence Report — Preview Before You Sign Up | BornClock"
          description="See a complete Birthday Intelligence Report before creating yours. Preview zodiac, life path, Vedic Rashi, lucky elements, and more."
          canonicalUrl="/birthday-report/sample"
          ogType="article"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Birthday Report', to: '/birthday-report/' }], current: 'Sample Report' }}
      footer={{
        tagline: 'A sample Birthday Intelligence Report — zodiac, numerology, Vedic Rashi and more.',
        nav: [
          { label: 'Birthday Report', to: '/birthday-report/' },
          { label: 'Results', to: '/results/' },
          { label: 'Celebrities', to: '/celebrity/' },
          { label: 'Privacy', to: '/privacy/' },
        ],
        note: '© 2026 BornClock.',
      }}
      eyebrow="Sample report"
      h1={`Birthday Profile: ${DEMO_LABEL}`}
      lead={<>A complete birthday intelligence snapshot — zodiac, numerology, Vedic Rashi and more.</>}
    >
      <div className="bg-white pb-32">
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* 1. Sample banner */}
          <section
            data-testid="sample-report-banner"
            className="flex flex-col sm:flex-row items-center justify-between gap-3
                       bg-gradient-to-r from-primary to-[#6E5AA6] text-white
                       rounded-2xl px-5 py-4 mb-8"
          >
            <p className="text-sm font-semibold">
              📋 Sample Report — This shows what YOUR report will look like
            </p>
            <Link
              to="/birthday-report/"
              className="flex-shrink-0 bg-white text-primary font-bold px-5 py-2 rounded-full
                         text-sm hover:bg-[#6E5AA6]/10 transition-colors whitespace-nowrap"
            >
              Generate Mine Free →
            </Link>
          </section>

          {/* Quick stats — computed today, exactly as the report does */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Age', value: `${live.age} yrs` },
              { label: 'Days Lived', value: live.daysSinceBirth.toLocaleString() },
              { label: 'Days to Next Birthday', value: String(live.daysUntilNextBirthday) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                <div className="text-xl font-black text-gray-900">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          {/* Western Zodiac */}
          {western && (
            <section className="mb-6 bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="text-lg font-black text-gray-900 mb-1">
                {western.unicode} Western Zodiac: {western.name}
              </h2>
              <div className="text-xs text-gray-500 mb-3">{western.dateRange} · {western.element} · {western.rulingPlanet}</div>
              <div className="flex flex-wrap gap-1">
                {western.coreTraits.slice(0, 5).map(t => (
                  <span key={t} className="bg-[#6E5AA6]/10 text-[#6E5AA6] text-xs px-2 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </section>
          )}

          {/* Vedic — Moon sign, Nakshatra, Lagna, Ratna (from the Kundali engine) */}
          <section data-testid="sample-vedic" className="mb-6 bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-lg font-black text-gray-900 mb-1">
              🕉 Vedic Rashi (Moon sign): {rashi.name} — {rashi.english}
            </h2>
            <div className="text-xs text-gray-500 mb-3">
              Ruled by {rashi.ruling_planet} · Nakshatra {nakshatra.name}, pada {SAMPLE_VEDIC.pada} · Lagna (Ascendant) {lagna.name} — {lagna.english}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">{rashi.description}</p>
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              {rashiRatna && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-gray-500 mb-0.5">Rashi Ratna (Moon-sign stone)</div>
                  <div className="font-semibold text-gray-900">{rashiRatna.primaryStone} ({rashiRatna.primaryStoneHindi})</div>
                </div>
              )}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="text-gray-500 mb-0.5">Vedic Ratna (from the birth chart)</div>
                <div className="font-semibold text-gray-900">{SAMPLE_VEDIC.gem.gem} ({SAMPLE_VEDIC.gem.hindi}) — {SAMPLE_VEDIC.gem.planet}, {SAMPLE_VEDIC.gem.role}</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Calculated for 6:30 am in New Delhi with the same engine as our Kundali (sidereal, Lahiri). Your report uses your own birth time and city; without a birth time it shows the Moon sign only when it is certain for the whole day. Consult a qualified astrologer before wearing any gemstone.
            </p>
          </section>

          {/* Chinese Zodiac */}
          <section className="mb-6 bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-lg font-black text-gray-900 mb-1">
              {chinese.emoji} Chinese Zodiac: {chinese.element} {chinese.animal}
              <span className="text-sm font-normal text-gray-500 ml-2">({chinese.yin_yang})</span>
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">{chinese.description}</p>
            <p className="text-xs text-gray-500 mt-2">Born before the Lunar New Year of {y}, so the sign belongs to the {chinese.year} lunar year.</p>
          </section>

          {/* Life Path + Personal Year */}
          <section className="mb-6 bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-[#0E2238] rounded-full flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
                {lp.number}
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">Life Path {lp.number}</h2>
                <div className="text-[#6E5AA6] font-semibold text-sm">{lpData.archetype}</div>
                <div className="text-xs text-gray-500">{lp.steps}</div>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">{lpData.personality.split('\n\n')[0]}</p>
            <p className="text-sm text-gray-600">
              <strong>Personal Year {live.personalYear} in {live.personalYearYear}: </strong>{pyMeaning?.title}
            </p>
          </section>

          {/* Celebrity twins — the same live list the report shows */}
          {celebs.length > 0 && (
            <section className="mb-6 bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <h2 className="text-lg font-black text-gray-900 mb-2">Famous people born on January 15</h2>
              <div className="flex flex-wrap gap-2">
                {celebs.map(n => (
                  <span key={n} className="bg-white border border-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-700">
                    {n}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Your report shows the best-known people in our database who share your exact birthday.
              </p>
            </section>
          )}

        </div>

        {/* 10. Bottom sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200
             p-4 text-center z-50 shadow-lg">
          <p className="text-sm text-gray-600 mb-2">
            This is a sample. Generate your personalised report — it's free.
          </p>
          <a href="/birthday-report/"
             className="inline-block bg-primary text-white font-bold px-8 py-3
                        rounded-full text-base hover:bg-primary/90">
            Generate My Free Birthday Report →
          </a>
        </div>
      </div>
    </ReportLayout>
  );
}

export default SampleReportPage;

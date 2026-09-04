import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import {
  calculateWesternZodiac, calculateLifePathNumber,
  calculateChineseZodiac, calculateVedicRashi,
  calculateAge, calculateDaysLived, calculateDaysUntilBirthday,
} from '@/utils/celebrityCalculations';
import {
  WESTERN_ZODIAC_PROFILES, VEDIC_RASHI_PROFILES,
  CHINESE_ZODIAC_PROFILES, LIFE_PATH_EXTENDED,
} from '@/data/astrologicalData';

// Hardcoded relatable demo DOB — January 15, 1990 (not Jan 1, which is a holiday).
const DEMO = { day: 15, month: 1, year: 1990 };
const DEMO_LABEL = 'January 15, 1990';

// Real celebrities born on January 15 (from indianCelebrities.ts).
const JAN_15_CELEBS = ['Mayawati', 'Anna Hazare', 'Lakshmi Mittal'];

export function SampleReportPage() {
  const western = calculateWesternZodiac(DEMO.day, DEMO.month);
  const vedic = calculateVedicRashi(DEMO.day, DEMO.month);
  const chinese = calculateChineseZodiac(DEMO.year);
  const lifePath = calculateLifePathNumber(DEMO.day, DEMO.month, DEMO.year);

  const zodiacProfile = WESTERN_ZODIAC_PROFILES[western.sign] ?? null;
  const rashiProfile = VEDIC_RASHI_PROFILES[vedic.rashi] ?? null;
  const chineseProfile = CHINESE_ZODIAC_PROFILES[chinese.animal] ?? null;
  const lpProfile = LIFE_PATH_EXTENDED[lifePath] ?? null;

  const age = calculateAge(DEMO.day, DEMO.month, DEMO.year);
  const daysLived = calculateDaysLived(DEMO.day, DEMO.month, DEMO.year);
  const daysUntil = calculateDaysUntilBirthday(DEMO.day, DEMO.month);

  return (
    <>
      <SEO
        title="Sample Birthday Intelligence Report — Preview Before You Sign Up | BornClock"
        description="See a complete Birthday Intelligence Report before creating yours. Preview zodiac, life path, Vedic Rashi, lucky elements, and more."
        canonicalUrl="/birthday-report/sample"
        ogType="article"
      />

      <main data-testid="sample-report-page" className="min-h-screen bg-white pb-32">
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* 1. Sample banner */}
          <section
            data-testid="sample-report-banner"
            className="flex flex-col sm:flex-row items-center justify-between gap-3
                       bg-gradient-to-r from-primary to-indigo-700 text-white
                       rounded-2xl px-5 py-4 mb-8"
          >
            <p className="text-sm font-semibold">
              📋 Sample Report — This shows what YOUR report will look like
            </p>
            <Link
              to="/birthday-report"
              className="flex-shrink-0 bg-white text-primary font-bold px-5 py-2 rounded-full
                         text-sm hover:bg-indigo-50 transition-colors whitespace-nowrap"
            >
              Generate Mine Free →
            </Link>
          </section>

          {/* 2. Profile header */}
          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary mb-2">
            Birthday Profile: {DEMO_LABEL}
          </h1>
          <p className="text-gray-500 mb-6">
            A complete birthday intelligence snapshot — zodiac, numerology, Vedic Rashi and more.
          </p>

          {/* 3. Quick stats row */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Age', value: `${age} yrs` },
              { label: 'Days Lived', value: daysLived.toLocaleString() },
              { label: 'Days to Next Birthday', value: String(daysUntil) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                <div className="text-xl font-black text-gray-900">{value}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>

          {/* 4. Lucky Elements Panel (from rashiProfile) */}
          {rashiProfile && (
            <section data-testid="sample-lucky-panel" className="mb-8 overflow-x-auto pb-1" aria-label="Lucky elements">
              <div className="flex gap-2 flex-wrap">
                {[
                  `🎨 Colour: ${rashiProfile.lucky_colors[0]}`,
                  `💎 Stone: ${rashiProfile.lucky_stone} (${rashiProfile.lucky_stone_hindi})`,
                  `📅 Day: ${rashiProfile.lucky_day}`,
                  `🔢 Number: ${rashiProfile.lucky_numbers.join(', ')}`,
                  `🧭 Direction: ${rashiProfile.lucky_direction}`,
                  `⚙️ Metal: ${rashiProfile.lucky_metal}`,
                  ...(zodiacProfile ? [`🃏 Tarot: ${zodiacProfile.tarot_card}`] : []),
                ].map(chip => (
                  <span key={chip} className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                                              rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
                    {chip}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* 5. Western Zodiac card */}
          {zodiacProfile && (
            <section className="mb-6 bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="text-lg font-black text-gray-900 mb-1">
                {western.symbol} Western Zodiac: {western.sign}
              </h2>
              <div className="text-xs text-gray-500 mb-3">{western.date_range} · {zodiacProfile.element} · {zodiacProfile.ruling_planet}</div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{zodiacProfile.personality_summary}</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-green-700 mb-1">Strengths</h3>
                  <div className="flex flex-wrap gap-1">
                    {zodiacProfile.strengths.map(s => (
                      <span key={s} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-red-700 mb-1">Challenges</h3>
                  <div className="flex flex-wrap gap-1">
                    {zodiacProfile.weaknesses.map(w => (
                      <span key={w} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">{w}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs">
                <strong className="text-indigo-800">🃏 Tarot Card: {zodiacProfile.tarot_card}</strong>
                <span className="text-indigo-700"> — {zodiacProfile.tarot_meaning}</span>
              </div>
            </section>
          )}

          {/* 6. Vedic Rashi card */}
          {rashiProfile && (
            <section className="mb-6 bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="text-lg font-black text-gray-900 mb-1">
                🕉 Vedic Rashi: {rashiProfile.rashi} ({rashiProfile.rashi_devanagari}) — {rashiProfile.western_equivalent}
              </h2>
              <div className="text-xs text-gray-500 mb-3">
                Lord: {rashiProfile.lord} ({rashiProfile.lord_devanagari}) · {rashiProfile.element} · {rashiProfile.quality}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
                {[
                  { label: 'Lucky Stone', value: `${rashiProfile.lucky_stone} (${rashiProfile.lucky_stone_hindi})` },
                  { label: 'Lucky Day', value: rashiProfile.lucky_day },
                  { label: 'Direction', value: rashiProfile.lucky_direction },
                  { label: 'Metal', value: rashiProfile.lucky_metal },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                    <div className="text-gray-400 mb-0.5">{label}</div>
                    <div className="font-semibold text-gray-900 leading-tight">{value}</div>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                <div className="text-xs font-bold text-amber-800 mb-0.5">🕉 Mantra</div>
                <div className="text-sm font-medium text-amber-900">{rashiProfile.mantra}</div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{rashiProfile.personality_summary}</p>
            </section>
          )}

          {/* 7. Chinese Zodiac card */}
          {chineseProfile && (
            <section className="mb-6 bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="text-lg font-black text-gray-900 mb-1">
                {chineseProfile.emoji} Chinese Zodiac: Year of the {chineseProfile.animal}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({chineseProfile.element_fixed} {chineseProfile.yin_yang})
                </span>
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{chineseProfile.personality_summary}</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-bold text-green-700">Lucky:</span> Numbers {chineseProfile.lucky_numbers.join(', ')} · Colours {chineseProfile.lucky_colors.join(', ')}
                </div>
                <div>
                  <span className="font-bold text-red-700">Unlucky:</span> Numbers {chineseProfile.unlucky_numbers.join(', ')} · Colours {chineseProfile.unlucky_colors.join(', ')}
                </div>
              </div>
            </section>
          )}

          {/* 8. Life Path card */}
          {lpProfile && (
            <section className="mb-6 bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
                  {lifePath}
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">Life Path {lifePath}</h2>
                  <div className="text-indigo-600 font-semibold text-sm">{lpProfile.title}</div>
                  <div className="text-xs text-gray-400">{lpProfile.ruling_planet} · {lpProfile.element}</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{lpProfile.traits}</p>
              <p className="text-sm text-gray-600 mb-1"><strong>Love: </strong>{lpProfile.love_style}</p>
              <p className="text-sm text-gray-600 mb-1"><strong>Career paths: </strong>{lpProfile.career_paths.join(', ')}.</p>
              <p className="text-sm text-indigo-700 italic"><strong>Spiritual lesson: </strong>{lpProfile.spiritual_lesson}</p>
            </section>
          )}

          {/* 9. Celebrity Twins teaser */}
          <section className="mb-6 bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <h2 className="text-lg font-black text-gray-900 mb-2">Famous people born on January 15</h2>
            <div className="flex flex-wrap gap-2">
              {JAN_15_CELEBS.map(n => (
                <span key={n} className="bg-white border border-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-700">
                  {n}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Your report shows everyone in our database who shares your exact birthday.
            </p>
          </section>

        </div>

        {/* 10. Bottom sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200
             p-4 text-center z-50 shadow-lg">
          <p className="text-sm text-gray-600 mb-2">
            This is a sample. Generate your personalised report — it's free.
          </p>
          <a href="/birthday-report"
             className="inline-block bg-primary text-white font-bold px-8 py-3
                        rounded-full text-base hover:bg-primary/90">
            Generate My Free Birthday Report →
          </a>
        </div>
      </main>
    </>
  );
}

export default SampleReportPage;

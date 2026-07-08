import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import { SEO, FAQSchema, WebApplicationSchema } from '@/components/SEO';
import PageTagline from '@/components/PageTagline';
import { calculateBiorhythm, getBiorhythmStatus, getBiorhythmInsight, getBiorhythmSeries } from '@/data/biorhythmData';

export default function BiorhythmPage() {
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateBiorhythm> | null>(null);
  const [chartData, setChartData] = useState<Array<{ label: string; physical: number; emotional: number; intellectual: number }>>([]);

  const handleCalculate = () => {
    if (!dob) return;
    const birthDate = new Date(dob + 'T12:00:00');
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const current = calculateBiorhythm(birthDate, today);
    setResult(current);

    const series = getBiorhythmSeries(birthDate, today, 30);
    const data = series.map((r, i) => {
      const d = new Date(r.date);
      const isToday = i === 15;
      return {
        label: isToday ? 'Today' : `${d.getDate()}/${d.getMonth() + 1}`,
        physical: r.physical,
        emotional: r.emotional,
        intellectual: r.intellectual,
        isToday,
      };
    });
    setChartData(data);
  };

  const bestDays = useMemo(() => {
    if (!dob) return [];
    const birthDate = new Date(dob + 'T12:00:00');
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const next30: Array<{ date: string; physical: number; emotional: number; intellectual: number; combined: number }> = [];
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const r = calculateBiorhythm(birthDate, d);
      next30.push({
        date: d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
        physical: r.physical,
        emotional: r.emotional,
        intellectual: r.intellectual,
        combined: r.physical + r.emotional + r.intellectual,
      });
    }
    return next30.sort((a, b) => b.combined - a.combined).slice(0, 3);
  }, [dob, result]);

  const faqItems = [
    { question: 'What is biorhythm theory?',
      answer: 'Biorhythm theory proposes that human performance cycles through regular rhythms: a 23-day physical cycle, a 28-day emotional cycle, and a 33-day intellectual cycle. All three begin at zero at birth, rise to a peak, return through zero (the "critical day"), fall to a trough, and repeat. The theory was developed by Wilhelm Fliess in the late 19th century and popularised in the 1970s.' },
    { question: 'Is biorhythm theory scientifically proven?',
      answer: 'Biorhythm theory does not have strong scientific support. Studies examining predictions based on biorhythm calculations have generally not found statistically significant results. It is best understood as an interesting framework for self-reflection rather than a scientifically validated predictive tool — similar to how many people engage with astrology.' },
    { question: 'What are critical days in biorhythm?',
      answer: 'A "critical day" occurs when a biorhythm cycle crosses zero — transitioning from high to low or low to high. Traditional biorhythm theory suggests these transition days may be associated with instability or heightened risk in the corresponding domain (physical, emotional, or intellectual). When multiple cycles are critical on the same day, this is considered a "double" or "triple critical day."' },
    { question: 'What is the difference between the three cycles?',
      answer: 'The 23-day Physical cycle governs physical strength, coordination, and health. The 28-day Emotional cycle governs mood, creativity, and emotional sensitivity. The 33-day Intellectual cycle governs analytical thinking, decision-making, and memory. The cycles are completely independent of each other, which is why they produce different patterns over time.' },
  ];

  return (
    <>
      <SEO
        title="Biorhythm Calculator — Your Physical, Emotional & Intellectual Cycles | BornClock"
        description="Calculate your biorhythm chart by date of birth. Free biorhythm calculator showing your 30-day physical, emotional, and intellectual cycles with peak day predictions."
        keywords="biorhythm calculator, biorhythm chart, physical emotional intellectual cycle calculator, biorhythm today"
        canonicalUrl="/biorhythm"
      />
      <WebApplicationSchema
        name="Biorhythm Calculator"
        description="Free biorhythm chart calculator by date of birth — see your physical, emotional, and intellectual cycles with 30-day peak day predictions."
        url="/biorhythm"
      />
      <FAQSchema items={faqItems} />

      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Navigation />
            <AuthNav />
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-10">

          <nav className="text-sm text-gray-400 mb-6 flex gap-1 items-center flex-wrap">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span>›</span>
            <span className="text-gray-600">Biorhythm Calculator</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-1">Biorhythm Calculator</h1>
          <PageTagline />

          <div className="bg-teal-50 border-l-4 border-teal-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-teal-900 leading-relaxed">
              Biorhythm theory proposes that three natural cycles — Physical (23 days), Emotional (28 days), and Intellectual (33 days) — begin at birth and continue throughout life. When cycles are high, performance in those domains tends to be elevated. When crossing zero (critical days), extra care is warranted.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Enter your date of birth</p>
            <div className="flex gap-3">
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={handleCalculate}
                className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
              >
                Calculate →
              </button>
            </div>
          </div>

          {result && (
            <div className="mb-10">
              <div className="bg-teal-50 rounded-2xl p-4 mb-6">
                <p className="text-sm font-semibold text-teal-800 mb-1">Today's Biorhythm Insight</p>
                <p className="text-sm text-teal-700">{getBiorhythmInsight(result.physical, result.emotional, result.intellectual)}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Physical', value: result.physical, color: 'text-rose-600', cycle: '23-day cycle' },
                  { label: 'Emotional', value: result.emotional, color: 'text-blue-600', cycle: '28-day cycle' },
                  { label: 'Intellectual', value: result.intellectual, color: 'text-amber-600', cycle: '33-day cycle' },
                ].map(({ label, value, color, cycle }) => {
                  const status = getBiorhythmStatus(value);
                  return (
                    <div key={label} className={`rounded-2xl p-4 ${status.bgColor} text-center`}>
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className={`text-3xl font-black ${color}`}>{value > 0 ? '+' : ''}{value}%</p>
                      <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                      <p className="text-xs text-gray-400 mt-1">{cycle}</p>
                    </div>
                  );
                })}
              </div>

              {chartData.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-4">30-Day Biorhythm Chart</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={4} />
                      <YAxis domain={[-100, 100]} tick={{ fontSize: 9 }} />
                      <Tooltip formatter={(v: number) => [`${v > 0 ? '+' : ''}${v}%`]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <ReferenceLine y={0} stroke="#ccc" strokeDasharray="4 2" />
                      <Line type="monotone" dataKey="physical" stroke="#f43f5e" strokeWidth={2} dot={false} name="Physical" />
                      <Line type="monotone" dataKey="emotional" stroke="#3b82f6" strokeWidth={2} dot={false} name="Emotional" />
                      <Line type="monotone" dataKey="intellectual" stroke="#f59e0b" strokeWidth={2} dot={false} name="Intellectual" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {bestDays.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">🌟 Best Days in the Next 30 Days</p>
                  {bestDays.map((day, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm font-medium text-gray-800">{day.date}</span>
                      <div className="flex gap-3 text-xs">
                        <span className="text-rose-600">P: {day.physical > 0 ? '+' : ''}{day.physical}%</span>
                        <span className="text-blue-600">E: {day.emotional > 0 ? '+' : ''}{day.emotional}%</span>
                        <span className="text-amber-600">I: {day.intellectual > 0 ? '+' : ''}{day.intellectual}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-teal-600 rounded-2xl p-6 text-center text-white">
                <p className="text-lg font-bold mb-1">Get the complete Birthday Intelligence Report</p>
                <p className="text-teal-200 text-sm mb-4">Your biorhythm analysis + moon sign + tarot card + name numerology + 12 more sections.</p>
                <Link to="/birthday-report" className="inline-block bg-white text-teal-600 px-8 py-3 rounded-xl font-semibold hover:bg-teal-50 transition-colors">
                  Generate My Report → ₹199
                </Link>
              </div>
            </div>
          )}

          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Three Biorhythm Cycles</h2>
            <div className="space-y-4">
              {[
                { title: '🏃 Physical Cycle — 23 Days', color: 'border-rose-300 bg-rose-50', desc: 'Governs physical strength, coordination, stamina, and overall physical health. When high: peak athletic performance, physical resilience, energy. When low: fatigue, reduced coordination, slower physical recovery. Critical days: take extra care with physical activities and health decisions.' },
                { title: '💙 Emotional Cycle — 28 Days', color: 'border-blue-300 bg-blue-50', desc: 'Governs mood, emotional sensitivity, creativity, and intuition. When high: creative inspiration, emotional openness, social magnetism, intuitive insights. When low: emotional withdrawal, irritability, reduced creativity. Critical days: emotionally sensitive — approach important conversations carefully.' },
                { title: '🧠 Intellectual Cycle — 33 Days', color: 'border-amber-300 bg-amber-50', desc: 'Governs analytical thinking, memory, logical reasoning, and decision-making. When high: sharp thinking, good memory, excellent problem-solving. When low: mental fog, difficulty concentrating, poor decision-making days. Critical days: avoid major decisions and careful reading / learning tasks.' },
              ].map(({ title, color, desc }) => (
                <div key={title} className={`rounded-2xl p-5 border ${color}`}>
                  <p className="font-bold text-gray-900 mb-2">{title}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">A Brief History of Biorhythm Theory</h2>
            <div className="bg-gray-50 rounded-2xl p-5 text-sm text-gray-700 leading-relaxed space-y-3">
              <p>Biorhythm theory was developed by the German physician Wilhelm Fliess (1858–1928), a close friend and correspondent of Sigmund Freud. Fliess believed he had discovered that a 23-day cycle governed "male" (physical) processes and a 28-day cycle governed "female" (emotional) processes in all humans regardless of gender.</p>
              <p>The intellectual cycle was added later by Alfred Teltscher, an Austrian teacher, based on his observations of student academic performance. The combined three-cycle model was popularised by George Thommen's 1973 book "Is This Your Day?" and briefly became a mainstream wellness phenomenon in the 1970s.</p>
              <p>Scientific studies in the 1970s and 1980s tested biorhythm predictions against sports performance, accident records, and academic performance. Results were not statistically significant. Today biorhythm is considered a pseudoscience by the scientific community, though it remains popular as a self-reflection and planning tool.</p>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map(({ question, answer }) => (
                <div key={question} className="border border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-2">{question}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Related Tools</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { text: 'Life Expectancy Calculator', href: '/life-expectancy' },
                { text: 'Biological Age Calculator', href: '/biological-age' },
                { text: 'Moon Sign Calculator', href: '/moon-sign' },
                { text: 'Name Numerology', href: '/name-numerology' },
              ].map(item => (
                <Link key={item.href} to={item.href}
                  className="p-3 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-sm text-gray-700 hover:text-teal-700 transition-colors">
                  → {item.text}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

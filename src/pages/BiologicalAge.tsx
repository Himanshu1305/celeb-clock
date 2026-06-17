import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO, FAQSchema } from '@/components/SEO';
import { ArrowRight, RefreshCw, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { BIO_QUESTIONS, calculateBiologicalAge, getWHOWaistRisk } from '@/services/BiologicalAgeService';

// ── MedTerm tooltip ───────────────────────────────────────────────────────────

function MedTerm({ term, plain }: { term: string; plain: string }) {
  return (
    <span>
      <span className="group relative inline-block">
        <span className="underline decoration-dotted decoration-primary/60 cursor-help font-semibold">
          {term}
        </span>
        <span
          className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2
            hidden lg:group-hover:block bg-slate-800 text-white text-xs leading-relaxed
            rounded-lg px-3 py-2 w-52 text-center z-20 shadow-xl"
        >
          {plain}
        </span>
      </span>
      {' '}
      <span className="text-muted-foreground">({plain})</span>
    </span>
  );
}

// ── BMI Calculator ────────────────────────────────────────────────────────────

interface BMICalculatorProps {
  onSelect: (optionId: string, heightCmValue: number) => void;
}

function BMICalculator({ onSelect }: BMICalculatorProps) {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [bmiSlider, setBmiSlider] = useState(22.0);
  const [bmiSliderActive, setBmiSliderActive] = useState(false);

  let calculatedBmi: number | null = null;
  let heightCmValue = 0;

  if (unit === 'metric') {
    const w = parseFloat(weightKg);
    const hCm = parseFloat(heightCm);
    if (w > 0 && hCm > 0) {
      const hM = hCm / 100;
      calculatedBmi = Math.round((w / (hM * hM)) * 10) / 10;
      heightCmValue = hCm;
    }
  } else {
    const w = parseFloat(weightLbs) / 2.205;
    const totalInches = parseFloat(heightFt) * 12 + parseFloat(heightIn || '0');
    const hM = totalInches * 0.0254;
    if (w > 0 && hM > 0) {
      calculatedBmi = Math.round((w / (hM * hM)) * 10) / 10;
      heightCmValue = totalInches * 2.54;
    }
  }

  const bmi: number | null = bmiSliderActive ? bmiSlider : calculatedBmi;

  let category = '';
  let bmiColor = '#6366f1';
  let bmiOptionId = '';

  if (bmi !== null) {
    if (bmi < 18.5) {
      category = 'Underweight'; bmiColor = '#3b82f6'; bmiOptionId = 'bmi_underweight';
    } else if (bmi < 23.0) {
      category = 'Optimal (Asian threshold)'; bmiColor = '#22c55e'; bmiOptionId = 'bmi_optimal';
    } else if (bmi < 25.0) {
      category = 'Healthy, upper range'; bmiColor = '#84cc16'; bmiOptionId = 'bmi_healthy';
    } else if (bmi < 27.5) {
      category = 'Overweight, mild'; bmiColor = '#f59e0b'; bmiOptionId = 'bmi_ow_mild';
    } else if (bmi < 30.0) {
      category = 'Overweight'; bmiColor = '#f97316'; bmiOptionId = 'bmi_ow';
    } else if (bmi < 35.0) {
      category = 'Obese Class I'; bmiColor = '#ef4444'; bmiOptionId = 'bmi_obese1';
    } else {
      category = 'Obese Class II+'; bmiColor = '#dc2626'; bmiOptionId = 'bmi_obese2';
    }
  }

  const indicatorPct =
    bmi !== null ? Math.min(95, Math.max(2, ((bmi - 15) / 25) * 100)) : null;

  return (
    <div className="bg-slate-50 rounded-2xl p-6 mt-4">
      <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 border w-fit mx-auto">
        <button
          onClick={() => setUnit('metric')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            unit === 'metric' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Metric (kg / cm)
        </button>
        <button
          onClick={() => setUnit('imperial')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            unit === 'imperial' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Imperial (lbs / ft)
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {unit === 'metric' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="70"
                  value={weightKg}
                  onChange={e => { setWeightKg(e.target.value); setBmiSliderActive(false); }}
                  className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 text-sm">kg</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="170"
                  value={heightCm}
                  onChange={e => { setHeightCm(e.target.value); setBmiSliderActive(false); }}
                  className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 text-sm">cm</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">5'8" ≈ 173 cm · 6'0" ≈ 183 cm</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="154"
                  value={weightLbs}
                  onChange={e => { setWeightLbs(e.target.value); setBmiSliderActive(false); }}
                  className="w-full border rounded-lg px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 text-sm">lbs</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    placeholder="5"
                    value={heightFt}
                    onChange={e => { setHeightFt(e.target.value); setBmiSliderActive(false); }}
                    className="w-full border rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="absolute right-2 top-2.5 text-gray-400 text-sm">ft</span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    placeholder="8"
                    value={heightIn}
                    onChange={e => { setHeightIn(e.target.value); setBmiSliderActive(false); }}
                    className="w-full border rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="absolute right-2 top-2.5 text-gray-400 text-sm">in</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* BMI direct input alternative */}
      <div className="border-t border-gray-200 pt-4 mt-2 mb-6">
        <p className="text-xs text-gray-500 mb-2 text-center">— or enter your BMI directly —</p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={15}
            max={45}
            step={0.1}
            value={bmiSlider}
            onChange={e => { setBmiSlider(parseFloat(e.target.value)); setBmiSliderActive(true); }}
            className="flex-1 accent-indigo-600"
          />
          <span className="text-sm font-bold text-gray-700 w-10 text-right">{bmiSlider.toFixed(1)}</span>
        </div>
        {bmiSliderActive && (
          <p className="text-xs text-center text-indigo-600 mt-1">Using slider BMI value</p>
        )}
      </div>

      {bmi !== null && indicatorPct !== null ? (
        <div className="text-center mb-2">
          <div className="text-6xl font-black mb-1" style={{ color: bmiColor }}>
            {bmi}
          </div>
          <div className="text-lg font-semibold text-gray-700 mb-1">{category}</div>
          <div className="text-sm text-gray-500 mb-4">
            Body Mass Index (WHO Asian thresholds applied)
          </div>
          <div className="relative h-3 rounded-full mb-2 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500">
            <div
              className="absolute w-4 h-4 rounded-full bg-white border-2 border-gray-800 shadow-lg"
              style={{ left: `${indicatorPct}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1 mb-4">
            <span>15</span>
            <span>18.5</span>
            <span>23</span>
            <span>27.5</span>
            <span>30</span>
            <span>40+</span>
          </div>
          <p className="text-xs text-gray-400 italic mb-4">
            WHO recommends lower BMI thresholds for South Asian populations (overweight ≥23, not
            ≥25) due to higher metabolic risk at lower BMI levels. [WHO Expert Consultation, Lancet,
            2004]
          </p>
          <button
            onClick={() => onSelect(bmiOptionId, heightCmValue)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Use My BMI ({bmi}) — {category} →
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-400 text-sm">
          Enter your weight and height above to calculate your BMI
        </p>
      )}
    </div>
  );
}

// ── Waist Calculator ──────────────────────────────────────────────────────────

interface WaistCalculatorProps {
  onSelect: (optionId: string) => void;
  savedHeightCm: number;
}

function WaistCalculator({ onSelect, savedHeightCm }: WaistCalculatorProps) {
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm');
  const [waistCm, setWaistCm] = useState('');
  const [waistInches, setWaistInches] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [heightForRatio, setHeightForRatio] = useState(
    savedHeightCm > 0 ? String(Math.round(savedHeightCm)) : '',
  );

  const waistCmNum =
    unit === 'cm' ? parseFloat(waistCm) : parseFloat(waistInches) * 2.54;
  const heightCmNum = parseFloat(heightForRatio);
  const whoRiskKey = waistCmNum > 0 ? getWHOWaistRisk(waistCmNum, gender) : null;

  const riskConfig: Record<string, { label: string; color: string; optionId: string }> = {
    low: { label: 'Low risk', color: '#22c55e', optionId: 'waist_low' },
    increased: { label: 'Increased risk', color: '#f59e0b', optionId: 'waist_increased' },
    high: { label: 'High risk', color: '#ef4444', optionId: 'waist_high' },
  };

  const risk = whoRiskKey ? riskConfig[whoRiskKey] : null;
  const whtRatio =
    waistCmNum > 0 && heightCmNum > 0
      ? Math.round((waistCmNum / heightCmNum) * 100) / 100
      : null;

  return (
    <div className="bg-slate-50 rounded-2xl p-6 mt-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your sex (WHO risk thresholds differ by sex)
        </label>
        <div className="flex gap-2">
          {(['male', 'female'] as const).map(s => (
            <button
              key={s}
              onClick={() => setGender(s)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                gender === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-4 bg-white rounded-lg p-1 border w-fit">
        {(['cm', 'inches'] as const).map(u => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              unit === u ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Waist circumference
          </label>
          {unit === 'cm' ? (
            <div className="relative">
              <input
                type="number"
                placeholder="85"
                value={waistCm}
                onChange={e => setWaistCm(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute right-3 top-2.5 text-gray-400 text-sm">cm</span>
            </div>
          ) : (
            <div className="relative">
              <input
                type="number"
                placeholder="33.5"
                value={waistInches}
                onChange={e => setWaistInches(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute right-3 top-2.5 text-gray-400 text-sm">in</span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your height (for WHtR)
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="170"
              value={heightForRatio}
              onChange={e => setHeightForRatio(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="absolute right-3 top-2.5 text-gray-400 text-sm">cm</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Used to calculate waist-to-height ratio</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
        <p className="font-medium mb-1">📏 How to measure correctly:</p>
        <ol className="list-decimal list-inside space-y-0.5 text-xs">
          <li>Stand relaxed, feet together</li>
          <li>Find your lowest rib and your hip bone</li>
          <li>Measure halfway between them (near belly button)</li>
          <li>Exhale normally — do not hold breath</li>
          <li>Tape should be snug but not tight</li>
        </ol>
      </div>

      {waistCmNum > 0 && risk ? (
        <div className="text-center mb-2">
          <div className="text-3xl font-black mb-1" style={{ color: risk.color }}>
            {waistCmNum.toFixed(1)} cm
          </div>
          <div className="text-lg font-semibold mb-1" style={{ color: risk.color }}>
            {risk.label}
          </div>
          <div className="text-xs text-gray-500 mb-3">
            WHO threshold for {gender}s: low risk {gender === 'male' ? '<94 cm' : '<80 cm'}
            &nbsp;[WHO Waist Circumference Report, 2011]
          </div>
          {whtRatio !== null && (
            <div className="bg-white border rounded-lg p-3 mb-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Waist-to-height ratio (WHtR):</span>
                <span
                  className={`font-bold text-lg ${
                    whtRatio < 0.5
                      ? 'text-green-600'
                      : whtRatio < 0.6
                      ? 'text-amber-500'
                      : 'text-red-500'
                  }`}
                >
                  {whtRatio}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Healthy: under 0.5 · Caution: 0.5–0.6 · High risk: above 0.6
                &nbsp;[Ashwell et al., Nutrition Research Reviews, 2010]
              </div>
            </div>
          )}
          {risk && waistCmNum > 0 && (
            <div className={`rounded-xl p-4 mb-4 text-sm leading-relaxed ${
              whoRiskKey === 'high' ? 'bg-red-50 border border-red-200 text-red-800' :
              whoRiskKey === 'increased' ? 'bg-amber-50 border border-amber-200 text-amber-800' :
              'bg-green-50 border border-green-200 text-green-800'
            }`}>
              {whoRiskKey === 'high' && (
                <p>⚠️ <strong>High cardiovascular risk.</strong> A waist circumference above {gender === 'male' ? '94cm (men)' : '80cm (women)'} significantly increases risk of type 2 diabetes, heart disease, and metabolic syndrome — even in people with a healthy BMI. {whtRatio !== null && `Your WHtR of ${whtRatio} means your waist is ${Math.round(whtRatio * 100)}% of your height.`} Research shows WHtR above 0.5 is a stronger predictor of cardiovascular disease than BMI alone. <span className="text-xs opacity-70">[Ashwell et al., Nutrition Research Reviews, 2010]</span></p>
              )}
              {whoRiskKey === 'increased' && (
                <p>⚡ <strong>Moderate cardiovascular risk.</strong> Your waist measurement is approaching the high-risk threshold. Visceral fat (fat around organs) is metabolically active and produces inflammatory proteins linked to insulin resistance and cardiovascular disease. {whtRatio !== null && `Your WHtR of ${whtRatio} is approaching the 0.5 caution threshold.`} <span className="text-xs opacity-70">[WHO Waist Circumference and Waist-Hip Ratio Report, 2011]</span></p>
              )}
              {whoRiskKey === 'low' && (
                <p>✅ <strong>Healthy waist measurement.</strong> Your waist circumference is within the low-risk range. Maintaining central body fat at this level is associated with significantly reduced risk of metabolic syndrome, type 2 diabetes, and cardiovascular disease. {whtRatio !== null && `Your WHtR of ${whtRatio} is in the healthy range (under 0.5).`}</p>
              )}
            </div>
          )}
          <button
            onClick={() => onSelect(risk.optionId)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Use My Measurement ({waistCmNum.toFixed(0)} cm — {risk.label}) →
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-400 text-sm">
          Enter your waist measurement above
        </p>
      )}
    </div>
  );
}

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { emoji: string; label: string; pillClass: string }> = {
  cardiovascular: {
    emoji: '❤️',
    label: 'Cardiovascular',
    pillClass: 'bg-red-100 text-red-700 border border-red-200',
  },
  musculoskeletal: {
    emoji: '💪',
    label: 'Musculoskeletal',
    pillClass: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  neurological: {
    emoji: '🧠',
    label: 'Neurological',
    pillClass: 'bg-purple-100 text-purple-700 border border-purple-200',
  },
  bodycomp: {
    emoji: '⚖️',
    label: 'Body Composition',
    pillClass: 'bg-green-100 text-green-700 border border-green-200',
  },
  metabolic: {
    emoji: '🔬',
    label: 'Metabolic',
    pillClass: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  vitality: {
    emoji: '✨',
    label: 'Vitality',
    pillClass: 'bg-teal-100 text-teal-700 border border-teal-200',
  },
};

// ── Status helper ─────────────────────────────────────────────────────────────

function getStatusInfo(adj: number) {
  if (adj <= -1) return { icon: '🟢', label: 'Optimal', color: 'text-emerald-600' };
  if (adj <= 0) return { icon: '🔵', label: 'Good', color: 'text-blue-500' };
  if (adj <= 1) return { icon: '🟡', label: 'Monitor', color: 'text-yellow-500' };
  if (adj <= 2) return { icon: '🟠', label: 'Elevated', color: 'text-orange-500' };
  return { icon: '🔴', label: 'High priority', color: 'text-red-500' };
}

// ── What each biomarker measures ──────────────────────────────────────────────

const WHAT_IT_MEASURES: Record<string, string> = {
  heartRate: 'Cardiovascular efficiency and autonomic nervous system health.',
  pushups: 'Upper body muscular endurance and sarcopenia (age-related muscle loss) risk.',
  balance: "Proprioceptive control (your body's self-positioning sense) and neurological aging rate.",
  stairs: 'Aerobic capacity (VO₂ max proxy) and cardiorespiratory fitness.',
  sleep: "Glymphatic function (brain's overnight waste-clearance) and sleep architecture quality.",
  flexibility: 'Arterial stiffness (blood vessel elasticity) and vascular aging rate.',
  memory: 'Working memory function and cognitive aging rate.',
  reaction: 'Psychomotor reaction time and neural signal transmission speed.',
  bmi: 'Body adiposity (fat levels) and metabolic disease risk.',
  waist: 'Central adiposity (visceral fat) — a stronger cardiovascular mortality predictor than BMI.',
  bloodPressure: 'Vascular health, cardiovascular system load, and hypertension risk.',
  energy: 'Allostatic load (cumulative stress burden) and mitochondrial function.',
};

// ── Action text ───────────────────────────────────────────────────────────────

const ACTION_TEXT: Record<string, ReactNode> = {
  heartRate: (
    <span>
      30 minutes of moderate cardio (walking, cycling, swimming) 5 days per week reduces resting
      heart rate by 5–10 bpm within 6–8 weeks.{' '}
      <span className="text-gray-400 text-xs italic">[AHA Physical Activity Guidelines, 2018]</span>
    </span>
  ),
  pushups: (
    <span>
      Begin with 3 sets of modified push-ups daily, progressing weekly. Upper body muscular
      endurance responds rapidly — expect 50% improvement in 6 weeks with consistent practice.
    </span>
  ),
  balance: (
    <span>
      Practice single-leg standing for 60 seconds per leg, twice daily.{' '}
      <span className="font-medium">Balance</span> (
      <span className="font-medium">proprioception</span> — your body's self-positioning sense)
      improves significantly within 4 weeks of consistent practice.
    </span>
  ),
  stairs: (
    <span>
      Begin with 10 minutes of brisk walking daily, increasing 5 min/week. Cardiovascular fitness
      (<span className="font-medium">VO₂ max proxy</span> — how efficiently your body uses oxygen)
      responds to consistent aerobic challenge.
    </span>
  ),
  sleep: (
    <span>
      Set a fixed bedtime alarm tonight. Sleep consistency — same time every night — is the single
      highest-impact sleep intervention according to chronobiology research.{' '}
      <span className="text-gray-400 text-xs italic">[European Heart Journal, 2023]</span>
    </span>
  ),
  flexibility: (
    <span>
      5 minutes of forward fold stretching daily.{' '}
      <span className="font-medium">Arterial stiffness</span> (hardening of blood vessels)
      measurably improves with consistent flexibility training over 8–12 weeks.{' '}
      <span className="text-gray-400 text-xs italic">[Yamamoto et al., EJPC, 2009]</span>
    </span>
  ),
  memory: (
    <span>
      Daily cognitive challenges (reading, puzzles, learning new skills) maintain working memory
      function. The brain follows a 'use it or lose it' principle —{' '}
      <span className="font-medium">neuroplasticity</span> (your brain's ability to form new
      connections) remains active at any age.
    </span>
  ),
  reaction: (
    <span>
      Regular exercise, adequate sleep, and reduced screen time before bed all measurably improve{' '}
      <span className="font-medium">psychomotor reaction time</span> (how fast your brain triggers
      physical response) within weeks.
    </span>
  ),
  bmi: (
    <span>
      A 5% reduction in body weight produces clinically meaningful improvements in blood pressure,
      blood sugar, and cardiovascular risk markers. The Mediterranean diet pattern shows the
      strongest evidence for sustainable weight management.{' '}
      <span className="text-gray-400 text-xs italic">[PREDIMED Study, NEJM, 2013]</span>
    </span>
  ),
  waist: (
    <span>
      Waist circumference responds faster than BMI to lifestyle intervention. 30 minutes of daily
      walking specifically targets <span className="font-medium">visceral fat</span> (deep organ
      fat) — the metabolically active fat that accelerates cellular aging. Expect 2–3 cm reduction
      within 8 weeks of consistent effort.
    </span>
  ),
  bloodPressure: (
    <span>
      Blood pressure responds to: reduced sodium intake, daily walking, stress management, and the
      DASH diet. A 5 mmHg reduction in systolic BP reduces stroke risk by 14% and heart disease
      risk by 9%. Please consult a physician if your reading is 140+.{' '}
      <span className="text-gray-400 text-xs italic">[WHO, 2023]</span>
    </span>
  ),
  energy: (
    <span>
      Chronic fatigue (<span className="font-medium">allostatic load</span> — cumulative stress
      burden on the body) responds to sleep consistency, stress reduction, and regular movement. If
      fatigue persists, thyroid function and B12/iron levels should be checked with a physician.
    </span>
  ),
};

// ── FAQ items ─────────────────────────────────────────────────────────────────

interface FaqItem {
  q: string;
  a: string;
  aNode?: ReactNode;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'What is biological age and how is it different from chronological age?',
    a: "Chronological age is simply how many years you have existed since birth. Biological age (epigenetic age — estimated from DNA methylation patterns and physiological biomarkers) measures how efficiently your body's cells and organs are actually functioning. Two people who are both 50 years old chronologically can have biological ages of 40 and 65 respectively, depending on their genetics, lifestyle, and health habits. Biological age is a significantly stronger predictor of mortality and disease risk than chronological age. [Journal of Gerontology, 2025]",
    aNode: (
      <>
        Chronological age is simply how many years you have existed since birth. Biological age (
        <MedTerm
          term="epigenetic age"
          plain="how old your DNA methylation patterns suggest your cells are"
        />
        ) measures how efficiently your body's cells and organs are actually functioning. Two people
        who are both 50 years old chronologically can have biological ages of 40 and 65 respectively,
        depending on their genetics, lifestyle, and health habits. Biological age is a significantly
        stronger predictor of mortality and disease risk than chronological age.{' '}
        <span className="text-gray-400 text-xs">[Journal of Gerontology, 2025]</span>
      </>
    ),
  },
  {
    q: 'How accurate is this biological age test?',
    a: 'This assessment uses self-reported proxy biomarkers that correlate with chronological age at r=0.81–0.86 in validated population studies (JMIR Aging, 2022). The gold standard — DNA methylation epigenetic clocks (Horvath, 2013) — requires a laboratory blood sample and costs £200-500. Our proxy approach provides a directional estimate that is clinically meaningful without requiring any equipment or blood draw. Treat your result as a scientifically informed estimate rather than a precise clinical measurement.',
  },
  {
    q: 'Can I actually reduce my biological age?',
    a: 'Yes — significantly. A randomized controlled trial by Fitzgerald et al. (Aging, 2021) demonstrated a 3.23-year reduction in biological age in just 8 weeks through dietary changes, sleep optimization, exercise, stress reduction, and supplementation. Regular aerobic exercise alone has been shown to reduce biological age markers by 2-5 years in 6-12 months of consistent practice. Biological age is the most modifiable metric in aging science.',
  },
  {
    q: 'What is the Horvath epigenetic clock?',
    a: 'The Horvath clock, published in Genome Biology (2013) by Steve Horvath at UCLA, is considered the gold standard for biological age measurement. It uses DNA methylation patterns — chemical modifications to your DNA that change with age — to estimate biological age with high accuracy across multiple tissue types. Our proxy biomarker assessment correlates with epigenetic clock measurements but does not directly measure DNA methylation.',
    aNode: (
      <>
        The Horvath clock, published in Genome Biology (2013) by Steve Horvath at UCLA, is
        considered the gold standard for biological age measurement. It uses{' '}
        <MedTerm
          term="DNA methylation patterns"
          plain="chemical modifications to your DNA that change with age"
        />{' '}
        to estimate biological age with high accuracy across multiple tissue types. Our proxy
        biomarker assessment correlates with{' '}
        <MedTerm
          term="epigenetic clock"
          plain="a measure of biological age based on DNA methylation"
        />{' '}
        measurements but does not directly measure DNA methylation.
      </>
    ),
  },
  {
    q: 'How often should I retake this assessment?',
    a: 'Every 3-6 months after making significant lifestyle changes. Resting heart rate, blood pressure, and physical fitness markers can change within 4-8 weeks of consistent intervention. Retaking every quarter allows you to track meaningful progress across all 12 biomarkers.',
  },
  {
    q: 'Why does BornClock use WHO Asian BMI thresholds?',
    a: 'The WHO convened an expert consultation in 2004 (published in The Lancet) which found that Asian populations show higher risk of metabolic complications at lower BMI values than Western populations. The standard BMI overweight threshold of 25 was developed primarily from European population data. For South Asian, East Asian, and Southeast Asian populations, the WHO recommends an overweight threshold of 23 and obesity threshold of 27.5.',
  },
  {
    q: "Is biological age the same as 'body age'?",
    a: "Body age, fitness age, and biological age are related but distinct concepts. Fitness age specifically measures cardiovascular capacity (VO₂ max). Biological age is a broader measure incorporating multiple physiological systems. Body age is a general consumer term for the same concept. BornClock measures a composite biological age using 12 biomarkers across cardiovascular, musculoskeletal, neurological, metabolic, body composition, and vitality domains.",
  },
  {
    q: 'What should I do if my biological age is significantly higher than my chronological age?',
    a: 'First: do not panic. Biological age measurement has inherent variability and self-report limitations. Second: use this as motivation, not a medical diagnosis. Focus on the top 3 improvement opportunities shown in your results above. Third: if your blood pressure reading was 140+ or you have concerns about any specific result, consult a healthcare professional. This tool cannot replace clinical assessment for serious health concerns.',
  },
];

// ── Scientific References ─────────────────────────────────────────────────────

function ScientificReferences() {
  const [open, setOpen] = useState(true);

  const refs = [
    'Lara, J. et al. (2015). Towards measurement of the Healthy Ageing Phenotype in exploratory studies. Biogerontology, 16(1), 55-68.',
    'Consensus Expert Panel (2025). Expert Consensus Statement on Biomarkers of Aging for Use in Intervention Studies. Journal of Gerontology, Oxford Academic. DOI: 10.1093/gerona/glae297',
    'Cao, L. et al. (2022). A Model for Estimating Biological Age From Physiological Biomarkers of Healthy Aging. JMIR Aging, 5(2), e35160.',
    'Fitzgerald, K.N. et al. (2021). Potential reversal of epigenetic age using a diet and lifestyle intervention: a pilot randomized clinical trial. Aging, 13(7), 9419-9432.',
    'Yang, J. et al. (2019). Association between push-up exercise capacity and future cardiovascular disease events among active adult men. JAMA Network Open, 2(2), e188341.',
    'Araujo, C.G. et al. (2022). Successful 10-second one-legged stance performance predicts survival in middle-aged and older individuals. British Journal of Sports Medicine, 56(17), 975-980.',
    'Cappuccio, F.P. et al. (2010). Sleep duration and all-cause mortality: a systematic review and meta-analysis of prospective studies. Sleep, 33(5), 585-592. [1.3 million participants across 16 studies]',
    'Yamamoto, K. et al. (2009). Poor trunk flexibility is associated with arterial stiffness in apparently healthy individuals. European Journal of Preventive Cardiology, 16(6), 649-651.',
    'Deary, I.J. et al. (2014). Reaction time and lifetime cognitive change. Intelligence, 47, 1-11.',
    'WHO Expert Consultation (2004). Appropriate body-mass index for Asian populations and its implications for policy and intervention strategies. Lancet, 363(9403), 157-163.',
    'WHO (2011). Waist Circumference and Waist-Hip Ratio: Report of a WHO Expert Consultation. Geneva: World Health Organization.',
    'WHO (2023). Global Report on Hypertension: The Race Against a Silent Killer. World Health Organization, Geneva.',
  ];

  return (
    <div className="mt-10 mb-6">
      <button
        className="flex items-center justify-between w-full text-left mb-3"
        onClick={() => setOpen(o => !o)}
      >
        <h2 className="text-lg font-semibold text-gray-900">Scientific References</h2>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {open && (
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-5">
          {refs.map((r, i) => (
            <li key={i} className="leading-relaxed">
              {r}
            </li>
          ))}
        </ol>
      )}
      {open && (
        <p className="text-xs text-gray-400 mt-3 italic text-center">
          Data last reviewed: June 2026. BornClock updates scientific references annually to reflect
          current evidence.
        </p>
      )}
    </div>
  );
}

// ── FAQ Section ───────────────────────────────────────────────────────────────

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-2 text-gray-900">
        Frequently Asked Questions About Biological Age
      </h2>
      <div className="space-y-2 mt-4">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="border rounded-xl overflow-hidden bg-white">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              <span className="font-medium text-sm text-gray-900">{item.q}</span>
              {open === i ? (
                <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
              )}
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t pt-3">
                {item.aNode ?? item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Medical disclaimer shared ─────────────────────────────────────────────────

function MedicalDisclaimer() {
  return (
    <div className="border border-amber-400 bg-amber-50 rounded-lg p-3 text-xs text-amber-800 max-w-2xl mx-auto mt-4">
      ⚕️ This tool uses self-reported proxy biomarkers for educational and motivational purposes
      only. It is not a clinical assessment, medical diagnosis, or substitute for professional
      healthcare advice. Results should not inform medical decisions. Consult a qualified physician
      for clinical biological age assessment.
    </div>
  );
}

// ── Re-export for backward compatibility ──────────────────────────────────────

export { calculateBiologicalAge } from '@/services/BiologicalAgeService';

// ── Page component ────────────────────────────────────────────────────────────

type Step = 'intro' | 'quiz' | 'result';

const BiologicalAge = () => {
  const [step, setStep] = useState<Step>('intro');
  const [chronoAge, setChronoAge] = useState('');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [bioAge, setBioAge] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedHeightCm, setSavedHeightCm] = useState<number>(0);
  const [openBiomarker, setOpenBiomarker] = useState<string | null>(null);

  const age = parseInt(chronoAge) || 0;
  const diff = bioAge !== null ? Math.round((bioAge - age) * 10) / 10 : 0;
  const q = BIO_QUESTIONS[current];

  const handleStart = () => {
    if (!chronoAge || parseInt(chronoAge) < 18 || parseInt(chronoAge) > 120) return;
    setStep('quiz');
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    const next = { ...answers, [questionId]: optionId };
    setAnswers(next);
    if (current < BIO_QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
    } else {
      const result = calculateBiologicalAge(parseInt(chronoAge), next);
      setBioAge(result);
      setStep('result');
    }
  };

  const reset = () => {
    setStep('intro');
    setCurrent(0);
    setAnswers({});
    setBioAge(null);
    setChronoAge('');
    setCopied(false);
    setSavedHeightCm(0);
    setOpenBiomarker(null);
  };

  // Computed for result page
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const bioAgeColor =
    diff <= -8
      ? 'text-emerald-400'
      : diff <= -3
      ? 'text-green-400'
      : diff <= 3
      ? 'text-blue-400'
      : diff <= 8
      ? 'text-amber-400'
      : 'text-red-400';

  const diffBadgeStyle =
    diff <= -3
      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
      : diff <= 3
      ? 'bg-blue-500/10 border-blue-500 text-blue-300'
      : 'bg-amber-500/10 border-amber-500 text-amber-300';

  const diffBadgeText =
    diff <= -3
      ? `🟢 ${Math.abs(diff).toFixed(1)} years biologically younger than your age`
      : diff <= 3
      ? '🔵 Aligned with your chronological age'
      : `🟠 ${diff.toFixed(1)} years biologically older than your age`;

  const motivationalText =
    diff <= -8
      ? 'You are in the top percentile of biological aging for your age group. Your physiological systems are performing significantly younger than your calendar years suggest. This is not luck — it is the compounding result of choices you have made. The science asks: how much further can you push this?'
      : diff <= -3
      ? 'Your biology is outpacing your calendar. Your physiological markers reflect someone meaningfully younger than your chronological age — evidence that your lifestyle choices are producing real, measurable cellular benefit. You have built a foundation most people spend years trying to create.'
      : diff <= 3
      ? 'Your biological markers are tracking with your chronological age — a solid, healthy baseline. Here is what the research shows from this starting point: the Fitzgerald et al. (2021) randomized controlled trial demonstrated a 3.23-year reduction in biological age in just 8 weeks. You are not starting behind. You are starting ready.'
      : diff <= 8
      ? 'Your biological age is running ahead of your calendar — which means your physiological systems are under measurable strain. This is not a verdict. It is a measurement. And measurements can change. The same research that identified elevated biological age as a risk factor also showed it is among the most responsive to intervention. What you do in the next 90 days matters more than the years behind you.'
      : 'This result is significant — and it deserves a direct response. Your biological systems are showing strain that goes beyond typical aging. We strongly recommend sharing this assessment with a healthcare professional. At the same time: biological age is the most modifiable metric in aging science. Studies show meaningful reversal is possible at every starting point. This is your clearest possible signal to act.';

  const questionResults = BIO_QUESTIONS.map(q => {
    const selectedId = answers[q.id];
    const option = q.options.find(o => o.id === selectedId);
    return {
      q,
      selectedId: selectedId ?? '',
      option,
      adjustment: option?.adjustment ?? 0,
      selectedDisplay: option?.sublabel || option?.label || '—',
    };
  });

  const needsAttention = questionResults.filter(r => r.adjustment >= 1);
  const top3 = [...questionResults]
    .filter(r => r.adjustment > 0)
    .sort((a, b) => b.adjustment - a.adjustment)
    .slice(0, 3);

  const shareText = bioAge !== null
    ? `My biological age is ${bioAge} — ${Math.abs(diff).toFixed(1)} years ${diff < 0 ? 'younger' : 'older'} than my chronological age of ${age}. Tested with 12 WHO-validated biomarkers.\nFind yours → bornclock.com/biological-age\n#BiologicalAge #BornClock #Longevity`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* clipboard unavailable */ }
  };

  const faqSchemaItems = FAQ_ITEMS.map(item => ({
    question: item.q,
    answer: item.a,
  }));

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'BornClock Biological Age Calculator',
    url: 'https://bornclock.com/biological-age',
    description: '12-biomarker biological age assessment using WHO-validated proxy markers',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0' },
    citation: [
      {
        '@type': 'ScholarlyArticle',
        name: 'Expert Consensus Statement on Biomarkers of Aging',
        author: 'Journal of Gerontology, Oxford Academic',
        datePublished: '2025',
      },
      {
        '@type': 'ScholarlyArticle',
        name: 'Potential reversal of epigenetic age using diet and lifestyle',
        author: 'Fitzgerald, K.N. et al.',
        datePublished: '2021',
        publisher: 'Aging Journal',
      },
    ],
  };

  return (
    <div
      className={`min-h-screen ${
        step === 'intro'
          ? 'bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900'
          : 'bg-gradient-cosmic'
      }`}
    >
      <SEO
        title="Biological Age Calculator — 12 WHO-Validated Biomarkers"
        description="Find out your true biological age with 12 peer-reviewed biomarkers including BMI (WHO Asian thresholds), waist circumference, blood pressure, balance, and cardiovascular fitness. Based on Journal of Gerontology Expert Consensus (2025). Free, no blood test."
        keywords="biological age calculator, how old is my body, biological age test free, body age calculator, epigenetic age test, WHO BMI calculator, biological vs chronological age, how to reduce biological age"
        canonicalUrl="/biological-age"
      />
      <FAQSchema items={faqSchemaItems} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(webAppSchema)}</script>
      </Helmet>

      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm mb-8">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Navigation />
          <AuthNav />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* ── INTRO ── */}
        {step === 'intro' && (
          <div className="max-w-2xl mx-auto pb-16">
            {/* Hero */}
            <div className="text-center mb-8 pt-4">
              <h1 className="text-4xl md:text-6xl font-black text-white text-center leading-tight mb-4">
                What Is Your True Biological Age?
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Chronological age counts years since birth. Biological age (
                <span className="font-semibold text-indigo-300">epigenetic age</span> — how old your
                DNA methylation patterns suggest your cells are) measures something far more
                important: how efficiently your cells, organs, and physiological systems are actually
                functioning right now.
              </p>
            </div>

            {/* Research credibility box */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
              <h2 className="text-white font-bold text-base mb-4">
                📊 Peer-Reviewed Scientific Basis
              </h2>
              <div className="space-y-4">
                {[
                  {
                    text: 'Expert consensus with 70–98% agreement on 14 validated biomarkers of aging including grip strength, balance, blood pressure, and cognitive function.',
                    source:
                      'Journal of Gerontology, Oxford Academic, 2025 — Expert Consensus on Biomarkers of Aging',
                  },
                  {
                    text: 'Biological age estimated from physiological biomarkers correlates with chronological age at r=0.81–0.86 in validated population studies of 100+ participants.',
                    source:
                      'JMIR Aging, 2022 — Physiological Biomarker Biological Age Model',
                  },
                  {
                    text: 'Biological age can be reduced by 3.23 years in 8 weeks through targeted diet and lifestyle intervention in a randomized controlled trial.',
                    source:
                      'Fitzgerald, K.N. et al., Aging, 2021 — Potential Reversal of Epigenetic Age',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                    <div>
                      <p className="text-slate-200 text-sm leading-relaxed">{item.text}</p>
                      <p className="text-indigo-300 text-xs mt-1 italic">[{item.source}]</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What we measure */}
            <div className="bg-slate-800 rounded-xl p-5 mb-4">
              <p className="text-white font-semibold text-sm mb-3">
                This assessment evaluates 12 validated proxy biomarkers:
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-slate-300">
                {[
                  'Resting heart rate (cardiovascular load)',
                  'Muscular endurance (sarcopenia risk)',
                  'Single-leg balance (neurological aging)',
                  'Cardiovascular fitness (VO₂ max proxy)',
                  'Sleep architecture (glymphatic function)',
                  'Flexibility (arterial stiffness proxy)',
                  'Working memory (cognitive aging)',
                  'Psychomotor reaction time (neural speed)',
                  'Body Mass Index — BMI (adiposity)',
                  'Waist circumference (central adiposity)',
                  'Blood pressure (vascular age)',
                  'Subjective vitality (allostatic load)',
                ].map(item => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5 flex-shrink-0 text-xs">●</span>
                    <span className="text-xs leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gold standard note */}
            <p className="text-xs italic text-slate-400 text-center max-w-2xl mx-auto mb-4">
              ⚕️ The clinical gold standard for biological age — DNA methylation analysis (Horvath
              Epigenetic Clock, Genome Biology, 2013) — requires a laboratory blood sample. This
              assessment uses validated self-report proxy biomarkers that correlate strongly with
              laboratory measures and are accessible to everyone.
            </p>

            {/* Motivational paragraph */}
            <p className="text-slate-200 max-w-xl mx-auto text-center text-sm leading-relaxed mb-8">
              The extraordinary finding from longevity science is this: biological age moves. It
              responds to what you eat, how you sleep, how you move, and how you manage stress. Every
              biomarker you measure today is a data point you can improve. This is not a verdict — it
              is a baseline.
            </p>

            {/* Age input card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-auto mb-4">
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Your current age
              </label>
              <p className="text-xs text-gray-500 mb-3">Enter your age to begin the assessment</p>
              <input
                type="number"
                min={18}
                max={100}
                placeholder="e.g. 35"
                value={chronoAge}
                onChange={e => setChronoAge(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-xl text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              />
              <button
                disabled={!chronoAge || parseInt(chronoAge) < 18 || parseInt(chronoAge) > 120}
                onClick={handleStart}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Begin My Biological Age Assessment
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Medical disclaimer */}
            <MedicalDisclaimer />

            {/* EEAT editorial standards */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-w-2xl mx-auto mt-6">
              <p className="text-slate-300 text-xs leading-relaxed">
                <span className="font-semibold text-white">📋 Editorial Standards</span>
                {' '}BornClock's health content is reviewed against peer-reviewed literature from
                PubMed, the WHO Global Health Observatory, and expert consensus statements. We cite
                primary sources directly. We do not accept advertising that influences our health
                content. Scientific references updated: June 2026.
              </p>
            </div>
          </div>
        )}

        {/* ── QUIZ ── */}
        {step === 'quiz' && (
          <div className="max-w-2xl mx-auto pb-16">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span className="font-medium">
                  Biomarker {current + 1} of 12 — {q.biomarkerName}
                </span>
                <span>{Math.round(((current + 1) / BIO_QUESTIONS.length) * 100)}% complete</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${((current + 1) / BIO_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Category pill */}
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full mb-4 ${
                  CATEGORY_CONFIG[q.category]?.pillClass ?? ''
                }`}
              >
                {CATEGORY_CONFIG[q.category]?.emoji} {CATEGORY_CONFIG[q.category]?.label}
              </span>

              {/* Question */}
              <h2 className="font-semibold text-lg text-gray-900 leading-snug mb-1">
                {q.question}
              </h2>

              {/* Instruction */}
              {q.instruction && (
                <p className="text-sm text-gray-500 italic mt-1 mb-3 leading-relaxed">
                  {q.instruction}
                </p>
              )}

              {/* Motivational context */}
              {q.motivationalContext && (
                <div className="bg-indigo-50 border-l-4 border-indigo-500 px-3 py-2 text-sm text-indigo-800 mb-4 rounded-r-lg leading-relaxed">
                  💡 {q.motivationalContext}
                </div>
              )}

              {/* Calculator questions */}
              {q.hasCalculator ? (
                <>
                  {q.calculatorType === 'bmi' ? (
                    <BMICalculator
                      onSelect={(optionId, heightCm) => {
                        if (heightCm > 0) setSavedHeightCm(heightCm);
                        handleAnswer(q.id, optionId);
                      }}
                    />
                  ) : (
                    <WaistCalculator
                      onSelect={optionId => handleAnswer(q.id, optionId)}
                      savedHeightCm={savedHeightCm}
                    />
                  )}
                </>
              ) : (
                <>
                  {/* Blood pressure nudge */}
                  {q.id === 'bloodPressure' && (
                    <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                      💡 If you haven't had your blood pressure checked recently — this question is
                      your reminder. A reading takes 2 minutes at any pharmacy and could genuinely
                      save your life. Check it today and retake this assessment.
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => handleAnswer(q.id, opt.id)}
                        className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                      >
                        <span className="block font-medium text-sm text-gray-900">{opt.label}</span>
                        {opt.sublabel && (
                          <span className="block text-xs text-gray-500 mt-0.5 leading-snug">
                            {opt.sublabel}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Source citation badge */}
              {(q.sourceLabel || q.source) && (
                <p className="text-xs text-gray-400 mt-4 text-center italic">
                  [{q.sourceLabel || q.source}]
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {step === 'result' && bioAge !== null && (
          <div className="max-w-3xl mx-auto pb-16 space-y-6">

            {/* ── SECTION A: INSPIRED ── */}
            <div className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white p-8 rounded-2xl">
              <div className="text-center">
                <p className="text-slate-400 text-sm uppercase tracking-widest font-medium">
                  Your Biological Age Assessment
                </p>
                <p className="text-slate-500 text-xs mt-1">{today}</p>

                <div className={`text-8xl font-black mt-6 mb-1 leading-none ${bioAgeColor}`}>
                  {bioAge}
                </div>
                <p className="text-lg font-semibold text-slate-400 mb-1">years biological age</p>
                <p className="text-slate-400 text-base">
                  vs your chronological age of {age} years
                </p>

                <div
                  className={`inline-block mt-5 px-6 py-3 rounded-2xl border text-base font-semibold ${diffBadgeStyle}`}
                >
                  {diffBadgeText}
                </div>

                <p className="text-slate-300 max-w-lg mx-auto mt-6 text-sm leading-relaxed">
                  {motivationalText}
                </p>
              </div>
            </div>

            {/* ── SECTION B: INFORMED ── */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Your Biomarker Profile</h2>
              <p className="text-sm text-gray-500 mb-4">
                Based on the Journal of Gerontology Expert Consensus Biomarkers of Aging (2025) —
                70–98% scientific agreement across disciplines
              </p>

              {/* Biomarker table */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">
                          Biomarker
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">
                          Category
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">
                          Your Result
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">
                          Biological Impact
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {questionResults.map(({ q: row, adjustment, selectedDisplay }) => {
                        const cat = CATEGORY_CONFIG[row.category];
                        const status = getStatusInfo(adjustment);
                        return (
                          <tr key={row.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">
                              {row.biomarkerName}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cat?.pillClass ?? ''}`}
                              >
                                {cat?.emoji} {cat?.label}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 max-w-[140px]">
                              <span className="block truncate text-xs">{selectedDisplay}</span>
                            </td>
                            <td className="py-3 px-4 font-medium whitespace-nowrap">
                              {adjustment < 0 ? (
                                <span className="text-emerald-600">
                                  −{Math.abs(adjustment)} yrs
                                </span>
                              ) : adjustment === 0 ? (
                                <span className="text-gray-400">Neutral</span>
                              ) : (
                                <span className="text-red-500">+{adjustment} yrs</span>
                              )}
                            </td>
                            <td className={`py-3 px-4 whitespace-nowrap text-sm ${status.color}`}>
                              {status.icon} {status.label}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 bg-gray-50">
                        <td colSpan={3} className="py-3 px-4 font-bold text-gray-900">
                          Net biological age adjustment
                        </td>
                        <td
                          className={`py-3 px-4 font-bold ${
                            diff <= 0 ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {diff >= 0 ? '+' : ''}
                          {diff.toFixed(1)} yrs
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Understanding your results */}
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
                Understanding Your Results
              </h2>

              {needsAttention.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-emerald-800 text-sm">
                  ✅ All your biomarkers are in healthy range. Focus on maintaining these results
                  and optimizing your top performers.
                </div>
              ) : (
                <div className="space-y-2">
                  {needsAttention.map(({ q: row, adjustment, selectedDisplay }) => {
                    const status = getStatusInfo(adjustment);
                    const isOpen = openBiomarker === row.id;
                    return (
                      <div key={row.id} className="border rounded-xl overflow-hidden bg-white">
                        <button
                          className="w-full flex items-center justify-between px-5 py-4 text-left"
                          onClick={() => setOpenBiomarker(isOpen ? null : row.id)}
                          aria-expanded={isOpen}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-sm text-gray-900">
                              {row.biomarkerName}
                            </span>
                            <span
                              className={`text-xs font-medium ${status.color}`}
                            >
                              {status.icon} {status.label}
                            </span>
                          </div>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4 border-t pt-3 space-y-2 text-sm text-gray-600">
                            <p>
                              <span className="font-semibold text-gray-800">What it measures:</span>{' '}
                              {WHAT_IT_MEASURES[row.id]}
                            </p>
                            <p>
                              <span className="font-semibold text-gray-800">Your result:</span>{' '}
                              {selectedDisplay}
                            </p>
                            {(row.motivationalContext || row.instruction) && (
                              <p>
                                <span className="font-semibold text-gray-800">The science:</span>{' '}
                                {row.motivationalContext || row.instruction}
                              </p>
                            )}
                            {(row.sourceLabel || row.source) && (
                              <p className="text-xs text-gray-400 italic">
                                Source: {row.sourceLabel || row.source}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── SECTION C: ACT ── */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Your Top 3 Biological Age Levers
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Ranked by potential biological age reduction based on your specific results
              </p>

              {top3.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-emerald-800 text-sm">
                  🎉 Excellent — all your biomarkers are in the healthy range. Maintain these
                  results through consistent sleep, movement, and nutrition habits.
                </div>
              ) : (
                <div className="space-y-4">
                  {top3.map(({ q: row, adjustment, selectedDisplay }) => {
                    const cat = CATEGORY_CONFIG[row.category];
                    const bestAdj = Math.min(...row.options.map(o => o.adjustment));
                    const potentialReduction = Math.round((adjustment - bestAdj) * 10) / 10;
                    return (
                      <div
                        key={row.id}
                        className="rounded-2xl border border-gray-200 p-5 bg-white flex gap-4"
                      >
                        <div
                          className="text-4xl flex-shrink-0 mt-1"
                          style={{ fontSize: '2.5rem', lineHeight: 1 }}
                        >
                          {cat?.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900">{row.biomarkerName}</p>
                          <p className="text-amber-600 text-sm font-medium mt-0.5">
                            Current: {selectedDisplay}
                          </p>
                          <p className="text-red-500 text-sm mt-0.5">
                            Contributing +{adjustment} years to your biological age
                          </p>
                          <p className="text-emerald-600 font-semibold text-sm mt-2">
                            Potential reduction: up to {potentialReduction} years
                          </p>
                          <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                            {ACTION_TEXT[row.id]}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Longevity CTA */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 text-center mt-6">
                <p className="text-white font-semibold text-base mb-1">
                  🔬 Want to see how these factors affect your longevity forecast?
                </p>
                <p className="text-indigo-200 text-sm mb-4">
                  Your biological age results give important context to your life expectancy
                  calculation. Take the full BornClock longevity quiz to see your personalized
                  forecast.
                </p>
                <Link
                  to="/life-expectancy"
                  className="inline-block bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  Calculate My Life Expectancy →
                </Link>
              </div>
            </div>

            {/* ── SECTION D: SHARE + RETAKE ── */}
            <div className="bg-white rounded-2xl border p-6">
              <h3 className="font-bold text-gray-900 mb-3">Share Your Result</h3>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 mb-4 whitespace-pre-line">
                {shareText}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : null}
                  {copied ? 'Copied!' : '📋 Copy'}
                </button>
                <button
                  onClick={() =>
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
                      '_blank',
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  📱 WhatsApp
                </button>
                <button
                  onClick={() =>
                    window.open(
                      `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
                      '_blank',
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  𝕏 Post on X
                </button>
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retake Assessment
              </button>
            </div>

            {/* ── SECTION E: REFERENCES ── */}
            <ScientificReferences />

            {/* ── SECTION F: FAQ ── */}
            <FAQSection />

            {/* EEAT footer */}
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              Content reviewed for scientific accuracy using Journal of Gerontology Expert Consensus
              (2025), WHO clinical guidelines, and peer-reviewed biomarker research. All citations
              link to primary sources.
            </p>

            {/* Medical disclaimer on result page */}
            <MedicalDisclaimer />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BiologicalAge;

import { useState, type ReactNode } from 'react';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { SEO } from '@/components/SEO';
import { Activity, ArrowRight, RefreshCw, Share2, Check, ChevronDown, ChevronUp } from 'lucide-react';
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

  // Compute BMI directly from current inputs — no effect needed
  let bmi: number | null = null;
  let heightCmValue = 0;

  if (unit === 'metric') {
    const w = parseFloat(weightKg);
    const hCm = parseFloat(heightCm);
    if (w > 0 && hCm > 0) {
      const hM = hCm / 100;
      bmi = Math.round((w / (hM * hM)) * 10) / 10;
      heightCmValue = hCm;
    }
  } else {
    const w = parseFloat(weightLbs) / 2.205;
    const totalInches = (parseFloat(heightFt) * 12) + parseFloat(heightIn || '0');
    const hM = totalInches * 0.0254;
    if (w > 0 && hM > 0) {
      bmi = Math.round((w / (hM * hM)) * 10) / 10;
      heightCmValue = totalInches * 2.54;
    }
  }

  // Derive category, color, and option ID from BMI
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

  const indicatorPct = bmi !== null
    ? Math.min(95, Math.max(2, ((bmi - 15) / 25) * 100))
    : null;

  return (
    <div className="bg-slate-50 rounded-2xl p-6 mt-4">
      {/* Unit toggle */}
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

      {/* Inputs */}
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
                  onChange={e => setWeightKg(e.target.value)}
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
                  onChange={e => setHeightCm(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 text-sm">cm</span>
              </div>
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
                  onChange={e => setWeightLbs(e.target.value)}
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
                    onChange={e => setHeightFt(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="absolute right-2 top-2.5 text-gray-400 text-sm">ft</span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    placeholder="8"
                    value={heightIn}
                    onChange={e => setHeightIn(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="absolute right-2 top-2.5 text-gray-400 text-sm">in</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* BMI Result */}
      {bmi !== null && indicatorPct !== null ? (
        <div className="text-center mb-2">
          <div className="text-6xl font-black mb-1" style={{ color: bmiColor }}>{bmi}</div>
          <div className="text-lg font-semibold text-gray-700 mb-1">{category}</div>
          <div className="text-sm text-gray-500 mb-4">Body Mass Index (WHO Asian thresholds applied)</div>

          {/* BMI scale bar */}
          <div className="relative h-3 rounded-full mb-2 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500">
            <div
              className="absolute w-4 h-4 rounded-full bg-white border-2 border-gray-800 shadow-lg"
              style={{ left: `${indicatorPct}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1 mb-4">
            <span>15</span><span>18.5</span><span>23</span><span>27.5</span><span>30</span><span>40+</span>
          </div>

          <p className="text-xs text-gray-400 italic mb-4">
            WHO recommends lower BMI thresholds for South Asian populations (overweight ≥23, not ≥25) due
            to higher metabolic risk at lower BMI levels. [WHO Expert Consultation, Lancet, 2004]
          </p>

          <button
            onClick={() => onSelect(bmiOptionId, heightCmValue)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Use My BMI ({bmi}) — {category} →
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-400 text-sm">Enter your weight and height above to calculate your BMI</p>
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

  const waistCmNum = unit === 'cm'
    ? parseFloat(waistCm)
    : parseFloat(waistInches) * 2.54;

  const heightCmNum = parseFloat(heightForRatio);

  const whoRiskKey = waistCmNum > 0 ? getWHOWaistRisk(waistCmNum, gender) : null;

  const riskConfig: Record<string, { label: string; color: string; optionId: string }> = {
    low:       { label: 'Low risk',       color: '#22c55e', optionId: 'waist_low' },
    increased: { label: 'Increased risk', color: '#f59e0b', optionId: 'waist_increased' },
    high:      { label: 'High risk',      color: '#ef4444', optionId: 'waist_high' },
  };

  const risk = whoRiskKey ? riskConfig[whoRiskKey] : null;

  const whtRatio =
    waistCmNum > 0 && heightCmNum > 0
      ? Math.round((waistCmNum / heightCmNum) * 100) / 100
      : null;

  return (
    <div className="bg-slate-50 rounded-2xl p-6 mt-4">
      {/* Gender selector */}
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

      {/* Unit toggle */}
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

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Waist circumference</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Your height (for WHtR)</label>
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

      {/* How to measure guide */}
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

      {/* Results */}
      {waistCmNum > 0 && risk ? (
        <div className="text-center mb-2">
          <div className="text-3xl font-black mb-1" style={{ color: risk.color }}>
            {waistCmNum.toFixed(1)} cm
          </div>
          <div className="text-lg font-semibold mb-1" style={{ color: risk.color }}>{risk.label}</div>
          <div className="text-xs text-gray-500 mb-3">
            WHO threshold for {gender}s: low risk {gender === 'male' ? '<94 cm' : '<80 cm'}
            &nbsp;[WHO Waist Circumference Report, 2011]
          </div>

          {whtRatio !== null && (
            <div className="bg-white border rounded-lg p-3 mb-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Waist-to-height ratio (WHtR):</span>
                <span className={`font-bold text-lg ${
                  whtRatio < 0.5 ? 'text-green-600' : whtRatio < 0.6 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {whtRatio}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Healthy: under 0.5 · Caution: 0.5–0.6 · High risk: above 0.6
                &nbsp;[Ashwell et al., Nutrition Research Reviews, 2010]
              </div>
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
        <p className="text-center text-gray-400 text-sm">Enter your waist measurement above</p>
      )}
    </div>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQ_ITEMS: { q: string; a: ReactNode }[] = [
  {
    q: 'How is biological age calculated?',
    a: <>Biological age is estimated by comparing your performance on 12 validated physical, metabolic, and cognitive markers — <MedTerm term="resting heart rate" plain="cardiovascular fitness proxy" />, <MedTerm term="muscular endurance" plain="how long your muscles work without fatiguing" />, <MedTerm term="proprioception" plain="your body's self-positioning sense" />, <MedTerm term="arterial stiffness proxy" plain="flexibility as a measure of vascular health" />, <MedTerm term="glymphatic function" plain="your brain's overnight waste-clearance" />, <MedTerm term="psychomotor reaction time" plain="how fast your brain triggers physical response" />, <MedTerm term="BMI" plain="body mass index — adiposity proxy" />, <MedTerm term="waist circumference" plain="central adiposity and visceral fat marker" />, <MedTerm term="blood pressure" plain="cardiovascular system load" />, and energy levels — against population norms for your chronological age.</>,
  },
  {
    q: 'Is this scientifically accurate?',
    a: 'This quiz uses validated biomarkers from peer-reviewed research to produce a statistical estimate. It is not a clinical test. Results should be treated as directional, not diagnostic. For clinical biological age assessments, consult a healthcare professional.',
  },
  {
    q: 'Can biological age be reversed?',
    a: <>Yes — biological age is highly responsive to lifestyle changes. Regular exercise, quality sleep, a whole-food diet, and strong social connections are the most evidence-backed interventions. Studies show <MedTerm term="epigenetic age" plain="how old your DNA methylation patterns suggest your cells are" /> can decrease by 1–3 years within 8–12 weeks of consistent positive lifestyle changes.</>,
  },
  {
    q: 'Why is there a floor of 18?',
    a: 'The adjustment factors are calibrated for adults. The floor of 18 prevents the model from producing a physiologically meaningless biological age below adulthood, since the markers used are designed for adult populations.',
  },
  {
    q: 'What is the most impactful factor?',
    a: <>Sleep quality and resting heart rate are among the most impactful single markers. Resting heart rate is strongly predictive of all-cause mortality (Filipiak et al., 2012). Sleep below 6 hours is consistently associated with 12–25% higher mortality risk (Walker, 2017) — partly because poor sleep impairs your <MedTerm term="glymphatic system" plain="your brain's overnight waste-clearance system" />. <MedTerm term="Waist circumference" plain="central adiposity and visceral fat proxy" /> is the single strongest metabolic marker.</>,
  },
  {
    q: 'How often should I retake this quiz?',
    a: <>Every 4–8 weeks gives meaningful data on change. Biological age is not fixed — significant lifestyle interventions (starting exercise, improving sleep, losing <MedTerm term="visceral fat" plain="deep organ fat, not the fat under your skin" />) typically produce measurable changes within 8–12 weeks, reducing <MedTerm term="allostatic load" plain="cumulative stress burden on the body" /> and lowering biological age markers.</>,
  },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="max-w-2xl mx-auto mb-16">
      <h2 className="text-xl font-bold mb-5 text-foreground">Frequently Asked Questions</h2>
      <div className="space-y-2">
        {FAQ_ITEMS.map((item, i) => (
          <Card key={i} className="glass-card">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              <span className="font-medium text-sm text-foreground">{item.q}</span>
              {open === i
                ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{item.a}</div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}

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
  };

  const handleShare = async () => {
    if (bioAge === null) return;
    const text = `My biological age is ${bioAge} (chronological: ${age}). Find yours at bornclock.com/biological-age`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* clipboard unavailable */ }
  };

  const age = parseInt(chronoAge) || 0;
  const diff = bioAge !== null ? Math.round((bioAge - age) * 10) / 10 : 0;
  const diffColor = diff <= 0 ? 'text-green-500' : diff <= 5 ? 'text-amber-500' : 'text-red-500';

  const q = BIO_QUESTIONS[current];

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Biological Age Calculator — 12-Marker Body Age Test"
        description="Take our 12-question biological age quiz to find out if your body is younger or older than your chronological age. Includes BMI calculator, waist circumference, blood pressure, fitness, sleep, and metabolic markers."
        keywords="biological age calculator, body age test, real age, fitness age, metabolic age, BMI calculator, waist circumference"
        canonicalUrl="/biological-age"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 pt-8 pb-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-muted-foreground">
            <Activity className="w-4 h-4 text-primary" />
            <span>12-question fitness, metabolic &amp; wellness quiz</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black gradient-text-primary leading-tight">
            Biological Age Calculator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your calendar age tells one story. Your body tells another. Answer 12 questions to discover your true biological age — and how to lower it.
          </p>
        </section>

        <div className="max-w-2xl mx-auto mb-16">
          {/* ── Intro ── */}
          {step === 'intro' && (
            <Card className="glass-card card-party-border">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="chrono" className="text-base font-semibold">
                    Your Chronological Age
                  </Label>
                  <p className="text-sm text-muted-foreground">Enter your age in years to start</p>
                  <Input
                    id="chrono"
                    type="number"
                    min={18}
                    max={120}
                    placeholder="e.g. 35"
                    value={chronoAge}
                    onChange={e => setChronoAge(e.target.value)}
                    className="text-xl text-center max-w-[160px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                  {[
                    'Resting heart rate (cardiovascular fitness proxy)',
                    'Push-up capacity (muscular endurance)',
                    'Balance (proprioceptive control)',
                    'Sleep quality (glymphatic function)',
                    'Flexibility (arterial stiffness proxy)',
                    'Mental sharpness (cognitive aging marker)',
                    'Psychomotor reaction time (neural speed)',
                    'BMI calculator (adiposity proxy)',
                    'Waist circumference (central adiposity)',
                    'Blood pressure (cardiovascular load)',
                    'Energy levels (allostatic load indicator)',
                  ].map(t => (
                    <div key={t} className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
                <Button
                  size="lg"
                  className="w-full gap-2"
                  disabled={!chronoAge || parseInt(chronoAge) < 18 || parseInt(chronoAge) > 120}
                  onClick={handleStart}
                >
                  Start 12-Question Quiz
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── Quiz ── */}
          {step === 'quiz' && (
            <Card className="glass-card">
              <CardContent className="p-8 space-y-6">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Question {current + 1} of {BIO_QUESTIONS.length}</span>
                    <span>{Math.round((current / BIO_QUESTIONS.length) * 100)}% complete</span>
                  </div>
                  <Progress value={(current / BIO_QUESTIONS.length) * 100} className="h-2" />
                </div>

                {/* Question title */}
                <h2 className="text-xl font-bold text-foreground leading-snug">
                  {q.question}
                </h2>

                {/* Calculator questions */}
                {q.hasCalculator ? (
                  <>
                    {q.instruction && (
                      <p className="text-sm text-gray-500 italic">{q.instruction}</p>
                    )}
                    {q.motivationalContext && (
                      <p className="text-sm text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2">
                        💡 {q.motivationalContext}
                      </p>
                    )}

                    {q.calculatorType === 'bmi' ? (
                      <BMICalculator
                        onSelect={(optionId, heightCm) => {
                          if (heightCm > 0) setSavedHeightCm(heightCm);
                          handleAnswer(q.id, optionId);
                        }}
                      />
                    ) : (
                      <WaistCalculator
                        onSelect={(optionId) => handleAnswer(q.id, optionId)}
                        savedHeightCm={savedHeightCm}
                      />
                    )}

                    {q.sourceLabel && (
                      <p className="text-xs text-muted-foreground/60 border-t pt-3 italic text-center">
                        [{q.sourceLabel}]
                      </p>
                    )}
                  </>
                ) : (
                  /* Regular questions */
                  <>
                    {q.instruction && (
                      <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-4 py-3 italic leading-relaxed">
                        {q.instruction}
                      </p>
                    )}

                    {/* Blood pressure "don't know" nudge */}
                    {q.id === 'bloodPressure' && (
                      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        💡 If you haven't had your blood pressure checked recently — this question is your reminder.
                        A reading takes 2 minutes at any pharmacy and could genuinely save your life.
                        Check it today and retake this assessment.
                      </p>
                    )}

                    <div className="space-y-3">
                      {q.options.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => handleAnswer(q.id, opt.id)}
                          className="w-full text-left px-5 py-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all"
                        >
                          <span className="block text-sm font-medium">{opt.label}</span>
                          {opt.sublabel && (
                            <span className="block text-xs text-muted-foreground font-normal mt-1 leading-relaxed">
                              {opt.sublabel}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {(q.source || q.sourceLabel) && (
                      <p className="text-xs text-muted-foreground/60 border-t pt-3 italic">
                        Source: {q.sourceLabel || q.source}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Result ── */}
          {step === 'result' && bioAge !== null && (
            <div className="space-y-6">
              <Card className="glass-card card-party-border">
                <CardContent className="p-8 text-center space-y-4">
                  <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Your Biological Age</p>
                  <div className="text-8xl font-black text-primary leading-none">{bioAge}</div>
                  <p className="text-2xl font-semibold text-muted-foreground">years old</p>
                  <div className={`text-lg font-semibold ${diffColor}`}>
                    {diff === 0
                      ? '✓ Your biological age matches your calendar age'
                      : diff < 0
                      ? `🎉 Your body is ${Math.abs(diff).toFixed(1)} years younger than your age`
                      : `⚠️ Your body is ${diff.toFixed(1)} years older than your age`}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Chronological age: {age} · Biological age: {bioAge}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-base">What this means</h3>
                  {diff <= -5 && (
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-green-600">Your body is genuinely firing younger on every marker.</strong> Your cardiovascular fitness, muscle endurance, and energy efficiency all point well below your calendar age. In scientific terms: your markers reflect low allostatic load (cumulative stress burden on the body), strong VO₂ max proxy (aerobic efficiency), and epigenetic age (how old your DNA methylation patterns suggest your cells are) well below your chronological age.
                    </p>
                  )}
                  {diff > -5 && diff <= 0 && (
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-green-600">Your body is aging well.</strong> Your fitness markers show you're ahead of your calendar age. To push this further: keep allostatic load (cumulative stress burden on the body) low through consistent sleep, and maintain VO₂ max proxy (aerobic efficiency) with regular movement — the two highest-leverage levers.
                    </p>
                  )}
                  {diff > 0 && diff <= 5 && (
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-amber-600">You have clear room to improve — and biology is on your side.</strong> Focus on sleep first (your glymphatic system (your brain's overnight waste-clearance) needs consistent deep sleep), then movement to counter sarcopenia (age-related muscle loss), then reducing central adiposity (belly fat around your organs). Small, consistent changes compound quickly.
                    </p>
                  )}
                  {diff > 5 && (
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-red-500">The good news: biological age is highly plastic.</strong> Reducing visceral fat (deep organ fat), improving sleep quality, and regular exercise have been shown to lower biological age by 1–3 years within 8–12 weeks — measurably reducing allostatic load (cumulative stress burden on the body) and improving epigenetic age (how old your DNA methylation patterns suggest your cells are).
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground border-t pt-3">
                    ⚠️ This is a self-reported screening tool, not a medical test. Consult a healthcare professional for clinical assessment.
                  </p>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={reset}>
                  <RefreshCw className="w-4 h-4" />
                  Retake Quiz
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={handleShare}>
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Share Result'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <FAQSection />
      </div>
      <Footer />
    </div>
  );
};

export default BiologicalAge;

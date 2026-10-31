import { useState, type ReactNode } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { Helmet } from 'react-helmet-async';
import { ReportLayout } from '@/components/central';
import { SEO, FAQSchema } from '@/components/SEO';
import { ArrowRight, RefreshCw, Check, ChevronDown, ChevronUp } from 'lucide-react';
import {
  BIO_QUESTIONS,
  calculateBiologicalAge,
  getAdjustment,
  bestAdjustment,
  getWaistRisk,
  waistCutoffCm,
  MAX_TOTAL_ADJUSTMENT,
  type BioSex,
} from '@/services/BiologicalAgeService';
import PageTagline from '@/components/PageTagline';
import { BIO_AGE_META_DESCRIPTION } from '@/content/biologicalAgeMeta';
import { palette } from '../theme/palette';

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
  onSelect: (optionId: string) => void;
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

  if (unit === 'metric') {
    const w = parseFloat(weightKg);
    const hCm = parseFloat(heightCm);
    if (w > 0 && hCm > 0) {
      const hM = hCm / 100;
      calculatedBmi = Math.round((w / (hM * hM)) * 10) / 10;
    }
  } else {
    const w = parseFloat(weightLbs) / 2.205;
    const totalInches = parseFloat(heightFt) * 12 + parseFloat(heightIn || '0');
    const hM = totalInches * 0.0254;
    if (w > 0 && hM > 0) {
      calculatedBmi = Math.round((w / (hM * hM)) * 10) / 10;
    }
  }

  const bmi: number | null = bmiSliderActive ? bmiSlider : calculatedBmi;

  let category = '';
  let bmiColor = palette.purple;
  let bmiOptionId = '';

  if (bmi !== null) {
    if (bmi < 18.5) {
      category = 'Underweight'; bmiColor = '#3b82f6'; bmiOptionId = 'bmi_underweight';
    } else if (bmi < 23.0) {
      category = 'Healthy (Asian cut-off)'; bmiColor = '#22c55e'; bmiOptionId = 'bmi_optimal';
    } else if (bmi < 25.0) {
      category = 'Increased risk for Asians'; bmiColor = '#84cc16'; bmiOptionId = 'bmi_healthy';
    } else if (bmi < 27.5) {
      category = 'Overweight'; bmiColor = '#f59e0b'; bmiOptionId = 'bmi_ow_mild';
    } else if (bmi < 30.0) {
      category = 'High risk for Asians'; bmiColor = '#f97316'; bmiOptionId = 'bmi_ow';
    } else if (bmi < 35.0) {
      category = 'Obesity class I'; bmiColor = '#ef4444'; bmiOptionId = 'bmi_obese1';
    } else {
      category = 'Obesity class II+'; bmiColor = '#dc2626'; bmiOptionId = 'bmi_obese2';
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
            unit === 'metric' ? 'bg-brand-navy text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Metric (kg / cm)
        </button>
        <button
          onClick={() => setUnit('imperial')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            unit === 'imperial' ? 'bg-brand-navy text-white' : 'text-gray-600 hover:bg-gray-100'
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
                  className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-navy"
                />
                <span className="absolute right-3 top-2.5 text-gray-600 text-sm">kg</span>
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
                  className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-navy"
                />
                <span className="absolute right-3 top-2.5 text-gray-600 text-sm">cm</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">5'8" ≈ 173 cm · 6'0" ≈ 183 cm</p>
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
                  className="w-full border rounded-lg px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-navy"
                />
                <span className="absolute right-3 top-2.5 text-gray-600 text-sm">lbs</span>
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
                    className="w-full border rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  />
                  <span className="absolute right-2 top-2.5 text-gray-600 text-sm">ft</span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    placeholder="8"
                    value={heightIn}
                    onChange={e => { setHeightIn(e.target.value); setBmiSliderActive(false); }}
                    className="w-full border rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  />
                  <span className="absolute right-2 top-2.5 text-gray-600 text-sm">in</span>
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
            className="flex-1 accent-brand-navy"
          />
          <span className="text-sm font-bold text-gray-700 w-10 text-right">{bmiSlider.toFixed(1)}</span>
        </div>
        {bmiSliderActive && (
          <p className="text-xs text-center text-brand-blue mt-1">Using slider BMI value</p>
        )}
      </div>

      {bmi !== null && indicatorPct !== null ? (
        <div className="text-center mb-2">
          <div className="text-6xl font-black mb-1" style={{ color: bmiColor }}>
            {bmi}
          </div>
          <div className="text-lg font-semibold text-gray-700 mb-1">{category}</div>
          <div className="text-sm text-gray-500 mb-4">
            Body Mass Index (Asian action points applied)
          </div>
          <div className="relative h-3 rounded-full mb-2 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500">
            <div
              className="absolute w-4 h-4 rounded-full bg-white border-2 border-gray-800 shadow-lg"
              style={{ left: `${indicatorPct}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1 mb-4">
            <span>15</span>
            <span>18.5</span>
            <span>23</span>
            <span>27.5</span>
            <span>30</span>
            <span>40+</span>
          </div>
          <p className="text-xs text-gray-600 italic mb-4">
            A WHO expert consultation suggested extra public-health action points of 23 and 27.5
            for Asian populations, because risk of type 2 diabetes and heart disease starts at a
            lower BMI. BMI cannot tell muscle from fat. [WHO Expert Consultation, Lancet, 2004]
          </p>
          <button
            onClick={() => onSelect(bmiOptionId)}
            className="bg-brand-navy hover:bg-brand-navy text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Use My BMI ({bmi}) — {category} →
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-600 text-sm">
          Enter your weight and height above to calculate your BMI
        </p>
      )}
    </div>
  );
}

// ── Waist Calculator ──────────────────────────────────────────────────────────
// Cut-offs: IDF 2005 South Asian values (men 90 cm, women 80 cm) — see the source
// comment on the waist question in src/services/BiologicalAgeService.ts.

interface WaistCalculatorProps {
  onSelect: (optionId: string) => void;
  sex: BioSex;
}

function WaistCalculator({ onSelect, sex }: WaistCalculatorProps) {
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm');
  const [waistCm, setWaistCm] = useState('');
  const [waistInches, setWaistInches] = useState('');

  const waistCmNum =
    unit === 'cm' ? parseFloat(waistCm) : parseFloat(waistInches) * 2.54;
  const riskKey = waistCmNum > 0 ? getWaistRisk(waistCmNum, sex) : null;
  const cutoff = waistCutoffCm(sex);

  const riskConfig: Record<string, { label: string; color: string; optionId: string }> = {
    low: { label: 'Below the cut-off', color: '#22c55e', optionId: 'waist_low' },
    high: { label: 'At or above the cut-off', color: '#f59e0b', optionId: 'waist_high' },
  };

  const risk = riskKey ? riskConfig[riskKey] : null;

  return (
    <div className="bg-slate-50 rounded-2xl p-6 mt-4">
      <p className="text-sm text-gray-700 mb-4">
        Cut-off used for {sex === 'male' ? 'men' : 'women'}: <strong>{cutoff} cm</strong> (IDF
        South Asian value).
      </p>

      <div className="flex gap-2 mb-4 bg-white rounded-lg p-1 border w-fit">
        {(['cm', 'inches'] as const).map(u => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              unit === u ? 'bg-brand-navy text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      <div className="mb-4 max-w-xs">
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
              className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-navy"
            />
            <span className="absolute right-3 top-2.5 text-gray-600 text-sm">cm</span>
          </div>
        ) : (
          <div className="relative">
            <input
              type="number"
              placeholder="33.5"
              value={waistInches}
              onChange={e => setWaistInches(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-navy"
            />
            <span className="absolute right-3 top-2.5 text-gray-600 text-sm">in</span>
          </div>
        )}
      </div>

      {waistCmNum > 0 && risk ? (
        <div className="text-center mb-2">
          <div className="text-3xl font-black mb-1" style={{ color: risk.color }}>
            {waistCmNum.toFixed(1)} cm
          </div>
          <div className="text-lg font-semibold mb-3" style={{ color: risk.color }}>
            {risk.label}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            {riskKey === 'high'
              ? 'A waist at or above this cut-off is one of the markers doctors use when checking for metabolic syndrome. Regular walking, more vegetables and fewer sugary drinks and fried snacks are good first steps.'
              : 'Your waist is below the South Asian cut-off — a good sign worth keeping.'}
            {' '}
            <span className="text-xs text-gray-500">[IDF definition, Med J Aust, 2005]</span>
          </p>
          <button
            onClick={() => onSelect(risk.optionId)}
            className="bg-brand-navy hover:bg-brand-navy text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Use My Measurement ({waistCmNum.toFixed(0)} cm) →
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-600 text-sm">
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
    label: 'Heart & fitness',
    pillClass: 'bg-red-100 text-red-700 border border-red-200',
  },
  musculoskeletal: {
    emoji: '💪',
    label: 'Muscles & joints',
    pillClass: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  neurological: {
    emoji: '🧠',
    label: 'Brain, balance & sleep',
    pillClass: 'bg-brand-purple/10 text-brand-purple border border-brand-purple/30',
  },
  bodycomp: {
    emoji: '⚖️',
    label: 'Body size',
    pillClass: 'bg-green-100 text-green-700 border border-green-200',
  },
  metabolic: {
    emoji: '🩺',
    label: 'Blood pressure',
    pillClass: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  vitality: {
    emoji: '✨',
    label: 'Energy',
    pillClass: 'bg-teal-100 text-teal-700 border border-teal-200',
  },
  lifestyle: {
    emoji: '🌱',
    label: 'Habits',
    pillClass: 'bg-lime-100 text-lime-800 border border-lime-200',
  },
};

// ── Status helper ─────────────────────────────────────────────────────────────

function getStatusInfo(adj: number) {
  if (adj < 0) return { icon: '🟢', label: 'Strength', color: 'text-emerald-600' };
  if (adj === 0) return { icon: '🔵', label: 'Typical', color: 'text-blue-500' };
  if (adj <= 1) return { icon: '🟡', label: 'Room to improve', color: 'text-yellow-600' };
  return { icon: '🟠', label: 'Focus area', color: 'text-orange-500' };
}

// ── What each item looks at ───────────────────────────────────────────────────

const WHAT_IT_MEASURES: Record<string, string> = {
  heartRate: 'How hard your heart works at rest — usually lower with better fitness.',
  pushups: 'Upper-body muscular endurance, compared with a benchmark for your age and sex.',
  balance: 'One-leg balance with eyes open, compared with the average for your age group.',
  stairs: 'Everyday aerobic fitness (self-reported).',
  sleep: 'How rested you feel — a simple sign of sleep quality.',
  flexibility: 'Forward-bend flexibility (counted from age 40).',
  memory: 'Your own sense of day-to-day memory.',
  reaction: 'Your own sense of reaction speed.',
  bmi: 'Weight for height, using Asian action points.',
  waist: 'Fat around the middle, using the South Asian waist cut-off.',
  bloodPressure: 'The top (systolic) blood pressure number.',
  energy: 'Your usual daily energy.',
  smoking: 'Smoking — the habit with the largest effect on life expectancy in long-term studies.',
  alcohol: 'Weekly alcohol amount.',
  activity: 'Minutes of moderate exercise per day.',
};

// ── Action text (practical, no promises) ─────────────────────────────────────

const ACTION_TEXT: Record<string, ReactNode> = {
  heartRate: <span>Regular aerobic activity — brisk walking, cycling, swimming — usually lowers resting heart rate over time. A very high resting rate is worth mentioning to your doctor.</span>,
  pushups: <span>Start with wall or knee push-ups a few times a week and add a couple of repetitions each week. Stop if you feel pain.</span>,
  balance: <span>Practise standing on one leg near a wall or chair for safety, a few times a day while brushing your teeth. Yoga and tai chi also train balance.</span>,
  stairs: <span>Add 10 minutes of brisk walking a day and build up slowly. If breathlessness is new or getting worse, please see a doctor.</span>,
  sleep: <span>Keep a fixed bedtime and wake-up time, keep screens out of the last half hour, and avoid late tea or coffee. Loud snoring or daytime sleepiness is worth discussing with a doctor.</span>,
  flexibility: <span>A few minutes of gentle stretching or yoga each day. Move slowly and never bounce.</span>,
  memory: <span>Good sleep, regular exercise, learning new skills and staying socially active all support thinking skills. If memory changes worry you, a doctor can help check the cause.</span>,
  reaction: <span>Regular exercise and enough sleep help you stay alert. Avoid driving when very tired.</span>,
  bmi: <span>Small, steady changes — more vegetables and dal, fewer fried snacks and sweets, daily walking — are easier to keep than strict diets.</span>,
  waist: <span>Daily walking, fewer sugary drinks and less refined flour (maida) and fried food can help reduce waist size over months.</span>,
  bloodPressure: <span>Less salt and pickles, daily walking, not smoking and limiting alcohol help blood pressure. Readings of 140 or more should be discussed with a doctor.</span>,
  energy: <span>Regular sleep, movement and meals help. Tiredness that lasts weeks is worth checking with a doctor (for example thyroid, iron or vitamin B12).</span>,
  smoking: <span>Quitting helps at every age. Free counselling: India&rsquo;s National Tobacco Quitline, 1800-11-2356.</span>,
  alcohol: <span>Keep several alcohol-free days each week and cut the total amount. Less is better for health.</span>,
  activity: <span>Even 15 minutes of brisk walking a day counts — then build towards 30 minutes on most days.</span>,
};

// ── FAQ items ─────────────────────────────────────────────────────────────────

interface FaqItem {
  q: string;
  a: string;
  aNode?: ReactNode;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'What does this biological age calculator actually measure?',
    a: 'It gives a lifestyle- and fitness-based estimate built from published risk factors: resting heart rate, push-ups, one-leg balance, stair climbing, sleep, flexibility, memory, reaction speed, BMI, waist size, blood pressure, energy, smoking, alcohol and physical activity. Each answer moves your calendar age up or down by a small number of years. It is not a lab test, not an epigenetic (DNA methylation) clock and not a medical diagnosis.',
  },
  {
    q: 'How accurate is it?',
    a: 'Treat it as a rough guide. The cut-offs come from published studies and guidelines, but the number of years each answer adds or removes is our own simple weighting, and the tool has not been validated against a laboratory measure of biological age. Self-reported answers also vary from day to day. It is most useful for spotting which habits to work on, and for tracking your own changes over time.',
  },
  {
    q: 'Is this the same as an epigenetic age test?',
    a: 'No. Epigenetic clocks, such as the one published by Steve Horvath in Genome Biology (2013), estimate age from DNA methylation in a blood or saliva sample analysed in a laboratory. This calculator uses no sample and does not measure DNA methylation, so its result should not be read as your epigenetic age.',
    aNode: (
      <>
        No. Epigenetic clocks, such as the one published by Steve Horvath in Genome Biology (2013),
        estimate age from{' '}
        <MedTerm term="DNA methylation" plain="chemical tags on DNA that change with age" /> in a
        blood or saliva sample analysed in a laboratory. This calculator uses no sample and does
        not measure DNA methylation, so its result should not be read as your epigenetic age.
      </>
    ),
  },
  {
    q: 'Can biological age be lowered?',
    a: 'Many of the habits in this quiz can change. In one small pilot trial (Fitzgerald et al., Aging, 2021; 43 healthy men aged 50–72), an 8-week diet and lifestyle programme was linked to a 3.23-year lower Horvath DNA methylation age compared with the control group; the authors say larger and longer trials are needed. Large cohort studies also link not smoking, moderate exercise and limited alcohol with longer life expectancy.',
  },
  {
    q: 'Why is balance compared with my age group?',
    a: 'Balance naturally changes with age. In a study of 549 adults (Springer et al., 2007), the average best one-leg stand with eyes open was about 45 seconds under 40, 41 seconds in the 50s, 32 seconds in the 60s and 22 seconds in the 70s. Your time is compared with the average for your age, so a typical result scores as typical.',
  },
  {
    q: 'Why does BornClock use Asian BMI and waist cut-offs?',
    a: 'A WHO expert consultation (Lancet, 2004) found that many Asian populations face higher risk of type 2 diabetes and heart disease at lower BMI levels, and suggested extra action points of 23 and 27.5. For waist size we use the International Diabetes Federation values for South Asians: 90 cm for men and 80 cm for women.',
  },
  {
    q: 'How often should I retake it?',
    a: 'Every few months, or after you have changed a habit for a while. Use the same conditions each time (for example the same blood pressure monitor and the same time of day) so your results are comparable.',
  },
  {
    q: 'What if my result is older than my real age?',
    a: 'Please do not worry — this is an estimate, not a diagnosis. Look at the two or three items marked as focus areas and pick one small change. If your blood pressure is 140 or higher, or anything in your results concerns you, talk to a doctor.',
  },
];

// ── Scientific References (all opened and checked, Oct 2026) ─────────────────

function ScientificReferences() {
  const [open, setOpen] = useState(true);

  const refs = [
    'Springer BA, Marin R, Cyhan T, Roberts H, Gill NW. Normative values for the unipedal stance test with eyes open and closed. J Geriatr Phys Ther. 2007;30(1):8-15.',
    'Araujo CG et al. Successful 10-second one-legged stance performance predicts survival in middle-aged and older individuals. Br J Sports Med. 2022;56(17):975-980. doi:10.1136/bjsports-2021-105360',
    'Jensen MT et al. Elevated resting heart rate, physical fitness and all-cause mortality: a 16-year follow-up in the Copenhagen Male Study. Heart. 2013;99(12):882-887. doi:10.1136/heartjnl-2012-303375',
    'Mayo Clinic. Muscular strength and endurance: Pushup test (benchmarks by age and sex).',
    'Yang J et al. Association between push-up exercise capacity and future cardiovascular events among active adult men. JAMA Netw Open. 2019;2(2):e188341. doi:10.1001/jamanetworkopen.2018.8341',
    'Yamamoto K et al. Poor trunk flexibility is associated with arterial stiffening. Am J Physiol Heart Circ Physiol. 2009;297(4):H1314-H1318. doi:10.1152/ajpheart.00061.2009',
    'Cappuccio FP et al. Sleep duration and all-cause mortality: a systematic review and meta-analysis of prospective studies. Sleep. 2010;33(5):585-592. doi:10.1093/sleep/33.5.585',
    'Der G, Deary IJ. Age and sex differences in reaction time in adulthood. Psychol Aging. 2006;21(1):62-73.',
    'WHO Expert Consultation. Appropriate body-mass index for Asian populations and its implications for policy and intervention strategies. Lancet. 2004;363(9403):157-163. doi:10.1016/S0140-6736(03)15268-3',
    'Zimmet PZ, Shaw JE, Alberti KGMM. Mainstreaming the metabolic syndrome: a definitive definition (IDF). Med J Aust. 2005;183(4):175-176.',
    'Whelton PK et al. 2017 ACC/AHA guideline for the prevention, detection, evaluation, and management of high blood pressure in adults. Hypertension. 2018;71(6):e13-e115.',
    'Doll R, Peto R et al. Mortality in relation to smoking: 50 years’ observations on male British doctors. BMJ. 2004;328:1519. doi:10.1136/bmj.38142.554479.AE',
    'Jha P et al. 21st-century hazards of smoking and benefits of cessation in the United States. N Engl J Med. 2013;368:341-350. doi:10.1056/NEJMsa1211128',
    'Wood AM et al. Risk thresholds for alcohol consumption: combined analysis of individual-participant data for 599 912 current drinkers in 83 prospective studies. Lancet. 2018;391:1513-1523. doi:10.1016/S0140-6736(18)30134-X',
    'Wen CP et al. Minimum amount of physical activity for reduced mortality and extended life expectancy: a prospective cohort study. Lancet. 2011;378:1244-1253. doi:10.1016/S0140-6736(11)60749-6',
    'Perri G et al. An expert consensus statement on biomarkers of aging for use in intervention studies. J Gerontol A Biol Sci Med Sci. 2025;80(5). doi:10.1093/gerona/glae297',
    'Horvath S. DNA methylation age of human tissues and cell types. Genome Biol. 2013;14:R115. doi:10.1186/gb-2013-14-10-r115',
    'Fitzgerald KN et al. Potential reversal of epigenetic age using a diet and lifestyle intervention: a pilot randomized clinical trial. Aging (Albany NY). 2021;13(7):9419-9432. doi:10.18632/aging.202913',
  ];

  return (
    <div className="mt-10 mb-6">
      <button
        className="flex items-center justify-between w-full text-left mb-3"
        onClick={() => setOpen(o => !o)}
      >
        <h2 className="text-lg font-semibold text-gray-900">Sources</h2>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {open && (
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-5">
          {refs.map((r, i) => (
            <li key={i} className="leading-relaxed break-words">
              {r}
            </li>
          ))}
        </ol>
      )}
      {open && (
        <p className="text-xs text-gray-600 mt-3 italic text-center">
          Sources last checked: October 2026. Cut-offs come from these sources; the number of
          years per answer is BornClock&rsquo;s own simple weighting.
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
                <ChevronUp className="w-4 h-4 text-gray-600 flex-shrink-0 ml-2" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0 ml-2" />
              )}
            </button>
            <div hidden={open !== i} className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t pt-3">
              {item.aNode ?? item.a}
            </div>
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
      ⚕️ For general information only. This is a lifestyle- and fitness-based estimate from your
      own answers — not a lab test, not an epigenetic clock, not a diagnosis and not medical
      advice. Please talk to a qualified doctor about any health concern, and before starting a
      new exercise routine if you have a medical condition.
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
  const [sex, setSex] = useState<BioSex | null>(null);
  const [openBiomarker, setOpenBiomarker] = useState<string | null>(null);

  const age = parseInt(chronoAge) || 0;
  const profile = { age, sex: sex ?? 'male' as BioSex };
  const canStart = !!sex && age >= 18 && age <= 120;
  const diff = bioAge !== null ? Math.round((bioAge - age) * 10) / 10 : 0;
  const q = BIO_QUESTIONS[current];

  const handleStart = () => {
    if (!canStart) return;
    setStep('quiz');
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    const next = { ...answers, [questionId]: optionId };
    setAnswers(next);
    if (current < BIO_QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
    } else {
      const result = calculateBiologicalAge(parseInt(chronoAge), next, sex ?? 'male');
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
    setSex(null);
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
      ? `🟢 Estimated ${Math.abs(diff).toFixed(1)} years younger than your calendar age`
      : diff <= 3
      ? '🔵 Close to your calendar age'
      : `🟠 Estimated ${diff.toFixed(1)} years older than your calendar age`;

  const motivationalText =
    diff <= -3
      ? 'Your answers point to habits and fitness that are better than typical for your age. Keep going — the same habits are what large long-term studies link with longer, healthier lives.'
      : diff <= 3
      ? 'Your answers are close to typical for your age. Pick one or two items below marked as room to improve — small, steady changes are the ones that last.'
      : 'Your answers suggest a few areas to work on. This is an estimate, not a diagnosis — and most of these items can change with time. Start with one focus area below, and talk to a doctor about anything that concerns you.';

  const questionResults = BIO_QUESTIONS.map(q => {
    const selectedId = answers[q.id];
    const option = q.options.find(o => o.id === selectedId);
    return {
      q,
      selectedId: selectedId ?? '',
      option,
      adjustment: getAdjustment(q, selectedId, profile),
      selectedDisplay: option ? (option.sublabel ? `${option.label} — ${option.sublabel}` : option.label) : '—',
    };
  });

  const needsAttention = questionResults.filter(r => r.adjustment >= 1);
  const top3 = [...questionResults]
    .filter(r => r.adjustment > 0)
    .sort((a, b) => b.adjustment - a.adjustment)
    .slice(0, 3);

  const shareText = bioAge !== null
    ? `My estimated biological age is ${bioAge} (calendar age ${age}) — a lifestyle and fitness estimate from BornClock's free ${BIO_QUESTIONS.length}-question quiz, not a lab test.\nTry it → bornclock.com/biological-age\n#BiologicalAge #BornClock`
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
    description: `Free biological age estimate from ${BIO_QUESTIONS.length} questions on fitness, body size, blood pressure, sleep and habits — a lifestyle- and fitness-based estimate built from published risk factors, not a lab test or epigenetic clock.`,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0' },
    citation: [
      {
        '@type': 'ScholarlyArticle',
        name: 'Normative values for the unipedal stance test with eyes open and closed',
        author: 'Springer BA et al.',
        datePublished: '2007',
        sameAs: 'https://doi.org/10.1519/00139143-200704000-00003',
      },
      {
        '@type': 'ScholarlyArticle',
        name: 'Minimum amount of physical activity for reduced mortality and extended life expectancy',
        author: 'Wen CP et al.',
        datePublished: '2011',
        sameAs: 'https://doi.org/10.1016/S0140-6736(11)60749-6',
      },
    ],
  };

  return (
    <ReportLayout
      theme="science"
      testId="biological-age-page"
      seo={(
        <>
          <SEO
            title="Biological Age Calculator — Free Body Age Test | BornClock"
            description={BIO_AGE_META_DESCRIPTION}
            keywords="biological age calculator, body age calculator, how old is my body, biological age test free, biological age calculator india, biological vs chronological age"
            canonicalUrl="/biological-age"
            ogImage="https://bornclock.com/og/calculator.png"
          />
          <FAQSchema items={faqSchemaItems} />
          <Helmet>
            <script type="application/ld+json">{JSON.stringify(webAppSchema)}</script>
          </Helmet>
        </>
      )}
      breadcrumb={{ trail: [{ label: 'Science & Longevity', to: '/science-longevity/' }], current: 'Biological Age' }}
      eyebrow="Biological Age"
      h1="Biological Age Calculator — How Old Is Your Body?"
      lead={(
        <>
          A free, {BIO_QUESTIONS.length}-question estimate of how your fitness, body size, blood
          pressure, sleep and habits compare with what is typical for your age. It is a
          lifestyle- and fitness-based estimate built from published risk factors — not a lab
          test or an epigenetic clock.
        </>
      )}
      footer={{ note: '© 2026 BornClock · Science & longevity tools. Educational only — not medical advice.' }}
    >

      <div className="container mx-auto px-4 py-8">

        {/* ── INTRO ── */}
        {step === 'intro' && (
          <div className="max-w-2xl mx-auto pb-16">
            {/* Hero intro tagline (H1 + lead now live in the central layout header) */}
            <div className="text-center mb-8 pt-4">
              <PageTagline />
            </div>

            {/* Concise answer block (AEO) */}
            <div className="max-w-2xl mx-auto mb-6 bg-brand-blue/10 border-l-4 border-brand-blue/30 rounded-r-xl p-5 text-left">
              <h2 className="text-lg font-bold text-gray-900 mb-2">What is my biological age?</h2>
              <p className="text-gray-700 leading-relaxed">
                Biological age is an estimate of how your body is doing compared with your calendar
                age. This calculator works it out from {BIO_QUESTIONS.length} simple questions — resting
                heart rate, push-ups, one-leg balance, stair climbing, sleep, flexibility, memory,
                reaction speed, BMI, waist size, blood pressure, energy, smoking, alcohol and
                physical activity. Each answer adds or removes a few years. It is{' '}
                <span className="font-semibold">free, with no sign-up</span>, and it is a rough
                guide — not a lab test or a diagnosis.
              </p>
            </div>

            {/* How it works — honest basis */}
            <div className="bg-brand-blue/10 border border-brand-blue/30 rounded-2xl p-6 mb-6">
              <h2 className="text-brand-blue font-bold text-base mb-3">How this estimate works</h2>
              <ul className="space-y-2 text-sm text-gray-700 leading-relaxed list-disc pl-5">
                <li>
                  The cut-offs come from published studies and guidelines — for example age-group
                  balance norms (Springer et al., 2007), Asian BMI action points (WHO expert
                  consultation, 2004), South Asian waist cut-offs (IDF, 2005), blood pressure
                  categories (ACC/AHA, 2017) and large studies on smoking, alcohol and exercise.
                </li>
                <li>
                  Balance and push-ups are compared with what is typical for your age (and sex for
                  push-ups), so a typical result scores as typical.
                </li>
                <li>
                  Each answer moves your age by a small, fixed number of years (BornClock&rsquo;s own
                  weighting), capped at ±{MAX_TOTAL_ADJUSTMENT} years in total. The tool has not
                  been validated against a laboratory test.
                </li>
              </ul>
            </div>

            {/* What we ask */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
              <p className="text-gray-900 font-semibold text-sm mb-3">
                The {BIO_QUESTIONS.length} questions cover:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-700">
                {BIO_QUESTIONS.map(item => (
                  <div key={item.id} className="flex items-start gap-2">
                    <span className="text-brand-blue mt-0.5 flex-shrink-0 text-xs">●</span>
                    <span className="text-xs leading-snug">{item.biomarkerName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gold standard note */}
            <p className="text-xs italic text-gray-600 text-center max-w-2xl mx-auto mb-4">
              ⚕️ Laboratory measures of biological age, such as DNA methylation (epigenetic) clocks
              (Horvath, Genome Biology, 2013), need a blood or saliva sample. This quiz uses no
              sample and does not measure DNA methylation, so its result is not your epigenetic age.
            </p>

            {/* Motivational paragraph */}
            <p className="text-gray-700 max-w-xl mx-auto text-center text-sm leading-relaxed mb-8">
              Most of these items can change with time — how you move, sleep, eat and drink, and
              whether you smoke. Treat your result as a starting point to track, not a verdict.
            </p>

            {/* Age input card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-auto mb-4">
              <label htmlFor="bio-age-input" className="block text-sm font-semibold text-gray-800 mb-1">
                Your current age
              </label>
              <p className="text-xs text-gray-500 mb-3">18 or older</p>
              <input
                id="bio-age-input"
                type="number"
                min={18}
                max={100}
                placeholder="e.g. 35"
                value={chronoAge}
                onChange={e => setChronoAge(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-xl text-center focus:outline-none focus:ring-2 focus:ring-brand-navy mb-4"
              />
              <p className="block text-sm font-semibold text-gray-800 mb-1">Sex</p>
              <p className="text-xs text-gray-500 mb-2">Used for the push-up benchmark and waist cut-off</p>
              <div className="flex gap-2 mb-4" role="group" aria-label="Sex">
                {(['male', 'female'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSex(s)}
                    aria-pressed={sex === s}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sex === s ? 'bg-brand-navy text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {s === 'male' ? 'Male' : 'Female'}
                  </button>
                ))}
              </div>
              <button
                disabled={!canStart}
                onClick={handleStart}
                className="w-full bg-brand-navy hover:bg-brand-navy disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Start the Biological Age Quiz
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Medical disclaimer */}
            <MedicalDisclaimer />

            {/* EEAT editorial standards */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-w-2xl mx-auto mt-6">
              <p className="text-gray-600 text-xs leading-relaxed">
                <span className="font-semibold text-gray-900">📋 Editorial Standards</span>
                {' '}Every cut-off on this page comes from a study or guideline we opened and checked;
                the full list is shown with your result. We do not accept advertising that influences
                our health content. Sources last checked: October 2026.
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
                  Question {current + 1} of {BIO_QUESTIONS.length} — {q.biomarkerName}
                </span>
                <span>{Math.round(((current + 1) / BIO_QUESTIONS.length) * 100)}% complete</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-brand-navy rounded-full transition-all duration-300"
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
                <div className="bg-brand-blue/10 border-l-4 border-brand-blue/30 px-3 py-2 text-sm text-brand-blue mb-4 rounded-r-lg leading-relaxed">
                  💡 {q.motivationalContext}
                </div>
              )}

              {/* Calculator questions */}
              {q.hasCalculator ? (
                <>
                  {q.calculatorType === 'bmi' ? (
                    <BMICalculator onSelect={optionId => handleAnswer(q.id, optionId)} />
                  ) : (
                    <WaistCalculator
                      onSelect={optionId => handleAnswer(q.id, optionId)}
                      sex={sex ?? 'male'}
                    />
                  )}
                </>
              ) : (
                <>
                  {/* Blood pressure nudge */}
                  {q.id === 'bloodPressure' && (
                    <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                      💡 Not checked recently? A reading takes a couple of minutes at most pharmacies
                      or with a home monitor. You can choose &ldquo;I don&rsquo;t know&rdquo; for now and
                      retake the quiz later.
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => handleAnswer(q.id, opt.id)}
                        className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-brand-blue/30 hover:bg-brand-blue/10 transition-all"
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
              {q.source && (
                <p className="text-xs text-gray-600 mt-4 text-center italic">[{q.source}]</p>
              )}
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {step === 'result' && bioAge !== null && (
          <div className="max-w-3xl mx-auto pb-16 space-y-6">

            {/* ── SECTION A: INSPIRED ── */}
            <div className="bg-gradient-to-b from-slate-900 to-brand-blue text-white p-8 rounded-2xl">
              <div className="text-center">
                <p className="text-slate-400 text-sm uppercase tracking-widest font-medium">
                  Your Estimated Biological Age
                </p>
                <p className="text-slate-500 text-xs mt-1">{today}</p>

                <div className={`text-8xl font-black mt-6 mb-1 leading-none ${bioAgeColor}`}>
                  {bioAge}
                </div>
                <p className="text-lg font-semibold text-slate-400 mb-1">years (estimate)</p>
                <p className="text-slate-400 text-base">
                  vs your calendar age of {age} years
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
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Your Answers, Item by Item</h2>
              <p className="text-sm text-gray-500 mb-4">
                How many years each answer added or removed. Self-reported answers — a rough guide,
                not a measurement.
              </p>

              {/* Biomarker table */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">
                          Item
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">
                          Category
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">
                          Your Result
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">
                          Effect
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
                                <span className="text-gray-600">Neutral</span>
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
                          Net adjustment (capped at ±{MAX_TOTAL_ADJUSTMENT} years)
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
                  ✅ None of your answers added years. Keep up the habits that got you here.
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
                            <ChevronUp className="w-4 h-4 text-gray-600 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />
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
                            {row.instruction && (
                              <p>
                                <span className="font-semibold text-gray-800">About this item:</span>{' '}
                                {row.instruction}
                              </p>
                            )}
                            {row.source && (
                              <p className="text-xs text-gray-600 italic">Source: {row.source}</p>
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
                Your Top 3 Focus Areas
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                The answers that added the most years, with simple first steps
              </p>

              {top3.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-emerald-800 text-sm">
                  🎉 None of your answers added years. Keep up regular sleep, movement and good
                  food habits.
                </div>
              ) : (
                <div className="space-y-4">
                  {top3.map(({ q: row, adjustment, selectedDisplay }) => {
                    const cat = CATEGORY_CONFIG[row.category];
                    const bestAdj = bestAdjustment(row, profile);
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
                            Added +{adjustment} years to your estimate
                          </p>
                          <p className="text-emerald-600 font-semibold text-sm mt-2">
                            In this quiz, the best answer here would score {potentialReduction} years lower
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
              <div className="bg-gradient-to-r from-brand-blue to-brand-blue rounded-2xl p-6 text-center mt-6">
                <p className="text-white font-semibold text-base mb-1">
                  🔬 Curious how habits relate to life expectancy?
                </p>
                <p className="text-white/90 text-sm mb-4">
                  The BornClock life expectancy calculator starts from official averages for your
                  country and adjusts for your habits.
                </p>
                <Link
                  to="/life-expectancy/"
                  className="inline-block bg-white text-brand-blue font-semibold px-6 py-3 rounded-xl hover:bg-brand-blue/10 transition-colors"
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

            {/* EEAT footer */}
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              Cut-offs checked against the sources listed above (October 2026). The points per answer
              are BornClock&rsquo;s own simple weighting.
            </p>

            {/* Medical disclaimer on result page */}
            <MedicalDisclaimer />
          </div>
        )}

        {/* ── FAQ: shown on every step so the FAQPage JSON-LD matches visible content ── */}
        <div className="max-w-3xl mx-auto px-4">
          <FAQSection />
        </div>

        {/* P1-H internal linking */}
        <section className="max-w-3xl mx-auto mb-12 px-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Related Topics</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { path: '/life-expectancy/', label: 'Life Expectancy Calculator' },
              { path: '/country-comparison/', label: 'Country Comparison' },
              { path: '/coach/', label: 'Longevity Coach' },
              { path: '/biological-age-vs-chronological-age/', label: 'Biological vs Chronological Age' },
              { path: '/answers/what-is-my-biological-age/', label: 'What Is My Biological Age?' },
            ].map((t) => (
              <Link key={t.path} to={t.path} className="text-sm px-3 py-1.5 rounded-full border border-gray-200 hover:border-brand-blue/30 hover:bg-brand-blue/10 text-gray-700 hover:text-brand-blue transition-colors">{t.label}</Link>
            ))}
          </div>
        </section>
      </div>

      <div className="max-w-3xl mx-auto mt-12 px-4 mb-8">
        <div className="p-4 rounded-xl border border-border bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sources &amp; Methodology</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-none">
            <li>Balance norms — Springer et al., J Geriatr Phys Ther 2007; one-leg stance and survival — Araujo et al., Br J Sports Med 2022</li>
            <li>Asian BMI action points — WHO Expert Consultation, Lancet 2004; South Asian waist cut-offs — IDF 2005 (Zimmet et al., Med J Aust 2005)</li>
            <li>Smoking — Doll et al., BMJ 2004; Jha et al., NEJM 2013 · Alcohol — Wood et al., Lancet 2018 · Exercise — Wen et al., Lancet 2011</li>
            <li>Epigenetic clocks (not used here) — Horvath, Genome Biology 2013</li>
          </ul>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-8 mb-4 px-4">
        Last reviewed: October 2026 · Sources opened and checked by the BornClock team
      </p>
    </ReportLayout>
  );
};

export default BiologicalAge;

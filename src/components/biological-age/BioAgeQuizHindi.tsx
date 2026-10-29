import { useState } from 'react';
import {
  BIO_QUESTIONS,
  MAX_TOTAL_ADJUSTMENT,
  bmiOptionId,
  calculateBMI,
  calculateBiologicalAge,
  getAdjustment,
  waistCutoffCm,
  waistOptionId,
  type BioSex,
} from '@/services/BiologicalAgeService';
import { BIO_QUESTIONS_HI } from '@/services/biologicalAgeHindi';

/**
 * Hindi version of the biological-age quiz. Same questions and scoring as the
 * English calculator at /biological-age (src/services/BiologicalAgeService.ts).
 */
export default function BioAgeQuizHindi() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [ageText, setAgeText] = useState('');
  const [sex, setSex] = useState<BioSex | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [waist, setWaist] = useState('');

  const age = parseInt(ageText) || 0;
  const canStart = !!sex && age >= 18 && age <= 120;
  const profile = { age, sex: sex ?? ('male' as BioSex) };
  const q = BIO_QUESTIONS[current];
  const hi = BIO_QUESTIONS_HI[q.id];

  const answer = (optionId: string) => {
    const next = { ...answers, [q.id]: optionId };
    setAnswers(next);
    if (current < BIO_QUESTIONS.length - 1) setCurrent(c => c + 1);
    else setStep('result');
  };

  const reset = () => {
    setStep('intro');
    setCurrent(0);
    setAnswers({});
    setWeight('');
    setHeight('');
    setWaist('');
  };

  const w = parseFloat(weight);
  const h = parseFloat(height);
  const bmi = w > 0 && h > 0 ? calculateBMI(w, h) : null;
  const waistNum = parseFloat(waist);

  if (step === 'intro') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
        <label htmlFor="bio-age-hi" className="block text-sm font-semibold text-gray-800 mb-1">
          आपकी उम्र (18 या ज़्यादा)
        </label>
        <input
          id="bio-age-hi"
          type="number"
          min={18}
          max={100}
          placeholder="जैसे 35"
          value={ageText}
          onChange={e => setAgeText(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 text-xl text-center mb-4 focus:outline-none focus:ring-2 focus:ring-[#0E2238]"
        />
        <p className="text-sm font-semibold text-gray-800 mb-1">लिंग</p>
        <p className="text-xs text-gray-500 mb-2">पुश-अप के पैमाने और कमर की सीमा के लिए</p>
        <div className="flex gap-2 mb-4" role="group" aria-label="लिंग">
          {(['male', 'female'] as const).map(s => (
            <button
              key={s}
              type="button"
              aria-pressed={sex === s}
              onClick={() => setSex(s)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                sex === s ? 'bg-[#0E2238] text-white' : 'bg-white border text-gray-600'
              }`}
            >
              {s === 'male' ? 'पुरुष' : 'महिला'}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!canStart}
          onClick={() => setStep('quiz')}
          className="w-full bg-[#0E2238] disabled:opacity-40 text-white font-semibold py-3 rounded-xl"
        >
          Biological Age Quiz शुरू करें →
        </button>
      </div>
    );
  }

  if (step === 'quiz') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
        <p className="text-sm text-muted-foreground mb-2">
          सवाल {current + 1} / {BIO_QUESTIONS.length} — {hi.name}
        </p>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-5">
          <div
            className="h-2 bg-[#0E2238]"
            style={{ width: `${((current + 1) / BIO_QUESTIONS.length) * 100}%` }}
          />
        </div>
        <h3 className="font-semibold text-lg text-gray-900 mb-1">{hi.question}</h3>
        {hi.instruction && <p className="text-sm text-gray-500 mb-4">{hi.instruction}</p>}

        {q.calculatorType === 'bmi' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-gray-700">
                वज़न (किलो)
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70"
                  className="mt-1 w-full border rounded-lg px-3 py-2" />
              </label>
              <label className="text-sm text-gray-700">
                कद (सेमी)
                <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="165"
                  className="mt-1 w-full border rounded-lg px-3 py-2" />
              </label>
            </div>
            {bmi !== null && (
              <button type="button" onClick={() => answer(bmiOptionId(bmi))}
                className="w-full bg-[#0E2238] text-white font-semibold py-3 rounded-xl">
                मेरा BMI {bmi} — {hi.options[bmiOptionId(bmi)]} → आगे
              </button>
            )}
          </div>
        ) : q.calculatorType === 'waist' ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              आपके लिए सीमा: <strong>{waistCutoffCm(profile.sex)} सेमी</strong> (IDF, दक्षिण एशियाई)
            </p>
            <label className="text-sm text-gray-700 block max-w-xs">
              कमर (सेमी)
              <input type="number" value={waist} onChange={e => setWaist(e.target.value)} placeholder="85"
                className="mt-1 w-full border rounded-lg px-3 py-2" />
            </label>
            {waistNum > 0 && (
              <button type="button" onClick={() => answer(waistOptionId(waistNum, profile.sex))}
                className="w-full bg-[#0E2238] text-white font-semibold py-3 rounded-xl">
                {waistNum} सेमी — {hi.options[waistOptionId(waistNum, profile.sex)]} → आगे
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {q.options.map(o => (
              <button
                key={o.id}
                type="button"
                onClick={() => answer(o.id)}
                className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-[#2F6FB0]/10 text-sm text-gray-900"
              >
                {hi.options[o.id] ?? o.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const bioAge = calculateBiologicalAge(age, answers, profile.sex);
  const diff = Math.round((bioAge - age) * 10) / 10;
  const rows = BIO_QUESTIONS.map(qq => ({
    id: qq.id,
    name: BIO_QUESTIONS_HI[qq.id].name,
    adj: getAdjustment(qq, answers[qq.id], profile),
  }));
  const focus = rows.filter(r => r.adj > 0).sort((a, b) => b.adj - a.adj).slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="bg-gradient-to-b from-slate-900 to-[#2F6FB0] text-white p-6 rounded-2xl text-center">
        <p className="text-slate-300 text-sm">आपकी अनुमानित Biological Age</p>
        <p className="text-7xl font-black my-2">{bioAge}</p>
        <p className="text-slate-300">असली उम्र: {age} साल</p>
        <p className="mt-3 font-semibold">
          {diff <= -3
            ? `आपकी उम्र से लगभग ${Math.abs(diff)} साल कम`
            : diff <= 3
            ? 'आपकी उम्र के आसपास'
            : `आपकी उम्र से लगभग ${diff} साल ज़्यादा`}
        </p>
        <p className="text-sm text-slate-200 mt-3">
          यह आपके जवाबों पर आधारित एक मोटा अंदाज़ा है — कोई लैब टेस्ट या बीमारी की जाँच नहीं।
        </p>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left py-2 px-4">सवाल</th>
              <th className="text-left py-2 px-4">असर (साल)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b">
                <td className="py-2 px-4">{r.name}</td>
                <td className={`py-2 px-4 font-medium ${r.adj < 0 ? 'text-emerald-600' : r.adj > 0 ? 'text-red-500' : 'text-gray-600'}`}>
                  {r.adj > 0 ? `+${r.adj}` : r.adj === 0 ? '0' : `−${Math.abs(r.adj)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-500 px-4 py-2">कुल असर ±{MAX_TOTAL_ADJUSTMENT} साल तक सीमित है।</p>
      </div>

      {focus.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
          <p className="font-semibold mb-1">सबसे पहले इन पर ध्यान दें:</p>
          <ul className="list-disc pl-5">
            {focus.map(f => <li key={f.id}>{f.name}</li>)}
          </ul>
        </div>
      )}

      <button type="button" onClick={reset}
        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm">
        दोबारा करें
      </button>
    </div>
  );
}

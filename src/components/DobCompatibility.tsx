import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  calculateWesternZodiac, calculateVedicRashi,
  calculateLifePathNumber,
} from '@/utils/celebrityCalculations';

/**
 * DOB-based 4-dimension compatibility (zodiac · rashi · life path · nakshatra).
 * Complements the sign-based calculator on /compatibility. All scoring is a
 * transparent, deterministic cultural heuristic — never a prediction.
 */

interface Dob { day: number; month: number; year: number; }

function parse(dob: string): Dob | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  const year = +m[1], month = +m[2], day = +m[3];
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { day, month, year };
}

const ELEMENT_SCORE: Record<string, number> = {
  'Fire-Fire': 82, 'Earth-Earth': 84, 'Air-Air': 80, 'Water-Water': 85,
  'Fire-Air': 83, 'Air-Fire': 83, 'Earth-Water': 82, 'Water-Earth': 82,
  'Fire-Earth': 66, 'Earth-Fire': 66, 'Air-Water': 65, 'Water-Air': 65,
  'Fire-Water': 55, 'Water-Fire': 55, 'Air-Earth': 60, 'Earth-Air': 60,
};
const verdict = (s: number) => (s >= 75 ? 'Highly compatible' : s >= 62 ? 'Balanced' : 'Challenging');

function elementScore(e1: string, e2: string): number {
  return ELEMENT_SCORE[`${e1}-${e2}`] ?? 70;
}

function Dimension({ id, icon, title, score, detail }: { id: string; icon: string; title: string; score: number; detail: string }) {
  return (
    <div data-testid={id} className="rounded-xl border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-gray-900">{icon} {title}</span>
        <span className="font-bold text-indigo-600">{score}%</span>
      </div>
      <p className="text-sm text-gray-600">{detail}</p>
    </div>
  );
}

export default function DobCompatibility() {
  const [dobA, setDobA] = useState('');
  const [dobB, setDobB] = useState('');
  const [res, setRes] = useState<null | {
    zodiac: { score: number; text: string };
    rashi: { score: number; text: string };
    lifepath: { score: number; text: string };
    overall: number;
  }>(null);

  const canCalc = parse(dobA) !== null && parse(dobB) !== null;

  const calculate = () => {
    const a = parse(dobA), b = parse(dobB);
    if (!a || !b) return;

    const zA = calculateWesternZodiac(a.day, a.month);
    const zB = calculateWesternZodiac(b.day, b.month);
    const zScore = elementScore(zA.element, zB.element);
    const zText = `${zA.sign} (${zA.element}) and ${zB.sign} (${zB.element}) — ${verdict(zScore).toLowerCase()}. ${zA.element}–${zB.element} pairings ${zScore < 62 ? 'are challenging and need conscious effort' : 'tend to align well'}.`;

    const rA = calculateVedicRashi(a.day, a.month);
    const rB = calculateVedicRashi(b.day, b.month);
    const rScore = elementScore(rA.element, rB.element);
    const rText = `${rA.rashi} Rashi and ${rB.rashi} Rashi — ${verdict(rScore).toLowerCase()} on the Vedic element axis (${rA.element}–${rB.element}).`;

    const lpA = calculateLifePathNumber(a.day, a.month, a.year);
    const lpB = calculateLifePathNumber(b.day, b.month, b.year);
    const diff = Math.min(Math.abs(lpA - lpB), 9 - Math.abs(lpA - lpB));
    const lpScore = Math.max(50, 92 - diff * 8);
    const lpText = `Life Path ${lpA} and Life Path ${lpB} — ${verdict(lpScore).toLowerCase()}. ${lpA === lpB ? 'Identical life paths share the same core drive.' : 'Different numbers can complement each other.'}`;

    // Nakshatra dimension removed: accurate Nakshatra needs exact birth times
    // for BOTH people (see NakshatraPlaceholder). Sun-sign date-only matching
    // cannot produce it honestly, so this is a 3-dimension compatibility.
    const overall = Math.round((zScore + rScore + lpScore) / 3);
    setRes({
      zodiac: { score: zScore, text: zText },
      rashi: { score: rScore, text: rText },
      lifepath: { score: lpScore, text: lpText },
      overall,
    });
  };

  const shareText = res
    ? `Our birthday compatibility is ${res.overall}%! Check yours free at https://bornclock.com/compatibility`
    : '';
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText).replace(/'/g, '%27')}`;

  return (
    <div className="bg-indigo-50 rounded-2xl p-6 mb-10 border border-indigo-200">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Full Birthday Compatibility</h2>
      <p className="text-sm text-gray-600 mb-4">
        Enter two dates of birth to compare across three dimensions — Western zodiac, Vedic rashi and Life Path number.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block" htmlFor="compat-dob-a">Person A — date of birth</label>
          <input
            id="compat-dob-a"
            data-testid="compat-dob-a"
            type="date"
            value={dobA}
            onChange={(e) => setDobA(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block" htmlFor="compat-dob-b">Person B — date of birth</label>
          <input
            id="compat-dob-b"
            data-testid="compat-dob-b"
            type="date"
            value={dobB}
            onChange={(e) => setDobB(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
          />
        </div>
      </div>
      <button
        data-testid="compat-calc-btn"
        onClick={calculate}
        disabled={!canCalc}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        Calculate compatibility →
      </button>

      {res && (
        <div className="mt-6 space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Overall compatibility</p>
            <p data-testid="compat-overall-score" className="text-4xl font-black text-indigo-600">{res.overall}%</p>
          </div>
          <Dimension id="compat-zodiac" icon="♈" title="Western Zodiac" score={res.zodiac.score} detail={res.zodiac.text} />
          <Dimension id="compat-rashi" icon="🕉️" title="Vedic Rashi" score={res.rashi.score} detail={res.rashi.text} />
          <Dimension id="compat-lifepath" icon="🔢" title="Life Path" score={res.lifepath.score} detail={res.lifepath.text} />
          <p data-testid="compat-nakshatra-disclaimer" className="text-xs text-gray-500 italic">
            Nakshatra (Guna Milan) compatibility needs both people's exact birth times — get it in the full{' '}
            <a href="/kundali-match" className="text-indigo-600 underline">Kundali match</a>.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              data-testid="compat-whatsapp-share"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white rounded-lg px-5 py-3 font-semibold hover:bg-green-700 transition-colors"
            >
              Share on WhatsApp
            </a>
            <Link
              to="/birthday-report"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white rounded-lg px-5 py-3 font-semibold hover:bg-indigo-700 transition-colors"
            >
              Get the full Birthday Report →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

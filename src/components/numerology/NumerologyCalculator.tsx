/**
 * Batch 9 — THE Mulank / Bhagyank / name-number calculator, shared by /numerology
 * (English) and /hi/numerology-by-date-of-birth (Hindi). Every number comes from one
 * shared function: mulank(), bhagyank(), chaldeanName() (src/lib/numerologyExtra.ts),
 * lifePathWorking() (src/lib/lifePath.ts) and compoundReading() (numerologyTools.ts).
 *
 * Founder decision: both systems are shown, always labelled — the Indian numbers are
 * reduced to 1–9 as Indian calculators do; a master number 11/22/33 is shown separately
 * as "Western master number"; the Western Life Path keeps its own label.
 */
import { useMemo, useState } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { TermTip } from '@/components/vedic/TermTip';
import { mulank, bhagyank, chaldeanName } from '@/lib/numerologyExtra';
import { lifePathWorking } from '@/lib/lifePath';
import { compoundReading, compoundBasisNote } from '@/lib/numerologyTools';
import { MULANK_MEANINGS, NAME_NUMBER_INDIAN_MEANINGS } from '@/data/indianNumberMeanings';

type Lang = 'en' | 'hi';

const T = {
  en: {
    dob: 'Date of birth',
    name: 'Full name (optional — for your name number)',
    namePh: 'e.g. Shah Rukh Khan',
    prompt: 'Enter your date of birth to see your Mulank, Bhagyank and Western Life Path, with the working.',
    invalid: 'Please enter a real date of birth.',
    mulank: 'Mulank (Indian method)',
    mulankSub: 'from your birth day only',
    bhagyank: 'Bhagyank (Indian / Vedic method)',
    bhagyankSub: 'every digit of your full date',
    westernMaster: 'Western master number',
    westernMasterNote: (m: number, b: number) => `The Western Life Path keeps ${m} as a master number instead of reducing it to ${b}. Same date, two conventions — both shown so you can compare.`,
    lifePath: 'Western Life Path',
    lifePathSub: 'day, month and year reduced separately; 11/22/33 kept',
    lifePathLink: (n: number) => `What Life Path ${n} means →`,
    nameNum: 'Name number (Chaldean, Indian method)',
    nameSub: (t: number) => `letter total ${t}`,
    compound: 'Compound number',
    noCompound: 'Your letter total is a single digit, so there is no separate compound number.',
    nameLink: 'Full name calculator (Chaldean + Western) →',
    ruled: 'Ruling planet',
    working: 'Working',
  },
  hi: {
    dob: 'जन्मतिथि',
    name: 'पूरा नाम (वैकल्पिक — नामांक के लिए)',
    namePh: 'जैसे Shah Rukh Khan (अंग्रेज़ी अक्षरों में)',
    prompt: 'अपनी जन्मतिथि डालें — मूलांक, भाग्यांक और Western Life Path गणना के साथ दिखेंगे।',
    invalid: 'कृपया सही जन्मतिथि डालें।',
    mulank: 'मूलांक (भारतीय पद्धति)',
    mulankSub: 'केवल जन्म की तारीख़ से',
    bhagyank: 'भाग्यांक (भारतीय / वैदिक पद्धति)',
    bhagyankSub: 'पूरी जन्मतिथि के सभी अंक',
    westernMaster: 'Western मास्टर अंक',
    westernMasterNote: (m: number, b: number) => `Western Life Path में ${m} को मास्टर अंक मानकर ${b} तक नहीं घटाया जाता। एक ही तारीख़, दो परंपराएँ — तुलना के लिए दोनों दिखाए गए हैं।`,
    lifePath: 'Western Life Path (जीवन पथ अंक)',
    lifePathSub: 'दिन, महीना और वर्ष अलग-अलग घटाकर; 11/22/33 वैसे ही',
    lifePathLink: (n: number) => `Life Path ${n} का अर्थ (English) →`,
    nameNum: 'नामांक (कैल्डियन, भारतीय पद्धति)',
    nameSub: (t: number) => `अक्षरों का योग ${t}`,
    compound: 'संयुक्त अंक',
    noCompound: 'अक्षरों का योग एक ही अंक है, इसलिए अलग संयुक्त अंक नहीं है।',
    nameLink: 'पूरा नाम कैलकुलेटर (English) →',
    ruled: 'स्वामी ग्रह',
    working: 'गणना',
  },
} as const;

/** "YYYY-MM-DD" → parts, or null when not a real calendar date. */
export function parseIsoDate(v: string): { day: number; month: number; year: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return null;
  const year = Number(m[1]), month = Number(m[2]), day = Number(m[3]);
  if (year < 1000 || month < 1 || month > 12 || day < 1) return null;
  const dim = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day > dim) return null;
  return { day, month, year };
}

function toIso(d: Date | null | undefined): string {
  if (!d || isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

interface Props {
  lang?: Lang;
  initialDate?: Date | null;
  onDateChange?: (d: Date | null) => void;
}

export function NumerologyCalculator({ lang = 'en', initialDate, onDateChange }: Props) {
  const t = T[lang];
  const hi = lang === 'hi';
  const [dob, setDob] = useState(toIso(initialDate));
  const [name, setName] = useState('');

  const parts = parseIsoDate(dob);
  const res = useMemo(() => {
    if (!parts) return null;
    return {
      mul: mulank(parts.day),
      bh: bhagyank(parts.day, parts.month, parts.year),
      lp: lifePathWorking(parts.day, parts.month, parts.year),
    };
  }, [parts?.day, parts?.month, parts?.year]); // eslint-disable-line react-hooks/exhaustive-deps

  const nameRes = useMemo(() => {
    const n = chaldeanName(name);
    return n.letters.length ? n : null;
  }, [name]);
  const compound = nameRes ? compoundReading(nameRes.total) : null;

  const onDob = (v: string) => {
    setDob(v);
    const p = parseIsoDate(v);
    onDateChange?.(p ? new Date(p.year, p.month - 1, p.day) : null);
  };

  const mulMeaning = res ? MULANK_MEANINGS[res.mul.number] : null;
  const nameMeaning = nameRes ? NAME_NUMBER_INDIAN_MEANINGS[nameRes.root] : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6" data-testid="numerology-calculator">
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <label className="text-sm">
          <span className="block font-semibold text-foreground mb-1">{t.dob}</span>
          <input
            type="date"
            data-testid="num-dob"
            value={dob}
            max={toIso(new Date())}
            onChange={e => onDob(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground"
          />
        </label>
        <label className="text-sm">
          <span className="block font-semibold text-foreground mb-1">{t.name}</span>
          <input
            type="text"
            data-testid="num-name"
            value={name}
            placeholder={t.namePh}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 bg-background text-foreground"
          />
        </label>
      </div>

      {!dob && <p className="text-sm text-muted-foreground" data-testid="num-prompt">{t.prompt}</p>}
      {dob && !parts && <p className="text-sm text-destructive" data-testid="num-invalid">{t.invalid}</p>}

      {res && (
        <div className="grid sm:grid-cols-2 gap-4" data-testid="num-results">
          <div className="rounded-xl border border-primary/40 p-4" data-testid="num-mulank">
            <div className="text-xs text-muted-foreground">
              <TermTip id="mulank" lang={lang}>{t.mulank}</TermTip> · {t.mulankSub}
            </div>
            <div className="text-4xl font-black text-primary my-1">{res.mul.number}</div>
            <div className="text-xs text-muted-foreground font-mono">{t.working}: {res.mul.working}</div>
            {mulMeaning && (
              <>
                <div className="font-semibold text-foreground mt-2">{hi ? mulMeaning.titleHi : mulMeaning.title}</div>
                <p className="text-sm text-muted-foreground">{hi ? mulMeaning.textHi : mulMeaning.text}</p>
                <div className="text-xs text-muted-foreground mt-1">{t.ruled}: {hi ? mulMeaning.planetHi : mulMeaning.planet}</div>
              </>
            )}
          </div>

          <div className="rounded-xl border border-primary/40 p-4" data-testid="num-bhagyank">
            <div className="text-xs text-muted-foreground">
              <TermTip id="bhagyank" lang={lang}>{t.bhagyank}</TermTip> · {t.bhagyankSub}
            </div>
            <div className="text-4xl font-black text-primary my-1">{res.bh.number}</div>
            <div className="text-xs text-muted-foreground font-mono break-words">{t.working}: {res.bh.working}</div>
            {res.bh.westernMaster && (
              <div className="mt-3 rounded-lg bg-muted/50 p-3" data-testid="num-western-master">
                <div className="text-sm font-semibold text-foreground">
                  <TermTip id="masterNumber" lang={lang}>{t.westernMaster}</TermTip>: {res.bh.westernMaster}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t.westernMasterNote(res.bh.westernMaster, res.bh.number)}</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border p-4 sm:col-span-2" data-testid="num-lifepath">
            <div className="text-xs text-muted-foreground">
              <TermTip id="lifePath" lang={lang}>{t.lifePath}</TermTip> · {t.lifePathSub}
            </div>
            <div className="text-3xl font-black text-foreground my-1">{res.lp.number}</div>
            <div className="text-xs text-muted-foreground font-mono break-words">{t.working}: {res.lp.steps}</div>
            <Link to={`/numerology/${res.lp.number}`} className="inline-block text-sm text-primary hover:underline mt-2">{t.lifePathLink(res.lp.number)}</Link>
          </div>
        </div>
      )}

      {nameRes && (
        <div className="rounded-xl border border-primary/40 p-4 mt-4" data-testid="num-name-result">
          <div className="text-xs text-muted-foreground">
            <TermTip id="chaldean" lang={lang}>{t.nameNum}</TermTip> · {t.nameSub(nameRes.total)}
          </div>
          <div className="text-4xl font-black text-primary my-1">{nameRes.root}</div>
          <div className="text-xs text-muted-foreground font-mono break-words">
            {t.working}: {nameRes.letters.map(l => `${l.ch.toUpperCase()}=${l.value}`).join(' ')} → {nameRes.total}{nameRes.total > 9 ? ` → ${nameRes.root}` : ''}
          </div>
          {nameMeaning && (
            <p className="text-sm text-muted-foreground mt-2">
              <strong className="text-foreground">{hi ? nameMeaning.titleHi : nameMeaning.title}</strong> — {hi ? nameMeaning.textHi : nameMeaning.text}
            </p>
          )}
          {nameRes.master && (
            <div className="mt-2 text-sm" data-testid="num-name-master">
              <span className="font-semibold text-foreground"><TermTip id="masterNumber" lang={lang}>{t.westernMaster}</TermTip>: {nameRes.master}</span>
              <span className="text-muted-foreground"> — {t.westernMasterNote(nameRes.master, nameRes.root)}</span>
            </div>
          )}
          <div className="mt-3 text-sm">
            <span className="font-semibold text-foreground"><TermTip id="compoundNumber" lang={lang}>{t.compound}</TermTip>: </span>
            {compound ? (
              <span className="text-muted-foreground">
                {compound.total} — {compound.meaning.name}. {compound.meaning.text}
                <span className="block text-xs mt-1">{compoundBasisNote(compound, lang)}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">{t.noCompound}</span>
            )}
          </div>
          <Link to="/name-numerology/" className="inline-block text-sm text-primary hover:underline mt-2">{t.nameLink}</Link>
        </div>
      )}
    </div>
  );
}

export default NumerologyCalculator;

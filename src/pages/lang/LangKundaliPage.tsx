/**
 * B18 — Ashtakoota (36 guna) matching in a regional language. Same calculation as
 * /kundali-match and /hi/kundli-milan: the SAME /api/kundali-match endpoint (AstroSage
 * conventions, Manglik from Lagna AND Moon). Only the labels, explanations and the
 * free-first remedies are written in the language.
 */
import { useState } from 'react';
import { Link } from '@/components/seo/CanonicalLink';
import { CityPicker } from '@/components/CityPicker';
import { birthQuery } from '@/lib/timezone/clientBirth';
import { type SavedCity, sanitizeName, NAME_MAX } from '@/services/savedProfile';
import type { GunaMilanResult } from '@/lib/vedic/matchmaking';
import type { ManglikAssessment } from '@/lib/vedic/manglik';
import { PANCHANG_TABLES } from '@/lib/vedic/panchang';
import type { KootaKey, LangCode } from '@/lib/lang/types';
import { LangShell, LangHeader, Intro, LangFaq, ToolLinks, useLang } from './LangParts';

interface MatchPerson { rashi: string; nakshatra: string; pada: number; lagna: string }
interface ManglikMatch { status: 'clear' | 'mutual' | 'cancelled' | 'one-sided'; a?: ManglikAssessment; b?: ManglikAssessment }
interface MatchResponse { gunaMilan: GunaMilanResult; manglik?: ManglikMatch | null; people: { a: MatchPerson; b: MatchPerson }; warnings?: { samePerson?: boolean; minor?: boolean } }

const ENGINE_RASHI = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
const DOSHA_KEY: Record<string, 'nadi' | 'bhakoot' | 'gana'> = { 'Nadi Dosha': 'nadi', 'Bhakoot Dosha': 'bhakoot', 'Gana Dosha': 'gana' };
const input = 'w-full px-3 py-2 border border-brand-line rounded-lg bg-white text-brand-ink';

export default function LangKundaliPage({ code }: { code: LangCode }) {
  const { v, cp, p } = useLang(code);
  const K = cp.kundaliText;
  const m = v.meta.kundali;
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
  const [f, setF] = useState({ nameB: '', dobB: '', timeB: '', nameG: '', dobG: '', timeG: '' });
  const [cityB, setCityB] = useState<SavedCity | null>(null);
  const [cityG, setCityG] = useState<SavedCity | null>(null);
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => { setF(s => ({ ...s, [k]: e.target.value })); setResult(null); };
  const ok = (dob: string, time: string, city: SavedCity | null) => /^\d{4}-\d{2}-\d{2}$/.test(dob) && dob <= today && /^\d{2}:\d{2}$/.test(time) && !!city;
  const canCalc = ok(f.dobB, f.timeB, cityB) && ok(f.dobG, f.timeG, cityG);
  const dispB = sanitizeName(f.nameB) || K.boy;
  const dispG = sanitizeName(f.nameG) || K.girl;

  const calculate = async () => {
    if (!canCalc || !cityB || !cityG) return;
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ ...birthQuery(f.dobB, f.timeB, cityB, 'A'), ...birthQuery(f.dobG, f.timeG, cityG, 'B'), groom: 'A' });
      const res = await fetch(`/api/kundali-match?${params.toString()}`);
      if (res.status === 400) { setError(K.errInput); return; }
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      if (!data?.gunaMilan) throw new Error('unavailable');
      setResult(data as MatchResponse);
    } catch { setError(K.errService); } finally { setLoading(false); }
  };

  const person = (x: MatchPerson) => {
    const ri = ENGINE_RASHI.indexOf(x.rashi);
    const ni = PANCHANG_TABLES.NAKSHATRAS.indexOf(x.nakshatra);
    return K.person(ri >= 0 ? v.rashis[ri] : x.rashi, ni >= 0 ? v.nakshatras[ni] : x.nakshatra, x.pada);
  };

  const form = (who: 'boy' | 'girl') => {
    const b = who === 'boy';
    const title = b ? K.boyTitle : K.girlTitle;
    return (
      <div className="rounded-xl border border-brand-line p-4 space-y-3">
        <div className="font-semibold text-brand-ink">{title}</div>
        <input data-testid={`lkm-name-${who}`} type="text" value={b ? f.nameB : f.nameG} maxLength={NAME_MAX} onChange={set(b ? 'nameB' : 'nameG')} placeholder={K.name} aria-label={`${title} — ${K.name}`} className={input} />
        <label className="block text-xs text-brand-muted">{K.dob}
          <input data-testid={`lkm-dob-${who}`} type="date" value={b ? f.dobB : f.dobG} max={today} onChange={set(b ? 'dobB' : 'dobG')} className={input} />
        </label>
        <label className="block text-xs text-brand-muted">{K.tob}
          <input data-testid={`lkm-time-${who}`} type="time" value={b ? f.timeB : f.timeG} onChange={set(b ? 'timeB' : 'timeG')} className={input} />
        </label>
        <CityPicker testid={`lkm-city-${who}`} value={b ? cityB : cityG} dob={b ? f.dobB : f.dobG} time={b ? f.timeB : f.timeG} placeholder={K.pobPlaceholder} ariaLabel={`${title} — ${K.pob}`}
          onPick={c => { (b ? setCityB : setCityG)(c); setResult(null); }} />
      </div>
    );
  };

  const g = result?.gunaMilan;
  const doshas = g ? g.doshas.filter(d => d.present) : [];
  const remedyKeys = new Set<string>([...doshas.filter(d => !d.cancelled).map(d => DOSHA_KEY[d.name]).filter(Boolean), ...(result?.manglik?.status === 'one-sided' ? ['manglik'] : [])]);

  return (
    <LangShell code={code} path={p.kundali} title={m.title} description={m.description} crumbs={[{ label: v.ui.kundali }]} testId="lang-kundali-page">
      <section className="section" lang={code}>
        <LangHeader code={code} eyebrow={v.ui.kundali} h1={m.h1} lead={<span data-testid="lkm-answer">{K.answer}</span>} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 !mb-4">{form('boy')}{form('girl')}</div>
        <p className="text-xs text-brand-muted !mb-3">{K.direction}</p>
        <button data-testid="lkm-calculate-btn" onClick={calculate} disabled={!canCalc || loading} className="btn" style={{ width: '100%' }}>{loading ? K.calculating : K.calculate}</button>
        {error && <p data-testid="lkm-error" className="subtle" style={{ marginTop: 12 }}>{error}</p>}

        {result && g && (
          <div data-testid="lkm-result" className="space-y-4 !mt-6">
            {result.warnings?.samePerson && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{K.samePerson}</p>}
            {result.warnings?.minor && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{K.minor}</p>}
            <p className="text-sm text-brand-ink-soft">
              <strong className="text-brand-ink">{dispB}</strong> ({K.boy}): {person(result.people.a)}<br />
              <strong className="text-brand-ink">{dispG}</strong> ({K.girl}): {person(result.people.b)}
            </p>
            <div className="text-center rounded-xl border border-brand-line p-4">
              <div className="text-sm text-brand-muted">{K.total}</div>
              <div data-testid="lkm-total" className="text-4xl font-black text-brand-purple">{g.total} / 36</div>
              <div className="font-semibold text-brand-ink">{K.compat[g.compatibility]}</div>
              <p className="text-sm text-brand-ink-soft !mt-1">{K.totalNote(g.total)}</p>
            </div>
            {doshas.map(d => (
              <div key={d.name} className={`rounded-lg border p-3 text-sm ${d.cancelled ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                <span className="font-semibold">{d.cancelled ? '✓' : '⚠️'} {v.doshas[DOSHA_KEY[d.name] ?? 'nadi']}</span> — {K.dosha(DOSHA_KEY[d.name] ?? 'nadi', d.cancelled)}
              </div>
            ))}
            <table className="w-full text-sm border border-brand-line rounded-lg overflow-hidden" data-testid="lkm-table">
              <thead><tr className="text-left text-brand-muted"><th className="px-3 py-2 font-medium">{K.koota}</th><th className="px-3 py-2 font-medium text-right">{K.points}</th></tr></thead>
              <tbody>
                {g.kootas.map(k => (
                  <tr key={k.key} className="border-t border-brand-line">
                    <td className="px-3 py-1.5 text-brand-ink">{v.kootas[k.key as KootaKey] ?? k.label}</td>
                    <td className="px-3 py-1.5 text-right font-semibold text-brand-ink">{k.score} / {k.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-brand-muted">{K.kootaLead}</p>
            <ul className="space-y-2">
              {g.kootas.map(k => (
                <li key={k.key} className="rounded-lg border border-brand-line p-3 text-sm">
                  <span className="font-semibold text-brand-ink">{v.kootas[k.key as KootaKey] ?? k.label} — {k.score} / {k.max}: </span>
                  <span className="text-brand-ink-soft">{K.kootaWhat[k.key as KootaKey]}</span>
                </li>
              ))}
            </ul>
            {result.manglik && (
              <div data-testid="lkm-manglik" className={`rounded-xl border p-4 text-sm ${result.manglik.status === 'one-sided' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
                <div className="font-semibold !mb-1">{K.manglikTitle}</div>
                <p>{K.manglikStatus[result.manglik.status]}</p>
                {result.manglik.a && result.manglik.b && (
                  <ul className="!mt-2 list-disc pl-5 space-y-0.5 text-xs">
                    {([[dispB, result.manglik.a], [dispG, result.manglik.b]] as const).map(([who, x]) => (
                      <li key={who}>{K.manglikLine(who, x.hasDosha, x.level === 'High', x.fromLagna.house, x.fromLagna.present, x.fromMoon.house, x.fromMoon.present)}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="rounded-xl border border-brand-gold/40 bg-brand-gold/10 p-4 text-sm text-brand-ink" data-testid="lkm-remedies">
              <div className="font-semibold !mb-2">{K.remediesTitle}</div>
              <ul className="list-disc pl-5 space-y-1">
                {[...remedyKeys].map(k => <li key={k}>{K.remedies[k as keyof typeof K.remedies]}</li>)}
                <li>{K.remedies.general}</li>
              </ul>
            </div>
          </div>
        )}
        <ToolLinks code={code} path={p.kundali} />
        <p className="text-sm !mt-3"><Link to="/kundali-match/" lang="en" className="underline">Kundali Matching (English) — 10 Porutham →</Link></p>
        <Intro blocks={cp.kundali.intro} />
      </section>
      <div lang={code}><LangFaq code={code} items={cp.kundali.faq} /></div>
    </LangShell>
  );
}

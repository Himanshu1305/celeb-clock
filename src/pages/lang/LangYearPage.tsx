/**
 * B18 — Rashifal 2027 in a regional language: the hub (/ta/rasi-palan-2027) and the 12
 * rashi pages (/ta/rasi-palan/:rashi/2027), computed from the same 2027 engine as the
 * English / Hindi pages (src/lib/lang/year.ts). Fixed to 2027 — never stale.
 */
import { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Link } from '@/components/seo/CanonicalLink';
import { ScrollTable } from '@/components/ScrollTable';
import { LANG_RASHI_SLUGS } from '@/lib/lang/langs.js';
import { composeYearLang } from '@/lib/lang/year';
import type { LangCode } from '@/lib/lang/types';
import { ToneBadge, H2, Card, KV } from '@/pages/year2027/parts';
import { LangShell, LangHeader, Intro, LangFaq, ToolLinks, useLang } from './LangParts';

export function LangYearHubPage({ code }: { code: LangCode }) {
  const { v, cp, p } = useLang(code);
  const m = v.meta.yearHub;
  return (
    <LangShell code={code} path={p.yearHub} title={m.title} description={m.description} crumbs={[{ label: v.ui.rashifal, to: `${p.rashifalHub}/` }, { label: v.ui.rashifal2027 }]} testId="lang-year-hub" ogType="article">
      <section className="section" lang={code}>
        <LangHeader code={code} eyebrow={cp.year2027.ui.eyebrow} h1={m.h1} lead={cp.year2027.ui.hubLead} />
        <h2 className="font-semibold text-brand-ink !mb-3">{cp.year2027.ui.hubPick}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" data-testid="lang-year-list">
          {v.rashis.map((r, i) => (
            <Link key={r} to={`${p.year(i)}/`} className="block rounded-xl border border-brand-line p-3 text-brand-ink hover:bg-brand-gold/10 font-semibold">{r} 2027 →</Link>
          ))}
        </div>
        <ToolLinks code={code} path={p.yearHub} />
        <Intro blocks={cp.year.intro} />
      </section>
      <div lang={code}><LangFaq code={code} items={cp.year.faq} /></div>
    </LangShell>
  );
}

export default function LangYearPage({ code }: { code: LangCode }) {
  const { rashi } = useParams<{ rashi: string }>();
  const { v, cp, p } = useLang(code);
  const idx = rashi ? LANG_RASHI_SLUGS.indexOf(rashi) : -1;
  const r = useMemo(() => (idx < 0 ? null : composeYearLang(code, v, cp, idx)), [code, v, cp, idx]);
  if (idx < 0 || !r) return <Navigate to={`${p.yearHub}/`} replace />;
  const U = cp.year2027.ui;
  const path = p.year(idx);
  const m = v.meta.year(r.name);
  return (
    <LangShell code={code} path={path} title={m.title} description={m.description} ogType="article" testId="lang-year-page"
      crumbs={[{ label: v.ui.rashifal2027, to: `${p.yearHub}/` }, { label: `${r.name} 2027` }]}>
      <section className="section" lang={code}>
        <LangHeader code={code} eyebrow={U.eyebrow} h1={m.h1} lead={<strong data-testid="lang-year-headline">{r.headline}</strong>} />

        <H2 id="brief">{U.brief}</H2>
        <div className="space-y-3 text-brand-ink leading-relaxed" data-testid="lang-year-brief">{r.brief.map(x => <p key={x.slice(0, 40)}>{x}</p>)}</div>
        <Card className="!mt-4"><div className="font-semibold text-brand-ink !mb-2">{U.facts}</div><KV rows={r.facts} /></Card>

        <H2 id="transits">{U.transits}</H2>
        <ScrollTable>
          <table className="w-full text-sm" data-testid="lang-year-transits">
            <thead><tr className="text-left text-brand-muted">{U.th.map(h => <th key={h} className="py-1 pr-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {r.transits.map(x => (
                <tr key={x.key} className="border-t border-brand-line text-brand-ink">
                  <td className="py-1.5 pr-3 whitespace-nowrap font-medium">{x.planet}</td>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{x.sign}</td>
                  <td className="py-1.5 pr-3">{x.house}</td>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{x.when}</td>
                  <td className="py-1.5 pr-3"><ToneBadge tone={x.tone} label={x.toneLabel} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollTable>

        <H2 id="areas">{U.areas}</H2>
        <div className="grid md:grid-cols-2 gap-4" data-testid="lang-year-areas">
          {r.areas.map(a => (
            <Card key={a.key}>
              <div className="flex items-center justify-between gap-2 !mb-2">
                <h3 className="font-semibold text-brand-ink">{a.title}</h3>
                <ToneBadge tone={a.tone} label={v.toneWord[a.tone === 'favourable' ? 'good' : a.tone === 'challenging' ? 'care' : 'mixed']} />
              </div>
              <p className="text-brand-ink !mb-2">{a.text}</p>
              {a.reasons.length > 0 && (
                <div className="text-sm text-brand-ink-soft"><strong className="text-brand-ink">{U.why}: </strong>
                  <ul className="list-disc pl-5 !mt-1 space-y-1">{a.reasons.map(x => <li key={x}>{x}</li>)}</ul>
                </div>
              )}
            </Card>
          ))}
        </div>

        <H2 id="months">{U.months}</H2>
        <div className="grid md:grid-cols-2 gap-3" data-testid="lang-year-months">
          {r.months.map(mo => (
            <Card key={mo.key}>
              <div className="flex items-center justify-between gap-2 !mb-1">
                <h3 className="font-semibold text-brand-ink">{mo.name} 2027</h3>
                <ToneBadge tone={mo.tone} label={v.toneWord[mo.tone === 'favourable' ? 'good' : mo.tone === 'challenging' ? 'care' : 'mixed']} />
              </div>
              <p className="text-sm font-medium text-brand-ink">{mo.verdict}.</p>
              <p className="text-sm text-brand-ink-soft !mt-1 leading-relaxed">{mo.text}</p>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 !mt-2">
          <div>
            <H2 id="best">{U.best}</H2>
            <p className="text-sm text-brand-muted !mb-2">{U.bestLead}</p>
            <ul className="space-y-2" data-testid="lang-year-best">{r.best.map(w => <li key={w.range} className="text-sm text-brand-ink"><strong>{w.range}</strong> — {w.why}</li>)}</ul>
          </div>
          <div>
            <H2 id="care">{U.hard}</H2>
            <p className="text-sm text-brand-muted !mb-2">{U.hardLead}</p>
            <ul className="space-y-2">{r.hard.map(w => <li key={w.range} className="text-sm text-brand-ink"><strong>{w.range}</strong> — {w.why}</li>)}</ul>
          </div>
        </div>

        {r.love.length > 0 && (
          <>
            <H2 id="love-windows">{U.love}</H2>
            <p className="text-sm text-brand-muted !mb-2">{U.loveLead}</p>
            <ul className="space-y-2">{r.love.map(w => <li key={w.range} className="text-sm text-brand-ink"><strong>{w.range}</strong> — {w.why}</li>)}</ul>
          </>
        )}

        <H2 id="saturn">{U.saturn}</H2>
        <Card testId="lang-year-saturn">
          <p className="text-brand-ink leading-relaxed">{r.saturn.text}</p>
        </Card>

        <H2 id="eclipses">{U.ecl}</H2>
        <p className="text-sm text-brand-muted !mb-2">{U.eclLead}</p>
        <ScrollTable>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-brand-muted">{U.eclTh.map(h => <th key={h} className="py-1 pr-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {r.eclipses.map(e => (
                <tr key={e.date + e.name} className="border-t border-brand-line text-brand-ink align-top">
                  <td className="py-1.5 pr-3">{e.name}</td>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{e.date}, {e.time}</td>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{e.house}</td>
                  <td className="py-1.5 pr-3 text-brand-ink-soft">{e.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollTable>

        <H2 id="lucky">{U.lucky}</H2>
        <Card>
          <KV rows={[{ label: U.luckyMonths, value: r.lucky.months }, { label: U.colours, value: r.lucky.colours }, { label: U.numbers, value: r.lucky.numbers }, { label: U.day, value: r.lucky.day }]} />
          <p className="text-sm text-brand-ink-soft !mt-3">{r.lucky.text}</p>
        </Card>

        <H2 id="remedies">{U.rem}</H2>
        <p className="text-sm text-brand-muted !mb-3">{U.remLead}</p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-brand-ink" data-testid="lang-year-remedies">{r.remedies.map(x => <li key={x}>{x}</li>)}</ul>

        <div className="!mt-8 rounded-xl border border-brand-purple/30 bg-brand-purple/10 p-4">
          <div className="font-semibold text-brand-ink !mb-1">{U.method}</div>
          <p className="text-sm text-brand-ink">{U.methodText}</p>
        </div>

        <H2 id="others">{U.others}</H2>
        <div className="flex flex-wrap gap-2">
          {v.rashis.map((x, i) => (i === idx ? null : <Link key={x} to={`${p.year(i)}/`} className="px-3 py-1.5 rounded-lg border border-brand-line text-sm text-brand-ink hover:bg-brand-gold/10">{x} 2027</Link>))}
        </div>
        <p className="!mt-4"><Link to={`${p.rashifal(idx)}/`} className="underline">{v.meta.rashifal(r.name).h1} →</Link></p>
        <ToolLinks code={code} path={path} />
      </section>
      <div lang={code}><LangFaq code={code} items={r.faq} /></div>
    </LangShell>
  );
}

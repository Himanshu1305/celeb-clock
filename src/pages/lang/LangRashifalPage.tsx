/**
 * B18 — daily Rashifal in a regional language: the hub (/ta/rasi-palan) and the 12 rashi
 * pages (/ta/rasi-palan/:rashi). The rashi pages ride the shared daily mechanism (kind
 * 'rashifal-<code>', the same vedic-sky data as English / Hindi) so the Worker injects
 * today's text and the page never goes stale between deploys.
 */
import { useParams, Navigate } from 'react-router-dom';
import { Link } from '@/components/seo/CanonicalLink';
import { useDailyEntry } from '@/lib/daily/useDailyEntry';
import { DailyBody, DailyDate, DailyH1, DailyJsonLd } from '@/lib/daily/DailyParts';
import { LANG_RASHI_SLUGS } from '@/lib/lang/langs.js';
import type { LangCode } from '@/lib/lang/types';
import { LangShell, LangHeader, Intro, LangFaq, ToolLinks, useLang } from './LangParts';

export default function LangRashifalPage({ code }: { code: LangCode }) {
  const { rashi } = useParams<{ rashi: string }>();
  const { v, cp, p } = useLang(code);
  const idx = rashi ? LANG_RASHI_SLUGS.indexOf(rashi) : -1;
  const { entry } = useDailyEntry(`rashifal-${code}`, idx >= 0 ? rashi : null);
  if (rashi && idx < 0) return <Navigate to={`${p.rashifalHub}/`} replace />;

  if (idx < 0) {
    const m = v.meta.rashifalHub;
    return (
      <LangShell code={code} path={p.rashifalHub} title={m.title} description={m.description} crumbs={[{ label: v.ui.rashifal }]} testId="lang-rashifal-hub">
        <section className="section" lang={code}>
          <LangHeader code={code} eyebrow={v.ui.rashifal} h1={m.h1} lead={cp.rashifal.hubLead} />
          <p className="text-brand-ink-soft !mb-3">{v.ui.chooseRashi}</p>
          <div className="flex flex-wrap gap-2" data-testid="lang-rashi-list">
            {v.rashis.map((r, i) => (
              <Link key={r} to={`${p.rashifal(i)}/`} className="px-4 py-2 rounded-lg border border-brand-line text-brand-ink hover:bg-brand-gold/10">{r}</Link>
            ))}
          </div>
          <p className="!mt-6"><Link to={`${p.yearHub}/`} className="inline-block rounded-xl border border-brand-gold/50 bg-brand-gold/10 px-4 py-3 font-semibold text-brand-ink">{v.meta.yearHub.h1} →</Link></p>
          <ToolLinks code={code} path={p.rashifalHub} />
          <Intro blocks={cp.rashifal.intro} />
        </section>
        <div lang={code}><LangFaq code={code} items={cp.rashifal.faq} /></div>
      </LangShell>
    );
  }

  const path = p.rashifal(idx);
  const m = v.meta.rashifal(v.rashis[idx]);
  return (
    <LangShell code={code} path={path} title={entry?.title ?? m.title} description={entry?.description ?? m.description}
      crumbs={[{ label: v.ui.rashifal, to: `${p.rashifalHub}/` }, { label: v.rashis[idx] }]} testId="lang-rashifal-page">
      <section className="section" lang={code}>
        <LangHeader code={code} eyebrow={`${v.ui.rashifal} · ${v.ui.today}`} h1={<DailyH1 entry={entry} fallback={m.h1} />} lead={<DailyDate entry={entry} />} />
        <Link to={`${p.year(idx)}/`} data-testid="lang-year-link" className="block rounded-xl border border-brand-gold/50 bg-brand-gold/10 p-4 !mb-4 font-semibold text-brand-ink">
          {v.meta.year(v.rashis[idx]).h1} →
        </Link>
        <DailyBody entry={entry} testId="lang-rashifal-daily" />
        <h2 className="font-semibold text-brand-ink !mt-8 !mb-2">{v.ui.otherRashis}</h2>
        <div className="flex flex-wrap gap-2">
          {v.rashis.map((r, i) => (i === idx ? null : (
            <Link key={r} to={`${p.rashifal(i)}/`} className="px-3 py-1.5 rounded-lg border border-brand-line text-sm text-brand-ink hover:bg-brand-gold/10">{r}</Link>
          )))}
        </div>
        <div className="!mt-8 rounded-xl border border-brand-gold/40 bg-brand-gold/10 p-5 text-center">
          <Link to="/kundali/" className="inline-flex items-center gap-2 bg-brand-navy text-white rounded-lg px-5 py-2.5 font-semibold">{v.ui.freeKundliCta}</Link>
        </div>
        <ToolLinks code={code} path={path} />
        <Intro blocks={cp.rashifal.intro} />
      </section>
      <DailyJsonLd entry={entry} path={path} />
    </LangShell>
  );
}

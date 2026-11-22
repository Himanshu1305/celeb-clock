/**
 * B18 — today's Panchang in a regional language: /<code>/<seg> (New Delhi) and the
 * language's own cities. Rides the shared daily mechanism (kind 'panchang-<code>', the
 * same per-city panchang-day data as the English pages) — the Worker injects today's text.
 */
import { useParams, Navigate } from 'react-router-dom';
import { Link } from '@/components/seo/CanonicalLink';
import { useDailyEntry } from '@/lib/daily/useDailyEntry';
import { DailyBody, DailyDate, DailyH1, DailyJsonLd } from '@/lib/daily/DailyParts';
import type { LangCode } from '@/lib/lang/types';
import { LangShell, LangHeader, Intro, ToolLinks, useLang } from './LangParts';

export default function LangPanchangPage({ code }: { code: LangCode }) {
  const { city } = useParams<{ city: string }>();
  const { def, v, cp, p } = useLang(code);
  const valid = !city || def.cities.includes(city);
  const slug = city && valid ? city : 'index';
  const { entry } = useDailyEntry(`panchang-${code}`, valid ? slug : null);
  if (!valid) return <Navigate to={`${p.panchang(null)}/`} replace />;
  const path = p.panchang(city ?? null);
  const cityName = v.cities[city ?? 'delhi'];
  const m = v.meta.panchang(cityName, !city);
  return (
    <LangShell code={code} path={path} title={entry?.title ?? m.title} description={entry?.description ?? m.description} testId="lang-panchang-page"
      crumbs={city ? [{ label: v.ui.panchang, to: `${p.panchang(null)}/` }, { label: cityName }] : [{ label: v.ui.panchang }]}>
      <section className="section" lang={code}>
        <LangHeader code={code} eyebrow={v.ui.panchang} h1={<DailyH1 entry={entry} fallback={m.h1} />} lead={<DailyDate entry={entry} />} />
        <nav aria-label={v.ui.cities} className="flex flex-wrap items-center gap-2 !mb-6" data-testid="lang-panchang-cities">
          <span className="text-sm text-brand-muted">{v.ui.cities}</span>
          {[null, ...def.cities].map(c => (
            <Link key={c ?? 'index'} to={`${p.panchang(c)}/`}
              className={`px-3 py-1 rounded-lg border text-sm ${(c ?? undefined) === city ? 'bg-brand-navy text-white border-brand-navy' : 'border-brand-line text-brand-ink hover:bg-brand-gold/10'}`}>
              {v.cities[c ?? 'delhi']}
            </Link>
          ))}
        </nav>
        <DailyBody entry={entry} testId="lang-panchang-daily" />
        <ToolLinks code={code} path={path} />
        <Intro blocks={cp.panchang.intro} />
      </section>
      <DailyJsonLd entry={entry} path={path} />
    </LangShell>
  );
}

/** B18 — a regional language's landing page (/ta, /te, …): its tools, intro and FAQ. */
import { Link } from '@/components/seo/CanonicalLink';
import type { LangCode } from '@/lib/lang/types';
import { LangShell, LangHeader, Intro, LangFaq, useLang } from './LangParts';

export default function LangLandingPage({ code }: { code: LangCode }) {
  const { def, v, cp, p } = useLang(code);
  const m = v.meta.landing;
  const cards = [
    { to: p.rashifalHub, title: v.ui.rashifal, text: cp.landing.cards.rashifal },
    { to: p.yearHub, title: v.ui.rashifal2027, text: cp.landing.cards.year },
    { to: p.panchang(null), title: v.ui.panchang, text: cp.landing.cards.panchang },
    { to: p.kundali, title: v.ui.kundali, text: cp.landing.cards.kundali },
  ];
  return (
    <LangShell code={code} path={p.landing} title={m.title} description={m.description} crumbs={[]} testId="lang-landing">
      <section className="section" lang={code}>
        <LangHeader code={code} eyebrow={def.native} h1={m.h1} lead={cp.landing.lead} />
        <div className="grid sm:grid-cols-2 gap-4" data-testid="lang-cards">
          {cards.map(c => (
            <Link key={c.to} to={`${c.to}/`} className="block rounded-xl border border-brand-line p-5 hover:bg-brand-gold/10">
              <div className="font-semibold text-brand-ink text-lg !mb-1">{c.title} →</div>
              <p className="text-sm text-brand-ink-soft">{c.text}</p>
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 !mt-4" data-testid="lang-rashi-links">
          {v.rashis.map((r, i) => (
            <Link key={r} to={`${p.rashifal(i)}/`} className="px-3 py-1.5 rounded-lg border border-brand-line text-sm text-brand-ink hover:bg-brand-gold/10">{r}</Link>
          ))}
        </div>
        <Intro blocks={cp.landing.intro} />
      </section>
      <div lang={code}><LangFaq code={code} items={cp.landing.faq} /></div>
    </LangShell>
  );
}

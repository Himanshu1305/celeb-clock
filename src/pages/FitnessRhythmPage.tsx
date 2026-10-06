import { useLocation, Link, Navigate } from 'react-router-dom';
import { ToolLayout } from '@/components/central';
import { SEO, FAQSchema, WebApplicationSchema } from '@/components/SEO';
import { RhythmWidget } from '@/components/RhythmWidget';
import { getFitnessPage, FITNESS_PAGES } from '@/data/fitnessPages';
import { RHYTHM_SCIENCE_NOTE, RHYTHM_DISCLAIMER } from '@/data/rhythmFraming';
import { postsForTags } from '@/lib/mesh';
import { SharePageBar } from '@/components/SharePageBar';

export default function FitnessRhythmPage() {
  const slug = useLocation().pathname.replace(/^\//, '').replace(/\/+$/, '').toLowerCase();
  const page = getFitnessPage(slug);
  if (!page) return <Navigate to="/biorhythm" replace />;

  const related = FITNESS_PAGES.filter(p => p.slug !== page.slug).slice(0, 4);
  // Tag-matched blog reads for the internal mesh (rhythm/energy/exercise cluster).
  const meshPosts = postsForTags([...page.keywords.split(',').map(k => k.trim()), 'biorhythm', 'energy', 'exercise'], 2);

  return (
    <ToolLayout
      theme="mystic"
      seo={(
        <>
          <SEO
            title={page.seoTitle}
            description={page.seoDescription}
            keywords={page.keywords}
            canonicalUrl={`/${page.slug}`}
          />
          {page.isApp && (
            <WebApplicationSchema name={page.h1} description={page.seoDescription} url={`/${page.slug}`} />
          )}
          <FAQSchema items={page.faqs.map(f => ({ question: f.question, answer: f.answer }))} />
        </>
      )}
      breadcrumb={{ trail: [{ label: 'Biorhythm', to: '/biorhythm' }], current: page.h1 }}
      footer={{
        tagline: 'Energy and rhythm pages — charted from your date of birth.',
        nav: [
          { label: 'Biorhythm', to: '/biorhythm' },
          { label: 'Mystic Corner', to: '/mystic-corner' },
          { label: 'Numerology', to: '/numerology' },
          { label: 'Birthday Report', to: '/birthday-report' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock · Calculated, not templated.',
      }}
      eyebrow="Biorhythm"
      h1={page.h1}
      lead={page.directAnswer}
    >
      <section className="section">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <SharePageBar
            path={`/${page.slug}`}
            title={page.h1}
            text={page.h1}
            className="mb-6"
          />

          {/* Mandatory science note (honesty framing) — top of page, before the widget */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
            <p className="text-sm text-amber-900 leading-relaxed"><strong>How to read this:</strong> {RHYTHM_SCIENCE_NOTE}</p>
          </div>

          {/* Widget */}
          <div className="mb-10">
            <RhythmWidget variant={page.widgetVariant} ctaLabel={page.widgetCtaLabel} />
          </div>

          {/* Body sections (question-form H2s) */}
          {page.sections.map(s => (
            <section key={s.h2} className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">{s.h2}</h2>
              <div className="space-y-3">
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="text-gray-700 leading-relaxed">{p}</p>
                ))}
              </div>
            </section>
          ))}

          {/* FAQ (mirrors FAQPage JSON-LD) */}
          <div className="mt-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
            <div className="space-y-3">
              {page.faqs.map(f => (
                <details key={f.question} className="border border-gray-200 rounded-xl p-4">
                  <summary className="font-semibold text-gray-900 cursor-pointer">{f.question}</summary>
                  <p className="text-sm text-gray-600 leading-relaxed mt-2">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>

          {/* Cross-links */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-3">Related rhythm pages</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {related.map(r => (
                <Link key={r.slug} to={`/${r.slug}`}
                  className="p-3 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-sm text-gray-700 hover:text-teal-700 transition-colors">
                  → {r.h1}
                </Link>
              ))}
              <Link to="/biorhythm" className="p-3 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-sm text-gray-700 hover:text-teal-700 transition-colors">→ Full Biorhythm Calculator</Link>
              <Link to="/birthday-report" className="p-3 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-sm text-gray-700 hover:text-teal-700 transition-colors">→ Your Birthday Report</Link>
              {meshPosts.map(p => (
                <Link key={p.slug} to={`/blog/${p.slug}`}
                  className="p-3 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-sm text-gray-700 hover:text-teal-700 transition-colors">
                  → {p.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Mandatory standard disclaimer — page footer */}
          <p className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400 leading-relaxed">{RHYTHM_DISCLAIMER}</p>
        </div>
      </section>
    </ToolLayout>
  );
}

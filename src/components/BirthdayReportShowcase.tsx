import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gift, Check } from 'lucide-react';

// Homepage showcase for the paid Birthday Blueprint (₹199). Sells the report
// with styled mockups of REAL report sections (cover, celebrity twins, zodiac
// trio) — no fabricated screenshots. Facts are verified against the codebase:
// price ₹199 / member ₹149 (api/create-order.ts), 11-section report
// (prerender-titles.mjs canonical copy), 21 printed pages (Phase-1 PDF harness).

// A miniature, non-interactive preview styled in the report's own navy+gold
// palette so the homepage hints at what the PDF actually looks like.
function PreviewCard({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="rounded-xl overflow-hidden border shadow-sm bg-white" style={{ borderColor: '#E6D8B8' }}>
      <div className="aspect-[3/4] p-4 flex flex-col" style={{ background: '#FBF6EA' }}>
        {children}
      </div>
      <div className="text-[11px] font-semibold text-center py-1.5 tracking-wide uppercase" style={{ color: '#B8862F', background: '#F5EAD2' }}>
        {label}
      </div>
    </div>
  );
}

export function BirthdayReportShowcase() {
  return (
    <section className="max-w-5xl mx-auto mb-16 px-4">
      <Card className="glass-card card-party-border overflow-hidden">
        <CardContent className="p-6 md:p-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Copy side */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: '#F5EAD2', color: '#B8862F' }}>
                <Gift className="w-3.5 h-3.5" /> The Birthday Blueprint
              </div>
              <h2 className="text-3xl md:text-4xl font-black leading-tight gradient-text-primary">
                A birthday gift that's actually about them
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A personalised <strong>20+ page</strong> keepsake report built from anyone's birth date —
                celebrity birthday twins, Western &amp; Vedic zodiac, numerology &amp; life path, tarot,
                Chinese zodiac, planetary ages and more, across <strong>11 sections</strong>. Beautifully
                typeset and ready to print or gift.
              </p>
              <ul className="space-y-2">
                {[
                  '11 personalised sections, one birth date',
                  'Celebrity birthday twins ranked by fame',
                  'Print-ready PDF — a gift they can keep',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-1">
                <span className="text-3xl font-black text-foreground">₹199</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-accent">Launch price</span>
                <span className="text-sm text-muted-foreground w-full">one-time · or ₹149 for members</span>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/birthday-report">
                    Create a Birthday Blueprint <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/pricing">See what's included</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                7-day money-back guarantee — full refund, no questions.
              </p>
              <p className="text-xs text-muted-foreground">
                Questions before you buy? <a href="mailto:hello@bornclock.com" className="text-primary hover:underline">hello@bornclock.com</a>
              </p>
            </div>

            {/* Preview side — styled mockups of real sections */}
            <div className="grid grid-cols-3 gap-3">
              <PreviewCard label="Cover">
                <div className="text-[9px] font-bold" style={{ color: '#103A5C' }}>BornClock</div>
                <div className="mt-auto">
                  <div className="text-[8px] font-semibold uppercase tracking-wider" style={{ color: '#B8862F' }}>A Blueprint for</div>
                  <div className="text-lg font-black leading-none" style={{ color: '#103A5C' }}>Aanya</div>
                  <div className="h-0.5 w-8 mt-2" style={{ background: '#B8862F' }} />
                </div>
              </PreviewCard>
              <PreviewCard label="Twins">
                <div className="text-[8px] font-semibold uppercase" style={{ color: '#B8862F' }}>Born the same day</div>
                <div className="space-y-1.5 mt-1.5">
                  {['★ A. Actor', '★ N. Author', '★ R. Athlete'].map(t => (
                    <div key={t} className="rounded px-1.5 py-1 text-[8px] border" style={{ borderColor: '#E6D8B8', color: '#103A5C' }}>{t}</div>
                  ))}
                </div>
              </PreviewCard>
              <PreviewCard label="Zodiac">
                <div className="text-[8px] font-semibold uppercase" style={{ color: '#B8862F' }}>Three traditions</div>
                <div className="grid gap-1.5 mt-1.5">
                  {['Cancer', 'Horse', 'Mithuna'].map(z => (
                    <div key={z} className="rounded text-center py-1 text-[8px] font-bold border" style={{ borderColor: '#E6D8B8', color: '#103A5C' }}>{z}</div>
                  ))}
                </div>
              </PreviewCard>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

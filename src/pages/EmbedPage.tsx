import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';

const EMBED_CODE = '<iframe src="https://bornclock.com/widget/age-calculator" width="100%" height="220" frameborder="0" style="border-radius:12px;border:1px solid #e5e7eb;" title="Age Calculator"></iframe>';

const RELATED = [
  { path: '/age-calculator', label: 'Age Calculator' },
  { path: '/age-in-days', label: 'Age in Days' },
  { path: '/birthday-countdown', label: 'Birthday Countdown' },
];

const EmbedPage = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMBED_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Free Age Calculator Widget for Your Website | BornClock"
        description="Embed BornClock's live age calculator on your website in 30 seconds. Copy one line of code — free forever, no API key, we handle hosting and accuracy."
        keywords="age calculator widget, embed age calculator, free website widget, age calculator iframe"
        canonicalUrl="/embed"
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <section className="text-center space-y-4 mb-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
            Free Age Calculator Widget for Your Website
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Embed BornClock's live age calculator on your website in 30 seconds. Copy one line of code. We handle updates, hosting, and accuracy — forever free.
          </p>
        </section>

        <section className="max-w-2xl mx-auto mb-12 px-4">
          <h2 className="text-xl font-bold text-foreground mb-4 text-center">Live Preview</h2>
          <iframe
            src="/widget/age-calculator"
            width="100%"
            height="220"
            frameBorder="0"
            style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
            title="BornClock Age Calculator Widget"
          />
        </section>

        <section className="max-w-2xl mx-auto mb-12 px-4">
          <h2 className="text-xl font-bold text-foreground mb-4 text-center">Copy the Embed Code</h2>
          <div className="rounded-xl border border-border bg-slate-900 p-4">
            <pre className="text-xs text-slate-100 overflow-x-auto whitespace-pre-wrap break-all"><code>{EMBED_CODE}</code></pre>
          </div>
          <div className="text-center mt-4">
            <button
              onClick={handleCopy}
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              {copied ? '✓ Copied!' : 'Copy Embed Code'}
            </button>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Free forever. No API key needed. "Powered by BornClock" link included.
          </p>
        </section>

        <section className="max-w-4xl mx-auto mb-16 px-4">
          <h2 className="text-2xl font-bold text-center mb-6 gradient-text-primary">Related Tools</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {RELATED.map((t) => (
              <Link key={t.path} to={t.path} className="block rounded-xl border border-border p-4 font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors">
                {t.label} →
              </Link>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default EmbedPage;

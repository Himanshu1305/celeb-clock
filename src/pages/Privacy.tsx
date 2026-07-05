import { useState } from 'react';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TOC_ITEMS = [
  { id: 'data-model', label: 'Data Model by User Type' },
  { id: 'what-we-collect', label: 'What We Collect' },
  { id: 'what-we-dont-store', label: 'What We Do NOT Store' },
  { id: 'gift-recipients', label: "Gift Recipients' Data" },
  { id: 'how-we-use', label: 'How We Use Your Data' },
  { id: 'storage-security', label: 'Data Storage and Security' },
  { id: 'third-parties', label: 'Third-Party Services' },
  { id: 'your-rights', label: 'Your Rights' },
  { id: 'dpdpa-rights', label: 'Indian Law (DPDPA 2023)' },
  { id: 'gdpr-rights', label: 'EU/UK Rights (GDPR)' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'childrens-privacy', label: "Children's Privacy" },
  { id: 'changes', label: 'Changes to This Policy' },
  { id: 'contact', label: 'Contact Us' },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function TOCSidebar() {
  return (
    <nav className="space-y-1">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">On This Page</p>
      {TOC_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => scrollToSection(item.id)}
          className="block w-full text-left text-sm text-muted-foreground hover:text-blue-500 py-1 px-2 rounded transition-colors"
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function TOCDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg mb-8">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-foreground"
      >
        <span>On This Page</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-1 border-t border-border pt-3">
          {TOC_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setOpen(false); scrollToSection(item.id); }}
              className="block w-full text-left text-sm text-muted-foreground hover:text-blue-500 py-1"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy | BornClock"
        description="BornClock's privacy policy written in plain English. We explain exactly what data we collect, what we never store, and how we protect your information."
        keywords="BornClock privacy policy, data privacy, what data bornclock collects"
        canonicalUrl="/privacy"
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: July 2026</p>

          {/* Blue info box */}
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-10 text-blue-900 dark:text-blue-200 text-sm leading-relaxed">
            <strong>Plain English first.</strong> We have tried to write this in plain English — no legalese, no hidden clauses. If something is unclear, email us at{' '}
            <a href="mailto:privacy@bornclock.com" className="underline hover:opacity-80">privacy@bornclock.com</a>{' '}
            and we will clarify it.
          </div>

          {/* Mobile TOC */}
          <div className="lg:hidden">
            <TOCDropdown />
          </div>

          <div className="flex gap-12">
            {/* Desktop sticky TOC */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-8 bg-card border border-border rounded-xl p-4">
                <TOCSidebar />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">

              <section id="data-model" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Data Model by User Type</h2>

                <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5 mb-6">
                  <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2">Two products, two promises.</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    <strong className="text-foreground">Your health data (Life Expectancy / Longevity):</strong> never stored — every calculation happens in your browser and no health input or result ever reaches our servers.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Your Birthday Blueprint gift reports:</strong> stored only so your shareable link works — a gift report must exist on our servers for the recipient to open it. Deleted with your account, on request, or automatically after 12 months without a single view.
                  </p>
                </div>

                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Beyond these two products, BornClock operates on a tiered model. What we collect and store depends on how you use the service:
                </p>
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">👤 Anonymous users (no account)</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      All calculations — life expectancy, biological age, planetary age, birthday personality — happen entirely in your browser. We do not store your health inputs, date of birth, or calculation results on our servers. No account is required to use our calculators.
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">✉️ Registered users (free account)</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We store your name, email address, country, and account preferences to enable your login and personalise your experience. Your login data is encrypted and stored securely with Supabase (US-based, SOC 2 compliant). Health calculation data remains browser-only and is never transmitted to our servers.
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                    <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">👑 Premium users</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      When you use premium features, we additionally store your subscription status and any profile preferences you explicitly save. This data is used solely to provide the service and is never sold or shared with third parties for advertising. Payment is handled entirely by Razorpay — BornClock never sees your card details.
                    </p>
                  </div>
                </div>
              </section>

              <section id="what-we-collect" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">What We Collect</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  When you create a BornClock account, we collect the following information:
                </p>
                <ul className="space-y-3 text-muted-foreground leading-relaxed">
                  <li><strong className="text-foreground">Name</strong> — used to personalise your dashboard and reports.</li>
                  <li><strong className="text-foreground">Email address</strong> — used for account access, transactional emails, and optional notifications. Never sold.</li>
                  <li><strong className="text-foreground">Date of birth</strong> — used to calculate your real-time age and power all date-based features. Stored only if you explicitly save your profile.</li>
                  <li><strong className="text-foreground">Country</strong> — used to select the correct WHO/UN life-expectancy baseline for your region.</li>
                  <li><strong className="text-foreground">Health inputs</strong> (smoking, alcohol, BMI, exercise, sleep, stress, medical history) — entered into the Life Expectancy Calculator. These are processed entirely in your browser and are <em>never transmitted to our servers</em>.</li>
                  <li><strong className="text-foreground">Premium status</strong> — whether your account has an active premium subscription, stored so we can grant access to premium features.</li>
                  <li><strong className="text-foreground">Payment metadata</strong> — we use Razorpay for payment processing. BornClock receives only a transaction ID and confirmation status; your card details are handled entirely by Razorpay and never touch our servers.</li>
                  <li><strong className="text-foreground">Anonymous analytics</strong> — page views and feature usage via privacy-focused analytics (no cross-site tracking, no fingerprinting). This helps us understand which features to improve.</li>
                </ul>
              </section>

              <section id="what-we-dont-store" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">What We Do NOT Store</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  We believe in data minimalism. Here is what we deliberately do <strong className="text-foreground">not</strong> collect or store:
                </p>
                <ul className="space-y-3 text-muted-foreground leading-relaxed">
                  <li><strong className="text-foreground">Raw health inputs</strong> — your answers to the Life Expectancy Calculator (smoking, alcohol, BMI, sleep, stress, medical history, etc.) are processed entirely in your browser and never transmitted to our servers. They are never stored.</li>
                  <li><strong className="text-foreground">Longevity forecasts and results</strong> — your life expectancy calculation result is never saved on our servers. If you add a family member or submit to the longevity leaderboard, only the numeric forecast summary (e.g. "78.5 years") is stored — not the health inputs that produced it.</li>
                  <li><strong className="text-foreground">Birthday Blueprint reports are stored for delivery</strong> — this is the one exception to the above. When you create a Birthday Blueprint, we store the recipient's name, date of birth, and generated report content, because the shareable link must exist on our servers for the recipient to open it. These reports are deleted with your account, on request, or automatically after 12 months without a view.</li>
                  <li><strong className="text-foreground">Card numbers, CVVs, or bank details</strong> — payments go directly through Razorpay's PCI-DSS compliant infrastructure.</li>
                  <li><strong className="text-foreground">Data sold to third parties</strong> — we do not sell, rent, or trade your personal information. Ever.</li>
                  <li><strong className="text-foreground">Advertising</strong> — BornClock may display advertising to support the free tier. We do not sell your health data — including your life expectancy inputs, biological age results, or any health-related information — to advertisers or any third parties.</li>
                  <li><strong className="text-foreground">Precise location data</strong> — we ask for country only (via a dropdown you select), never GPS or IP-derived geolocation.</li>
                </ul>
              </section>

              <section id="gift-recipients" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Gift Recipients' Data</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  When a BornClock user creates a Birthday Blueprint about another person, we store that person's name and date of birth solely to generate and deliver the report, on the purchaser's instruction. This data is not used for any other purpose, is not sold or shared, and is deleted when the report is deleted.
                </p>
                <ul className="space-y-3 text-muted-foreground leading-relaxed">
                  <li><strong className="text-foreground">Retention:</strong> Gift reports that have not been viewed for 12 months are automatically and permanently deleted.</li>
                  <li><strong className="text-foreground">Recipient deletion rights:</strong> Recipients themselves may request deletion of a report about them by emailing{' '}
                    <a href="mailto:privacy@bornclock.com" className="text-blue-500 hover:underline">privacy@bornclock.com</a>. We will process such requests within 30 days.
                  </li>
                </ul>
              </section>

              <section id="how-we-use" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">How We Use Your Data</h2>
                <ul className="space-y-3 text-muted-foreground leading-relaxed">
                  <li><strong className="text-foreground">Account management</strong> — your name and email let you log in, recover your account, and manage your subscription.</li>
                  <li><strong className="text-foreground">Personalisation</strong> — your date of birth and country personalise your dashboard and choose the right life-expectancy baseline.</li>
                  <li><strong className="text-foreground">Transactional emails</strong> — account confirmation, password reset, and payment receipts. We do not send marketing emails without your explicit opt-in.</li>
                  <li><strong className="text-foreground">Optional notifications</strong> — with your consent, we may send birthday-related nudges or product updates. You can unsubscribe at any time from your profile page.</li>
                  <li><strong className="text-foreground">Product improvement</strong> — anonymised, aggregated usage data helps us decide what to build next. No individual is identifiable in this data.</li>
                </ul>
              </section>

              <section id="storage-security" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Data Storage and Security</h2>
                <ul className="space-y-3 text-muted-foreground leading-relaxed">
                  <li>Account data is stored on <strong className="text-foreground">Supabase</strong> (PostgreSQL), hosted in AWS data centres with encryption at rest and in transit.</li>
                  <li>All connections to BornClock are <strong className="text-foreground">HTTPS encrypted</strong> using TLS 1.2 or higher.</li>
                  <li>We use <strong className="text-foreground">row-level security (RLS)</strong> policies to ensure your data is only accessible to you and never to other users.</li>
                  <li>Passwords are hashed using industry-standard bcrypt via Supabase Auth — we never see or store plaintext passwords.</li>
                  <li>We retain your account data for as long as your account is active. If you delete your account, all personal data is permanently deleted within 30 days.</li>
                </ul>
              </section>

              <section id="third-parties" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Third-Party Services</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  We use a small number of third-party services. Here is each one and what data they receive:
                </p>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm text-muted-foreground">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-foreground">Service</th>
                        <th className="text-left px-4 py-3 font-semibold text-foreground">Purpose</th>
                        <th className="text-left px-4 py-3 font-semibold text-foreground">Data Shared</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-3 font-medium text-foreground">Supabase</td>
                        <td className="px-4 py-3">Database &amp; auth</td>
                        <td className="px-4 py-3">Name, email, DOB, country, premium status</td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="px-4 py-3 font-medium text-foreground">Razorpay</td>
                        <td className="px-4 py-3">Payment processing</td>
                        <td className="px-4 py-3">Email, payment amount (card details handled by Razorpay only)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-foreground">Resend</td>
                        <td className="px-4 py-3">Transactional email</td>
                        <td className="px-4 py-3">Name, email address</td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="px-4 py-3 font-medium text-foreground">Vercel / Cloudflare</td>
                        <td className="px-4 py-3">Hosting &amp; CDN</td>
                        <td className="px-4 py-3">IP address (not stored by us), request logs (retained 7 days)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-foreground">Internal analytics</td>
                        <td className="px-4 py-3">Product analytics (first-party)</td>
                        <td className="px-4 py-3">Anonymous page view and feature usage events stored in our own database — no third-party SDK</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-muted-foreground text-sm mt-4">
                  We do not sell your personal data to any third party. If we add advertising partners in the future, this table will be updated and you will be notified if you have an account.
                </p>
              </section>

              <section id="your-rights" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Your Rights</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Regardless of where you are in the world, you have the following rights:
                </p>
                <ul className="space-y-3 text-muted-foreground leading-relaxed">
                  <li><strong className="text-foreground">Access</strong> — see exactly what data we hold about you. Email <a href="mailto:privacy@bornclock.com" className="text-blue-500 hover:underline">privacy@bornclock.com</a>.</li>
                  <li><strong className="text-foreground">Correction</strong> — update your name, email, or date of birth from your Profile page at any time.</li>
                  <li><strong className="text-foreground">Deletion</strong> — permanently delete your account and all associated data from your Profile page. No need to contact support. Data is purged within 30 days. Transaction records (payment IDs, amounts, dates) are retained in de-identified form as required by tax and accounting law, but are permanently unlinked from your profile and email on deletion.</li>
                  <li><strong className="text-foreground">Export</strong> — request a copy of your data in a portable format by emailing <a href="mailto:privacy@bornclock.com" className="text-blue-500 hover:underline">privacy@bornclock.com</a>.</li>
                  <li><strong className="text-foreground">Opt out</strong> — unsubscribe from all non-essential emails from your Profile page or via the unsubscribe link in any email we send.</li>
                  <li><strong className="text-foreground">Withdraw consent</strong> — if you gave consent for any specific processing, you can withdraw it at any time without affecting past processing.</li>
                </ul>
                <p className="text-muted-foreground text-sm mt-4">
                  EU/UK residents have rights under GDPR/UK-GDPR (see <button onClick={() => scrollToSection('gdpr-rights')} className="text-blue-500 hover:underline">EU/UK Rights</button> below). Indian residents have rights under DPDPA 2023 (see <button onClick={() => scrollToSection('dpdpa-rights')} className="text-blue-500 hover:underline">Indian Law Rights</button> below). We honour all requests within 30 days.
                </p>
              </section>

              <section id="dpdpa-rights" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Your Rights Under Indian Law (DPDPA 2023)</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Under the <strong className="text-foreground">Digital Personal Data Protection Act 2023 (DPDPA)</strong>, Indian residents have the following rights:
                </p>
                <ul className="space-y-3 text-muted-foreground leading-relaxed mb-4">
                  <li><strong className="text-foreground">Right to Access</strong> — request a copy of all personal data we hold about you. Email <a href="mailto:privacy@bornclock.com" className="text-blue-500 hover:underline">privacy@bornclock.com</a>.</li>
                  <li><strong className="text-foreground">Right to Correction</strong> — update inaccurate or incomplete data from your Profile page or by emailing us.</li>
                  <li><strong className="text-foreground">Right to Erasure</strong> — request permanent deletion of all your personal data. We will process your request and confirm deletion within <strong className="text-foreground">30 days</strong>.</li>
                  <li><strong className="text-foreground">Right to Withdraw Consent</strong> — withdraw consent for any data processing at any time. This does not affect processing already completed.</li>
                  <li><strong className="text-foreground">Right to Grievance Redressal</strong> — contact our data protection contact at <a href="mailto:privacy@bornclock.com" className="text-blue-500 hover:underline">privacy@bornclock.com</a> for any concerns.</li>
                </ul>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Data breach notification:</strong> In the event of a personal data breach that is likely to result in harm to you, we will notify the Data Protection Board of India and affected users as required by DPDPA 2023. We target notification within <strong className="text-foreground">72 hours</strong> of becoming aware of the breach.
                  </p>
                </div>
              </section>

              <section id="gdpr-rights" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">EU/UK Rights (GDPR &amp; UK-GDPR)</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  If you are located in the European Union, European Economic Area, or United Kingdom, you have rights under <strong className="text-foreground">GDPR / UK-GDPR</strong>:
                </p>
                <ul className="space-y-3 text-muted-foreground leading-relaxed mb-4">
                  <li><strong className="text-foreground">Right of Access (Art. 15)</strong> — obtain confirmation of processing and a copy of your data.</li>
                  <li><strong className="text-foreground">Right to Rectification (Art. 16)</strong> — correct inaccurate personal data without undue delay.</li>
                  <li><strong className="text-foreground">Right to Erasure / Right to be Forgotten (Art. 17)</strong> — request deletion of your personal data where there is no compelling reason for its continued processing.</li>
                  <li><strong className="text-foreground">Right to Restriction (Art. 18)</strong> — request that we restrict processing of your data in certain circumstances.</li>
                  <li><strong className="text-foreground">Right to Data Portability (Art. 20)</strong> — receive your data in a structured, machine-readable format.</li>
                  <li><strong className="text-foreground">Right to Object (Art. 21)</strong> — object to processing based on legitimate interests.</li>
                </ul>
                <p className="text-muted-foreground text-sm">
                  To exercise any of these rights, email <a href="mailto:privacy@bornclock.com" className="text-blue-500 hover:underline">privacy@bornclock.com</a>. We will respond within 30 days. You also have the right to lodge a complaint with your national data protection authority.
                </p>
              </section>

              <section id="cookies" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Cookies</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">We use a minimal set of cookies:</p>
                <ul className="space-y-3 text-muted-foreground leading-relaxed">
                  <li><strong className="text-foreground">Essential cookies</strong> — session tokens required for you to stay logged in. Cannot be disabled without breaking the app.</li>
                  <li><strong className="text-foreground">Analytics cookies</strong> — anonymised, cookieless-mode analytics. Can be disabled via the Cookie Settings link in the footer.</li>
                  <li><strong className="text-foreground">Advertising cookies</strong> — we do not currently use ad-targeting or cross-site tracking cookies. If advertising is introduced, cookie preferences will be updated and your consent obtained where required by law.</li>
                </ul>
                <p className="text-muted-foreground text-sm mt-4">
                  You can manage your cookie preferences at any time using the Cookie Settings option in the footer.
                </p>
              </section>

              <section id="childrens-privacy" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  BornClock is not directed at children under 13 (or under 16 in the EU). We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact{' '}
                  <a href="mailto:privacy@bornclock.com" className="text-blue-500 hover:underline">privacy@bornclock.com</a>{' '}
                  and we will delete it promptly.
                </p>
              </section>

              <section id="changes" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If we make material changes to this policy, we will notify you via email (if you have an account) and update the "Last updated" date at the top of this page. Minor clarifications may be made without notice. The latest version is always available at bornclock.com/privacy.
                </p>
              </section>

              <section id="contact" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Contact Us</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  For any privacy-related questions, requests, or complaints:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Privacy: <a href="mailto:privacy@bornclock.com" className="text-blue-500 hover:underline">privacy@bornclock.com</a></li>
                  <li>General enquiries: <a href="mailto:hello@bornclock.com" className="text-blue-500 hover:underline">hello@bornclock.com</a></li>
                </ul>
                <p className="text-muted-foreground text-sm mt-4">
                  We aim to respond to all privacy requests within 30 days.
                </p>
              </section>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

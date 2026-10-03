import { Link } from 'react-router-dom';
import { buildCTAHeading, buildDobParam } from '@/utils/seoHelpers';

interface BirthdayReportCTAProps {
  celebrities?: Array<{ name: string }>;
  month: string;
  day: number | string;
}

const FEATURES = [
  { text: 'All celebrities who share your birthday' },
  { text: 'Zodiac profile — Western, Chinese & Vedic' },
  { text: 'Numerology blueprint & Life Path number' },
  { text: 'Life expectancy based on WHO research' },
  { text: 'Tarot card, Moon sign & Birth Nakshatra' },
  { text: 'Biorhythm, Generation portrait & Planetary ages' },
] as const;

export function BirthdayReportCTA({
  celebrities = [],
  month,
  day,
}: BirthdayReportCTAProps) {
  const heading   = buildCTAHeading(celebrities, month, day);
  const dobParam  = buildDobParam(month, day);
  const reportUrl = `/birthday-report?dob=${encodeURIComponent(dobParam)}`;

  return (
    <section
      data-testid="birthday-report-cta"
      aria-label="Generate your Birthday Intelligence Report"
      className="mt-8 mb-6 rounded-2xl border border-[#6E5AA6]/30
                 bg-gradient-to-br from-[#6E5AA6] to-[#6E5AA6] p-4 sm:p-6
                 shadow-sm"
    >
      {/* ── Heading ── */}
      <h2
        data-testid="cta-heading"
        className="text-xl font-black text-gray-900 mb-1 leading-snug"
      >
        🎂 {heading}
      </h2>

      <p className="text-sm text-gray-500 mb-5">
        Your complete Birthday Intelligence Report includes:
      </p>

      {/* ── Feature bullets ── */}
      <ul
        data-testid="cta-features"
        className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 list-none p-0"
        aria-label="Report features"
      >
        {FEATURES.map(({ text }) => (
          <li key={text} className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className="text-[#6E5AA6] font-bold flex-shrink-0 mt-0.5"
            >
              ✓
            </span>
            <span className="text-sm text-gray-700">{text}</span>
          </li>
        ))}
      </ul>

      {/* ── CTA Button ── */}
      <Link
        to={reportUrl}
        data-testid="cta-button"
        aria-label="Generate your free Birthday Intelligence Report"
        className="block w-full text-center
                   bg-[#0E2238] hover:bg-[#0E2238] active:bg-[#0E2238]
                   text-white font-bold py-4 px-6
                   rounded-xl transition-colors text-base shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-[#0E2238]
                   focus:ring-offset-2"
      >
        Generate My Free Birthday Report →
      </Link>

      {/* ── Reassurance ── */}
      <p
        data-testid="cta-reassurance"
        className="text-center text-xs text-gray-400 mt-3"
        aria-label="No payment required"
      >
        Free · Instant · No credit card required
      </p>
    </section>
  );
}

export default BirthdayReportCTA;

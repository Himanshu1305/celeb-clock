import { useState } from 'react';
import { BirthDateProvider } from '@/context/BirthDateContext';
import { DobInput } from '@/components/DobInput';
import { useAgeCalculator } from '@/hooks/useAgeCalculator';
import { SEO } from '@/components/SEO';

// This IS the embeddable widget — it renders inside an iframe on other websites.
// Deliberately has NO Navigation, NO Footer, NO AuthNav. It wraps its own
// BirthDateProvider so it never depends on the parent App context, and is
// noindex so search engines index the real pages, not the bare widget frame.

const Cell = ({ value, label }: { value: number; label: string }) => (
  <div className="rounded-lg bg-gray-50 border border-gray-100 py-2 px-1 text-center">
    <div className="text-lg md:text-xl font-bold text-indigo-600 tabular-nums leading-none">{value.toLocaleString()}</div>
    <div className="text-[10px] text-gray-500 mt-1">{label}</div>
  </div>
);

const WidgetInner = () => {
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const age = useAgeCalculator(birthDate);

  return (
    <div className="min-h-screen bg-white text-gray-900 px-4 py-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-base font-bold text-gray-900">Age Calculator</h1>
          <img src="/bornclock-logo.png" alt="BornClock" className="h-6 w-auto" style={{ maxHeight: '24px' }} />
        </div>

        <DobInput label="" onValidChange={setBirthDate} />

        {age ? (
          <div className="grid grid-cols-4 gap-2 mt-4">
            <Cell value={age.years} label="Years" />
            <Cell value={age.months} label="Months" />
            <Cell value={age.days} label="Days" />
            <Cell value={age.totalSeconds} label="Seconds" />
          </div>
        ) : (
          <p className="text-center text-xs text-gray-400 mt-4">Enter your date of birth to see your exact age.</p>
        )}

        <div className="text-right mt-3">
          <a
            href="https://bornclock.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-indigo-600 transition-colors"
          >
            Powered by BornClock
          </a>
        </div>
      </div>
    </div>
  );
};

const Widget = () => (
  <>
    <SEO
      title="Age Calculator Widget | BornClock"
      description="Free embeddable age calculator widget by BornClock — shows exact age in years, months, days and seconds."
      canonicalUrl="/widget/age-calculator"
      noindex
    />
    <BirthDateProvider>
      <WidgetInner />
    </BirthDateProvider>
  </>
);

export default Widget;

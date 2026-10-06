import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoneyLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { useReportPrice } from '@/hooks/useCurrency';

export default function DiwaliGiftPage() {
  const price = useReportPrice();
  const [recipient, setRecipient] = useState('');

  const shareText = `Happy Diwali! 🪔 I'm gifting you a personalised birthday reading from BornClock — https://bornclock.com/diwali-gift`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText).replace(/'/g, '%27')}`;

  return (
    <MoneyLayout
      theme="neutral"
      testId="diwali-gift-page"
      seo={
        <SEO
          title="Diwali Gift — Personalised Birthday & Kundali Reading | BornClock"
          description="This Diwali, gift something meaningful — a personalised Birthday Report or Kundali (₹199 each), or the combo (₹299). Delivered with your own festive message."
          canonicalUrl="/diwali-gift"
          ogType="website"
        />
      }
      breadcrumb={{ current: 'Diwali Gift' }}
      h1="A Diwali Gift That Means Something"
    >
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🪔</div>
          <p className="text-gray-600">This Diwali, give a personalised birthday reading — thoughtful, personal and instant.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8" data-testid="diwali-products">
          {[
            { key: 'report', label: 'Birthday Blueprint', price, note: 'Zodiac, numerology, celebrity twins' },
            { key: 'kundali', label: 'Kundali', price, note: 'Vedic birth chart & Dasha' },
            { key: 'combo', label: 'Combo (both)', price: '₹299', note: 'Best value this Diwali' },
          ].map(p => (
            <div key={p.key} data-testid={`diwali-product-${p.key}`} className="rounded-xl border border-amber-200 bg-white p-4">
              <div className="font-semibold text-gray-900">{p.label}</div>
              <div className="text-lg font-black text-orange-600">{p.price}</div>
              <div className="text-xs text-gray-500">{p.note}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-5 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="diwali-recipient">Who is it for?</label>
          <input id="diwali-recipient" data-testid="diwali-recipient" value={recipient}
                 onChange={e => setRecipient(e.target.value)} placeholder="Recipient's name"
                 className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" />
          <div className="flex flex-wrap gap-3 mt-4">
            <Link to="/birthday-report/gift" className="inline-flex items-center gap-2 bg-orange-600 text-white rounded-lg px-5 py-3 font-semibold hover:bg-orange-700">
              Continue to gift checkout →
            </Link>
            <a data-testid="diwali-whatsapp-share" href={whatsappHref} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 bg-green-600 text-white rounded-lg px-5 py-3 font-semibold hover:bg-green-700">
              Share on WhatsApp
            </a>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Prefer to shop the regular <Link to="/birthday-report/gift" className="text-orange-700 underline">gift options</Link>?
        </p>
      </div>
    </MoneyLayout>
  );
}

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
          title="Diwali Gift — Personalised Birthday Blueprint | BornClock"
          description="This Diwali, gift something meaningful — a personalised Birthday Blueprint report: zodiac, numerology, life path and celebrity birthday twins, delivered with your own festive message."
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

        {/* Only the product that exists. ("Kundali" and "Combo ₹299" listings removed Oct 2026.) */}
        <div className="grid grid-cols-1 gap-3 mb-8" data-testid="diwali-products">
          <div data-testid="diwali-product-report" className="rounded-xl border border-amber-200 bg-white p-4">
            <div className="font-semibold text-gray-900">Birthday Blueprint</div>
            <div className="text-lg font-black text-orange-600">{price}</div>
            <div className="text-xs text-gray-500">Zodiac, numerology, life path and celebrity twins</div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-5 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="diwali-recipient">Who is it for?</label>
          <input id="diwali-recipient" data-testid="diwali-recipient" value={recipient}
                 onChange={e => setRecipient(e.target.value)} placeholder="Recipient's name"
                 className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900" />
          <div className="flex flex-wrap gap-3 mt-4">
            <Link to={recipient.trim() ? `/birthday-report/gift?to=${encodeURIComponent(recipient.trim())}` : '/birthday-report/gift'} className="inline-flex items-center gap-2 bg-orange-600 text-white rounded-lg px-5 py-3 font-semibold hover:bg-orange-700">
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

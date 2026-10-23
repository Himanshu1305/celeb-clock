import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ReportLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReportPrice } from '@/hooks/useCurrency';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function BirthdayReportGiftPage() {
  const navigate = useNavigate();
  const price = useReportPrice();
  const [searchParams] = useSearchParams();
  // ?to= carries the recipient typed on the Diwali gift page.
  const [recipientName, setRecipientName] = useState(() => (searchParams.get('to') ?? '').slice(0, 60));
  const [recipientDob, setRecipientDob] = useState('');
  const [giverName, setGiverName] = useState('');
  const [message, setMessage] = useState('');

  const isValidDob =
    /^\d{4}-\d{2}-\d{2}$/.test(recipientDob) && recipientDob <= todayISO();
  const canPay =
    recipientName.trim().length > 0 && isValidDob && giverName.trim().length > 0;
  const dobInFuture = /^\d{4}-\d{2}-\d{2}$/.test(recipientDob) && recipientDob > todayISO();

  const handlePay = () => {
    if (!canPay) return;
    // Hand off to the existing report checkout flow, prefilled as a gift.
    const params = new URLSearchParams({
      dob: recipientDob,
      gift: '1',
      to: recipientName.trim(),
      from: giverName.trim(),
    });
    if (message.trim()) params.set('note', message.trim());
    navigate(`/birthday-report?${params.toString()}`);
  };

  return (
    <ReportLayout
      theme="birthday"
      testId="gift-page"
      seo={(
        <SEO
          title="Gift a Birthday Report — Thoughtful & Personal | BornClock"
          description="Gift a personalised Birthday Report — zodiac, numerology, life path and celebrity twins — with your own message. The gift that proves you know them."
          canonicalUrl="/birthday-report/gift"
          ogType="website"
        />
      )}
      breadcrumb={{ trail: [{ label: 'Birthday Report', to: '/birthday-report' }], current: 'Gift a Report' }}
      footer={{
        tagline: 'Gift a personalised Birthday Report — delivered with your own message.',
        nav: [
          { label: 'Birthday Report', to: '/birthday-report' },
          { label: 'Results', to: '/results' },
          { label: 'Celebrities', to: '/celebrity' },
          { label: 'Privacy', to: '/privacy' },
        ],
        note: '© 2026 BornClock.',
      }}
      eyebrow="Gift a report"
      h1="Gift a Birthday Blueprint"
      lead={<>A personalised report — zodiac, numerology, life path and celebrity twins — delivered with your own message.</>}
    >
      <div className="container mx-auto px-4 py-8 max-w-2xl">

        {/* The one giftable product that exists today. (A "Kundali" gift and a
            "Combo" listing were removed in Oct 2026 — neither product exists.) */}
        <div className="grid grid-cols-1 gap-3 mb-8" data-testid="gift-products">
          <div
            data-testid="gift-product-report"
            className="text-left rounded-xl border p-4 border-primary bg-primary/5"
          >
            <div className="font-semibold text-foreground">Birthday Blueprint</div>
            <div className="text-lg font-black text-primary">{price}</div>
            <div className="text-xs text-muted-foreground">Zodiac, numerology, life path and celebrity twins · Permanent access</div>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block" htmlFor="gift-recipient-name">
                Recipient's name
              </label>
              <Input
                id="gift-recipient-name"
                data-testid="gift-recipient-name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Who is this for?"
                maxLength={60}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block" htmlFor="gift-recipient-dob">
                Recipient's date of birth
              </label>
              <Input
                id="gift-recipient-dob"
                data-testid="gift-recipient-dob"
                type="date"
                max={todayISO()}
                value={recipientDob}
                onChange={(e) => setRecipientDob(e.target.value)}
              />
              {dobInFuture && (
                <p className="text-sm text-red-600 mt-1">Please enter a valid past date of birth.</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block" htmlFor="gift-giver-name">
                Your name
              </label>
              <Input
                id="gift-giver-name"
                data-testid="gift-giver-name"
                value={giverName}
                onChange={(e) => setGiverName(e.target.value)}
                placeholder="From…"
                maxLength={60}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block" htmlFor="gift-message">
                Gift message (optional)
              </label>
              <textarea
                id="gift-message"
                data-testid="gift-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Happy birthday! Hope you love this…"
                maxLength={200}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <Button
              data-testid="gift-pay-btn"
              className="w-full"
              disabled={!canPay}
              onClick={handlePay}
            >
              Gift this report — {price}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Secure checkout. You'll get a shareable gift link after payment.
            </p>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Prefer to buy for yourself?{' '}
          <Link to="/birthday-report" className="text-primary hover:underline">Get your own Birthday Blueprint →</Link>
        </p>
      </div>
    </ReportLayout>
  );
}

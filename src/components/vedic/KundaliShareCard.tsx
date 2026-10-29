/**
 * Batch 9b: "Share my Kundali" — a compact PNG card (Lagna, Rashi, Nakshatra, chart
 * thumbnail, site URL). Phones with the native share sheet get the image directly
 * (WhatsApp is in that sheet); elsewhere the image downloads and the existing WhatsApp
 * text link opens, so the visitor can attach it.
 *
 * Privacy: name, birth date, time and place are NOT on the image unless the visitor
 * ticks the opt-in below (off by default, never remembered).
 */
import { useMemo, useState } from 'react';
import { buildKundaliShareSvg, svgToPngBlob, type ShareCardData } from '@/lib/share/kundaliShareCard';

interface Props {
  data: ShareCardData;
  chartStyle: 'north' | 'south';
  birth: { name?: string; dob?: string; time?: string; place?: string };
  /** The page's existing WhatsApp message + link (same path as "Share on WhatsApp"). */
  shareText: string;
  whatsappHref: string;
}

export default function KundaliShareCard({ data, chartStyle, birth, shareText, whatsappHref }: Props) {
  const [includeBirth, setIncludeBirth] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const svg = useMemo(
    () => buildKundaliShareSvg(data, { chartStyle, includeBirthDetails: includeBirth, birth }),
    [data, chartStyle, includeBirth, birth],
  );
  const previewSrc = useMemo(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, [svg]);

  const share = async () => {
    setBusy(true); setStatus('');
    try {
      const png = await svgToPngBlob(svg);
      const file = new File([png], 'my-kundali-bornclock.png', { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({ files: [file], text: shareText });
          setStatus('Shared.');
          return;
        } catch (e) {
          if ((e as DOMException)?.name === 'AbortError') return; // visitor closed the sheet
        }
      }
      // Fallback: save the image, then open the existing WhatsApp text link.
      const url = URL.createObjectURL(png);
      const a = document.createElement('a');
      a.href = url; a.download = file.name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      window.open(whatsappHref, '_blank', 'noopener');
      setStatus('Image saved — attach it in WhatsApp (the message with your link is ready).');
    } catch {
      setStatus('Could not create the image on this device. You can still use "Share on WhatsApp".');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="kundali-share-card" className="result-annotation" style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <img data-testid="kundali-share-preview" src={previewSrc} alt="Preview of your Kundali share image" width={160} height={160} style={{ borderRadius: 8, flex: '0 0 auto' }} />
      <div style={{ flex: '1 1 240px', minWidth: 0 }}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>Share my Kundali</p>
        <p className="small muted" style={{ marginBottom: 8 }}>An image with your Lagna, Rashi, Nakshatra and chart. Your birth date, time and place are left off unless you choose to add them.</p>
        <label className="check small" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
          <input data-testid="kundali-share-include-birth" type="checkbox" checked={includeBirth} onChange={e => setIncludeBirth(e.target.checked)} />
          <span>Show my name and birth date, time and place on the image</span>
        </label>
        <button data-testid="kundali-share-image" type="button" className="btn secondary" disabled={busy} onClick={() => void share()}>
          {busy ? 'Preparing image…' : 'Share my Kundali'}
        </button>
        {status && <p data-testid="kundali-share-status" className="small muted" role="status" style={{ marginTop: 6 }}>{status}</p>}
      </div>
    </div>
  );
}

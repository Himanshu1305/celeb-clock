import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { getGenerationBasic } from '@/services/GenerationService';
import { numberOneSong } from '@/data/birthdaySongs';

// Self-contained Western zodiac (emoji + name) so the card never depends on async data.
function zodiac(date: Date): string {
  const m = date.getMonth() + 1, d = date.getDate();
  const table: Array<[string, number, number, number, number]> = [
    ['♒ Aquarius', 1, 20, 2, 18], ['♓ Pisces', 2, 19, 3, 20], ['♈ Aries', 3, 21, 4, 19],
    ['♉ Taurus', 4, 20, 5, 20], ['♊ Gemini', 5, 21, 6, 20], ['♋ Cancer', 6, 21, 7, 22],
    ['♌ Leo', 7, 23, 8, 22], ['♍ Virgo', 8, 23, 9, 22], ['♎ Libra', 9, 23, 10, 22],
    ['♏ Scorpio', 10, 23, 11, 21], ['♐ Sagittarius', 11, 22, 12, 21], ['♑ Capricorn', 12, 22, 1, 19],
  ];
  for (const [sign, sM, sD, eM, eD] of table) {
    if ((m === sM && d >= sD) || (m === eM && d <= eD)) return sign;
  }
  return '♑ Capricorn';
}

interface Props {
  name?: string;
  birthDate: Date;
  /** Most notable celebrity who shares the birthday (the parent already computes this). */
  celebrityTwin?: string;
}

/**
 * NB3-CARD-SHARE — a polished, shareable birthday card built from real birthday facts:
 * day of week, zodiac, generation, celebrity twin, and (when a verified dataset is
 * present) the #1 song on that day. Captured to PNG via html2canvas and shared through
 * the Web Share API with a download fallback (works on Chromium, WebKit and Android).
 */
export function BirthdayFactsCard({ name, birthDate, celebrityTwin }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const dayOfWeek = birthDate.toLocaleDateString('en-GB', { weekday: 'long' });
  const dateLabel = birthDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const gen = getGenerationBasic(birthDate.getFullYear());
  const song = numberOneSong(birthDate);
  const sign = zodiac(birthDate);

  const capture = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true, backgroundColor: null });
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
  };

  const fileName = `bornclock-birthday-${birthDate.toISOString().slice(0, 10)}.png`;

  const download = async () => {
    setBusy(true);
    try {
      const blob = await capture();
      if (!blob) return;
      const a = document.createElement('a');
      a.download = fileName;
      a.href = URL.createObjectURL(blob);
      a.click();
      URL.revokeObjectURL(a.href);
    } finally { setBusy(false); }
  };

  const share = async () => {
    setBusy(true);
    try {
      const blob = await capture();
      if (!blob) return;
      const file = new File([blob], fileName, { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.share && (!nav.canShare || nav.canShare({ files: [file] }))) {
        await nav.share({ title: 'My birthday card', text: 'Made with BornClock — bornclock.com', files: [file] });
      } else {
        const a = document.createElement('a');
        a.download = fileName;
        a.href = URL.createObjectURL(blob);
        a.click();
        URL.revokeObjectURL(a.href);
      }
    } catch { /* user cancelled share — no-op */ } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4" data-testid="birthday-facts-card">
      <div className="flex justify-center">
        <div
          ref={cardRef}
          className="w-full max-w-[420px] rounded-3xl p-7 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(150deg,#0E2238 0%,#14314f 55%,#1d4a74 100%)' }}
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle,#B8862F55,transparent 70%)' }} />
          <p className="text-xs tracking-widest uppercase opacity-70">Born on</p>
          <p className="text-2xl font-bold mt-1">{dateLabel}</p>
          {name && <p className="text-sm opacity-80 mt-0.5">for {name}</p>}

          <div className="mt-6 space-y-3 text-[15px]">
            <Row label="Day" value={`A ${dayOfWeek}`} />
            <Row label="Star sign" value={sign} />
            {gen && <Row label="Generation" value={`${gen.emoji} ${gen.name}`} />}
            {celebrityTwin && <Row label="Birthday twin" value={celebrityTwin} />}
            {song && <Row label="#1 song" value={`${song.title} — ${song.artist}`} />}
          </div>

          <div className="mt-7 flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide" style={{ color: '#E7C877' }}>bornclock.com</span>
            <span className="text-[11px] opacity-60 italic">Know your time. Live it well.</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button onClick={download} disabled={busy} className="gap-2">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download card
        </Button>
        <Button onClick={share} disabled={busy} variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" /> Share
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-1.5">
      <span className="text-[11px] uppercase tracking-wider opacity-60">{label}</span>
      <span className="font-semibold text-right">{value}</span>
    </div>
  );
}

/**
 * B24 — "Born today" share: today's names as a WhatsApp message, plus the day's share card
 * (/og/born-on/<month>-<day>.webp, which lists who was born that day) to download or forward.
 */
import type { DailyEntry } from '@/lib/daily/types';
import { WhatsAppShareButton } from '@/components/WhatsAppShareButton';

export function BornTodayShare({ entry, india, pageUrl }: { entry: DailyEntry | null; india?: boolean; pageUrl: string }) {
  if (!entry) return null;
  const pick = (id: string) => (entry.sections.find(s => s.id === id)?.links ?? []).map(l => l.label.split(' · ')[0]);
  const names = [...(india ? pick('india') : [...pick('world').slice(0, 2), ...pick('india')])].slice(0, 4);
  const day = entry.dateLabel.replace(/^\w+,\s*/, '').replace(/\s+\d{4}$/, '');
  const msg = `🎂 Born today (${day}): ${names.join(', ')}.\nWho shares YOUR birthday — and your Rashi? ${pageUrl}`;
  return (
    <div data-testid="born-today-share" className="flex flex-wrap items-center gap-3 my-4">
      <WhatsAppShareButton message={msg} label="Share today's birthdays" />
      {entry.ogImage && (
        <a href={entry.ogImage} download target="_blank" rel="noopener" className="text-sm underline text-primary">Download today's card</a>
      )}
    </div>
  );
}
